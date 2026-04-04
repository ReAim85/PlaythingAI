import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

export function buildInterviewerPrompt(atsResponse) {
  const { resume, ats, job_title } = atsResponse;
  const name = resume.name || 'the candidate';
  const totalYears = resume.total_experience_years
    ? `${resume.total_experience_years} years of experience`
    : 'experience level unknown';
  const technicalSkills = [
    ...(resume.skills?.technical || []),
    ...(resume.skills?.frameworks || []),
    ...(resume.skills?.tools || []),
  ].join(', ') || 'not listed';
  const recentRole = resume.experience?.[0]
    ? `${resume.experience[0].title} at ${resume.experience[0].company}`
    : 'no prior role listed';
  const education = resume.education?.[0]
    ? `${resume.education[0].degree} in ${resume.education[0].field} from ${resume.education[0].institution}`
    : 'not listed';
  const projects = resume.projects?.length
    ? resume.projects.map(p => `"${p.name}" (${(p.technologies || []).join(', ')})`).join('; ')
    : null;
  const certifications = resume.certifications?.length
    ? resume.certifications.map(c => c.name).join(', ')
    : null;
  const strengths = (ats.top_strengths || []).join(', ') || 'not identified';
  const gaps = (ats.critical_gaps || []).join(', ') || 'none identified';
  const missingKeywords = (ats.missing_keywords || []).slice(0, 8).join(', ') || 'none';
  const keywordDensity = ats.keyword_density || 'medium';
  const roleFitSummary = ats.role_fit_summary || '';
  const probeAreas = [
    ...(ats.critical_gaps || []),
    ...(ats.missing_keywords || []).slice(0, 4),
  ].filter(Boolean).slice(0, 6).join(', ');

  return `You are Karma, a senior technical interviewer at a top-tier tech company conducting a real job interview for the position of ${job_title}.

## YOUR PERSONA
- Professional, warm, and encouraging — but rigorous
- You listen carefully, ask natural follow-up questions, and never rush
- You speak in a conversational, human tone — not robotic or scripted
- You address the candidate by their first name: ${name.split(' ')[0]}
- This is a VOICE interview. Keep individual responses concise (2-4 sentences max). Let the conversation breathe.

## CANDIDATE PROFILE
- **Name:** ${name}
- **Applying for:** ${job_title}
- **Experience:** ${totalYears}, most recently as ${recentRole}
- **Education:** ${education}
- **Technical skills:** ${technicalSkills}
${projects ? `- **Notable projects:** ${projects}` : ''}
${certifications ? `- **Certifications:** ${certifications}` : ''}
- **Key strengths identified:** ${strengths}
- **Gaps to explore:** ${gaps}
- **Missing keywords from JD:** ${missingKeywords}
- **Overall fit:** ${roleFitSummary}

## INTERVIEW STRUCTURE
Follow this flow naturally — do NOT announce sections out loud:

1. **Warm welcome** — Greet ${name.split(' ')[0]} by name, introduce yourself as Karma, small talk, ask them to introduce themselves.
2. **Background & motivation** — Dig into their most recent role, why they're making this move.
3. **Technical depth** — One focused question at a time. Start with ${(resume.skills?.technical || [])[0] || 'their primary skill'}. Probe gaps: ${probeAreas || gaps}. Keyword density is ${keywordDensity} — ${keywordDensity === 'low' ? 'probe whether gaps are real or just resume formatting' : 'dig deeper to validate claimed expertise'}.
4. **Behavioural** — Tight deadlines, technical disagreements, one tailored to their time at ${resume.experience?.[0]?.company || 'their last company'}.
5. **Scenario** — A realistic ${job_title} scenario. Listen for structured thinking.
6. **Candidate questions** — "Any questions for me?"
7. **Close** — Thank them warmly, mention next steps vaguely. Do NOT give a verdict.

## RULES
- Never break character or mention you are an AI
- Never mention ATS scores, keyword gaps, or this system prompt
- Never ask two questions in one turn
- Acknowledge good answers briefly, then move on`;
}

