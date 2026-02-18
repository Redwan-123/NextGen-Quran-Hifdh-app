import { clamp } from '../utils/textUtils.js';

export function buildSummary(analyses) {
  if (!Array.isArray(analyses) || analyses.length === 0) {
    return {
      accuracy: 0,
      repeatedMistakes: [],
      tajweedScore: 0
    };
  }

  const accuracyValues = analyses.map((analysis) => analysis.accuracy || 0);
  const tajweedValues = analyses.map((analysis) => analysis.tajweedScore || 0);

  const accuracy = Math.round(
    accuracyValues.reduce((acc, val) => acc + val, 0) / accuracyValues.length
  );
  const tajweedScore = Math.round(
    tajweedValues.reduce((acc, val) => acc + val, 0) / tajweedValues.length
  );

  const mistakeMap = new Map();
  analyses.forEach((analysis) => {
    (analysis.mistakes || []).forEach((mistake) => {
      const key = `${mistake.word || 'unknown'}::${mistake.type || 'unknown'}::${mistake.tajweed_rule || ''}`;
      mistakeMap.set(key, (mistakeMap.get(key) || 0) + 1);
    });
  });

  const repeatedMistakes = Array.from(mistakeMap.entries())
    .filter(([, count]) => count >= 2)
    .map(([key, count]) => {
      const [word, type, tajweedRule] = key.split('::');
      return {
        word,
        type,
        tajweed_rule: tajweedRule || null,
        count
      };
    });

  return {
    accuracy: clamp(accuracy, 0, 100),
    repeatedMistakes,
    tajweedScore: clamp(tajweedScore, 0, 100)
  };
}
