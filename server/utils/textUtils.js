const ARABIC_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u0640]/g;
const NON_ARABIC_OR_SPACE_REGEX = /[^\u0600-\u06FF\s]/g;

export function normalizeArabic(text) {
  if (!text) return '';
  return text
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(NON_ARABIC_OR_SPACE_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeArabic(text) {
  return normalizeArabic(text)
    .split(' ')
    .filter(Boolean);
}

export function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
