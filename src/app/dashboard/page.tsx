'use client';

import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  Title,
  Text,
  Stack,
  Group,
  Card,
  Progress,
  Button,
  Box,
  SimpleGrid,
  UnstyledButton,
  Badge,
  rem,
} from '@mantine/core';
import { AddTaskModal } from '@/components/dashboard/AddTaskModal';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  FileTextIcon,
  TreeIcon,
  FireIcon,
} from '@/components/icons';
import {
  IconPlus,
  IconUpload,
  IconChartLine,
  IconClock,
  IconChevronRight,
} from '@tabler/icons-react';

// Recent uploads data
const RECENT_UPLOADS = [
  {
    id: 1,
    name: 'Beijing_Travel_Guide_V2.pdf',
    added: '2h ago',
    meta: '142 New Vocab Words',
    status: 'READY TO STUDY',
    icon: <FileTextIcon size={20} />,
  },
  {
    id: 2,
    name: 'Daily_Life_Dialogue.mp4',
    added: 'Yesterday',
    meta: 'AI Transcription Active',
    status: 'EXTRACTING...',
    icon: <IconUpload size={20} />,
  },
];

// Today's tasks data
const TODAY_TASKS = [
  {
    id: 1,
    title: 'Morning Calligraphy',
    time: '08:00 AM - 09:30 AM',
    icon: '✍️',
    active: true,
  },
  {
    id: 2,
    title: 'Reading Practice',
    time: '1:00 PM - 02:45 PM',
    icon: '📖',
    active: false,
  },
  {
    id: 3,
    title: 'HSK 4 Prep Session',
    time: '02:00 PM - 03:00 PM',
    icon: '📝',
    active: false,
  },
];

