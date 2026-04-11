'use client';

import { Box, Text, Stack, rem } from '@mantine/core';
import type { HskLevelProgress } from '@/types/stats';

interface HskProgressCardProps {
  hskProgress: HskLevelProgress[];
  currentLevel: number;
  targetLevel: number;
  charactersThisWeek: number;
}

export function HskProgressCard({ hskProgress, currentLevel, targetLevel, charactersThisWeek }: HskProgressCardProps) {
  const currentLevelProgress = hskProgress.find((p) => p.level === currentLevel);
  const nextLevel = Math.min(currentLevel + 1, 6);
  const wordsToNextLevel = currentLevelProgress
    ? currentLevelProgress.totalWords - currentLevelProgress.wordsLearned
    : null;

  return (
    <Box
      p={rem(28)}
      style={{
        borderRadius: rem(24),
        background: 'linear-gradient(135deg, #0a220a 0%, #154212 100%)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(21, 66, 18, 0.2)',
      }}
    >
      <Stack gap={rem(20)}>
        <Box>
          <Text fz={rem(16)} fw={800} mb={rem(4)}>HSK {currentLevel} Mastery</Text>
          <Text fz="xs" fw={500} style={{ opacity: 0.8 }}>
            You've mastered {charactersThisWeek} characters this week. Keep going!
          </Text>
        </Box>

        {currentLevelProgress && (
          <Stack gap={rem(8)}>
            <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text fz="sm" fw={700}>{currentLevelProgress.wordsLearned} words</Text>
              <Text fz="sm" fw={800}>{currentLevelProgress.percentage}%</Text>
            </Box>
            <Box style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: rem(8), height: rem(8), overflow: 'hidden' }}>
              <Box
                style={{
                  width: `${currentLevelProgress.percentage}%`,
                  height: '100%',
                  backgroundColor: '#bcf0ae',
                  borderRadius: rem(8),
                  transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            </Box>
            <Text fz="xs" style={{ opacity: 0.65 }}>
              {currentLevelProgress.totalWords} total words for HSK {currentLevel}
            </Text>
          </Stack>
        )}

        {wordsToNextLevel !== null && wordsToNextLevel > 0 && nextLevel !== currentLevel && (
          <Box
            p={rem(12)}
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: rem(12) }}
          >
            <Text fz="xs" fw={700} style={{ opacity: 0.9 }}>
              Progress to HSK {nextLevel}
            </Text>
            <Text fz="xs" style={{ opacity: 0.7 }} mt={rem(2)}>
              {wordsToNextLevel} more words to advance
            </Text>
          </Box>
        )}

        {targetLevel > currentLevel && (
          <Text fz="xs" style={{ opacity: 0.6 }}>
            Target: HSK {targetLevel}
          </Text>
        )}
      </Stack>
    </Box>
  );
}
