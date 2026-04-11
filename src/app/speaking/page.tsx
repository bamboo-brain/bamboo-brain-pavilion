'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  ActionIcon,
  Table,
  ScrollArea,
  TextInput,
  Tooltip,
  Progress,
  Skeleton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { TopicSelectionModal } from '@/components/speaking/TopicSelectionModal';
import {
  IconHistory,
  IconClock,
  IconChevronRight,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { MicIcon } from '@/components/icons';
import { getSessions, getSpeakingStats, deleteSession } from '@/lib/api/speaking';
import type { SpeakingSession, SpeakingStats } from '@/types/speaking';

function hskBadgeColor(level: number) {
  if (level <= 2) return 'green';
  if (level <= 4) return 'blue';
  return 'violet';
}

export default function SpeakingStudioPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? '';

  const [sessions, setSessions] = useState<SpeakingSession[]>([]);
  const [stats, setStats] = useState<SpeakingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | '1-2' | '3-4' | '5-6'>('all');
  const [sortMode, setSortMode] = useState<'recent' | 'accuracy'>('recent');
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    async function loadData() {
      const [sessionsResult, statsResult] = await Promise.allSettled([
        getSessions(accessToken),
        getSpeakingStats(accessToken),
      ]);
      if (cancelled) return;
      if (sessionsResult.status === 'fulfilled') setSessions(sessionsResult.value);
      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      setLoading(false);
    }

    loadData();
    return () => { cancelled = true; };
  }, [accessToken]);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    await deleteSession(id, accessToken);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const filtered = sessions
    .filter((s) => {
      if (search && !s.topic.toLowerCase().includes(search.toLowerCase())) return false;
      if (levelFilter === '1-2' && (s.hskLevel < 1 || s.hskLevel > 2)) return false;
      if (levelFilter === '3-4' && (s.hskLevel < 3 || s.hskLevel > 4)) return false;
      if (levelFilter === '5-6' && (s.hskLevel < 5 || s.hskLevel > 6)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortMode === 'accuracy') {
        const aAcc = a.insights?.accuracyScore ?? 0;
        const bAcc = b.insights?.accuracyScore ?? 0;
        return bAcc - aAcc;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <AppLayout
      title={
        <Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>
          Speaking Studio
        </Title>
      }
    >
      <Stack gap={rem(48)}>
        {/* Stats */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group gap="md">
              <Box p={rem(12)} bg="rgba(21, 66, 18, 0.05)" style={{ borderRadius: 12, color: 'var(--bb-primary)', display: 'flex' }}>
                <MicIcon size={24} />
              </Box>
              <Box>
                {loading ? (
                  <Skeleton h={rem(28)} w={rem(60)} mb={rem(4)} />
                ) : (
                  <Text fz={rem(24)} fw={800}>
                    {stats ? `${Math.round(stats.avgPronunciationScore)}%` : '—'}
                  </Text>
                )}
                <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase">Avg. Pronunciation</Text>
              </Box>
            </Group>
          </Card>

          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group gap="md">
              <Box p={rem(12)} bg="rgba(42, 81, 133, 0.05)" style={{ borderRadius: 12, color: '#2a5185', display: 'flex' }}>
                <IconClock size={24} />
              </Box>
              <Box>
                {loading ? (
                  <Skeleton h={rem(28)} w={rem(80)} mb={rem(4)} />
                ) : (
                  <Text fz={rem(24)} fw={800}>{stats?.activeSpeakingTime ?? '—'}</Text>
                )}
                <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase">Active Speaking Time</Text>
              </Box>
            </Group>
          </Card>

          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group gap="md">
              <Box p={rem(12)} bg="rgba(217, 72, 15, 0.05)" style={{ borderRadius: 12, color: '#d9480f', display: 'flex' }}>
                <IconHistory size={24} />
              </Box>
              <Box>
                {loading ? (
                  <Skeleton h={rem(28)} w={rem(40)} mb={rem(4)} />
                ) : (
                  <Text fz={rem(24)} fw={800}>{stats?.conversationsCompleted ?? sessions.filter(s => s.status === 'completed').length}</Text>
                )}
                <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase">Conversations Completed</Text>
              </Box>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Session archive */}
        <Stack gap={rem(32)}>
          <Group justify="space-between" align="center">
            <Stack gap={rem(4)}>
              <Title order={2} fz={rem(24)} fw={800}>The Recording Room</Title>
              <Text fz="sm" fw={600} c="var(--bb-outline)">Your personal archive of scholarly dialogues</Text>
            </Stack>
            <Button
              className="bb-btn-primary"
              radius={12}
              h={rem(54)}
              leftSection={<MicIcon size={20} />}
              onClick={openModal}
            >
              Start New Session
            </Button>
          </Group>

          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Stack gap={rem(24)}>
              <Group justify="space-between" wrap="wrap" gap={rem(12)}>
                <TextInput
                  placeholder="Filter sessions..."
                  leftSection={<IconSearch size={18} color="var(--bb-outline)" />}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  styles={{
                    input: {
                      width: rem(320),
                      height: rem(44),
                      borderRadius: rem(12),
                      backgroundColor: 'var(--bb-surface-container-low)',
                      border: 'none',
                    },
                  }}
                />
                <Group gap={rem(8)}>
                  {(['all', '1-2', '3-4', '5-6'] as const).map((range) => (
                    <Badge
                      key={range}
                      color={levelFilter === range ? 'green' : 'gray'}
                      variant={levelFilter === range ? 'filled' : 'light'}
                      radius="sm"
                      fw={800}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setLevelFilter(range)}
                    >
                      {range === 'all' ? 'ALL LEVELS' : `HSK ${range}`}
                    </Badge>
                  ))}
                  <Badge
                    color={sortMode === 'recent' ? 'blue' : 'gray'}
                    variant={sortMode === 'recent' ? 'filled' : 'light'}
                    radius="sm"
                    fw={800}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSortMode(sortMode === 'recent' ? 'accuracy' : 'recent')}
                  >
                    {sortMode === 'recent' ? 'MOST RECENT' : 'HIGHEST ACCURACY'}
                  </Badge>
                </Group>
              </Group>

              <ScrollArea>
                {loading ? (
                  <Stack gap={rem(12)}>
                    {[1, 2, 3].map((i) => <Skeleton key={i} h={rem(56)} radius={8} />)}
                  </Stack>
                ) : filtered.length === 0 ? (
                  <Stack align="center" py={rem(48)} gap={rem(12)}>
                    <MicIcon size={40} color="var(--bb-outline)" />
                    <Text fw={700} c="var(--bb-outline)">No sessions yet</Text>
                    <Text fz="sm" c="var(--bb-outline)">Start your first conversation with Master Ling</Text>
                  </Stack>
                ) : (
                  <Table
                    verticalSpacing="md"
                    styles={{
                      thead: { borderBottom: '1px solid var(--bb-surface-container)' },
                      th: { color: 'var(--bb-outline)', fontWeight: 800, fontSize: rem(11), textTransform: 'uppercase', letterSpacing: rem(1) },
                      tr: { transition: 'background-color 0.2s ease', cursor: 'pointer' },
                      td: { borderBottom: '1px solid var(--bb-surface-container)' },
                    }}
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Topic</Table.Th>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Accuracy</Table.Th>
                        <Table.Th>Duration</Table.Th>
                        <Table.Th>Level</Table.Th>
                        <Table.Th />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filtered.map((s) => {
                        const accuracy = s.insights?.accuracyScore;
                        const duration = s.insights?.duration ?? '—';
                        const date = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                        return (
                          <Table.Tr
                            key={s.id}
                            onClick={() => router.push(`/speaking/${s.id}`)}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Table.Td>
                              <Group gap="sm">
                                <Box p={rem(8)} bg="var(--bb-surface-container)" style={{ borderRadius: 8, color: 'var(--bb-primary)', display: 'flex' }}>
                                  <MicIcon size={16} />
                                </Box>
                                <Stack gap={0}>
                                  <Text fw={700} fz="sm">{s.topic}</Text>
                                  {s.status === 'active' && (
                                    <Badge color="green" variant="dot" size="xs" fw={700}>Live</Badge>
                                  )}
                                </Stack>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Text fz="xs" fw={700} c="var(--bb-outline)">{date}</Text>
                            </Table.Td>
                            <Table.Td>
                              {accuracy !== undefined ? (
                                <Group gap={rem(6)}>
                                  <Text fz="xs" fw={800} c="var(--bb-primary)">{accuracy}%</Text>
                                  <Progress value={accuracy} size="xs" w={rem(60)} color="var(--bb-primary)" radius="xl" />
                                </Group>
                              ) : (
                                <Text fz="xs" fw={700} c="var(--bb-outline)">—</Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Text fz="xs" fw={700} c="var(--bb-outline)">{duration}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={hskBadgeColor(s.hskLevel)} variant="light" fw={800} size="xs" radius="sm">
                                HSK {s.hskLevel}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Group gap={rem(4)}>
                                <Tooltip label="Delete">
                                  <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    size="sm"
                                    onClick={(e) => handleDelete(e, s.id)}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="View Session">
                                  <ActionIcon variant="subtle" color="gray">
                                    <IconChevronRight size={18} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                )}
              </ScrollArea>
            </Stack>
          </Card>
        </Stack>
      </Stack>

      <TopicSelectionModal
        isOpen={modalOpened}
        onClose={closeModal}
        onStart={() => {}}
      />
    </AppLayout>
  );
}
