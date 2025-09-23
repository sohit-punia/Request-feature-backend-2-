import express from "express";
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  voteRequest,
} from "../controllers/requestController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// multipart form: up to 5 files (change limit as needed)
router.post("/", upload.array("attachments", 5), createRequest);
router.get("/", getRequests);
router.get("/:id", getRequestById);
router.put("/:id", upload.array("attachments", 5), updateRequest);
router.delete("/:id", deleteRequest);
router.post("/:id/vote", voteRequest);

export default router;
