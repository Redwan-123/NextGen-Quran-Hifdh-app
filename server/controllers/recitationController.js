import asyncHandler from '../utils/asyncHandler.js';
import { createHttpError } from '../utils/errors.js';
import { tokenizeArabic } from '../utils/textUtils.js';
import { transcribeAudio } from '../services/transcriptionService.js';
import { compareWords } from '../services/comparisonService.js';
import { analyzeTajweed } from '../services/tajweedService.js';
import { buildSummary } from '../services/summaryService.js';

function buildMistakes({ differences, tajweedIssues, alignment, wordTimestamps }) {
  const mistakes = [];

  differences.forEach((diff) => {
    const timestamp = diff.spokenIndex != null && wordTimestamps[diff.spokenIndex]
      ? wordTimestamps[diff.spokenIndex].start
      : null;

    const severity = diff.type === 'missing'
      ? 'high'
      : diff.type === 'substitution'
        ? 'medium'
        : 'low';

    mistakes.push({
      word: diff.expectedWord || diff.spokenWord || null,
      type: diff.type,
      tajweed_rule: null,
      timestamp,
      severity
    });
  });

  tajweedIssues.forEach((issue) => {
    const alignmentItem = alignment[issue.alignmentIndex];
    const spokenIndex = alignmentItem?.spokenIndex;
    const timestamp = spokenIndex != null && wordTimestamps[spokenIndex]
      ? wordTimestamps[spokenIndex].start
      : null;

    mistakes.push({
      word: issue.word,
      type: issue.type,
      tajweed_rule: issue.tajweed_rule,
      timestamp,
      severity: 'medium'
    });
  });

  return mistakes;
}

export const analyseRecitation = asyncHandler(async (req, res) => {
  const { ayahText, ayahKey, language } = req.body || {};
  if (!ayahText) {
    throw createHttpError(400, 'ayahText is required');
  }
  if (!req.file) {
    throw createHttpError(400, 'Audio file is required');
  }

  const transcription = await transcribeAudio({
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    fileName: req.file.originalname,
    language: language || 'ar',
    fallbackText: ayahText
  });

  const expectedWords = tokenizeArabic(ayahText);
  const spokenWords = tokenizeArabic(transcription.text || '');

  const comparison = compareWords(expectedWords, spokenWords);
  const tajweed = analyzeTajweed(expectedWords, spokenWords, comparison.alignment);
  const mistakes = buildMistakes({
    differences: comparison.differences,
    tajweedIssues: tajweed.issues,
    alignment: comparison.alignment,
    wordTimestamps: transcription.words || []
  });

  res.json({
    ayah: ayahText,
    ayahKey: ayahKey || null,
    accuracy: comparison.accuracy,
    transcription: {
      text: transcription.text,
      words: transcription.words
    },
    differences: comparison.differences,
    tajweed: tajweed.results,
    tajweedScore: tajweed.score,
    mistakes
  });
});

export const summaryRecitation = asyncHandler(async (req, res) => {
  const { analyses } = req.body || {};
  if (!Array.isArray(analyses)) {
    throw createHttpError(400, 'analyses array is required');
  }

  const summary = buildSummary(analyses);

  res.json({
    accuracy: summary.accuracy,
    repeatedMistakes: summary.repeatedMistakes,
    tajweedScore: summary.tajweedScore
  });
});
