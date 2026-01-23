import { motion } from 'motion/react';
import { emotions } from '../data/mockData';
import { Emotion } from '../types/quran';
import { useState } from 'react';
import { Sparkles, Heart, Zap, Brain, Users, BookOpen } from 'lucide-react';

interface EmotionalEntryProps {
  onEmotionSelect: (emotionId: string) => void;
  onQuickAccess?: (screen: string) => void;
}

export function EmotionalEntry({ onEmotionSelect, onQuickAccess }: EmotionalEntryProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [customEmotion, setCustomEmotion] = useState('');
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null);

  const handleEmotionClick = (emotion: Emotion) => {
    setSelectedEmotion(emotion.id);
    setTimeout(() => {
      onEmotionSelect(emotion.id);
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-300/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-4"
          >
            <Heart className="w-16 h-16 text-purple-400 fill-purple-200" />
          </motion.div>
          
          <h1 className="text-4xl mb-3 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            How are you feeling?
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Let the Qur'an speak to your heart. Select an emotion or describe how you feel.
          </p>
        </motion.div>

        {/* Emotion Grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {emotions.map((emotion, index) => (
            <motion.button
              key={emotion.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleEmotionClick(emotion)}
              onMouseEnter={() => setHoveredEmotion(emotion.id)}
              onMouseLeave={() => setHoveredEmotion(null)}
              className="relative group"
            >
              {/* Glow effect */}
              {(selectedEmotion === emotion.id || hoveredEmotion === emotion.id) && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${emotion.gradient} opacity-20 blur-xl rounded-3xl`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Card */}
              <div className={`relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 transition-all duration-300 ${
                selectedEmotion === emotion.id 
                  ? 'border-purple-400 shadow-2xl' 
                  : 'border-white/50 shadow-lg hover:border-purple-200'
              }`}>
                {selectedEmotion === emotion.id && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${emotion.gradient} opacity-10`}
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </motion.div>
                )}

                <div className="relative">
                  <div className="text-5xl mb-3">{emotion.icon}</div>
                  <h3 className="font-medium text-slate-700">{emotion.label}</h3>
                </div>

                {/* Ripple effect on selection */}
                {selectedEmotion === emotion.id && (
                  <motion.div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${emotion.gradient}`}
                    initial={{ opacity: 0.5, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.8 }}
                  />
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Custom emotion input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="relative">
            <input
              type="text"
              value={customEmotion}
              onChange={(e) => setCustomEmotion(e.target.value)}
              placeholder="Or describe your feeling in your own words..."
              className="w-full px-6 py-4 bg-white/70 backdrop-blur-xl rounded-2xl border-2 border-white/50 
                focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200/50 
                text-slate-700 placeholder:text-slate-400 shadow-lg transition-all"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && customEmotion.trim()) {
                  setSelectedEmotion('custom');
                  setTimeout(() => {
                    onEmotionSelect('anxious'); // Default to anxious for custom
                  }, 800);
                }
              }}
            />
            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
          </div>
        </motion.div>

        {/* Subtle bottom decoration */}
        <motion.div
          className="mt-16 text-center text-slate-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Your journey of reflection begins here</p>
        </motion.div>
      </div>
    </div>
  );
}