// backend/middleware/upload.js
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(6).toString("hex") + "-" + Date.now();
    cb(null, `${name}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // accept images + pdfs by default (adjust if needed)
  if (/image|pdf/.test(file.mimetype)) cb(null, true);
  else cb(null, false);
};

const limits = { fileSize: parseInt(process.env.MAX_FILE_SIZE || "5000000", 10) }; // 5MB default

const upload = multer({ storage, fileFilter, limits });

export default upload;
