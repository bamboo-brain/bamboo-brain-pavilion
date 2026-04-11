'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Checkbox,
  NumberInput,
  rem,
} from '@mantine/core';
import { generateQuiz } from '@/lib/quiz';
import type { QuizSession, QuestionType } from '@/types/quiz';

interface QuizSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: 'document' | 'deck';
  sourceId: string;
  sourceName: string;
  onStart?: (session: QuizSession) => void;
}

const QUESTION_COUNTS = [5, 10, 20] as const;
const HSK_LEVELS = [1, 2, 3, 4, 5, 6] as const;

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple choice',
  'fill-in-blank': 'Fill in the blank',
  'tone-identification': 'Tone identification',
  'listening': 'Listening',
};

export function QuizSetupModal({
  isOpen,
  onClose,
  sourceType,
  sourceId,
  sourceName,
  onStart,
}: QuizSetupModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const accessToken = session?.accessToken ?? '';

  const [questionCount, setQuestionCount] = useState<number | 'custom'>(10);
  const [customCount, setCustomCount] = useState<number | string>(15);
  const [types, setTypes] = useState<QuestionType[]>([
    'multiple-choice',
    'fill-in-blank',
    'tone-identification',
    'listening',
  ]);
  const [hskLevel, setHskLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleType(type: QuestionType) {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  async function handleStart() {
    if (types.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const count = questionCount === 'custom' ? Number(customCount) : questionCount;
      const quizSession = await generateQuiz(
        {
          [sourceType === 'document' ? 'documentId' : 'deckId']: sourceId,
          questionCount: count,
          types,
          hskLevel: hskLevel ?? undefined,
        },
        accessToken,
      );
      onStart?.(quizSession);
      router.push(`/study-center/quiz/${quizSession.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setError(null);
    onClose();
  }

  const finalCount = questionCount === 'custom' ? Number(customCount) : questionCount;
  const canStart = types.length > 0 && finalCount >= 1 && finalCount <= 50;

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={
        <Stack gap={rem(2)}>
          <Text fw={800} fz="lg">Start Quiz</Text>
          <Text fz="xs" fw={600} c="var(--bb-outline)" lineClamp={1}>{sourceName}</Text>
        </Stack>
      }
      centered
      radius={16}
      size="md"
    >
      <Stack gap={rem(24)}>
        {/* Question count */}
        <Stack gap={rem(10)}>
          <Text fz="sm" fw={700} c="var(--bb-on-surface)">Number of questions</Text>
          <Group gap={rem(8)}>
            {QUESTION_COUNTS.map((n) => (
              <Button
                key={n}
                variant={questionCount === n ? 'filled' : 'light'}
                color={questionCount === n ? 'var(--bb-primary)' : 'gray'}
                size="xs"
                radius={8}
                fw={800}
                onClick={() => setQuestionCount(n)}
              >
                {n}
              </Button>
            ))}
            <Button
              variant={questionCount === 'custom' ? 'filled' : 'light'}
              color={questionCount === 'custom' ? 'var(--bb-primary)' : 'gray'}
              size="xs"
              radius={8}
              fw={800}
              onClick={() => setQuestionCount('custom')}
            >
              Custom
            </Button>
          </Group>
          {questionCount === 'custom' && (
            <NumberInput
              value={customCount}
              onChange={setCustomCount}
              min={1}
              max={50}
              radius={10}
              size="sm"
              placeholder="1–50"
            />
          )}
        </Stack>

        {/* Question types */}
        <Stack gap={rem(10)}>
          <Text fz="sm" fw={700} c="var(--bb-on-surface)">Question types</Text>
          <Stack gap={rem(8)}>
            {(Object.entries(QUESTION_TYPE_LABELS) as [QuestionType, string][]).map(([type, label]) => (
              <Checkbox
                key={type}
                checked={types.includes(type)}
                onChange={() => toggleType(type)}
                label={<Text fz="sm" fw={600}>{label}</Text>}
                color="var(--bb-primary)"
                radius={6}
              />
            ))}
          </Stack>
          {types.length === 0 && (
            <Text fz="xs" c="red" fw={600}>Select at least one question type</Text>
          )}
        </Stack>

        {/* HSK filter */}
        <Stack gap={rem(10)}>
          <Text fz="sm" fw={700} c="var(--bb-on-surface)">HSK level filter <Text span fz="xs" fw={600} c="var(--bb-outline)">(optional)</Text></Text>
          <Group gap={rem(8)}>
            <Button
              variant={hskLevel === null ? 'filled' : 'light'}
              color={hskLevel === null ? 'var(--bb-primary)' : 'gray'}
              size="xs"
              radius={8}
              fw={800}
              onClick={() => setHskLevel(null)}
            >
              All
            </Button>
            {HSK_LEVELS.map((lvl) => (
              <Button
                key={lvl}
                variant={hskLevel === lvl ? 'filled' : 'light'}
                color={hskLevel === lvl ? 'var(--bb-primary)' : 'gray'}
                size="xs"
                radius={8}
                fw={800}
                onClick={() => setHskLevel(lvl)}
              >
                {lvl}
              </Button>
            ))}
          </Group>
        </Stack>

        {error && <Text fz="sm" c="red" fw={600}>{error}</Text>}

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={handleClose}>Cancel</Button>
          <Button
            className="bb-btn-primary"
            radius={10}
            fw={800}
            loading={loading}
            disabled={!canStart}
            onClick={handleStart}
          >
            Start Quiz →
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
