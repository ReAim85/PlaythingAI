import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs-extra";
import "dotenv/config";

import resumeRoutes from "./routes/resumeRoutes.js";
import interviewRoutes from "./routes/Interviewroutes.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "uploads");
fs.ensureDirSync(uploadDir);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "Server is healthy", time: new Date() });
});

app.use((err, req, res, next) => {
  console.error("[Unhandled Error]", err);
  res.status(err.status || 500).json({ success: false, error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Uploads folder: ${uploadDir}`);
});