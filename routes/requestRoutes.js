// backend/routes/requestRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js"; // your multer instance
import {
  createRequest,
  listRequests,
  getRequest,
  getMyRequests,
  reportRequest,
  deleteRequest,
  getMyReportedFeatures
} from "../controllers/requestController.js";

const router = express.Router();

// Accept attachments on create
router.post("/", auth, upload.array("attachments", 5), createRequest);

// list & single
router.get("/", listRequests);
router.get("/mine", auth, getMyRequests);
router.get("/reported", auth, getMyReportedFeatures); // features current user reported
router.get("/:id", getRequest);

// report a request
router.post("/:id/report", auth, reportRequest);

// delete (soft)
router.delete("/:id", auth, deleteRequest);

export default router;
