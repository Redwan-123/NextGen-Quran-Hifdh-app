export interface Ayah {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  pageNumber: number;
  arabic: string;
  translation: string;
  emotions: string[];
  tone: 'mercy' | 'warning' | 'reflection' | 'hope' | 'guidance';
}

export interface Tafsir {
  id: string;
  scholar: string;
  text: string;
  isLong?: boolean;
}

export interface SimilarAyah {
  ayah: Ayah;
  similarity: number;
  divergencePoint: string;
}

export interface UserProgress {
  memorizedAyahs: string[];
  weakLinks: string[];
  lastPracticed: string;
  streakDays: number;
  totalAyahs: number;
  masteryPercentage: number;
}

export interface Emotion {
  id: string;
  label: string;
  color: string;
  gradient: string;
  icon: string;
}

export interface RecitationFeedback {
  ayahId: string;
  mistakes: number;
  rhythm: number; // 0-100
  pitch: number; // 0-100
  confidence: number; // 0-100
}
