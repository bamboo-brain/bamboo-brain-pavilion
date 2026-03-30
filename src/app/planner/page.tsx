'use client';

import { useState } from 'react';
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
  Tooltip,
  Paper,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  IconCalendar,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconClock,
  IconBook,
  IconTarget,
} from '@tabler/icons-react';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const CALENDAR_DAYS = [
  { day: 28, currentMonth: false, events: [] },
  { day: 29, currentMonth: false, events: [] },
  { day: 30, currentMonth: false, events: [] },
  { day: 31, currentMonth: false, events: [] },
  { day: 1, currentMonth: true, events: [{ type: 'study', title: 'HSK 4 Grammar' }] },
  { day: 2, currentMonth: true, events: [] },
  { day: 3, currentMonth: true, events: [{ type: 'speaking', title: 'Daily Dialogue' }] },
  { day: 4, currentMonth: true, events: [] },
  { day: 5, currentMonth: true, events: [] },
  { day: 6, currentMonth: true, events: [{ type: 'quiz', title: 'Weekly Review' }] },
  { day: 7, currentMonth: true, events: [] },
  { day: 8, currentMonth: true, events: [] },
  { day: 9, currentMonth: true, events: [] },
  { day: 10, currentMonth: true, events: [{ type: 'study', title: 'Business Chinese' }] },
  { day: 11, currentMonth: true, events: [] },
  { day: 12, currentMonth: true, events: [] },
  { day: 13, currentMonth: true, events: [] },
  { day: 14, currentMonth: true, events: [] },
  { day: 15, currentMonth: true, events: [] },
  { day: 16, currentMonth: true, events: [] },
  { day: 17, currentMonth: true, events: [] },
  { day: 18, currentMonth: true, events: [] },
  { day: 19, currentMonth: true, events: [] },
  { day: 20, currentMonth: true, events: [] },
  { day: 21, currentMonth: true, events: [] },
  { day: 22, currentMonth: true, events: [] },
  { day: 23, currentMonth: true, events: [] },
  { day: 24, currentMonth: true, events: [] },
  { day: 25, currentMonth: true, events: [] },
  { day: 26, currentMonth: true, events: [] },
  { day: 27, currentMonth: true, events: [] },
  { day: 28, currentMonth: true, events: [] },
  { day: 29, currentMonth: true, events: [] },
  { day: 30, currentMonth: true, events: [] },
  { day: 1, currentMonth: false, events: [] },
];

const GOALS = [
  { id: '1', title: 'Master 100 new HSK 4 characters', category: 'VOCABULARY', progress: 85, color: 'var(--bb-primary)' },
  { id: '2', title: 'Complete 2 hours of listening practice', category: 'LISTENING', progress: 45, color: '#2a5185' },
  { id: '3', title: 'Draft a sample business introduction', category: 'WRITING', progress: 10, color: '#d9480f' },
];

