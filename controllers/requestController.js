// backend/controllers/requestController.js
import FeatureRequest from "../models/FeatureRequest.js";

const buildAttachments = (files = []) =>
  files.map(f => ({
    filename: f.filename,
    originalName: f.originalname,
    mimetype: f.mimetype,
    size: f.size,
    url: `/uploads/${f.filename}`
  }));

export const createRequest = async (req, res, next) => {
  try {
    const { title, description, type, board } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const authorId = req.user?.id || req.headers["x-user-id"] || "anonymous";
    const authorName = req.user?.name || req.headers["x-user-name"] || "anonymous";

    const attachments = buildAttachments(req.files);

    const doc = await FeatureRequest.create({
      title,
      description,
      type,
      board,
      attachments,
      authorId,
      authorName
    });

    return res.status(201).json(doc);
  } catch (err) {
    return next(err);
  }
};

export const listRequests = async (req, res, next) => {
  try {
    const q = { isDeleted: false };
    // support optional filtering by type/board via query strings if needed
    if (req.query.type) q.type = req.query.type;
    if (req.query.board) q.board = req.query.board;
    const data = await FeatureRequest.find(q).sort({ createdAt: -1 });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
};

export const getRequest = async (req, res, next) => {
  try {
    const doc = await FeatureRequest.findById(req.params.id);
    if (!doc || doc.isDeleted) return res.status(404).json({ message: "Not found" });
    return res.json(doc);
  } catch (err) {
    return next(err);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const id = req.user?.id || req.headers["x-user-id"];
    if (!id) return res.status(401).json({ message: "user header required" });
    const data = await FeatureRequest.find({ authorId: id, isDeleted: false }).sort({ createdAt: -1 });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
};

export const reportRequest = async (req, res, next) => {
  try {
    const featureId = req.params.id;
    const { reason } = req.body;
    if (!featureId) return res.status(400).json({ message: "feature id required" });
    const reporterId = req.user?.id || req.headers["x-user-id"];
    if (!reporterId) return res.status(401).json({ message: "user header required" });

    const doc = await FeatureRequest.findById(featureId);
    if (!doc) return res.status(404).json({ message: "Feature not found" });

    doc.reports.push({
      reporterId,
      reason: reason || "no reason provided",
      createdAt: new Date()
    });

    await doc.save();
    return res.json({ ok: true, featureId: doc._id, reportsCount: doc.reports.length });
  } catch (err) {
    return next(err);
  }
};

export const deleteRequest = async (req, res, next) => {
  try {
    const featureId = req.params.id;
    const userId = req.user?.id || req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ message: "user header required" });

    const doc = await FeatureRequest.findById(featureId);
    if (!doc) return res.status(404).json({ message: "Feature not found" });

    // only author can soft-delete
    if (doc.authorId !== userId) return res.status(403).json({ message: "Not allowed" });

    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.deletedBy = userId;
    await doc.save();

    return res.json({ ok: true, id: doc._id });
  } catch (err) {
    return next(err);
  }
};

// get features the current user reported
export const getMyReportedFeatures = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ message: "user header required" });

    const data = await FeatureRequest.find({ "reports.reporterId": userId }).sort({ updatedAt: -1 });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
};

export default {
  createRequest,
  listRequests,
  getRequest,
  getMyRequests,
  reportRequest,
  deleteRequest,
  getMyReportedFeatures
};
