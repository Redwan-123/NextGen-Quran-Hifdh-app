export interface ActionStep {
  id: string;
  title: string;
  icon: string;
  duration: string;
  category: 'physical' | 'spiritual' | 'mental' | 'social';
}

export const emotionActionSteps: Record<string, ActionStep[]> = {
  anxious: [
    {
      id: 'wudu',
      title: 'Make fresh wudu and pray 2 rakah',
      icon: '🕌',
      duration: '10 min',
      category: 'spiritual'
    },
    {
      id: 'walk',
      title: 'Go for a 15-minute walk outside',
      icon: '🚶',
      duration: '15 min',
      category: 'physical'
    },
    {
      id: 'dhikr',
      title: 'Recite "La ilaha illa Anta, Subhanaka, inni kuntu minaz-zalimin" 100 times',
      icon: '📿',
      duration: '5 min',
      category: 'spiritual'
    },
    {
      id: 'breathe',
      title: 'Practice deep breathing: 4 seconds in, 7 hold, 8 out',
      icon: '🌬️',
      duration: '5 min',
      category: 'mental'
    }
  ],
  guilty: [
    {
      id: 'tawbah',
      title: 'Pray Salat al-Tawbah (2 rakah repentance prayer)',
      icon: '🤲',
      duration: '10 min',
      category: 'spiritual'
    },
    {
      id: 'istighfar',
      title: 'Say "Astaghfirullah" 100 times with presence',
      icon: '📿',
      duration: '5 min',
      category: 'spiritual'
    },
    {
      id: 'charity',
      title: 'Give sadaqah, even if small - purify your wealth',
      icon: '💝',
      duration: '2 min',
      category: 'spiritual'
    },
    {
      id: 'journal',
      title: 'Write down what you regret and make a plan to improve',
      icon: '📝',
      duration: '10 min',
      category: 'mental'
    }
  ],
  tired: [
    {
      id: 'sleep',
      title: 'Take a 20-minute power nap with duaa before sleeping',
      icon: '😴',
      duration: '20 min',
      category: 'physical'
    },
    {
      id: 'wudu-fresh',
      title: 'Make wudu with cool water to refresh yourself',
      icon: '💧',
      duration: '5 min',
      category: 'spiritual'
    },
    {
      id: 'hadith',
      title: 'Read the hadith: "Take benefit of five before five..." then rest',
      icon: '📖',
      duration: '3 min',
      category: 'spiritual'
    },
    {
      id: 'stretch',
      title: 'Do light stretching and make tasbeeh',
      icon: '🧘',
      duration: '10 min',
      category: 'physical'
    }
  ],
  hopeful: [
    {
      id: 'shukr',
      title: 'Pray 2 rakah shukr (gratitude) prayer',
      icon: '🙏',
      duration: '10 min',
      category: 'spiritual'
    },
    {
      id: 'duaa',
      title: 'Make duaa for your dreams and thank Allah for His blessings',
      icon: '🤲',
      duration: '5 min',
      category: 'spiritual'
    },
    {
      id: 'plan',
      title: 'Write down 3 goals and action steps - trust in Allah',
      icon: '📋',
      duration: '10 min',
      category: 'mental'
    },
    {
      id: 'share',
      title: 'Share your positive energy - call a loved one',
      icon: '☎️',
      duration: '10 min',
      category: 'social'
    }
  ],
  grateful: [
    {
      id: 'alhamdulillah',
      title: 'Say "Alhamdulillah" 100 times with reflection',
      icon: '🌟',
      duration: '5 min',
      category: 'spiritual'
    },
    {
      id: 'sujood',
      title: 'Make a long sujood and thank Allah for everything',
      icon: '🕌',
      duration: '5 min',
      category: 'spiritual'
    },
    {
      id: 'list',
      title: 'Write down 10 blessings you often overlook',
      icon: '📝',
      duration: '10 min',
      category: 'mental'
    },
    {
      id: 'give',
      title: 'Give sadaqah to express gratitude',
      icon: '💝',
      duration: '5 min',
      category: 'spiritual'
    }
  ],
  confused: [
    {
      id: 'istikhara',
      title: 'Pray Salat al-Istikhara and ask Allah for guidance',
      icon: '🕌',
      duration: '15 min',
      category: 'spiritual'
    },
    {
      id: 'counsel',
      title: 'Seek advice from a trusted, knowledgeable person',
      icon: '👥',
      duration: '30 min',
      category: 'social'
    },
    {
      id: 'reflect',
      title: 'Make wudu, pray 2 rakah, then sit in quiet reflection',
      icon: '🤔',
      duration: '20 min',
      category: 'spiritual'
    },
    {
      id: 'pros-cons',
      title: 'Write pros and cons, then make duaa for clarity',
      icon: '📊',
      duration: '15 min',
      category: 'mental'
    }
  ],
  peaceful: [
    {
      id: 'maintain',
      title: 'Pray 2 rakah to maintain this peace and thank Allah',
      icon: '🕌',
      duration: '10 min',
      category: 'spiritual'
    },
    {
      id: 'tahajjud',
      title: 'Plan to wake up for Tahajjud tonight',
      icon: '🌙',
      duration: '2 min',
      category: 'spiritual'
    },
    {
      id: 'nature',
      title: 'Spend time in nature reflecting on Allah\'s creation',
      icon: '🌳',
      duration: '20 min',
      category: 'physical'
    },
    {
      id: 'memorize',
      title: 'Use this calm state to memorize new Quran',
      icon: '📖',
      duration: '15 min',
      category: 'spiritual'
    }
  ],
  lost: [
    {
      id: 'guidance',
      title: 'Pray 2 rakah asking Allah to guide you back',
      icon: '🕌',
      duration: '10 min',
      category: 'spiritual'
    },
    {
      id: 'return',
      title: 'Say "Innalillahi wa inna ilayhi rajioon" and renew your faith',
      icon: '🔄',
      duration: '5 min',
      category: 'spiritual'
    },
    {
      id: 'mentor',
      title: 'Connect with a mentor or scholar for guidance',
      icon: '👨‍🏫',
      duration: '30 min',
      category: 'social'
    },
    {
      id: 'basics',
      title: 'Go back to basics: pray on time, read Quran daily',
      icon: '⏰',
      duration: 'Ongoing',
      category: 'spiritual'
    }
  ]
};