const UPCOMING_TASKS = [
  { time: '09:00 AM', title: 'Morning Calligraphy', desc: 'Focusing on radical ⺡ (water) variations.', icon: <IconBook size={18} /> },
  { time: '02:00 PM', title: 'Speaking Session', desc: 'Job Interview practice with AI tutor.', icon: <IconTarget size={18} /> },
  { time: '07:30 PM', title: 'Weekly Recap Quiz', desc: 'Review HSK 4 grammar points.', icon: <IconCheck size={18} /> },
];

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 1)); // Oct 2023

  return (
    <AppLayout
      title={
        <Group justify="space-between" align="center" style={{ width: '100%' }}>
          <Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>
            Study Planner
          </Title>
          <Button 
            className="bb-btn-primary" 
            leftSection={<IconPlus size={20} />} 
            radius={12} 
            h={rem(54)}
            px={rem(32)}
          >
            Create New Plan
          </Button>
        </Group>
      }
    >
      <SimpleGrid cols={{ base: 1, lg: 4 }} spacing={rem(40)}>
        {/* Main Content Area (Spans 3 columns) */}
        <Box style={{ gridColumn: 'span 3' }}>
          <Stack gap={rem(48)}>
            {/* Calendar View */}
            <Card radius={32} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
              <Stack gap={rem(32)}>
                <Group justify="space-between">
                  <Box>
                    <Title order={2} fz={rem(24)} fw={800}>October 2023</Title>
                    <Text fz="sm" fw={600} c="var(--bb-outline)">Your scholarly journey this month</Text>
                  </Box>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" size="lg" radius="md"><IconChevronLeft size={20} /></ActionIcon>
                    <Button variant="light" color="gray" radius="md" fw={800}>Today</Button>
                    <ActionIcon variant="subtle" size="lg" radius="md"><IconChevronRight size={20} /></ActionIcon>
                  </Group>
                </Group>

                <Box style={{ overflowX: 'auto' }}>
                  <SimpleGrid cols={7} spacing={rem(12)} verticalSpacing={rem(12)} style={{ minWidth: 700 }}>
                    {WEEKDAYS.map(day => (
                      <Text key={day} fz={rem(11)} fw={800} c="var(--bb-outline)" ta="center" lts={1}>
                        {day}
                      </Text>
                    ))}
                    {CALENDAR_DAYS.map((day, idx) => (
                      <Paper
                        key={idx}
                        radius={16}
                        p={rem(12)}
                        style={{
                          height: rem(120),
                          backgroundColor: day.currentMonth ? 'var(--bb-surface-container-low)' : 'transparent',
                          border: day.currentMonth ? '1px solid transparent' : '1px dashed var(--bb-surface-container)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = day.currentMonth ? 'var(--bb-surface-container-low)' : 'transparent')}
                      >
                        <Stack justify="space-between" h="100%" gap={0}>
                          <Text fz="sm" fw={800} c={day.currentMonth ? 'var(--bb-on-surface)' : 'var(--bb-outline)'}>
                            {day.day}
                          </Text>
                          <Stack gap={rem(4)}>
                            {day.events.map((event, eventIdx) => (
                              <Badge 
                                key={eventIdx} 
                                size="xs" 
                                radius="sm" 
                                variant="light"
                                color={event.type === 'study' ? 'green' : event.type === 'speaking' ? 'blue' : 'orange'}
                                fw={800}
                                fullWidth
                                tt="none"
                              >
                                {event.title}
                              </Badge>
                            ))}
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </SimpleGrid>
                </Box>
              </Stack>
            </Card>

            {/* Weekly Goals Section */}
            <Stack gap={rem(32)}>
              <Title order={2} fz={rem(24)} fw={800}>Weekly Scholarly Goals</Title>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                {GOALS.map(goal => (
                  <Card key={goal.id} radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
                    <Stack gap={rem(24)}>
                      <Badge variant="light" color="gray" radius="sm" fw={800} size="xs">{goal.category}</Badge>
                      <Title order={3} fz={rem(18)} fw={800} lh={1.4}>{goal.title}</Title>
                      <Stack gap={rem(8)}>
                        <Group justify="space-between">
                          <Text fz="xs" fw={700}>Progress</Text>
                          <Text fz="xs" fw={800} c="var(--bb-primary)">{goal.progress}%</Text>
                        </Group>
                        <Box h={rem(8)} bg="var(--bb-surface-container)" style={{ borderRadius: 10, overflow: 'hidden' }}>
                          <Box 
                            h="100%" 
                            w={`${goal.progress}%`} 
                            style={{ 
                              backgroundColor: goal.color, 
                              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                              backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
                            }} 
                          />
                        </Box>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </Stack>
          </Stack>
        </Box>

        {/* Sidebar Section (1 column) */}
        <Stack gap={rem(40)}>
          {/* Upcoming Card */}
          <Card radius={32} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Title order={3} fz={rem(18)} fw={800} mb={rem(24)}>The Scholar's Path</Title>
            <Stack gap={rem(32)}>
              {UPCOMING_TASKS.map((task, idx) => (
                <Group key={idx} wrap="nowrap" align="flex-start" gap="md">
                  <Box p={rem(10)} bg="var(--bb-surface-container-low)" style={{ borderRadius: 12, color: 'var(--bb-primary)' }}>
                    {task.icon}
                  </Box>
                  <Box>
                    <Text fz="xs" fw={800} c="var(--bb-primary)" mb={rem(4)}>{task.time}</Text>
                    <Text fz="sm" fw={700} mb={rem(2)}>{task.title}</Text>
                    <Text fz={rem(12)} fw={600} c="var(--bb-outline)" lh={1.4}>{task.desc}</Text>
                  </Box>
                </Group>
              ))}
            </Stack>
            <Button fullWidth mt={rem(40)} radius={12} variant="light" color="gray" h={rem(48)} fw={800}>
              View Agenda
            </Button>
          </Card>

          {/* Quick Stats Sidebar */}
          <Card radius={32} p={rem(32)} style={{ backgroundColor: 'var(--bb-primary)', color: 'white' }}>
            <Stack gap={rem(24)}>
              <Box>
                <Title order={4} fz={rem(16)} fw={800} mb={rem(8)}>HSK 4 Mastery</Title>
                <Text fz="xs" fw={500} style={{ opacity: 0.8 }}>You've mastered 42 new characters this week. Keep up the calligraphy practice!</Text>
              </Box>
              <Group gap="lg">
                <Stack gap={rem(4)}>
                  <Text fz={rem(24)} fw={800}>1,284</Text>
                  <Text fz={rem(10)} fw={700} style={{ opacity: 0.7 }} tt="uppercase">Chars</Text>
                </Stack>
                <Stack gap={rem(4)}>
                  <Text fz={rem(24)} fw={800}>92%</Text>
                  <Text fz={rem(10)} fw={700} style={{ opacity: 0.7 }} tt="uppercase">Acc.</Text>
                </Stack>
              </Group>
            </Stack>
          </Card>

          {/* Productivity Tip */}
          <Card radius={32} p={rem(32)} style={{ backgroundColor: 'rgba(217, 72, 15, 0.05)', border: '1px solid rgba(217, 72, 15, 0.1)' }}>
            <Group gap="sm" mb={rem(16)}>
              <IconClock size={20} color="#d9480f" />
              <Text fz="xs" fw={800} c="#d9480f" tt="uppercase">Productivity Tip</Text>
            </Group>
            <Text fz="sm" fw={700} lh={1.6}>
              "The best time to plant a tree was 20 years ago. The second best time is now." 
              <br /><br />
              Schedule your most complex Hanzi reviews during your peak focus hours.
            </Text>
          </Card>
        </Stack>
      </SimpleGrid>
    </AppLayout>
  );
}
