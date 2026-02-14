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
  const [selectedTranslation, setSelectedTranslation] = useState<number | null>(20);
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
        const params = new URLSearchParams({
          language: 'en',
          per_page: '300',
          fields: 'text_uthmani',
        });
        if (selectedTranslation) {
          params.append('translations', String(selectedTranslation));
        }
        const res = await fetch(
          `https://api.quran.com/api/v4/verses/by_chapter/${readingSurah.number}?${params.toString()}`
        );
        const data = await res.json();
        const base = (data?.verses || []).map((verse: any) => ({
          ...verse,
          translation: verse?.translations?.[0]?.text ? { text: verse.translations[0].text } : undefined,
        }));

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
    <div className="min-h-screen bg-gradient-to-br from-[#5a1a8c] via-[#7d2ba3] to-[#3a0d5c] !text-white">
      {!readingSurah && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-8">
          <h1 className="text-xl md:text-5xl lg:text-6xl font-bold !text-white mb-2">Browse the Qur'an</h1>
          <p className="text-xs md:text-lg !text-purple-200">Explore and read the Holy Quran</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 !text-purple-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search surahs by name..."
              className="w-full pl-12 pr-4 py-3 md:py-4 bg-white/10 backdrop-blur-md !text-white !placeholder-purple-200 rounded-2xl border border-purple-400/30 focus:border-purple-400/80 shadow-xl focus:ring-2 focus:ring-purple-400/50 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white/10 backdrop-blur-md rounded-xl border border-purple-400/30 p-1 shadow-lg">
              <button
                onClick={() => setViewMode('surah')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'surah' ? 'bg-purple-500/60 !text-white shadow-lg' : '!text-purple-100 hover:!text-white'
                }`}
              >
                By Surah
              </button>
              <button
                onClick={() => setViewMode('juz')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'juz' ? 'bg-purple-500/60 !text-white shadow-lg' : '!text-purple-100 hover:!text-white'
                }`}
              >
                By Juz
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl border border-purple-400/30 px-4 py-2 shadow-lg">
              <Filter className="w-4 h-4 !text-purple-300" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-transparent border-none outline-none text-sm !text-purple-100"
              >
                <option value="all" className="!bg-purple-900 !text-white">All Surahs</option>
                <option value="Meccan" className="!bg-purple-900 !text-white">Meccan Only</option>
                <option value="Medinan" className="!bg-purple-900 !text-white">Medinan Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {continueSurah && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`relative mb-10 rounded-[32px] p-6 md:p-8 shadow-lg overflow-hidden border bg-gradient-to-br from-purple-600/40 to-purple-900/40 border-purple-400/50`}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(168,85,247,0.4), transparent 60%)' }} />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <p className="uppercase tracking-[0.35em] text-[11px] !text-purple-200 mb-3">
                  {hasReadingHistory ? 'Continue reading' : 'Start your journey'}
                </p>
                <div className="flex flex-wrap items-baseline gap-3 !text-white">
                  <h3 className="text-2xl md:text-3xl font-semibold !text-white">{continueSurah.transliteration}</h3>
                  <span className="text-sm !text-purple-100">{continueSurah.name} • {continueSurah.type}</span>
                </div>
                <p className="text-sm !text-purple-100 mt-2">
                  {hasReadingHistory
                    ? `Ayah ${continueAyah} • ${continueSurah.totalVerses - continueAyah} left in this surah`
                    : 'Pick up from the very first revelation and we will track every ayah you complete.'}
                </p>
                {hasReadingHistory && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] !text-purple-200 mb-2">
                      <span>Progress</span>
                      <span>{lastReadProgress}% complete</span>
                    </div>
                    <div className="h-1.5 bg-purple-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-400 transition-all"
                        style={{ width: `${lastReadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={handleResumeClick}
                className="bg-purple-500 !text-white hover:bg-purple-600 shadow-lg shadow-purple-500/30 px-6 py-4 rounded-2xl text-base font-semibold flex items-center gap-2"
              >
                <Play className="w-4 h-4 !text-white" />
                {hasReadingHistory ? 'Resume' : 'Start now'}
              </Button>
            </div>
          </motion.div>
        )}

        {viewMode === 'surah' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurahs.map((surah, index) => {
              const isLastRead = lastRead?.surah === surah.number;
              return (
                <motion.button
                  key={surah.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.02 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleOpenSurah(surah)}
                  className={`relative w-full rounded-2xl p-6 border shadow-md hover:shadow-xl text-center flex flex-col items-center justify-center transition-all bg-white/10 backdrop-blur-md border-purple-400/30 hover:border-purple-400/60 hover:bg-white/15`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center !text-white font-bold text-xl shadow-lg mb-4">
                    {surah.number}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-arabic !text-white mb-2" dir="rtl">
                      {surah.name}
                    </h3>
                    <p className="font-semibold !text-white text-lg">{surah.transliteration}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tight ${
                          surah.type === 'Meccan' ? 'bg-purple-300/30 !text-purple-100' : 'bg-emerald-400/30 !text-emerald-100'
                        }`}
                      >
                        {surah.type}
                      </span>
                      <span className="text-xs !text-purple-200">{surah.totalVerses} Ayahs</span>
                    </div>
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
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30 shadow-md text-white"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center !text-white shadow-md font-bold text-xl">
                    {juz.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold !text-white">{juz.name}</h3>
                    <p className="text-sm !text-purple-200">{juz.description}</p>
                  </div>
                </div>
                <p className="text-sm !text-purple-100">
                  From {juz.startSurah} to {juz.endSurah}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs !text-purple-200">
                  <span>{juz.totalAyahs} Ayahs</span>
                  <span className="!text-purple-300 font-semibold flex items-center gap-1">
                    Explore <ChevronRight size={14} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      )}

      <AnimatePresence>
        {readingSurah && (
          <SurahReader
            surahName={readingSurah.transliteration}
            surahNameArabic={readingSurah.name}
            surahType={readingSurah.type}
            surahNumber={readingSurah.number}
            surahTranslation={readingSurah.translation}
            verses={verses}
            onClose={handleCloseReading}
            reciterDisplayName={reciterDisplayName}
            reciters={reciters}
            selectedReciterId={selectedReciterId}
            onReciterChange={setSelectedReciterId}
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
            isLoadingVerses={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
