// backend/models/Comment.js
import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String },
  mimetype: { type: String },
  size: { type: Number },
  url: { type: String },
});

const CommentSchema = new mongoose.Schema({
  featureId: { type: mongoose.Schema.Types.ObjectId, ref: "FeatureRequest", required: true, index: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null, index: true }, // null for root comments
  authorId: { type: String, required: true }, // store user id (string or ObjectId depending on your auth)
  authorName: { type: String }, // optional friendly name
  text: { type: String, required: true },
  attachments: { type: [AttachmentSchema], default: [] },
  likes: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: String }, // userId who deleted (for moderation)
  reports: [
    {
      reporterId: String,
      reason: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// compound index for efficient retrieval per feature and parent
CommentSchema.index({ featureId: 1, parent: 1, createdAt: -1 });

export default mongoose.model("Comment", CommentSchema);
