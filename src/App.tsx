import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { EmotionalEntry } from './components/EmotionalEntry';
import { AyahExperience } from './components/AyahExperience';
import { TeacherDashboard } from './components/TeacherDashboard';
import { MentorshipPanel } from './components/MentorshipPanel';
import { AnalyticsMode } from './components/AnalyticsMode';
import { SurahBrowser } from './components/SurahBrowser';
import { FeatureShowcase } from './components/FeatureShowcase';
import { Settings } from './components/Settings';

type Screen = 'landing' | 'login' | 'home' | 'ayah' | 'dashboard' | 'mentorship' | 'analytics' | 'surah-browser' | 'feature-showcase' | 'settings';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    // If already logged in, skip landing
    return 'landing';
  });
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quran_dark_mode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // When user logs in, redirect away from landing/login
  useEffect(() => {
    if (user && (currentScreen === 'landing' || currentScreen === 'login')) {
      setCurrentScreen('dashboard');
    }
    if (!user && currentScreen !== 'landing' && currentScreen !== 'login') {
      setCurrentScreen('landing');
    }
  }, [user, currentScreen]);


  // Persist darkMode to localStorage and toggle dark class
  useEffect(() => {
    localStorage.setItem('quran_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f051a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

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
    { id: 'home' as Screen, label: 'Emotions', icon: (props: any) => <span {...props} className={props.className + " flex items-center justify-center grayscale-0 text-lg"} style={{ fontSize: window.innerWidth < 768 ? '0.9em' : '1.2em' }}>🤲</span> },
    { id: 'surah-browser' as Screen, label: 'Browse', icon: (props: any) => <span {...props} className={props.className + " flex items-center justify-center grayscale-0 text-lg"} style={{ fontSize: window.innerWidth < 768 ? '0.9em' : '1.2em' }}>📚</span> },
    { id: 'dashboard' as Screen, label: 'Dashboard', icon: (props: any) => <span {...props} className={props.className + " flex items-center justify-center grayscale-0 text-lg"} style={{ fontSize: window.innerWidth < 768 ? '0.9em' : '1.2em' }}>📋</span> },
    { id: 'mentorship' as Screen, label: 'Mentors', icon: (props: any) => <span {...props} className={props.className + " flex items-center justify-center grayscale-0 text-lg"} style={{ fontSize: window.innerWidth < 768 ? '0.9em' : '1.2em' }}>🧑‍💼</span> },
    { id: 'analytics' as Screen, label: 'Insights', icon: (props: any) => <span {...props} className={props.className + " flex items-center justify-center grayscale-0 text-lg"} style={{ fontSize: window.innerWidth < 768 ? '0.9em' : '1.2em' }}>📈</span> },
    { id: 'settings' as Screen, label: 'Settings', icon: (props: any) => <span {...props} className={props.className + " flex items-center justify-center grayscale-0 text-lg"} style={{ fontSize: window.innerWidth < 768 ? '0.9em' : '1.2em' }}>⚙️</span> },
  ];

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#0f1117]' : 'bg-slate-50'}`}>
      {/* Floating Navigation - Hidden on Landing/Login */}
      {currentScreen !== 'landing' && currentScreen !== 'login' && (
      <>
      {/* Top-right brand badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-5 right-5 z-50 flex items-center gap-2.5"
      >
        <motion.div 
          className="w-9 h-9 rounded-xl bg-purple-600/80 backdrop-blur-md border border-purple-400/25 flex items-center justify-center shadow-lg shadow-purple-900/30 text-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </motion.div>
        <span className="text-sm font-extrabold text-white tracking-tight hidden sm:inline">
          Quran<span className="text-amber-400">Verse</span>
        </span>
      </motion.div>

      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="rounded-full border border-white/10 px-1.5 py-1.5 flex items-center gap-0.5 bg-[#4a167a]/90 shadow-[0_25px_70px_rgba(37,3,68,0.55)] backdrop-blur-2xl">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setCurrentScreen(item.id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-3 py-1.5 rounded-full transition-all reader-sans text-[0.6rem] font-semibold uppercase tracking-[0.25em] ${
                  isActive 
                    ? 'text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]' 
                    : 'text-purple-100/70 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full bg-[#2d0745]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
      </>
      )}

      {/* Spacer to push content below fixed nav */}
      {currentScreen !== 'landing' && currentScreen !== 'login' && <div className="h-32 sm:h-36 md:h-44"></div>}

      {/* Screen Transitions */}
      <AnimatePresence mode="wait">
        {currentScreen === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <LandingPage
              onGetStarted={() => user ? setCurrentScreen('home') : setCurrentScreen('login')}
              onLogin={!user ? () => setCurrentScreen('login') : undefined}
            />
          </motion.div>
        )}

        {currentScreen === 'login' && !user && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <LoginPage onBack={() => setCurrentScreen('landing')} />
          </motion.div>
        )}

        {currentScreen === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <EmotionalEntry onEmotionSelect={handleEmotionSelect} darkMode={darkMode} />
          </motion.div>
        )}

        {currentScreen === 'ayah' && selectedEmotion && (
          <motion.div key="ayah" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <AyahExperience emotionId={selectedEmotion} onBack={() => setCurrentScreen('home')} darkMode={darkMode} />
          </motion.div>
        )}

        {currentScreen === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <TeacherDashboard darkMode={darkMode} />
          </motion.div>
        )}

        {currentScreen === 'mentorship' && (
          <motion.div key="mentorship" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
            <MentorshipPanel darkMode={darkMode} />
          </motion.div>
        )}

        {currentScreen === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <AnalyticsMode darkMode={darkMode} />
          </motion.div>
        )}

        {currentScreen === 'surah-browser' && (
          <motion.div key="surah-browser" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <SurahBrowser onSurahSelect={handleSurahSelect} darkMode={darkMode} />
          </motion.div>
        )}

        {currentScreen === 'feature-showcase' && (
          <motion.div key="feature-showcase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <FeatureShowcase />
          </motion.div>
        )}

        {currentScreen === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Settings darkMode={darkMode} onDarkModeToggle={() => setDarkMode(!darkMode)} onSignOut={() => setCurrentScreen('landing')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Elements Removed */}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}