import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String },
  mimetype: { type: String },
  size: { type: Number },
  url: { type: String }, // public URL to access file
});

const FeatureRequestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  type: { type: String, enum: ["feature", "bug"], default: "feature" },
  board: { type: String, default: "General" },
  status: { type: String, enum: ["planned", "in_progress", "released", "not_done", "under_review"], default: "under_review" },
  votes: { type: Number, default: 0 },
  attachments: { type: [AttachmentSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  commentsCount: { type: Number, default: 0, index: true },
  isDeleted: { type: Boolean, default: false }, // for soft delete of request
  deletedAt: { type: Date },
  deletedBy: { type: String },
  reports: [
    {
      reporterId: String,
      reason: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]

});

FeatureRequestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const FeatureRequest = mongoose.model("FeatureRequest", FeatureRequestSchema);
export default FeatureRequest;
