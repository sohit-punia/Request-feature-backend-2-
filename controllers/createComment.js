// controllers/commentController.js
import Comment from "../models/Comment.js";
import FeatureRequest from "../models/FeatureRequest.js";

/**
 * Create a comment (or reply) for a feature request
 * - URL: POST /api/requests/:id/comments
 * - Body: form-data { text, parent? } and files under "attachments"
 */
export const createComment = async (req, res, next) => {
  try {
    const featureId = req.params.id;
    const { text, parent } = req.body;
    const user = req.user; // from your auth middleware

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!text || !text.trim()) return res.status(400).json({ message: "Text is required" });

    // Build attachments array from multer files if present
    const attachments = (req.files || []).map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      url: `/uploads/${f.filename}` // adjust if using absolute
    }));

    // Create comment doc
    const comment = new Comment({
      featureId,
      parent: parent || null,
      authorId: user.id,
      authorName: user.name || null,
      text,
      attachments
    });

    await comment.save();


          // Optionally: update feature metadata (e.g. comments count or last activity)
          
    try {
      await FeatureRequest.findByIdAndUpdate(featureId, {
        $inc: { commentsCount: 1 },                 // if you track a count
        $set: { updatedAt: new Date() }             // touch the feature
      });
    } catch (e) {
      // non-fatal; continue even if update fails
      console.warn("Failed to update feature metadata:", e.message);
    }

    // Return created comment
    return res.status(201).json({ message: "Comment created", comment });
  } catch (err) {
    next(err);
  }
};
