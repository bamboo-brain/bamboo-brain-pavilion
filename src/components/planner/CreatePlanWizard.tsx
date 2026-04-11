'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Modal, Stack, Group, Text, TextInput, Button, Select, Box, Badge, rem, Loader,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { createPlan } from '@/lib/api/planner';
import type { StudyPlan, CreatePlanRequest } from '@/types/planner';

interface CreatePlanWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (plan: StudyPlan) => void;
}

const HSK_LEVELS = ['1', '2', '3', '4', '5', '6'].map((l) => ({ value: l, label: `HSK ${l}` }));

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const FOCUS_OPTIONS = [
  { key: 'vocabulary', label: '📚 Vocabulary' },
  { key: 'speaking', label: '🎤 Speaking' },
  { key: 'reading', label: '📖 Reading' },
  { key: 'writing', label: '✍️ Writing' },
  { key: 'tones', label: '🎵 Tones' },
  { key: 'business', label: '💼 Business' },
];

const TIME_OPTIONS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','14:00','16:00','18:00','19:00','20:00','21:00']
  .map((t) => ({ value: t, label: t }));

export function CreatePlanWizard({ isOpen, onClose, onCreated }: CreatePlanWizardProps) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? '';
  const userHskLevel = session?.user?.hskLevel ?? 1;

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Goal
  const [currentLevel, setCurrentLevel] = useState(String(userHskLevel));
  const [targetLevel, setTargetLevel] = useState(String(Math.min(userHskLevel + 1, 6)));
  const [targetDate, setTargetDate] = useState('');
  const [reason, setReason] = useState('');

  // Step 2 — Schedule
  const [preferredDays, setPreferredDays] = useState<string[]>(['monday', 'wednesday', 'friday']);
  const [preferredTime, setPreferredTime] = useState('09:00');
  const [dailyMinutes, setDailyMinutes] = useState('30');
  const [sessionsPerWeek, setSessionsPerWeek] = useState('3');

  // Step 3 — Focus
  const [focusAreas, setFocusAreas] = useState<string[]>(['vocabulary']);

  // Step 4 — Calendar sync
  const [syncGoogle, setSyncGoogle] = useState(false);
  const [syncMicrosoft, setSyncMicrosoft] = useState(false);

  function toggleDay(day: string) {
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function toggleFocus(key: string) {
    setFocusAreas((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);
    const request: CreatePlanRequest = {
      goal: {
        currentHskLevel: Number(currentLevel),
        targetHskLevel: Number(targetLevel),
        targetDate: targetDate || undefined,
        dailyStudyMinutes: Number(dailyMinutes),
        focusAreas,
        reasonForLearning: reason.trim() || 'General improvement',
      },
      weeklySchedule: {
        preferredDays,
        preferredTime,
        sessionsPerWeek: Number(sessionsPerWeek),
      },
      syncToGoogleCalendar: syncGoogle,
      syncToMicrosoftCalendar: syncMicrosoft,
      googleAccessToken: syncGoogle ? (session?.googleAccessToken ?? undefined) : undefined,
      microsoftAccessToken: syncMicrosoft ? accessToken : undefined,
    };

    try {
      const plan = await createPlan(request, accessToken);
      onCreated(plan);
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create plan');
      setIsGenerating(false);
    }
  }

  function handleClose() {
    setStep(1);
    setIsGenerating(false);
    setError(null);
    onClose();
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={<Text fw={800} fz="lg">Create Study Plan</Text>}
      centered
      radius={16}
      size="md"
      closeOnClickOutside={!isGenerating}
      closeOnEscape={!isGenerating}
    >
      {isGenerating ? (
        <Stack align="center" py={rem(48)} gap={rem(16)}>
          <Loader size="xl" color="var(--bb-primary)" />
          <Text fw={800} fz="lg" ta="center">Master Ling is planning your journey...</Text>
          <Text fz="sm" c="var(--bb-outline)" ta="center">
            Analyzing your goals and creating a personalized schedule
          </Text>
          <Stack gap={rem(4)} mt={rem(8)}>
            <Text fz="xs" c="var(--bb-outline)">✓ Analyzing your HSK level gap</Text>
            <Text fz="xs" c="var(--bb-outline)">✓ Calculating optimal study frequency</Text>
            <Text fz="xs" c="var(--bb-primary)" fw={700} style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
              ⏳ Generating your schedule...
            </Text>
          </Stack>
        </Stack>
      ) : (
        <Stack gap={rem(24)}>
          {/* Step indicator */}
          <Group gap={rem(6)}>
            {[1, 2, 3, 4].map((s) => (
              <Box
                key={s}
                style={{
                  flex: 1,
                  height: rem(4),
                  borderRadius: rem(2),
                  backgroundColor: s <= step ? 'var(--bb-primary)' : 'var(--bb-surface-container)',
                  transition: 'background-color 0.2s ease',
                }}
              />
            ))}
          </Group>

          {/* Step 1 — Goal */}
          {step === 1 && (
            <Stack gap={rem(16)}>
              <Text fw={800} fz="md">What&apos;s your Chinese learning goal?</Text>
              <Group grow>
                <Select label="Current level" data={HSK_LEVELS} value={currentLevel} onChange={(v) => setCurrentLevel(v ?? '1')} radius={10} allowDeselect={false} />
                <Select label="Target level" data={HSK_LEVELS} value={targetLevel} onChange={(v) => setTargetLevel(v ?? '4')} radius={10} allowDeselect={false} />
              </Group>
              <TextInput
                label="Target date (optional)"
                placeholder="e.g. 2025-12-01"
                value={targetDate}
                onChange={(e) => setTargetDate(e.currentTarget.value)}
                radius={10}
              />
              <TextInput
                label="Why are you learning Chinese?"
                placeholder="e.g. For business travel to Shanghai..."
                value={reason}
                onChange={(e) => setReason(e.currentTarget.value)}
                radius={10}
              />
            </Stack>
          )}

          {/* Step 2 — Schedule */}
          {step === 2 && (
            <Stack gap={rem(16)}>
              <Text fw={800} fz="md">When do you want to study?</Text>
              <Stack gap={rem(8)}>
                <Text fz="sm" fw={700}>Preferred days</Text>
                <Group gap={rem(6)} wrap="wrap">
                  {DAYS_OF_WEEK.map((day) => (
                    <Badge
                      key={day}
                      color={preferredDays.includes(day) ? 'green' : 'gray'}
                      variant={preferredDays.includes(day) ? 'filled' : 'light'}
                      size="md"
                      fw={800}
                      radius="sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleDay(day)}
                    >
                      {DAY_LABELS[day]}
                    </Badge>
                  ))}
                </Group>
              </Stack>
              <Select label="Preferred time" data={TIME_OPTIONS} value={preferredTime} onChange={(v) => setPreferredTime(v ?? '09:00')} radius={10} allowDeselect={false} />
              <Group grow>
                <TextInput
                  label="Minutes per session"
                  type="number"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(e.currentTarget.value)}
                  radius={10}
                  min={10}
                  max={180}
                />
                <Select
                  label="Sessions per week"
                  data={['1','2','3','4','5','6','7'].map((n) => ({ value: n, label: `${n}×/week` }))}
                  value={sessionsPerWeek}
                  onChange={(v) => setSessionsPerWeek(v ?? '3')}
                  radius={10}
                  allowDeselect={false}
                />
              </Group>
            </Stack>
          )}

          {/* Step 3 — Focus */}
          {step === 3 && (
            <Stack gap={rem(16)}>
              <Text fw={800} fz="md">What do you want to focus on?</Text>
              <Group gap={rem(8)} wrap="wrap">
                {FOCUS_OPTIONS.map((opt) => (
                  <Badge
                    key={opt.key}
                    color={focusAreas.includes(opt.key) ? 'green' : 'gray'}
                    variant={focusAreas.includes(opt.key) ? 'filled' : 'light'}
                    size="lg"
                    fw={700}
                    radius="sm"
                    style={{ cursor: 'pointer', fontSize: rem(13), padding: `${rem(10)} ${rem(14)}` }}
                    onClick={() => toggleFocus(opt.key)}
                  >
                    {opt.label}
                  </Badge>
                ))}
              </Group>
            </Stack>
          )}

          {/* Step 4 — Calendar sync */}
          {step === 4 && (
            <Stack gap={rem(16)}>
              <Text fw={800} fz="md">Sync your study plan to:</Text>
              <Stack gap={rem(10)}>
                {[
                  { key: 'google', label: 'Google Calendar', value: syncGoogle, set: setSyncGoogle },
                  { key: 'microsoft', label: 'Microsoft Calendar (Outlook)', value: syncMicrosoft, set: setSyncMicrosoft },
                ].map((cal) => (
                  <Box
                    key={cal.key}
                    p={rem(16)}
                    style={{
                      borderRadius: rem(12),
                      border: `2px solid ${cal.value ? 'var(--bb-primary)' : 'var(--bb-surface-container)'}`,
                      backgroundColor: cal.value ? 'rgba(21,66,18,0.04)' : 'var(--bb-surface-container-lowest)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.15s ease',
                    }}
                    onClick={() => cal.set((v) => !v)}
                  >
                    <Text fz="sm" fw={700}>{cal.label}</Text>
                    {cal.value && <IconCheck size={16} color="var(--bb-primary)" />}
                  </Box>
                ))}
              </Stack>
              <Text fz="xs" c="var(--bb-outline)">
                Your plan will be created by our AI tutor and optionally synced to your calendar.
              </Text>
            </Stack>
          )}

          {error && <Text fz="sm" c="red" fw={600}>{error}</Text>}

          <Group justify="space-between">
            {step > 1 ? (
              <Button variant="subtle" color="gray" onClick={() => setStep((s) => s - 1)}>Back</Button>
            ) : (
              <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
            )}
            {step < 4 ? (
              <Button className="bb-btn-primary" radius={10} fw={800} onClick={() => setStep((s) => s + 1)}>
                Next →
              </Button>
            ) : (
              <Button className="bb-btn-primary" radius={10} fw={800} onClick={handleGenerate}>
                ✨ Generate My Plan
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
