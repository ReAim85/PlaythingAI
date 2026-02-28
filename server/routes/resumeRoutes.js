import { Router } from "express";
import { upload, getJdOptions, analyzeResume } from "../controllers/resumeController.js";

const router = Router();

router.get("/jd-options", getJdOptions);

router.post("/analyze", upload.single("resume"), analyzeResume);

export default router;