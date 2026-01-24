const DEFAULT_API = 'http://localhost:4000';

export const API_BASE = ((): string => {
  try {
    // @ts-ignore
    const env = import.meta?.env?.VITE_API_BASE;
    if (env && typeof env === 'string' && env.length > 0) return env;
  } catch (e) {}
  return DEFAULT_API;
})();

/**
 * NEW: Helper to fetch the audio URL from Quran.com
 * @param ayahKey - The key of the ayah (e.g., "1:1")
 * @param reciterId - The ID of the reciter (e.g., 7 for Mishary Rashid Alafasy)
 */
export const getAudioUrl = async (ayahKey: string, reciterId: string | number) => {
  try {
    // We call the Quran.com V4 API directly for the audio file
    const response = await fetch(`https://api.quran.com/api/v4/recitations/${reciterId}/by_ayah/${ayahKey}`);
    const data = await response.json();
    
    // The API returns an array, we take the first available file
    const audioPath = data.audio_files?.[0]?.url;
    
    if (!audioPath) return null;
    
    // Some URLs are relative, some are absolute. We ensure it's absolute.
    return audioPath.startsWith('http') ? audioPath : `https://audio.quran.com/${audioPath}`;
  } catch (err) {
    console.error("Failed to fetch audio from Quran.com", err);
    return null;
  }
};

export default API_BASE;