import { clamp } from '../utils/textUtils.js';

function wordConfidence(expectedWord, spokenWord) {
  if (!expectedWord || !spokenWord) return 0.4;
  if (expectedWord === spokenWord) return 0.95;

  const expectedLen = expectedWord.length || 1;
  const spokenLen = spokenWord.length || 1;
  const ratio = spokenLen / expectedLen;
  const diff = Math.abs(1 - ratio);

  return clamp(1 - diff, 0.4, 0.9);
}

function detectMaddIssue(expectedWord, spokenWord) {
  if (!expectedWord || !spokenWord) return null;
  const expectedLen = expectedWord.length || 1;
  const spokenLen = spokenWord.length || 1;
  const ratio = spokenLen / expectedLen;

  if (ratio >= 1.35) {
    return 'madd_over';
  }
  if (ratio <= 0.7) {
    return 'madd_under';
  }
  return null;
}

function detectGhunnahIssue(expectedWord, spokenWord) {
  if (!expectedWord || !spokenWord) return null;
  const hasNun = expectedWord.includes('ن');
  const hasMim = expectedWord.includes('م');

  if ((hasNun || hasMim) && expectedWord !== spokenWord) {
    return 'ghunnah';
  }
  return null;
}

export function analyzeTajweed(expectedWords, spokenWords, alignment) {
  const results = alignment.map((item) => {
    if (item.type === 'missing') {
      return {
        expectedWord: item.expectedWord,
        spokenWord: null,
        confidence: 0.3,
        tajweed_rule: null
      };
    }

    if (item.type === 'extra') {
      return {
        expectedWord: null,
        spokenWord: item.spokenWord,
        confidence: 0.5,
        tajweed_rule: null
      };
    }

    const expectedWord = item.expectedWord;
    const spokenWord = item.spokenWord;
    const confidence = wordConfidence(expectedWord, spokenWord);
    const madd = detectMaddIssue(expectedWord, spokenWord);
    const ghunnah = detectGhunnahIssue(expectedWord, spokenWord);
    const tajweedRule = madd || ghunnah;

    return {
      expectedWord,
      spokenWord,
      confidence,
      tajweed_rule: tajweedRule
    };
  });

  const issues = results
    .map((result, index) => {
      if (!result.tajweed_rule) return null;
      return {
        word: result.expectedWord || result.spokenWord,
        type: 'pronunciation',
        tajweed_rule: result.tajweed_rule,
        alignmentIndex: index
      };
    })
    .filter(Boolean);

  const avgConfidence = results.length === 0
    ? 0
    : Math.round((results.reduce((acc, result) => acc + result.confidence, 0) / results.length) * 100);

  return {
    results,
    issues,
    score: clamp(avgConfidence, 0, 100)
  };
}
