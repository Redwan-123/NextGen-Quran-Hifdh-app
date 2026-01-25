import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, Flame, TrendingUp, Zap, Mic, BookOpen, Search, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { mockUserProgress } from '../data/mockData';
import { allSurahs, Surah } from '../data/surahData';

interface HifdhDashboardProps {
  darkMode?: boolean;
}

export function HifdhDashboard({ darkMode = false }: HifdhDashboardProps) {
  // --- State Configuration ---
  const [selectedSurah, setSelectedSurah] = useState<Surah>(allSurahs[0]);
  const [activeAyahs, setActiveAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionMistakes, setSessionMistakes] = useState<{ ayah: number, error: string }[]>([]);
  
  const [recitationFeedback, setRecitationFeedback] = useState({
    rhythm: 85,
    pitch: 78,
    confidence: 92,
  });

  // --- API Fetch Logic ---
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
        setSessionMistakes([]);
        setIsFinished(false);
      } catch (error) {
        console.error("API Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahContent();
  }, [selectedSurah]);

  // --- Handlers ---
  const handleNextAyah = (hasMistake: boolean, errorMsg?: string) => {
    if (hasMistake && errorMsg) {
      setSessionMistakes(prev => [...prev, { ayah: currentAyahIndex + 1, error: errorMsg }]);
    }
    
    if (currentAyahIndex < activeAyahs.length - 1) {
      setCurrentAyahIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const filteredSurahs = allSurahs.filter(s => 
    s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.number.toString() === searchQuery
  );

  // --- Completion View ---
  if (isFinished) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Recitation Complete</h2>
          <p className="text-slate-500 mb-8">Summary for Surah {selectedSurah.transliteration}</p>
          <div className="space-y-4 mb-8">
            {sessionMistakes.length === 0 ? (
              <div className="p-6 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-4">
                <CheckCircle2 size={32} /> <span className="font-bold">Perfect recitation! Masha'Allah.</span>
              </div>
            ) : (
              sessionMistakes.map((m, i) => (
                <div key={i} className="p-4 bg-red-50 text-red-700 rounded-xl flex gap-3 border border-red-100">
                  <AlertCircle size={20} className="mt-1 flex-shrink-0" />
                  <p className="text-sm"><span className="font-bold">Ayah {m.ayah}:</span> {m.error}</p>
                </div>
              ))
            )}
          </div>
          <Button onClick={() => { setIsFinished(false); setCurrentAyahIndex(0); setSessionMistakes([]); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-2xl">
            <RefreshCw className="mr-2 w-5 h-5" /> Start New Session
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-[#0f051a] via-[#1a0b2e] to-[#0f051a]' : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-6 pb-8">
        
        {/* Statistics Header (Your original stats) */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
            <Flame className="w-8 h-8 mb-2" />
            <span className="text-3xl font-bold block">{mockUserProgress.streakDays}</span>
            <p className="text-sm opacity-90 font-medium">Day Streak</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
            <Target className="w-8 h-8 mb-2" />
            <span className="text-3xl font-bold block">{mockUserProgress.memorizedAyahs.length}</span>
            <p className="text-sm opacity-90 font-medium">Ayahs Memorized</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
            <TrendingUp className="w-8 h-8 mb-2" />
            <span className="text-3xl font-bold block">{mockUserProgress.masteryPercentage}%</span>
            <p className="text-sm opacity-90 font-medium">Overall Mastery</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
            <Brain className="w-8 h-8 mb-2" />
            <span className="text-3xl font-bold block">{mockUserProgress.weakLinks.length}</span>
            <p className="text-sm opacity-90 font-medium">Weak Links</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual Recitation Practice Area (Your original Practice UI) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Practice Session</h2>
                  <p className="text-slate-500">Currently Reading: {selectedSurah.transliteration} (Ayah {currentAyahIndex + 1})</p>
                </div>
                <div onClick={() => setIsRecording(!isRecording)} className="cursor-pointer">
                   <Mic className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-300'} w-8 h-8`} />
                </div>
              </div>

              <div className="mb-8 p-10 bg-slate-900 rounded-3xl min-h-[300px] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                {loading ? (
                  <div className="text-indigo-400 font-bold animate-pulse text-xl font-arabic">Loading...</div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.p key={currentAyahIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-4xl text-white text-center leading-[2.2] font-arabic" dir="rtl">
                      {activeAyahs[currentAyahIndex]?.text_uthmani}
                    </motion.p>
                  </AnimatePresence>
                )}
              </div>

              {/* Feedback Section */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {Object.entries(recitationFeedback).map(([label, value]) => (
                    <div key={label}>
                      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-2">
                        <span>{label}</span>
                        <span>{value}%</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                ))}
              </div>

              {/* Control Buttons (Backend logic integrated here) */}
              <div className="flex gap-4">
                <Button onClick={() => handleNextAyah(false)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl font-bold">
                  Correct
                </Button>
                <Button onClick={() => handleNextAyah(true, "Pronunciation error detected")} className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 rounded-xl font-bold">
                  Mistake
                </Button>
              </div>
            </motion.div>

            {/* Surah Selection Grid (Your original Card UI) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" /> Select Surah
                </h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search surahs..." 
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-white/50"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredSurahs.map((surah: Surah) => (
                  <motion.div
                    key={surah.number}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedSurah(surah)}
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                      selectedSurah.number === surah.number 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 shadow-xl' 
                        : 'bg-white border-slate-100 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${selectedSurah.number === surah.number ? 'bg-white/20' : 'bg-slate-50 text-slate-500'}`}>
                        {surah.number}
                      </span>
                      <span className="font-arabic text-lg">{surah.name}</span>
                    </div>
                    <h4 className="font-bold truncate text-sm">{surah.transliteration}</h4>
                    <p className={`text-[10px] mt-1 ${selectedSurah.number === surah.number ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {surah.totalVerses} Ayahs • {surah.type}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Practice Queue Sidebar (Your original Sidebar) */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Zap className="text-amber-500 w-5 h-5" /> Quick Review
              </h3>
              <div className="space-y-4">
                {mockUserProgress.weakLinks.slice(0, 3).map((id, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:border-indigo-200">
                    <p className="text-xs font-bold text-slate-700 mb-1 group-hover:text-indigo-600">Review Item {id}</p>
                    <p className="text-[10px] text-slate-400 italic leading-tight">Focus on precision and rhythm.</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-indigo-100">
                Start AI Drill
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}