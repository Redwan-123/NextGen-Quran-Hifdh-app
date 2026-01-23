import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Ayah, Tafsir } from '../types/quran';
import { mockAyahs, tafsirData, qariOptions } from '../data/mockData';
import { emotionActionSteps, hadithRecommendations } from '../data/actionSteps';
import { BookOpen, Play, Pause, Volume2, ChevronRight, Info, Sparkles, ArrowLeft, CheckCircle2, Footprints } from 'lucide-react';
import { Button } from './ui/button';

interface AyahExperienceProps {
  emotionId: string;
  onBack: () => void;
}

export function AyahExperience({ emotionId, onBack }: AyahExperienceProps) {
  const ayah = mockAyahs.find(a => a.emotions.includes(emotionId)) || mockAyahs[0];
  const tafsirs = tafsirData[ayah.id] || [];
  const actionSteps = emotionActionSteps[emotionId] || [];
  const hadith = hadithRecommendations[emotionId];
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  const [showTafsir, setShowTafsir] = useState(false);
  const [selectedTafsir, setSelectedTafsir] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedQari, setSelectedQari] = useState(qariOptions[0]);
  const [showQariMenu, setShowQariMenu] = useState(false);

  const toggleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'mercy': return { bg: 'from-emerald-400/20 to-teal-400/20', glow: 'bg-emerald-400', text: 'text-emerald-600' };
      case 'warning': return { bg: 'from-orange-400/20 to-red-400/20', glow: 'bg-orange-400', text: 'text-orange-600' };
      case 'reflection': return { bg: 'from-blue-400/20 to-cyan-400/20', glow: 'bg-blue-400', text: 'text-blue-600' };
      case 'hope': return { bg: 'from-violet-400/20 to-purple-400/20', glow: 'bg-violet-400', text: 'text-violet-600' };
      case 'guidance': return { bg: 'from-amber-400/20 to-yellow-400/20', glow: 'bg-amber-400', text: 'text-amber-600' };
      default: return { bg: 'from-slate-400/20 to-gray-400/20', glow: 'bg-slate-400', text: 'text-slate-600' };
    }
  };

  const toneColors = getToneColor(ayah.tone);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control actual audio playback
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Ambient background glow */}
      <motion.div 
        className={`fixed inset-0 bg-gradient-to-br ${toneColors.bg} pointer-events-none`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 ${toneColors.glow} rounded-full opacity-20`}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 50
            }}
            animate={{
              y: -50,
              x: Math.random() * window.innerWidth,
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl px-4 py-2 rounded-full shadow-lg">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-slate-700">Page {ayah.pageNumber}</span>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ayah Display - Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mushaf View Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden"
            >
              {/* Decorative corner pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-100/50 to-transparent rounded-tr-full" />

              <div className="relative">
                {/* Surah header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-2xl text-slate-800 mb-1">{ayah.surahName}</h2>
                    <p className="text-sm text-slate-500">Surah {ayah.surahNumber}, Ayah {ayah.ayahNumber}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-violet-400 flex items-center justify-center"
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                </div>

                {/* Arabic Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8 text-center"
                >
                  <p className="text-5xl leading-loose text-slate-800 mb-6" dir="rtl" lang="ar">
                    {ayah.arabic}
                  </p>
                  
                  {/* Glow pulse effect */}
                  <motion.div
                    className={`h-1 w-24 ${toneColors.glow} mx-auto rounded-full`}
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scaleX: [1, 1.5, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                {/* Translation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <p className="text-xl text-slate-600 leading-relaxed italic">
                    "{ayah.translation}"
                  </p>
                </motion.div>

                {/* Tone indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 flex justify-center"
                >
                  <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${toneColors.bg} backdrop-blur-sm rounded-full border border-white/50`}>
                    <div className={`w-2 h-2 ${toneColors.glow} rounded-full`} />
                    <span className={`text-sm capitalize ${toneColors.text}`}>{ayah.tone}</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Audio Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-600">Recitation by</p>
                    <button 
                      onClick={() => setShowQariMenu(!showQariMenu)}
                      className="text-slate-800 hover:text-purple-600 transition-colors flex items-center gap-1"
                    >
                      {selectedQari.name}
                      <ChevronRight className={`w-4 h-4 transition-transform ${showQariMenu ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay}
                  className={`w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow`}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" fill="white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-1" fill="white" />
                  )}
                </motion.button>
              </div>

              {/* Qari menu */}
              <AnimatePresence>
                {showQariMenu && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-4 border-t border-slate-200">
                      {qariOptions.map((qari) => (
                        <button
                          key={qari.id}
                          onClick={() => {
                            setSelectedQari(qari);
                            setShowQariMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                            selectedQari.id === qari.id 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm">{qari.name}</span>
                            <span className="text-xs text-slate-500">{qari.style}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Waveform visualization */}
              {isPlaying && (
                <motion.div 
                  className="flex items-center justify-center gap-1 h-12 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[...Array(40)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-gradient-to-t from-purple-500 to-violet-500 rounded-full"
                      animate={{
                        height: [
                          Math.random() * 20 + 10,
                          Math.random() * 40 + 10,
                          Math.random() * 20 + 10
                        ]
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.02
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Tafsir Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="sticky top-8"
            >
              <button
                onClick={() => setShowTafsir(!showTafsir)}
                className="w-full bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/50 hover:bg-white/90 transition-all mb-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-purple-600" />
                  <span className="text-slate-800">Tafsir & Explanation</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showTafsir ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {showTafsir && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50"
                  >
                    {/* Scholar tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tafsirs.map((tafsir, index) => (
                        <button
                          key={tafsir.id}
                          onClick={() => setSelectedTafsir(index)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            selectedTafsir === index
                              ? 'bg-purple-500 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tafsir.scholar}
                        </button>
                      ))}
                    </div>

                    {/* Tafsir content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedTafsir}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="prose prose-sm max-w-none"
                      >
                        <p className="text-slate-700 leading-relaxed">
                          {tafsirs[selectedTafsir]?.text}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Decorative element */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500 text-center">
                        Swipe through scholars to explore different perspectives
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Action Steps - Full Width */}
        {actionSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-2xl text-white">
              <div className="flex items-center gap-3 mb-6">
                <Footprints className="w-6 h-6" />
                <h2 className="text-2xl">What To Do Now</h2>
              </div>
              <p className="text-white/90 mb-6">
                Don't just read - take action. Here are practical steps to help you feel better:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {actionSteps.map((step, index) => (
                  <motion.button
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                    onClick={() => toggleStepComplete(step.id)}
                    className={`p-4 rounded-2xl text-left transition-all ${
                      completedSteps.includes(step.id)
                        ? 'bg-white/30 border-2 border-white/50'
                        : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {completedSteps.includes(step.id) ? (
                          <CheckCircle2 className="w-6 h-6 text-white fill-white/30" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-white/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{step.icon}</span>
                          <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
                            {step.duration}
                          </span>
                        </div>
                        <h3 className={`font-medium mb-1 ${completedSteps.includes(step.id) ? 'line-through opacity-70' : ''}`}>
                          {step.title}
                        </h3>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Hadith Recommendation */}
              {hadith && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <span>📖</span> A Hadith for Reflection
                  </h3>
                  <p className="text-white/90 italic mb-2 leading-relaxed">
                    "{hadith.text}"
                  </p>
                  <p className="text-sm text-white/70">
                    — {hadith.reference}
                  </p>
                </motion.div>
              )}

              <div className="mt-6 text-center text-white/70 text-sm">
                <p>Check off each action as you complete it. Small steps lead to big changes.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}