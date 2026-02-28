import { cerebrasChat } from "./resumeConfig.js";

export function computeHeuristicATS(resumeJSON, jdKeywords, jdText) {
  const scores = {};
  const resumeText = JSON.stringify(resumeJSON).toLowerCase();

  const matchedKeywords = jdKeywords.filter((kw) =>
    resumeText.includes(kw.toLowerCase())
  );
  const keywordScore = Math.min(
    35,
    Math.round((matchedKeywords.length / jdKeywords.length) * 35)
  );
  scores.keyword = {
    score: keywordScore,
    max: 35,
    matched: matchedKeywords,
    total: jdKeywords.length,
  };

  let expScore = 0;
  const experiences = resumeJSON.experience || [];
  if (experiences.length > 0) expScore += 5;
  if (resumeJSON.total_experience_years >= 2) expScore += 5;
  if (resumeJSON.total_experience_years >= 5) expScore += 5;
  const expText = experiences
    .map((e) => `${e.title} ${(e.responsibilities || []).join(" ")}`)
    .join(" ")
    .toLowerCase();
  const expKeywordHits = jdKeywords.filter((kw) =>
    expText.includes(kw.toLowerCase())
  ).length;
  expScore += Math.min(5, Math.round((expKeywordHits / jdKeywords.length) * 10));
  scores.experience = { score: Math.min(20, expScore), max: 20 };

  const allSkills = [
    ...(resumeJSON.skills?.technical || []),
    ...(resumeJSON.skills?.tools || []),
    ...(resumeJSON.skills?.frameworks || []),
  ].map((s) => s.toLowerCase());
  const skillMatches = jdKeywords.filter((kw) =>
    allSkills.some((s) => s.includes(kw.toLowerCase()))
  ).length;
  const skillScore = Math.min(
    20,
    Math.round((skillMatches / jdKeywords.length) * 20)
  );
  scores.skills = { score: skillScore, max: 20 };

  let eduScore = 0;
  const education = resumeJSON.education || [];
  if (education.length > 0) eduScore += 5;
  const hasRelevantDegree = education.some((e) => {
    const fieldLower = (e.field || "").toLowerCase();
    return (
      fieldLower.includes("computer") ||
      fieldLower.includes("engineer") ||
      fieldLower.includes("science") ||
      fieldLower.includes("technology") ||
      fieldLower.includes("business") ||
      fieldLower.includes("design") ||
      fieldLower.includes("data") ||
      fieldLower.includes("information")
    );
  });
  if (hasRelevantDegree) eduScore += 3;
  if ((resumeJSON.certifications || []).length > 0) eduScore += 2;
  scores.education = { score: Math.min(10, eduScore), max: 10 };

  let completeness = 0;
  if (resumeJSON.name) completeness += 1;
  if (resumeJSON.email) completeness += 1;
  if (resumeJSON.phone) completeness += 1;
  if (resumeJSON.summary) completeness += 2;
  if ((resumeJSON.skills?.technical || []).length >= 5) completeness += 2;
  if ((resumeJSON.experience || []).length >= 1) completeness += 1;
  if ((resumeJSON.projects || []).length >= 1) completeness += 1;
  if (resumeJSON.linkedin || resumeJSON.github) completeness += 1;
  scores.completeness = { score: Math.min(10, completeness), max: 10 };

  const allAchievements = experiences
    .flatMap((e) => e.achievements || [])
    .join(" ");
  const achievementScore =
    (/\d+/.test(allAchievements) ? 3 : 0) +
    (/%/.test(allAchievements) ? 2 : 0);
  scores.achievements = { score: Math.min(5, achievementScore), max: 5 };

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s.score, 0);

  return {
    total_score: totalScore,
    max_score: 100,
    breakdown: scores,
    matched_keywords: matchedKeywords,
    missing_keywords: jdKeywords.filter((kw) => !matchedKeywords.includes(kw)),
    passed_threshold: totalScore >= 65,
  };
}

export async function runATSScorer(resumeJSON, jdText, jdKeywords) {
  const heuristicResult = computeHeuristicATS(resumeJSON, jdKeywords, jdText);

  const systemPrompt = `You are an ATS (Applicant Tracking System) expert. You analyze resumes against job descriptions.
You MUST respond with ONLY valid JSON. No markdown, no explanation, no backticks.`;

  const userPrompt = `Analyze this resume against the job description.

HEURISTIC SCORES (already computed):
${JSON.stringify(heuristicResult, null, 2)}

RESUME:
${JSON.stringify(resumeJSON, null, 2)}

JOB DESCRIPTION:
${jdText}

Return ONLY this JSON structure:
{
  "ats_score": <use the heuristic total_score, adjust by max ±5 based on your analysis>,
  "heuristic_score": ${heuristicResult.total_score},
  "llm_adjustment": <number between -5 and 5>,
  "adjustment_reason": "brief reason for adjustment",
  "role_fit_summary": "2-3 sentence summary of fit",
  "top_strengths": ["strength1", "strength2", "strength3"],
  "critical_gaps": ["gap1", "gap2"],
  "keyword_density": "low|medium|high",
  "format_assessment": "structured|semi-structured|unstructured",
  "passed_threshold": <true if final ats_score >= 65>
}`;

  try {
    const raw = await cerebrasChat(systemPrompt, userPrompt);
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const llmResult = JSON.parse(cleaned);

    return {
      heuristic: heuristicResult,
      result: llmResult,
    };
  } catch {
    const fallback = {
      ats_score: heuristicResult.total_score,
      heuristic_score: heuristicResult.total_score,
      llm_adjustment: 0,
      adjustment_reason: "LLM unavailable, using heuristic score",
      role_fit_summary: "Based on heuristic analysis only.",
      top_strengths: heuristicResult.matched_keywords.slice(0, 3),
      critical_gaps: heuristicResult.missing_keywords.slice(0, 3),
      keyword_density:
        heuristicResult.total_score > 70
          ? "high"
          : heuristicResult.total_score > 50
          ? "medium"
          : "low",
      format_assessment: "structured",
      passed_threshold: heuristicResult.passed_threshold,
    };

    return {
      heuristic: heuristicResult,
      result: fallback,
    };
  }
}