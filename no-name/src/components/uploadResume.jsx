/*
 * Copyright (C) 2026 Vishal Jha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
// components/UploadResume.jsx
import { useState, useRef } from 'react';
import {
  Box, VStack, HStack, Text, Button, Select, Textarea,
  Input, Icon, Badge, Spinner, useToast,
} from '@chakra-ui/react';

const JD_OPTIONS = [
  { key: 'software_engineer', label: 'Software Engineer' },
  { key: 'data_scientist', label: 'Data Scientist' },
  { key: 'product_manager', label: 'Product Manager' },
  { key: 'ux_designer', label: 'UX / UI Designer' },
];

// ── Icons (inline SVG to avoid extra deps) ────────────────────────────────────
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function UploadResume({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jdMode, setJdMode] = useState('predefined'); // predefined | custom
  const [jdKey, setJdKey] = useState('software_engineer');
  const [jdText, setJdText] = useState('');
  const [jdTitle, setJdTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) {
      toast({ title: 'Invalid file type', description: 'Upload a PDF or image (jpg, png, webp)', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max file size is 10MB', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please upload your resume first', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (jdMode === 'custom' && !jdText.trim()) {
      toast({ title: 'Job description required', description: 'Paste a job description or switch to predefined', status: 'warning', duration: 3000, isClosable: true });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jdMode === 'predefined') {
        formData.append('jd_key', jdKey);
      } else {
        formData.append('jd_text', jdText);
        if (jdTitle) formData.append('jd_title', jdTitle);
      }

      const res = await fetch('https://fs6h4ks7-3000.inc1.devtunnels.ms/api/resume/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }
      const data = await res.json();
      onAnalysisComplete(data);
    } catch (err) {
      toast({ title: 'Analysis failed', description: err.message, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.950" display="flex" alignItems="center" justifyContent="center" p={6}
      sx={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');`}</style>

      <Box w="full" maxW="560px">
        {/* Header */}
        <VStack spacing={1} mb={10} align="flex-start">
          <Text fontSize="xs" fontWeight="600" letterSpacing="0.2em" color="amber.400"
            textTransform="uppercase" sx={{ fontFamily: "'DM Sans', sans-serif" }}>
            PLAYTHING AI
          </Text>
          <Text fontSize="3xl" fontWeight="400" color="amber"
            sx={{ fontFamily: "'DM Serif Display', serif", lineHeight: 1.2 }}>
            Upload Your Resume
          </Text>
          <Text fontSize="sm" color="gray.600" fontWeight="300">
            We'll parse it, score it against the JD, and get you ready.
          </Text>
        </VStack>

        <VStack spacing={5} align="stretch">
          {/* Drop zone */}
          <Box
            border="1px dashed"
            borderColor={isDragging ? 'amber.400' : file ? 'green.500' : 'gray.700'}
            borderRadius="xl"
            bg={isDragging ? 'rgba(251,191,36,0.04)' : 'gray.900'}
            p={8}
            textAlign="center"
            cursor="pointer"
            transition="all 0.2s"
            onClick={() => !file && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            _hover={{ borderColor: file ? 'green.500' : 'gray.500', bg: 'gray.900' }}
          >
            <input ref={fileInputRef} type="file" hidden accept=".pdf,image/*"
              onChange={e => handleFile(e.target.files[0])} />

            {file ? (
              <HStack justify="center" spacing={3}>
                <Box color="green.400"><FileIcon /></Box>
                <VStack spacing={0} align="flex-start">
                  <Text color="white" fontSize="sm" fontWeight="500" noOfLines={1} maxW="280px">{file.name}</Text>
                  <Text color="gray.500" fontSize="xs">{(file.size / 1024).toFixed(1)} KB</Text>
                </VStack>
                <Box
                  as="button"
                  color="gray.500"
                  _hover={{ color: 'red.400' }}
                  transition="color 0.15s"
                  ml={2}
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                >
                  <XIcon />
                </Box>
              </HStack>
            ) : (
              <VStack spacing={3}>
                <Box color={isDragging ? 'amber.400' : 'gray.600'} transition="color 0.2s">
                  <UploadIcon />
                </Box>
                <VStack spacing={1}>
                  <Text color="gray.300" fontSize="sm" fontWeight="500">
                    Drop your resume here
                  </Text>
                  <Text color="gray.600" fontSize="xs">
                    PDF, JPG, PNG, WEBP · Max 10MB
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="gray.700"
                  color="gray.400"
                  _hover={{ borderColor: 'amber.400', color: 'amber.400' }}
                  fontWeight="400"
                  fontSize="xs"
                  letterSpacing="0.05em"
                  onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  Browse files
                </Button>
              </VStack>
            )}
          </Box>

          {/* JD Mode toggle */}
          <Box>
            <Text fontSize="xs" color="gray.800" fontWeight="500" letterSpacing="0.1em"
              textTransform="uppercase" mb={3}>
              Job Description
            </Text>
            <HStack spacing={2} mb={4}>
              {['predefined', 'custom'].map(mode => (
                <Button
                  key={mode}
                  size="sm"
                  onClick={() => setJdMode(mode)}
                  bg={jdMode === mode ? 'amber.400' : 'gray.800'}
                  color={jdMode === mode ? 'gray.900' : 'white'}
                  fontWeight={jdMode === mode ? '600' : '400'}
                  fontSize="xs"
                  letterSpacing="0.05em"
                  _hover={{ bg: jdMode === mode ? 'amber.300' : 'gray.700' }}
                  borderRadius="md"
                  textTransform="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </HStack>

            {jdMode === 'predefined' ? (
              <Select
                value={jdKey}
                onChange={e => setJdKey(e.target.value)}
                bg="gray.900"
                border="1px solid"
                borderColor="gray.700"
                color="white"
                fontSize="sm"
                _hover={{ borderColor: 'gray.500' }}
                _focus={{ borderColor: 'amber.400', boxShadow: '0 0 0 1px #fbbf24' }}
                size="md"
              >
                {JD_OPTIONS.map(o => (
                  <option key={o.key} value={o.key} style={{ background: '#111827' }}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : (
              <VStack spacing={3}>
                <Input
                  placeholder="Role title (e.g. Backend Engineer at Stripe)"
                  value={jdTitle}
                  onChange={e => setJdTitle(e.target.value)}
                  bg="gray.900"
                  border="1px solid"
                  borderColor="gray.700"
                  color="white"
                  fontSize="sm"
                  _placeholder={{ color: 'gray.600' }}
                  _hover={{ borderColor: 'gray.500' }}
                  _focus={{ borderColor: 'amber.400', boxShadow: '0 0 0 1px #fbbf24' }}
                />
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  bg="gray.900"
                  border="1px solid"
                  borderColor="gray.700"
                  color="white"
                  fontSize="sm"
                  rows={6}
                  resize="vertical"
                  _placeholder={{ color: 'gray.600' }}
                  _hover={{ borderColor: 'gray.500' }}
                  _focus={{ borderColor: 'amber.400', boxShadow: '0 0 0 1px #fbbf24' }}
                />
              </VStack>
            )}
          </Box>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Analysing…"
            spinner={<Spinner size="sm" color="gray.900" />}
            bg="amber.700"
            color="black"
            fontWeight="600"
            fontSize="sm"
            letterSpacing="0.05em"
            size="lg"
            borderRadius="xl"
            _hover={{ bg: 'amber.700', transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(251,191,36,0.25)' }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.2s"
            isDisabled={!file || loading}
          >
            Analyse Resume
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
