import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Student } from '../types/teacher';
import { AVATAR_COLORS, STUDENT_LEVELS } from '../types/teacher';
import { StudentQuranView } from './StudentQuranView';
import { StudentProgress } from './StudentProgress';

type DashView = 'students' | 'quran' | 'progress';

export function TeacherDashboard({ darkMode }: { darkMode: boolean }) {
  const { teacher, signOut } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [view, setView] = useState<DashView>('students');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // New student form
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newLevel, setNewLevel] = useState<Student['level']>('beginner');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (teacher) fetchStudents();
  }, [teacher]);

  const fetchStudents = async () => {
    if (!teacher) return;
    setLoading(true);
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('teacher_id', teacher.id)
      .order('created_at', { ascending: false });
    setStudents(data || []);
    setLoading(false);
  };

  const addStudent = async () => {
    if (!teacher || !newName.trim()) return;
    setAddLoading(true);
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const { error } = await supabase.from('students').insert({
      teacher_id: teacher.id,
      full_name: newName.trim(),
      age: newAge ? parseInt(newAge) : null,
      level: newLevel,
      avatar_color: color,
      current_surah: 1,
      current_ayah: 1,
      current_page: 1,
      total_mistakes: 0,
      total_sessions: 0,
    });
    if (!error) {
      await fetchStudents();
      setShowAddModal(false);
      setNewName('');
      setNewAge('');
      setNewLevel('beginner');
    }
    setAddLoading(false);
  };

  const removeStudent = async (id: string) => {
    if (!confirm('Are you sure you want to remove this student? All their data will be deleted.')) return;
    await supabase.from('ayah_mistakes').delete().eq('student_id', id);
    await supabase.from('recitation_sessions').delete().eq('student_id', id);
    await supabase.from('students').delete().eq('id', id);
    await fetchStudents();
    if (selectedStudent?.id === id) {
      setSelectedStudent(null);
      setView('students');
    }
  };

  const openStudentQuran = (student: Student) => {
    setSelectedStudent(student);
    setView('quran');
  };

  const openStudentProgress = (student: Student) => {
    setSelectedStudent(student);
    setView('progress');
  };

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const levelCounts = {
    beginner: students.filter(s => s.level === 'beginner').length,
    intermediate: students.filter(s => s.level === 'intermediate').length,
    advanced: students.filter(s => s.level === 'advanced').length,
    hafiz: students.filter(s => s.level === 'hafiz').length,
  };

  if (view === 'quran' && selectedStudent) {
    return (
      <StudentQuranView
        student={selectedStudent}
        darkMode={darkMode}
        onBack={() => { setView('students'); fetchStudents(); }}
        teacherId={teacher!.id}
      />
    );
  }

  if (view === 'progress' && selectedStudent) {
    return (
      <StudentProgress
        student={selectedStudent}
        darkMode={darkMode}
        onBack={() => setView('students')}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex-1 min-w-0">
          <h1 className={`text-xl sm:text-3xl md:text-4xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Assalamu Alaikum, <span className="text-amber-400">{teacher?.full_name?.split(' ')[0] || 'Teacher'}</span>
          </h1>
          <p className={`mt-1 text-xs sm:text-sm ${darkMode ? 'text-purple-300/50' : 'text-gray-500'}`}>
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled • Digital Mushaf Management
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={signOut}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            darkMode
              ? 'bg-white/[0.06] border border-white/10 text-purple-300/70 hover:bg-white/10'
              : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Sign Out
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8"
      >
        {[
          { label: 'Total Students', value: students.length, icon: '👥', bg: 'bg-purple-500/20', border: 'border-purple-500/20' },
          { label: 'Beginners', value: levelCounts.beginner, icon: '🌱', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' },
          { label: 'Intermediate', value: levelCounts.intermediate, icon: '📈', bg: 'bg-blue-500/20', border: 'border-blue-500/20' },
          { label: 'Advanced / Hafiz', value: levelCounts.advanced + levelCounts.hafiz, icon: '⭐', bg: 'bg-amber-500/20', border: 'border-amber-500/20' },
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

      {/* Search & Add */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all ${
              darkMode
                ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder-purple-300/30 focus:border-purple-500/40'
                : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-400'
            } focus:outline-none`}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded-xl bg-purple-600 text-white font-medium text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all flex items-center gap-2 justify-center"
        >
          <span className="text-lg">➕</span> Add Student
        </motion.button>
      </motion.div>

      {/* Student Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`rounded-2xl p-6 animate-pulse ${darkMode ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                <div className="flex-1">
                  <div className={`h-4 w-24 rounded ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <div className={`h-3 w-16 rounded mt-2 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center py-20 rounded-3xl border-2 border-dashed ${
            darkMode ? 'border-white/10' : 'border-gray-200'
          }`}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📚
          </motion.div>
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {searchQuery ? 'No students found' : 'No students yet'}
          </h3>
          <p className={`text-sm mb-6 ${darkMode ? 'text-purple-300/50' : 'text-gray-500'}`}>
            {searchQuery ? 'Try a different search term' : 'Add your first student to get started with their Quran journey'}
          </p>
          {!searchQuery && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-medium text-sm shadow-lg shadow-purple-500/20"
            >
              ➕ Add Your First Student
            </motion.button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`group rounded-2xl border overflow-hidden transition-all hover:scale-[1.01] ${
                darkMode
                  ? 'bg-white/[0.03] border-white/[0.08] hover:border-purple-500/30 hover:bg-white/[0.05]'
                  : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-lg'
              }`}
            >
              {/* Card top color bar */}
              <div className="h-1.5" style={{ background: `linear-gradient(to right, ${student.avatar_color}, ${student.avatar_color}88)` }} />
              
              <div className="p-5">
                {/* Student info */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ backgroundColor: student.avatar_color }}
                  >
                    {student.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {student.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        darkMode ? 'bg-white/[0.06] border-white/10 text-purple-300/70' : 'bg-purple-50 border-purple-200 text-purple-600'
                      }`}>
                        {STUDENT_LEVELS.find(l => l.value === student.level)?.label}
                      </span>
                      {student.age && (
                        <span className={`text-xs ${darkMode ? 'text-purple-300/40' : 'text-gray-400'}`}>
                          Age {student.age}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className={`grid grid-cols-3 gap-2 p-3 rounded-xl mb-4 ${
                  darkMode ? 'bg-white/[0.03]' : 'bg-gray-50'
                }`}>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{student.total_sessions}</div>
                    <div className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-purple-300/40' : 'text-gray-400'}`}>Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{student.current_page}</div>
                    <div className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-purple-300/40' : 'text-gray-400'}`}>Page</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{student.total_mistakes}</div>
                    <div className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-purple-300/40' : 'text-gray-400'}`}>Mistakes</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openStudentQuran(student)}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600/90 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm shadow-purple-500/20"
                  >
                    📖 Open Quran
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openStudentProgress(student)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border ${
                      darkMode
                        ? 'bg-white/[0.04] border-white/10 text-purple-300/70 hover:bg-white/[0.08]'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    📊 Progress
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeStudent(student.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs border transition-all ${
                      darkMode
                        ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                        : 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                    }`}
                  >
                    🗑️
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', bounce: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
                darkMode
                  ? 'bg-[#110520] border-white/10'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="absolute -inset-[1px] bg-purple-500/20 rounded-3xl blur-sm -z-10" />
              
              <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ➕ Add New Student
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 uppercase tracking-widest ${darkMode ? 'text-purple-300/60' : 'text-gray-500'}`}>
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Abdullah Muhammad"
                    className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none ${
                      darkMode
                        ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder-purple-300/30 focus:border-purple-500/40'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 uppercase tracking-widest ${darkMode ? 'text-purple-300/60' : 'text-gray-500'}`}>
                    Age (optional)
                  </label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="e.g. 12"
                    min="3"
                    max="99"
                    className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none ${
                      darkMode
                        ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder-purple-300/30 focus:border-purple-500/40'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 uppercase tracking-widest ${darkMode ? 'text-purple-300/60' : 'text-gray-500'}`}>
                    Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {STUDENT_LEVELS.map((level) => (
                      <motion.button
                        key={level.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setNewLevel(level.value)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          newLevel === level.value
                            ? darkMode
                              ? 'bg-purple-600/20 border-purple-500/40 text-white'
                              : 'bg-purple-50 border-purple-400 text-purple-700'
                            : darkMode
                              ? 'bg-white/[0.03] border-white/[0.06] text-purple-300/60 hover:bg-white/[0.06]'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-sm font-medium">{level.label}</div>
                        <div className={`text-[10px] mt-0.5 ${darkMode ? 'text-purple-300/40' : 'text-gray-400'}`}>
                          {level.description}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border ${
                    darkMode
                      ? 'bg-white/[0.04] border-white/10 text-purple-300/70'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addStudent}
                  disabled={addLoading || !newName.trim()}
                  className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-sm font-medium shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  {addLoading ? '⟳ Adding...' : '✓ Add Student'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
