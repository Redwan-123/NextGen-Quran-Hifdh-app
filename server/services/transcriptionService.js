import { tokenizeArabic } from '../utils/textUtils.js';

const OPENAI_TRANSCRIBE_URL = 'https://api.openai.com/v1/audio/transcriptions';

function buildMockTimestamps(words) {
  return words.map((word, index) => ({
    word,
    start: Number((index * 0.6).toFixed(2)),
    end: Number((index * 0.6 + 0.5).toFixed(2)),
    confidence: 0.6
  }));
}

async function transcribeWithOpenAI({ buffer, mimetype, fileName, language }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const form = new FormData();
  const blob = new Blob([buffer], { type: mimetype || 'audio/wav' });

  form.append('file', blob, fileName || 'recitation.wav');
  form.append('model', 'whisper-1');
  form.append('language', language || 'ar');
  form.append('response_format', 'verbose_json');
  form.append('temperature', '0');
  form.append('timestamp_granularities[]', 'word');

  const response = await fetch(OPENAI_TRANSCRIBE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: form
  });

  if (!response.ok) {
    const errText = await response.text();
    const error = new Error('Transcription failed');
    error.details = errText;
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const words = Array.isArray(data.words)
    ? data.words.map((word) => ({
        word: word.word,
        start: word.start,
        end: word.end,
        confidence: word.confidence ?? 0.8
      }))
    : [];

  return {
    text: data.text || '',
    words
  };
}

export async function transcribeAudio({ buffer, mimetype, fileName, language, fallbackText }) {
  let whisper = null;
  try {
    whisper = await transcribeWithOpenAI({ buffer, mimetype, fileName, language });
  } catch (error) {
    console.warn('Whisper transcription failed, using fallback.', error?.message || error);
  }
  if (whisper) {
    return whisper;
  }

  const fallback = fallbackText || '';
  const words = tokenizeArabic(fallback);

  return {
    text: fallback,
    words: buildMockTimestamps(words)
  };
}
