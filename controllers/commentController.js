// backend/controllers/commentController.js
import Comment from "../models/Comment.js";
import FeatureRequest from "../models/FeatureRequest.js";

/**
 * Create a comment or reply
 * - req.params.id -> featureId
 * - req.body.text
 * - optional req.body.parent -> parent comment id (for replies)
 * - files -> req.files (use upload.array('attachments'))
 */
export const createComment = async (req, res, next) => {
  try {
    const featureId = req.params.id;
    const { text, parent } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Text required" });

    // author info from auth middleware (replace with your user object)
    const authorId = req.user?.id || "anonymous";
    const authorName = req.user?.name || req.body.authorName || "Anon";

    const attachments = (req.files || []).map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}`
    }));

    const comment = new Comment({
      featureId,
      parent: parent || null,
      authorId,
      authorName,
      text,
      attachments
    });

    await comment.save();

    // increment commentsCount on the feature (only for root comments, or increment for all depending on product need)
    if (!parent) {
      await FeatureRequest.findByIdAndUpdate(featureId, { $inc: { commentsCount: 1 } }).exec();
    }

    // optionally return the created comment
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

/**
 * Get comments for feature, supports:
 * - pagination for root-level comments (parent == null)
 * - optional nested replies (build small tree)
 */
export const getCommentsForFeature = async (req, res, next) => {
  try {
    const featureId = req.params.id;
    const page = Math.max(parseInt(req.query.page || 1), 1);
    const limit = Math.min(parseInt(req.query.limit || 10), 50);
    const flat = req.query.flat === "true"; // if true, return flat list

    // fetch root comments (parent == null)
    const skip = (page - 1) * limit;
    const rootComments = await Comment.find({ featureId, parent: null, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (flat) {
      // return only root comments (client may fetch replies separately)
      return res.json({ data: rootComments, page, limit });
    }

    // gather ids and fetch replies for these root comments (one-level deep)
    const rootIds = rootComments.map(c => c._id);
    const replies = await Comment.find({ featureId, parent: { $in: rootIds }, isDeleted: false })
      .sort({ createdAt: 1 })
      .lean();

    // group replies by parent
    const byParent = {};
    replies.forEach(r => {
      const pid = String(r.parent);
      byParent[pid] = byParent[pid] || [];
      byParent[pid].push(r);
    });

    // attach replies to root comments
    const data = rootComments.map(rc => ({
      ...rc,
      replies: byParent[String(rc._id)] || []
    }));

    res.json({ data, page, limit });
  } catch (err) {
    next(err);
  }
};

/**
 * Soft delete comment (owner or admin)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const userId = req.user?.id;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Not found" });

    // permission check: owner or admin (replace isAdmin check with your auth)
    if (comment.authorId !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = userId;
    await comment.save();

    // decrement comments count on root comment only
    if (!comment.parent) {
      await FeatureRequest.findByIdAndUpdate(comment.featureId, { $inc: { commentsCount: -1 } }).exec();
    }

    res.json({ message: "Deleted" });
  } catch (err) { next(err) }
};

/**
 * Report comment
 */
export const reportComment = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const { reason } = req.body;
    const reporterId = req.user?.id || "anonymous";

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Not found" });

    comment.reports.push({ reporterId, reason });
    await comment.save();
    // optionally notify moderators / trigger webhook
    res.json({ message: "Reported" });
  } catch (err) { next(err) }
};
