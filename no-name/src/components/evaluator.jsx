// components/Evaluator.jsx
import { useEffect, useState } from 'react';
import {
  Box, VStack, HStack, Text, Button, Badge, Grid, Spinner,
  CircularProgress, CircularProgressLabel, Divider,
} from '@chakra-ui/react';

const SCORE_CATEGORIES = [
  { key: 'technical_knowledge', label: 'Technical Knowledge', description: 'Depth and accuracy of technical answers' },
  { key: 'jd_relevance', label: 'JD Relevance', description: 'How well answers aligned with the role requirements' },
  { key: 'domain_expertise', label: 'Domain Expertise', description: 'Breadth of knowledge in the relevant domain' },
  { key: 'soft_skills', label: 'Soft Skills', description: 'Communication, clarity, and interpersonal signals' },
  { key: 'accomplishments', label: 'Accomplishments', description: 'Quality and impact of cited achievements' },
];

function ScoreGauge({ value, label, description }) {
  const color = value >= 8 ? '#22c55e' : value >= 6 ? '#f59e0b' : '#ef4444';
  const bg = value >= 8 ? 'rgba(34,197,94,0.08)' : value >= 6 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
  const border = value >= 8 ? 'rgba(34,197,94,0.2)' : value >= 6 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)';

  return (
    <Box bg={bg} border="1px solid" borderColor={border} borderRadius="xl" p={4} textAlign="center">
      <CircularProgress value={value * 10} size="72px" thickness="6px" color={color} trackColor="gray.800" mb={2}>
        <CircularProgressLabel>
          <Text fontSize="lg" fontWeight="700" color="amber.300"
            sx={{ fontFamily: "'DM Serif Display', serif" }}>{value}</Text>
        </CircularProgressLabel>
      </CircularProgress>
      <Text fontSize="xs" color="gray.600" fontWeight="600" mb={1}>{label}</Text>
      <Text fontSize="10px" color="gray.800" lineHeight="1.4">{description}</Text>
    </Box>
  );
}

function OverallBadge({ score }) {
  const tier = score >= 8 ? { label: 'Exceptional', color: 'green' } :
               score >= 7 ? { label: 'Strong', color: 'green' } :
               score >= 6 ? { label: 'Competent', color: 'amber' } :
               score >= 5 ? { label: 'Developing', color: 'amber' } :
                            { label: 'Needs Growth', color: 'red' };
  return (
    <Badge
      bg={`${tier.color}.900`} color={`${tier.color}.300`}
      fontSize="sm" fontWeight="700" px={4} py={2} borderRadius="full"
      letterSpacing="0.05em">
      {tier.label}
    </Badge>
  );
}

