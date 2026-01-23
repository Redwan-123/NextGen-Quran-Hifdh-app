<<<<<<< HEAD
import { motion } from 'motion/react';
import { useState } from 'react';
import { Moon, Sun, Bell, Volume2, BookOpen, User, Shield, Info } from 'lucide-react';
=======
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Volume2, BookOpen, User, Info, Trash2, Bookmark as BookmarkIcon } from 'lucide-react';
>>>>>>> b805ce2 (Initial commit with Premium Reading Mode and Bookmarks)
import { Switch } from './ui/switch';

interface SettingsProps {
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

export function Settings({ darkMode, onDarkModeToggle }: SettingsProps) {
<<<<<<< HEAD
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
=======
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quran_bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  const deleteBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem('quran_bookmarks', JSON.stringify(updated));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0f1117]' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
          <p className="text-slate-500">Manage your preferences and bookmarks</p>
        </motion.div>

        <div className="space-y-6">
          {/* Saved Bookmarks Section */}
          <motion.div className={`rounded-[2rem] p-8 shadow-xl border ${darkMode ? 'bg-slate-800/40 border-white/5' : 'bg-white border-slate-100'}`}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <BookmarkIcon className="text-amber-500" /> Saved Ayahs
            </h2>
            
            {bookmarks.length === 0 ? (
              <p className="text-slate-500 italic py-4 text-center">No bookmarks saved yet.</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {bookmarks.map((b) => (
                  <div key={b.id} className={`p-4 rounded-2xl flex justify-between items-center ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded">{b.surahName}</span>
                        <span className="text-xs text-slate-400">Verse {b.verseNumber}</span>
                      </div>
                      <p className={`text-sm font-arabic line-clamp-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} dir="rtl">{b.text}</p>
                    </div>
                    <button onClick={() => deleteBookmark(b.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Appearance Section */}
          <div className={`rounded-[2rem] p-8 shadow-xl border ${darkMode ? 'bg-slate-800/40 border-white/5' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">{darkMode ? <Moon /> : <Sun />}</div>
                <div>
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Dark Mode</h3>
                  <p className="text-xs text-slate-500">Toggle light/dark appearance</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={onDarkModeToggle} />
            </div>
          </div>
>>>>>>> b805ce2 (Initial commit with Premium Reading Mode and Bookmarks)
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> b805ce2 (Initial commit with Premium Reading Mode and Bookmarks)
