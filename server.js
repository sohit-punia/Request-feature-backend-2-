// backend/server.js
import express from "express";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import requestRoutes from "./routes/requestRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB(process.env.MONGO_URI);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploads statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use((req, res, next) => {
  console.log(">>> INCOMING:", req.method, req.originalUrl,
    "content-type:", req.header("content-type"),
    "x-user-id:", req.header("x-user-id"));
  next();
});

// mount routes BEFORE notFound/error
app.use("/api/requests", requestRoutes);
app.use("/api", commentRoutes);

// root
app.get("/", (req, res) => res.send("API running"));

// error handlers (after routes)
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on port ${port}`));
