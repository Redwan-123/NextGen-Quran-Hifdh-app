// ===== Database Row Types =====

export interface TeacherProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  institution?: string;
  created_at: string;
}

export interface Student {
  id: string;
  teacher_id: string;
  full_name: string;
  age?: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'hafiz';
  avatar_color: string;
  notes?: string;
  current_surah: number;
  current_ayah: number;
  current_page: number;
  total_mistakes: number;
  total_sessions: number;
  created_at: string;
}

export interface RecitationSession {
  id: string;
  student_id: string;
  teacher_id: string;
  surah_number: number;
  start_ayah: number;
  end_ayah: number;
  page_number: number;
  date: string;
  duration_minutes: number;
  overall_rating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  created_at: string;
}

export interface AyahMistake {
  id: string;
  session_id: string;
  student_id: string;
  surah_number: number;
  ayah_number: number;
  word_index?: number;
  mistake_type: MistakeType;
  notes?: string;
  created_at: string;
}

export type MistakeType =
  | 'tajweed'       // Tajweed rule violation
  | 'pronunciation' // Wrong pronunciation (makharij)
  | 'forgotten'     // Forgot the ayah completely
  | 'hesitation'    // Long pause / hesitation
  | 'substitution'  // Replaced a word with another
  | 'addition'      // Added extra words
  | 'omission'      // Skipped words
  | 'repetition'    // Repeated words unnecessarily
  | 'sequence';     // Mixed up ayah order

export const MISTAKE_LABELS: Record<MistakeType, { label: string; color: string; icon: string }> = {
  tajweed:       { label: 'Tajweed',       color: '#f59e0b', icon: '🔤' },
  pronunciation: { label: 'Pronunciation', color: '#ef4444', icon: '🗣️' },
  forgotten:     { label: 'Forgotten',     color: '#dc2626', icon: '❌' },
  hesitation:    { label: 'Hesitation',    color: '#f97316', icon: '⏸️' },
  substitution:  { label: 'Substitution',  color: '#8b5cf6', icon: '🔄' },
  addition:      { label: 'Addition',      color: '#3b82f6', icon: '➕' },
  omission:      { label: 'Omission',      color: '#ec4899', icon: '➖' },
  repetition:    { label: 'Repetition',    color: '#14b8a6', icon: '🔁' },
  sequence:      { label: 'Sequence',      color: '#6366f1', icon: '🔀' },
};

export const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
];

export const STUDENT_LEVELS: { value: Student['level']; label: string; description: string }[] = [
  { value: 'beginner',     label: 'Beginner',     description: 'Just starting memorization' },
  { value: 'intermediate', label: 'Intermediate', description: '5-15 Juz memorized' },
  { value: 'advanced',     label: 'Advanced',     description: '15-25 Juz memorized' },
  { value: 'hafiz',        label: 'Hafiz',        description: 'Completed memorization' },
];

// ===== Stats =====

export interface StudentStats {
  totalSessions: number;
  totalMistakes: number;
  avgRating: number;
  mistakesByType: Record<MistakeType, number>;
  recentSessions: RecitationSession[];
  progressByMonth: { month: string; sessions: number; mistakes: number; avgRating: number }[];
}
