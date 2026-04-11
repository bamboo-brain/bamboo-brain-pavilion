'use client';

import { Box, Text, Stack, rem } from '@mantine/core';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  return (
    <Stack gap={rem(4)}>
      <Box style={{ display: 'flex', alignItems: 'center', gap: rem(10) }}>
        <Text fz={rem(36)}>🔥</Text>
        <Box style={{ display: 'flex', alignItems: 'baseline', gap: rem(4) }}>
          <Text fz={rem(48)} fw={900} c="#ea580c" style={{ lineHeight: 1 }}>
            {currentStreak}
          </Text>
          <Text fz="sm" fw={600} c="var(--bb-outline)">day streak</Text>
        </Box>
      </Box>
      <Text fz="xs" fw={600} c="var(--bb-outline)">Best: {longestStreak} days</Text>
    </Stack>
  );
}
