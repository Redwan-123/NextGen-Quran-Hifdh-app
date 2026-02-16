import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Volume2, BookOpen, User, Info, Trash2, Bookmark as BookmarkIcon } from 'lucide-react';
import { Switch } from './ui/switch';

interface SettingsProps {
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

export function Settings({ darkMode, onDarkModeToggle }: SettingsProps) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    const load = () => {
      const detailed = localStorage.getItem('quran_bookmarks_detail');
      if (detailed) {
        try {
          setBookmarks(JSON.parse(detailed));
          return;
        } catch (e) {
          console.error('Failed to parse detailed bookmarks', e);
        }
      }

      const legacy = localStorage.getItem('quran_bookmarks');
      if (legacy) {
        try {
          const arr = JSON.parse(legacy);
          const normalized = arr.map((b: any, idx: number) => ({
            id: b.id || `${b.surah}-${b.ayah || b.verseNumber || idx + 1}`,
            surahNumber: b.surah || b.surahNumber,
            surahName: b.surahName || 'Surah',
            verseNumber: b.ayah || b.verseNumber,
            text: b.text || b.ayahText || '',
          }));
          setBookmarks(normalized);
        } catch (e) {
          console.error('Failed to parse legacy bookmarks', e);
        }
      }
    };
    load();
  }, []);

  const deleteBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem('quran_bookmarks_detail', JSON.stringify(updated));
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-[#0f051a] via-[#1a0b2e] to-[#0f051a]' : 'bg-slate-50'}`}>
      <div className="max-w-4xl mx-auto px-3 md:px-6 pb-8 md:pb-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
          <h1 className={`text-base md:text-2xl font-bold mb-1 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
          <p className={`text-[10px] md:text-sm transition-colors duration-300 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Manage your preferences and bookmarks</p>
        </motion.div>

        <div className="space-y-6">
          {/* Saved Bookmarks Section */}
          <motion.div className={`rounded-xl p-4 md:p-6 shadow-xl border transition-colors duration-300 ${darkMode ? 'bg-purple-900/20 border-purple-500/20 backdrop-blur-xl' : 'bg-white border-slate-100'}`}>
            <h2 className={`text-sm md:text-lg font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <BookmarkIcon className="w-4 h-4 text-amber-500" /> Saved Ayahs
            </h2>
            
            {bookmarks.length === 0 ? (
              <p className="text-slate-500 italic py-3 text-center text-xs">No bookmarks saved yet.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {bookmarks.map((b) => (
                  <div key={b.id} className={`p-2 md:p-3 rounded-lg flex justify-between items-center gap-2 ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-1.5 items-center mb-0.5 flex-wrap">
                        <span className="text-[8px] font-bold bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">{b.surahName || `Surah ${b.surahNumber}`}</span>
                        <span className="text-[8px] text-slate-400">V{b.verseNumber}</span>
                      </div>
                      <p className={`text-xs font-arabic line-clamp-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} dir="rtl">{b.text}</p>
                    </div>
                    <button onClick={() => deleteBookmark(b.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Appearance Section */}
          <div className={`rounded-xl p-4 md:p-6 shadow-xl border transition-colors duration-300 ${darkMode ? 'bg-purple-900/20 border-purple-500/20 backdrop-blur-xl' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 transition-colors duration-300 ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-500/10 text-indigo-500'}`}>{darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</div>
                <div className="min-w-0">
                  <h3 className={`font-bold text-sm transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Dark Mode</h3>
                  <p className={`text-[10px] transition-colors duration-300 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Toggle appearance</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    console.log('Dark mode toggle clicked, current:', darkMode);
                    onDarkModeToggle();
                  }}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {darkMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}