export interface Mentor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  available: boolean;
  rating: number;
  students: number;
  bio: string;
  expertise: string[];
  responseTime: string;
  sessionPrice: number;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  topic: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  time: string;
  timestamp: number;
}

export const mentorsData: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Ustadh Ibrahim Hassan',
    specialty: 'Tajweed & Memorization',
    avatar: '🧑‍🏫',
    available: true,
    rating: 4.9,
    students: 127,
    bio: 'Certified Quranic instructor with 15 years of experience in teaching Tajweed and Hifdh.',
    expertise: ['Tajweed', 'Memorization', 'Recitation', 'Pronunciation'],
    responseTime: '< 5 minutes',
    sessionPrice: 25
  },
  {
    id: 'mentor-2',
    name: 'Shaykh Fatima Ahmed',
    specialty: 'Tafsir & Reflection',
    avatar: '👩‍🏫',
    available: true,
    rating: 4.8,
    students: 93,
    bio: 'Expert in classical and modern tafsir with focus on personal spiritual growth.',
    expertise: ['Tafsir', 'Islamic Law', 'Spiritual Guidance', 'Reflection'],
    responseTime: '< 10 minutes',
    sessionPrice: 30
  },
  {
    id: 'mentor-3',
    name: 'Qari Yusuf Ali',
    specialty: 'Qira\'at & Recitation',
    avatar: '🧔',
    available: false,
    rating: 5.0,
    students: 156,
    bio: 'Master of Qiraat variations with experience training professional reciters.',
    expertise: ['Qira\'at', 'Melodic Recitation', 'Professional Recitation', 'Maqaam'],
    responseTime: '< 15 minutes',
    sessionPrice: 35
  },
  {
    id: 'mentor-4',
    name: 'Dr. Muhammad Omar',
    specialty: 'Islamic Studies',
    avatar: '👨‍⚕️',
    available: true,
    rating: 4.7,
    students: 89,
    bio: 'PhD in Islamic Sciences with expertise in Quranic context and history.',
    expertise: ['Islamic History', 'Quranic Context', 'Hadith Sciences', 'Islamic Law'],
    responseTime: '< 20 minutes',
    sessionPrice: 32
  },
  {
    id: 'mentor-5',
    name: 'Sister Zainab Hassan',
    specialty: 'Women\'s Quranic Studies',
    avatar: '👩',
    available: true,
    rating: 4.9,
    students: 78,
    bio: 'Specialized in teaching women and girls with a focus on contemporary application.',
    expertise: ['Women\'s Issues', 'Memorization', 'Tafsir', 'Life Coaching'],
    responseTime: '< 8 minutes',
    sessionPrice: 28
  },
  {
    id: 'mentor-6',
    name: 'Shaykh Abdul Aziz',
    specialty: 'Advanced Hifdh Program',
    avatar: '👴',
    available: true,
    rating: 5.0,
    students: 142,
    bio: 'Hafiz with 40+ years of experience in training advanced memorizers.',
    expertise: ['Hifdh Program', 'Review Techniques', 'Memory Optimization', 'Advanced Memorization'],
    responseTime: '< 12 minutes',
    sessionPrice: 40
  }
];

// Track user's sessions (stored in localStorage/database)
export function getUserSessions(userId: string): MentorSession[] {
  try {
    const stored = localStorage.getItem(`mentor_sessions_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

export function saveMentorSession(userId: string, session: MentorSession) {
  try {
    const sessions = getUserSessions(userId);
    sessions.push(session);
    localStorage.setItem(`mentor_sessions_${userId}`, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

export function getOrCreateChatHistory(userId: string, mentorId: string): ChatMessage[] {
  try {
    const stored = localStorage.getItem(`chat_${userId}_${mentorId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

export function saveChatMessage(userId: string, mentorId: string, message: ChatMessage) {
  try {
    const history = getOrCreateChatHistory(userId, mentorId);
    history.push(message);
    localStorage.setItem(`chat_${userId}_${mentorId}`, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save chat message', e);
  }
}
