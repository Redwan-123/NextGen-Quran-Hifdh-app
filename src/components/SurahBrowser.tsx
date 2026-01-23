import { motion, AnimatePresence } from 'framer-motion'; // Changed to framer-motion for compatibility
import { useState, useEffect } from 'react';
import { allSurahs, juzData, Surah } from '../data/surahData';
import { Search, BookMarked, Bookmark, Play, Filter, X, ChevronRight, Info } from 'lucide-react';
import { Button } from './ui/button';

interface SurahBrowserProps {
  onSurahSelect: (surahNumber: number) => void;
}

export function SurahBrowser({ onSurahSelect }: SurahBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'surah' | 'juz'>('surah');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [bookmarkedSurahs] = useState<number[]>([1, 18, 36, 67]);
  const [lastRead] = useState({ surah: 2, ayah: 156 });

  // --- NEW READING STATES ---
  const [readingSurah, setReadingSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- FETCH VERSES FOR READING ---
  useEffect(() => {
    if (readingSurah) {
      const fetchVerses = async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${readingSurah.number}`
          );
          const data = await res.json();
          setVerses(data.verses);
        } catch (err) {
          console.error("Error fetching verses:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchVerses();
    }
  }, [readingSurah]);

  const filteredSurahs = allSurahs.filter(surah => {
    const matchesSearch = 
      surah.name.includes(searchQuery) ||
      surah.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.translation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || surah.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
            Explore the Qur'an
          </h1>
          <p className="text-slate-600">Read and discover all 114 Surahs with beautiful organization</p>
        </motion.div>

        {/* Search and Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, transliteration, or meaning..."
              className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-white/50 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/50 text-slate-700 placeholder:text-slate-400 shadow-lg transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 p-1 shadow-md">
              <button onClick={() => setViewMode('surah')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'surah' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
                By Surah
              </button>
              <button onClick={() => setViewMode('juz')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'juz' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
                By Juz
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 px-4 py-2 shadow-md">
              <Filter className="w-4 h-4 text-slate-500" />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="bg-transparent border-none outline-none text-sm text-slate-700 cursor-pointer">
                <option value="all">All Surahs</option>
                <option value="Meccan">Meccan Only</option>
                <option value="Medinan">Medinan Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Last Read Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Continue Reading</p>
              <h3 className="text-2xl mb-1">{allSurahs[lastRead.surah - 1].transliteration}</h3>
              <p className="text-sm opacity-90">Ayah {lastRead.ayah} • Page {allSurahs[lastRead.surah - 1].pages.start}</p>
            </div>
            <Button onClick={() => setReadingSurah(allSurahs[lastRead.surah - 1])} className="bg-white text-amber-600 hover:bg-white/90 shadow-lg">
              <Play className="w-4 h-4 mr-2" /> Resume
            </Button>
          </div>
        </motion.div>

        {/* Surah Grid */}
        {viewMode === 'surah' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurahs.map((surah, index) => {
              const isBookmarked = bookmarkedSurahs.includes(surah.number);
              const isLastRead = lastRead.surah === surah.number;

              return (
                <motion.button
                  key={surah.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.02) }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => setReadingSurah(surah)} // UPDATED: Now opens reading mode
                  className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all text-left group"
                >
                  {isBookmarked && <div className="absolute top-4 right-4"><Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" /></div>}
                  {isLastRead && <div className="absolute top-4 left-4 px-2 py-1 bg-amber-100 rounded-full text-[10px] text-amber-700 font-bold">Reading</div>}
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-medium shadow-md">
                      {surah.number}
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter ${surah.type === 'Meccan' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {surah.type}
                    </span>
                  </div>

                  <h3 className="text-3xl text-slate-800 mb-2 text-right font-arabic" dir="rtl">{surah.name}</h3>
                  <div className="mb-3">
                    <p className="font-bold text-slate-800">{surah.transliteration}</p>
                    <p className="text-sm text-slate-500">{surah.translation}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                    <span>{surah.totalVerses} Ayahs</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">Read <ChevronRight size={14}/></span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Juz View */}
        {viewMode === 'juz' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {juzData.map((juz, index) => (
              <motion.div key={juz.number} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + (index * 0.02) }} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md font-bold text-xl">{juz.number}</div>
                  <div><h3 className="text-lg font-bold text-slate-800">{juz.name}</h3><p className="text-xs text-slate-500">30 Sections</p></div>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between"><span>Starts:</span><span className="font-bold">{allSurahs[juz.startSurah - 1].transliteration}</span></div>
                  <div className="flex justify-between"><span>Ends:</span><span className="font-bold">{allSurahs[juz.endSurah - 1].transliteration}</span></div>
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">Read Juz {juz.number}</Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* --- READING OVERLAY (New Feature) --- */}
        <AnimatePresence>
          {readingSurah && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex justify-end">
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-2xl bg-white h-screen shadow-2xl overflow-y-auto">
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b p-6 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setReadingSurah(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-600" /></button>
                    <div><h2 className="text-xl font-bold text-slate-900">{readingSurah.transliteration}</h2><p className="text-xs text-slate-500">{readingSurah.name} • {readingSurah.type}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-amber-500"><Info size={20} /></button>
                  </div>
                </div>
                <div className="p-8 pb-32">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-400 font-bold animate-pulse">Loading Mus'haf...</p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {readingSurah.number !== 9 && <div className="text-center text-4xl font-arabic py-8 border-b border-amber-50 text-slate-800">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>}
                      {verses.map((ayah, index) => (
                        <div key={index} className="border-b border-slate-50 pb-8 last:border-0">
                          <div className="flex justify-between items-center mb-6">
                            <span className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-600">{index + 1}</span>
                          </div>
                          <p className="text-4xl text-right font-arabic leading-[2.5] text-slate-900" dir="rtl">{ayah.text_uthmani}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}