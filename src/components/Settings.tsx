import { motion } from 'motion/react';
import { useState } from 'react';
import { Moon, Sun, Bell, Volume2, BookOpen, User, Shield, Info } from 'lucide-react';
import { Switch } from './ui/switch';

interface SettingsProps {
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

export function Settings({ darkMode, onDarkModeToggle }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [audioAutoplay, setAudioAutoplay] = useState(false);
  const [translationLanguage, setTranslationLanguage] = useState('english');

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50'}`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-4xl mb-2 ${
            darkMode 
              ? 'bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent'
          }`}>
            Settings
          </h1>
          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
            Customize your spiritual companion
          </p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-3xl p-6 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <h2 className={`text-xl mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Dark Mode
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Reduce eye strain during night reading
                  </p>
                </div>
                <Switch checked={darkMode} onCheckedChange={onDarkModeToggle} />
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-3xl p-6 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <h2 className={`text-xl mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <Bell className="w-5 h-5" />
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Practice Reminders
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Get notified when it's time to review
                  </p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </motion.div>

          {/* Audio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-3xl p-6 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <h2 className={`text-xl mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <Volume2 className="w-5 h-5" />
              Audio
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    Autoplay Recitation
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Automatically play when viewing ayahs
                  </p>
                </div>
                <Switch checked={audioAutoplay} onCheckedChange={setAudioAutoplay} />
              </div>
            </div>
          </motion.div>

          {/* Reading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-3xl p-6 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <h2 className={`text-xl mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <BookOpen className="w-5 h-5" />
              Reading
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Translation Language
                </h3>
                <select
                  value={translationLanguage}
                  onChange={(e) => setTranslationLanguage(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-200 text-slate-800'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="english">English</option>
                  <option value="urdu">Urdu</option>
                  <option value="arabic">Arabic (Tafsir)</option>
                  <option value="french">French</option>
                  <option value="spanish">Spanish</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-3xl p-6 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <h2 className={`text-xl mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <User className="w-5 h-5" />
              Account
            </h2>

            <div className="space-y-3">
              <button className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
              }`}>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Manage Profile
                </p>
              </button>
              <button className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
              }`}>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Sync Data
                </p>
              </button>
            </div>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`rounded-3xl p-6 shadow-xl border ${
              darkMode 
                ? 'bg-slate-800/50 backdrop-blur-xl border-slate-700' 
                : 'bg-white/80 backdrop-blur-xl border-white/50'
            }`}
          >
            <h2 className={`text-xl mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <Info className="w-5 h-5" />
              About
            </h2>

            <div className="space-y-3">
              <div className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                <p className="text-sm">Version 1.0.0</p>
                <p className="text-xs mt-2">
                  Built with love for the Muslim community 🌙
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
