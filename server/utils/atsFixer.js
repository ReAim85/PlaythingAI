import { cerebrasChat } from "./resumeConfig.js";

export async function runAtsFixer(resumeJSON, jdText, atsResult, missingKeywords) {
  const systemPrompt = `You are a professional resume coach and ATS optimization expert.
You provide specific, actionable improvements. Respond ONLY with valid JSON. No markdown, no backticks.`;

  const userPrompt = `The candidate's resume scored ${atsResult.ats_score}/100 on ATS (below the 65 threshold).

RESUME:
${JSON.stringify(resumeJSON, null, 2)}

JOB DESCRIPTION:
${jdText}

MISSING KEYWORDS: ${missingKeywords.join(", ")}

CRITICAL GAPS: ${(atsResult.critical_gaps || []).join(", ")}

Return ONLY this JSON:
{
  "overall_recommendation": "1-2 sentence high-level advice",
  "priority_actions": [
    {
      "priority": 1,
      "category": "keywords|skills|experience|education|formatting|summary",
      "action": "Specific action to take",
      "impact": "high|medium|low",
      "effort": "high|medium|low"
    }
  ],
  "keywords_to_add": [
    {
      "keyword": "keyword",
      "where_to_add": "summary|skills|experience|all",
      "context_suggestion": "How to naturally incorporate it"
    }
  ],
  "section_improvements": {
    "summary": {
      "needs_improvement": true,
      "current_issues": ["issue1"],
      "suggestions": ["specific suggestion"]
    },
    "skills": {
      "needs_improvement": true,
      "missing_skills": ["skill1", "skill2"],
      "suggestions": ["specific suggestion"]
    },
    "experience": {
      "needs_improvement": true,
      "issues": ["issue1"],
      "suggestions": ["quantify achievements with numbers/percentages"]
    },
    "education": {
      "needs_improvement": false,
      "suggestions": ["specific suggestion"]
    }
  },
  "quick_wins": ["quick win 1", "quick win 2", "quick win 3"],
  "estimated_score_after_improvements": 75
}`;

  const raw = await cerebrasChat(systemPrompt, userPrompt, 0.4);
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`atsFixer: Failed to parse improvement suggestions — ${e.message}`);
  }
}