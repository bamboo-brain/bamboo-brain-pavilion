'use client';

import { Box, Text, Group, rem, Tooltip } from '@mantine/core';
import type { DailyActivity } from '@/types/stats';

interface ActivityHeatmapProps {
  dailyActivity: DailyActivity[];
  days?: number;
}

function getIntensity(minutes: number): string {
  if (minutes === 0) return 'var(--bb-surface-container)';
  if (minutes < 15) return '#bbf7d0';
  if (minutes < 30) return '#4ade80';
  if (minutes < 60) return '#16a34a';
  return '#166534';
}

export function ActivityHeatmap({ dailyActivity, days = 90 }: ActivityHeatmapProps) {
  const today = new Date();

  const cells = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split('T')[0];
    const activity = dailyActivity.find((d) => d.date.startsWith(dateStr));
    return { dateStr, minutes: activity?.minutesStudied ?? 0 };
  });

  // Group into weeks (columns)
  const weeks: typeof cells[] = [];
  let week: typeof cells = [];
  cells.forEach((cell, i) => {
    week.push(cell);
    if (week.length === 7 || i === cells.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  return (
    <Box>
      <Group gap={rem(3)} align="flex-start" wrap="nowrap">
        {weeks.map((wk, wi) => (
          <Box key={wi} style={{ display: 'flex', flexDirection: 'column', gap: rem(3) }}>
            {wk.map((cell) => (
              <Tooltip key={cell.dateStr} label={`${cell.dateStr}: ${cell.minutes} min`} withArrow>
                <Box
                  style={{
                    width: rem(12),
                    height: rem(12),
                    borderRadius: rem(2),
                    backgroundColor: getIntensity(cell.minutes),
                    flexShrink: 0,
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        ))}
      </Group>
      <Group gap={rem(6)} mt={rem(8)} align="center">
        <Text fz={rem(10)} c="var(--bb-outline)" fw={600}>Less</Text>
        {[0, 10, 25, 45, 70].map((m, i) => (
          <Box
            key={i}
            style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: getIntensity(m) }}
          />
        ))}
        <Text fz={rem(10)} c="var(--bb-outline)" fw={600}>More</Text>
      </Group>
    </Box>
  );
}
