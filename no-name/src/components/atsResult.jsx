/*
 * Copyright (C) 2026 Vishal Jha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
// components/AtsResult.jsx
import { useState } from 'react';
import {
  Box, VStack, HStack, Text, Button, Badge, Grid, GridItem,
  Collapse, Divider, CircularProgress, CircularProgressLabel,
} from '@chakra-ui/react';

const ChevronIcon = ({ isOpen }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

function ScoreRing({ score }) {
  const color = score >= 65 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444';
  const label = score >= 65 ? 'Good Fit' : score >= 45 ? 'Moderate' : 'Needs Work';
  return (
    <VStack spacing={1}>
      <CircularProgress value={score} size="120px" thickness="6px" color={color} trackColor="gray.800">
        <CircularProgressLabel>
          <Text fontSize="2xl" fontWeight="700" color="black"
            sx={{ fontFamily: "'DM Serif Display', serif" }}>{score}</Text>
        </CircularProgressLabel>
      </CircularProgress>
      <Badge
        bg={score >= 65 ? 'green.900' : score >= 45 ? 'amber.900' : 'red.900'}
        color={score >= 65 ? 'green.300' : score >= 45 ? 'amber.300' : 'red.300'}
        fontSize="xs" fontWeight="600" letterSpacing="0.1em" px={3} py={1} borderRadius="full">
        {label}
      </Badge>
    </VStack>
  );
}

function ScoreBar({ label, score, max }) {
  const pct = Math.round((score / max) * 100);
  return (
    <VStack spacing={1} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="xs" color="gray.400" fontWeight="500" textTransform="capitalize">{label}</Text>
        <Text fontSize="xs" color="gray.500">{score}/{max}</Text>
      </HStack>
      <Box h="4px" bg="gray.800" borderRadius="full" overflow="hidden">
        <Box h="full" w={`${pct}%`} bg={pct >= 70 ? 'green.500' : pct >= 45 ? 'amber.400' : 'red.500'}
          borderRadius="full" transition="width 1s ease" />
      </Box>
    </VStack>
  );
}

function KeywordPill({ word, matched }) {
  return (
    <Badge
      bg={matched ? 'rgba(34,197,94,0.1)' : 'gray.800'}
      color={matched ? 'green.400' : 'gray.500'}
      border="1px solid"
      borderColor={matched ? 'rgba(34,197,94,0.3)' : 'gray.700'}
      fontSize="xs" fontWeight="500" px={2} py="3px" borderRadius="md">
      {matched && <Box as="span" mr={1} verticalAlign="middle" display="inline-block" color="green.400"><CheckIcon /></Box>}
      {word}
    </Badge>
  );
}

function ImprovementCard({ action, index }) {
  const impactColor = { high: 'red.400', medium: 'amber.400', low: 'blue.400' };
  return (
    <Box bg="gray.900" border="1px solid" borderColor="gray.800" borderRadius="lg" p={4}>
      <HStack justify="space-between" mb={2}>
        <HStack spacing={2}>
          <Box w="20px" h="20px" bg="gray.800" borderRadius="full" display="flex"
            alignItems="center" justifyContent="center">
            <Text fontSize="10px" color="gray.400" fontWeight="700">{index + 1}</Text>
          </Box>
          <Badge bg="gray.800" color="gray.400" fontSize="10px" letterSpacing="0.1em"
            textTransform="uppercase" px={2} py="2px">{action.category}</Badge>
        </HStack>
        <HStack spacing={1}>
          <Box w="6px" h="6px" borderRadius="full" bg={impactColor[action.impact] || 'gray.500'} />
          <Text fontSize="10px" color="gray.500" textTransform="capitalize">{action.impact} impact</Text>
        </HStack>
      </HStack>
      <Text fontSize="sm" color="gray.300" fontWeight="400" lineHeight="1.6">{action.action}</Text>
    </Box>
  );
}

export default function AtsResult({ data, onStartInterview }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);
  const { ats, resume, job_title, improvements } = data;
  const score = ats.score;

  return (
    <Box minH="100vh" bg="gray.950" p={6} sx={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');`}</style>

      <Box maxW="680px" mx="auto">
        {/* Header */}
        <HStack justify="space-between" mb={8} align="flex-start">
          <VStack spacing={0} align="flex-start">
            <Text fontSize="xs" fontWeight="600" letterSpacing="0.2em" color="amber.400"
              textTransform="uppercase">ATS Analysis</Text>
            <Text fontSize="2xl" color="amber.800" sx={{ fontFamily: "'DM Serif Display', serif" }}>
              {resume.name}
            </Text>
            <Text fontSize="sm" color="gray.700">{job_title}</Text>
          </VStack>
          <ScoreRing score={score} />
        </HStack>

        <VStack spacing={4} align="stretch">
          {/* Role fit summary */}
          {ats.role_fit_summary && (
            <Box bg="gray.900" border="1px solid" borderColor="gray.800" borderRadius="xl" p={5}>
              <Text fontSize="xs" color="gray.500" fontWeight="600" letterSpacing="0.1em"
                textTransform="uppercase" mb={2}>Role Fit</Text>
              <Text fontSize="sm" color="gray.300" lineHeight="1.7">{ats.role_fit_summary}</Text>
            </Box>
          )}

          {/* Strengths & Gaps */}
          <Grid templateColumns="1fr 1fr" gap={4}>
            <Box bg="rgba(34,197,94,0.05)" border="1px solid" borderColor="rgba(34,197,94,0.15)"
              borderRadius="xl" p={4}>
              <Text fontSize="xs" color="green.400" fontWeight="600" letterSpacing="0.1em"
                textTransform="uppercase" mb={3}>Strengths</Text>
              <VStack spacing={2} align="stretch">
                {(ats.top_strengths || []).map((s, i) => (
                  <HStack key={i} spacing={2}>
                    <Box color="green.500" flexShrink={0}><CheckIcon /></Box>
                    <Text fontSize="xs" color="gray.600">{s}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Box bg="rgba(239,68,68,0.05)" border="1px solid" borderColor="rgba(239,68,68,0.15)"
              borderRadius="xl" p={4}>
              <Text fontSize="xs" color="red.400" fontWeight="600" letterSpacing="0.1em"
                textTransform="uppercase" mb={3}>Gaps</Text>
              <VStack spacing={2} align="stretch">
                {(ats.critical_gaps || []).map((g, i) => (
                  <HStack key={i} spacing={2}>
                    <Box color="red.500" flexShrink={0}><ArrowIcon /></Box>
                    <Text fontSize="xs" color="gray.600">{g}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </Grid>

          {/* Score breakdown collapsible */}
          <Box bg="gray.900" border="1px solid" borderColor="gray.800" borderRadius="xl" overflow="hidden">
            <HStack justify="space-between" p={4} cursor="pointer" onClick={() => setShowBreakdown(!showBreakdown)}
              _hover={{ bg: 'gray.800' }} transition="background 0.15s">
              <Text fontSize="xs" color="gray.400" fontWeight="600" letterSpacing="0.1em" textTransform="uppercase">
                Score Breakdown
              </Text>
              <Box color="gray.500"><ChevronIcon isOpen={showBreakdown} /></Box>
            </HStack>
            <Collapse in={showBreakdown}>
              <Box px={4} pb={4}>
                <Divider borderColor="gray.800" mb={4} />
                <VStack spacing={3} align="stretch">
                  {Object.entries(ats.heuristic_breakdown || {}).map(([key, val]) => (
                    <ScoreBar key={key} label={key} score={val.score} max={val.max} />
                  ))}
                </VStack>
              </Box>
            </Collapse>
          </Box>

          {/* Keywords collapsible */}
          <Box bg="gray.900" border="1px solid" borderColor="gray.800" borderRadius="xl" overflow="hidden">
            <HStack justify="space-between" p={4} cursor="pointer" onClick={() => setShowKeywords(!showKeywords)}
              _hover={{ bg: 'gray.800' }} transition="background 0.15s">
              <HStack spacing={3}>
                <Text fontSize="xs" color="gray.400" fontWeight="600" letterSpacing="0.1em" textTransform="uppercase">
                  Keywords
                </Text>
                <Badge bg="green.900" color="green.300" fontSize="10px" px={2} borderRadius="full">
                  {(ats.matched_keywords || []).length} matched
                </Badge>
                <Badge bg="red.900" color="red.300" fontSize="10px" px={2} borderRadius="full">
                  {(ats.missing_keywords || []).length} missing
                </Badge>
              </HStack>
              <Box color="gray.500"><ChevronIcon isOpen={showKeywords} /></Box>
            </HStack>
            <Collapse in={showKeywords}>
              <Box px={4} pb={4}>
                <Divider borderColor="gray.800" mb={4} />
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="10px" color="green.500" fontWeight="600" letterSpacing="0.15em"
                      textTransform="uppercase" mb={2}>Matched</Text>
                    <HStack flexWrap="wrap" gap={2}>
                      {(ats.matched_keywords || []).map(k => <KeywordPill key={k} word={k} matched />)}
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="10px" color="red.500" fontWeight="600" letterSpacing="0.15em"
                      textTransform="uppercase" mb={2}>Missing</Text>
                    <HStack flexWrap="wrap" gap={2}>
                      {(ats.missing_keywords || []).map(k => <KeywordPill key={k} word={k} matched={false} />)}
                    </HStack>
                  </Box>
                </VStack>
              </Box>
            </Collapse>
          </Box>

          {/* Improvements (only if score < 65) */}
          {improvements && (
            <Box bg="gray.900" border="1px solid" borderColor="amber.900" borderRadius="xl" p={5}>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="xs" color="gray.400" fontWeight="600" letterSpacing="0.1em"
                  textTransform="uppercase">Improvement Plan</Text>
                {improvements.estimated_score_after_improvements && (
                  <Badge bg="amber.900" color="gray.400" fontSize="xs" px={3} py={1} borderRadius="full">
                    Est. score after: {improvements.estimated_score_after_improvements}
                  </Badge>
                )}
              </HStack>
              {improvements.overall_recommendation && (
                <Text fontSize="sm" color="gray.300" lineHeight="1.7" mb={4}>
                  {improvements.overall_recommendation}
                </Text>
              )}
              <VStack spacing={3} align="stretch">
                {(improvements.priority_actions || []).map((action, i) => (
                  <ImprovementCard key={i} action={action} index={i} />
                ))}
              </VStack>
              {(improvements.quick_wins || []).length > 0 && (
                <Box mt={4} p={4} bg="gray.800" borderRadius="lg">
                  <Text fontSize="xs" color="gray.400" fontWeight="600" letterSpacing="0.1em"
                    textTransform="uppercase" mb={2}>Quick Wins</Text>
                  <VStack spacing={2} align="stretch">
                    {improvements.quick_wins.map((w, i) => (
                      <HStack key={i} spacing={2}>
                        <Box color="amber.400" flexShrink={0}><ArrowIcon /></Box>
                        <Text fontSize="xs" color="gray.300">{w}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </Box>
          )}

          {/* CTA */}
          <Button
            onClick={() => onStartInterview(data)}
            bg="amber.400"
            color="gray.900"
            fontWeight="600"
            fontSize="sm"
            letterSpacing="0.05em"
            size="lg"
            borderRadius="xl"
            _hover={{ bg: 'amber.300', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(251,191,36,0.25)' }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.2s"
          >
            {score >= 65 ? 'Start Interview →' : 'Start Interview Anyway →'}
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
