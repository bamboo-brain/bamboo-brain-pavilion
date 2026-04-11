'use client';

import { useMemo } from 'react';
import { Box, Text, Badge, Stack, rem } from '@mantine/core';
import type { StudyEvent } from '@/types/planner';

interface CalendarGridProps {
  year: number;
  month: number;
  eventsByDate: Map<string, StudyEvent[]>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function buildCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const days: { date: string; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    days.push({ date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: true });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = month === 12 ? 1 : month + 1;
      const y = month === 12 ? year + 1 : year;
      days.push({ date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, isCurrentMonth: false });
    }
  }

  return days;
}

function eventBadgeColor(type: StudyEvent['type']) {
  const map: Record<string, string> = {
    flashcards: 'green',
    speaking: 'blue',
    quiz: 'orange',
    reading: 'teal',
    review: 'violet',
    milestone: 'yellow',
  };
  return map[type] ?? 'gray';
}

export function CalendarGrid({ year, month, eventsByDate, selectedDate, onSelectDate }: CalendarGridProps) {
  const today = new Date().toISOString().split('T')[0];
  const days = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  return (
    <Box>
      {/* Weekday headers */}
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: rem(8), marginBottom: rem(8) }}>
        {WEEKDAYS.map((d) => (
          <Text key={d} fz={rem(11)} fw={800} c="var(--bb-outline)" ta="center" tt="uppercase" style={{ letterSpacing: rem(1) }}>
            {d}
          </Text>
        ))}
      </Box>

      {/* Day cells */}
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: rem(8) }}>
        {days.map((day) => {
          const isToday = day.date === today;
          const isSelected = day.date === selectedDate;
          const dayEvents = eventsByDate.get(day.date) ?? [];

          return (
            <Box
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              style={{
                minHeight: rem(100),
                padding: rem(10),
                borderRadius: rem(14),
                border: isSelected
                  ? '2px solid var(--bb-primary)'
                  : isToday
                  ? '2px solid rgba(21,66,18,0.3)'
                  : '2px solid transparent',
                backgroundColor: isToday
                  ? 'rgba(21,66,18,0.04)'
                  : day.isCurrentMonth
                  ? 'var(--bb-surface-container-low)'
                  : 'transparent',
                opacity: day.isCurrentMonth ? 1 : 0.4,
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bb-surface-container)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = isToday ? 'rgba(21,66,18,0.04)' : day.isCurrentMonth ? 'var(--bb-surface-container-low)' : 'transparent';
              }}
            >
              <Text
                fz="sm"
                fw={800}
                c={isToday ? 'var(--bb-primary)' : 'var(--bb-on-surface)'}
                mb={rem(6)}
              >
                {new Date(day.date + 'T00:00:00').getDate()}
              </Text>
              <Stack gap={rem(3)}>
                {dayEvents.slice(0, 2).map((event) => (
                  <Badge
                    key={event.id}
                    size="xs"
                    radius="sm"
                    variant={event.status === 'completed' ? 'filled' : 'light'}
                    color={eventBadgeColor(event.type)}
                    fw={700}
                    fullWidth
                    tt="none"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {event.title}
                  </Badge>
                ))}
                {dayEvents.length > 2 && (
                  <Text fz={rem(10)} fw={700} c="var(--bb-outline)">+{dayEvents.length - 2} more</Text>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
