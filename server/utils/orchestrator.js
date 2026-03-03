/*
 * Copyright (C) 2026 Vishal Jha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, PREDEFINED_JDS, extractKeywordsFromText } from "./resumeConfig.js";
import { runATSScorer } from "./atsScorer.js";
import { runAtsFixer } from "./atsFixer.js";

async function parseResumeWithGemini(fileBuffer, mimeType) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a resume parser. Extract all information from this resume and return ONLY valid JSON with no markdown, no backticks, no explanation.

The JSON must strictly follow this structure:
{
  "name": "Full Name (REQUIRED - extract from resume header)",
  "email": "email address or null",
  "phone": "phone number or null",
  "location": "city, state/country or null",
  "linkedin": "linkedin url or null",
  "github": "github url or null",
  "portfolio": "portfolio url or null",
  "summary": "professional summary/objective text or null",
  "total_experience_years": number or null,
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "languages": ["language1"],
    "tools": ["tool1", "tool2"],
    "frameworks": ["framework1"]
  },
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "city or null",
      "start_date": "Mon YYYY or YYYY",
      "end_date": "Mon YYYY or Present",
      "duration_months": number or null,
      "responsibilities": ["bullet point 1", "bullet point 2"],
      "achievements": ["quantified achievement 1"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "gpa": number or null,
      "start_year": number or null,
      "end_year": number or null,
      "honors": "honors or null"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Body",
      "year": number or null
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "short description",
      "technologies": ["tech1"],
      "url": "url or null"
    }
  ],
  "publications": [],
  "awards": [],
  "volunteer": []
}

Return ONLY the JSON object. Do not wrap in markdown.`;

  const imagePart = {
    inlineData: {
      data: fileBuffer.toString("base64"),
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(
      `orchestrator: Gemini parse failed — ${e.message}\nRaw output: ${cleaned.slice(0, 300)}`
    );
  }
}

export async function orchestrateResumeAnalysis(fileBuffer, mimeType, jdInput) {
  let jdText, jdKeywords, jdTitle;

  if (typeof jdInput === "string" && PREDEFINED_JDS[jdInput]) {
    const jd = PREDEFINED_JDS[jdInput];
    jdText = jd.description;
    jdKeywords = jd.keywords;
    jdTitle = jd.title;
  } else if (typeof jdInput === "object" && jdInput.text) {
    jdText = jdInput.text;
    jdTitle = jdInput.title || "Custom Role";
    jdKeywords = extractKeywordsFromText(jdText);
  } else {
    throw new Error(
      'orchestrator: Invalid jdInput. Pass a predefined key (e.g. "software_engineer") or { text, title }.'
    );
  }

  const resumeJSON = await parseResumeWithGemini(fileBuffer, mimeType);

  const { heuristic, result: atsResult } = await runATSScorer(resumeJSON, jdText, jdKeywords);

  const finalScore = Math.min(100, Math.max(0, atsResult.ats_score));
  const passed = finalScore >= 65;

  const response = {
    success: true,
    candidate_name: resumeJSON.name,
    job_title: jdTitle,
    resume: resumeJSON,
    ats: {
      score: finalScore,
      passed_threshold: passed,
      heuristic_breakdown: heuristic.breakdown,
      matched_keywords: heuristic.matched_keywords,
      missing_keywords: heuristic.missing_keywords,
      role_fit_summary: atsResult.role_fit_summary,
      top_strengths: atsResult.top_strengths,
      critical_gaps: atsResult.critical_gaps,
      keyword_density: atsResult.keyword_density,
      format_assessment: atsResult.format_assessment,
    },
    improvements: null,
  };

  if (!passed) {
    response.improvements = await runAtsFixer(
      resumeJSON,
      jdText,
      atsResult,
      heuristic.missing_keywords
    );
  }

  return response;
}
