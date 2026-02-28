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
      <div className={`relative overflow-hidden ${
        darkMode ? 'bg-[#1a1509]' : 'bg-[#f8f3e6]'
      }`}>
        {/* Ornate outer border */}
        <div className={`absolute inset-0 border-[6px] ${darkMode ? 'border-amber-700/30' : 'border-amber-600/20'}`} />
        <div className={`absolute inset-[6px] border-[2px] ${darkMode ? 'border-amber-600/20' : 'border-amber-500/15'}`} />
        
        <div className="flex items-center justify-center py-32">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full"
          />
        </div>
      </div>
    );
  }

  // ===== Error =====
  if (error) {
    return (
      <div className={`p-10 text-center ${
        darkMode ? 'bg-red-500/5 text-red-300' : 'bg-red-50 text-red-600'
      }`}>
        <div className="text-3xl mb-3">⚠️</div>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!pageData || pageData.verses.length === 0) {
    return (
      <div className={`p-10 text-center ${
        darkMode ? 'bg-white/5 text-white/50' : 'bg-gray-50 text-gray-400'
      }`}>
        <p className="text-sm">No verses found for page {page}.</p>
      </div>
    );
  }

  // ===== Render =====
  return (
    <div className={`relative overflow-hidden shadow-2xl ${
      darkMode
        ? 'bg-[#1a1509] shadow-black/50'
        : 'bg-[#f8f3e6] shadow-amber-900/20'
    }`} style={{ minHeight: '70vh' }}>
      {/* ══════════════════════════════════════════════════════════════════════════════
          ORNATE BORDER FRAME — Multiple nested borders like a real Quran page
         ══════════════════════════════════════════════════════════════════════════════ */}
      
      {/* Outer thick border */}
      <div className={`absolute inset-0 border-[8px] pointer-events-none ${
        darkMode ? 'border-amber-700/40' : 'border-amber-700/25'
      }`} />
      
      {/* Inner decorated border */}
      <div className={`absolute inset-[8px] border-[3px] pointer-events-none ${
        darkMode ? 'border-amber-600/30' : 'border-amber-600/20'
      }`} />
      
      {/* Innermost thin border */}
      <div className={`absolute inset-[14px] border-[1px] pointer-events-none ${
        darkMode ? 'border-amber-500/20' : 'border-amber-500/15'
      }`} />

      {/* Corner ornaments */}
      {['top-[8px] left-[8px]', 'top-[8px] right-[8px]', 'bottom-[8px] left-[8px]', 'bottom-[8px] right-[8px]'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-8 h-8 pointer-events-none`}>
          <div className={`absolute inset-0 ${
            darkMode ? 'bg-amber-500/10' : 'bg-amber-600/10'
          }`} style={{
            clipPath: i < 2 
              ? (i === 0 ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(0 0, 100% 0, 100% 100%)')
              : (i === 2 ? 'polygon(0 0, 0 100%, 100% 100%)' : 'polygon(100% 0, 0 100%, 100% 100%)')
          }} />
        </div>
      ))}

      {/* ══════════════════════════════════════════════════════════════════════════════
          PAGE HEADER — Juz, Hizb, and Page number like authentic Mushaf
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className={`relative mx-[20px] mt-[20px] flex items-center justify-between px-4 py-2 border-b-2 ${
        darkMode ? 'border-amber-600/20' : 'border-amber-600/15'
      }`}>
        {/* Left: Surah name */}
        <span className={`text-xs tracking-wider font-semibold ${
          darkMode ? 'text-amber-500/60' : 'text-amber-700/70'
        }`} style={{ fontFamily: "'Scheherazade New', serif" }}>
          {verseGroups[0]?.chapter?.name_arabic || ''}
        </span>

        {/* Center: Juz/Hizb */}
        <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] tracking-[0.2em] uppercase ${
          darkMode ? 'text-amber-500/40' : 'text-amber-700/50'
        }`}>
          <span>Juz {pageData.verses[0]?.juz_number}</span>
          <span className={`w-1 h-1 rounded-full ${darkMode ? 'bg-amber-500/30' : 'bg-amber-600/30'}`} />
          <span>Hizb {Math.ceil((pageData.verses[0]?.hizb_number || 1) / 2)}</span>
        </div>

        {/* Right: Page number */}
        <span className={`text-sm font-bold ${
          darkMode ? 'text-amber-500/50' : 'text-amber-700/60'
        }`}>
          {page}
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════
          MAIN CONTENT — The actual Quranic text
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className={`mx-[20px] mb-[20px] px-4 sm:px-6 ${compact ? 'py-4' : 'py-6 sm:py-8'}`}>
        {verseGroups.map((group, gi) => (
          <div key={`${group.chapterId}-${gi}`}>
            {/* ═══════════════════════════════════════════════════════════════════════
                SURAH HEADER BANNER — Decorative header like real Quran
               ═══════════════════════════════════════════════════════════════════════ */}
            {group.verses[0]?.verse_number === 1 && group.chapter && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 sm:mb-8"
              >
                {/* Ornate Surah Banner */}
                <div className={`relative mx-auto max-w-sm overflow-hidden ${
                  darkMode ? 'bg-emerald-900/40' : 'bg-emerald-800/80'
                }`} style={{
                  borderRadius: '30px / 50%',
                  boxShadow: darkMode 
                    ? '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}>
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                  
                  {/* Side ornaments */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6">
                    <div className={`w-full h-full border-2 rounded-full ${darkMode ? 'border-amber-400/30' : 'border-amber-300/50'}`} />
                    <div className={`absolute inset-1 border rounded-full ${darkMode ? 'border-amber-400/20' : 'border-amber-300/30'}`} />
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6">
                    <div className={`w-full h-full border-2 rounded-full ${darkMode ? 'border-amber-400/30' : 'border-amber-300/50'}`} />
                    <div className={`absolute inset-1 border rounded-full ${darkMode ? 'border-amber-400/20' : 'border-amber-300/30'}`} />
                  </div>

                  <div className="px-10 py-3 text-center">
                    {/* Arabic Surah name */}
                    <div className="text-xl sm:text-2xl font-bold text-white mb-0.5"
                      style={{ fontFamily: "'Scheherazade New', 'Amiri', serif", textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                      سُورَةُ {group.chapter.name_arabic}
                    </div>
                    {/* Info line */}
                    <div className="text-[9px] tracking-[0.15em] uppercase text-white/60">
                      {group.chapter.verses_count} Ayat &middot; {group.chapter.revelation_place === 'makkah' ? 'Makkiyyah' : 'Madaniyyah'}
                    </div>
                  </div>
                </div>

                {/* Bismillah */}
                {group.chapter.bismillah_pre && (
                  <div className="text-center mt-5">
                    <span className={`text-xl sm:text-2xl ${
                      darkMode ? 'text-amber-400/70' : 'text-amber-800/80'
                    }`} style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}>
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════
                AYAH TEXT — Flowing Arabic text like authentic Mushaf
               ═══════════════════════════════════════════════════════════════════════ */}
            <div
              className={`text-right text-justify ${compact ? 'leading-[2.6rem]' : 'leading-[3rem] sm:leading-[3.5rem]'} ${gi > 0 ? 'mt-3' : ''}`}
              dir="rtl"
              style={{ 
                fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif",
                textAlignLast: 'center'
              }}
            >
              {group.verses.map((verse) => {
                const key = `${verse.chapter_id}:${verse.verse_number}`;
                const mistakeCount = mistakeMap.get(key) || 0;
                const hasMistakes = mistakeCount > 0;
                const isSelected = selectedAyah?.surah === verse.chapter_id && selectedAyah?.ayah === verse.verse_number;

                return (
                  <span
                    key={verse.verse_key}
                    className={`inline relative transition-all duration-200 rounded px-0.5 ${
                      onAyahClick ? 'cursor-pointer' : ''
                    } ${
                      hasMistakes
                        ? darkMode
                          ? 'bg-red-500/20 hover:bg-red-500/30'
                          : 'bg-red-100 hover:bg-red-200'
                        : isSelected
                          ? darkMode
                            ? 'bg-purple-500/20 hover:bg-purple-500/30'
                            : 'bg-purple-100 hover:bg-purple-200'
                          : sessionActive
                            ? darkMode
                              ? 'hover:bg-emerald-500/15'
                              : 'hover:bg-emerald-50'
                            : darkMode
                              ? 'hover:bg-white/[0.05]'
                              : 'hover:bg-amber-100/50'
                    }`}
                    onClick={() => onAyahClick?.(verse)}
                  >
                    {/* Ayah text */}
                    <span className={`${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} ${
                      darkMode ? 'text-amber-100/95' : 'text-[#1f0f05]'
                    }`}>
                      {verse.text_uthmani}
                    </span>

                    {/* Decorative Ayah end marker — styled like real Quran */}
                    <span className={`inline-flex items-center justify-center mx-1 align-middle ${
                      compact ? 'w-5 h-5 text-[8px]' : 'w-6 h-6 sm:w-7 sm:h-7 text-[9px] sm:text-[10px]'
                    } rounded-full font-bold ${
                      hasMistakes
                        ? 'bg-red-500/30 text-red-300 border-2 border-red-400/50'
                        : darkMode
                          ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/40'
                          : 'bg-amber-600/15 text-amber-800 border-2 border-amber-600/40'
                    }`} style={{ fontFamily: 'system-ui, sans-serif' }}>
                      {verse.verse_number}
                    </span>

                    {/* Mistake badge */}
                    {hasMistakes && (
                      <span className="absolute -top-2 -left-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 z-10">
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

      {/* ══════════════════════════════════════════════════════════════════════════════
          BOTTOM BORDER DECORATION
         ══════════════════════════════════════════════════════════════════════════════ */}
      <div className={`absolute bottom-[20px] left-[20px] right-[20px] h-[2px] ${
        darkMode ? 'bg-amber-600/20' : 'bg-amber-600/15'
      }`} />
    </div>
  );
}