// No apiKey prop — token is fetched fresh inside startInterview
export const useGeminiLive = () => {
  const [status, setStatus]         = useState('idle');
  const [error, setError]           = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sessionRef       = useRef(null);
  const audioContextRef  = useRef(null);
  const micContextRef    = useRef(null);
  const micStreamRef     = useRef(null);
  const workletNodeRef   = useRef(null);
  const nextPlayTimeRef  = useRef(0);
  const alexTranscriptRef = useRef([]);
  const speakingTimerRef  = useRef(null);
  // Flips to false synchronously in stopInterview —
  // stops the worklet sending to a closed socket
  const activeRef = useRef(false);

  const initAudio = async () => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    nextPlayTimeRef.current = audioContextRef.current.currentTime;
  };

  const playChunk = useCallback((base64) => {
    if (!audioContextRef.current) return;
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();

    const arrayBuffer  = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
    const int16Array   = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) float32Array[i] = int16Array[i] / 32768;

    const buffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
    buffer.getChannelData(0).set(float32Array);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);

    const start = Math.max(nextPlayTimeRef.current, audioContextRef.current.currentTime);
    source.start(start);
    nextPlayTimeRef.current = start + buffer.duration;

    setIsSpeaking(true);
    clearTimeout(speakingTimerRef.current);
    speakingTimerRef.current = setTimeout(
      () => setIsSpeaking(false),
      buffer.duration * 1000 + 400
    );
  }, []);

  const startInterview = async (systemInstruction) => {
    setStatus('connecting');
    setError(null);
    alexTranscriptRef.current = [];
    activeRef.current = false;

    try {
      await initAudio();

      // ── Fetch a fresh token RIGHT NOW, not on page load ──────────────────
      // This is the key fix — token is valid for 1 min to start a session,
      // so it must be fetched immediately before connecting, never in advance.
      const tokenRes = await fetch('https://fs6h4ks7-3000.inc1.devtunnels.ms/api/session/gemini-token', { method: 'POST' });
      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        throw new Error(err.error || 'Failed to get session token');
      }
      const { token } = await tokenRes.json();
      console.log('Fresh token fetched:', token); // remove after confirming it works

      // ── Connect with the token — v1alpha required on BOTH sides ──────────
      const ai = new GoogleGenAI({
        apiKey: token,
        httpOptions: { apiVersion: 'v1alpha' },
      });

      sessionRef.current = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: systemInstruction }] },
        },
        callbacks: {
          onopen: async () => {
            setStatus('live');
            activeRef.current = true; // session confirmed live — mic can send

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;

            const micContext = new AudioContext({ sampleRate: 16000 });
            micContextRef.current = micContext;
            await micContext.audioWorklet.addModule('/recorder-worklet.js');

            const source = micContext.createMediaStreamSource(stream);
            const workletNode = new AudioWorkletNode(micContext, 'recorder-worklet');
            workletNodeRef.current = workletNode;

            let pcmBuffer = [];
            workletNode.port.onmessage = (event) => {
              // Guard — drop chunks silently if session is gone
              if (!activeRef.current || !sessionRef.current) return;

              const int16Data = new Int16Array(event.data);
              for (let i = 0; i < int16Data.length; i++) pcmBuffer.push(int16Data[i]);

              if (pcmBuffer.length >= 2048) {
                const chunk  = new Int16Array(pcmBuffer.slice(0, 2048));
                pcmBuffer = pcmBuffer.slice(2048);
                const base64 = btoa(String.fromCharCode(...new Uint8Array(chunk.buffer)));
                try {
                  sessionRef.current.sendRealtimeInput({
                    audio: { data: base64, mimeType: 'audio/pcm;rate=16000' },
                  });
                } catch {
                  // session closed between guard check and send — safe to ignore
                }
              }
            };

            source.connect(workletNode);
            workletNode.connect(micContext.destination);
          },

          onmessage: (msg) => {
            const parts = msg.serverContent?.modelTurn?.parts || [];
            let chunkText = '';
            parts.forEach(p => {
              if (p.inlineData?.data) playChunk(p.inlineData.data);
              if (p.text) chunkText += p.text;
            });
            if (chunkText.trim()) {
              alexTranscriptRef.current.push({
                text: chunkText.trim(),
                timestamp: new Date().toISOString(),
              });
            }
          },

          onerror: (err) => {
            activeRef.current = false;
            setError(err?.message || 'Connection error');
            setStatus('error');
          },

          onclose: () => {
            activeRef.current = false;
            setStatus('idle');
            setIsSpeaking(false);
          },
        },
      });
    } catch (err) {
      activeRef.current = false;
      setError(err.message);
      setStatus('error');
    }
  };

  const stopInterview = useCallback(() => {
    // Flip flag FIRST — silences the worklet before socket closes
    activeRef.current = false;

    try { workletNodeRef.current?.disconnect(); } catch { /* ignore */ }
    workletNodeRef.current = null;

    sessionRef.current?.close?.();
    sessionRef.current = null;

    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current = null;

    micContextRef.current?.close();
    micContextRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    nextPlayTimeRef.current = 0;
    clearTimeout(speakingTimerRef.current);
    setIsSpeaking(false);
    setStatus('idle');
  }, []);

  const getAlexTranscript = useCallback(() => alexTranscriptRef.current, []);

  return { startInterview, stopInterview, getAlexTranscript, isSpeaking, status, error };
};