/*
 * Copyright (C) 2026 Vishal Jha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { Router } from "express";
import { upload, getJdOptions, analyzeResume } from "../controllers/resumeController.js";

const router = Router();

router.get("/jd-options", getJdOptions);

router.post("/analyze", upload.single("resume"), analyzeResume);

export default router;
