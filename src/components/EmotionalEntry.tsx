import { motion } from 'framer-motion';
import { emotions } from '../data/mockData';
import { Emotion } from '../types/quran';
import { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { API_BASE } from '../lib/api';
import { qariOptions } from '../data/mockData';

interface EmotionalEntryProps {
  onEmotionSelect: (emotionId: string) => void;
  onQuickAccess?: (screen: string) => void;
  darkMode?: boolean;
}

// Helper to fetch audio from Quran.com
const getAudioUrl = async (ayahKey: string, reciterId: string | number | null) => {
  try {
    const id = reciterId || '7';
    const response = await fetch(`https://api.quran.com/api/v4/recitations/${id}/by_ayah/${ayahKey}`);
    const data = await response.json();
    const audioPath = data.audio_files?.[0]?.url;
    if (!audioPath) return null;
    return audioPath.startsWith('http') ? audioPath : `https://audio.quran.com${audioPath}`;
  } catch (err) {
    console.error("Audio fetch failed", err);
    return null;
  }
};

export function EmotionalEntry({ onEmotionSelect, onQuickAccess, darkMode = false }: EmotionalEntryProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [customEmotion, setCustomEmotion] = useState('');
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null);
  const [reciters, setReciters] = useState<any[]>([]);
  const [preferredReciter, setPreferredReciter] = useState<string | null>(null);

  useEffect(() => {
    // Set default reciter immediately from localStorage or mock data
    const pref = localStorage.getItem('preferredReciter');
    if (pref) {
      setPreferredReciter(pref);
    } else {
      setPreferredReciter(qariOptions[0].id);
    }

    // Load reciters in background (non-blocking)
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reciters`, { signal: AbortSignal.timeout(3000) });
        const json = await res.json();
        const list = json?.reciters || [];
        
        if (list.length > 0) {
          setReciters(list);
          return;
        }
      } catch (err) {
        console.warn('API reciters fetch failed', err);
      }

      // Fallback: Try Quran.com directly
      try {
        const quranRes = await fetch('https://api.quran.com/api/v4/recitations', { signal: AbortSignal.timeout(3000) });
        const quranData = await quranRes.json();
        const allReciters = quranData.recitations || [];
        if (allReciters.length > 0) {
          setReciters(allReciters);
          return;
        }
      } catch (err) {
        console.warn('Quran.com reciters fetch failed', err);
      }

      // Final fallback to mock data
      setReciters(qariOptions);
    };

    load();
  }, []);

  const handleEmotionClick = async (emotion: Emotion) => {
    setSelectedEmotion(emotion.id);
    setTimeout(() => {
      onEmotionSelect(emotion.id);
    }, 800);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#0f1117]' : 'bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50'} pt-28`}>
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
              onKeyPress={async (e) => {
                if (e.key === 'Enter' && customEmotion.trim()) {
                  setSelectedEmotion('custom');
                  try {
                    const res = await fetch(`${API_BASE}/api/emotion`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ text: customEmotion })
                    });
                    const data = await res.json();
                    if (data.aiRecommendation) {
                      localStorage.setItem('lastAIRecommendation', JSON.stringify(data.aiRecommendation));
                      // Prefetch audio for AI Recommendation
                      const url = await getAudioUrl(`${data.aiRecommendation.surah}:${data.aiRecommendation.ayah}`, preferredReciter || '7');
                      if (url) localStorage.setItem('autoPlayNext', url);
                    }
                    const map: Record<string, string> = { happy: 'grateful', sad: 'lost', anxious: 'anxious', angry: 'confused', neutral: 'peaceful' };
                    setTimeout(() => onEmotionSelect(map[data.emotion] || 'peaceful'), 400);
                  } catch (err) {
                    console.error('Emotion API failed', err);
                    setTimeout(() => onEmotionSelect('anxious'), 400);
                  }
                }
              }}
            />
            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
          </div>
        </motion.div>

        {/* Preferred reciter selector */}
        <div className="mt-8 w-full max-w-md text-center">
          <label className="text-sm text-slate-500 mb-2 block font-medium">Preferred reciter</label>
          <select value={preferredReciter || ''} onChange={(e) => { setPreferredReciter(e.target.value); localStorage.setItem('preferredReciter', e.target.value); }} className="w-full p-3 rounded-xl bg-white/70 border-2 border-white shadow-md outline-none text-slate-700">
            {reciters.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}