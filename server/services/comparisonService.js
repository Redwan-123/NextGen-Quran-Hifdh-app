import { clamp } from '../utils/textUtils.js';

function buildMatrix(rows, cols) {
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
  return matrix;
}

function backtrack(matrix, expectedWords, spokenWords) {
  const alignment = [];
  let i = expectedWords.length;
  let j = spokenWords.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && expectedWords[i - 1] === spokenWords[j - 1]) {
      alignment.unshift({
        type: 'match',
        expectedIndex: i - 1,
        spokenIndex: j - 1,
        expectedWord: expectedWords[i - 1],
        spokenWord: spokenWords[j - 1]
      });
      i -= 1;
      j -= 1;
      continue;
    }

    const score = matrix[i][j];
    const diag = i > 0 && j > 0 ? matrix[i - 1][j - 1] : Infinity;
    const up = i > 0 ? matrix[i - 1][j] : Infinity;
    const left = j > 0 ? matrix[i][j - 1] : Infinity;

    if (i > 0 && j > 0 && score === diag + 1) {
      alignment.unshift({
        type: 'substitution',
        expectedIndex: i - 1,
        spokenIndex: j - 1,
        expectedWord: expectedWords[i - 1],
        spokenWord: spokenWords[j - 1]
      });
      i -= 1;
      j -= 1;
      continue;
    }

    if (i > 0 && score === up + 1) {
      alignment.unshift({
        type: 'missing',
        expectedIndex: i - 1,
        spokenIndex: null,
        expectedWord: expectedWords[i - 1],
        spokenWord: null
      });
      i -= 1;
      continue;
    }

    if (j > 0) {
      alignment.unshift({
        type: 'extra',
        expectedIndex: null,
        spokenIndex: j - 1,
        expectedWord: null,
        spokenWord: spokenWords[j - 1]
      });
      j -= 1;
    }
  }

  return alignment;
}

function calculateMatrix(expectedWords, spokenWords) {
  const rows = expectedWords.length + 1;
  const cols = spokenWords.length + 1;
  const matrix = buildMatrix(rows, cols);

  for (let i = 0; i < rows; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      if (expectedWords[i - 1] === spokenWords[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        const insert = matrix[i][j - 1] + 1;
        const del = matrix[i - 1][j] + 1;
        const sub = matrix[i - 1][j - 1] + 1;
        matrix[i][j] = Math.min(insert, del, sub);
      }
    }
  }

  return matrix;
}

function detectOrderIssues(alignment, expectedWords) {
  const expectedIndexByWord = new Map();
  expectedWords.forEach((word, index) => {
    if (!expectedIndexByWord.has(word)) {
      expectedIndexByWord.set(word, []);
    }
    expectedIndexByWord.get(word).push(index);
  });

  return alignment
    .filter((item) => item.type === 'extra' && item.spokenWord)
    .map((item) => {
      const indices = expectedIndexByWord.get(item.spokenWord) || [];
      if (indices.length === 0) return null;
      return {
        ...item,
        type: 'order'
      };
    })
    .filter(Boolean);
}

export function compareWords(expectedWords, spokenWords) {
  const matrix = calculateMatrix(expectedWords, spokenWords);
  const alignment = backtrack(matrix, expectedWords, spokenWords);
  const differences = alignment.filter((item) => item.type !== 'match');
  const orderIssues = detectOrderIssues(alignment, expectedWords);

  const totalExpected = expectedWords.length;
  const totalErrors = differences.filter((item) => item.type !== 'extra').length;
  const accuracy = totalExpected === 0
    ? 0
    : clamp(Math.round(((totalExpected - totalErrors) / totalExpected) * 100), 0, 100);

  return {
    alignment,
    differences: [...differences, ...orderIssues],
    accuracy
  };
}
