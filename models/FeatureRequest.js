// backend/models/FeatureRequest.js
import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  url: String
}, { _id: false });

const FeatureRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: String,
  board: String,
  attachments: { type: [AttachmentSchema], default: [] },
  status: { type: String, default: "under_review" },
  authorId: { type: String, required: true },
  authorName: String,
  votes: { type: Number, default: 0 },
  reports: [
    {
      reporterId: String,
      reason: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: String
}, { timestamps: true });

const FeatureRequest = mongoose.models.FeatureRequest || mongoose.model("FeatureRequest", FeatureRequestSchema);
export default FeatureRequest;
