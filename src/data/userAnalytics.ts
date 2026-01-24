import { UserProgress } from '../types/quran';

export interface UserAnalytics {
  totalSessionsCompleted: number;
  totalTimeSpent: number; // in minutes
  ayahsPracticed: string[];
  completedSessions: Array<{
    ayahId: string;
    date: string;
    duration: number;
    accuracy: number;
  }>;
  emotionEngagement: Record<string, number>;
  surahProgress: Record<number, { memorized: number; reviewed: number }>;
  monthlyEngagement: Array<{
    month: string;
    visited: number;
    skipped: number;
    revisited: number;
  }>;
}

const DEFAULT_USER_ID = 'default_user';

export function getUserAnalytics(userId: string = DEFAULT_USER_ID): UserAnalytics {
  try {
    const stored = localStorage.getItem(`user_analytics_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load analytics', e);
  }

  // Return default analytics
  return {
    totalSessionsCompleted: 0,
    totalTimeSpent: 0,
    ayahsPracticed: [],
    completedSessions: [],
    emotionEngagement: {
      anxious: 0,
      guilty: 0,
      tired: 0,
      hopeful: 0,
      grateful: 0,
      confused: 0,
      peaceful: 0,
      lost: 0
    },
    surahProgress: {},
    monthlyEngagement: [
      { month: 'Jan', visited: 0, skipped: 0, revisited: 0 },
      { month: 'Feb', visited: 0, skipped: 0, revisited: 0 },
      { month: 'Mar', visited: 0, skipped: 0, revisited: 0 },
      { month: 'Apr', visited: 0, skipped: 0, revisited: 0 },
      { month: 'May', visited: 0, skipped: 0, revisited: 0 },
      { month: 'Jun', visited: 0, skipped: 0, revisited: 0 }
    ]
  };
}

export function recordEmotionEngagement(emotionId: string, userId: string = DEFAULT_USER_ID) {
  const analytics = getUserAnalytics(userId);
  analytics.emotionEngagement[emotionId] = (analytics.emotionEngagement[emotionId] || 0) + 1;
  saveUserAnalytics(userId, analytics);
}

export function recordAyahPractice(
  ayahId: string,
  duration: number,
  accuracy: number,
  userId: string = DEFAULT_USER_ID
) {
  const analytics = getUserAnalytics(userId);
  
  if (!analytics.ayahsPracticed.includes(ayahId)) {
    analytics.ayahsPracticed.push(ayahId);
  }

  analytics.completedSessions.push({
    ayahId,
    date: new Date().toISOString(),
    duration,
    accuracy
  });

  analytics.totalSessionsCompleted++;
  analytics.totalTimeSpent += duration;

  saveUserAnalytics(userId, analytics);
}

export function recordMonthlyEngagement(
  monthIndex: number,
  type: 'visited' | 'skipped' | 'revisited',
  userId: string = DEFAULT_USER_ID
) {
  const analytics = getUserAnalytics(userId);
  if (analytics.monthlyEngagement[monthIndex]) {
    analytics.monthlyEngagement[monthIndex][type]++;
  }
  saveUserAnalytics(userId, analytics);
}

export function saveUserAnalytics(userId: string, analytics: UserAnalytics) {
  try {
    localStorage.setItem(`user_analytics_${userId}`, JSON.stringify(analytics));
  } catch (e) {
    console.error('Failed to save analytics', e);
  }
}

export function getUserProgress(userId: string = DEFAULT_USER_ID): UserProgress {
  const analytics = getUserAnalytics(userId);
  
  return {
    memorizedAyahs: analytics.ayahsPracticed,
    weakLinks: analytics.completedSessions
      .filter(s => s.accuracy < 70)
      .map(s => s.ayahId)
      .filter((v, i, a) => a.indexOf(v) === i),
    lastPracticed: analytics.completedSessions[analytics.completedSessions.length - 1]?.date || new Date().toISOString(),
    streakDays: Math.floor(analytics.totalTimeSpent / 30), // Simplified streak calculation
    totalAyahs: analytics.ayahsPracticed.length,
    masteryPercentage: analytics.completedSessions.length > 0 
      ? Math.round(
          analytics.completedSessions.reduce((sum, s) => sum + s.accuracy, 0) / 
          analytics.completedSessions.length
        )
      : 0
  };
}

export function getThemeEngagement(userId: string = DEFAULT_USER_ID): Array<{ theme: string; count: number; percentage: number }> {
  const analytics = getUserAnalytics(userId);
  const emotionMap: Record<string, string> = {
    anxious: 'Comfort',
    guilty: 'Mercy',
    tired: 'Hope',
    hopeful: 'Guidance',
    grateful: 'Gratitude',
    confused: 'Clarity',
    peaceful: 'Peace',
    lost: 'Direction'
  };

  const themes: Record<string, number> = {};
  Object.entries(analytics.emotionEngagement).forEach(([emotion, count]) => {
    const theme = emotionMap[emotion] || emotion;
    themes[theme] = (themes[theme] || 0) + count;
  });

  const total = Object.values(themes).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(themes)
    .map(([theme, count]) => ({
      theme,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
