/*
 * Copyright (C) 2026 Vishal Jha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { useState } from 'react';
import LandingPage from './components/landingPage';
import UploadResume from './components/uploadResume';
import AtsResult from './components/atsResult';
import Interviewer from './components/Interviewer';
import Evaluator from './components/evaluator';

const GEMINI_API_KEY = "Your Api key here";

export default function App() {
  const [screen, setScreen] = useState('home'); 
  const [atsData, setAtsData] = useState(null);
  const [transcript, setTranscript] = useState([]);

  const handleGetStarted = () => setScreen('upload');
  const handleAnalysisComplete = (data) => { setAtsData(data); setScreen('ats'); };
  const handleStartInterview = (data) => { setAtsData(data); setScreen('interview'); };
  
  const handleInterviewEnd = (alexTranscript, data) => {
    setTranscript(alexTranscript);
    setAtsData(data);
    setScreen('evaluation');
  };
  
  const handleRestart = () => { setAtsData(null); setTranscript([]); setScreen('upload'); };

  return (
    <>
      {screen === 'home' && <LandingPage onStart={handleGetStarted} />}

      {screen === 'upload' && <UploadResume onAnalysisComplete={handleAnalysisComplete} />}
      
      {screen === 'ats' && atsData && (
        <AtsResult data={atsData} onStartInterview={handleStartInterview} />
      )}
      
      {screen === 'interview' && atsData && (
        <Interviewer 
          atsData={atsData} 
          apiKey={GEMINI_API_KEY} 
          onInterviewEnd={handleInterviewEnd} 
        />
      )}
      
      {screen === 'evaluation' && atsData && (
        <Evaluator 
          transcript={transcript} 
          atsData={atsData} 
          onRestart={handleRestart} 
        />
      )}
    </>
  );
}
