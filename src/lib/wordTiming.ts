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
 * Falls back to estimation based on word position in the TEXT, not the array
 * Returns array of all word occurrences with their timings
 */
export function calculateWordTimings(
  text: string,
  words: ExtractedWord[],
  totalDuration: number,
): WordTiming[] {
  if (!text || !totalDuration || words.length === 0) return [];

  const timings: WordTiming[] = [];
  
  // Check if we have actual timing data from speech-to-text (offsetSeconds)
  const wordsWithOffsets = words.filter(w => typeof w.offsetSeconds === 'number');
  const hasRealTimings = wordsWithOffsets.length > 0;
  
  console.log('📊 Word timing method:', {
    total: words.length,
    withOffsets: wordsWithOffsets.length,
    hasRealTimings,
  });
  
  if (hasRealTimings) {
    // Use backend offsets to create timing windows
    // Sort by offset to get the sequence words appear in the video
    const sorted = words
      .map((word, idx) => ({
        word,
        index: idx,
        offset: word.offsetSeconds ?? Infinity,
      }))
      .filter(w => typeof w.word.offsetSeconds === 'number')
      .sort((a, b) => a.offset - b.offset);
    
    // Create timing windows based on gaps between words
    sorted.forEach((item, idx) => {
      const startTime = item.word.offsetSeconds ?? 0;
      
      // End time is the start of next word, or duration + 0.5s, whichever is earlier
      let endTime: number;
      if (idx < sorted.length - 1) {
        endTime = sorted[idx + 1].offset;
      } else {
        const duration = item.word.durationSeconds ?? 0.5;
        endTime = Math.min(startTime + duration, totalDuration);
      }
      
      // Ensure minimum highlighting duration
      endTime = Math.max(endTime, startTime + 0.15);
      
      timings.push({
        word: item.word.word,
        startTime,
        endTime,
        wordIndex: item.index,
      });
    });
    
    console.log('✅ Using backend offsets:', {
      count: timings.length,
      timings: timings.map(t => ({ word: t.word, idx: t.wordIndex, start: t.startTime.toFixed(2), end: t.endTime.toFixed(2), dur: (t.endTime - t.startTime).toFixed(2) }))
    });
  } else {
    // Fallback: no timing data available - estimate based on text position
    const wordMap = new Map(words.map((w, idx) => [w.word, idx]));
    const sorted = [...words].sort((a, b) => b.word.length - a.word.length);
    const escaped = sorted.map((w) => w.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'g');
    
    let match;
    const matches: Array<{ word: string; wordIdx: number }> = [];
    
    while ((match = regex.exec(text)) !== null) {
      const wordStr = match[0];
      const wordIdx = wordMap.get(wordStr);
      if (wordIdx !== undefined) {
        matches.push({ word: wordStr, wordIdx });
      }
    }
    
    if (matches.length > 0) {
      const timePerWord = totalDuration / matches.length;
      matches.forEach((match, idx) => {
        timings.push({
          word: match.word,
          startTime: idx * timePerWord,
          endTime: (idx + 1) * timePerWord,
          wordIndex: match.wordIdx,
        });
      });
      
      console.log('📍 Fallback text-position:', {
        matches: matches.length,
        timePerWord: timePerWord.toFixed(3),
      });
    }
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
      console.log(`✨ At ${currentTime.toFixed(2)}s: highlighting "${timing.word}" (index ${timing.wordIndex}) [${timing.startTime.toFixed(2)}-${timing.endTime.toFixed(2)}]`);
      return timing.wordIndex;
    }
  }
  return null;
}
