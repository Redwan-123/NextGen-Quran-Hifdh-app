import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Info,
  ChevronDown,
  X,
  Bookmark,
  Share2,
  Play,
  SkipBack,
  SkipForward,
  Pause,
} from 'lucide-react';

interface Verse {
  id?: number | string;
  text?: string;
  text_uthmani?: string;
  arabic?: string;
  translation?: { text?: string } | string;
  verse_key?: string;
  bookmarked?: boolean;
}

interface SurahReaderProps {
  surahName: string;
  surahNameArabic: string;
  surahType: string;
  surahNumber: number;
  verses: Verse[];
  onClose: () => void;
  selectedReciterId?: string | number;
  reciterDisplayName?: string;
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
}

const defaultVerses: Verse[] = [
  {
    id: 1,
    arabic:
      'يَٰٓأَيُّهَا ٱلنَّاسُ ٱتَّقُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُم مِّن نَّفْسٍۢ وَٰحِدَةٍۢ وَخَلَقَ مِنْهَا زَوْجَهَا وَبَثَّ مِنْهُمَا رِجَالًۭا كَثِيرًۭا وَنِسَآءًۭ ۚ وَٱتَّقُوا۟ ٱللَّهَ ٱلَّذِى تَسَآءَلُونَ بِهِۦ وَٱلْأَرْحَامَ ۚ إِنَّ ٱللَّهَ كَانَ عَلَيْكُمْ رَقِيبًۭا',
  },
  {
    id: 2,
    arabic:
      'وَءَاتُوا۟ ٱلْيَتَٰمَىٰٓ أَمْوَٰلَهُمْ ۖ وَلَا تَتَبَدَّلُوا۟ ٱلْخَبِيثَ بِٱلطَّيِّبِ ۖ وَلَا تَأْكُلُوٓا۟ أَمْوَٰلَهُمْ إِلَىٰٓ أَمْوَٰلِكُمْ ۚ إِنَّهُۥ كَانَ حُوبًۭا كَبِيرًۭا',
  },
  {
    id: 3,
    arabic:
      'وَإِنْ خِفْتُمْ أَلَّا تُقْسِطُوا۟ فِى ٱلْيَتَٰمَىٰ فَٱنكِحُوا۟ مَا طَابَ لَكُم مِّنَ ٱلنِّسَآءِ مَثْنَىٰ وَثُلَٰثَ وَرُبَٰعَ ۖ فَإِنْ خِفْتُمْ أَلَّا تَعْدِلُوا۟ فَوَٰحِدَةً أَوْ مَا مَلَكَتْ أَيْمَٰنُكُمْ ۚ ذَٰلِكَ أَدْنَىٰٓ أَلَّا تَعُولُوا۟',
  },
  {
    id: 4,
    arabic:
      'وَءَاتُوا۟ ٱلنِّسَآءَ صَدُقَٰتِهِنَّ نِحْلَةًۭ ۚ فَإِن طِبْنَ لَكُمْ عَن شَىْءٍۢ مِّنْهُ نَفْسًۭا فَكُلُوهُ هَنِيٓـًۭٔا مَّرِيٓـًۭٔا',
  },
];

