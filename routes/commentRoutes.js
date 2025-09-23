// backend/routes/commentRoutes.js
import express from "express";
import { createComment, getCommentsForFeature, deleteComment, reportComment } from "../controllers/commentController.js";
import { upload } from "../middleware/upload.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// create comment or reply (multipart for attachments)
router.post("/requests/:id/comments", auth, upload.array("attachments", 4), createComment);

// list comments for a feature
router.get("/requests/:id/comments", getCommentsForFeature);

// delete comment
router.delete("/comments/:id", auth, deleteComment);

// report comment
router.post("/comments/:id/report", auth, reportComment);

export default router;
