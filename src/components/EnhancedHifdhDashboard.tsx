import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { mockUserProgress, mockAyahs, similarAyahsData } from '../data/mockData';
import { Brain, Target, Flame, TrendingUp, Zap, AlertCircle, ChevronDown, Mic, Volume2, CheckCircle, XCircle, Pause, Award, Clock } from 'lucide-react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

interface WordMistake {
  wordIndex: number;
  word: string;
  expected: string;
  type: 'pronunciation' | 'skip' | 'pause' | 'tajweed';
}

export function EnhancedHifdhDashboard() {
  const [showSimilarityXRay, setShowSimilarityXRay] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState(mockAyahs[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recitationFeedback, setRecitationFeedback] = useState({
    rhythm: 85,
    pitch: 78,
    confidence: 92,
    mistakes: 2,
    duration: 0
  });

  // Mock word-level mistakes
  const [wordMistakes] = useState<WordMistake[]>([
    { wordIndex: 2, word: 'ٱلْعُسْرِ', expected: 'العُسْرِ', type: 'tajweed' },
    { wordIndex: 4, word: '', expected: 'يُسْرًا', type: 'pause' }
  ]);

  const similarAyahs = similarAyahsData[selectedAyah.id] || [];
  const arabicWords = selectedAyah.arabic.split(' ');

  const startRecitation = () => {
    setIsRecording(true);
    setRecitationFeedback({ ...recitationFeedback, duration: 0 });
    
    // Simulate recording timer
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setRecitationFeedback(prev => ({ ...prev, duration: elapsed }));
    }, 1000);

    // Simulate recording and feedback
    setTimeout(() => {
      clearInterval(interval);
      setIsRecording(false);
      setHasRecorded(true);
      // Update feedback with random values for demo
      setRecitationFeedback({
        rhythm: Math.floor(Math.random() * 20) + 80,
        pitch: Math.floor(Math.random() * 20) + 75,
        confidence: Math.floor(Math.random() * 15) + 85,
        mistakes: Math.floor(Math.random() * 3),
        duration: Math.floor((Date.now() - startTime) / 1000)
      });
    }, 5000);
  };

  const getWordStatus = (index: number) => {
    const mistake = wordMistakes.find(m => m.wordIndex === index);
    if (!mistake && hasRecorded) return 'correct';
    if (mistake) {
      switch (mistake.type) {
        case 'pronunciation': return 'pronunciation';
        case 'tajweed': return 'tajweed';
        case 'pause': return 'pause';
        case 'skip': return 'skip';
        default: return 'correct';
      }
    }
    return 'neutral';
  };

  const getWordClass = (status: string) => {
    switch (status) {
      case 'correct': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'pronunciation': return 'bg-red-100 text-red-800 border-red-300 animate-pulse';
      case 'tajweed': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'pause': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'skip': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Hifdh Mastery
          </h1>
          <p className="text-slate-600">Precise feedback showing exactly where mistakes occur</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="relative flex items-center justify-between mb-2">
              <Flame className="w-8 h-8" />
              <motion.span 
                className="text-3xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {mockUserProgress.streakDays}
              </motion.span>
            </div>
            <p className="text-sm opacity-90 relative">Day Streak 🔥</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="relative flex items-center justify-between mb-2">
              <Target className="w-8 h-8" />
              <span className="text-3xl">{mockUserProgress.memorizedAyahs.length}</span>
            </div>
            <p className="text-sm opacity-90 relative">Ayahs Memorized ✓</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="relative flex items-center justify-between mb-2">
              <Award className="w-8 h-8" />
              <span className="text-3xl">{mockUserProgress.masteryPercentage}%</span>
            </div>
            <p className="text-sm opacity-90 relative">Mastery Level 🎯</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="relative flex items-center justify-between mb-2">
              <Clock className="w-8 h-8" />
              <span className="text-3xl">{mockUserProgress.weakLinks.length}</span>
            </div>
            <p className="text-sm opacity-90 relative">Needs Review ⏰</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Practice Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recitation Practice with Visual Feedback */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl text-slate-800 mb-1">Visual Recitation Practice</h2>
                  <p className="text-sm text-slate-500">See exactly where mistakes occur in real-time</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
                  >
                    <Mic className={`w-8 h-8 ${isRecording ? 'text-red-500' : 'text-slate-400'}`} />
                  </motion.div>
                  {isRecording && (
                    <span className="text-red-500 font-mono text-lg">
                      {Math.floor(recitationFeedback.duration / 60)}:{(recitationFeedback.duration % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>

              {/* Word-by-Word Ayah Display */}
              <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <div className="text-center mb-3 text-sm text-slate-600">
                  {selectedAyah.surahName} - Ayah {selectedAyah.ayahNumber}
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 mb-4" dir="rtl">
                  {arabicWords.map((word, index) => {
                    const status = getWordStatus(index);
                    const mistake = wordMistakes.find(m => m.wordIndex === index);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        <div className={`text-3xl px-3 py-2 rounded-xl border-2 transition-all ${getWordClass(status)}`}>
                          {word}
                        </div>
                        
                        {/* Mistake Tooltip */}
                        {mistake && hasRecorded && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10 hidden group-hover:block"
                          >
                            <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                              <div className="font-medium mb-1 capitalize">{mistake.type} Error</div>
                              {mistake.expected && (
                                <div className="text-slate-300">
                                  Expected: <span dir="rtl">{mistake.expected}</span>
                                </div>
                              )}
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                {hasRecorded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-wrap justify-center gap-3 pt-4 border-t border-indigo-200"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-slate-600">Correct</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-slate-600">Pronunciation</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-slate-600">Tajweed</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-slate-600">Long Pause</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="text-center mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecitation}
                  disabled={isRecording}
                  className={`px-8 py-4 rounded-full font-medium shadow-lg transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white cursor-wait'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-xl'
                  }`}
                >
                  {isRecording ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        className="w-3 h-3 bg-white rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      Recording... Speak Now
                    </span>
                  ) : hasRecorded ? (
                    'Record Again'
                  ) : (
                    'Start AI Recitation'
                  )}
                </motion.button>
                {!isRecording && !hasRecorded && (
                  <p className="text-xs text-slate-500 mt-2">
                    Click to start recording. Recite the ayah clearly.
                  </p>
                )}
              </div>

              {/* Detailed Feedback */}
              {hasRecorded && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Rhythm</span>
                        <span className="text-sm font-bold text-slate-800">{recitationFeedback.rhythm}%</span>
                      </div>
                      <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${recitationFeedback.rhythm}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Pitch</span>
                        <span className="text-sm font-bold text-slate-800">{recitationFeedback.pitch}%</span>
                      </div>
                      <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${recitationFeedback.pitch}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Confidence</span>
                        <span className="text-sm font-bold text-slate-800">{recitationFeedback.confidence}%</span>
                      </div>
                      <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${recitationFeedback.confidence}%` }}
                          transition={{ duration: 1, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detailed Mistake Analysis */}
                  {wordMistakes.length > 0 && (
                    <div className="space-y-2">
                      {wordMistakes.map((mistake, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (index * 0.1) }}
                          className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                        >
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-red-800 font-medium mb-1">
                              Word #{mistake.wordIndex + 1}: {mistake.type === 'pause' ? 'Long pause detected' : 'Pronunciation error'}
                            </p>
                            <p className="text-xs text-red-600">
                              {mistake.type === 'pause' 
                                ? 'You paused for too long before this word. Practice for better flow.'
                                : mistake.expected 
                                  ? `You said "${mistake.word}" but expected "${mistake.expected}". Review tajweed rules.`
                                  : 'Incorrect pronunciation detected. Listen to the qari and try again.'}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {wordMistakes.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <div>
                        <p className="text-sm text-emerald-800 font-medium">Perfect Recitation! MashAllah! 🎉</p>
                        <p className="text-xs text-emerald-600">No mistakes detected. Keep up the excellent work!</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Similarity X-Ray */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50"
            >
              <button
                onClick={() => setShowSimilarityXRay(!showSimilarityXRay)}
                className="w-full flex items-center justify-between mb-4"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <h3 className="text-xl text-slate-800">Ayah Similarity X-Ray</h3>
                    <p className="text-sm text-slate-500">AI detects confusing similar verses</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showSimilarityXRay ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showSimilarityXRay && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-4 border-t border-slate-200 overflow-hidden"
                  >
                    {similarAyahs.map((similar, index) => (
                      <motion.div
                        key={similar.ayah.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-purple-700">
                            {similar.ayah.surahName} {similar.ayah.ayahNumber}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-white rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${similar.similarity}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {similar.similarity}%
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-2xl mb-2" dir="rtl" lang="ar">
                          {similar.ayah.arabic}
                        </p>
                        
                        <div className="flex items-start gap-2 p-3 bg-white/70 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-600">
                            <strong>Key Difference:</strong> {similar.divergencePoint}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {similarAyahs.length === 0 && (
                      <p className="text-center text-slate-500 py-8">
                        No similar ayahs found for this verse
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sidebar - Spaced Repetition */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 sticky top-8"
            >
              <h3 className="text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                Smart Practice Queue
              </h3>

              <div className="space-y-3 mb-6">
                {mockUserProgress.weakLinks.slice(0, 3).map((ayahId, index) => {
                  const ayah = mockAyahs.find(a => a.id === ayahId);
                  return (
                    <motion.button
                      key={ayahId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      onClick={() => setSelectedAyah(ayah!)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                        selectedAyah?.id === ayahId
                          ? 'bg-indigo-50 border-indigo-300 shadow-md'
                          : 'bg-slate-50 border-slate-200 hover:border-indigo-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          {ayah?.surahName} {ayah?.ayahNumber}
                        </span>
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                          Priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                        {ayah?.translation}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Review in 2h</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                Generate AI Schedule
              </Button>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center mb-2">
                  Next review session
                </p>
                <p className="text-2xl text-center text-indigo-600 font-medium">
                  2h 30m
                </p>
              </div>
            </motion.div>

            {/* Weekly Progress Heatmap */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <h4 className="text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Weekly Progress
              </h4>
              <div className="space-y-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const completed = i <= new Date().getDay() ? Math.floor(Math.random() * 5) + 1 : 0;
                  return (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm opacity-90 w-12">{day}</span>
                      <div className="flex gap-1 flex-1">
                        {[...Array(5)].map((_, j) => (
                          <motion.div
                            key={j}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.6 + (i * 0.05) + (j * 0.02) }}
                            className={`flex-1 h-6 rounded ${
                              j < completed
                                ? 'bg-white shadow-md'
                                : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs ml-2 w-8 text-right">{completed * 20}%</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
