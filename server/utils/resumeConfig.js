/*
 * Copyright (C) 2026 Vishal Jha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
export const CEREBRAS_BASE_URL = "https://api.cerebras.ai/v1";
export const CEREBRAS_MODEL = "llama3.1-8b";

export const PREDEFINED_JDS = {
  software_engineer: {
    title: "Software Engineer",
    description: `We are looking for a Software Engineer with strong experience in JavaScript/TypeScript,
    Node.js, React, REST APIs, SQL/NoSQL databases, Git, CI/CD pipelines, and cloud services (AWS/GCP/Azure).
    Familiarity with microservices architecture, Docker, and agile methodologies is a plus.
    Bachelor's degree in Computer Science or related field preferred.`,
    keywords: [
      "javascript", "typescript", "node.js", "react", "rest api", "sql", "nosql",
      "git", "ci/cd", "aws", "gcp", "azure", "docker", "microservices", "agile",
      "computer science", "backend", "frontend", "fullstack", "api", "database",
    ],
  },
  data_scientist: {
    title: "Data Scientist",
    description: `Seeking a Data Scientist proficient in Python, machine learning, deep learning, pandas, numpy,
    scikit-learn, TensorFlow or PyTorch, SQL, data visualization (Tableau/Power BI), and statistical analysis.
    Experience with NLP, computer vision, or time-series analysis is a plus. MS/PhD preferred.`,
    keywords: [
      "python", "machine learning", "deep learning", "pandas", "numpy", "scikit-learn",
      "tensorflow", "pytorch", "sql", "tableau", "power bi", "statistics", "nlp",
      "computer vision", "data analysis", "data visualization", "r", "jupyter", "spark",
    ],
  },
  product_manager: {
    title: "Product Manager",
    description: `Looking for a Product Manager with experience in product lifecycle management, roadmap planning,
    stakeholder communication, user research, A/B testing, agile/scrum, Jira, analytics tools (Mixpanel/Amplitude),
    and cross-functional team leadership. MBA or related experience preferred.`,
    keywords: [
      "product management", "roadmap", "stakeholder", "user research", "a/b testing",
      "agile", "scrum", "jira", "mixpanel", "amplitude", "analytics", "kpi", "okr",
      "go-to-market", "product strategy", "mvp", "customer discovery", "prioritization",
    ],
  },
  ux_designer: {
    title: "UX/UI Designer",
    description: `We need a UX/UI Designer skilled in Figma, Adobe XD, wireframing, prototyping, user research,
    usability testing, design systems, accessibility standards (WCAG), HTML/CSS basics, and cross-platform design.
    Portfolio demonstrating end-to-end product design required.`,
    keywords: [
      "figma", "adobe xd", "wireframe", "prototype", "user research", "usability testing",
      "design system", "wcag", "accessibility", "html", "css", "ux", "ui", "interaction design",
      "user flow", "information architecture", "typography", "sketch", "invision",
    ],
  },
};

export async function cerebrasChat(systemPrompt, userPrompt, temperature = 0.3) {
  const response = await fetch(`${CEREBRAS_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CEREBRAS_API_KEY}`,
    },
    body: JSON.stringify({
      model: CEREBRAS_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cerebras API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export function extractKeywordsFromText(text) {
  const stopWords = new Set([
    "a","an","the","and","or","but","in","on","at","to","for","of","with",
    "by","from","is","are","was","were","be","been","have","has","will","we",
    "our","you","your","their","this","that","these","those","as","it","its",
    "not","no","can","may","must","should","would","could","also","such","any",
    "all","more","most","some","than","then","when","where","who","which","what",
    "how","if","into","through","during","before","after","above","between",
    "both","each","few","further","once","strong","preferred","required","plus",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s/.#+]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const bigrams = [];
  const wordArr = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < wordArr.length - 1; i++) {
    const bigram = `${wordArr[i]} ${wordArr[i + 1]}`.replace(/[^a-z0-9\s]/g, "").trim();
    if (bigram.split(" ").every((w) => w.length > 2 && !stopWords.has(w))) {
      bigrams.push(bigram);
    }
  }

  return [...new Set([...words, ...bigrams])].slice(0, 50);
}
