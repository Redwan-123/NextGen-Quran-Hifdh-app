import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, Flame, TrendingUp, Zap, Mic, BookOpen, Search, RefreshCw, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { mockUserProgress } from '../data/mockData';
import { allSurahs, Surah } from '../data/surahData';

interface HifdhDashboardProps {
  darkMode?: boolean;
}

export function HifdhDashboard({ darkMode = false }: HifdhDashboardProps) {
  const [selectedSurah, setSelectedSurah] = useState<Surah>(allSurahs[0]);
  const [activeAyahs, setActiveAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionMistakes, setSessionMistakes] = useState<{ ayah: number, error: string }[]>([]);
  const [practicePlan, setPracticePlan] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [recitationFeedback, setRecitationFeedback] = useState({
    rhythm: 85,
    pitch: 78,
    confidence: 82,
  });


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

  const generatePlan = () => {
    setAiLoading(true);
    setTimeout(() => {
      const plan = [
        'Review ayahs with emphasis on tajweed rules.',
        'Practice long vowels (Madh) for 5 minutes.',
        'Record yourself and compare with professional reciter.',
      ];
      setPracticePlan(plan);
      setAiLoading(false);
    }, 600);
  };


  if (isFinished) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? 'bg-gradient-to-br from-[#0f051a] via-[#1a0b2e] to-[#0f051a]' : 'bg-slate-100'}`}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`p-8 rounded-3xl shadow-2xl border max-w-2xl w-full ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Session Complete</h2>
          <p className={`mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Summary for Surah {selectedSurah.transliteration}</p>
          <Button onClick={() => { setIsFinished(false); setCurrentAyahIndex(0); setSessionMistakes([]); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 rounded-2xl font-bold">
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
            <span className="text-sm md:text-2xl font-bold block">7</span>
            <p className="text-[8px] md:text-xs opacity-90 font-medium">Day Streak</p>
          </motion.div>
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}} className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-2 md:p-4 text-white shadow-lg">
            <Target className="w-4 h-4 md:w-6 md:h-6 mb-1" />
            <span className="text-sm md:text-2xl font-bold block">3</span>
            <p className="text-[8px] md:text-xs opacity-90 font-medium">Ayahs Memorized</p>
          </motion.div>
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}} className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-2 md:p-4 text-white shadow-lg">
            <TrendingUp className="w-4 h-4 md:w-6 md:h-6 mb-1" />
            <span className="text-sm md:text-2xl font-bold block">50%</span>
            <p className="text-[8px] md:text-xs opacity-90 font-medium">Overall Mastery</p>
          </motion.div>
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.3}} className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-2 md:p-4 text-white shadow-lg">
            <Brain className="w-4 h-4 md:w-6 md:h-6 mb-1" />
            <span className="text-sm md:text-2xl font-bold block">2</span>
            <p className="text-[8px] md:text-xs opacity-90 font-medium">Weak Links</p>
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
                <Mic className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'} w-4 h-4 md:w-6 md:h-6 cursor-pointer`} onClick={() => setIsRecording(!isRecording)} />
              </div>

              <div className="mb-4 md:mb-6 p-4 md:p-8 bg-slate-900 rounded-2xl min-h-[120px] md:min-h-[200px] flex items-center justify-center">
                {loading ? (
                  <div className="text-purple-400 font-bold animate-pulse">Loading...</div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.p key={currentAyahIndex} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-3xl md:text-5xl text-white text-center leading-loose font-arabic" dir="rtl">
                      {activeAyahs[currentAyahIndex]?.text_uthmani}
                    </motion.p>
                  </AnimatePresence>
                )}
              </div>

              {/* Feedback Metrics */}
              <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
                {[
                  { label: 'Rhythm', value: 85 },
                  { label: 'Pitch', value: 78 },
                  { label: 'Confidence', value: 82 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[9px] md:text-[11px] font-bold uppercase mb-2">
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{item.label}</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{item.value}%</span>
                    </div>
                    <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full" style={{width: `${item.value}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <Button onClick={() => handleNextAyah(false)} className="bg-purple-600 hover:bg-purple-700 text-white h-10 md:h-12 rounded-xl font-bold text-xs md:text-base">
                  ✓ Correct
                </Button>
                <Button onClick={() => handleNextAyah(true, "error")} className="bg-red-500 hover:bg-red-600 text-white h-10 md:h-12 rounded-xl font-bold text-xs md:text-base">
                  ✗ Mistake
                </Button>
                <Button onClick={() => handleNextAyah(false)} className="bg-blue-500 hover:bg-blue-600 text-white h-10 md:h-12 rounded-xl font-bold text-xs md:text-base">
                  → Next
                </Button>
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
                {['Audit 2', 'Audit 3'].map((item, i) => (
                  <div key={i} className={`p-3 md:p-4 rounded-2xl group cursor-pointer transition-all border ${darkMode ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'}`}>
                    <p className={`text-xs md:text-sm font-bold mb-1 ${darkMode ? 'text-slate-300 group-hover:text-indigo-400' : 'text-slate-700 group-hover:text-indigo-600'}`}>{item}</p>
                    <p className={`text-[9px] md:text-[10px] italic ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>As required and thorough</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.1}} className={`rounded-3xl p-4 md:p-6 shadow-xl border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold mb-4 md:mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Sparkles className="text-indigo-500 w-5 h-5" /> AI Insights
              </h3>
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <div className={`p-2 md:p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Long vowels (Madh)</p>
                  <p className={`text-[8px] md:text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>6 more sights to unlock badge</p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Emphasis note consistency</p>
                  <p className={`text-[8px] md:text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Towered voice consistency</p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg border ${darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                  <p className={`font-bold flex items-center gap-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                    <CheckCircle2 className="w-4 h-4" /> Safe learning in Surah badge
                  </p>
                  <p className={`text-[8px] md:text-[10px] ${darkMode ? 'text-green-400/70' : 'text-green-600'}`}>3 more sights unlocked</p>
                </div>
              </div>
            </motion.div>

            {/* Progress Trend */}
            <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.2}} className={`rounded-3xl p-4 md:p-6 shadow-xl border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-bold mb-4 md:mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Progress Trend</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs md:text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>This Week</span>
                    <span className="text-emerald-500 font-bold text-xs md:text-sm">+37%</span>
                  </div>
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full w-[37%]"></div>
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