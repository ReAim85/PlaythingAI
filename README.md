# Plaything.AI — AI-Powered Interview Preparation Platform

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Chakra UI](https://img.shields.io/badge/Chakra_UI-2-319795?style=flat-square&logo=chakraui&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Built at](https://img.shields.io/badge/Built_at-TRAE_Hackathon-C8F135?style=flat-square&labelColor=0f1623)

---

## Description

**Plaything.AI** is a full-stack, multi-agent interview preparation platform built at the TRAE Hackathon. It takes a candidate from raw resume upload through to a scored, post-interview evaluation report — entirely driven by AI.

The problem it solves: most interview prep tools give you generic questions from a static bank. Plaything.AI reads *your* resume, scores it against a real job description using ATS logic, identifies the exact gaps recruiters would flag, and then deploys a live AI voice interviewer (Karma) who probes those specific weaknesses. The result is a personalised, end-to-end pipeline that mirrors what actually happens when a recruiter and hiring manager review your application.

> *"Resume to interview to insights — one intelligent pipeline."*

## Architecture

The platform is built around three specialised AI agents that run in sequence:

```
Resume Upload (PDF / Image)
        ↓
[Agent 1] Gemini 2.5 Flash — Vision Parser
        Extracts structured JSON: name, skills, experience, education, projects
        ↓
[Agent 2] Heuristic ATS Scorer + Cerebras LLM Validator
        100-point score across 6 dimensions
        If score < 65 → Cerebras Fixer Agent generates improvement plan
        ↓
[Agent 3] Gemini 2.5 Flash Live — AI Interviewer "Karma"
        System prompt built from resume gaps + JD keywords
        Real-time voice session
        ↓
[Evaluator] Cerebras Llama — Post-Interview Scoring
        5 dimensions: technical knowledge, JD relevance,
        domain expertise, soft skills, accomplishments
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Chakra UI v2, TailwindCSS v4 |
| Backend | Node.js, Express, ESM |
| Resume Parsing | Gemini 2.5 Flash (Google AI Studio — free tier) |
| ATS Scoring / Fixing / Evaluation | Cerebras Llama-3.1-8B (free tier) |
| Live AI Interview | Gemini 2.5 Flash Native Audio Preview |
| File Handling | Multer (disk storage, 10MB limit) |
| Fonts | DM Serif Display, DM Sans (Google Fonts) |

---

## Installation & Setup

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A [Google AI Studio](https://aistudio.google.com) account (free — for Gemini API key)
- A [Cerebras Cloud](https://cloud.cerebras.ai) account (free — for Llama API key)

### 1. Clone the repository

```bash
git clone https://github.com/reaim85/Plaything-ai.git
cd Plaything-ai
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure environment variables

Create a `.env` file in the `server/` directory:

```bash
cp server/.env.example server/.env
```

Then fill in your keys (see [Environment Variables](#environment-variables)).

Create a `.env` file in the `client/` directory:

```bash
cp client/.env.example client/.env
```

### 5. Add the audio worklet

The live interview feature requires a Web Audio worklet. Copy `recorder-worklet.js` into your frontend's `public/` folder:

```bash
cp server/recorder-worklet.js client/public/recorder-worklet.js
```

### 6. Start the development servers

Backend (runs on port 5000):

```bash
cd server
npm run dev
```

Frontend (runs on port 5173):

```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

### Full pipeline walkthrough

**Step 1 — Upload your resume**

Navigate to the app. Upload a PDF or image of your resume (JPG, PNG, WEBP supported, max 10MB). Choose either a predefined job role or paste a custom job description.

**Step 2 — Review your ATS score**

The platform returns a 100-point ATS score broken down across six dimensions. Matched and missing keywords are highlighted. If your score is below 65, an improvement plan is generated automatically with priority actions and quick wins.

**Step 3 — Start your interview**

Click "Start Interview" to connect to Karma, your AI interviewer. Allow microphone access when prompted. Karma will greet you by name and conduct a structured voice interview — his questions are built directly from your resume gaps and the JD. Click "End Call" when done.

**Step 4 — Review your evaluation report**

After the session, Cerebras analyses Karma's transcript and returns scores across five dimensions with written feedback, strengths, areas to improve, and a hiring signal. You can export the full report as JSON.

## Project Structure

```
plaything-ai/
├── client/                        # React + Vite frontend
│   ├── public/
│   │   └── recorder-worklet.js    # Web Audio worklet for mic capture
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── UploadResume.jsx
│   │   │   ├── AtsResult.jsx
│   │   │   ├── Interviewer.jsx
│   │   │   └── Evaluator.jsx
│   │   ├── hooks/
│   │   │   └── useGeminiLive.js   # Gemini Live audio hook + prompt builder
│   │   └── App.jsx                # Screen flow controller
│   └── .env
│
└── server/                        # Express backend (ESM)
    ├── server.js
    ├── routes/
    │   ├── resumeRoutes.js
    │   └── interviewRoutes.js
    ├── controllers/
    │   └── resumeController.js
    ├── services/
    │   ├── resumeConfig.js        # Shared constants + Cerebras helper
    │   ├── orchestrator.js        # Gemini parser + pipeline coordinator
    │   ├── atsScorer.js           # Heuristic scorer + LLM validator
    │   └── atsFixer.js            # Cerebras improvement agent
    └── .env
```

---

## Environment Variables

### `server/.env`

| Variable | Description | Where to get it |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | [aistudio.google.com](https://aistudio.google.com) |
| `CEREBRAS_API_KEY` | Cerebras Cloud API key | [cloud.cerebras.ai](https://cloud.cerebras.ai) |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_GEMINI_API_KEY` | Same Gemini key — used client-side for the Live audio session |

> **Note:** Both API keys are available on free tiers with generous limits — no billing required to run the full platform.

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a pull request against `main`

### Guidelines

- Follow the existing ESM module pattern on the backend
- Keep React components single-file — CSS-in-Chakra, no separate style files
- All new AI prompts should be in the relevant service file (`resumeConfig.js`, `atsFixer.js`, etc.), not inline in controllers
- Test your changes against at least one real resume before submitting

For bugs or feature requests, open an issue with a clear description and steps to reproduce.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, copy, modify, merge, publish, distribute, and sublicense this code. See [choosealicense.com](https://choosealicense.com/licenses/mit/) for a plain-language explanation.

---

## Credits & Acknowledgments

**Built at the TRAE Hackathon**

 Vishal Jha | Full-stack development, AI pipeline architecture |

**Powered by**

- [Google Gemini](https://ai.google.dev) — resume vision parsing and live audio interview
- [Cerebras Cloud](https://cloud.cerebras.ai) — ATS scoring, improvement generation, and interview evaluation
- [Chakra UI](https://chakra-ui.com) — component library
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) — presentation generation
- [TRAE](https://trae.ai) — hackathon sponsor
