'use client';

import { useState } from 'react';
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
  ActionIcon,
  Table,
  ScrollArea,
  TextInput,
  Tooltip,
  Progress,
  Pagination,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  IconHistory,
  IconClock,
  IconChevronRight,
  IconSearch,
} from '@tabler/icons-react';
import {
  MicIcon
} from '@/components/icons'

const SESSIONS = [
  { id: '1', topic: 'Job Interview in Shanghai', date: 'Oct 28, 2023', accuracy: '94%', duration: '12:40', level: 'HSK 5' },
  { id: '2', topic: 'Ordering Coffee in Beijing', date: 'Oct 26, 2023', accuracy: '88%', duration: '08:15', level: 'HSK 3' },
  { id: '3', topic: 'Discussing Contemporary Art', date: 'Oct 24, 2023', accuracy: '91%', duration: '22:30', level: 'HSK 6' },
  { id: '4', topic: 'Daily Life Dialogue', date: 'Oct 22, 2023', accuracy: '96%', duration: '05:50', level: 'HSK 2' },
];

export default function SpeakingStudioPage() {
  const router = useRouter();
  const [activePage, setPage] = useState(1);

  return (
    <AppLayout title={<Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>Speaking Studio</Title>}>
      <Stack gap={rem(48)}>
        {/* Quick Stats Header */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group gap="md">
              <Box p={rem(12)} bg="rgba(21, 66, 18, 0.05)" style={{ borderRadius: 12, color: 'var(--bb-primary)', display: 'flex' }}>
                <MicIcon size={24} />
              </Box>
              <Box>
                <Text fz={rem(24)} fw={800}>92%</Text>
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
                <Text fz={rem(24)} fw={800}>12h 45m</Text>
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
                <Text fz={rem(24)} fw={800}>24</Text>
                <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase">Conversations Completed</Text>
              </Box>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Studio Archive Container */}
        <Stack gap={rem(32)}>
          <Group justify="space-between" align="center">
            <Stack gap={rem(4)}>
              <Title order={2} fz={rem(24)} fw={800}>The Recording Room</Title>
              <Text fz="sm" fw={600} c="var(--bb-outline)">Your personal archive of scholarly dialogues</Text>
            </Stack>
            <Button className="bb-btn-primary" radius={12} h={rem(54)} leftSection={<MicIcon size={20} />}>
              Start New Session
            </Button>
          </Group>

          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Stack gap={rem(24)}>
              <Group justify="space-between">
                <TextInput
                  placeholder="Filter sessions..."
                  leftSection={<IconSearch size={18} color="var(--bb-outline)" />}
                  styles={{
                    input: {
                      width: rem(340),
                      height: rem(44),
                      borderRadius: rem(12),
                      backgroundColor: 'var(--bb-surface-container-low)',
                      border: 'none',
                    }
                  }}
                />
                <Group gap={rem(12)}>
                  <Badge color="gray" variant="light" radius="sm">ALL LEVELS</Badge>
                  <Badge color="gray" variant="light" radius="sm">MOST RECENT</Badge>
                </Group>
              </Group>

              <ScrollArea>
                <Table verticalSpacing="md" styles={{
                  thead: { borderBottom: '1px solid var(--bb-surface-container)' },
                  th: { color: 'var(--bb-outline)', fontWeight: 800, fontSize: rem(11), textTransform: 'uppercase', letterSpacing: rem(1) },
                  tr: { transition: 'background-color 0.2s ease', cursor: 'pointer' },
                  td: { borderBottom: '1px solid var(--bb-surface-container)' }
                }}>
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
                    {SESSIONS.map((session) => (
                      <Table.Tr key={session.id} onClick={() => router.push(`/speaking/${session.id}`)} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <Table.Td>
                          <Group gap="sm">
                            <Box p={rem(8)} bg="var(--bb-surface-container)" style={{ borderRadius: 8, color: 'var(--bb-primary)', display: 'flex' }}>
                              <MicIcon size={16} />
                            </Box>
                            <Text fw={700} fz="sm">{session.topic}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td><Text fz="xs" fw={700} c="var(--bb-outline)">{session.date}</Text></Table.Td>
                        <Table.Td>
                          <Group gap={rem(6)}>
                            <Text fz="xs" fw={800} c="var(--bb-primary)">{session.accuracy}</Text>
                            <Progress value={parseInt(session.accuracy)} size="xs" w={rem(60)} color="var(--bb-primary)" radius="xl" />
                          </Group>
                        </Table.Td>
                        <Table.Td><Text fz="xs" fw={700} c="var(--bb-outline)">{session.duration}</Text></Table.Td>
                        <Table.Td><Badge color="blue" variant="light" fw={800} size="xs" radius="sm">{session.level}</Badge></Table.Td>
                        <Table.Td>
                          <Tooltip label="View Details">
                            <ActionIcon variant="subtle" color="gray"><IconChevronRight size={18} /></ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              <Stack gap={rem(16)} align="center" mt={rem(16)}>
                <Pagination
                  value={activePage}
                  onChange={setPage}
                  total={6}
                  radius="md"
                  color="var(--bb-primary)"
                />
                <Text fz="xs" fw={700} c="var(--bb-outline)">
                  Showing {(activePage - 1) * 4 + 1} to {Math.min(activePage * 4, 24)} of 24 scholarly dialogues
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </AppLayout>
  );
}
