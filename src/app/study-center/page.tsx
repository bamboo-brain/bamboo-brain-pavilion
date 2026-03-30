'use client';

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
  Progress,
  ActionIcon,
  Avatar,
  RingProgress,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  IconBrain,
  IconChartBar,
  IconFlame,
  IconPlus,
  IconBolt,
  IconChevronRight,
  IconBook,
  IconMessageCircle,
} from '@tabler/icons-react';

const PERFORMANCE_STATS = [
  { label: 'Words Mastered', value: '1,284', sub: 'Hanzi & Vocabulary', icon: <IconBrain size={24} />, color: 'var(--bb-primary)' },
  { label: 'Avg. Accuracy', value: '92%', sub: 'Expert Level Proficiency', icon: <IconChartBar size={24} />, color: '#2a5185' },
  { label: 'Review Streak', value: '48 Days', sub: 'Scholar Milestone', icon: <IconFlame size={24} />, color: '#d9480f' },
];

const DECKS = [
  {
    title: 'HSK 4 Finance',
    desc: 'Business & economic terminology for the HSK 4 level.',
    due: 12,
    total: 156,
    tags: ['BUSINESS', 'HSK 4'],
    color: 'green',
  },
  {
    title: 'Essential Culture',
    desc: 'Traditional idioms and historical references.',
    due: 8,
    total: 84,
    tags: ['CULTURE', 'IDIOMS'],
    color: 'blue',
  },
  {
    title: 'Manuscript Vocabulary',
    desc: 'Extracted from your recent "Beijing Guide" upload.',
    due: 5,
    total: 42,
    tags: ['CUSTOM', 'FROM FILE'],
    color: 'orange',
  },
];

const QUIZZES = [
  { title: 'Beijing Travel Guide Quiz', meta: '15 Questions • Oct 24', level: 'HSK 4', status: 'READY' },
  { title: 'Business Ethics Discussion', meta: '10 Questions • Oct 23', level: 'HSK 3', status: 'COMPLETED' },
];

