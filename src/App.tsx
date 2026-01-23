import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmotionalEntry } from './components/EmotionalEntry';
import { AyahExperience } from './components/AyahExperience';
import { HifdhDashboard } from './components/HifdhDashboard';
import { MentorshipPanel } from './components/MentorshipPanel';
import { AnalyticsMode } from './components/AnalyticsMode';
import { SurahBrowser } from './components/SurahBrowser';
import { FeatureShowcase } from './components/FeatureShowcase';
import { Home, BookOpen, Brain, Users, BarChart3, Menu, X, Book } from 'lucide-react';

type Screen = 'home' | 'ayah' | 'hifdh' | 'mentorship' | 'analytics' | 'surah-browser' | 'feature-showcase';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    setCurrentScreen('ayah');
  };

  const handleSurahSelect = (surahNumber: number) => {
    // Navigates to Browse to read the Surah
    console.log('Reading Surah:', surahNumber);
    setCurrentScreen('surah-browser');
  };

  const navigationItems = [
    { id: 'home' as Screen, label: 'Home', icon: Home },
    { id: 'surah-browser' as Screen, label: 'Browse', icon: Book },
    { id: 'hifdh' as Screen, label: 'Hifdh', icon: Brain },
    { id: 'mentorship' as Screen, label: 'Mentors', icon: Users },
    { id: 'analytics' as Screen, label: 'Insights', icon: BarChart3 },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Floating Navigation */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-full shadow-2xl border border-white/50 px-2 py-2 flex items-center gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setCurrentScreen(item.id);
                  setShowMenu(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-4 py-2.5 rounded-full transition-all ${
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden md:inline">{item.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Mobile Menu Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setShowMenu(!showMenu)}
        className="md:hidden fixed top-6 right-6 z-50 w-12 h-12 bg-white/80 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center border border-white/50"
      >
        {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </motion.button>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-20 right-6 z-40 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 p-4 min-w-[200px]"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentScreen(item.id);
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    currentScreen === item.id
                      ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Transitions */}
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <EmotionalEntry onEmotionSelect={handleEmotionSelect} />
          </motion.div>
        )}

        {currentScreen === 'ayah' && selectedEmotion && (
          <motion.div key="ayah" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <AyahExperience emotionId={selectedEmotion} onBack={() => setCurrentScreen('home')} />
          </motion.div>
        )}

        {currentScreen === 'hifdh' && (
          <motion.div key="hifdh" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <HifdhDashboard />
          </motion.div>
        )}

        {currentScreen === 'mentorship' && (
          <motion.div key="mentorship" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <MentorshipPanel />
          </motion.div>
        )}

        {currentScreen === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <AnalyticsMode />
          </motion.div>
        )}

        {currentScreen === 'surah-browser' && (
          <motion.div key="surah-browser" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <SurahBrowser onSurahSelect={handleSurahSelect} />
          </motion.div>
        )}

        {currentScreen === 'feature-showcase' && (
          <motion.div key="feature-showcase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <FeatureShowcase />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-violet-300/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}