const getAyahTranslation = (verse: Verse): string => {
  if (!verse) return '';
  if (typeof verse.translation === 'object' && verse.translation?.text) return verse.translation.text;
  if (typeof verse.translation === 'string') return verse.translation;
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
  verses,
  onClose,
  reciterDisplayName = 'Al-Husary',
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
}: SurahReaderProps) {
  const [localBookmarks, setLocalBookmarks] = useState<Set<number>>(new Set());
  const [localPlayState, setLocalPlayState] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  // Lock body scroll while the reader is open
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

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const versesToRender = verses?.length ? verses : defaultVerses;
  const safeActiveIndex = useMemo(() => {
    if (!versesToRender.length) return 0;
    if (currentAyahIndex == null) return 0;
    return Math.min(Math.max(currentAyahIndex, 0), versesToRender.length - 1);
  }, [versesToRender, currentAyahIndex]);

  const isBookmarked = (index: number) => {
    if (bookmarkedAyahs.length && surahNumber) {
      return bookmarkedAyahs.some((b) => b.surah === surahNumber && b.ayah === index + 1);
    }
    return localBookmarks.has(index + 1);
  };

  const handleBookmarkToggle = (index: number) => {
    if (onToggleBookmark) {
      onToggleBookmark(index);
      return;
    }

    setLocalBookmarks((prev) => {
      const next = new Set(prev);
      const verseNumber = index + 1;
      if (next.has(verseNumber)) {
        next.delete(verseNumber);
      } else {
        next.add(verseNumber);
      }
      return next;
    });
  };

  const handleVerseSelect = (index: number) => {
    onAyahSelect?.(index);
  };

  const handleVersePlay = (index: number) => {
    onAyahSelect?.(index);
    if (onAudioPlay) {
      onAudioPlay(index);
    } else {
      setLocalPlayState(true);
    }
  };

  const playState = isPlaying ?? localPlayState;

  const handleTogglePlay = () => {
    if (onTogglePlayPause) {
      onTogglePlayPause();
    } else {
      setLocalPlayState((prev) => !prev);
    }
  };

  const handleNext = () => {
    if (onPlayNext) {
      onPlayNext();
    }
  };

  const handlePrevious = () => {
    if (onPlayPrevious) {
      onPlayPrevious();
    }
  };

  const showBismillah = surahNumber !== 1 && surahNumber !== 9;

  if (!isBrowser || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-br from-[#080017] via-[#1d0140] to-[#05000c] text-white">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-white">
              <h1 className="text-lg font-semibold sm:text-xl">{surahName}</h1>
              <p className="text-xs text-purple-200/70 sm:text-sm">
                {surahNameArabic} • {surahType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-white/80 hover:text-white transition-colors">
              <ChevronDown className="w-5 h-5" />
            </button>
            <button className="text-white/80 hover:text-white transition-colors">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-48 sm:px-6 sm:py-8 sm:pb-56">
          <div className="max-w-3xl mx-auto sm:max-w-4xl">
            {/* Bismillah */}
            {showBismillah && (
              <div className="text-center mb-12">
                <div className="inline-block px-6 py-5 sm:px-8 sm:py-6 bg-gradient-to-r from-purple-900/40 via-purple-800/60 to-purple-900/40 rounded-2xl backdrop-blur-sm border border-purple-600/30 shadow-xl">
                  <p className="text-2xl sm:text-3xl md:text-4xl text-white font-arabic leading-loose tracking-wide">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              </div>
            )}

            {/* Verses */}
            <div className="space-y-4 sm:space-y-6">
              {versesToRender.length === 0 && (
                <div className="text-center py-10 text-purple-100/70 text-lg">Loading verses...</div>
              )}

              {versesToRender.map((verse, index) => {
                const verseNumber = index + 1;
                const translation = getAyahTranslation(verse);
                const isActive = index === safeActiveIndex;
                const bookmarked = isBookmarked(index) || Boolean(verse.bookmarked);

                return (
                  <div
                    key={`${verse.verse_key || verse.id || index}`}
                    className={`group relative bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-900/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 border transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/30 ${
                      isActive
                        ? 'border-purple-500/70 shadow-purple-800/40'
                        : 'border-purple-700/20 hover:border-purple-600/40'
                    }`}
                    onClick={() => handleVerseSelect(index)}
                  >
                    <div className="absolute -top-3 left-6 sm:left-8">
                      <div className={`text-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-900 ${
                        isActive ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-purple-600 to-purple-700'
                      }`}>
                        <span className="font-semibold text-sm sm:text-base">{verseNumber}</span>
                      </div>
                    </div>

                    <div className="mt-4 mb-6">
                      <p className="text-white text-xl sm:text-2xl md:text-3xl leading-loose text-right font-arabic tracking-wide">
                        {getAyahText(verse)}
                      </p>
                    </div>

                    {translation && (
                      <div className="mb-4 pb-4 border-b border-purple-700/20">
                        <p className="text-purple-100/80 text-sm leading-relaxed sm:text-base">{translation}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleBookmarkToggle(index);
                        }}
                        className={`p-2 rounded-full transition-all duration-200 backdrop-blur-sm sm:p-2.5 ${
                          bookmarked
                            ? 'bg-purple-600/60 text-yellow-300'
                            : 'bg-purple-800/40 hover:bg-purple-700/60 text-purple-100 hover:text-white'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(event) => event.stopPropagation()}
                        className="p-2 rounded-full bg-purple-800/40 hover:bg-purple-700/60 text-purple-100 hover:text-white transition-all duration-200 backdrop-blur-sm sm:p-2.5"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleVersePlay(index);
                        }}
                        className="p-2 rounded-full bg-purple-800/40 hover:bg-purple-700/60 text-purple-100 hover:text-white transition-all duration-200 backdrop-blur-sm sm:p-2.5"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Audio Player */}
        <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-[10000] px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-purple-950/95 via-purple-900/95 to-purple-950/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-600/30 px-4 py-4 sm:px-8 sm:py-5">
              <div className="flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white text-sm font-semibold truncate sm:text-base">
                    {surahName} - Ayah {safeActiveIndex + 1}
                  </h3>
                  <p className="text-purple-200/70 text-xs truncate sm:text-sm">{reciterDisplayName}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={isAudioLoading}
                    className="p-2 rounded-full text-purple-200 hover:text-white hover:bg-purple-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    disabled={isAudioLoading}
                    className="p-3 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:from-purple-500 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-purple-600/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed sm:p-4"
                  >
                    {playState ? (
                      <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={isAudioLoading}
                    className="p-2 rounded-full text-purple-200 hover:text-white hover:bg-purple-800/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <div className="h-1 bg-purple-950/60 rounded-full overflow-hidden sm:h-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full shadow-lg shadow-purple-500/50 transition-all duration-300"
                    style={{
                      width: versesToRender.length
                        ? `${((safeActiveIndex + 1) / versesToRender.length) * 100}%`
                        : '0%',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
