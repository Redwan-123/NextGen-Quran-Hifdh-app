import { motion } from 'motion/react';
import { useState } from 'react';
import { mockUserProgress, mockAyahs, similarAyahsData } from '../data/mockData';
import { Brain, Target, Flame, TrendingUp, Zap, AlertCircle, ChevronDown, Mic } from 'lucide-react';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

export function HifdhDashboard() {
  const [showSimilarityXRay, setShowSimilarityXRay] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState(mockAyahs[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recitationFeedback, setRecitationFeedback] = useState({
    rhythm: 85,
    pitch: 78,
    confidence: 92,
    mistakes: 2
  });

  const similarAyahs = similarAyahsData[selectedAyah.id] || [];

  const startRecitation = () => {
    setIsRecording(true);
    // Simulate recording and feedback
    setTimeout(() => {
      setIsRecording(false);
      // Update feedback with random values for demo
      setRecitationFeedback({
        rhythm: Math.floor(Math.random() * 20) + 80,
        pitch: Math.floor(Math.random() * 20) + 75,
        confidence: Math.floor(Math.random() * 15) + 85,
        mistakes: Math.floor(Math.random() * 3)
      });
    }, 3000);
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
            Hifdh Mastery
          </h1>
          <p className="text-slate-600">Track your memorization journey with intelligent feedback</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8" />
              <motion.span 
                className="text-3xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {mockUserProgress.streakDays}
              </motion.span>
            </div>
            <p className="text-sm opacity-90">Day Streak</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8" />
              <span className="text-3xl">{mockUserProgress.memorizedAyahs.length}</span>
            </div>
            <p className="text-sm opacity-90">Ayahs Memorized</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8" />
              <span className="text-3xl">{mockUserProgress.masteryPercentage}%</span>
            </div>
            <p className="text-sm opacity-90">Overall Mastery</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-8 h-8" />
              <span className="text-3xl">{mockUserProgress.weakLinks.length}</span>
            </div>
            <p className="text-sm opacity-90">Weak Links</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Practice Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recitation Practice */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl text-slate-800 mb-1">Practice Recitation</h2>
                  <p className="text-sm text-slate-500">Real-time feedback on your memorization</p>
                </div>
                <Mic className={`w-8 h-8 ${isRecording ? 'text-red-500' : 'text-slate-400'}`} />
              </div>

              {/* Selected Ayah */}
              <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <p className="text-3xl text-center mb-4" dir="rtl" lang="ar">
                  {selectedAyah.arabic}
                </p>
                <p className="text-center text-slate-600 text-sm italic">
                  {selectedAyah.surahName} - Ayah {selectedAyah.ayahNumber}
                </p>
              </div>

              {/* Recording Button */}
              <div className="text-center mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecitation}
                  disabled={isRecording}
                  className={`px-8 py-4 rounded-full font-medium shadow-lg transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white'
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
                      Recording...
                    </span>
                  ) : (
                    'Start Recitation'
                  )}
                </motion.button>
              </div>

              {/* Micro Feedback */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Rhythm & Timing</span>
                    <span className="text-sm font-medium text-slate-800">{recitationFeedback.rhythm}%</span>
                  </div>
                  <Progress value={recitationFeedback.rhythm} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Pitch & Pronunciation</span>
                    <span className="text-sm font-medium text-slate-800">{recitationFeedback.pitch}%</span>
                  </div>
                  <Progress value={recitationFeedback.pitch} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-600">Confidence</span>
                    <span className="text-sm font-medium text-slate-800">{recitationFeedback.confidence}%</span>
                  </div>
                  <Progress value={recitationFeedback.confidence} className="h-2" />
                </div>

                {recitationFeedback.mistakes > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium">
                        {recitationFeedback.mistakes} pause(s) detected
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Practice the highlighted sections to improve fluency
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
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
                    <p className="text-sm text-slate-500">Identify confusing similar verses</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showSimilarityXRay ? 'rotate-180' : ''}`} />
              </button>

              {showSimilarityXRay && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-4 border-t border-slate-200"
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
                          <strong>Divergence:</strong> {similar.divergencePoint}
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
                Today's Practice
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
                          ? 'bg-indigo-50 border-indigo-300'
                          : 'bg-slate-50 border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          {ayah?.surahName} {ayah?.ayahNumber}
                        </span>
                        <span className="text-xs text-red-500">Weak Link</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {ayah?.translation}
                      </p>
                    </motion.button>
                  );
                })}
              </div>

              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                Generate Practice Schedule
              </Button>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center mb-2">
                  Next review recommended in
                </p>
                <p className="text-2xl text-center text-indigo-600 font-medium">
                  2h 30m
                </p>
              </div>
            </motion.div>

            {/* Motivational Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <h4 className="text-lg mb-4">Weekly Progress</h4>
              <div className="space-y-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm opacity-90">{day}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 + (i * 0.05) + (j * 0.02) }}
                          className={`w-3 h-3 rounded-sm ${
                            j < (i <= new Date().getDay() ? Math.floor(Math.random() * 5) + 1 : 0)
                              ? 'bg-white'
                              : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
