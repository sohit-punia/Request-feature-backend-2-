// backend/controllers/commentController.js
import Comment from "../models/Comment.js";
import FeatureRequest from "../models/FeatureRequest.js";

const buildAttachments = (files = []) =>
  files.map(f => ({
    filename: f.filename,
    originalName: f.originalname,
    mimetype: f.mimetype,
    size: f.size,
    url: `/uploads/${f.filename}`
  }));

// create a comment or a reply
export const createComment = async (req, res, next) => {
  try {
    const featureId = req.params.id || req.body.featureId;
    if (!featureId) return res.status(400).json({ message: "featureId required" });

    const feature = await FeatureRequest.findById(featureId);
    if (!feature || feature.isDeleted) return res.status(404).json({ message: "Feature not found" });

    const text = (req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "text is required" });

    const parent = req.body.parent || null; // pass parent comment id to make a reply
    const authorId = req.user?.id || req.headers["x-user-id"] || "anonymous";
    const authorName = req.user?.name || req.headers["x-user-name"] || "anonymous";
    const attachments = buildAttachments(req.files);

    const comment = new Comment({
      featureId,
      parent,
      authorId,
      authorName,
      text,
      attachments
    });

    await comment.save();
    return res.status(201).json(comment);
  } catch (err) {
    return next(err);
  }
};

// report a comment
export const reportComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    if (!commentId) return res.status(400).json({ message: "commentId required" });

    const reporterId = req.user?.id || req.headers["x-user-id"];
    if (!reporterId) return res.status(401).json({ message: "user header required" });

    const reason = req.body.reason || "no reason provided";

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.reports.push({ reporterId, reason, createdAt: new Date() });
    await comment.save();

    return res.json({ ok: true, commentId, reportsCount: comment.reports.length });
  } catch (err) {
    return next(err);
  }
};

// soft-delete comment (author only)
export const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user?.id || req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ message: "user header required" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.authorId !== userId) return res.status(403).json({ message: "Not allowed" });

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = userId;
    await comment.save();

    return res.json({ ok: true, id: comment._id });
  } catch (err) {
    return next(err);
  }
};

// get comments the user reported
export const getMyReportedComments = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ message: "user header required" });

    const data = await Comment.find({ "reports.reporterId": userId }).sort({ updatedAt: -1 });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
};

export default {
  createComment,
  reportComment,
  deleteComment,
  getMyReportedComments
};
