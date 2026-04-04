import type { ExtractedWord } from '@/lib/documents';

export interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
  wordIndex: number; // Index in the extractedWords array
}

/**
 * Calculate timing for each word occurrence based on text content and total duration
 * Prioritizes actual word timings from speech-to-text (offsetSeconds, durationSeconds)
 * Falls back to estimation if timings are not available
 * Returns array of all word occurrences with their timings
 */
export function calculateWordTimings(
  text: string,
  words: ExtractedWord[],
  totalDuration: number,
): WordTiming[] {
  if (!text || !totalDuration || words.length === 0) return [];

  const timings: WordTiming[] = [];
  
  // Check if we have actual timing data from speech-to-text
  const hasRealTimings = words.some(w => typeof w.offsetSeconds === 'number' && typeof w.durationSeconds === 'number');
  
  if (hasRealTimings) {
    // Sort words by their speech time (offsetSeconds)
    const sortedWordsWithIndex = [...words]
      .map((w, idx) => ({ word: w, index: idx }))
      .filter(({ word: w }) => typeof w.offsetSeconds === 'number' && typeof w.durationSeconds === 'number')
      .sort((a, b) => (a.word.offsetSeconds ?? 0) - (b.word.offsetSeconds ?? 0));
    
    sortedWordsWithIndex.forEach(({ word, index }) => {
      const startTime = word.offsetSeconds ?? 0;
      const endTime = (word.offsetSeconds ?? 0) + (word.durationSeconds ?? 0);
      
      timings.push({
        word: word.word,
        startTime,
        endTime,
        wordIndex: index,
      });
    });
    
    console.log('Word timings from backend (sorted by time):', 
      timings.slice(0, 5).map(t => ({ word: t.word, wordIndex: t.wordIndex, time: t.startTime.toFixed(2) }))
    );
  } else {
    // Fallback: estimate timing based on word order in the extractedWords array
    // Distribute time equally across words based on array order
    const timePerWord = totalDuration / Math.max(1, words.length);
    
    words.forEach((word, index) => {
      const startTime = index * timePerWord;
      const endTime = (index + 1) * timePerWord;
      
      timings.push({
        word: word.word,
        startTime,
        endTime,
        wordIndex: index,
      });
    });
  }
  
  return timings;
}

/**
 * Find the word that should be highlighted at a given time
 * Returns the index in the extractedWords array
 */
export function getHighlightedWordAtTime(
  currentTime: number,
  timings: WordTiming[],
): number | null {
  for (const timing of timings) {
    if (currentTime >= timing.startTime && currentTime < timing.endTime) {
      console.log(`At ${currentTime.toFixed(2)}s: highlighting "${timing.word}" (index ${timing.wordIndex})`);
      return timing.wordIndex;
    }
  }
  return null;
}
