import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Verse {
  id?: number | string;
  text?: string;
  text_uthmani?: string;
  arabic?: string;
  translation?: { text?: string } | string;
  translations?: Array<{ text?: string }>;
  verse_key?: string;
  bookmarked?: boolean;
}

interface SurahReaderProps {
  surahName: string;
  surahNameArabic: string;
  surahType: string;
  surahNumber: number;
  surahTranslation?: string;
  verses: Verse[];
  onClose: () => void;
  selectedReciterId?: string | number;
  reciterDisplayName?: string;
  reciters?: Array<{ id: string | number; name: string; server?: string }>;
  onReciterChange?: (reciterId: string | number) => void;
  onAudioPlay?: (ayahIndex: number) => void;
  isPlaying?: boolean;
  currentAyahIndex?: number | null;
  onTogglePlayPause?: () => void;
  onPlayNext?: () => void;
  onPlayPrevious?: () => void;
  isAudioLoading?: boolean;
  onAyahSelect?: (index: number) => void;
  bookmarkedAyahs?: Array<{ surah: number; ayah: number }>;
  onToggleBookmark?: (ayahIndex: number) => void;
  isLoadingVerses?: boolean;
}

const placeholderVerses: Verse[] = Array.from({ length: 7 }, (_, index) => ({ id: `placeholder-${index}` }));

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const getAyahTranslation = (verse: Verse): string => {
  if (!verse) return '';
  const candidates: Array<string | undefined> = [];
  if (typeof verse.translation === 'object') candidates.push(verse.translation?.text);
  if (typeof verse.translation === 'string') candidates.push(verse.translation);
  if (Array.isArray(verse.translations) && verse.translations.length) {
    candidates.push(verse.translations[0]?.text);
  }
  for (const candidate of candidates) {
    if (!candidate) continue;
    const clean = stripHtml(candidate);
    if (clean) return clean;
  }
  return '';
};

const getAyahText = (verse: Verse): string => {
  if (!verse) return '';
  return verse.text_uthmani || verse.text || verse.arabic || '';
};

