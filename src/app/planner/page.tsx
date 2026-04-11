'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Title, Text, Stack, Group, Card, Button, Box, rem, SimpleGrid,
  ActionIcon, Skeleton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { CalendarGrid } from '@/components/planner/CalendarGrid';
import { DayAgendaPanel } from '@/components/planner/DayAgendaPanel';
import { HskProgressCard } from '@/components/planner/HskProgressCard';
import { AdaptationBanner } from '@/components/planner/AdaptationBanner';
import { CreatePlanWizard } from '@/components/planner/CreatePlanWizard';
import { IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { getCalendarEvents, getUserStats } from '@/lib/api/planner';
import type { CalendarResponse, StudyEvent, StudyPlan } from '@/types/planner';
import type { UserStats } from '@/types/stats';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function PlannerPage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? '';
  const userHskLevel = session?.user?.hskLevel ?? 1;

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastAgentNote, setLastAgentNote] = useState<string | undefined>(undefined);
  const [wizardOpened, { open: openWizard, close: closeWizard }] = useDisclosure(false);

  const loadCalendar = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    const [calResult, statsResult] = await Promise.allSettled([
      getCalendarEvents(currentYear, currentMonth, accessToken),
      getUserStats(accessToken),
    ]);
    if (calResult.status === 'fulfilled') {
      setCalendarData(calResult.value);
      setLastAgentNote(calResult.value.lastAgentNote);
    }
    if (statsResult.status === 'fulfilled') setUserStats(statsResult.value);
    setLoading(false);
  }, [accessToken, currentYear, currentMonth]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };
  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  const eventsByDate = useMemo(() => {
    const map = new Map<string, StudyEvent[]>();
    calendarData?.events.forEach((event) => {
      const key = event.date.split('T')[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    });
    return map;
  }, [calendarData?.events]);

  const selectedEvents = eventsByDate.get(selectedDate) ?? [];

  function handleEventUpdate(eventId: string, status: string) {
    setCalendarData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        events: prev.events.map((e) =>
          e.id === eventId
            ? { ...e, status: status as StudyEvent['status'], completedAt: status === 'completed' ? new Date().toISOString() : e.completedAt }
            : e,
        ),
      };
    });
  }

  const showAdaptationBanner = calendarData?.hasPlan && calendarData.planId && (
    calendarData.adaptationDue && new Date(calendarData.adaptationDue) <= new Date()
  );

  const hskProgress = userStats?.hskProgress ?? [];
  const targetLevel = calendarData?.goal?.targetHskLevel ?? Math.min(userHskLevel + 1, 6);

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
            onClick={openWizard}
          >
            Create New Plan
          </Button>
        </Group>
      }
    >
      <Stack gap={rem(32)}>
        {/* Adaptation banner */}
        {showAdaptationBanner && calendarData?.planId && (
          <AdaptationBanner
            planId={calendarData.planId}
            accessToken={accessToken}
            lastAgentNote={lastAgentNote}
            onAdapted={(note) => {
              setLastAgentNote(note);
              loadCalendar();
            }}
          />
        )}

        {/* Nudge: no activity in 2 days */}
        {userStats?.lastActivityDate && (() => {
          const daysSince = Math.floor((Date.now() - new Date(userStats.lastActivityDate).getTime()) / 86400000);
          if (daysSince >= 2) {
            return (
              <Box p={rem(16)} style={{ borderRadius: rem(16), backgroundColor: 'rgba(217,72,15,0.06)', border: '1px solid rgba(217,72,15,0.2)' }}>
                <Text fz="sm" fw={700} c="#c2410c">
                  🔥 You haven&apos;t studied in {daysSince} days — your streak is at risk! Open a session to keep it going.
                </Text>
              </Box>
            );
          }
          return null;
        })()}

        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing={rem(32)}>
          {/* Calendar — 2 cols */}
          <Box style={{ gridColumn: 'span 2' }}>
            <Card radius={32} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
              <Stack gap={rem(24)}>
                <Group justify="space-between" align="flex-end">
                  <Box>
                    <Title order={2} fz={rem(24)} fw={800}>
                      {MONTH_NAMES[currentMonth - 1]} {currentYear}
                    </Title>
                    <Text fz="sm" fw={600} c="var(--bb-outline)">Your scholarly journey this month</Text>
                  </Box>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" size="lg" radius="md" onClick={prevMonth}>
                      <IconChevronLeft size={20} />
                    </ActionIcon>
                    <Button variant="light" color="gray" radius="md" fw={800} size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <ActionIcon variant="subtle" size="lg" radius="md" onClick={nextMonth}>
                      <IconChevronRight size={20} />
                    </ActionIcon>
                  </Group>
                </Group>

                {loading ? (
                  <Skeleton h={rem(480)} radius={16} />
                ) : (
                  <CalendarGrid
                    year={currentYear}
                    month={currentMonth}
                    eventsByDate={eventsByDate}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                )}
              </Stack>
            </Card>
          </Box>

          {/* Right sidebar — 1 col */}
          <Stack gap={rem(24)}>
            {loading ? (
              <>
                <Skeleton h={rem(360)} radius={24} />
                <Skeleton h={rem(180)} radius={24} />
              </>
            ) : (
              <>
                <DayAgendaPanel
                  selectedDate={selectedDate}
                  events={selectedEvents}
                  planId={calendarData?.planId ?? ''}
                  onEventUpdate={handleEventUpdate}
                />

                {hskProgress.length > 0 ? (
                  <HskProgressCard
                    hskProgress={hskProgress}
                    currentLevel={userHskLevel}
                    targetLevel={targetLevel}
                    charactersThisWeek={userStats?.charactersThisWeek ?? 0}
                  />
                ) : (
                  <Box
                    p={rem(28)}
                    style={{
                      borderRadius: rem(24),
                      background: 'linear-gradient(135deg, #0a220a 0%, #154212 100%)',
                      color: 'white',
                    }}
                  >
                    <Text fw={800} fz={rem(16)} mb={rem(8)}>HSK {userHskLevel} Mastery</Text>
                    <Text fz="xs" style={{ opacity: 0.75 }}>
                      Complete study sessions to track your character progress here.
                    </Text>
                  </Box>
                )}

                {/* Agent notes */}
                {calendarData?.lastAgentNote && (
                  <Box p={rem(16)} style={{ borderRadius: rem(16), backgroundColor: 'rgba(21,66,18,0.04)', border: '1px solid rgba(21,66,18,0.12)' }}>
                    <Text fz="xs" fw={800} c="var(--bb-primary)" mb={rem(4)}>🤖 Master Ling&apos;s Note</Text>
                    <Text fz="xs" fw={500} c="var(--bb-on-surface-variant)">{calendarData.lastAgentNote}</Text>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </SimpleGrid>
      </Stack>

      <CreatePlanWizard
        isOpen={wizardOpened}
        onClose={closeWizard}
        onCreated={(newPlan) => {
          setPlan(newPlan);
          loadCalendar();
        }}
      />
    </AppLayout>
  );
}
