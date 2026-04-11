'use client';

import { Card, Stack, Title, Text, Group, Badge, Divider, rem } from '@mantine/core';
import type { SessionInsights, VocabularyItem } from '@/types/speaking';

interface SessionInsightsPanelProps {
  insights?: SessionInsights;
  currentAccuracy?: number;
  currentDuration: number;
  topVocabulary: VocabularyItem[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function fluencyColor(fluency: string) {
  if (fluency === 'Excellent') return 'green';
  if (fluency === 'Great') return 'teal';
  if (fluency === 'Good') return 'blue';
  return 'orange';
}

export function SessionInsightsPanel({
  insights,
  currentAccuracy,
  currentDuration,
  topVocabulary,
}: SessionInsightsPanelProps) {
  const accuracy = insights?.accuracyScore ?? currentAccuracy;
  const duration = insights?.duration ?? formatDuration(currentDuration);

  return (
    <Stack gap={rem(24)}>
      <Card radius={24} p={rem(28)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
        <Title order={3} fz={rem(16)} fw={800} mb={rem(20)}>Session Insights</Title>
        <Stack gap={rem(16)}>
          <Group justify="space-between">
            <Text fz="sm" fw={700} c="var(--bb-on-surface-variant)">Accuracy Score</Text>
            <Text fz="sm" fw={800} c="var(--bb-primary)">
              {accuracy !== undefined ? `${accuracy}%` : '—'}
            </Text>
          </Group>

          {insights && (
            <Group justify="space-between">
              <Text fz="sm" fw={700} c="var(--bb-on-surface-variant)">Fluency</Text>
              <Badge
                color={fluencyColor(insights.fluency)}
                variant="light"
                size="sm"
                fw={800}
                radius="sm"
              >
                {insights.fluency}
              </Badge>
            </Group>
          )}

          <Group justify="space-between">
            <Text fz="sm" fw={700} c="var(--bb-on-surface-variant)">Duration</Text>
            <Text fz="sm" fw={800} c="var(--bb-outline)">{duration}</Text>
          </Group>

          {insights && (
            <>
              <Divider color="var(--bb-surface-container)" />
              <Group justify="space-between">
                <Text fz="sm" fw={700} c="var(--bb-on-surface-variant)">Tone Errors</Text>
                <Text fz="sm" fw={800} c={insights.toneErrorCount > 0 ? '#d9480f' : 'var(--bb-primary)'}>
                  {insights.toneErrorCount}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text fz="sm" fw={700} c="var(--bb-on-surface-variant)">Turns</Text>
                <Text fz="sm" fw={800} c="var(--bb-outline)">{insights.userTurns}</Text>
              </Group>
            </>
          )}
        </Stack>
      </Card>

      {topVocabulary.length > 0 && (
        <Card radius={24} p={rem(28)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
          <Title order={3} fz={rem(16)} fw={800} mb={rem(16)}>Top Vocabulary Used</Title>
          <Stack gap={rem(8)}>
            {topVocabulary.slice(0, 6).map((item) => (
              <Group key={item.word} justify="space-between" align="center">
                <Group gap={rem(8)}>
                  <Text className="hanzi" fz={rem(18)} fw={600} c="var(--bb-on-surface)">
                    {item.word}
                  </Text>
                  <Text fz="xs" fw={600} c="var(--bb-outline)">{item.meaning.toUpperCase()}</Text>
                </Group>
                {item.usageCount > 1 && (
                  <Badge color="gray" variant="light" size="xs" fw={700} radius="sm">
                    ×{item.usageCount}
                  </Badge>
                )}
              </Group>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
