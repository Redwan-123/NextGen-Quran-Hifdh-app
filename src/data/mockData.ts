import { Ayah, Tafsir, Emotion, UserProgress, SimilarAyah } from '../types/quran';

export const emotions: Emotion[] = [
  {
    id: 'anxious',
    label: 'Anxious',
    color: '#A78BFA',
    gradient: 'from-violet-400 to-purple-500',
    icon: '😰'
  },
  {
    id: 'guilty',
    label: 'Guilty',
    color: '#F87171',
    gradient: 'from-red-400 to-rose-500',
    icon: '😔'
  },
  {
    id: 'tired',
    label: 'Tired',
    color: '#60A5FA',
    gradient: 'from-blue-400 to-cyan-500',
    icon: '😴'
  },
  {
    id: 'hopeful',
    label: 'Hopeful',
    color: '#34D399',
    gradient: 'from-emerald-400 to-green-500',
    icon: '🌟'
  },
  {
    id: 'grateful',
    label: 'Grateful',
    color: '#FBBF24',
    gradient: 'from-amber-400 to-yellow-500',
    icon: '🤲'
  },
  {
    id: 'confused',
    label: 'Confused',
    color: '#A3A3A3',
    gradient: 'from-gray-400 to-slate-500',
    icon: '🤔'
  },
  {
    id: 'peaceful',
    label: 'Peaceful',
    color: '#6EE7B7',
    gradient: 'from-teal-300 to-emerald-400',
    icon: '🕊️'
  },
  {
    id: 'lost',
    label: 'Lost',
    color: '#C084FC',
    gradient: 'from-purple-400 to-indigo-500',
    icon: '🧭'
  }
];

export const mockAyahs: Ayah[] = [
  {
    id: 'ayah-1',
    surahNumber: 94,
    surahName: 'Ash-Sharh',
    ayahNumber: 5,
    pageNumber: 596,
    arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    translation: 'For indeed, with hardship [will be] ease.',
    emotions: ['anxious', 'tired', 'hopeful'],
    tone: 'hope'
  },
  {
    id: 'ayah-2',
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    ayahNumber: 286,
    pageNumber: 49,
    arabic: 'لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allah does not burden a soul beyond that it can bear.',
    emotions: ['anxious', 'tired', 'guilty'],
    tone: 'mercy'
  },
  {
    id: 'ayah-3',
    surahNumber: 39,
    surahName: 'Az-Zumar',
    ayahNumber: 53,
    pageNumber: 464,
    arabic: 'قُلْ يَـٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ',
    translation: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah."',
    emotions: ['guilty', 'hopeful', 'lost'],
    tone: 'mercy'
  },
  {
    id: 'ayah-4',
    surahNumber: 13,
    surahName: "Ar-Ra'd",
    ayahNumber: 28,
    pageNumber: 252,
    arabic: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    translation: 'Verily, in the remembrance of Allah do hearts find rest.',
    emotions: ['anxious', 'peaceful', 'tired'],
    tone: 'reflection'
  },
  {
    id: 'ayah-5',
    surahNumber: 3,
    surahName: 'Ali-Imran',
    ayahNumber: 173,
    pageNumber: 71,
    arabic: 'حَسْبُنَا ٱللَّهُ وَنِعْمَ ٱلْوَكِيلُ',
    translation: 'Sufficient for us is Allah, and [He is] the best Disposer of affairs.',
    emotions: ['anxious', 'hopeful', 'confused'],
    tone: 'guidance'
  },
  {
    id: 'ayah-6',
    surahNumber: 55,
    surahName: 'Ar-Rahman',
    ayahNumber: 13,
    pageNumber: 531,
    arabic: 'فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ',
    translation: 'So which of the favors of your Lord would you deny?',
    emotions: ['grateful', 'peaceful', 'hopeful'],
    tone: 'reflection'
  }
];

