// backend/models/Comment.js
import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  url: String
}, { _id: false });

const CommentSchema = new mongoose.Schema({
  featureId: { type: mongoose.Schema.Types.ObjectId, ref: "FeatureRequest", required: true, index: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null, index: true }, // null = root comment
  authorId: { type: String, required: true },
  authorName: { type: String },
  text: { type: String, required: true },
  attachments: { type: [AttachmentSchema], default: [] },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] }, // optional, kept if you later implement likes
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: String,
  reports: [
    {
      reporterId: String,
      reason: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

CommentSchema.index({ featureId: 1, parent: 1, createdAt: -1 });

const Comment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
export default Comment;
