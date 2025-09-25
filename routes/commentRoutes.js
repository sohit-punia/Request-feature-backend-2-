// backend/routes/commentRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  createComment,
  reportComment,
  deleteComment,
  getMyReportedComments
} from "../controllers/commentController.js";

const router = express.Router();

// POST comment (or reply) on a feature request
// path: POST /api/requests/:id/comments
router.post("/requests/:id/comments", auth, upload.array("attachments", 5), createComment);

// report a comment
// path: POST /api/comments/:commentId/report
router.post("/comments/:commentId/report", auth, reportComment);

// delete a comment (soft)
router.delete("/comments/:commentId", auth, deleteComment);

// get comments user reported
router.get("/comments/reported/me", auth, getMyReportedComments);

export default router;
