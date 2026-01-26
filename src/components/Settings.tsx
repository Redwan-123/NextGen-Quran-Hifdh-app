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
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
          <p className={`transition-colors duration-300 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Manage your preferences and bookmarks</p>
        </motion.div>

        <div className="space-y-6">
          {/* Saved Bookmarks Section */}
          <motion.div className={`rounded-[2rem] p-8 shadow-xl border transition-colors duration-300 ${darkMode ? 'bg-purple-900/20 border-purple-500/20 backdrop-blur-xl' : 'bg-white border-slate-100'}`}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
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
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded">{b.surahName || `Surah ${b.surahNumber}`}</span>
                        <span className="text-xs text-slate-400">Verse {b.verseNumber}</span>
                      </div>
                      <p className={`text-sm font-arabic line-clamp-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`} dir="rtl">{b.text}</p>
                    </div>
                    <button onClick={() => deleteBookmark(b.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Appearance Section */}
          <div className={`rounded-[2rem] p-8 shadow-xl border transition-colors duration-300 ${darkMode ? 'bg-purple-900/20 border-purple-500/20 backdrop-blur-xl' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-colors duration-300 ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-500/10 text-indigo-500'}`}>{darkMode ? <Moon /> : <Sun />}</div>
                <div>
                  <h3 className={`font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Dark Mode</h3>
                  <p className={`text-xs transition-colors duration-300 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Toggle light/dark appearance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    console.log('Dark mode toggle clicked, current:', darkMode);
                    onDarkModeToggle();
                  }}
                  className={`px-6 py-2 rounded-lg font-bold transition-colors duration-300 ${
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