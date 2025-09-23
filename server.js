import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import requestRoutes from "./routes/requestRoutes.js";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("Please set MONGO_URI in .env");
  process.exit(1);
}

connectDB(MONGO_URI);

const app = express();

// allow form-data + json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", commentRoutes);

app.use(cors());
app.use(morgan("dev"));

// Serve uploads folder statically so attachments are accessible through URL
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => res.send("API is running"));

// Error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