export const hadithRecommendations: Record<string, { text: string; reference: string }> = {
  anxious: {
    text: "No fatigue, disease, sorrow, sadness, hurt, or distress befalls a Muslim - not even the prick he receives from a thorn - except that Allah expiates some of his sins because of it.",
    reference: "Sahih al-Bukhari 5641"
  },
  guilty: {
    text: "The one who repents from sin is like the one who never sinned.",
    reference: "Sunan Ibn Majah 4250"
  },
  tired: {
    text: "Take advantage of five before five: your youth before your old age, your health before your illness, your wealth before your poverty, your free time before your busyness, and your life before your death.",
    reference: "Al-Hakim"
  },
  hopeful: {
    text: "Allah says: 'I am as My servant thinks I am.'",
    reference: "Sahih al-Bukhari 7405"
  },
  grateful: {
    text: "If you are grateful, I will surely increase you [in favor].",
    reference: "Quran 14:7"
  },
  confused: {
    text: "When you do not know what to do, pray istikhara and trust in Allah's plan.",
    reference: "Sahih al-Bukhari 1162"
  },
  peaceful: {
    text: "There is a polish for everything that becomes rusty, and the polish for hearts is the remembrance of Allah.",
    reference: "Bayhaqi"
  },
  lost: {
    text: "All the sons of Adam are sinners, but the best of sinners are those who repent often.",
    reference: "Sunan Ibn Majah 4251"
  }
};
