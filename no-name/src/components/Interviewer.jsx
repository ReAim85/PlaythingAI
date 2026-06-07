// components/Interviewer.jsx
import { useEffect, useRef, useState } from 'react';
import {
  Box, VStack, HStack, Text, Button, Badge, Avatar, Spinner, SimpleGrid, Textarea,
} from '@chakra-ui/react';
import { useGeminiLive, buildInterviewerPrompt } from '../hooks/useGeminiLive';
import { dsaQuestions, transitionNote, formatProblemDirective } from '../data/dsaQuestions';

// how long the opening resume chat runs before we switch to coding.
// lower this (for example to 20) when you want to test the switch without waiting.
const TRANSITION_AT_SECONDS = 180;

// ── Icons ──────────────────────────────────────────────────────────────────────
const MicIcon = ({ muted }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {muted ? (
      <>
        <line x1="1" y1="1" x2="23" y2="23"/>
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
        <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
      </>
    ) : (
      <>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
      </>
    )}
  </svg>
);

const PhoneOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c1.12.45 2.3.78 3.53.98a2 2 0 0 1 1.7 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.17 2h3a2 2 0 0 1 2 1.72c.2 1.23.53 2.41.98 3.53a2 2 0 0 1-.45 2.11L7.43 10.6a16 16 0 0 0 3.25 2.71z"/>
    <line x1="23" y1="1" x2="1" y2="23"/>
  </svg>
);

// ── Ripple rings that animate outward when Karma is speaking ───────────────────
function SpeakingRipples({ active }) {
  return (
    <Box position="absolute" inset="0" borderRadius="full" pointerEvents="none">
      <style>{`
        @keyframes ripple-out {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .ripple-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid #fbbf24;
          animation: ripple-out 1.6s ease-out infinite;
          opacity: 0;
        }
        .ripple-ring:nth-child(2) { animation-delay: 0.5s; }
        .ripple-ring:nth-child(3) { animation-delay: 1s;   }
      `}</style>
      {active && (
        <>
          <div className="ripple-ring" />
          <div className="ripple-ring" />
          <div className="ripple-ring" />
        </>
      )}
    </Box>
  );
}