export function SurahReader({
  surahName,
  surahNameArabic,
  surahType,
  surahNumber,
  surahTranslation,
  verses,
  onClose,
  reciterDisplayName = 'Al-Husary',
  reciters = [],
  selectedReciterId,
  onReciterChange,
  isPlaying,
  currentAyahIndex = 0,
  onTogglePlayPause,
  onPlayNext,
  onPlayPrevious,
  onAudioPlay,
  isAudioLoading = false,
  onAyahSelect,
  bookmarkedAyahs = [],
  onToggleBookmark,
  isLoadingVerses = false,
}: SurahReaderProps) {
  const [expandedTranslations, setExpandedTranslations] = useState<Set<number>>(new Set());

  const toggleTranslation = (index: number) => {
    setExpandedTranslations((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;
    const originalHeight = document.documentElement.style.height;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.documentElement.style.height = '100vh';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      document.documentElement.style.height = originalHeight;
    };
  }, []);

  const shouldRenderPlaceholders = !verses?.length;
  const versesToRender = shouldRenderPlaceholders ? placeholderVerses : verses;
  const safeActiveIndex = useMemo(() => {
    if (!versesToRender.length) return 0;
    if (currentAyahIndex == null) return 0;
    return Math.min(Math.max(currentAyahIndex, 0), versesToRender.length - 1);
  }, [versesToRender, currentAyahIndex]);

  const handleVerseSelect = (index: number) => {
    onAyahSelect?.(index);
  };

  const showBismillah = surahNumber !== 9;
  const verseCountDisplay = verses && verses.length ? `${verses.length} Ayahs` : 'Loading…';
  const cardBaseClasses =
    'group relative rounded-3xl border border-white/12 bg-white/4 backdrop-blur-xl px-8 py-10 sm:px-12 sm:py-12 shadow-[0_20px_70px_rgba(8,0,38,0.55)] transition-all duration-300';
  const backgroundGradient = 'linear-gradient(160deg, #5f0bbf 0%, #3a0d5c 55%, #19062d 100%)';
  const glowOverlay =
    'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.2), transparent 50%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12), transparent 40%)';

  return createPortal(
    <div className="surah-reader-modal fixed inset-0 z-[100000] flex flex-col text-white" style={{ backgroundImage: backgroundGradient }}>
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: glowOverlay }} />
      <div className="relative z-[1] flex h-full flex-col">
        <header className="surah-reader-header flex flex-col gap-2 px-3 py-3 border-b border-white/10 sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white/80 transition hover:text-white"
              aria-label="Close reader"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-0.5 text-left">
              <p className="reader-sans text-[0.55rem] uppercase tracking-[0.35em] text-white/60">{surahType}</p>
              <p className="surah-reader-title reader-sans font-semibold text-xs sm:text-sm text-white leading-tight">{surahName}</p>
              <p className="surah-reader-title-arabic font-arabic text-[11px] sm:text-sm text-white leading-tight">{surahNameArabic}</p>
            </div>
          </div>
        </header>

        <main className="surah-reader-main flex-1 overflow-y-auto px-3 py-6 pb-12 sm:px-6 sm:py-8 sm:pb-16 md:px-8 md:py-10">
          <div className="mx-auto w-full max-w-5xl">
            <section className="surah-reader-hero text-center space-y-2 sm:space-y-4 md:space-y-6 mb-8 md:mb-12">
              <p className="reader-sans text-[0.5rem] sm:text-[0.6rem] md:text-[0.75rem] uppercase tracking-[0.4em] text-white/60">{surahType} • {verseCountDisplay}</p>
              <p className="surah-reader-hero-title reader-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">{surahName}</p>
              <p className="surah-reader-hero-subtitle font-arabic text-lg sm:text-2xl md:text-3xl lg:text-4xl text-white leading-relaxed">{surahNameArabic}</p>
              <p className="surah-reader-hero-description reader-sans text-xs sm:text-sm md:text-base text-white/70 mt-3 md:mt-6">{surahTranslation || 'Reflect on every ayah with clarity.'}</p>
            </section>

              <div className="mt-10 sm:mt-12 md:mt-16 mb-10 md:mb-12 flex justify-center">
                <div className="surah-reader-bismillah inline-flex items-center rounded-xl border border-white/20 bg-white/8 px-6 sm:px-10 py-4 sm:py-6 font-arabic text-sm sm:text-base md:text-xl shadow-[0_20px_70px_rgba(12,0,45,0.55)]">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
              </div>

            <section className="mt-10 sm:mt-12 md:mt-16 space-y-6 sm:space-y-8 md:space-y-10">
              {shouldRenderPlaceholders && isLoadingVerses && (
                <p className="text-center text-sm uppercase tracking-[0.4em] text-white/60">Loading verses…</p>
              )}

              {versesToRender.map((verse, index) => {
                const verseNumber = index + 1;
                const translation = shouldRenderPlaceholders
                  ? 'Translation loading…'
                  : getAyahTranslation(verse) || 'Translation coming soon.';
                const ayahArabic = shouldRenderPlaceholders ? '...' : getAyahText(verse);
                const isActive = index === safeActiveIndex;
                const cardElevation = isActive ? 'border-purple-400/50 bg-[#5313a0]/20 scale-[1.01]' : 'hover:border-white/20';

                return (
                  <div
                    key={`${verse?.verse_key || verse?.id || index}`}
                    className={`surah-reader-verse-card ${cardBaseClasses} ${cardElevation}`}
                    onClick={() => handleVerseSelect(index)}
                  >
                    <div className="surah-reader-verse-content flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-1 items-start gap-3 sm:gap-4">
                        <div className="relative pt-0.5">
                          <div
                            className={`surah-reader-verse-number flex h-9 w-9 items-center justify-center rounded-full text-xs sm:text-sm font-semibold shadow-lg sm:h-10 sm:w-10 md:h-12 md:w-12 ${
                              isActive ? 'bg-[#5313a0] text-white' : 'bg-white/15 text-white'
                            }`}
                          >
                            {verseNumber}
                          </div>
                          <span className="pointer-events-none absolute left-1/2 top-full hidden h-8 w-px -translate-x-1/2 translate-y-1.5 bg-white/25 md:block" />
                        </div>
                        <div className="surah-reader-verse-details space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTranslation(index);
                            }}
                            className="surah-reader-action-btn reader-sans uppercase tracking-[0.25em] font-semibold px-2.5 py-1.5 text-[10px] sm:text-xs rounded-full border border-white/25 bg-white/6 text-white/70 transition-all hover:border-white/50 hover:bg-white/12 hover:text-white/90"
                          >
                            {expandedTranslations.has(index) ? '✓' : 'Tr'}
                          </button>
                          {expandedTranslations.has(index) && (
                            <p className="surah-reader-expansion-text reader-sans text-xs sm:text-sm leading-relaxed text-white/85 mt-3 pt-3 border-t border-white/10">{translation}</p>
                          )}
                        </div>
                      </div>

                      <p className="surah-reader-verse-arabic font-arabic text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[2.2] text-white text-right">
                        {ayahArabic}
                      </p>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        </main>
      </div>
    </div>,
    document.body
  );
}
