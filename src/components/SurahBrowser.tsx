import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bookmark,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Filter,
  X,
  ChevronRight,
  Share2,
  Home,
  BookOpen,
  Users,
  BarChart3,
} from 'lucide-react';

import { Button } from './ui/button';
import { API_BASE } from '../lib/api';
import { qariOptions } from '../data/mockData';
import { allSurahs, juzData, Surah } from '../data/surahData';
import { SurahReader } from './SurahReader';

interface SurahBrowserProps {
  onSurahSelect: (surahNumber: number) => void;
  darkMode?: boolean;
}

type LastRead = { surah: number; ayah: number } | null;

const heroTabs = ['Landing', 'Home', 'Browse', 'Hifdh', 'Mentors', 'Insights'];

const verseProgressPercent = (total: number, idx: number | null) => {
  if (!total || idx === null) return 0;
  return Math.min(100, ((idx + 1) / total) * 100);
};

const getAyahTranslation = (ayah: any) => {
  if (!ayah) return '';
  if (ayah.translation?.text) return ayah.translation.text;
  if (Array.isArray(ayah.translations) && ayah.translations[0]?.text) return ayah.translations[0].text;
  return '';
};

export function SurahBrowser({ onSurahSelect, darkMode = false }: SurahBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'surah' | 'juz'>('surah');
  const [filterType, setFilterType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [bookmarkedSurahs] = useState<number[]>([1, 18, 36, 67]);
  const [lastRead, setLastRead] = useState<LastRead>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('quran_last_read') : null;
    return saved ? JSON.parse(saved) : null;
  });

  const [readingSurah, setReadingSurah] = useState<Surah | null>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [translationsList, setTranslationsList] = useState<any[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<number | null>(21);
  const [reciters, setReciters] = useState<any[]>([]);
  const [selectedReciterId, setSelectedReciterId] = useState<string | number | null>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('preferredReciter') : null;
    return saved || qariOptions[0]?.id || 'husary';
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<{ surah: number; ayah: number }[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('quran_bookmarks') : null;
    return saved ? JSON.parse(saved) : [];
  });
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ayahToggleRef = useRef<HTMLDivElement | null>(null);

  const preferredReciter = useMemo(() => selectedReciterId || qariOptions[0]?.id || 'husary', [selectedReciterId]);
  const hasReadingHistory = Boolean(lastRead);
  const continueSurah = hasReadingHistory
    ? allSurahs.find((s) => s.number === lastRead?.surah) || allSurahs[0]
    : allSurahs[0];
  const continueAyah = lastRead?.ayah || 1;
  const lastReadProgress = hasReadingHistory && continueSurah
    ? Math.min(100, Math.round((continueAyah / continueSurah.totalVerses) * 100))
    : 0;

  const reciterDisplayName = useMemo(() => {
    return (
      reciters.find((r) => r.id === preferredReciter || r.server === preferredReciter)?.name ||
      qariOptions.find((q) => q.id === preferredReciter)?.name ||
      'Al-Husary'
    );
  }, [preferredReciter, reciters]);

  const currentAyahIndex = readingSurah && verses.length
    ? (playingAyah ?? (lastRead?.surah === readingSurah.number ? Math.min(verses.length - 1, Math.max(0, lastRead.ayah - 1)) : null))
    : null;

  const updateLastRead = (surahNum: number, ayahNum: number) => {
    const payload = { surah: surahNum, ayah: ayahNum };
    setLastRead(payload);
    if (typeof window !== 'undefined') {
      localStorage.setItem('quran_last_read', JSON.stringify(payload));
    }
  };

  const handleOpenSurah = (surah: Surah) => {
    setReadingSurah(surah);
    onSurahSelect?.(surah.number);
  };

  const handleResumeClick = () => {
    if (continueSurah) {
      handleOpenSurah(continueSurah);
    }
  };

  const handleCloseReading = () => {
    setReadingSurah(null);
    setPlayingAyah(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleAyahToggleSelect = (index: number) => {
    setPlayingAyah(index);
    if (readingSurah) {
      updateLastRead(readingSurah.number, index + 1);
    }
  };

  const toggleBookmark = (ayahIndex: number) => {
    if (!readingSurah) return;
    const ayahNum = ayahIndex + 1;
    const existing = bookmarkedAyahs.some((b) => b.surah === readingSurah.number && b.ayah === ayahNum);
    const updated = existing
      ? bookmarkedAyahs.filter((b) => !(b.surah === readingSurah.number && b.ayah === ayahNum))
      : [...bookmarkedAyahs, { surah: readingSurah.number, ayah: ayahNum }];
    setBookmarkedAyahs(updated);
    localStorage.setItem('quran_bookmarks', JSON.stringify(updated));
    updateLastRead(readingSurah.number, ayahNum);
  };

  const isAyahBookmarked = (ayahIndex: number) => {
    if (!readingSurah) return false;
    return bookmarkedAyahs.some((b) => b.surah === readingSurah.number && b.ayah === ayahIndex + 1);
  };

  const playAyahAudio = async (ayahIndex: number) => {
    if (!readingSurah) return;
    setIsAudioLoading(true);
    try {
      const url = `${API_BASE}/api/audio?reciter=${preferredReciter}&surah=${readingSurah.number}&ayah=${ayahIndex + 1}`;
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          // Auto-play next ayah
          if (ayahIndex < verses.length - 1) {
            playAyahAudio(ayahIndex + 1);
          }
        });
      }
      audioRef.current.src = url;
      await audioRef.current.play();
      setIsPlaying(true);
      setPlayingAyah(ayahIndex);
      updateLastRead(readingSurah.number, ayahIndex + 1);
    } catch (err) {
      console.error('Audio play failed', err);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const idx = currentAyahIndex !== null ? currentAyahIndex : 0;
      playAyahAudio(idx);
    }
  };

  const playNext = () => {
    if (!readingSurah || !verses.length) return;
    const nextIndex = currentAyahIndex !== null ? Math.min(verses.length - 1, (currentAyahIndex as number) + 1) : 0;
    playAyahAudio(nextIndex);
  };

  const playPrevious = () => {
    if (!readingSurah || !verses.length) return;
    const prevIndex = currentAyahIndex !== null ? Math.max(0, (currentAyahIndex as number) - 1) : 0;
    playAyahAudio(prevIndex);
  };

  useEffect(() => {
    if (!readingSurah) return;

    const fetchVerses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${readingSurah.number}`);
        const data = await res.json();
        let base = data?.verses || [];

        if (selectedTranslation) {
          try {
            const tRes = await fetch(`https://api.quran.com/api/v4/quran/translations/${selectedTranslation}?chapter_number=${readingSurah.number}`);
            const tJson = await tRes.json();
            const translations = tJson?.translations || [];
            const map = translations.reduce((acc: Record<string, any>, item: any) => {
              if (item.verse_key && item.text) {
                acc[item.verse_key] = item.text;
              }
              return acc;
            }, {});
            base = base.map((v: any) => ({ ...v, translation: { text: map[v.verse_key] } }));
          } catch (err) {
            console.warn('Translation fetch failed', err);
          }
        }

        ayahRefs.current = [];
        setVerses(base);
      } catch (err) {
        console.error('Error fetching verses', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [readingSurah, selectedTranslation]);
  useEffect(() => {
    if (!readingSurah || !lastRead || lastRead.surah !== readingSurah.number || verses.length === 0) return;
    const idx = Math.max(0, Math.min(verses.length - 1, lastRead.ayah - 1));
    const el = ayahRefs.current[idx];
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    }
  }, [readingSurah, verses, lastRead]);

  useEffect(() => {
    if (!readingSurah || verses.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            const idx = Number(entry.target.dataset.index ?? -1);
            if (idx >= 0) {
              updateLastRead(readingSurah.number, idx + 1);
            }
          }
        });
      },
      { threshold: 0.55 }
    );

    ayahRefs.current.forEach((node, idx) => {
      if (node) {
        node.dataset.index = String(idx);
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [readingSurah, verses]);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const res = await fetch('https://api.quran.com/api/v4/resources/translations');
        const data = await res.json();
        setTranslationsList(data?.translations || []);
      } catch (err) {
        console.warn('Could not fetch translations', err);
      }
    };

    const fetchReciters = async () => {
      // Use local mock data directly
      setReciters(qariOptions);
      if (!selectedReciterId && qariOptions.length) {
        setSelectedReciterId(qariOptions[0].id);
      }
    };

    fetchTranslations();
    fetchReciters();
  }, []);

  const filteredSurahs = allSurahs.filter((surah) => {
    const searchMatch =
      surah.name.includes(searchQuery) ||
      surah.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const filterMatch = filterType === 'all' || surah.type === filterType;
    return searchMatch && filterMatch;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-orange-500">Browse the Qur'an</h1>
          <p className={`text-sm md:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Teleport into any Surah instantly with immersive reading tools.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, transliteration, or meaning..."
              className="w-full pl-12 pr-4 py-3 md:py-4 bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              <button
                onClick={() => setViewMode('surah')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'surah' ? 'bg-purple-100 text-purple-700 shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                By Surah
              </button>
              <button
                onClick={() => setViewMode('juz')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'juz' ? 'bg-purple-100 text-purple-700 shadow' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                By Juz
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2 shadow-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-transparent border-none outline-none text-sm text-slate-600"
              >
                <option value="all" className="bg-white text-slate-900">All Surahs</option>
                <option value="Meccan" className="bg-white text-slate-900">Meccan Only</option>
                <option value="Medinan" className="bg-white text-slate-900">Medinan Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {continueSurah && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`relative mb-10 rounded-[32px] p-6 md:p-8 shadow-lg overflow-hidden border ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700 text-white border-slate-600' : 'bg-gradient-to-br from-purple-50 to-purple-100 text-slate-900 border-purple-200'}`}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(168,85,247,0.2), transparent 60%)' }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <p className="uppercase tracking-[0.35em] text-[11px] text-slate-600 mb-3">
                  {hasReadingHistory ? 'Continue reading' : 'Start your journey'}
                </p>
                <div className="flex flex-wrap items-baseline gap-3 text-slate-900">
                  <h3 className="text-2xl md:text-3xl font-semibold">{continueSurah.transliteration}</h3>
                  <span className="text-sm text-slate-700">{continueSurah.name} • {continueSurah.type}</span>
                </div>
                <p className="text-sm text-slate-700 mt-2">
                  {hasReadingHistory
                    ? `Ayah ${continueAyah} • ${continueSurah.totalVerses - continueAyah} left in this surah`
                    : 'Pick up from the very first revelation and we will track every ayah you complete.'}
                </p>
                {hasReadingHistory && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-600 mb-2">
                      <span>Progress</span>
                      <span>{lastReadProgress}% complete</span>
                    </div>
                    <div className="h-1.5 bg-slate-300 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-600 transition-all"
                        style={{ width: `${lastReadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={handleResumeClick}
                className="bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 px-6 py-4 rounded-2xl text-base font-semibold flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {hasReadingHistory ? 'Resume' : 'Start now'}
              </Button>
            </div>
          </motion.div>
        )}

        {viewMode === 'surah' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredSurahs.map((surah, index) => {
              const isLastRead = lastRead?.surah === surah.number;
              return (
                <motion.button
                  key={surah.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.02 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  onClick={() => handleOpenSurah(surah)}
                  className={`relative rounded-2xl p-6 border shadow-md hover:shadow-lg text-left ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                >
                  {isLastRead && (
                    <span className="absolute top-4 left-4 px-2 py-1 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700">
                      In progress
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-medium">
                      {surah.number}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tight ${
                        surah.type === 'Meccan' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {surah.type}
                    </span>
                  </div>
                  <h3 className="text-2xl text-right font-arabic text-slate-900" dir="rtl">
                    {surah.name}
                  </h3>
                  <div className="mt-2">
                    <p className="font-semibold text-slate-900">{surah.transliteration}</p>
                    <p className="text-sm text-slate-600">{surah.translation}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200 mt-4">
                    <span>{surah.totalVerses} Ayahs</span>
                    <span className="flex items-center gap-1 text-purple-600 font-semibold">
                      Read <ChevronRight size={14} />
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {viewMode === 'juz' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {juzData.map((juz, index) => (
              <motion.div
                key={juz.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.02 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md text-slate-900"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md font-bold text-xl">
                    {juz.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{juz.name}</h3>
                    <p className="text-sm text-slate-600">{juz.description}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  From {juz.startSurah} to {juz.endSurah}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{juz.totalAyahs} Ayahs</span>
                  <span className="text-purple-600 font-semibold flex items-center gap-1">
                    Explore <ChevronRight size={14} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {readingSurah && (
          <SurahReader
            surahName={readingSurah.transliteration}
            surahNameArabic={readingSurah.name}
            surahType={readingSurah.type}
            surahNumber={readingSurah.number}
            verses={verses}
            onClose={handleCloseReading}
            reciterDisplayName={reciterDisplayName}
            isPlaying={isPlaying}
            currentAyahIndex={currentAyahIndex}
            onTogglePlayPause={togglePlayPause}
            onPlayNext={playNext}
            onPlayPrevious={playPrevious}
            isAudioLoading={isAudioLoading}
            onAyahSelect={handleAyahToggleSelect}
            bookmarkedAyahs={bookmarkedAyahs}
            onToggleBookmark={toggleBookmark}
            onAudioPlay={playAyahAudio}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
