import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Sentiment from 'sentiment';

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());

const sentiment = new Sentiment();

// Basic emotion keyword map and practical suggestions
const EMOTION_MAP = {
  happy: {
    labels: ['happy','joy','glad','excited','pleased','content','cheerful'],
    solutions: ['Celebrate small wins', 'Share your joy with someone', 'Capture this moment in a journal', 'Practice gratitude to deepen the feeling']
  },
  sad: {
    labels: ['sad','down','unhappy','depressed','blue','miserable','sorrow'],
    solutions: ['Allow yourself to feel and name the emotion', 'Reach out to a friend or trusted person', 'Try a grounding exercise (5 deep breaths)', 'Consider scheduling time for self-care']
  },
  anxious: {
    labels: ['anxious','anxiety','worried','nervous','stressed','panic','uneasy'],
    solutions: ['Try a 4-4-4 breathing exercise', 'Break tasks into small steps', 'Use grounding techniques (5 things you can see...)', 'Limit stimulants and screen time before bed']
  },
  angry: {
    labels: ['angry','mad','furious','irritated','annoyed','resentful'],
    solutions: ['Take a short walk or step away', 'Count to 10 and breathe', 'Write down your feelings before responding', 'Use "I" statements to communicate calmly']
  },
  neutral: {
    labels: [],
    solutions: ['Reflect on how you want to feel', 'Set a small, enjoyable goal for the next hour', 'Take a short mindful break']
  }
};

function detectEmotion(text) {
  if (!text || typeof text !== 'string') return { emotion: 'neutral', score: 0 };
  const normalized = text.toLowerCase();

  // Check for explicit emotion words first
  for (const [key, v] of Object.entries(EMOTION_MAP)) {
    for (const word of v.labels) {
      if (normalized.includes(word)) {
        // compute sentiment score to confirm polarity
        const s = sentiment.analyze(text).score;
        return { emotion: key, score: s };
      }
    }
  }

  // Fallback to sentiment polarity mapping
  const s = sentiment.analyze(text).score;
  if (s >= 2) return { emotion: 'happy', score: s };
  if (s <= -2) return { emotion: 'sad', score: s };
  if (s < 2 && s > -2) {
    // look for worry-like words
    if (/worri|anxi|stress|nerv/.test(normalized)) return { emotion: 'anxious', score: s };
    return { emotion: 'neutral', score: s };
  }
  return { emotion: 'neutral', score: s };
}

function generateAIRecommendation(text, emotion, score, suggestions) {
  // Lightweight templated 'AI' recommendation: summarizes and prioritizes practical steps
  const opening = {
    happy: `You're expressing positive feelings — that's wonderful. Here are focused ways to deepen and channel that energy`,
    sad: `I hear sadness in what you shared. Here are practical steps to gently support you right now`,
    anxious: `There are signs of anxiety; try quick grounding and breathing first, then work through practical steps`,
    angry: `You're feeling angry — it's valid. Use short pauses and expression techniques before taking action`,
    neutral: `Thanks for sharing — here are some small, actionable steps to move forward`
  };

  const opener = opening[emotion] || opening['neutral'];

  // Build prioritized action list from suggestions
  const prioritized = suggestions.slice(0, 4).map((s, i) => ({ step: s, why: `${i === 0 ? 'Start here —' : 'Then,'} this helps by providing immediate ${emotion === 'anxious' ? 'grounding' : emotion === 'happy' ? 'focus' : 'support'}.` }));

  const summary = `${opener}. Based on what you wrote, recommended next steps: ${suggestions.slice(0,3).join('; ')}.`;

  return { summary, prioritized };
}

app.post('/api/emotion', (req, res) => {
  const { text } = req.body || {};
  const detection = detectEmotion(text);
  const entry = EMOTION_MAP[detection.emotion] || EMOTION_MAP['neutral'];

  // Create pragmatic suggestions: prioritize those in the map
  const suggestions = entry.solutions.slice(0, 6);

  const ai = generateAIRecommendation(text || '', detection.emotion, detection.score, suggestions);

  res.json({
    emotion: detection.emotion,
    score: detection.score,
    suggestions,
    aiRecommendation: ai,
    rawText: text || ''
  });
});

// Minimal reciters fallback (matches qariOptions in frontend mock data)
const FALLBACK_RECITERS = [
  { id: 'husary', name: 'Sheikh Mahmoud Khalil Al-Husary', server: 'husary' },
  { id: 'minshawi', name: 'Sheikh Mohamed Siddiq Al-Minshawi', server: 'minshawi' },
  { id: 'sudais', name: 'Sheikh Abdul Rahman Al-Sudais', server: 'sudais' },
  { id: 'shuraim', name: 'Sheikh Saud Al-Shuraim', server: 'shuraim' },
  { id: 'ajmi', name: 'Sheikh Ahmad Al-Ajmi', server: 'ajmi' }
];

