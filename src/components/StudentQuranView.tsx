/**
 * StudentQuranView — Full Mushaf experience for a student.
 *
 * Uses the Quran.com API v4 via QuranPage component.
 * Teacher can:
 *  - Navigate pages like a real Mushaf
 *  - Start a recitation session
 *  - Tap ayahs to mark mistakes (9 types)
 *  - End session with rating & notes
 *  - Jump to any page or surah
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { fetchAllChapters, type Verse, type Chapter } from '../lib/quranApi';
import { QuranPage, type AyahMistakeInfo } from './QuranPage';
import type { Student, AyahMistake, MistakeType } from '../types/teacher';
import { MISTAKE_LABELS } from '../types/teacher';

interface Props {
  student: Student;
  darkMode: boolean;
  onBack: () => void;
  teacherId: string;
}

export function StudentQuranView({ student, darkMode, onBack, teacherId }: Props) {
  const [currentPage, setCurrentPage] = useState(student.current_page || 1);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [mistakes, setMistakes] = useState<AyahMistake[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [showMistakePanel, setShowMistakePanel] = useState(false);

  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [sessionMistakes, setSessionMistakes] = useState<AyahMistake[]>([]);
  const [sessionRating, setSessionRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showSessionEnd, setShowSessionEnd] = useState(false);

  // Navigation
  const [pageInput, setPageInput] = useState('');
  const [showJumpTo, setShowJumpTo] = useState(false);

  // Load chapters list for surah jump
  useEffect(() => {
    fetchAllChapters().then(setChapters).catch(() => {});
  }, []);

  // Fetch all existing mistakes for this student
  const fetchMistakes = useCallback(async () => {
    const { data } = await supabase
      .from('ayah_mistakes')
      .select('*')
      .eq('student_id', student.id);
    setMistakes(data || []);
  }, [student.id]);

  useEffect(() => {
    fetchMistakes();
  }, [fetchMistakes]);

  // Update student's current page in the DB whenever it changes
  useEffect(() => {
    supabase.from('students').update({ current_page: currentPage }).eq('id', student.id);
  }, [currentPage, student.id]);

  // Current surah name for display
  const currentChapter = useMemo(() => {
    return chapters.find(ch =>
      ch.pages[0] <= currentPage && ch.pages[1] >= currentPage
    );
  }, [chapters, currentPage]);

  // Build mistake info for QuranPage component
  const mistakeInfos: AyahMistakeInfo[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of mistakes) {
      const key = `${m.surah_number}:${m.ayah_number}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([key, count]) => {
      const [surah, ayah] = key.split(':').map(Number);
      return { surah, ayah, count };
    });
  }, [mistakes]);

  // ===== Session Controls =====

  const startSession = () => {
    setSessionActive(true);
    setSessionStart(new Date());
    setSessionMistakes([]);
    setSessionRating(3);
    setSessionNotes('');
  };

  const addMistake = async (verse: Verse, type: MistakeType) => {
    const { data, error } = await supabase.from('ayah_mistakes').insert({
      session_id: null,
      student_id: student.id,
      surah_number: verse.chapter_id,
      ayah_number: verse.verse_number,
      mistake_type: type,
    }).select().single();

    if (!error && data) {
      setMistakes(prev => [...prev, data]);
      setSessionMistakes(prev => [...prev, data]);
      await supabase.from('students').update({
        total_mistakes: student.total_mistakes + 1,
      }).eq('id', student.id);
    }
  };

  const removeMistake = async (mistakeId: string) => {
    await supabase.from('ayah_mistakes').delete().eq('id', mistakeId);
    setMistakes(prev => prev.filter(m => m.id !== mistakeId));
    setSessionMistakes(prev => prev.filter(m => m.id !== mistakeId));
  };

  const endSession = async () => {
    if (!sessionStart) return;
    const duration = Math.round((new Date().getTime() - sessionStart.getTime()) / 60000);

    const surahNumbers = sessionMistakes.map(m => m.surah_number);
    const ayahNumbers = sessionMistakes.map(m => m.ayah_number);
    const mainSurah = surahNumbers.length > 0 ? surahNumbers[0] : (currentChapter?.id || 1);

    const { data: session } = await supabase.from('recitation_sessions').insert({
      student_id: student.id,
      teacher_id: teacherId,
      surah_number: mainSurah,
      start_ayah: ayahNumbers.length > 0 ? Math.min(...ayahNumbers) : 1,
      end_ayah: ayahNumbers.length > 0 ? Math.max(...ayahNumbers) : 1,
      page_number: currentPage,
      date: new Date().toISOString().split('T')[0],
      duration_minutes: Math.max(duration, 1),
      overall_rating: sessionRating,
      notes: sessionNotes || null,
    }).select().single();

    if (session) {
      const mistakeIds = sessionMistakes.map(m => m.id);
      if (mistakeIds.length > 0) {
        await supabase.from('ayah_mistakes')
          .update({ session_id: session.id })
          .in('id', mistakeIds);
      }
      await supabase.from('students').update({
        total_sessions: student.total_sessions + 1,
        current_surah: mainSurah,
        current_page: currentPage,
      }).eq('id', student.id);
    }

    setSessionActive(false);
    setShowSessionEnd(false);
    setSessionStart(null);
    setSessionMistakes([]);
  };

  const getMistakesForVerse = (surah: number, ayah: number) =>
    mistakes.filter(m => m.surah_number === surah && m.ayah_number === ayah);

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(604, page)));

  const handleAyahClick = (verse: Verse) => {
    if (sessionActive) {
      setSelectedVerse(verse);
      setShowMistakePanel(true);
    }
  };

  // ===== Render =====
  return (
    <div className={`max-w-5xl mx-auto px-4 pb-20 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* ── Top Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 gap-3 flex-wrap"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
            darkMode
              ? 'bg-white/[0.06] border border-white/10 text-purple-300/70 hover:bg-white/10'
              : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ← Back
        </motion.button>

        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: student.avatar_color }}
          >
            {student.full_name.charAt(0)}
          </div>
          <div>
            <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {student.full_name}
            </div>
            <div className={`text-xs ${darkMode ? 'text-purple-300/50' : 'text-gray-400'}`}>
              {currentChapter?.name_simple || 'Quran'} &middot; Page {currentPage}
            </div>
          </div>
        </div>

        {!sessionActive ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startSession}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            ▶️ Start Session
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSessionEnd(true)}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium shadow-lg shadow-red-500/20 flex items-center gap-1.5"
          >
            ⏹️ End ({sessionMistakes.length} mistakes)
          </motion.button>
        )}
      </motion.div>

      {/* ── Session Active Banner ── */}
      <AnimatePresence>
        {sessionActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <motion.div
                className="w-3 h-3 bg-emerald-500 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className={`text-sm font-medium ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                🎙️ Session active — Tap any ayah to log mistakes
              </span>
              <span className={`text-xs ml-auto ${darkMode ? 'text-emerald-300/60' : 'text-emerald-600'}`}>
                {sessionMistakes.length} mistake{sessionMistakes.length !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Navigation ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-4"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg disabled:opacity-30 ${
            darkMode ? 'bg-white/[0.06] hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          →
        </motion.button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowJumpTo(!showJumpTo)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              darkMode ? 'bg-white/[0.06] text-purple-300/70 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📖 Page {currentPage} / 604
          </button>

          {currentChapter && (
            <span className={`text-sm hidden sm:inline ${darkMode ? 'text-amber-400/70' : 'text-amber-600'}`}>
              {currentChapter.name_arabic} — {currentChapter.name_simple}
            </span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= 604}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg disabled:opacity-30 ${
            darkMode ? 'bg-white/[0.06] hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          ←
        </motion.button>
      </motion.div>

      {/* ── Jump to Page/Surah ── */}
      <AnimatePresence>
        {showJumpTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className={`flex gap-2 p-3 rounded-xl border ${
              darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-gray-50 border-gray-200'
            }`}>
              <input
                type="number"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="Page (1–604)"
                min={1}
                max={604}
                className={`flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none ${
                  darkMode
                    ? 'bg-white/[0.04] border border-white/10 text-white placeholder-purple-300/30'
                    : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const p = parseInt(pageInput);
                  if (p >= 1 && p <= 604) {
                    goToPage(p);
                    setShowJumpTo(false);
                    setPageInput('');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium"
              >
                Go
              </motion.button>
              <select
                onChange={(e) => {
                  const ch = chapters.find(c => c.id === parseInt(e.target.value));
                  if (ch) {
                    goToPage(ch.pages[0]);
                    setShowJumpTo(false);
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm ${
                  darkMode
                    ? 'bg-white/[0.04] border border-white/10 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
                defaultValue=""
              >
                <option value="" disabled>Jump to Surah...</option>
                {chapters.map(ch => (
                  <option key={ch.id} value={ch.id} className="text-gray-900">
                    {ch.id}. {ch.name_simple} (p.{ch.pages[0]})
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mushaf Page Spread (Two-page book layout like real Quran) ── */}
      <div className="hidden md:block">
        {/* Desktop: Two-page spread */}
        <div className={`relative rounded-lg overflow-hidden shadow-2xl ${
          darkMode ? 'bg-[#0d0805] shadow-black/60' : 'bg-[#2a1f15] shadow-amber-900/40'
        }`}>
          {/* Book spine shadow in center */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-10"
            style={{
              background: darkMode 
                ? 'linear-gradient(to right, transparent, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.5) 60%, transparent)'
                : 'linear-gradient(to right, transparent, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 60%, transparent)'
            }}
          />
          
          <div className="flex">
            {/* Right page (odd page - in Arabic Qurans, reading starts from right) */}
            <div className="flex-1 p-1">
              <QuranPage
                page={currentPage % 2 === 1 ? currentPage : currentPage - 1}
                darkMode={darkMode}
                mistakes={mistakeInfos}
                selectedAyah={selectedVerse ? { surah: selectedVerse.chapter_id, ayah: selectedVerse.verse_number } : null}
                sessionActive={sessionActive}
                onAyahClick={handleAyahClick}
              />
            </div>
            
            {/* Left page (even page) */}
            <div className="flex-1 p-1">
              <QuranPage
                page={currentPage % 2 === 1 ? currentPage + 1 : currentPage}
                darkMode={darkMode}
                mistakes={mistakeInfos}
                selectedAyah={selectedVerse ? { surah: selectedVerse.chapter_id, ayah: selectedVerse.verse_number } : null}
                sessionActive={sessionActive}
                onAyahClick={handleAyahClick}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile: Single page view */}
      <div className="md:hidden">
        <QuranPage
          page={currentPage}
          darkMode={darkMode}
          mistakes={mistakeInfos}
          selectedAyah={selectedVerse ? { surah: selectedVerse.chapter_id, ayah: selectedVerse.verse_number } : null}
          sessionActive={sessionActive}
          onAyahClick={handleAyahClick}
          compact
        />
      </div>

      {/* ── Mistake Panel (Bottom Sheet) ── */}
      <AnimatePresence>
        {showMistakePanel && selectedVerse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => setShowMistakePanel(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-lg rounded-t-3xl border-t p-6 pb-10 ${
                darkMode ? 'bg-[#110520] border-white/10' : 'bg-white border-gray-200'
              }`}
            >
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />

              <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Mark Mistake — Ayah {selectedVerse.verse_number}
              </h3>
              <p className={`text-xs mb-5 ${darkMode ? 'text-purple-300/50' : 'text-gray-500'}`}>
                {chapters.find(c => c.id === selectedVerse.chapter_id)?.name_simple || `Surah ${selectedVerse.chapter_id}`} &middot; Tap a mistake type
              </p>

              {getMistakesForVerse(selectedVerse.chapter_id, selectedVerse.verse_number).length > 0 && (
                <div className="mb-4">
                  <div className={`text-xs font-medium mb-2 uppercase tracking-wider ${darkMode ? 'text-purple-300/40' : 'text-gray-400'}`}>
                    Current Mistakes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getMistakesForVerse(selectedVerse.chapter_id, selectedVerse.verse_number).map((m) => (
                      <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeMistake(m.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border"
                        style={{
                          backgroundColor: MISTAKE_LABELS[m.mistake_type].color + '20',
                          borderColor: MISTAKE_LABELS[m.mistake_type].color + '40',
                          color: MISTAKE_LABELS[m.mistake_type].color,
                        }}
                      >
                        {MISTAKE_LABELS[m.mistake_type].icon} {MISTAKE_LABELS[m.mistake_type].label} ✕
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(MISTAKE_LABELS) as MistakeType[]).map((type) => {
                  const info = MISTAKE_LABELS[type];
                  return (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => addMistake(selectedVerse, type)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        darkMode
                          ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-xl mb-1">{info.icon}</div>
                      <div className={`text-[10px] font-medium ${darkMode ? 'text-purple-200/70' : 'text-gray-600'}`}>
                        {info.label}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── End Session Modal ── */}
      <AnimatePresence>
        {showSessionEnd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSessionEnd(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
                darkMode ? 'bg-[#110520] border-white/10' : 'bg-white border-gray-200'
              }`}
            >
              <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                End Recitation Session
              </h2>
              <p className={`text-sm mb-6 ${darkMode ? 'text-purple-300/50' : 'text-gray-500'}`}>
                {sessionMistakes.length} mistake{sessionMistakes.length !== 1 ? 's' : ''} recorded on page {currentPage}
              </p>

              <div className="mb-5">
                <label className={`block text-xs font-medium mb-2 uppercase tracking-widest ${darkMode ? 'text-purple-300/60' : 'text-gray-500'}`}>
                  Overall Rating
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((r) => (
                    <motion.button
                      key={r}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSessionRating(r)}
                      className={`flex-1 py-3 rounded-xl text-2xl border transition-all ${
                        r <= sessionRating
                          ? 'bg-amber-500/20 border-amber-500/40'
                          : darkMode
                            ? 'bg-white/[0.03] border-white/[0.06]'
                            : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {r <= sessionRating ? '⭐' : '☆'}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className={`block text-xs font-medium mb-1.5 uppercase tracking-widest ${darkMode ? 'text-purple-300/60' : 'text-gray-500'}`}>
                  Session Notes (optional)
                </label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                  placeholder="How did the student perform? Areas to focus on..."
                  className={`w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none ${
                    darkMode
                      ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder-purple-300/30 focus:border-purple-500/40'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-400'
                  }`}
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSessionEnd(false)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border ${
                    darkMode ? 'bg-white/[0.04] border-white/10 text-purple-300/70' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={endSession}
                  className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium shadow-lg shadow-purple-500/20"
                >
                  ✓ Save Session
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
