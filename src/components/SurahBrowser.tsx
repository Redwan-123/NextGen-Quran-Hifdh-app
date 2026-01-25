import { motion, AnimatePresence } from 'framer-motion'; // Changed to framer-motion for compatibility
import { API_BASE } from '../lib/api';
import { useState, useEffect, useRef } from 'react';
import { allSurahs, juzData, Surah } from '../data/surahData';
import { Search, BookMarked, Bookmark, Play, Pause, SkipBack, SkipForward, Filter, X, ChevronRight, Info, Share2 } from 'lucide-react';
import { qariOptions } from '../data/mockData';
import { Button } from './ui/button';

interface SurahBrowserProps {
  onSurahSelect: (surahNumber: number) => void;
  darkMode?: boolean;
}

export function SurahBrowser({ onSurahSelect, darkMode = false }: SurahBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'surah' | 'juz'>('surah');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [bookmarkedSurahs] = useState<number[]>([1, 18, 36, 67]);
  const [lastRead] = useState({ surah: 2, ayah: 156 });

  // --- NEW READING STATES ---
  const [readingSurah, setReadingSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [translationsList, setTranslationsList] = useState<any[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<number | null>(21);
  const [reciters, setReciters] = useState<any[]>([]);
  const [selectedReciterId, setSelectedReciterId] = useState<string | number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<{surah: number, ayah: number}[]>([]);

  // Load bookmarks on mount
  useEffect(() => {
    const saved = localStorage.getItem('quran_bookmarks');
    if (saved) {
      setBookmarkedAyahs(JSON.parse(saved));
    }
  }, []);

  // Helper function to get everyayah.com URL
  const getEveryAyahUrl = (reciterFolder: string, surah: number, ayah: number): string => {
    const surahPadded = String(surah).padStart(3, '0');
    const ayahPadded = String(ayah).padStart(3, '0');
    return `https://everyayah.com/data/${reciterFolder}/${surahPadded}${ayahPadded}.mp3`;
  };

  // Map reciter IDs to everyayah.com folder names
  const getReciterFolder = (reciterId: string | number | null): string => {
    const reciterMap: Record<string, string> = {
      'husary': 'Husary_128kbps',
      'minshawi': 'Minshawy_Murattal_128kbps',
      'sudais': 'Abdurrahmaan_As-Sudais_192kbps',
      'ajmi': 'Ahmed_ibn_Ali_al-Ajamy_128kbps',
      'abdulbasit': 'Abdul_Basit_Murattal_192kbps',
      'maher': 'Maher_AlMuaiqly_128kbps',
      'yasser': 'Yasser_Ad-Dussary_128kbps',
      'afasy': 'Alafasy_128kbps',
      'shuraim': 'Saood_ash-Shuraym_128kbps'
    };
    return reciterMap[String(reciterId)] || reciterMap['husary'];
  };

  // Play ayah audio
  const playAyahAudio = (ayahIndex: number) => {
    if (!readingSurah || !selectedReciterId) {
      console.warn('No surah or reciter selected');
      return;
    }

    const reciterFolder = getReciterFolder(selectedReciterId);
    const ayahNumber = ayahIndex + 1;
    const audioUrl = getEveryAyahUrl(reciterFolder, readingSurah.number, ayahNumber);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingAyah(ayahIndex);
    setIsPlaying(true);

    audio.play().catch(err => {
      console.error('Audio playback failed:', err);
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
      // Auto-play next ayah
      if (ayahIndex < verses.length - 1) {
        playAyahAudio(ayahIndex + 1);
      } else {
        setPlayingAyah(null);
      }
    };

    audio.onerror = () => {
      console.error('Audio failed to load');
      setIsPlaying(false);
      setPlayingAyah(null);
    };
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) {
      if (verses.length > 0) {
        playAyahAudio(playingAyah ?? 0);
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Play next ayah
  const playNext = () => {
    if (playingAyah === null) {
      playAyahAudio(0);
    } else if (playingAyah < verses.length - 1) {
      playAyahAudio(playingAyah + 1);
    }
  };

  // Play previous ayah
  const playPrevious = () => {
    if (playingAyah === null || playingAyah === 0) {
      playAyahAudio(0);
    } else {
      playAyahAudio(playingAyah - 1);
    }
  };

  // Toggle bookmark for current ayah
  const toggleBookmark = (ayahIndex: number) => {
    if (!readingSurah) return;

    const bookmark = { surah: readingSurah.number, ayah: ayahIndex + 1 };
    const exists = bookmarkedAyahs.some(b => b.surah === bookmark.surah && b.ayah === bookmark.ayah);

    let updated: typeof bookmarkedAyahs;
    if (exists) {
      updated = bookmarkedAyahs.filter(b => !(b.surah === bookmark.surah && b.ayah === bookmark.ayah));
    } else {
      updated = [...bookmarkedAyahs, bookmark];
    }

    setBookmarkedAyahs(updated);
    localStorage.setItem('quran_bookmarks', JSON.stringify(updated));
  };

  // Check if ayah is bookmarked
  const isBookmarked = (ayahIndex: number): boolean => {
    if (!readingSurah) return false;
    return bookmarkedAyahs.some(b => b.surah === readingSurah.number && b.ayah === ayahIndex + 1);
  };

  // --- FETCH VERSES FOR READING (with optional translation merge) ---
  useEffect(() => {
    if (!readingSurah) return;

    const fetchVerses = async () => {
      setLoading(true);
      try {
        // fetch Arabic text
        const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${readingSurah.number}`);
        const data = await res.json();
        let baseVerses = data?.verses || [];

        // if a translation is selected, try several endpoints and shapes
        if (selectedTranslation) {
          try {
            let tData: any = null;
            // Try multiple endpoints that the API may expose
            const endpoints = [
              `https://api.quran.com/api/v4/quran/translations/${selectedTranslation}?chapter_number=${readingSurah.number}`,
              `https://api.quran.com/api/v4/quran/translations/${selectedTranslation}/verses?chapter_number=${readingSurah.number}`,
              `https://api.quran.com/api/v4/translations/${selectedTranslation}/verses?chapter_number=${readingSurah.number}`,
            ];

            for (const ep of endpoints) {
              try {
                const tRes = await fetch(ep);
                if (!tRes.ok) continue;
                const json = await tRes.json();
                // prefer responses with arrays of translations/verses
                if (json && (Array.isArray(json.translations) || Array.isArray(json.verses) || Array.isArray(json.data))) {
                  tData = json;
                  break;
                }
                // fallback accept anything
                if (json) {
                  tData = json;
                  break;
                }
              } catch (innerErr) {
                // try next endpoint
                continue;
              }
            }

            if (tData) {
              // normalize into an array of items with verse_key and text
              let items: any[] = [];
              if (Array.isArray(tData.translations)) items = tData.translations;
              else if (Array.isArray(tData.verses)) items = tData.verses;
              else if (Array.isArray(tData.data)) items = tData.data;
              else if (Array.isArray(tData)) items = tData;

              // if items contain objects with translation text under `text` or `translation` or `translated_text`, normalize
              const translationsByKey: Record<string, any> = {};
              items.forEach((it: any) => {
                const key = it.verse_key || (it.verse && it.verse.verse_key) || (it.verse_id && String(it.verse_id)) || (it.verse && it.verse.verse_id && String(it.verse.verse_id));
                const text = it.text || it.translation || it.translated_text || (it.translation_text && it.translation_text.text) || (it.translations && it.translations[0] && it.translations[0].text) || null;
                if (key && text) translationsByKey[key] = { text };
              });

              baseVerses = baseVerses.map((v: any) => ({
                ...v,
                translation: translationsByKey[v.verse_key || String(v.id)] || v.translation || null,
              }));
            }
          } catch (err) {
            console.warn('Could not fetch translations for id', selectedTranslation, err);
          }
        }

        setVerses(baseVerses);
      } catch (err) {
        console.error('Error fetching verses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [readingSurah, selectedTranslation]);

  // fetch available translations list for selector
  useEffect(() => {
    const fetchTranslationsList = async () => {
      try {
        const res = await fetch('https://api.quran.com/api/v4/resources/translations');
        const data = await res.json();
        setTranslationsList(data?.translations || []);
      } catch (err) {
        console.warn('Could not load translations list', err);
      }
    };
    const fetchReciters = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reciters`);
        const json = await res.json();
        const list = json?.reciters || [];
        setReciters(list);
        const pref = typeof window !== 'undefined' ? localStorage.getItem('preferredReciter') : null;
        if (pref) setSelectedReciterId(pref);
        else if (list.length > 0 && !selectedReciterId) setSelectedReciterId(list[0].id || list[0].server || list[0].identifier);
      } catch (err) {
        console.warn('Could not load reciters', err);
      }
    };
    fetchTranslationsList();
    fetchReciters();
  }, []);

  const filteredSurahs = allSurahs.filter(surah => {
    const matchesSearch = 
      surah.name.includes(searchQuery) ||
      surah.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.translation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || surah.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-[#0f051a] via-[#1a0b2e] to-[#0f051a]' : 'bg-gradient-to-br from-slate-50 via-amber-50/30 to-yellow-50'}`}>
      <div className="max-w-7xl mx-auto px-6 pb-8">
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
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-2xl reading-panel h-screen shadow-2xl overflow-y-auto">
                  <div className="sticky top-0 bg-transparent backdrop-blur-md border-b p-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setReadingSurah(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-slate-100" /></button>
                      <div><h2 className="text-xl font-bold surah-name">{readingSurah.transliteration}</h2><p className="text-xs text-slate-200">{readingSurah.name} • {readingSurah.type}</p></div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <select value={selectedTranslation ?? ''} onChange={(e) => setSelectedTranslation(e.target.value ? Number(e.target.value) : null)} className="bg-transparent text-slate-200 text-sm border border-transparent focus:border-white/20 rounded-md p-2">
                        <option value="">No translation</option>
                        {translationsList.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <select value={selectedReciterId ?? ''} onChange={(e) => setSelectedReciterId(e.target.value || null)} className="bg-transparent text-slate-200 text-sm border border-transparent focus:border-white/20 rounded-md p-2">
                        <option value="">No reciter</option>
                        {(reciters && reciters.length ? reciters : qariOptions.map(q => ({ id: q.id, name: q.name }))).map((r) => (
                          <option key={r.id || r.server || r.identifier} value={r.id || r.server || r.identifier}>{r.name}</option>
                        ))}
                      </select>
                      <button className="p-2 text-slate-100"><Info size={20} /></button>
                    </div>
                  </div>
                  <div className="p-8 pb-32 app-bg">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-400 font-bold animate-pulse">Loading Mus'haf...</p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                        {readingSurah.number !== 9 && <div className="text-center text-4xl font-arabic py-8 border-b border-amber-50 text-slate-50">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>}
                        {verses.map((ayah, index) => (
                          <div key={index} className="border-b border-white/5 pb-8 last:border-0 ayah-card">
                            <div className="flex justify-between items-center mb-4">
                              <span className="w-7 h-7 rounded-full bg-amber-600/20 flex items-center justify-center text-[10px] font-bold text-amber-200">{index + 1}</span>
                              <div className="ayah-actions flex items-center gap-2">
                                <button 
                                  title="Bookmark" 
                                  onClick={() => toggleBookmark(index)} 
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                  <Bookmark 
                                    className={`w-4 h-4 ${
                                      isBookmarked(index) 
                                        ? 'fill-amber-400 text-amber-400' 
                                        : 'text-slate-100'
                                    }`} 
                                  />
                                </button>
                                <button title="Share" onClick={() => navigator.share ? navigator.share({ title: `${readingSurah.transliteration} - Ayah ${index+1}`, text: ayah.text_uthmani }) : console.log('share', index)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Share2 className="w-4 h-4 text-slate-100" /></button>
                                <button 
                                  title="Play" 
                                  onClick={() => playAyahAudio(index)} 
                                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                  <Play className="w-4 h-4 text-slate-100" />
                                </button>
                              </div>
                            </div>
                            <p className="ayah-text text-right" dir="rtl">{ayah.text_uthmani}</p>
                            <p className="translation">{(ayah.translation && ayah.translation.text) || (ayah.translations && ayah.translations[0] && ayah.translations[0].text) || ''}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Bottom Audio Control Bar */}
                {verses.length > 0 && (
                  <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900/95 via-violet-900/95 to-purple-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl z-50">
                    <div className="max-w-2xl mx-auto px-6 py-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Current Ayah Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">
                            {readingSurah?.transliteration} - Ayah {playingAyah !== null ? playingAyah + 1 : 1}
                          </p>
                          <p className="text-purple-200 text-xs truncate">
                            {reciters.find(r => r.id === selectedReciterId || r.server === selectedReciterId)?.name || 
                             qariOptions.find(q => q.id === selectedReciterId)?.name || 
                             'Al-Husary'}
                          </p>
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={playPrevious}
                            disabled={playingAyah === 0}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Previous Ayah"
                          >
                            <SkipBack className="w-5 h-5 text-white" />
                          </button>

                          <button
                            onClick={togglePlayPause}
                            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            title={isPlaying ? "Pause" : "Play"}
                          >
                            {isPlaying ? (
                              <Pause className="w-6 h-6 text-white fill-white" />
                            ) : (
                              <Play className="w-6 h-6 text-white fill-white" />
                            )}
                          </button>

                          <button
                            onClick={playNext}
                            disabled={playingAyah === verses.length - 1}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Next Ayah"
                          >
                            <SkipForward className="w-5 h-5 text-white" />
                          </button>
                        </div>

                        {/* Progress indicator */}
                        <div className="hidden sm:flex items-center gap-2 text-purple-200 text-xs">
                          <span>{playingAyah !== null ? playingAyah + 1 : 1}</span>
                          <span>/</span>
                          <span>{verses.length}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                          style={{ width: `${playingAyah !== null ? ((playingAyah + 1) / verses.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}