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
        </div>
      </div>
    </div>
  );
}