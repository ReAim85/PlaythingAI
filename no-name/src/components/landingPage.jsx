import {
  Box, VStack, HStack, Text, Button, Flex, Grid,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Image
} from '@chakra-ui/react';
import image1 from "../assets/1-ss.png"

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const C = {
  bg:         '#ffffff',
  bgOff:      '#f9fafb',
  bgMuted:    '#f3f4f6',
  border:     '#e5e7eb',
  borderMid:  '#d1d5db',
  navy:       '#0f1623',
  navyCard:   '#141d2b',
  heading:    '#0f1623',
  body:       '#374151',
  muted:      '#6b7280',
  dim:        '#9ca3af',
  label:      '#6b7280',
};

// ── Image slot ─────────────────────────────────────────────────────────────────
function ImageSlot({src, label, note, h = '100%', dark = false, radius = '2xl' }) {
  const bg      = dark ? C.navyCard : C.bgMuted;
  const bColor  = dark ? 'rgba(255,255,255,0.08)' : C.borderMid;
  const iconClr = dark ? 'rgba(255,255,255,0.2)' : C.dim;
  const lblClr  = dark ? 'rgba(255,255,255,0.25)' : C.muted;
  const noteClr = dark ? 'rgba(255,255,255,0.15)' : C.dim;

  return (
    
    <Box h={h} w="full" bg={bg} borderRadius={radius}
      border="1px dashed" borderColor={bColor}
      display="flex" flexDir="column" alignItems="center"
      justifyContent="center" gap={3} position="relative" overflow="hidden">
      {[
        { top:'12px', left:'12px', bTop:true, bLeft:true },
        { top:'12px', right:'12px', bTop:true, bRight:true },
        { bottom:'12px', left:'12px', bBot:true, bLeft:true },
        { bottom:'12px', right:'12px', bBot:true, bRight:true },
      ].map((s, i) => (
        <Box key={i} position="absolute"
          top={s.top} bottom={s.bottom} left={s.left} right={s.right}
          w="12px" h="12px"
          borderTop={s.bTop ? `1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : C.navy}` : 'none'}
          borderBottom={s.bBot ? `1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : C.navy}` : 'none'}
          borderLeft={s.bLeft ? `1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : C.navy}` : 'none'}
          borderRight={s.bRight ? `1.5px solid ${dark ? 'rgba(255,255,255,0.2)' : C.navy}` : 'none'}
          opacity={dark ? 1 : 0.2}
        />
      ))}
      <Box w="36px" h="36px" border={`1px solid ${bColor}`} borderRadius="lg"
        display="flex" alignItems="center" justifyContent="center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={iconClr} strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </Box>    
      <VStack spacing={0.5}>
        <Text fontSize="10px" color={lblClr} fontWeight="600"
          letterSpacing="0.12em" textTransform="uppercase"
          sx={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</Text>
        {note && <Text fontSize="10px" color={noteClr}
          sx={{ fontFamily: "'DM Sans', sans-serif" }}>{note}</Text>}
      </VStack>
    </Box>
  );
}

// ── Feature card — white bg, navy left bar, navy number ────────────────────────
function FeatureCard({ num, title, desc, icon }) {
  return (
    <Box bg={C.bg} border="1px solid" borderColor={C.border} borderRadius="xl"
      p={5} position="relative" overflow="hidden"
      transition="box-shadow 0.2s, transform 0.2s"
      _hover={{ boxShadow: '0 4px 20px rgba(15,22,35,0.08)', transform: 'translateY(-2px)' }}>
      <Box position="absolute" left={0} top={0} w="3px" h="full" bg={C.navy} />
      <HStack justify="space-between" align="flex-start" mb={4}>
        <Box bg={C.navy} px={2} py="2px" borderRadius="sm">
          <Text fontSize="10px" fontWeight="700" color="white"
            letterSpacing="0.08em" sx={{ fontFamily: "'DM Sans', sans-serif" }}>
            {num}
          </Text>
        </Box>
        <Box w="24px" h="24px" color={C.dim} flexShrink={0}>{icon}</Box>
      </HStack>
      <Text fontSize="sm" fontWeight="600" color={C.heading} mb={2}
        sx={{ fontFamily: "'DM Sans', sans-serif" }}>{title}</Text>
      <Text fontSize="sm" color={C.muted} lineHeight="1.7"
        sx={{ fontFamily: "'DM Sans', sans-serif" }}>{desc}</Text>
    </Box>
  );
}

function Stat({ value, label }) {
  return (
    <VStack spacing={0}>
      <Text fontSize="xl" fontWeight="400" color={C.heading}
        sx={{ fontFamily: "'DM Serif Display', serif" }}>{value}</Text>
      <Text fontSize="10px" color={C.muted} letterSpacing="0.12em"
        textTransform="uppercase" sx={{ fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </Text>
    </VStack>
  );
}

// Navy button — the primary CTA color throughout
function NavyBtn({ children, onClick, size = 'md', ...props }) {
  const h = size === 'lg' ? '50px' : '42px';
  const px = size === 'lg' ? 8 : 6;
  return (
    <Button onClick={onClick} bg={C.navy} color="white"
      fontWeight="500" fontSize="sm" h={h} px={px} borderRadius="lg"
      _hover={{ bg: C.navyCard, transform: 'translateY(-1px)',
        boxShadow: '0 8px 24px rgba(15,22,35,0.18)' }}
      _active={{ transform: 'translateY(0)' }}
      transition="all 0.2s" {...props}>
      {children}
    </Button>
  );
}

function GhostBtn({ children, onClick, href }) {
  return (
    <Button as={href ? 'a' : 'button'} onClick={onClick} href={href}
      variant="ghost" color={C.muted} fontWeight="400" fontSize="sm"
      h="42px" px={5} borderRadius="lg"
      _hover={{ color: C.heading, bg: C.bgMuted }}
      transition="all 0.2s">
      {children}
    </Button>
  );
}

export default function LandingPage({ onStart }) {
  const features = [
    { num:'01', title:'Deep Resume Parsing',
      desc:'Gemini Vision extracts your full profile into structured JSON — skills, roles, achievements, education, projects.',
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
    { num:'02', title:'Heuristic ATS Scoring',
      desc:'100-point hybrid engine — rule-based keyword matching across 6 dimensions, validated by a Cerebras LLM layer.',
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { num:'03', title:'Structural Feedback',
      desc:'Score below 65? A fixer agent returns a prioritised improvement plan — keywords, section fixes, quick wins.',
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
    { num:'04', title:'Live AI Interview',
      desc:"Karma's questions come from your ATS gaps and the JD. Every question is a deliberate probe, not a warm-up.",
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg> },
    { num:'05', title:'Multi-Agent Orchestration',
      desc:'Parser, scorer, and fixer run in sequence. Each agent receives structured output from the one before.',
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/></svg> },
    { num:'06', title:'Evaluation Report',
      desc:'Cerebras scores your interview across 5 dimensions — technical knowledge, JD relevance, domain expertise, soft skills, accomplishments.',
      icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  ];

  const faqs = [
    { q:"How is this different from static Q&A practice apps?",
      a:"Karma doesn't pull from a question bank. His prompt is generated from your actual resume gaps and the specific JD you're targeting — every question is intentional." },
    { q:"How accurate is the ATS score?",
      a:"Six weighted dimensions mirror real recruiter logic — keyword match (35pts), experience (20pts), skills (20pts), education (10pts), completeness (10pts), achievements (5pts). A Cerebras LLM then adjusts ±5 for context rules miss." },
    { q:"What happens if my score is below 65?",
      a:"A dedicated fixer agent runs automatically and returns a structured improvement plan ranked by impact — keywords to add, section-by-section suggestions, and quick wins." },
    { q:"What file types does the parser support?",
      a:"PDF, JPG, PNG, and WEBP up to 10MB. Gemini Vision handles all formats natively." },
    { q:"Can I use a custom job description?",
      a:"Yes — paste any JD and give it a title, or pick from four predefined roles: Software Engineer, Data Scientist, Product Manager, or UX Designer." },
  ];

  return (
    <Box bg={C.bg} color={C.heading} minH="100vh"
      sx={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FONTS}</style>
      <style>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bgOff}; }
        ::-webkit-scrollbar-thumb { background: ${C.borderMid}; border-radius: 2px; }
      `}</style>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <Box as="nav" position="sticky" top={0} zIndex={100}
        bg={`${C.bg}F0`} backdropFilter="blur(16px)"
        borderBottom="1px solid" borderColor={C.border}
        px={{ base: 5, md: 10 }} py={4}>
        <Flex align="center" justify="space-between" maxW="1100px" mx="auto">
          <HStack spacing={2}>
            <Box w="28px" h="28px" bg={C.navy} borderRadius="8px"
              display="flex" alignItems="center" justifyContent="center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              </svg>
            </Box>
            <Text fontSize="md" fontWeight="600" color={C.heading}>
              Plaything<Text as="span" color={C.muted}>.AI</Text>
            </Text>
          </HStack>

          <HStack spacing={8} display={{ base:'none', md:'flex' }}>
            {[['Features','#features'],['How it works','#how-it-works'],['FAQ','#faq']].map(([l,h]) => (
              <Text key={l} as="a" href={h} fontSize="sm" color={C.muted}
                cursor="pointer" _hover={{ color: C.heading }} transition="color 0.15s">
                {l}
              </Text>
            ))}
          </HStack>

          <NavyBtn onClick={onStart}>Try Free</NavyBtn>
        </Flex>
      </Box>

      {/* Sponsor strip */}
      <Box bg={C.bgOff} borderBottom="1px solid" borderColor={C.border} py={2}>
        <Flex justify="center" align="center" gap={2}>
          <Text fontSize="11px" color={C.dim}>Built at</Text>
          <Box px={2} py="1px" bg="rgba(180,220,0,0.12)"
            border="1px solid" borderColor="rgba(100,130,0,0.2)" borderRadius="sm">
            <Text fontSize="10px" fontWeight="700" color="#5a7a00"
              letterSpacing="0.12em">TRAE HACKATHON</Text>
          </Box>
        </Flex>
      </Box>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Box as="section" pt={{ base:16, md:24 }} pb={{ base:12, md:20 }}
        px={{ base:5, md:10 }}>
        <Box maxW="1100px" mx="auto">
          <Grid templateColumns={{ base:'1fr', lg:'1fr 1fr' }}
            gap={{ base:12, lg:16 }} alignItems="center">
            <VStack align="flex-start" spacing={7}>
              {/* Exact "PLAYTHING AI" label style */}
              <Text fontSize="xs" fontWeight="600" color={C.label}
                letterSpacing="0.2em" textTransform="uppercase">
                Plaything AI
              </Text>

              <Text fontSize={{ base:'36px', md:'48px', lg:'52px' }}
                fontWeight="400" color={C.heading} lineHeight="1.1"
                sx={{ fontFamily:"'DM Serif Display', serif" }}>
                Ace your next interview with an AI that knows the JD cold.
              </Text>

              {/* Matches "We'll parse it, score it..." subtitle style */}
              <Text fontSize="md" color={C.muted} lineHeight="1.8" maxW="460px">
                Upload your resume. Get your ATS score. Fix the gaps.
                Then practice with Karma — an AI interviewer built directly
                from your profile and the role you're targeting.
              </Text>

              <HStack spacing={8} pt={3}
                borderTop="1px solid" borderColor={C.border} w="full">
                <Stat value="100pt" label="ATS engine" />
                <Box w="1px" h="30px" bg={C.border} />
                <Stat value="3" label="AI agents" />
                <Box w="1px" h="30px" bg={C.border} />
                <Stat value="5" label="eval scores" />
              </HStack>

              <HStack spacing={3} flexWrap="wrap">
                <NavyBtn onClick={onStart} size="lg">
                  Analyse My Resume →
                </NavyBtn>
                <GhostBtn href="#how-it-works">See how it works</GhostBtn>
              </HStack>
            </VStack>

            <Box h={{ base:'300px', lg:'420px' }}>
              {/* ↓↓ Replace with your app screenshot ↓↓ */}
              <ImageSlot src={image1} label="Hero screenshot"
                note="Upload or ATS result screen · 900×640px" h="100%" />
            </Box>
          </Grid>
        </Box>
      </Box>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <Box as="section" id="features"
        py={{ base:16, md:24 }} px={{ base:5, md:10 }}
        bg={C.bgOff} borderTop="1px solid" borderColor={C.border}>
        <Box maxW="1100px" mx="auto">
          <VStack spacing={2} mb={14} align="flex-start">
            <Text fontSize="xs" fontWeight="600" color={C.label}
              letterSpacing="0.2em" textTransform="uppercase">
              What's inside
            </Text>
            <Text fontSize={{ base:'2xl', md:'36px' }} fontWeight="400"
              color={C.heading} sx={{ fontFamily:"'DM Serif Display', serif" }}>
              From upload to offer-ready
            </Text>
            <Text fontSize="sm" color={C.muted} maxW="460px" lineHeight="1.7">
              Six components, three AI models, one pipeline that mirrors
              what real recruiters actually do.
            </Text>
          </VStack>
          <Grid templateColumns={{ base:'1fr', md:'repeat(2,1fr)', lg:'repeat(3,1fr)' }} gap={4}>
            {features.map(f => <FeatureCard key={f.num} {...f} />)}
          </Grid>
        </Box>
      </Box>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <Box as="section" id="how-it-works"
        py={{ base:16, md:24 }} px={{ base:5, md:10 }} bg={C.bg}>
        <Box maxW="1100px" mx="auto">
          <Grid templateColumns={{ base:'1fr', lg:'1fr 1fr' }}
            gap={{ base:12, lg:16 }} alignItems="center">
            <Box h={{ base:'280px', lg:'460px' }} order={{ base:2, lg:1 }}>
              {/* ↓↓ Replace with pipeline diagram ↓↓ */}
              <ImageSlot label="Pipeline diagram / demo"
                note="Architecture overview or screen recording" h="100%" />
            </Box>
            <VStack align="flex-start" spacing={8} order={{ base:1, lg:2 }}>
              <VStack align="flex-start" spacing={2}>
                <Text fontSize="xs" fontWeight="600" color={C.label}
                  letterSpacing="0.2em" textTransform="uppercase">
                  How it works
                </Text>
                <Text fontSize={{ base:'2xl', md:'34px' }} fontWeight="400"
                  color={C.heading} sx={{ fontFamily:"'DM Serif Display', serif" }}>
                  Three agents, one pipeline
                </Text>
              </VStack>
              <VStack spacing={5} align="stretch">
                {[
                  { step:'01', title:'Upload & Parse',
                    desc:'Gemini Vision extracts your full profile into structured JSON — name, skills, roles, achievements.' },
                  { step:'02', title:'Score & Fix',
                    desc:'The ATS engine scores your fit out of 100. Below 65, a fixer agent generates your improvement plan.' },
                  { step:'03', title:'Interview & Evaluate',
                    desc:'Karma interviews you by voice, probing the exact gaps flagged. Cerebras scores across 5 dimensions.' },
                ].map((s,i) => (
                  <HStack key={i} spacing={4} align="flex-start">
                    {/* Navy step badge — same as active toggle in screenshot */}
                    <Box flexShrink={0} w="36px" h="36px" bg={C.navy}
                      borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                      <Text fontSize="10px" fontWeight="700" color="white">{s.step}</Text>
                    </Box>
                    <VStack align="flex-start" spacing={0.5}>
                      <Text fontSize="sm" fontWeight="600" color={C.heading}>{s.title}</Text>
                      <Text fontSize="sm" color={C.muted} lineHeight="1.7">{s.desc}</Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
              <NavyBtn onClick={onStart} size="lg">Start Your Session</NavyBtn>
            </VStack>
          </Grid>
        </Box>
      </Box>

      {/* ── Karma section — navy card ───────────────────────────────────────── */}
      <Box py={{ base:16, md:24 }} px={{ base:5, md:10 }}
        bg={C.bgOff} borderTop="1px solid" borderColor={C.border}>
        <Box maxW="1100px" mx="auto">
          {/* Navy card — same as the drop zone in UploadResume */}
          <Box bg={C.navy} borderRadius="2xl" overflow="hidden">
            <Grid templateColumns={{ base:'1fr', lg:'1fr 1fr' }}>
              <Box h={{ base:'260px', lg:'400px' }} position="relative">
                {/* ↓↓ Replace with Interviewer UI screenshot ↓↓ */}
                <ImageSlot label="Karma interviewer UI"
                  note="Live call screen" h="100%" dark radius="none" />
                <HStack position="absolute" top={5} left={5} spacing={2}
                  bg="rgba(255,255,255,0.07)"
                  border="1px solid rgba(255,255,255,0.12)"
                  px={3} py={1.5} borderRadius="full">
                  <Box w="5px" h="5px" bg="#4ade80" borderRadius="full" />
                  <Text fontSize="10px" fontWeight="600"
                    color="rgba(255,255,255,0.6)"
                    letterSpacing="0.1em" textTransform="uppercase">
                    Live Session
                  </Text>
                </HStack>
              </Box>

              <VStack align="flex-start" justify="center" spacing={6}
                p={{ base:8, lg:12 }}>
                <Text fontSize="xs" fontWeight="600"
                  color="rgba(255,255,255,0.4)"
                  letterSpacing="0.2em" textTransform="uppercase">
                  Meet your interviewer
                </Text>
                <Text fontSize={{ base:'2xl', md:'30px' }} fontWeight="400"
                  color="white" lineHeight="1.25"
                  sx={{ fontFamily:"'DM Serif Display', serif" }}>
                  Karma knows your resume — and where it falls short.
                </Text>
                <Text fontSize="sm" color="rgba(255,255,255,0.5)" lineHeight="1.8">
                  Karma's prompt is built from your ATS gaps and the JD keywords
                  you're missing. Every question is a deliberate probe —
                  not a generic warm-up.
                </Text>
                <VStack align="flex-start" spacing={3}>
                  {[
                    'Real-time voice — no typing, no scripts',
                    'Questions targeting your exact resume gaps',
                    'Post-session scores across 5 dimensions',
                  ].map((b,i) => (
                    <HStack key={i} spacing={3}>
                      <Box w="16px" h="16px" flexShrink={0}
                        bg="rgba(255,255,255,0.08)" borderRadius="sm"
                        display="flex" alignItems="center" justifyContent="center">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                          stroke="rgba(255,255,255,0.55)" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </Box>
                      <Text fontSize="sm" color="rgba(255,255,255,0.55)">{b}</Text>
                    </HStack>
                  ))}
                </VStack>
                <Button onClick={onStart} bg="white" color={C.navy}
                  fontWeight="600" fontSize="sm" h="44px" px={7} borderRadius="lg"
                  _hover={{ bg: C.bgOff, transform:'translateY(-1px)' }}
                  transition="all 0.2s">
                  Start Interview
                </Button>
              </VStack>
            </Grid>
          </Box>
        </Box>
      </Box>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <Box as="section" id="faq"
        py={{ base:16, md:24 }} px={{ base:5, md:10 }} bg={C.bg}>
        <Box maxW="720px" mx="auto">
          <VStack spacing={2} mb={12} align="flex-start">
            <Text fontSize="xs" fontWeight="600" color={C.label}
              letterSpacing="0.2em" textTransform="uppercase">FAQ</Text>
            <Text fontSize={{ base:'2xl', md:'36px' }} fontWeight="400"
              color={C.heading} sx={{ fontFamily:"'DM Serif Display', serif" }}>
              Common questions
            </Text>
          </VStack>
          <Accordion allowToggle>
            {faqs.map((item,i) => (
              <AccordionItem key={i} border="none" mb={3}>
                {({ isExpanded }) => (
                  <Box bg={C.bgOff}
                    border="1px solid"
                    borderColor={isExpanded ? C.borderMid : C.border}
                    borderRadius="xl" overflow="hidden" transition="border-color 0.2s">
                    <AccordionButton py={5} px={6}
                      _hover={{ bg: C.bgMuted }} transition="background 0.15s">
                      <Box flex="1" textAlign="left">
                        <Text fontSize="sm" fontWeight="500"
                          color={isExpanded ? C.heading : C.muted}
                          transition="color 0.15s">{item.q}</Text>
                      </Box>
                      <Box w="22px" h="22px" flexShrink={0} ml={4}
                        bg={C.border} borderRadius="full"
                        display="flex" alignItems="center" justifyContent="center">
                        <AccordionIcon color={C.muted} boxSize={3.5} />
                      </Box>
                    </AccordionButton>
                    <AccordionPanel px={6} pb={5}>
                      <Text fontSize="sm" color={C.muted} lineHeight="1.8">{item.a}</Text>
                    </AccordionPanel>
                  </Box>
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      </Box>

      {/* ── CTA — navy card ───────────────────────────────────────────────── */}
      <Box px={{ base:5, md:10 }} py={{ base:16, md:24 }}
        bg={C.bgOff} borderTop="1px solid" borderColor={C.border}>
        <Box maxW="1100px" mx="auto">
          <Box bg={C.navy} borderRadius="2xl"
            p={{ base:10, md:14 }} textAlign="center">
            <VStack spacing={6}>
              <Text fontSize={{ base:'2xl', md:'40px' }} fontWeight="400"
                color="white" lineHeight="1.2"
                sx={{ fontFamily:"'DM Serif Display', serif" }}>
                Ready to walk in prepared?
              </Text>
              <Text fontSize="md" color="rgba(255,255,255,0.5)"
                maxW="400px" lineHeight="1.7">
                Upload your resume and get your ATS score in under 30 seconds.
                No account needed.
              </Text>
              <Button onClick={onStart} bg="white" color={C.navy}
                fontWeight="600" fontSize="sm"
                h="50px" px={10} borderRadius="lg"
                _hover={{ bg: C.bgOff, transform:'translateY(-1px)',
                  boxShadow:'0 8px 24px rgba(0,0,0,0.25)' }}
                _active={{ transform:'translateY(0)' }}
                transition="all 0.2s">
                Get Started Free →
              </Button>
            </VStack>
          </Box>
        </Box>
      </Box>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <Box borderTop="1px solid" borderColor={C.border}
        bg={C.bg} px={{ base:5, md:10 }} py={8}>
        <Flex maxW="1100px" mx="auto" align="center" justify="space-between"
          direction={{ base:'column', md:'row' }} gap={4}>
          <HStack spacing={2}>
            <Box w="22px" h="22px" bg={C.navy} borderRadius="6px"
              display="flex" alignItems="center" justifyContent="center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              </svg>
            </Box>
            <Text fontSize="sm" color={C.muted}>
              Plaything<Text as="span" color={C.heading}>.AI</Text>
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Text fontSize="xs" color={C.dim}>Built at</Text>
            <Box px={2} py="1px" bg="rgba(180,220,0,0.12)"
              border="1px solid" borderColor="rgba(100,130,0,0.2)" borderRadius="sm">
              <Text fontSize="10px" fontWeight="700" color="#5a7a00"
                letterSpacing="0.12em">TRAE HACKATHON</Text>
            </Box>
          </HStack>
          <Text fontSize="xs" color={C.dim}>
            Gemini Vision · Cerebras Llama · Google Live API
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}