// Proxy reciters list: try quran.com, fallback to local list
app.get('/api/reciters', async (req, res) => {
  try {
    const upstream = await fetch('https://api.quran.com/api/v4/resources/reciters');
    if (upstream.ok) {
      const data = await upstream.json();
      const list = data?.reciters || data?.resources || data || [];
      return res.json({ reciters: list });
    }
  } catch (err) {
    console.warn('Upstream reciters fetch failed, trying Quran.com API directly', err?.message || err);
  }
  
  // Fallback: try fetching from Quran.com recitations API
  try {
    const quranRes = await fetch('https://api.quran.com/api/v4/recitations');
    if (quranRes.ok) {
      const quranData = await quranRes.json();
      const reciters = quranData.recitations || [];
      return res.json({ reciters });
    }
  } catch (err) {
    console.warn('Quran.com recitations API failed', err?.message || err);
  }
  
  // Final fallback to local list
  return res.json({ reciters: FALLBACK_RECITERS });
});

async function urlExists(url) {
  try {
    // Try HEAD first
    const head = await fetch(url, { method: 'HEAD' });
    if (head && head.ok) return true;
  } catch (e) {
    // ignore
  }
  try {
    // Fallback to ranged GET for servers that don't support HEAD
    const r = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
    return r && (r.status === 200 || r.status === 206);
  } catch (e) {
    return false;
  }
}

function buildAudioCandidates(reciterId, surah, ayah, verseKey) {
  const candidates = [];
  const vkeyFile = String(verseKey || `${surah}:${ayah}`).replace(':', '_');

  // try islamic.network patterns
  candidates.push(`https://cdn.islamic.network/quran/audio/128/${reciterId}/${surah}/${ayah}.mp3`);
  candidates.push(`https://cdn.islamic.network/quran/audio/128/${reciterId}/${vkeyFile}.mp3`);

  // try alquran.cloud common pattern
  candidates.push(`https://cdn.alquran.cloud/media/audio/128/${reciterId}/${surah}`);
  candidates.push(`https://cdn.alquran.cloud/media/audio/128/${reciterId}/${vkeyFile}`);

  return candidates;
}

// Resolve an audio URL by probing candidate CDNs and returning first playable URL
app.get('/api/audio', async (req, res) => {
  const { reciter, surah, ayah, verse_key } = req.query;
  if (!reciter || (!surah && !verse_key)) return res.status(400).json({ error: 'reciter and surah/verse_key required' });

  const reciterId = String(reciter);
  const s = surah ? String(surah) : null;
  const a = ayah ? String(ayah) : null;
  const vkey = verse_key ? String(verse_key) : null;
  const ayahKey = vkey || `${s}:${a}`;

  // Array of reciter IDs to try (handles both numeric and string IDs)
  const reciterIds = [reciterId];
  
  // Map common string IDs to Quran.com numeric IDs
  const idMap = {
    'husary': '7',
    'minshawi': '5',
    'sudais': '11',
    'shuraim': '15',
    'ajmi': '3'
  };
  
  if (idMap[reciterId]) {
    reciterIds.push(idMap[reciterId]);
  }
  if (!isNaN(reciterId)) {
    // If numeric, also try it as fallback
  } else {
    // If string, try some common numeric IDs
    reciterIds.push('7', '1', '5');
  }

  // Try each reciter ID
  for (const rid of reciterIds) {
    try {
      const quranRes = await fetch(`https://api.quran.com/api/v4/recitations/${rid}/by_ayah/${ayahKey}`);
      if (quranRes.ok) {
        const quranData = await quranRes.json();
        const audioPath = quranData.audio_files?.[0]?.url;
        if (audioPath) {
          const fullUrl = audioPath.startsWith('http') ? audioPath : `https://audio.quran.com${audioPath}`;
          return res.json({ url: fullUrl });
        }
      }
    } catch (err) {
      // Continue to next reciter ID
    }
  }

  // Fallback to CDN patterns
  const candidates = buildAudioCandidates(reciterId, s, a, vkey);
  for (const url of candidates) {
    try {
      const ok = await urlExists(url);
      if (ok) return res.json({ url });
    } catch (err) {
      // continue
    }
  }

  return res.status(404).json({ error: 'No playable audio found for given reciter/verse' });
});

app.listen(port, () => {
  console.log(`Emotion API listening at http://localhost:${port}`);
});