export default function StudyCenterPage() {
  return (
    <AppLayout
      title={
        <Group gap="sm">
          <Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>
            Study Center
          </Title>
        </Group>
      }
    >
      <SimpleGrid cols={{ base: 1, lg: 4 }} spacing={rem(40)}>
        {/* Main Section (Spans 3 columns) */}
        <Box style={{ gridColumn: 'span 3' }}>
          <Stack gap={rem(48)}>
            {/* Performance Stats */}
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
              {PERFORMANCE_STATS.map((stat, idx) => (
                <Card key={idx} radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
                  <Group justify="space-between" mb={rem(20)}>
                    <Box p={rem(12)} style={{ borderRadius: 12, backgroundColor: 'var(--bb-surface-container-low)', color: stat.color, display: 'flex' }}>
                      {stat.icon}
                    </Box>
                  </Group>
                  <Stack gap={rem(4)}>
                    <Text fz={rem(32)} fw={800} c="var(--bb-on-surface)">{stat.value}</Text>
                    <Text fz={rem(14)} fw={700} c="var(--bb-on-surface-variant)">{stat.label}</Text>
                    <Text fz={rem(12)} fw={600} c="var(--bb-outline)">{stat.sub}</Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>

            {/* Flashcard Decks */}
            <Stack gap={rem(32)}>
              <Group justify="space-between" align="flex-end">
                <Stack gap={rem(4)}>
                  <Title order={2} fz={rem(24)} fw={800}>Flashcard Decks</Title>
                  <Text fz="sm" fw={600} c="var(--bb-outline)">Spaced Repetition System (SRS) Active</Text>
                </Stack>
                <Group gap="md">
                  <Button variant="subtle" color="gray" leftSection={<IconPlus size={18} />} fw={800} radius={10}>
                    Create New Deck
                  </Button>
                  <Button className="bb-btn-primary" leftSection={<IconBolt size={18} />} radius={10} fw={800}>
                    Start Random Blitz
                  </Button>
                </Group>
              </Group>

              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                {DECKS.map((deck, idx) => (
                  <Card key={idx} radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
                    <Stack gap={rem(24)}>
                      <Group gap={rem(8)}>
                        {deck.tags.map((tag) => (
                          <Badge key={tag} variant="light" color="gray" size="xs" radius="sm" fw={800}>{tag}</Badge>
                        ))}
                      </Group>

                      <Box>
                        <Title order={3} fz={rem(18)} fw={800} mb={rem(8)}>{deck.title}</Title>
                        <Text fz="xs" c="var(--bb-on-surface-variant)" lh={1.5} fw={600} h={40} style={{ overflow: 'hidden' }}>
                          {deck.desc}
                        </Text>
                      </Box>

                      <Group justify="space-between" align="center">
                        <Stack gap={rem(2)}>
                          <Text fz={rem(24)} fw={800} c={deck.due > 0 ? '#d9480f' : 'var(--bb-on-surface)'}>
                            {deck.due}
                          </Text>
                          <Text fz={rem(11)} fw={700} c="var(--bb-outline)" tt="uppercase" lts={1}>Due Today</Text>
                        </Stack>
                        <RingProgress
                          size={60}
                          thickness={6}
                          roundCaps
                          sections={[{ value: ((deck.total - deck.due) / deck.total) * 100, color: 'var(--bb-primary)' }]}
                          label={
                            <Text fz={rem(10)} fw={800} ta="center">{(((deck.total - deck.due) / deck.total) * 100).toFixed(0)}%</Text>
                          }
                        />
                      </Group>

                      <Button
                        fullWidth
                        radius={12}
                        color={deck.due > 0 ? 'var(--bb-primary)' : 'gray'}
                        variant={deck.due > 0 ? 'filled' : 'light'}
                        fw={800}
                        h={rem(48)}
                      >
                        {deck.due > 0 ? 'Study Now' : 'Reviewed'}
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </Stack>

            {/* AI-Generated Quizzes */}
            <Stack gap={rem(24)}>
              <Title order={2} fz={rem(24)} fw={800}>AI-Generated Quizzes</Title>
              <Card radius={24} p={rem(16)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
                <Stack gap={rem(4)}>
                  {QUIZZES.map((quiz, idx) => (
                    <Group
                      key={idx}
                      p={rem(16)}
                      justify="space-between"
                      style={{
                        borderRadius: 16,
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Group gap="md">
                        <Box p={rem(10)} bg="var(--bb-surface-container)" style={{ borderRadius: 12, display: 'flex' }}>
                          <IconMessageCircle size={20} color="var(--bb-primary)" />
                        </Box>
                        <Stack gap={rem(2)}>
                          <Text fz="sm" fw={700}>{quiz.title}</Text>
                          <Text fz="xs" c="var(--bb-outline)" fw={600}>{quiz.meta}</Text>
                        </Stack>
                      </Group>
                      <Group gap="xl">
                        <Badge variant="light" color="blue" radius="sm" fw={800}>{quiz.level}</Badge>
                        <Button variant="subtle" color={quiz.status === 'READY' ? 'green' : 'gray'} fw={800} size="xs" rightSection={<IconChevronRight size={14} />}>
                          {quiz.status === 'READY' ? 'Take Quiz' : 'Review Results'}
                        </Button>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Stack>
        </Box>

        {/* Sidebar Section (1 column) */}
        <Stack gap={rem(40)}>
          {/* Today's Path */}
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Title order={3} fz={rem(18)} fw={800} mb={rem(24)}>Today's Path</Title>
            <Stack gap={rem(24)}>
              <Stack gap={rem(8)}>
                <Group justify="space-between">
                  <Text fz="xs" fw={700}>Review 50 new Hanzi</Text>
                  <Text fz="xs" fw={800} c="var(--bb-primary)">32/50</Text>
                </Group>
                <Progress value={64} size="sm" radius="xl" color="var(--bb-primary)" bg="var(--bb-surface-container)" />
              </Stack>
              <Stack gap={rem(8)}>
                <Group justify="space-between">
                  <Text fz="xs" fw={700}>Complete 2 Quizzes</Text>
                  <Text fz="xs" fw={800} c="var(--bb-primary)">1/2</Text>
                </Group>
                <Progress value={50} size="sm" radius="xl" color="var(--bb-primary)" bg="var(--bb-surface-container)" />
              </Stack>
              <Stack gap={rem(8)}>
                <Group justify="space-between">
                  <Text fz="xs" fw={700}>45m Active Study</Text>
                  <Text fz="xs" fw={800} c="var(--bb-primary)">28m</Text>
                </Group>
                <Progress value={62} size="sm" radius="xl" color="var(--bb-primary)" bg="var(--bb-surface-container)" />
              </Stack>
            </Stack>
          </Card>

          {/* Retention Curve */}
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Title order={3} fz={rem(18)} fw={800} mb={rem(8)}>Retention Curve</Title>
            <Text fz="xs" fw={600} c="var(--bb-outline)" mb={rem(24)}>Memory decay visualization</Text>

            <Group align="flex-end" justify="space-between" h={120} px={rem(4)}>
              {[0.9, 0.85, 0.7, 0.65, 0.8, 0.95, 0.9].map((val, idx) => (
                <Box
                  key={idx}
                  style={{
                    width: rem(12),
                    height: `${val * 100}%`,
                    backgroundColor: idx === 5 ? 'var(--bb-primary)' : 'var(--bb-surface-container)',
                    borderRadius: 4,
                  }}
                />
              ))}
            </Group>
            <Group justify="space-between" mt={rem(12)} px={rem(4)}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <Text key={idx} fz={rem(10)} fw={700} c="var(--bb-outline)">{day}</Text>
              ))}
            </Group>
          </Card>

          {/* Scholarly Picks */}
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Title order={3} fz={rem(18)} fw={800} mb={rem(24)}>Scholarly Picks</Title>
            <Stack gap={rem(16)}>
              <Group wrap="nowrap" align="center">
                <Avatar radius="md" size="lg" bg="var(--bb-surface-container-low)">
                  <IconBook size={24} color="var(--bb-primary)" />
                </Avatar>
                <Box>
                  <Text fz="xs" fw={800} truncate>Advanced Hanzi History</Text>
                  <Badge size="xs" color="orange" variant="light" mt={rem(4)}>HSK 5+</Badge>
                </Box>
              </Group>
              <Group wrap="nowrap" align="center">
                <Avatar radius="md" size="lg" bg="var(--bb-surface-container-low)">
                  <IconBolt size={24} color="#d9480f" />
                </Avatar>
                <Box>
                  <Text fz="xs" fw={800} truncate>Speed Review: Level 4</Text>
                  <Badge size="xs" color="green" variant="light" mt={rem(4)}>DAILY BLITZ</Badge>
                </Box>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </SimpleGrid>
    </AppLayout>
  );
}
