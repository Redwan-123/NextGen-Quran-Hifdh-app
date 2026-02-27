/**
 * QuranPage — Reusable Mushaf page component.
 *
 * Displays a single page of the Qur'an with authentic Uthmani text
 * from the Quran.com API. Renders a realistic book-style layout with:
 * - Decorative frame & ornaments
 * - Surah headers with Arabic name
 * - Bismillah for each new surah
 * - Clickable ayahs with numbered markers
 * - Mistake indicators
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPageVerses, fetchAllChapters, type Verse, type Chapter, type PageData } from '../lib/quranApi';

// ===== Props =====

export interface AyahMistakeInfo {
  surah: number;
  ayah: number;
  count: number;
}

interface QuranPageProps {
  page: number;
  darkMode: boolean;
  mistakes?: AyahMistakeInfo[];
  selectedAyah?: { surah: number; ayah: number } | null;
  sessionActive?: boolean;
  onAyahClick?: (verse: Verse) => void;
  compact?: boolean;
}

// ===== Component =====

export function QuranPage({
  page,
  darkMode,
  mistakes = [],
  selectedAyah = null,
  sessionActive = false,
  onAyahClick,
  compact = false,
}: QuranPageProps) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [pd, chs] = await Promise.all([
          fetchPageVerses(page),
          fetchAllChapters(),
        ]);
        if (!cancelled) {
          setPageData(pd);
          setChapters(chs);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load Quran page. Please check your internet connection.');
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [page]);

  // Build a quick lookup for mistakes
  const mistakeMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const mi of mistakes) {
      m.set(`${mi.surah}:${mi.ayah}`, mi.count);
    }
    return m;
  }, [mistakes]);

  // Group verses by chapter to render surah headers
  const verseGroups = useMemo(() => {
    if (!pageData) return [];
    const groups: { chapterId: number; chapter: Chapter | undefined; verses: Verse[] }[] = [];
    let currentChapterId: number | null = null;

    for (const verse of pageData.verses) {
      if (verse.chapter_id !== currentChapterId) {
        currentChapterId = verse.chapter_id;
        groups.push({
          chapterId: verse.chapter_id,
          chapter: chapters.find(c => c.id === verse.chapter_id),
          verses: [],
        });
      }
      groups[groups.length - 1].verses.push(verse);
    }
    return groups;
  }, [pageData, chapters]);

  // ===== Loading =====
  if (loading) {
    return (
      <div className={`rounded-3xl border overflow-hidden ${
        darkMode ? 'bg-[#0d0a1a] border-amber-500/10' : 'bg-[#faf6ee] border-amber-200'
      }`}>
        <div className={`h-1.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent`} />
        <div className="flex items-center justify-center py-32">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full"
          />
        </div>
        <div className={`h-1.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent`} />
      </div>
    );
  }

  // ===== Error =====
  if (error) {
    return (
      <div className={`rounded-3xl border p-10 text-center ${
        darkMode ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-600'
      }`}>
        <div className="text-3xl mb-3">⚠️</div>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!pageData || pageData.verses.length === 0) {
    return (
      <div className={`rounded-3xl border p-10 text-center ${
        darkMode ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-50 border-gray-200 text-gray-400'
      }`}>
        <p className="text-sm">No verses found for page {page}.</p>
      </div>
    );
  }

  // ===== Render =====
  return (
    <div className={`rounded-3xl border overflow-hidden shadow-xl transition-colors duration-300 ${
      darkMode
        ? 'bg-[#0d0a1a] border-amber-500/10 shadow-amber-900/10'
        : 'bg-[#faf6ee] border-amber-200 shadow-amber-200/30'
    }`}>
      {/* Top ornament */}
      <div className="relative h-3">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>

      {/* Page number header */}
      <div className="flex items-center justify-between px-6 pt-3">
        <span className={`text-[10px] tracking-[0.2em] uppercase ${
          darkMode ? 'text-amber-500/30' : 'text-amber-700/30'
        }`}>
          Juz {pageData.verses[0]?.juz_number}
        </span>
        <span className={`text-[10px] tracking-[0.2em] ${
          darkMode ? 'text-amber-500/30' : 'text-amber-700/30'
        }`}>
          {page}
        </span>
        <span className={`text-[10px] tracking-[0.2em] uppercase ${
          darkMode ? 'text-amber-500/30' : 'text-amber-700/30'
        }`}>
          Hizb {Math.ceil((pageData.verses[0]?.hizb_number || 1) / 2)}
        </span>
      </div>

      {/* Main content area */}
      <div className={`px-5 sm:px-8 ${compact ? 'py-5' : 'py-6 sm:py-10'}`}>
        {verseGroups.map((group, gi) => (
          <div key={`${group.chapterId}-${gi}`}>
            {/* Surah Header — shown when first ayah of surah appears on this page */}
            {group.verses[0]?.verse_number === 1 && group.chapter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 sm:mb-8"
              >
                {/* Decorative surah banner */}
                <div className={`relative rounded-2xl overflow-hidden mx-auto max-w-md ${
                  darkMode ? 'bg-amber-500/[0.04]' : 'bg-amber-50'
                }`}>
                  {/* Corner ornaments */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-500/30 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500/30 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-500/30 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-500/30 rounded-br-2xl" />

                  <div className="px-6 py-4 text-center">
                    {/* Arabic name */}
                    <div className={`text-2xl sm:text-3xl font-bold mb-1 ${
                      darkMode ? 'text-amber-400' : 'text-amber-700'
                    }`} style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}>
                      سُورَةُ {group.chapter.name_arabic}
                    </div>
                    {/* Transliteration & details */}
                    <div className={`text-[10px] tracking-[0.15em] uppercase ${
                      darkMode ? 'text-amber-400/40' : 'text-amber-600/50'
                    }`}>
                      {group.chapter.name_simple} &middot; {group.chapter.verses_count} Ayat &middot; {group.chapter.revelation_place}
                    </div>
                  </div>
                </div>

                {/* Bismillah */}
                {group.chapter.bismillah_pre && (
                  <div className="text-center mt-4 sm:mt-6">
                    <span className={`text-xl sm:text-2xl ${
                      darkMode ? 'text-amber-400/50' : 'text-amber-600/70'
                    }`} style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}>
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Ayah text — flowing like a real Mushaf */}
            <div
              className={`text-right ${compact ? 'leading-[2.8rem]' : 'leading-[3.2rem] sm:leading-[3.8rem]'} ${gi > 0 ? 'mt-2' : ''}`}
              dir="rtl"
              style={{ fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif" }}
            >
              {group.verses.map((verse) => {
                const key = `${verse.chapter_id}:${verse.verse_number}`;
                const mistakeCount = mistakeMap.get(key) || 0;
                const hasMistakes = mistakeCount > 0;
                const isSelected = selectedAyah?.surah === verse.chapter_id && selectedAyah?.ayah === verse.verse_number;

                return (
                  <span
                    key={verse.verse_key}
                    className={`inline relative transition-all duration-200 rounded-md px-0.5 ${
                      onAyahClick ? 'cursor-pointer' : ''
                    } ${
                      hasMistakes
                        ? darkMode
                          ? 'bg-red-500/15 hover:bg-red-500/25 decoration-red-500/40'
                          : 'bg-red-100/80 hover:bg-red-200 decoration-red-400'
                        : isSelected
                          ? darkMode
                            ? 'bg-purple-500/15 hover:bg-purple-500/25'
                            : 'bg-purple-100 hover:bg-purple-200'
                          : sessionActive
                            ? darkMode
                              ? 'hover:bg-emerald-500/10'
                              : 'hover:bg-emerald-50'
                            : darkMode
                              ? 'hover:bg-white/[0.03]'
                              : 'hover:bg-amber-50'
                    }`}
                    onClick={() => onAyahClick?.(verse)}
                  >
                    {/* Ayah text */}
                    <span className={`${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} ${
                      darkMode ? 'text-amber-100/90' : 'text-[#1a0a00]'
                    }`}>
                      {verse.text_uthmani}
                    </span>

                    {/* Decorative Ayah number circle */}
                    <span className={`inline-flex items-center justify-center ${
                      compact ? 'w-6 h-6 text-[9px]' : 'w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs'
                    } rounded-full mx-0.5 align-middle font-medium ${
                      hasMistakes
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : darkMode
                          ? 'bg-amber-500/10 text-amber-400/70 border border-amber-500/20'
                          : 'bg-amber-100 text-amber-700 border border-amber-300/60'
                    }`}>
                      {verse.verse_number}
                    </span>

                    {/* Mistake badge */}
                    {hasMistakes && (
                      <span className="absolute -top-2 -left-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 z-10">
                        {mistakeCount}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom ornament */}
      <div className="relative h-3">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      </div>
    </div>
  );
}
