/**
 * Quran.com API v4 Service
 * Docs: https://api.quran.com/api/v4
 *
 * Provides verse data with authentic Uthmani text, page mapping,
 * surah structure, and ayah metadata — perfect for a Mushaf UI.
 */

const BASE = 'https://api.quran.com/api/v4';

// ========== Types ==========

export interface Verse {
  id: number;
  verse_key: string;        // e.g. "2:255"
  verse_number: number;
  chapter_id: number;
  page_number: number;
  juz_number: number;
  hizb_number: number;
  text_uthmani: string;     // authentic Uthmani script
}

export interface Chapter {
  id: number;
  name_arabic: string;
  name_simple: string;      // transliteration e.g. "Al-Fatihah"
  revelation_place: string;
  verses_count: number;
  pages: number[];          // [startPage, endPage]
  bismillah_pre: boolean;
}

export interface PageData {
  page: number;
  verses: Verse[];
  chapters: number[];       // unique chapter ids on this page
}

// ========== Cache ==========

const pageCache = new Map<number, PageData>();
const chapterCache = new Map<number, Chapter>();
let allChapters: Chapter[] | null = null;

// ========== API Functions ==========

/**
 * Fetch all verses on a given Mushaf page (1-604).
 * Uses the Quran.com /verses/by_page endpoint merged with
 * /quran/verses/uthmani for authentic text.
 */
export async function fetchPageVerses(page: number): Promise<PageData> {
  if (pageCache.has(page)) return pageCache.get(page)!;

  const [metaRes, textRes] = await Promise.all([
    fetch(`${BASE}/verses/by_page/${page}?per_page=50&fields=chapter_id,verse_number,page_number,juz_number,hizb_number`),
    fetch(`${BASE}/quran/verses/uthmani?page_number=${page}`),
  ]);

  const metaJson = await metaRes.json();
  const textJson = await textRes.json();

  // Build a map from verse_key -> uthmani text
  const textMap = new Map<string, string>();
  for (const v of textJson.verses || []) {
    textMap.set(v.verse_key, v.text_uthmani);
  }

  const verses: Verse[] = (metaJson.verses || []).map((v: any) => ({
    id: v.id,
    verse_key: v.verse_key,
    verse_number: v.verse_number,
    chapter_id: v.chapter_id,
    page_number: v.page_number || page,
    juz_number: v.juz_number,
    hizb_number: v.hizb_number,
    text_uthmani: textMap.get(v.verse_key) || '',
  }));

  // Find unique chapters on this page
  const chapters = [...new Set(verses.map(v => v.chapter_id))];

  const data: PageData = { page, verses, chapters };
  pageCache.set(page, data);
  return data;
}

/**
 * Fetch a single chapter's metadata.
 */
export async function fetchChapter(id: number): Promise<Chapter> {
  if (chapterCache.has(id)) return chapterCache.get(id)!;

  const res = await fetch(`${BASE}/chapters/${id}`);
  const json = await res.json();
  const ch = json.chapter;

  const chapter: Chapter = {
    id: ch.id,
    name_arabic: ch.name_arabic,
    name_simple: ch.name_simple,
    revelation_place: ch.revelation_place,
    verses_count: ch.verses_count,
    pages: ch.pages,
    bismillah_pre: ch.bismillah_pre,
  };

  chapterCache.set(id, chapter);
  return chapter;
}

/**
 * Fetch the full list of 114 chapters (cached).
 */
export async function fetchAllChapters(): Promise<Chapter[]> {
  if (allChapters) return allChapters;

  const res = await fetch(`${BASE}/chapters`);
  const json = await res.json();

  allChapters = (json.chapters || []).map((ch: any) => ({
    id: ch.id,
    name_arabic: ch.name_arabic,
    name_simple: ch.name_simple,
    revelation_place: ch.revelation_place,
    verses_count: ch.verses_count,
    pages: ch.pages,
    bismillah_pre: ch.bismillah_pre,
  }));

  // Also populate individual cache
  for (const ch of allChapters!) {
    chapterCache.set(ch.id, ch);
  }

  return allChapters!;
}

/**
 * Clear all caches (useful for memory management).
 */
export function clearCache() {
  pageCache.clear();
  chapterCache.clear();
  allChapters = null;
}
