'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Title,
  Text,
  Stack,
  Group,
  Card,
  Button,
  Box,
  Badge,
  rem,
  SimpleGrid,
  Skeleton,
  ActionIcon,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconBrain,
  IconChartBar,
  IconTrophy,
  IconChevronRight,
  IconClipboardList,
} from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { getQuizStats } from '@/lib/quiz';
import type { QuizStats } from '@/types/quiz';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? '#15803d' : score >= 70 ? '#1d4ed8' : score >= 50 ? '#c2410c' : '#b91c1c';
  return (
    <Box style={{ flex: 1, height: rem(6), backgroundColor: 'var(--bb-surface-container)', borderRadius: rem(4), overflow: 'hidden' }}>
      <Box style={{ width: `${score}%`, height: '100%', backgroundColor: color, borderRadius: rem(4), transition: 'width 0.5s ease' }} />
    </Box>
  );
}

export default function QuizHubPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const accessToken = session?.accessToken ?? '';

  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    getQuizStats(accessToken)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <AppLayout
      title={
        <Group gap="sm">
          <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => router.push('/study-center')}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>
            Quiz Center
          </Title>
        </Group>
      }
    >
      <Stack gap={rem(40)}>
        <Text fz="sm" fw={600} c="var(--bb-outline)">Test your Chinese vocabulary knowledge</Text>

        {/* Stats */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {[
            {
              label: 'Total Quizzes',
              value: loading ? '…' : (stats?.totalQuizzesTaken ?? 0).toString(),
              sub: 'Quizzes taken',
              icon: <IconBrain size={22} />,
              color: 'var(--bb-primary)',
            },
            {
              label: 'Avg. Score',
              value: loading ? '…' : `${Math.round(stats?.averageScore ?? 0)}%`,
              sub: 'Average accuracy',
              icon: <IconChartBar size={22} />,
              color: '#2a5185',
            },
            {
              label: 'Best Score',
              value: loading ? '…' : `${Math.round(stats?.bestScore ?? 0)}%`,
              sub: 'Personal best',
              icon: <IconTrophy size={22} />,
              color: '#b45309',
            },
          ].map((stat, idx) => (
            <Card
              key={idx}
              radius={24}
              p={rem(32)}
              style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}
            >
              <Group justify="space-between" mb={rem(20)}>
                <Box p={rem(12)} style={{ borderRadius: 12, backgroundColor: 'var(--bb-surface-container-low)', color: stat.color, display: 'flex' }}>
                  {stat.icon}
                </Box>
              </Group>
              <Stack gap={rem(4)}>
                {loading ? (
                  <Skeleton height={rem(36)} width={80} radius={8} />
                ) : (
                  <Text fz={rem(32)} fw={800} c="var(--bb-on-surface)">{stat.value}</Text>
                )}
                <Text fz={rem(14)} fw={700} c="var(--bb-on-surface-variant)">{stat.label}</Text>
                <Text fz={rem(12)} fw={600} c="var(--bb-outline)">{stat.sub}</Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        {/* Recent quizzes */}
        <Stack gap={rem(20)}>
          <Group justify="space-between" align="flex-end">
            <Stack gap={rem(4)}>
              <Title order={2} fz={rem(22)} fw={800}>Recent Quizzes</Title>
              <Text fz="sm" fw={600} c="var(--bb-outline)">Click a row to view results</Text>
            </Stack>
          </Group>

          <Card radius={24} p={rem(0)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none', overflow: 'hidden' }}>
            {loading ? (
              <Stack gap={0}>
                {[0, 1, 2].map((i) => (
                  <Box key={i} p={rem(24)} style={{ borderBottom: '1px solid var(--bb-surface-container)' }}>
                    <Skeleton height={rem(40)} radius={8} />
                  </Box>
                ))}
              </Stack>
            ) : !stats || stats.recentSessions.length === 0 ? (
              <Stack align="center" gap={rem(16)} p={rem(64)}>
                <Box p={rem(20)} style={{ backgroundColor: 'var(--bb-surface-container-low)', borderRadius: 16, display: 'inline-flex' }}>
                  <IconClipboardList size={32} color="var(--bb-outline)" />
                </Box>
                <Stack gap={rem(8)} align="center">
                  <Text fw={800} fz="lg" c="var(--bb-on-surface)">No quizzes yet</Text>
                  <Text fz="sm" c="var(--bb-outline)" fw={600} ta="center" maw={300}>
                    Start a quiz from any document in your Library or a flashcard deck.
                  </Text>
                </Stack>
                <Button className="bb-btn-primary" radius={12} fw={800} onClick={() => router.push('/library')}>
                  Go to Library
                </Button>
              </Stack>
            ) : (
              <Stack gap={0}>
                {stats.recentSessions.map((s, idx) => (
                  <Box
                    key={s.id}
                    px={rem(28)}
                    py={rem(20)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: idx < stats.recentSessions.length - 1 ? '1px solid var(--bb-surface-container)' : undefined,
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    onClick={() => router.push(`/study-center/quiz/${s.id}/results`)}
                  >
                    <Group justify="space-between" align="center" gap={rem(16)} wrap="nowrap">
                      <Stack gap={rem(4)} style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={800} fz="sm" c="var(--bb-on-surface)" lineClamp={1}>{s.sourceName}</Text>
                        <Group gap={rem(8)}>
                          <Badge variant="light" color="gray" size="xs" radius="sm" fw={700}>
                            {s.sourceType}
                          </Badge>
                          <Text fz="xs" fw={600} c="var(--bb-outline)">{s.totalQuestions} questions</Text>
                          <Text fz="xs" fw={600} c="var(--bb-outline)">{formatDate(s.createdAt)}</Text>
                        </Group>
                      </Stack>
                      <Group gap={rem(12)} wrap="nowrap">
                        <ScoreBar score={s.score} />
                        <Text fz="sm" fw={800} c={s.score >= 70 ? 'var(--bb-primary)' : '#b91c1c'} style={{ width: rem(40), textAlign: 'right', flexShrink: 0 }}>
                          {s.score}%
                        </Text>
                        <IconChevronRight size={16} color="var(--bb-outline)" />
                      </Group>
                    </Group>
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Stack>
      </Stack>
    </AppLayout>
  );
}
