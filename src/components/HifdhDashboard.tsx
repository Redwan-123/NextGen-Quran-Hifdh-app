import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, Flame, TrendingUp, Zap, Mic, BookOpen, Search, RefreshCw, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { allSurahs, Surah } from '../data/surahData';
import API_BASE from '../lib/api';

interface HifdhDashboardProps {
  darkMode?: boolean;
}

export function HifdhDashboard({ darkMode = false }: HifdhDashboardProps) {
  function normalizeArabicClient(text: string) {
    return text
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[^\u0600-\u06FF\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const [selectedSurah, setSelectedSurah] = useState<Surah>(allSurahs[0]);
  const [activeAyahs, setActiveAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [sessionAnalyses, setSessionAnalyses] = useState<any[]>([]);
  const [sessionSummary, setSessionSummary] = useState<{ accuracy: number; tajweedScore: number; repeatedMistakes: any[] } | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const followIntervalRef = useRef<number | null>(null);
  const autoStopTimeoutRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any | null>(null);
  const expectedWordsRef = useRef<string[]>([]);
  const lastMatchedIndexRef = useRef(0);
  
  const [recitationFeedback, setRecitationFeedback] = useState<{
    rhythm: number;
    pitch: number;
    confidence: number;
  } | null>(null);


  useEffect(() => {
    const fetchSurahContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${selectedSurah.number}`
        );
        const data = await response.json();
        setActiveAyahs(data.verses);
        setCurrentAyahIndex(0);
        setSessionAnalyses([]);
        setSessionSummary(null);
        setIsFinished(false);
        setRecitationFeedback(null);
      } catch (error) {
        console.error("API Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahContent();
  }, [selectedSurah]);

  useEffect(() => {
    return () => {
      cleanupRecordingTimers();
      stopMediaTracks();
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    stopRecording();
  }, [selectedSurah, currentAyahIndex]);

  useEffect(() => {
    if (!isFinished || sessionAnalyses.length === 0) return;

    const fetchSummary = async () => {
      try {
        const response = await fetch(`${API_BASE}/recitation/summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ analyses: sessionAnalyses })
        });

        if (!response.ok) {
          console.error('Summary request failed');
          return;
        }

        const data = await response.json();
        setSessionSummary(data);
      } catch (error) {
        console.error('Summary request failed', error);
      }
    };

    fetchSummary();
  }, [isFinished, sessionAnalyses]);

  const handleNextAyah = () => {
    if (currentAyahIndex < activeAyahs.length - 1) {
      setCurrentAyahIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  function cleanupRecordingTimers() {
    if (followIntervalRef.current) {
      window.clearInterval(followIntervalRef.current);
      followIntervalRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      window.clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }

  function stopMediaTracks() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }

  const startRecording = async () => {
    if (isRecording || isAnalyzing || loading) return;
    const currentAyahText = activeAyahs[currentAyahIndex]?.text_uthmani || '';
    if (!currentAyahText) return;

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setRecordingError('Recording is not supported in this browser.');
      return;
    }

    setRecordingError(null);
    setRecordingDuration(0);
    setActiveWordIndex(0);
    setRecitationFeedback(null);

    const normalizedAyah = normalizeArabicClient(currentAyahText);
    expectedWordsRef.current = normalizedAyah.split(' ').filter(Boolean);
    lastMatchedIndexRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        cleanupRecordingTimers();
        setActiveWordIndex(null);
        setIsRecording(false);
        stopMediaTracks();

        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        audioChunksRef.current = [];

        if (audioBlob.size === 0) {
          setRecordingError('No audio captured. Please try again.');
          return;
        }

        setIsAnalyzing(true);

        try {
          const ayahKey = `${selectedSurah.number}:${currentAyahIndex + 1}`;
          const formData = new FormData();
          formData.append('audio', audioBlob, `ayah-${ayahKey}.webm`);
          formData.append('ayahText', currentAyahText);
          formData.append('ayahKey', ayahKey);

          const response = await fetch(`${API_BASE}/recitation/analyse`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            const errText = await response.text();
            const message = errText?.trim() || `Analysis failed (${response.status})`;
            throw new Error(message);
          }

          const data = await response.json();
          const avgConfidence = Array.isArray(data.transcription?.words) && data.transcription.words.length > 0
            ? Math.round(
                (data.transcription.words.reduce((acc: number, word: any) => acc + (word.confidence ?? 0), 0) /
                  data.transcription.words.length) * 100
              )
            : 0;

          setRecitationFeedback({
            rhythm: data.accuracy ?? 0,
            pitch: data.tajweedScore ?? 0,
            confidence: avgConfidence
          });

          setSessionAnalyses((prev) => [
            ...prev,
            {
              ayahKey,
              accuracy: data.accuracy ?? 0,
              tajweedScore: data.tajweedScore ?? 0,
              mistakes: data.mistakes || []
            }
          ]);

          handleNextAyah();
        } catch (error: any) {
          console.error('Recitation analysis failed', error);
          setRecordingError(error?.message || 'Recitation analysis failed. Please try again.');
        } finally {
          setIsAnalyzing(false);
        }
      };

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          if (followIntervalRef.current) {
            window.clearInterval(followIntervalRef.current);
            followIntervalRef.current = null;
          }
          const transcript = Array.from(event.results)
            .map((result: any) => result[0]?.transcript || '')
            .join(' ');

          const normalized = normalizeArabicClient(transcript);
          const spokenWords = normalized.split(' ').filter(Boolean);
          const lastWord = spokenWords[spokenWords.length - 1];

          if (!lastWord) return;
          const expectedWords = expectedWordsRef.current;
          const startIndex = lastMatchedIndexRef.current;
          let matchedIndex = expectedWords.findIndex((word, idx) => idx >= startIndex && word === lastWord);

          if (matchedIndex === -1 && startIndex > 0) {
            matchedIndex = expectedWords.findIndex((word) => word === lastWord);
          }

          if (matchedIndex !== -1) {
            lastMatchedIndexRef.current = matchedIndex;
            setActiveWordIndex(matchedIndex);
          }
        };
        recognition.onerror = () => {
          recognition.stop();
        };
        recognition.start();
        speechRecognitionRef.current = recognition;
      }

      recorder.start();

      const words = currentAyahText.split(' ').filter(Boolean);
      const wordCount = Math.max(words.length, 1);
      const estimatedDurationMs = Math.min(30000, Math.max(5000, Math.round(wordCount * 650)));
      const followIntervalMs = Math.max(350, Math.round(estimatedDurationMs / wordCount));

      const startTime = Date.now();
      recordingTimerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingDuration(elapsed);
      }, 1000);

      followIntervalRef.current = window.setInterval(() => {
        setActiveWordIndex((prev) => {
          if (prev == null) return 0;
          if (prev >= wordCount - 1) return prev;
          return prev + 1;
        });
      }, followIntervalMs);

      autoStopTimeoutRef.current = window.setTimeout(() => {
        stopRecording();
      }, estimatedDurationMs + 1200);
    } catch (error) {
      console.error('Recording failed', error);
      setRecordingError('Microphone access denied or unavailable.');
      setIsRecording(false);
      stopMediaTracks();
    }
  };

  function stopRecording() {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
      return;
    }
    mediaRecorderRef.current.stop();
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    startRecording();
  };

  const filteredSurahs = allSurahs.filter(s => 
    s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.number.toString() === searchQuery
  );

  const totalAyahs = activeAyahs.length;
  const completedAyahs = sessionAnalyses.length;
  const avgAccuracy = completedAyahs > 0
    ? Math.round(sessionAnalyses.reduce((acc, item) => acc + (item.accuracy || 0), 0) / completedAyahs)
    : 0;
  const avgTajweed = completedAyahs > 0
    ? Math.round(sessionAnalyses.reduce((acc, item) => acc + (item.tajweedScore || 0), 0) / completedAyahs)
    : 0;
  const totalMistakes = sessionAnalyses.reduce((acc, item) => acc + (item.mistakes?.length || 0), 0);
  const progressPercent = totalAyahs > 0 ? Math.round((completedAyahs / totalAyahs) * 100) : 0;
  const latestMistakes = completedAyahs > 0
    ? (sessionAnalyses[completedAyahs - 1].mistakes || []).slice(0, 3)
    : [];

  


  if (isFinished) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? 'bg-gradient-to-br from-[#0f051a] via-[#1a0b2e] to-[#0f051a]' : 'bg-slate-100'}`}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 rounded-3xl shadow-2xl border max-w-2xl w-full ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Session Complete</h2>
          <p className={`mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Summary for Surah {selectedSurah.transliteration}</p>
          {sessionSummary && (
            <div className={`mb-6 p-4 rounded-2xl border ${darkMode ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className={`text-sm font-bold mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Session Summary</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Accuracy: {sessionSummary.accuracy}% • Tajweed: {sessionSummary.tajweedScore}% • Repeated Mistakes: {sessionSummary.repeatedMistakes?.length || 0}
              </div>
            </div>
          )}
          <Button onClick={() => { setIsFinished(false); setCurrentAyahIndex(0); setSessionAnalyses([]); setSessionSummary(null); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-2xl font-bold">
            <RefreshCw className="mr-2 w-5 h-5" /> Start New Session
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-[#0f051a] via-[#1a0b2e] to-[#0f051a]' : 'bg-slate-50'}`}>
      <div className={`max-w-7xl mx-auto px-3 md:px-6 pb-8 pt-4`}>
        
        {/* Header with Title and Button */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-2">
          <div>
            <h1 className={`text-sm md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Smart Hifdh Practice</h1>
            <p className={`text-[10px] md:text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>AI-Powered Practice Analysis</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 h-8 rounded-lg font-bold text-xs">
            Finish
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-2 md:p-4 text-white shadow-lg">
            <Flame className="w-4 h-4 md:w-6 md:h-6 mb-1" />
            <span className="text-sm md:text-2xl font-bold block">{completedAyahs}</span>
            <p className="text-[8px] md:text-xs opacity-90 font-medium">Ayahs Completed</p>
          </motion.div>
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}} className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-2 md:p-4 text-white shadow-lg">
            <Target className="w-4 h-4 md:w-6 md:h-6 mb-1" />
            <span className="text-sm md:text-2xl font-bold block">{avgAccuracy}%</span>
            <p className="text-[8px] md:text-xs opacity-90 font-medium">Avg Accuracy</p>
          </motion.div>
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}} className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-2 md:p-4 text-white shadow-lg">
            <TrendingUp className="w-4 h-4 md:w-6 md:h-6 mb-1" />
            <span className="text-sm md:text-2xl font-bold block">{avgTajweed}%</span>
            <p className="text-[8px] md:text-xs opacity-90 font-medium">Avg Tajweed</p>
          </motion.div>
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.3}} className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-2 md:p-4 text-white shadow-lg">
            <Brain className="w-4 h-4 md:w-6 md:h-6 mb-1" />
            <span className="text-sm md:text-2xl font-bold block">{totalMistakes}</span>
            <p className="text-[8px] md:text-xs opacity-90 font-medium">Total Mistakes</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Practice Area */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            
            {/* Practice Session Card */}
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className={`rounded-2xl p-3 md:p-6 shadow-xl border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div>
                  <h2 className={`text-sm md:text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Reading</h2>
                  <p className={`text-[9px] md:text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{selectedSurah.transliteration} (Ayah {currentAyahIndex + 1})</p>
                </div>
                <Mic className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'} w-4 h-4 md:w-6 md:h-6 cursor-pointer`} onClick={toggleRecording} />
              </div>

              <div className="mb-4 md:mb-6 p-4 md:p-8 bg-slate-900 rounded-2xl min-h-[120px] md:min-h-[200px] flex items-center justify-center">
                {loading ? (
                  <div className="text-purple-400 font-bold animate-pulse">Loading...</div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.p key={currentAyahIndex} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-3xl md:text-5xl text-white text-center leading-loose font-arabic" dir="rtl">
                      {(activeAyahs[currentAyahIndex]?.text_uthmani || '').split(' ').filter(Boolean).map((word, index) => {
                        const isActive = isRecording && activeWordIndex === index;
                        return (
                          <span key={`${word}-${index}`} className={isActive ? 'text-amber-300 underline decoration-amber-300' : ''}>
                            {word}{' '}
                          </span>
                        );
                      })}
                    </motion.p>
                  </AnimatePresence>
                )}
              </div>

              {(recordingError || isAnalyzing) && (
                <div className={`mb-4 text-[10px] md:text-xs ${recordingError ? 'text-red-400' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {recordingError || 'Analyzing your recitation...'}
                </div>
              )}

              {/* Feedback Metrics */}
              <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
                {[
                  { label: 'Rhythm', value: recitationFeedback?.rhythm ?? 0, hasData: Boolean(recitationFeedback) },
                  { label: 'Pitch', value: recitationFeedback?.pitch ?? 0, hasData: Boolean(recitationFeedback) },
                  { label: 'Confidence', value: recitationFeedback?.confidence ?? 0, hasData: Boolean(recitationFeedback) },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[9px] md:text-[11px] font-bold uppercase mb-2">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{item.label}</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{item.hasData ? `${item.value}%` : '--'}</span>
                    </div>
                    <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full" style={{width: `${item.value}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`text-[9px] md:text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isRecording && `Recording... ${recordingDuration}s`}
                {!isRecording && isAnalyzing && 'Analyzing your recitation...'}
                {!isRecording && !isAnalyzing && 'Tap the microphone to begin recording.'}
              </div>
            </motion.div>

            {/* Surah Selection */}
            <div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 mb-4">
                <h3 className={`text-lg md:text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <BookOpen className="w-5 h-5 text-indigo-600" /> Select Surah
                </h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search surahs..." 
                    className={`pl-9 pr-4 py-2 border rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 max-h-[350px] overflow-y-auto pr-2 ${darkMode ? 'custom-scrollbar-dark' : 'custom-scrollbar'}`}>
                {filteredSurahs.map((surah: Surah) => (
                  <motion.div
                    key={surah.number}
                    whileHover={{scale: 1.02}}
                    onClick={() => setSelectedSurah(surah)}
                    className={`cursor-pointer p-3 md:p-5 rounded-2xl border-2 transition-all text-xs md:text-sm ${
                      selectedSurah.number === surah.number 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                        : darkMode 
                        ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-bold">{surah.number}. {surah.transliteration}</div>
                    <p className={`text-[8px] md:text-[10px] mt-1 ${selectedSurah.number === surah.number ? 'text-indigo-100' : darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {surah.totalVerses} Ayahs
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4 md:space-y-6">
            
            {/* Quick Review */}
            <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} className={`rounded-3xl p-4 md:p-6 shadow-xl border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold mb-4 md:mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Zap className="text-amber-500 w-5 h-5" /> Quick Review
              </h3>
              <div className="space-y-2 md:space-y-4">
                {latestMistakes.length > 0 ? (
                  latestMistakes.map((mistake: any, i: number) => (
                    <div key={`${mistake.word}-${i}`} className={`p-3 md:p-4 rounded-2xl transition-all border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`text-xs md:text-sm font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {mistake.word || 'Unknown word'}
                      </p>
                      <p className={`text-[9px] md:text-[10px] italic ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {mistake.type}{mistake.tajweed_rule ? ` • ${mistake.tajweed_rule}` : ''}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className={`p-3 md:p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <p className="text-xs md:text-sm font-bold mb-1">No mistakes yet</p>
                    <p className="text-[9px] md:text-[10px] italic">Complete an ayah to see detailed feedback.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.1}} className={`rounded-3xl p-4 md:p-6 shadow-xl border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold mb-4 md:mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Sparkles className="text-indigo-500 w-5 h-5" /> AI Insights
              </h3>
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <div className={`p-2 md:p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Session Accuracy</p>
                  <p className={`text-[8px] md:text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    {sessionSummary ? `${sessionSummary.accuracy}% overall` : 'Complete an ayah to compute'}
                  </p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Tajweed Score</p>
                  <p className={`text-[8px] md:text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    {sessionSummary ? `${sessionSummary.tajweedScore}% overall` : 'Complete an ayah to compute'}
                  </p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`font-bold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <CheckCircle2 className="w-4 h-4" /> Repeated Mistakes
                  </p>
                  <p className={`text-[8px] md:text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    {sessionSummary?.repeatedMistakes?.length
                      ? `${sessionSummary.repeatedMistakes.length} repeated across the session`
                      : 'None detected yet'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Progress Trend */}
            <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.2}} className={`rounded-3xl p-4 md:p-6 shadow-xl border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold mb-4 md:mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Progress Trend</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs md:text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Session Progress</span>
                    <span className="text-emerald-500 font-bold text-xs md:text-sm">{progressPercent}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}