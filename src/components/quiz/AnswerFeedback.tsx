'use client';

import { Stack, Group, Text, Button, Box, rem } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function AnswerFeedback({
  isCorrect,
  correctAnswer,
  explanation,
  onNext,
  isLastQuestion,
}: AnswerFeedbackProps) {
  return (
    <Box
      p={rem(20)}
      style={{
        borderRadius: rem(16),
        backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
        border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap={rem(12)} align="flex-start" style={{ flex: 1, minWidth: 0 }}>
          <Box
            style={{
              width: rem(36),
              height: rem(36),
              borderRadius: '50%',
              backgroundColor: isCorrect ? '#16a34a' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: rem(2),
            }}
          >
            {isCorrect
              ? <IconCheck size={20} color="white" />
              : <IconX size={20} color="white" />}
          </Box>
          <Stack gap={rem(4)} style={{ minWidth: 0 }}>
            <Text fz="sm" fw={800} c={isCorrect ? '#15803d' : '#b91c1c'}>
              {isCorrect ? 'Correct!' : 'Not quite'}
            </Text>
            {!isCorrect && (
              <Text fz="sm" fw={600} c="var(--bb-on-surface-variant)">
                Answer:{' '}
                <span style={{ fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 700 }}>
                  {correctAnswer}
                </span>
              </Text>
            )}
            {explanation && (
              <Text fz="sm" fw={500} c="var(--bb-on-surface-variant)" mt={rem(2)}>
                {explanation}
              </Text>
            )}
          </Stack>
        </Group>

        <Button
          className="bb-btn-primary"
          radius={10}
          fw={800}
          size="sm"
          onClick={onNext}
          style={{ flexShrink: 0 }}
        >
          {isLastQuestion ? 'See Results' : 'Next →'}
        </Button>
      </Group>
    </Box>
  );
}
