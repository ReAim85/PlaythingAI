/*
 * Copyright (C) 2026 Vishal Jha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
// routes/interviewRoutes.js
import { Router } from 'express';
import { cerebrasChat } from '../utils/resumeConfig.js';

const router = Router();

// POST /api/interview/evaluate
// Body: { transcript, jobDescription, candidateName, atsScore, resumeSummary }
router.post('/evaluate', async (req, res, next) => {
  try {
    const { transcript, jobDescription, candidateName, atsScore, resumeSummary } = req.body;

    if (!transcript || transcript.length === 0) {
      return res.status(400).json({ success: false, error: 'Transcript is empty.' });
    }

    // Format transcript for the prompt — skip raw audio placeholders
    const formatted = transcript
      .filter(e => e.text !== '[audio segment]')
      .map(e => `${e.role === 'interviewer' ? 'Interviewer (Alex)' : 'Candidate'}: ${e.text}`)
      .join('\n');

    const systemPrompt = `You are an expert hiring manager and interview evaluator.
You assess interview transcripts objectively and return ONLY valid JSON. No markdown, no backticks.`;

    const userPrompt = `Evaluate this job interview transcript for the position of "${jobDescription}".

CANDIDATE: ${candidateName || 'Unknown'}
RESUME ATS SCORE (pre-interview): ${atsScore || 'N/A'}/100
RESUME SKILLS SNAPSHOT: ${JSON.stringify(resumeSummary || {})}

INTERVIEW TRANSCRIPT:
${formatted}

Score the candidate from 1-10 on each dimension. Be calibrated — a 10 requires truly exceptional performance.

Return ONLY this JSON:
{
  "scores": {
    "technical_knowledge": <1-10>,
    "jd_relevance": <1-10>,
    "domain_expertise": <1-10>,
    "soft_skills": <1-10>,
    "accomplishments": <1-10>
  },
  "feedback": "3-5 sentence narrative summary of the candidate's overall performance, tone, and notable moments",
  "strengths": [
    "Specific strength with an example from the transcript",
    "Specific strength with an example",
    "Specific strength with an example"
  ],
  "improvements": [
    "Specific area to improve with actionable advice",
    "Specific area to improve with actionable advice",
    "Specific area to improve with actionable advice"
  ],
  "hiring_signal": "strong_yes|yes|maybe|no|strong_no",
  "standout_moment": "The single most impressive or notable exchange from the interview"
}`;

    const raw = await cerebrasChat(systemPrompt, userPrompt, 0.3);
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const evaluation = JSON.parse(cleaned);
    res.json({ success: true, ...evaluation });
  } catch (err) {
    next(err);
  }
});

export default router;
