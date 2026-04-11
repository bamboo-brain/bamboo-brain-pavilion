'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Stack,
  Group,
  Text,
  Button,
  Box,
  Card,
  Progress,
  rem,
  Skeleton,
  Badge,
  Divider,
} from '@mantine/core';
import { IconCheck, IconX, IconClock, IconBook2 } from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuizSetupModal } from '@/components/quiz/QuizSetupModal';
import { getSession } from '@/lib/quiz';
import { recordActivity } from '@/lib/api/planner';
import type { QuizSession } from '@/types/quiz';

function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent! 🌟', color: '#15803d' };
  if (score >= 70) return { label: 'Good job! 👍', color: '#1d4ed8' };
  if (score >= 50) return { label: 'Keep going! 💪', color: '#c2410c' };
  return { label: 'More practice needed', color: '#b91c1c' };
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default function QuizResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? '';

  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [tryAgainOpen, setTryAgainOpen] = useState(false);

  useEffect(() => {
    if (!accessToken || !sessionId) return;
    getSession(sessionId, accessToken)
      .then((s) => {
        setQuizSession(s);
        if (s.status === 'completed') {
          const timeTaken = s.timeCompleted && s.timeStarted
            ? Math.round((new Date(s.timeCompleted).getTime() - new Date(s.timeStarted).getTime()) / 1000)
            : 0;
          const minutesSpent = Math.max(1, Math.round(timeTaken / 60));
          recordActivity({ activityType: 'quiz', minutesSpent, itemsCompleted: s.totalQuestions, resourceId: s.id }, accessToken).catch(() => {});
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken, sessionId]);

  if (loading) {
    return (
      <AppLayout>
        <Stack align="center" gap={rem(24)} pt={rem(40)} maw={rem(600)} mx="auto">
          <Skeleton height={rem(200)} radius={24} />
          <Skeleton height={rem(160)} radius={24} />
        </Stack>
      </AppLayout>
    );
  }

  if (!quizSession) {
    return (
      <AppLayout>
        <Stack align="center" pt={rem(80)}>
          <Text fw={700}>Session not found.</Text>
          <Button variant="light" color="gray" onClick={() => router.push('/study-center/quiz')}>
            Back to Quiz Center
          </Button>
        </Stack>
      </AppLayout>
    );
  }

  const score = quizSession.score ?? 0;
  const { label: scoreLabel, color: scoreColor } = getScoreLabel(score);
  const correct = quizSession.correctAnswers;
  const incorrect = quizSession.totalQuestions - correct;

  const timeTaken =
    quizSession.timeCompleted && quizSession.timeStarted
      ? Math.round(
          (new Date(quizSession.timeCompleted).getTime() -
            new Date(quizSession.timeStarted).getTime()) / 1000,
        )
      : 0;

  // Questions the user got wrong
  const wrongWords = quizSession.questions.filter((q) => {
    const answer = quizSession.answers.find((a) => a.questionId === q.id);
    return answer && !answer.isCorrect;
  });

  return (
    <AppLayout>
      <Stack gap={rem(32)} pt={rem(16)} maw={rem(600)} mx="auto">
        {/* Header */}
        <Stack align="center" gap={rem(8)}>
          <Text fz={rem(48)} ta="center">🎉</Text>
          <Text fz={rem(28)} fw={800} c="var(--bb-on-surface)" ta="center">Quiz Complete!</Text>
          <Text fz="sm" fw={600} c="var(--bb-outline)" ta="center">{quizSession.sourceName}</Text>
        </Stack>

        {/* Score card */}
        <Card radius={24} p={rem(40)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none', textAlign: 'center' }}>
          <Stack align="center" gap={rem(20)}>
            <Stack align="center" gap={rem(4)}>
              <Text fz={rem(64)} fw={800} c="var(--bb-on-surface)" lh={1}>
                {correct}<Text span fz={rem(32)} fw={600} c="var(--bb-outline)"> / {quizSession.totalQuestions}</Text>
              </Text>
              <Text fz={rem(28)} fw={800} c="var(--bb-primary)">{score}%</Text>
              <Text fz="lg" fw={700} c={scoreColor}>{scoreLabel}</Text>
            </Stack>

            <Progress
              value={score}
              size="lg"
              radius="xl"
              color="var(--bb-primary)"
              bg="var(--bb-surface-container)"
              style={{ width: '100%' }}
            />

            <Group gap={rem(32)}>
              <Group gap={rem(8)}>
                <Box style={{ width: rem(28), height: rem(28), borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconCheck size={16} color="white" />
                </Box>
                <Text fz="sm" fw={700} c="#15803d">{correct} correct</Text>
              </Group>
              <Group gap={rem(8)}>
                <Box style={{ width: rem(28), height: rem(28), borderRadius: '50%', backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconX size={16} color="white" />
                </Box>
                <Text fz="sm" fw={700} c="#b91c1c">{incorrect} incorrect</Text>
              </Group>
              {timeTaken > 0 && (
                <Group gap={rem(8)}>
                  <IconClock size={18} color="var(--bb-outline)" />
                  <Text fz="sm" fw={700} c="var(--bb-outline)">{formatTime(timeTaken)}</Text>
                </Group>
              )}
            </Group>
          </Stack>
        </Card>

        {/* Words to review */}
        {wrongWords.length > 0 && (
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group gap={rem(10)} mb={rem(20)}>
              <Box p={rem(8)} style={{ borderRadius: 8, backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex' }}>
                <IconBook2 size={18} />
              </Box>
              <Text fz={rem(16)} fw={800} c="var(--bb-on-surface)">Words to review</Text>
              <Badge variant="light" color="red" size="sm" radius="sm" fw={800}>{wrongWords.length}</Badge>
            </Group>
            <Stack gap={rem(8)}>
              {wrongWords.map((q) => (
                <Group key={q.id} justify="space-between" align="center" wrap="nowrap">
                  <Group gap={rem(10)}>
                    <Text fz={rem(22)} fw={700} style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>{q.word}</Text>
                    {q.pinyin && <Text fz="sm" fw={600} c="var(--bb-primary)">{q.pinyin}</Text>}
                  </Group>
                  {q.hskLevel != null && (
                    <Badge variant="light" color="gray" size="xs" radius="sm" fw={800}>HSK {q.hskLevel}</Badge>
                  )}
                </Group>
              ))}
            </Stack>
          </Card>
        )}

        {/* Actions */}
        <Group grow gap={rem(12)}>
          <Button
            variant="light"
            color="gray"
            radius={12}
            fw={800}
            h={rem(48)}
            onClick={() => setTryAgainOpen(true)}
          >
            Try Again
          </Button>
          <Button
            variant="light"
            color="green"
            radius={12}
            fw={800}
            h={rem(48)}
            onClick={() => router.push('/study-center/quiz')}
          >
            New Quiz
          </Button>
          <Button
            className="bb-btn-primary"
            radius={12}
            fw={800}
            h={rem(48)}
            onClick={() => router.push('/study-center')}
          >
            Done
          </Button>
        </Group>
      </Stack>

      <QuizSetupModal
        isOpen={tryAgainOpen}
        onClose={() => setTryAgainOpen(false)}
        sourceType={quizSession.sourceType}
        sourceId={quizSession.sourceId}
        sourceName={quizSession.sourceName}
      />
    </AppLayout>
  );
}