export default function DashboardPage() {
  const [streakDays] = useState([true, true, true, true, false, false, false]);
  const [taskModalOpened, { open: openTaskModal, close: closeTaskModal }] = useDisclosure(false);

  return (
    <AppLayout
      title={
        <Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>
          Welcome back, Alex.
        </Title>
      }
    >
      {/* ── Dashboard Content ────────────────────────────────── */}
      <Stack gap={rem(64)}>

        {/* Feature Grid: Status & Streak */}
        <SimpleGrid cols={{ base: 1, lg: 5 }} spacing={rem(32)}>
          {/* Current Stage Card */}
          <Box style={{ gridColumn: 'span 3' }}>
            <Card
              radius={24}
              p={rem(48)}
              h="100%"
              style={{
                backgroundColor: 'var(--bb-surface-container-lowest)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  right: rem(-60),
                  bottom: rem(-60),
                  opacity: 0.04,
                  color: 'var(--bb-primary)',
                  pointerEvents: 'none',
                }}
              >
                <TreeIcon size={rem(340)} />
              </Box>
              <Stack gap={rem(40)} style={{ position: 'relative', zIndex: 1 }}>
                <Badge
                  variant="light"
                  color="cyan"
                  radius="sm"
                  px={rem(14)}
                  py={rem(10)}
                  fw={800}
                  fz={rem(11)}
                  style={{ width: 'fit-content', backgroundColor: '#e0f2ff', color: '#004a77' }}
                >
                  CURRENT STAGE
                </Badge>

                <Stack gap={rem(12)}>
                  <Title order={2} fz={rem(36)} fw={800} c="var(--bb-on-surface)">
                    HSK Level 4 <span className="hanzi" style={{ fontSize: rem(32), marginLeft: rem(8) }}>四级</span>
                  </Title>
                  <Text fz={rem(18)} c="var(--bb-on-surface-variant)" lh={1.6} maw={600} fw={500}>
                    You're 65% through the "Intermediate Narrative" module. Keep pushing to reach Level 5 proficiency.
                  </Text>
                </Stack>

                <Stack gap={rem(12)}>
                  <Group justify="space-between">
                    <Text fz={rem(12)} fw={700} c="var(--bb-outline)" tt="uppercase" lts={rem(1.2)}>
                      Level 4 Start
                    </Text>
                    <Text fz={rem(12)} fw={700} c="var(--bb-outline)" tt="uppercase" lts={rem(1.2)}>
                      Level 5 Bridge
                    </Text>
                  </Group>
                  <Progress
                    value={65}
                    size="lg"
                    radius="xl"
                    color="var(--bb-primary)"
                    bg="var(--bb-surface-container)"
                    style={{ height: rem(10) }}
                  />
                </Stack>
              </Stack>
            </Card>
          </Box>

          {/* Weekly Streak Card */}
          <Box style={{ gridColumn: 'span 2' }}>
            <Card
              radius={24}
              p={rem(48)}
              style={{
                background: 'linear-gradient(135deg, #0a220a 0%, #154212 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(21, 66, 18, 0.2)',
              }}
            >
              <Stack gap={rem(40)} align="center" justify="center" h="100%">
                <Text fz={rem(13)} fw={700} tt="uppercase" lts={rem(2.5)} style={{ opacity: 0.8 }}>
                  Weekly Streak
                </Text>
                <Group gap="md" align="center">
                  <FireIcon size={rem(48)} style={{ color: '#bcf0ae' }} />
                  <Title fz={rem(56)} fw={800} style={{ letterSpacing: rem(-1) }}>
                    12 Days
                  </Title>
                </Group>
                <Group gap={rem(10)} justify="center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <Box
                      key={idx}
                      style={{
                        width: rem(38),
                        height: rem(38),
                        borderRadius: rem(10),
                        backgroundColor: streakDays[idx] ? '#bcf0ae' : 'rgba(255, 255, 255, 0.12)',
                        color: streakDays[idx] ? '#154212' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: rem(14),
                      }}
                    >
                      {day}
                    </Box>
                  ))}
                </Group>
                <Button
                  fullWidth
                  radius={12}
                  style={{
                    backgroundColor: 'white',
                    color: 'var(--bb-primary)',
                    fontWeight: 800,
                    height: rem(54),
                    fontSize: rem(16),
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  Extend Streak
                </Button>
              </Stack>
            </Card>
          </Box>
        </SimpleGrid>

        {/* Quick Actions & Recent Uploads */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={rem(32)}>
          {/* Quick Actions Panel */}
          <Box>
            <Text fz={rem(13)} fw={800} c="var(--bb-on-surface-variant)" tt="uppercase" lts={rem(2)} mb={rem(24)}>
              Quick Actions
            </Text>
            <UnstyledButton
              style={{
                height: rem(260),
                width: '100%',
                background: 'linear-gradient(135deg, #154212 0%, #2d5a27 100%)',
                borderRadius: rem(24),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(21, 66, 18, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(21, 66, 18, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(21, 66, 18, 0.15)';
              }}
            >
              <IconUpload size={rem(56)} style={{ marginBottom: rem(20), opacity: 0.95 }} />
              <Title order={4} fz={rem(20)} fw={800}>
                Upload New File
              </Title>
              <Text fz={rem(14)} style={{ opacity: 0.85 }} mt={rem(6)} fw={500}>
                PDF, MP4, or Audio
              </Text>
            </UnstyledButton>
          </Box>

          {/* Recent Uploads Panel */}
          <Box>
            <Group justify="space-between" mb={rem(24)}>
              <Text fz={rem(13)} fw={800} c="var(--bb-on-surface-variant)" tt="uppercase" lts={rem(2)}>
                Recent Uploads
              </Text>
              <UnstyledButton>
                <Group gap={rem(4)}>
                  <Text fz="xs" fw={800} c="var(--bb-primary)">
                    View All Library
                  </Text>
                  <IconChevronRight size={14} color="var(--bb-primary)" />
                </Group>
              </UnstyledButton>
            </Group>

            <Card radius={24} p={rem(16)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
              <Stack gap={rem(4)}>
                {RECENT_UPLOADS.map((upload) => (
                  <Group
                    key={upload.id}
                    wrap="nowrap"
                    align="center"
                    p={rem(16)}
                    style={{
                      borderRadius: 16,
                      transition: 'background-color 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Box
                      p={rem(10)}
                      style={{
                        backgroundColor: 'var(--bb-surface-container)',
                        borderRadius: 12,
                        color: 'var(--bb-on-surface-variant)',
                        display: 'flex'
                      }}
                    >
                      {upload.icon}
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fz={rem(14)} fw={700} c="var(--bb-on-surface)" truncate>
                        {upload.name}
                      </Text>
                      <Text fz={rem(12)} c="var(--bb-outline)" fw={600} mt={rem(2)}>
                        Added {upload.added} • {upload.meta}
                      </Text>
                    </Box>
                    <Badge
                      size="xs"
                      variant="light"
                      color={upload.status === 'READY TO STUDY' ? 'green' : 'blue'}
                      radius="sm"
                      px={rem(8)}
                      fw={800}
                      fz={rem(9)}
                    >
                      {upload.status}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Box>
        </SimpleGrid>

        {/* Bottom Grid: Mastery & Tasks */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={rem(32)}>
          {/* Mastery Progress Card */}
          <Card radius={24} p={rem(40)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group justify="space-between" align="center" mb={rem(32)}>
              <Title order={3} fz={rem(18)} fw={800} c="var(--bb-on-surface)">
                Mastery Progress
              </Title>
              <Box p={rem(8)} style={{ borderRadius: 8, backgroundColor: 'var(--bb-surface-container-low)', color: 'var(--bb-primary)', display: 'flex' }}>
                <IconChartLine size={20} />
              </Box>
            </Group>

            <Group p={rem(24)} bg="var(--bb-surface-container-low)" style={{ borderRadius: 20 }} mb={rem(32)}>
              <Text fz={rem(40)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-1) }}>
                1,240
              </Text>
              <Box>
                <Text fz={rem(16)} fw={800} c="var(--bb-on-surface)" lh={1.2}>
                  Characters Learned
                </Text>
                <Text fz={rem(12)} fw={600} c="var(--bb-outline)" mt={rem(4)}>
                  Target: 2,500 for Level 5
                </Text>
              </Box>
            </Group>

            <Stack gap={rem(6)} mb={rem(32)}>
              <Text fz={rem(11)} fw={800} c="var(--bb-on-surface-variant)" tt="uppercase" lts={rem(2)}>
                Upcoming Reviews
              </Text>
              <Text fz={rem(24)} fw={800} c="var(--bb-on-surface)">
                42 Words
              </Text>
            </Stack>

            <Button
              variant="filled"
              className="bb-btn-primary"
              fullWidth
              radius={12}
              h={rem(54)}
              fw={800}
              fz={rem(15)}
            >
              Start Review Session
            </Button>
          </Card>

          {/* Today's Tasks Card */}
          <Card radius={24} p={rem(40)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group justify="space-between" align="flex-start" mb={rem(32)}>
              <Stack gap={rem(4)}>
                <Title order={3} fz={rem(18)} fw={800} c="var(--bb-on-surface)">
                  Instructional Planner
                </Title>
                <Text fz={rem(12)} fw={700} c="var(--bb-outline)" tt="uppercase" lts={rem(1)}>
                  March 24, 2024
                </Text>
              </Stack>
              <Badge variant="light" color="gray" radius="xl" py={rem(10)} px={rem(14)} fw={700}>
                G-SYNC ACTIVE
              </Badge>
            </Group>

            <Stack gap={rem(16)}>
              {TODAY_TASKS.map((task) => (
                <Group
                  key={task.id}
                  p={rem(16)}
                  wrap="nowrap"
                  align="center"
                  style={{
                    borderRadius: 16,
                    backgroundColor: task.active ? '#f0f7ff' : 'var(--bb-surface-container-low)',
                    borderRight: task.active ? `${rem(4)} solid #2a5185` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Text fz={rem(22)}>{task.icon}</Text>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fz={rem(15)} fw={700} c="var(--bb-on-surface)">
                      {task.title}
                    </Text>
                    <Group gap={rem(6)} mt={rem(2)}>
                      <IconClock size={14} color="var(--bb-outline)" />
                      <Text fz={rem(12)} c="var(--bb-outline)" fw={700}>
                        {task.time}
                      </Text>
                    </Group>
                  </Box>
                </Group>
              ))}
            </Stack>

            <Button
              variant="subtle"
              fullWidth
              mt={rem(24)}
              h={rem(54)}
              radius={16}
              style={{
                border: `${rem(2)} dashed var(--bb-outline-variant)`,
                color: 'var(--bb-primary)',
                fontWeight: 800,
                fontSize: rem(15),
              }}
              onClick={openTaskModal}
            >
              Add Pavilion Task
            </Button>
          </Card>
        </SimpleGrid>
      </Stack>

      {/* Modals */}
      <AddTaskModal opened={taskModalOpened} onClose={closeTaskModal} />
    </AppLayout>
  );
}
