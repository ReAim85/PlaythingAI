import { useState } from 'react';
import UploadResume from './components/uploadResume';
import AtsResult from './components/atsResult';
import Interviewer from './components/Interviewer';
import Evaluator from './components/evaluator';
import 'dotenv';

const GEMINI_API_KEY = "AIzaSyB4MjfoJcv6xYsKr4LMUYh902ThhVnDFT0";

export default function App() {
  const [screen, setScreen] = useState('upload');
  const [atsData, setAtsData] = useState(null);
  const [transcript, setTranscript] = useState([]);

  const handleAnalysisComplete = (data) => { setAtsData(data); setScreen('ats'); };
  const handleStartInterview = (data) => { setAtsData(data); setScreen('interview'); };
const handleInterviewEnd = (alexTranscript, data) => {
  setTranscript(alexTranscript);  // same state, just Alex's lines now
  setAtsData(data);
  setScreen('evaluation');
};
  const handleRestart = () => { setAtsData(null); setTranscript([]); setScreen('upload'); };

  return (
    <>
      {screen === 'upload' && <UploadResume onAnalysisComplete={handleAnalysisComplete} />}
      {screen === 'ats' && atsData && <AtsResult data={atsData} onStartInterview={handleStartInterview} />}
      {screen === 'interview' && atsData && <Interviewer atsData={atsData} apiKey={GEMINI_API_KEY} onInterviewEnd={handleInterviewEnd} />}
      {screen === 'evaluation' && atsData && <Evaluator transcript={transcript} atsData={atsData} onRestart={handleRestart} />}
    </>
  );
}