export const tafsirData: Record<string, Tafsir[]> = {
  'ayah-1': [
    {
      id: 'tafsir-1-1',
      scholar: 'Ibn Kathir',
      text: 'Allah reminds us that every difficulty is followed by ease. This is repeated twice in the Surah, emphasizing that one hardship cannot overcome two instances of ease. The definite article in "al-usr" (the hardship) and the indefinite in "yusra" (an ease) signifies that ease is broader and more encompassing than hardship.'
    },
    {
      id: 'tafsir-1-2',
      scholar: 'Al-Qurtubi',
      text: 'The scholars say this ayah was revealed to comfort the Prophet ﷺ during times of difficulty. It teaches that relief accompanies every trial in this world or the next. The repetition reinforces certainty and hope in Allah\'s promise.'
    },
    {
      id: 'tafsir-1-3',
      scholar: 'At-Tabari',
      text: 'This verse establishes a divine law: hardship never comes alone but is always paired with ease. Some scholars interpreted this to mean that material hardship may bring spiritual ease, or worldly struggle may lead to eternal comfort.'
    }
  ],
  'ayah-2': [
    {
      id: 'tafsir-2-1',
      scholar: 'Ibn Kathir',
      text: 'Allah does not impose on any soul a duty that is beyond its ability. This is a mercy from Allah, showing His knowledge of human limitation. Whatever He commands, He has given us the capacity to fulfill it. This ayah brings comfort to those who feel overwhelmed by religious obligations.'
    },
    {
      id: 'tafsir-2-2',
      scholar: 'Al-Qurtubi',
      text: 'The word "wus\'aha" means capacity or capability. This verse confirms that Allah, in His infinite wisdom, has tailored His commands to match human ability. It also implies that if something feels impossible, Allah has not truly required it of you in that state.'
    }
  ],
  'ayah-3': [
    {
      id: 'tafsir-3-1',
      scholar: 'Ibn Kathir',
      text: 'This is one of the most hope-inspiring verses in the Qur\'an. No matter how great the sin, Allah\'s mercy is greater. The direct address "O My servants" shows intimacy and care, even toward those who have sinned excessively. Despair itself is considered a major sin, as it implies doubt in Allah\'s mercy.'
    },
    {
      id: 'tafsir-3-2',
      scholar: 'At-Tabari',
      text: 'The phrase "do not despair" is a command, making hope in Allah obligatory. This verse was revealed regarding those who committed grave sins and thought they could not be forgiven. Allah clarifies that His mercy encompasses all sins for those who sincerely repent.'
    }
  ],
  'ayah-4': [
    {
      id: 'tafsir-4-1',
      scholar: 'Ibn Kathir',
      text: 'True tranquility and peace are found only in the remembrance of Allah. No amount of worldly comfort, wealth, or companionship can bring the serenity that dhikr provides. This verse highlights that hearts are inherently restless until they turn to their Creator.'
    }
  ],
  'ayah-5': [
    {
      id: 'tafsir-5-1',
      scholar: 'Al-Qurtubi',
      text: 'This phrase was uttered by Ibrahim (AS) and the companions of the Prophet ﷺ during times of fear and uncertainty. It is a declaration of complete reliance on Allah. "Hasbuna" means He is sufficient for all our needs, and "Wakil" means the best of guardians and protectors.'
    }
  ],
  'ayah-6': [
    {
      id: 'tafsir-6-1',
      scholar: 'Ibn Kathir',
      text: 'This rhetorical question is repeated 31 times in Surah Ar-Rahman, making it the most repeated verse in any single surah. It invites reflection on the countless blessings Allah has bestowed upon creation. The question is directed at both humans and jinn, urging gratitude.'
    }
  ]
};

export const qariOptions = [
  { id: 'husary', name: 'Sheikh Mahmoud Khalil Al-Husary', style: 'Murattal' },
  { id: 'minshawi', name: 'Sheikh Mohamed Siddiq Al-Minshawi', style: 'Mujawwad' },
  { id: 'sudais', name: 'Sheikh Abdul Rahman Al-Sudais', style: 'Murattal' },
  { id: 'shuraim', name: 'Sheikh Saud Al-Shuraim', style: 'Murattal' },
  { id: 'ajmi', name: 'Sheikh Ahmad Al-Ajmi', style: 'Murattal' }
];

export const mockUserProgress: UserProgress = {
  memorizedAyahs: ['ayah-1', 'ayah-4', 'ayah-6'],
  weakLinks: ['ayah-2', 'ayah-3'],
  lastPracticed: new Date().toISOString(),
  streakDays: 7,
  totalAyahs: 6,
  masteryPercentage: 50
};

export const similarAyahsData: Record<string, SimilarAyah[]> = {
  'ayah-1': [
    {
      ayah: mockAyahs[4], // ayah-5
      similarity: 85,
      divergencePoint: 'Both mention Allah\'s sufficiency, but one focuses on ease after hardship, the other on reliance'
    },
    {
      ayah: mockAyahs[1], // ayah-2
      similarity: 78,
      divergencePoint: 'Both discuss Allah\'s mercy in not overburdening, with different contexts'
    }
  ],
  'ayah-2': [
    {
      ayah: mockAyahs[0], // ayah-1
      similarity: 78,
      divergencePoint: 'Both reassure about Allah\'s consideration of human capacity'
    }
  ],
  'ayah-3': [
    {
      ayah: mockAyahs[1], // ayah-2
      similarity: 82,
      divergencePoint: 'Both emphasize Allah\'s mercy, one about burden, the other about forgiveness'
    }
  ]
};

export const mockEngagementData = [
  { month: 'Jan', visited: 45, skipped: 5, revisited: 12 },
  { month: 'Feb', visited: 52, skipped: 3, revisited: 18 },
  { month: 'Mar', visited: 48, skipped: 7, revisited: 15 },
  { month: 'Apr', visited: 61, skipped: 2, revisited: 22 },
  { month: 'May', visited: 58, skipped: 4, revisited: 25 },
  { month: 'Jun', visited: 67, skipped: 1, revisited: 30 }
];

export const mockThemeEngagement = [
  { theme: 'Mercy', count: 45, percentage: 30 },
  { theme: 'Patience', count: 35, percentage: 23 },
  { theme: 'Guidance', count: 28, percentage: 19 },
  { theme: 'Gratitude', count: 22, percentage: 15 },
  { theme: 'Warning', count: 20, percentage: 13 }
];

export const mockMentors = [
  {
    id: 'mentor-1',
    name: 'Ustadh Ibrahim Hassan',
    specialty: 'Tajweed & Memorization',
    avatar: '🧑‍🏫',
    available: true,
    rating: 4.9,
    students: 127
  },
  {
    id: 'mentor-2',
    name: 'Shaykh Fatima Ahmed',
    specialty: 'Tafsir & Reflection',
    avatar: '👩‍🏫',
    available: true,
    rating: 4.8,
    students: 93
  },
  {
    id: 'mentor-3',
    name: 'Qari Yusuf Ali',
    specialty: 'Qira\'at & Recitation',
    avatar: '🧔',
    available: false,
    rating: 5.0,
    students: 156
  }
];
