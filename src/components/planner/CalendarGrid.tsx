'use client';

import { useMemo } from 'react';
import { Box, Text, Stack, rem } from '@mantine/core';
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

export function CalendarGrid({ year, month, eventsByDate, selectedDate, onSelectDate }: CalendarGridProps) {
  const today = new Date().toISOString().split('T')[0];
  const days = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  return (
    <Box>
      {/* Weekday headers */}
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: rem(6), marginBottom: rem(6) }}>
        {WEEKDAYS.map((d) => (
          <Text key={d} fz={rem(11)} fw={700} c="var(--bb-outline)" ta="center" tt="uppercase" style={{ letterSpacing: rem(0.5) }}>
            {d}
          </Text>
        ))}
      </Box>

      {/* Day cells */}
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: rem(6) }}>
        {days.map((day) => {
          const isToday = day.date === today;
          const isSelected = day.date === selectedDate;
          const dayEvents = eventsByDate.get(day.date) ?? [];

          let bgColor: string;
          let borderColor: string;

          if (isSelected && isToday) {
            bgColor = '#dcfce7';
            borderColor = '#16a34a';
          } else if (isSelected) {
            bgColor = 'var(--bb-surface-container)';
            borderColor = 'var(--bb-primary)';
          } else if (isToday) {
            bgColor = '#f0fdf4';
            borderColor = '#86efac';
          } else if (day.isCurrentMonth) {
            bgColor = 'var(--bb-surface-container-low)';
            borderColor = 'transparent';
          } else {
            bgColor = 'var(--bb-surface-container-low)';
            borderColor = 'transparent';
          }

          return (
            <Box
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              style={{
                minHeight: rem(90),
                padding: rem(10),
                borderRadius: rem(14),
                border: `2px solid ${borderColor}`,
                backgroundColor: bgColor,
                opacity: day.isCurrentMonth ? 1 : 0.45,
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isToday) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--bb-outline-variant)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isToday) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                }
              }}
            >
              <Text
                fz="sm"
                fw={700}
                c={isToday ? '#15803d' : 'var(--bb-on-surface)'}
                mb={rem(5)}
              >
                {new Date(day.date + 'T00:00:00').getDate()}
              </Text>
              <Stack gap={rem(3)}>
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    style={{
                      backgroundColor: event.color + '28',
                      color: event.color,
                      fontSize: rem(11),
                      fontWeight: 700,
                      padding: `${rem(2)} ${rem(6)}`,
                      borderRadius: rem(4),
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      opacity: event.status === 'skipped' ? 0.5 : 1,
                      textDecoration: event.status === 'skipped' ? 'line-through' : 'none',
                    }}
                  >
                    {event.status === 'completed' && '✓ '}{event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <Text fz={rem(10)} fw={600} c="var(--bb-outline)">+{dayEvents.length - 2} more</Text>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
