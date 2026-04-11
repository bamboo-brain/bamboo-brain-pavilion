'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Stack,
  Group,
  Text,
  Button,
  Box,
  Progress,
  rem,
  ActionIcon,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SessionComplete } from '@/components/flashcards/SessionComplete';
import { reviewCard } from '@/lib/flashcards';
import { previewNextInterval, formatInterval } from '@/lib/sm2';
import type { Flashcard } from '@/types/flashcard';

type BlitzCard = Flashcard & { deckId: string };
type Phase = 'question' | 'answer' | 'complete';

const GRADE_MAP = { again: 1, hard: 2, good: 4, easy: 5 } as const;
type GradeKey = keyof typeof GRADE_MAP;

const GRADE_STYLES: Record<GradeKey, { bg: string; text: string; label: string }> = {
  again: { bg: '#fee2e2', text: '#b91c1c', label: 'Again' },
  hard:  { bg: '#ffedd5', text: '#c2410c', label: 'Hard' },
  good:  { bg: '#dbeafe', text: '#1d4ed8', label: 'Good' },
  easy:  { bg: '#dcfce7', text: '#15803d', label: 'Easy' },
};

const FLIP_OUT_MS = 180;
const FLIP_IN_MS  = 220;

export default function BlitzPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? '';

  const [phase, setPhase] = useState<Phase>('question');
  const [showBack, setShowBack] = useState(false);
  const [flipClass, setFlipClass] = useState('');
  const flipTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<BlitzCard[]>([]);
  const [sessionResults, setSessionResults] = useState<{ cardId: string; grade: number; word: string }[]>([]);
  const [grading, setGrading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => () => { flipTimers.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem('blitzCards');
    if (!raw) { router.replace('/study-center'); return; }
    try {
      const parsed: BlitzCard[] = JSON.parse(raw);
      setCards(parsed);
      if (parsed.length === 0) setPhase('complete');
    } catch {
      router.replace('/study-center');
    }
    setLoaded(true);
  }, [router]);

  function flip() {
    flipTimers.current.forEach(clearTimeout);
    setFlipClass('fc-flip-out');
    const t1 = setTimeout(() => {
      setShowBack(true);
      setPhase('answer');
      setFlipClass('fc-flip-in');
      const t2 = setTimeout(() => setFlipClass(''), FLIP_IN_MS);
      flipTimers.current = [t2];
    }, FLIP_OUT_MS);
    flipTimers.current = [t1];
  }

  const handleGrade = useCallback(async (grade: number) => {
    if (grading || !cards[currentIndex]) return;
    setGrading(true);
    setShowBack(false);
    setFlipClass('');
    try {
      const card = cards[currentIndex];
      await reviewCard(card.deckId, { cardId: card.id, grade }, accessToken);
      setSessionResults((prev) => [...prev, { cardId: card.id, grade, word: card.word }]);
      if (currentIndex + 1 >= cards.length) {
        sessionStorage.removeItem('blitzCards');
        setPhase('complete');
      } else {
        setCurrentIndex((prev) => prev + 1);
        setPhase('question');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGrading(false);
    }
  }, [grading, cards, currentIndex, accessToken]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (phase === 'question' && e.code === 'Space') { e.preventDefault(); flip(); }
      else if (phase === 'answer') {
        if (e.key === '1') handleGrade(GRADE_MAP.again);
        else if (e.key === '2') handleGrade(GRADE_MAP.hard);
        else if (e.key === '3') handleGrade(GRADE_MAP.good);
        else if (e.key === '4') handleGrade(GRADE_MAP.easy);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, handleGrade]);

  const card = cards[currentIndex];
  const progress = cards.length > 0 ? Math.round((currentIndex / cards.length) * 100) : 0;

  if (!loaded) return null;

  if (phase === 'complete') {
    return (
      <AppLayout>
        <SessionComplete
          results={sessionResults}
          onBack={() => router.push('/study-center')}
          onStudyAgain={() => router.push('/study-center')}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={
        <Text fz={rem(14)} fw={800} c="var(--bb-primary)" tt="uppercase" lts={2}>
          Random Blitz
        </Text>
      }
    >
      <Stack align="center" gap={rem(32)} pt={rem(32)}>
        {/* Header */}
        <Box style={{ width: '100%', maxWidth: rem(560) }}>
          <Group justify="space-between" align="center" mb={rem(16)}>
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => router.push('/study-center')}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Text fz="sm" fw={700} c="var(--bb-on-surface-variant)">
              Card {currentIndex + 1} of {cards.length}
            </Text>
            <Text fz="sm" fw={800} c="var(--bb-primary)">{progress}%</Text>
          </Group>
          <Progress value={progress} size="sm" radius="xl" color="var(--bb-primary)" bg="var(--bb-surface-container)" />
        </Box>

        {/* Card with flip animation */}
        <Box
          className={flipClass}
          style={{
            width: '100%',
            maxWidth: rem(560),
            backgroundColor: 'var(--bb-surface-container-lowest)',
            borderRadius: rem(24),
            padding: rem(48),
            minHeight: rem(260),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: rem(16),
          }}
        >
          {!showBack ? (
            <Stack align="center" gap={rem(8)}>
              <Text
                fz={rem(64)}
                fw={800}
                c="var(--bb-on-surface)"
                style={{ fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.1 }}
              >
                {card?.word}
              </Text>
              {card?.hskLevel != null && (
                <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase" lts={1}>
                  HSK {card.hskLevel}
                </Text>
              )}
            </Stack>
          ) : (
            <Stack align="center" gap={rem(16)} style={{ width: '100%' }}>
              <Group gap={rem(12)} align="baseline" justify="center">
                <Text
                  fz={rem(40)}
                  fw={800}
                  c="var(--bb-on-surface)"
                  style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                >
                  {card?.word}
                </Text>
                <Text fz={rem(20)} fw={600} c="var(--bb-primary)">{card?.pinyin}</Text>
              </Group>
              <Text fz={rem(18)} fw={700} c="var(--bb-on-surface-variant)" ta="center">
                {card?.meaning}
              </Text>
              {card?.exampleSentence && (
                <Box
                  p={rem(16)}
                  style={{ backgroundColor: 'var(--bb-surface-container-low)', borderRadius: rem(12), width: '100%' }}
                >
                  <Stack gap={rem(4)}>
                    <Text fz="sm" fw={600} c="var(--bb-on-surface)" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                      {card.exampleSentence}
                    </Text>
                    {card.exampleTranslation && (
                      <Text fz="xs" fw={600} c="var(--bb-outline)">{card.exampleTranslation}</Text>
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </Box>

        {/* Action */}
        <Box style={{ width: '100%', maxWidth: rem(560) }}>
          {phase === 'question' ? (
            <Stack align="center" gap={rem(12)}>
              <Button
                className="bb-btn-primary"
                size="lg"
                radius={14}
                fw={800}
                fullWidth
                h={rem(56)}
                onClick={flip}
              >
                Show Answer
              </Button>
              <Text fz="xs" fw={600} c="var(--bb-outline)">Press Space to reveal</Text>
            </Stack>
          ) : (
            <Stack gap={rem(12)}>
              <Text fz="sm" fw={700} c="var(--bb-on-surface-variant)" ta="center" mb={rem(4)}>
                How well did you know this?
              </Text>
              <Group grow gap={rem(8)}>
                {(Object.entries(GRADE_STYLES) as [GradeKey, typeof GRADE_STYLES[GradeKey]][]).map(([key, style]) => {
                  const gradeVal = GRADE_MAP[key];
                  const days = card
                    ? previewNextInterval(card.intervalDays, card.easeFactor, card.repetitions, gradeVal)
                    : 1;
                  return (
                    <Button
                      key={key}
                      variant="filled"
                      radius={14}
                      fw={800}
                      h={rem(72)}
                      loading={grading}
                      onClick={() => handleGrade(gradeVal)}
                      style={{ backgroundColor: style.bg, color: style.text, flexDirection: 'column', gap: rem(4) }}
                    >
                      <Text fz="sm" fw={800} inherit>{style.label}</Text>
                      <Text fz="xs" fw={600} inherit style={{ opacity: 0.85 }}>{formatInterval(days)}</Text>
                    </Button>
                  );
                })}
              </Group>
              <Text fz="xs" fw={600} c="var(--bb-outline)" ta="center">Press 1 · 2 · 3 · 4 to grade</Text>
            </Stack>
          )}
        </Box>
      </Stack>
    </AppLayout>
  );
}
