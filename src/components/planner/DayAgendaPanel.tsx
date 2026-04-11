'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card, Stack, Title, Text, Group, Box, Button, Badge, rem, Loader,
} from '@mantine/core';
import { IconCheck, IconArrowRight } from '@tabler/icons-react';
import { updateEvent, recordActivity } from '@/lib/api/planner';
import type { StudyEvent } from '@/types/planner';

interface DayAgendaPanelProps {
  selectedDate: string;
  events: StudyEvent[];
  planId: string;
  onEventUpdate: (eventId: string, status: string) => void;
}

const EVENT_ICONS: Record<string, string> = {
  flashcards: '📚',
  speaking: '🎤',
  quiz: '📝',
  reading: '📖',
  review: '🔄',
  milestone: '🏆',
};

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function getActivityType(eventType: StudyEvent['type']): 'flashcard_review' | 'quiz' | 'speaking' | 'document_upload' {
  if (eventType === 'flashcards' || eventType === 'review') return 'flashcard_review';
  if (eventType === 'quiz') return 'quiz';
  if (eventType === 'speaking') return 'speaking';
  return 'flashcard_review';
}

export function DayAgendaPanel({ selectedDate, events, planId, onEventUpdate }: DayAgendaPanelProps) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? '';
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleComplete(event: StudyEvent) {
    if (!planId) return;
    setLoadingId(event.id);
    try {
      await updateEvent(planId, event.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      }, accessToken);
      onEventUpdate(event.id, 'completed');
      recordActivity({
        activityType: getActivityType(event.type),
        minutesSpent: event.durationMinutes,
        itemsCompleted: 1,
        resourceId: event.linkedResourceId,
      }, accessToken).catch(() => {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSkip(event: StudyEvent) {
    if (!planId) return;
    setLoadingId(`skip-${event.id}`);
    try {
      await updateEvent(planId, event.id, { status: 'skipped' }, accessToken);
      onEventUpdate(event.id, 'skipped');
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Stack gap={rem(24)}>
      <Card radius={24} p={rem(28)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
        <Title order={3} fz={rem(18)} fw={800} mb={rem(4)}>The Scholar's Path</Title>
        <Text fz="sm" fw={600} c="var(--bb-outline)" mb={rem(24)}>{formatDate(selectedDate)}</Text>

        {events.length === 0 ? (
          <Stack align="center" py={rem(32)} gap={rem(8)}>
            <Text fz={rem(32)}>📅</Text>
            <Text fz="sm" fw={700} c="var(--bb-outline)">No events scheduled</Text>
            <Text fz="xs" fw={500} c="var(--bb-outline)" ta="center">
              Select a date with events or create a new study plan.
            </Text>
          </Stack>
        ) : (
          <Stack gap={rem(16)}>
            {events.map((event) => {
              const isCompleted = event.status === 'completed';
              const isSkipped = event.status === 'skipped';

              return (
                <Box
                  key={event.id}
                  p={rem(16)}
                  style={{
                    borderRadius: rem(14),
                    backgroundColor: isCompleted
                      ? 'rgba(21,66,18,0.04)'
                      : isSkipped
                      ? 'var(--bb-surface-container-low)'
                      : 'var(--bb-surface-container-lowest)',
                    border: isCompleted
                      ? '1px solid rgba(21,66,18,0.15)'
                      : isSkipped
                      ? '1px solid var(--bb-surface-container)'
                      : '1px solid var(--bb-surface-container)',
                    opacity: isSkipped ? 0.6 : 1,
                  }}
                >
                  <Group justify="space-between" align="flex-start" mb={rem(8)}>
                    <Group gap={rem(8)}>
                      <Text fz={rem(20)}>{EVENT_ICONS[event.type] ?? '📌'}</Text>
                      <Box>
                        <Text fz="xs" fw={800} c="var(--bb-primary)" tt="uppercase" style={{ letterSpacing: rem(0.5) }}>
                          {formatTime(event.startTime)} · {event.durationMinutes} min
                        </Text>
                        <Text
                          fz="sm"
                          fw={700}
                          c="var(--bb-on-surface)"
                          style={{ textDecoration: isSkipped ? 'line-through' : 'none' }}
                        >
                          {event.title}
                        </Text>
                      </Box>
                    </Group>
                    {isCompleted && (
                      <Badge color="green" variant="light" size="xs" fw={800} radius="sm">
                        ✓ Done
                      </Badge>
                    )}
                  </Group>

                  <Text fz="xs" fw={500} c="var(--bb-outline)" mb={rem(12)} ml={rem(28)}>
                    {event.description}
                  </Text>

                  {!isCompleted && !isSkipped && (
                    <Group gap={rem(8)} ml={rem(28)}>
                      <Button
                        size="xs"
                        radius={8}
                        className="bb-btn-primary"
                        fw={800}
                        h={rem(32)}
                        leftSection={loadingId === event.id ? <Loader size={10} color="white" /> : <IconCheck size={12} />}
                        disabled={loadingId !== null}
                        onClick={() => handleComplete(event)}
                      >
                        Complete
                      </Button>
                      <Button
                        size="xs"
                        radius={8}
                        variant="subtle"
                        color="gray"
                        fw={800}
                        h={rem(32)}
                        leftSection={loadingId === `skip-${event.id}` ? <Loader size={10} /> : <IconArrowRight size={12} />}
                        disabled={loadingId !== null}
                        onClick={() => handleSkip(event)}
                      >
                        Skip
                      </Button>
                    </Group>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}
