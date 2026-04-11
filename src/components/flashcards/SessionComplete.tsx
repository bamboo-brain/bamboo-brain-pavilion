'use client';

import { Stack, Group, Text, Button, Card, Box, rem, Progress } from '@mantine/core';
import { IconCheck, IconX, IconMinus } from '@tabler/icons-react';

interface SessionResult {
  cardId: string;
  grade: number;
  word: string;
}

interface SessionCompleteProps {
  results: SessionResult[];
  onBack: () => void;
  onStudyAgain: () => void;
}

export function SessionComplete({ results, onBack, onStudyAgain }: SessionCompleteProps) {
  const easyGood = results.filter((r) => r.grade >= 4).length;
  const hard = results.filter((r) => r.grade === 2 || r.grade === 3).length;
  const again = results.filter((r) => r.grade <= 1).length;
  const accuracy = results.length > 0 ? Math.round((easyGood / results.length) * 100) : 0;

  return (
    <Stack align="center" justify="center" style={{ minHeight: '60vh' }} gap={rem(32)}>
      <Text fz={rem(48)} ta="center">🎉</Text>
      <Stack gap={rem(8)} align="center">
        <Text fz={rem(32)} fw={800} c="var(--bb-on-surface)" ta="center">
          Session Complete!
        </Text>
        <Text fz="lg" fw={600} c="var(--bb-outline)" ta="center">
          {results.length} card{results.length !== 1 ? 's' : ''} reviewed
        </Text>
      </Stack>

      <Card
        radius={24}
        p={rem(40)}
        style={{
          backgroundColor: 'var(--bb-surface-container-lowest)',
          border: 'none',
          width: '100%',
          maxWidth: rem(480),
        }}
      >
        <Stack gap={rem(20)}>
          <ResultRow
            icon={<IconCheck size={16} color="#2d6a4f" />}
            label="Easy + Good"
            count={easyGood}
            total={results.length}
            color="#2d6a4f"
            bg="#d8f3dc"
          />
          <ResultRow
            icon={<IconMinus size={16} color="#d9480f" />}
            label="Hard"
            count={hard}
            total={results.length}
            color="#d9480f"
            bg="#ffe8cc"
          />
          <ResultRow
            icon={<IconX size={16} color="#c92a2a" />}
            label="Again"
            count={again}
            total={results.length}
            color="#c92a2a"
            bg="#ffe0e0"
          />

          <Box
            mt={rem(8)}
            p={rem(16)}
            style={{ backgroundColor: 'var(--bb-surface-container-low)', borderRadius: 12 }}
          >
            <Group justify="space-between">
              <Text fz="sm" fw={700} c="var(--bb-on-surface-variant)">
                Accuracy
              </Text>
              <Text fz="sm" fw={800} c="var(--bb-primary)">
                {accuracy}%
              </Text>
            </Group>
          </Box>
        </Stack>
      </Card>

      <Group gap="md">
        <Button variant="light" color="gray" radius={12} fw={800} h={rem(48)} onClick={onBack}>
          Back to Decks
        </Button>
        <Button
          className="bb-btn-primary"
          radius={12}
          fw={800}
          h={rem(48)}
          onClick={onStudyAgain}
        >
          Study Again
        </Button>
      </Group>
    </Stack>
  );
}

function ResultRow({
  icon,
  label,
  count,
  total,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
  color: string;
  bg: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <Group gap={rem(12)} align="center">
      <Box
        p={rem(6)}
        style={{ backgroundColor: bg, borderRadius: 8, display: 'flex', flexShrink: 0 }}
      >
        {icon}
      </Box>
      <Text fz="sm" fw={700} style={{ width: rem(100), flexShrink: 0 }}>
        {label}
      </Text>
      <Box style={{ flex: 1 }}>
        <Progress value={pct} size="sm" radius="xl" color={color} />
      </Box>
      <Text fz="sm" fw={800} c={color} style={{ width: rem(24), textAlign: 'right', flexShrink: 0 }}>
        {count}
      </Text>
    </Group>
  );
}