// ── Animated waveform bars inside Karma's card ────────────────────────────────
function Waveform({ active }) {
  const heights = [0.4, 0.65, 1, 0.75, 0.9, 0.5, 0.8, 0.45, 0.7, 0.55, 0.95, 0.6];
  return (
    <HStack spacing="3px" h="28px" alignItems="center">
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.3); }
          50%       { transform: scaleY(1);   }
        }
      `}</style>
      {heights.map((h, i) => (
        <Box
          key={i}
          w="3px"
          borderRadius="full"
          bg={active ? 'amber.400' : 'gray.700'}
          transition="background 0.3s"
          style={{
            height: `${h * 28}px`,
            transformOrigin: 'center',
            animation: active ? `wave ${0.8 + (i % 3) * 0.15}s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.06}s`,
          }}
        />
      ))}
    </HStack>
  );
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function useElapsed(running) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(ref.current);
      if (!running) setElapsed(0);
    }
    return () => clearInterval(ref.current);
  }, [running]);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ── Karma card ────────────────────────────────────────────────────────────────
// the avatar, waveform and timer. shown big during the resume chat and again
// (smaller) next to the editor during the coding round, so we keep it in one place.
function KarmaCard({ isLive, isConnecting, isSpeaking, elapsed }) {
  return (
    <Box
      className={isLive && isSpeaking ? 'karma-card-speaking' : ''}
      border="1px solid"
      borderColor={isLive && isSpeaking ? 'amber.700' : 'gray.800'}
      borderRadius="2xl"
      overflow="hidden"
      transition="border-color 0.4s ease"
      boxShadow="0 24px 64px rgba(0,0,0,0.6)"
    >
      <Box
        className={isLive && isSpeaking ? 'karma-card-bg-speaking' : 'karma-card-bg-idle'}
        px={6}
        pt={8}
        pb={6}
      >
        <VStack spacing={4}>
          <Box position="relative" w="88px" h="88px">
            <SpeakingRipples active={isLive && isSpeaking} />
            <Avatar
              name="Karma"
              size="xl"
              bg={isLive && isSpeaking ? 'amber.600' : 'gray.700'}
              color="white"
              fontSize="2xl"
              transition="background 0.4s ease"
              position="relative"
              zIndex={1}
            />
          </Box>

          <VStack spacing={1}>
            <Text color="white" fontWeight="600" fontSize="lg"
              sx={{ fontFamily: "'DM Serif Display', serif" }}>
              Karma
            </Text>
            <Text color="gray.500" fontSize="xs">Senior Technical Interviewer</Text>
          </VStack>

          <Box h="36px" display="flex" alignItems="center" justifyContent="center">
            {isConnecting ? (
              <HStack spacing={2}>
                <Spinner size="xs" color="amber.400" />
                <Text fontSize="xs" color="amber.400">Connecting…</Text>
              </HStack>
            ) : isLive ? (
              <Waveform active={isSpeaking} />
            ) : (
              <Text fontSize="xs" color="gray.700">—</Text>
            )}
          </Box>

          {isLive && (
            <Badge
              bg="rgba(251,191,36,0.1)"
              color="amber.400"
              border="1px solid"
              borderColor="rgba(251,191,36,0.2)"
              fontSize="sm"
              fontWeight="600"
              px={4}
              py={1}
              borderRadius="full"
              fontvariantnumeric="tabular-nums"
              letterSpacing="0.05em"
            >
              {elapsed}
            </Badge>
          )}
        </VStack>
      </Box>

      <Box
        h="32px"
        bg={isLive && isSpeaking ? 'rgba(251,191,36,0.08)' : 'gray.950'}
        borderTop="1px solid"
        borderColor={isLive && isSpeaking ? 'rgba(251,191,36,0.15)' : 'gray.800'}
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.3s ease"
      >
        <Text
          fontSize="10px"
          fontWeight="600"
          letterSpacing="0.15em"
          textTransform="uppercase"
          color={isLive && isSpeaking ? 'amber.500' : 'gray.700'}
          transition="color 0.3s ease"
        >
          {isLive && isSpeaking ? 'Karma is speaking' : isLive ? 'Listening…' : 'Waiting'}
        </Text>
      </Box>
    </Box>
  );
}

// ── Live controls (end call + mute) ───────────────────────────────────────────
// shown once the call is live, in both the resume and coding layouts.
function LiveControls({ onEnd, muted, onToggleMute }) {
  return (
    <HStack spacing={3}>
      <Button
        flex="1"
        onClick={onEnd}
        bg="red.600"
        color="white"
        fontWeight="600"
        fontSize="sm"
        size="lg"
        borderRadius="xl"
        leftIcon={<PhoneOffIcon />}
        _hover={{ bg: 'red.500' }}
        transition="background 0.2s"
      >
        End Call
      </Button>

      <Button
        w="56px"
        h="48px"
        onClick={onToggleMute}
        bg={muted ? 'red.900' : 'gray.800'}
        color={muted ? 'red.400' : 'gray.400'}
        borderRadius="xl"
        _hover={{ bg: muted ? 'red.800' : 'gray.700' }}
        title={muted ? 'Unmute' : 'Mute'}
        transition="all 0.2s"
      >
        <MicIcon muted={muted} />
      </Button>
    </HStack>
  );
}

export default function Interviewer({ atsData, onInterviewEnd }) {
  const {
    startInterview, stopInterview, getAlexTranscript,
    sendDirective, appendTranscriptEntry, isSpeaking, status, error,
  } = useGeminiLive();
  const [muted, setMuted] = useState(false);
  const elapsed = useElapsed(status === 'live');

  // 'resume' = the opening chat, 'coding' = the dsa round.
  const [phase, setPhase] = useState('resume');
  const [problemIndex, setProblemIndex] = useState(0);
  // one code box per problem, starting from each problem's starter code.
  const [codeByProblem, setCodeByProblem] = useState(() => dsaQuestions.map(q => q.starterCode));
  // makes sure the switch to coding only fires one time.
  const transitionedRef = useRef(false);

  const isLive = status === 'live';
  const isConnecting = status === 'connecting';
  const problem = dsaQuestions[problemIndex];
  const isLastProblem = problemIndex === dsaQuestions.length - 1;

  // while the opening chat is live, run a timer. when it fires we switch to the
  // coding round once and hand karma the first problem. the timer is cleared if
  // the call ends or we already switched.
  useEffect(() => {
    if (!isLive || phase !== 'resume' || transitionedRef.current) return;
    const timer = setTimeout(() => {
      transitionedRef.current = true;
      setPhase('coding');
      setProblemIndex(0);
      sendDirective(
        `${transitionNote}\n${formatProblemDirective(dsaQuestions[0], 0, dsaQuestions.length)}`,
      );
    }, TRANSITION_AT_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [isLive, phase, sendDirective]);

  const handleStart = () => {
    if (status !== 'idle') return; // ignore double clicks while connecting or live
    transitionedRef.current = false;
    setPhase('resume');
    setProblemIndex(0);
    setCodeByProblem(dsaQuestions.map(q => q.starterCode));
    const prompt = buildInterviewerPrompt(atsData);
    startInterview(prompt);
  };

  const handleEnd = () => {
    stopInterview();
    // save the code from every problem the candidate actually wrote, so the
    // evaluator can grade it. we skip boxes the candidate left untouched.
    dsaQuestions.forEach((q, i) => {
      const code = (codeByProblem[i] || '').trim();
      if (code && code !== q.starterCode.trim()) {
        appendTranscriptEntry({
          role: 'candidate',
          text: `[coding round - ${q.title} (${q.difficulty})] my code:\n\`\`\`\n${code}\n\`\`\``,
        });
      }
    });
    onInterviewEnd(getAlexTranscript(), atsData);
  };

  const handleNextProblem = () => {
    const next = problemIndex + 1;
    if (next < dsaQuestions.length) {
      setProblemIndex(next);
      sendDirective(formatProblemDirective(dsaQuestions[next], next, dsaQuestions.length));
    } else {
      handleEnd();
    }
  };

  // keeps the code box for the current problem in sync as the candidate types.
  const handleCodeChange = (value) => {
    setCodeByProblem(prev => {
      const copy = [...prev];
      copy[problemIndex] = value;
      return copy;
    });
  };

  // pressing tab inside the editor should add spaces instead of leaving the box.
  const handleEditorKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.target;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const value = el.value;
    handleCodeChange(value.slice(0, start) + '  ' + value.slice(end));
    // put the cursor right after the two spaces we just added.
    requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; });
  };

  const showCoding = phase === 'coding' && isLive;

  return (
    <Box minH="100vh" bg="gray.950" sx={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes card-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0), 0 24px 64px rgba(0,0,0,0.6); }
          50%       { box-shadow: 0 0 40px 8px rgba(251,191,36,0.15), 0 24px 64px rgba(0,0,0,0.6); }
        }
        .karma-card-speaking {
          animation: card-pulse 1.6s ease-in-out infinite;
        }
        @keyframes bg-shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .karma-card-bg-speaking {
          background: linear-gradient(135deg, #1a1f2e 0%, #1f2937 40%, #1a1a0f 70%, #1f2937 100%);
          background-size: 300% 300%;
          animation: bg-shimmer 2s ease infinite;
        }
        .karma-card-bg-idle {
          background: #111827;
          transition: background 0.6s ease;
        }
      `}</style>

      {showCoding ? (
        // ── Coding round: problem + editor on the left, Karma on the right ──────
        <Box p={6}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5} maxW="1100px" mx="auto">
            {/* left: the problem and the code editor */}
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Badge
                  bg="rgba(251,191,36,0.1)" color="amber.400"
                  border="1px solid" borderColor="rgba(251,191,36,0.2)"
                  borderRadius="full" px={3} py={1} fontSize="xs"
                >
                  {problem.difficulty}
                </Badge>
                <Text color="amber.300" fontSize="lg"
                  sx={{ fontFamily: "'DM Serif Display', serif" }}>
                  {problem.title}
                </Text>
                <Badge ml="auto" bg="gray.800" color="gray.400" borderRadius="full" px={3} py={1} fontSize="xs">
                  Problem {problemIndex + 1} / {dsaQuestions.length}
                </Badge>
              </HStack>

              <Box bg="gray.900" border="1px solid" borderColor="gray.800" borderRadius="2xl" p={5}>
                <Text color="gray.300" fontSize="sm" lineHeight="1.7">{problem.description}</Text>

                <Text color="amber.400" fontSize="xs" fontWeight="600" textTransform="uppercase"
                  letterSpacing="0.1em" mt={4} mb={2}>Examples</Text>
                <VStack align="stretch" spacing={2}>
                  {problem.examples.map((ex, i) => (
                    <Box key={i} bg="gray.950" borderRadius="lg" px={3} py={2}>
                      <Text color="gray.400" fontSize="xs" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        in: {ex.input}
                      </Text>
                      <Text color="gray.300" fontSize="xs" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        out: {ex.output}
                      </Text>
                    </Box>
                  ))}
                </VStack>

                <Text color="amber.400" fontSize="xs" fontWeight="600" textTransform="uppercase"
                  letterSpacing="0.1em" mt={4} mb={2}>Constraints</Text>
                <VStack align="stretch" spacing={1}>
                  {problem.constraints.map((c, i) => (
                    <Text key={i} color="gray.500" fontSize="xs">• {c}</Text>
                  ))}
                </VStack>
              </Box>

              <Textarea
                value={codeByProblem[problemIndex]}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleEditorKeyDown}
                spellCheck={false}
                placeholder="write your solution here"
                minH="260px"
                bg="gray.900"
                color="gray.100"
                border="1px solid"
                borderColor="gray.800"
                borderRadius="2xl"
                p={4}
                fontSize="sm"
                resize="vertical"
                whiteSpace="pre"
                _focus={{ borderColor: 'amber.600', boxShadow: 'none' }}
                sx={{ fontFamily: "'JetBrains Mono', monospace", tabSize: 2 }}
              />

              <Button
                onClick={handleNextProblem}
                isDisabled={isSpeaking}
                w="full"
                bg="amber.400"
                color="gray.900"
                fontWeight="600"
                fontSize="sm"
                size="lg"
                borderRadius="xl"
                _hover={{ bg: 'amber.300' }}
                _disabled={{ bg: 'gray.800', color: 'gray.600', cursor: 'not-allowed' }}
                transition="all 0.2s"
              >
                {isLastProblem ? 'Finish & Evaluate' : 'Next Problem'}
              </Button>
              <Text fontSize="xs" color="gray.700" textAlign="center">
                {isSpeaking ? 'Let Karma finish before moving on…' : 'Talk through your approach as you code'}
              </Text>
            </VStack>

            {/* right: Karma and the end call button */}
            <VStack align="stretch" spacing={4}>
              <KarmaCard
                isLive={isLive}
                isConnecting={isConnecting}
                isSpeaking={isSpeaking}
                elapsed={elapsed}
              />
              {error && (
                <Box bg="rgba(239,68,68,0.08)" border="1px solid" borderColor="red.900"
                  borderRadius="xl" px={4} py={3}>
                  <Text fontSize="xs" color="red.400">{error}</Text>
                </Box>
              )}
              <LiveControls onEnd={handleEnd} muted={muted} onToggleMute={() => setMuted(m => !m)} />
            </VStack>
          </SimpleGrid>
        </Box>
      ) : (
        // ── Resume chat: the single centered card ──────────────────────────────
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p={6}>
          <Box w="full" maxW="400px">
            <VStack spacing={0} mb={8} align="center">
              <Text fontSize="xs" fontWeight="600" letterSpacing="0.2em" color="amber.400"
                textTransform="uppercase">Live Interview</Text>
              <Text fontSize="xl" color="amber.300" mt={1}
                sx={{ fontFamily: "'DM Serif Display', serif" }}>
                {atsData.resume?.name}
              </Text>
              <Text fontSize="sm" color="gray.500">{atsData.job_title}</Text>
            </VStack>

            <Box mb={5}>
              <KarmaCard
                isLive={isLive}
                isConnecting={isConnecting}
                isSpeaking={isSpeaking}
                elapsed={elapsed}
              />
            </Box>

            {error && (
              <Box bg="rgba(239,68,68,0.08)" border="1px solid" borderColor="red.900"
                borderRadius="xl" px={4} py={3} mb={4}>
                <Text fontSize="xs" color="red.400">{error}</Text>
              </Box>
            )}

            {!isLive && !isConnecting ? (
              <Button
                onClick={handleStart}
                w="full"
                bg="amber.400"
                color="gray.900"
                fontWeight="600"
                fontSize="sm"
                size="lg"
                borderRadius="xl"
                _hover={{ bg: 'amber.300', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(251,191,36,0.25)' }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s"
              >
                Start Interview
              </Button>
            ) : isConnecting ? (
              <Button w="full" bg="gray.800" color="gray.500" size="lg" borderRadius="xl" isDisabled>
                <Spinner size="xs" mr={2} /> Connecting…
              </Button>
            ) : (
              <LiveControls onEnd={handleEnd} muted={muted} onToggleMute={() => setMuted(m => !m)} />
            )}

            {isLive && (
              <Text fontSize="xs" color="gray.700" textAlign="center" mt={4}>
                Speak naturally — Karma is listening
              </Text>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