function TranscriptPreview({ transcript }) {
  const [expanded, setExpanded] = useState(false);
  const preview = transcript.slice(0, 4);
  const shown = expanded ? transcript : preview;

  return (
    <Box bg="gray.900" border="1px solid" borderColor="gray.800" borderRadius="xl" overflow="hidden">
      <HStack justify="space-between" p={4}>
        <Text fontSize="xs" color="gray.400" fontWeight="600" letterSpacing="0.1em" textTransform="uppercase">
          Interview Transcript
        </Text>
        <Badge bg="gray.800" color="gray.500" fontSize="xs" px={2}>{transcript.length} entries</Badge>
      </HStack>
      <Divider borderColor="gray.800" />
      <VStack spacing={0} align="stretch" maxH={expanded ? 'none' : '220px'} overflow="hidden">
        {shown.map((entry, i) => (
          <Box key={i} px={4} py={3} borderBottom="1px solid" borderColor="gray.800"
            bg={entry.role === 'interviewer' ? 'transparent' : 'gray.950'}>
            <HStack spacing={2} mb={1}>
              <Box w="6px" h="6px" borderRadius="full"
                bg={entry.role === 'interviewer' ? 'amber.400' : 'blue.400'} />
              <Text fontSize="10px" color={entry.role === 'interviewer' ? 'amber.500' : 'blue.400'}
                fontWeight="600" textTransform="uppercase" letterSpacing="0.1em">
                {entry.role === 'interviewer' ? 'Alex' : 'You'}
              </Text>
              <Text fontSize="10px" color="gray.700">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.400" lineHeight="1.6">{entry.text}</Text>
          </Box>
        ))}
      </VStack>
      {transcript.length > 4 && (
        <Box p={3} textAlign="center" borderTop="1px solid" borderColor="gray.800">
          <Button size="xs" variant="ghost" color="gray.500" fontWeight="500"
            _hover={{ color: 'gray.300' }} onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Show less' : `Show all ${transcript.length} entries`}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default function Evaluator({ transcript, atsData, onRestart }) {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvaluation();
  }, []);

  const fetchEvaluation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://7g2vm487-3000.inc1.devtunnels.ms/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          jobDescription: atsData.job_title,
          candidateName: atsData.resume?.name,
          atsScore: atsData.ats?.score,
          resumeSummary: {
            skills: atsData.resume?.skills?.technical?.slice(0, 8),
            recentRole: atsData.resume?.experience?.[0]?.title,
            totalYears: atsData.resume?.total_experience_years,
          },
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Evaluation failed');
      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const overallScore = evaluation
    ? +(Object.values(evaluation.scores).reduce((a, b) => a + b, 0) / Object.keys(evaluation.scores).length).toFixed(1)
    : null;

  return (
    <Box minH="100vh" bg="gray.950" p={6} sx={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');`}</style>

      <Box maxW="680px" mx="auto">
        {/* Header */}
        <VStack spacing={1} align="flex-start" mb={8}>
          <Text fontSize="xs" fontWeight="600" letterSpacing="0.2em" color="amber.400" textTransform="uppercase">
            Interview Complete
          </Text>
          <Text fontSize="3xl" color="amber.300" sx={{ fontFamily: "'DM Serif Display', serif" }}>
            Evaluation Report
          </Text>
          {atsData.resume?.name && (
            <Text fontSize="sm" color="gray.500">{atsData.resume.name} · {atsData.job_title}</Text>
          )}
        </VStack>

        {loading ? (
          <Box textAlign="center" py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color="amber.400" thickness="3px" />
              <Text color="gray.500" fontSize="sm">Evaluating your interview…</Text>
              <Text color="gray.700" fontSize="xs">Analysing responses against the job description</Text>
            </VStack>
          </Box>
        ) : error ? (
          <Box bg="rgba(239,68,68,0.08)" border="1px solid" borderColor="red.900" borderRadius="xl" p={6} textAlign="center">
            <Text color="red.400" fontSize="sm" mb={4}>{error}</Text>
            <Button size="sm" onClick={fetchEvaluation} bg="gray.800" color="gray.300" _hover={{ bg: 'gray.700' }}>
              Retry
            </Button>
          </Box>
        ) : evaluation ? (
          <VStack spacing={5} align="stretch">
            {/* Overall score */}
            <Box bg="gray.900" border="1px solid" borderColor="gray.800" borderRadius="xl" p={6} textAlign="center">
              <Text fontSize="xs" color="gray.500" fontWeight="600" letterSpacing="0.15em"
                textTransform="uppercase" mb={3}>Overall Score</Text>
              <HStack justify="center" spacing={4} mb={3}>
                <Text fontSize="5xl" fontWeight="400" color="white"
                  sx={{ fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>
                  {overallScore}
                </Text>
                <Text fontSize="xl" color="gray.600" alignSelf="flex-end" pb={1}>/10</Text>
              </HStack>
              <OverallBadge score={overallScore} />
            </Box>

            {/* Category scores */}
            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
              {SCORE_CATEGORIES.map(cat => (
                <ScoreGauge
                  key={cat.key}
                  value={evaluation.scores[cat.key] ?? 0}
                  label={cat.label}
                  description={cat.description}
                />
              ))}
            </Grid>

            {/* Feedback */}
            {evaluation.feedback && (
              <Box bg="gray.900" border="1px solid" borderColor="gray.800" borderRadius="xl" p={5}>
                <Text fontSize="xs" color="gray.500" fontWeight="600" letterSpacing="0.1em"
                  textTransform="uppercase" mb={3}>Detailed Feedback</Text>
                <Text fontSize="sm" color="gray.700" lineHeight="1.8">{evaluation.feedback}</Text>
              </Box>
            )}

            {/* Strengths & improvements from evaluator */}
            {(evaluation.strengths || evaluation.improvements) && (
              <Grid templateColumns="1fr 1fr" gap={4}>
                {evaluation.strengths && (
                  <Box bg="rgba(34,197,94,0.05)" border="1px solid" borderColor="rgba(34,197,94,0.15)"
                    borderRadius="xl" p={4}>
                    <Text fontSize="xs" color="green.400" fontWeight="600" letterSpacing="0.1em"
                      textTransform="uppercase" mb={3}>Strengths</Text>
                    <VStack spacing={2} align="stretch">
                      {evaluation.strengths.map((s, i) => (
                        <HStack key={i} spacing={2}>
                          <Box w="4px" h="4px" borderRadius="full" bg="green.500" flexShrink={0} mt="6px" />
                          <Text fontSize="xs" color="gray.700" lineHeight="1.5">{s}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
                {evaluation.improvements && (
                  <Box bg="rgba(245,158,11,0.05)" border="1px solid" borderColor="rgba(245,158,11,0.15)"
                    borderRadius="xl" p={4}>
                    <Text fontSize="xs" color="amber.400" fontWeight="600" letterSpacing="0.1em"
                      textTransform="uppercase" mb={3}>To Improve</Text>
                    <VStack spacing={2} align="stretch">
                      {evaluation.improvements.map((s, i) => (
                        <HStack key={i} spacing={2}>
                          <Box w="4px" h="4px" borderRadius="full" bg="amber.400" flexShrink={0} mt="6px" />
                          <Text fontSize="xs" color="gray.700" lineHeight="1.5">{s}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </Grid>
            )}

            {/* Transcript preview */}
            {transcript.length > 0 && <TranscriptPreview transcript={transcript} />}

            {/* Actions */}
            <HStack spacing={3}>
              <Button
                flex="1"
                onClick={onRestart}
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
                Start New Session
              </Button>
              <Button
                flex="1"
                onClick={() => {
                  const blob = new Blob([JSON.stringify({ evaluation, transcript }, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `interview-report-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                bg="gray.800"
                color="gray.300"
                fontWeight="500"
                fontSize="sm"
                size="lg"
                borderRadius="xl"
                _hover={{ bg: 'gray.700' }}
              >
                Export Report
              </Button>
            </HStack>
          </VStack>
        ) : null}
      </Box>
    </Box>
  );
}