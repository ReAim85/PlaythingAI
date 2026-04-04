// components/Interviewer.jsx
import { useEffect, useRef, useState } from 'react';
import {
  Box, VStack, HStack, Text, Button, Badge, Avatar, Spinner,
} from '@chakra-ui/react';
import { useGeminiLive, buildInterviewerPrompt } from '../hooks/useGeminiLive';

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

// ── Ripple rings that animate outward when Alex is speaking ───────────────────
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

// ── Animated waveform bars inside Alex's card ─────────────────────────────────
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

export default function Interviewer({ atsData, apiKey, onInterviewEnd }) {
  const { startInterview, stopInterview, getAlexTranscript, isSpeaking, status, error } = useGeminiLive(apiKey);
  const [muted, setMuted] = useState(false);
  const elapsed = useElapsed(status === 'live');

  const handleStart = () => {
    const prompt = buildInterviewerPrompt(atsData);
    startInterview(prompt);
  };

  const handleEnd = () => {
    stopInterview();
    onInterviewEnd(getAlexTranscript(), atsData);
  };

  const isLive = status === 'live';
  const isConnecting = status === 'connecting';

  return (
    <Box
      minH="100vh"
      bg="gray.950"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={6}
      sx={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        @keyframes card-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0), 0 24px 64px rgba(0,0,0,0.6); }
          50%       { box-shadow: 0 0 40px 8px rgba(251,191,36,0.15), 0 24px 64px rgba(0,0,0,0.6); }
        }
        .alex-card-speaking {
          animation: card-pulse 1.6s ease-in-out infinite;
        }
        @keyframes bg-shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .alex-card-bg-speaking {
          background: linear-gradient(135deg, #1a1f2e 0%, #1f2937 40%, #1a1a0f 70%, #1f2937 100%);
          background-size: 300% 300%;
          animation: bg-shimmer 2s ease infinite;
        }
        .alex-card-bg-idle {
          background: #111827;
          transition: background 0.6s ease;
        }
      `}</style>

      <Box w="full" maxW="400px">
        {/* Header info */}
        <VStack spacing={0} mb={8} align="center">
          <Text fontSize="xs" fontWeight="600" letterSpacing="0.2em" color="amber.400"
            textTransform="uppercase">Live Interview</Text>
          <Text fontSize="xl" color="amber.300" mt={1}
            sx={{ fontFamily: "'DM Serif Display', serif" }}>
            {atsData.resume?.name}
          </Text>
          <Text fontSize="sm" color="gray.500">{atsData.job_title}</Text>
        </VStack>

        {/* Alex card — the main visual focal point */}
        <Box
          className={isLive && isSpeaking ? 'alex-card-speaking' : ''}
          border="1px solid"
          borderColor={isLive && isSpeaking ? 'amber.700' : 'gray.800'}
          borderRadius="2xl"
          overflow="hidden"
          mb={5}
          transition="border-color 0.4s ease"
          boxShadow="0 24px 64px rgba(0,0,0,0.6)"
        >
          {/* Card background — wiggles when speaking */}
          <Box
            className={isLive && isSpeaking ? 'alex-card-bg-speaking' : 'alex-card-bg-idle'}
            px={6}
            pt={8}
            pb={6}
          >
            {/* Avatar with ripple rings */}
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

              {/* Name + status */}
              <VStack spacing={1}>
                <Text color="white" fontWeight="600" fontSize="lg"
                  sx={{ fontFamily: "'DM Serif Display', serif" }}>
                  Karma
                </Text>
                <Text color="gray.500" fontSize="xs">Senior Technical Interviewer</Text>
              </VStack>

              {/* Waveform / status indicator */}
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

              {/* Live timer */}
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

          {/* Speaking label strip */}
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

        {/* Error */}
        {error && (
          <Box bg="rgba(239,68,68,0.08)" border="1px solid" borderColor="red.900"
            borderRadius="xl" px={4} py={3} mb={4}>
            <Text fontSize="xs" color="red.400">{error}</Text>
          </Box>
        )}

        {/* Controls */}
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
          <HStack spacing={3}>
            {/* End call */}
            <Button
              flex="1"
              onClick={handleEnd}
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

            {/* Mute toggle */}
            <Button
              w="56px"
              h="48px"
              onClick={() => setMuted(m => !m)}
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
        )}

        {/* Hint text */}
        {isLive && (
          <Text fontSize="xs" color="gray.700" textAlign="center" mt={4}>
            Speak naturally — Karma is listening
          </Text>
        )}
      </Box>
    </Box>
  );
}