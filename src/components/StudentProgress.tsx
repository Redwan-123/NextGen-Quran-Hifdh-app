import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { allSurahs } from '../data/surahData';
import type { Student, RecitationSession, AyahMistake, MistakeType } from '../types/teacher';
import { MISTAKE_LABELS, STUDENT_LEVELS } from '../types/teacher';

interface Props {
  student: Student;
  darkMode: boolean;
  onBack: () => void;
}

export function StudentProgress({ student, darkMode, onBack }: Props) {
  const [sessions, setSessions] = useState<RecitationSession[]>([]);
  const [mistakes, setMistakes] = useState<AyahMistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'mistakes'>('overview');

  useEffect(() => {
    fetchData();
  }, [student.id]);

  const fetchData = async () => {
    setLoading(true);
    const [sessRes, misRes] = await Promise.all([
      supabase
        .from('recitation_sessions')
        .select('*')
        .eq('student_id', student.id)
        .order('date', { ascending: false }),
      supabase
        .from('ayah_mistakes')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false }),
    ]);
    setSessions(sessRes.data || []);
    setMistakes(misRes.data || []);
    setLoading(false);
  };

  // Compute stats
  const totalSessions = sessions.length;
  const totalMistakes = mistakes.length;
  const avgRating = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + s.overall_rating, 0) / sessions.length).toFixed(1)
    : '—';
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const currentSurah = allSurahs.find(s => s.number === student.current_surah);

  // Mistakes by type
  const mistakesByType = (Object.keys(MISTAKE_LABELS) as MistakeType[]).map(type => ({
    type,
    ...MISTAKE_LABELS[type],
    count: mistakes.filter(m => m.mistake_type === type).length,
  })).sort((a, b) => b.count - a.count);

  // Mistakes by surah (top 5)
  const mistakesBySurah = Object.entries(
    mistakes.reduce<Record<number, number>>((acc, m) => {
      acc[m.surah_number] = (acc[m.surah_number] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([surah, count]) => ({
      surah: parseInt(surah),
      name: allSurahs.find(s => s.number === parseInt(surah))?.transliteration || `Surah ${surah}`,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxMistakeCount = Math.max(...mistakesByType.map(m => m.count), 1);
  const maxSurahMistakes = Math.max(...mistakesBySurah.map(m => m.count), 1);

  // Sessions by week (last 8 weeks)
  const weeklyData = [...Array(8)].map((_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (7 * (7 - i)));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekSessions = sessions.filter(s => {
      const d = new Date(s.date);
      return d >= weekStart && d < weekEnd;
    });
    return {
      week: `W${i + 1}`,
      sessions: weekSessions.length,
      avgRating: weekSessions.length > 0
        ? weekSessions.reduce((sum, s) => sum + s.overall_rating, 0) / weekSessions.length
        : 0,
    };
  });
  const maxWeeklySessions = Math.max(...weeklyData.map(w => w.sessions), 1);

  return (
    <div className={`max-w-5xl mx-auto px-4 pb-20 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
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
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: student.avatar_color }}
          >
            {student.full_name.charAt(0)}
          </div>
          <div>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {student.full_name} — Progress
            </h1>
            <p className={`text-xs ${darkMode ? 'text-purple-300/50' : 'text-gray-500'}`}>
              {STUDENT_LEVELS.find(l => l.value === student.level)?.label} • {currentSurah?.transliteration || 'Quran'} • Page {student.current_page}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        {[
          { label: 'Sessions', value: totalSessions, icon: '📝', bg: 'bg-purple-500/20', border: 'border-purple-500/20' },
          { label: 'Total Mistakes', value: totalMistakes, icon: '⚠️', bg: 'bg-red-500/20', border: 'border-red-500/20' },
          { label: 'Avg Rating', value: avgRating, icon: '⭐', bg: 'bg-amber-500/20', border: 'border-amber-500/20' },
          { label: 'Minutes', value: totalMinutes, icon: '⏱️', bg: 'bg-blue-500/20', border: 'border-blue-500/20' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className={`rounded-2xl p-4 border backdrop-blur-sm ${
              darkMode
                ? `${stat.bg} ${stat.border}`
                : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
            <div className={`text-xs mt-0.5 ${darkMode ? 'text-purple-300/50' : 'text-gray-500'}`}>{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl mb-6 ${darkMode ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
        {(['overview', 'sessions', 'mistakes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? darkMode
                  ? 'bg-purple-600/30 text-white border border-purple-500/20'
                  : 'bg-white text-gray-900 shadow-sm'
                : darkMode
                  ? 'text-purple-300/50 hover:text-purple-200'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
          />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Weekly Activity Chart */}
              <div className={`rounded-2xl border p-5 ${
                darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  📊 Weekly Activity (Last 8 Weeks)
                </h3>
                <div className="flex items-end gap-2 h-32">
                  {weeklyData.map((w, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(w.sessions / maxWeeklySessions) * 100}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className={`w-full rounded-t-lg min-h-[4px] ${
                          w.sessions > 0
                            ? 'bg-gradient-to-t from-purple-600 to-violet-500'
                            : darkMode ? 'bg-white/[0.06]' : 'bg-gray-100'
                        }`}
                      />
                      <span className={`text-[9px] ${darkMode ? 'text-purple-300/40' : 'text-gray-400'}`}>
                        {w.week}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mistakes by Type */}
              <div className={`rounded-2xl border p-5 ${
                darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🎯 Mistakes by Type
                </h3>
                {mistakesByType.filter(m => m.count > 0).length === 0 ? (
                  <p className={`text-sm py-4 text-center ${darkMode ? 'text-purple-300/40' : 'text-gray-400'}`}>
                    No mistakes recorded yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {mistakesByType.filter(m => m.count > 0).map((m, i) => (
                      <motion.div
                        key={m.type}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-lg w-7 text-center">{m.icon}</span>
                        <span className={`text-sm w-28 ${darkMode ? 'text-purple-200/70' : 'text-gray-600'}`}>{m.label}</span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: m.color + '15' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(m.count / maxMistakeCount) * 100}%` }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: m.color }}
                          />
                        </div>
                        <span className={`text-sm font-bold w-8 text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {m.count}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Problem Surahs */}
              {mistakesBySurah.length > 0 && (
                <div className={`rounded-2xl border p-5 ${
                  darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    📖 Most Mistakes by Surah
                  </h3>
                  <div className="space-y-3">
                    {mistakesBySurah.map((s, i) => (
                      <motion.div
                        key={s.surah}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <span className={`text-xs w-8 h-8 flex items-center justify-center rounded-lg font-bold ${
                          darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {s.surah}
                        </span>
                        <span className={`text-sm flex-1 ${darkMode ? 'text-purple-200/70' : 'text-gray-600'}`}>{s.name}</span>
                        <div className="w-24 h-3 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(s.count / maxSurahMistakes) * 100}%` }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                          />
                        </div>
                        <span className={`text-sm font-bold w-8 text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {s.count}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {sessions.length === 0 ? (
                <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${
                  darkMode ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="text-4xl mb-3">📝</div>
                  <p className={`text-sm ${darkMode ? 'text-purple-300/50' : 'text-gray-500'}`}>
                    No recitation sessions yet
                  </p>
                </div>
              ) : (
                sessions.map((s, i) => {
                  const surah = allSurahs.find(su => su.number === s.surah_number);
                  const sessionMistakes = mistakes.filter(m => m.session_id === s.id);
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`rounded-2xl border p-4 ${
                        darkMode ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {surah?.transliteration || `Surah ${s.surah_number}`} — Ayahs {s.start_ayah}–{s.end_ayah}
                          </div>
                          <div className={`text-xs mt-0.5 ${darkMode ? 'text-purple-300/50' : 'text-gray-500'}`}>
                            {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • Page {s.page_number} • {s.duration_minutes} min
                          </div>
                        </div>
                        <div className="text-lg">
                          {'⭐'.repeat(s.overall_rating)}
                        </div>
                      </div>
                      {sessionMistakes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {sessionMistakes.map(m => (
                            <span
                              key={m.id}
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: MISTAKE_LABELS[m.mistake_type].color + '15',
                                color: MISTAKE_LABELS[m.mistake_type].color,
                              }}
                            >
                              {MISTAKE_LABELS[m.mistake_type].icon} {MISTAKE_LABELS[m.mistake_type].label}
                            </span>
                          ))}
                        </div>
                      )}
                      {s.notes && (
                        <p className={`text-xs mt-2 italic ${darkMode ? 'text-purple-300/40' : 'text-gray-400'}`}>
                          "{s.notes}"
                        </p>
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* Mistakes Tab */}
          {activeTab === 'mistakes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              {mistakes.length === 0 ? (
                <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${
                  darkMode ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="text-4xl mb-3">✅</div>
                  <p className={`text-sm ${darkMode ? 'text-purple-300/50' : 'text-gray-500'}`}>
                    No mistakes recorded — MashaAllah!
                  </p>
                </div>
              ) : (
                mistakes.map((m, i) => {
                  const surah = allSurahs.find(s => s.number === m.surah_number);
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        darkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-100'
                      }`}
                    >
                      <span className="text-lg">{MISTAKE_LABELS[m.mistake_type].icon}</span>
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {surah?.transliteration} {m.surah_number}:{m.ayah_number}
                        </span>
                        <span className={`text-xs ml-2 ${darkMode ? 'text-purple-300/40' : 'text-gray-400'}`}>
                          {MISTAKE_LABELS[m.mistake_type].label}
                        </span>
                      </div>
                      <span className={`text-[10px] ${darkMode ? 'text-purple-300/30' : 'text-gray-400'}`}>
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
