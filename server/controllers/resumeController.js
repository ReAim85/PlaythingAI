/*
 * Copyright (C) 2026 Vishal Jha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
import { orchestrateResumeAnalysis } from "../utils/orchestrator.js";
import { PREDEFINED_JDS } from "../utils/resumeConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF and image files (jpg, png, webp) are supported."), false);
  },
});

export const getJdOptions = (_req, res) => {
  const options = Object.entries(PREDEFINED_JDS).map(([key, jd]) => ({
    key,
    title: jd.title,
  }));
  res.json({ success: true, options });
};

export const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No resume file uploaded." });
    }

    let jdInput;
    if (req.body.jd_key) {
      if (!PREDEFINED_JDS[req.body.jd_key]) {
        return res.status(400).json({
          success: false,
          error: `Invalid jd_key. Valid options: ${Object.keys(PREDEFINED_JDS).join(", ")}`,
        });
      }
      jdInput = req.body.jd_key;
    } else if (req.body.jd_text) {
      jdInput = {
        text: req.body.jd_text,
        title: req.body.jd_title || "Custom Role",
      };
    } else {
      return res.status(400).json({
        success: false,
        error: "Provide either jd_key (predefined) or jd_text (custom job description).",
      });
    }

    const { default: fs } = await import("fs-extra");
    const fileBuffer = await fs.readFile(req.file.path);

    const result = await orchestrateResumeAnalysis(fileBuffer, req.file.mimetype, jdInput);

    await fs.remove(req.file.path);

    res.json(result);
  } catch (err) {
    if (req.file?.path) {
      const { default: fs } = await import("fs-extra");
      await fs.remove(req.file.path).catch(() => {});
    }
    next(err);
  }
};
