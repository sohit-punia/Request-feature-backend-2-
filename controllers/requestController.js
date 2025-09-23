import FeatureRequest from "../models/FeatureRequest.js";
import path from "path";

export const createRequest = async (req, res, next) => {
  try {
    const { title, description = "", type = "feature", board = "General" } = req.body;
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: "Title is required" });
    }

    const attachments = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}`,
    }));

    const doc = new FeatureRequest({
      title: title.trim(),
      description,
      type,
      board,
      attachments,
    });

    await doc.save();
    return res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    // basic filter + pagination + sort
    const { board, status, q, page = 1, limit = 20, sort = "-votes" } = req.query;
    const filter = {};
    if (board) filter.board = board;
    if (status) filter.status = status;
    if (q) filter.title = { $regex: q, $options: "i" };

    const skip = (Math.max(parseInt(page), 1) - 1) * parseInt(limit);
    const requests = await FeatureRequest.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FeatureRequest.countDocuments(filter);
    res.json({ data: requests, total });
  } catch (err) {
    next(err);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const doc = await FeatureRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

export const updateRequest = async (req, res, next) => {
  try {
    const updates = req.body || {};
    // optional: handle new files appended
    if (req.files && req.files.length) {
      const newFiles = req.files.map((f) => ({
        filename: f.filename,
        originalName: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}`,
      }));
      updates.$push = { attachments: { $each: newFiles } };
    }
    const doc = await FeatureRequest.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

export const deleteRequest = async (req, res, next) => {
  try {
    const doc = await FeatureRequest.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    // Note: file deletion is not handled here. Add fs.unlink if you want to remove files from disk.
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

export const voteRequest = async (req, res, next) => {
  try {
    const { action = "up" } = req.body; // action: 'up' or 'down'
    const inc = action === "down" ? -1 : 1;
    const doc = await FeatureRequest.findByIdAndUpdate(req.params.id, { $inc: { votes: inc } }, { new: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};
