'use client';

import { Stack, Group, Text, Box, rem } from '@mantine/core';
import type { QuizQuestion } from '@/types/quiz';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface MultipleChoiceProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  phase: 'answering' | 'revealed';
  correctAnswer?: string;
  isCorrect?: boolean;
}

export function MultipleChoice({
  question,
  selectedAnswer,
  onSelect,
  phase,
  correctAnswer,
  isCorrect,
}: MultipleChoiceProps) {
  function getOptionStyle(option: string) {
    const base: React.CSSProperties = {
      borderRadius: rem(14),
      border: '2px solid',
      padding: `${rem(16)} ${rem(20)}`,
      cursor: phase === 'answering' ? 'pointer' : 'default',
      transition: 'all 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      gap: rem(14),
    };

    if (phase === 'answering') {
      if (option === selectedAnswer) {
        return { ...base, borderColor: 'var(--bb-primary)', backgroundColor: '#f0faf0' };
      }
      return { ...base, borderColor: 'var(--bb-surface-container)', backgroundColor: 'var(--bb-surface-container-lowest)' };
    }

    // revealed phase
    if (option === correctAnswer) {
      return { ...base, borderColor: '#16a34a', backgroundColor: '#f0fdf4', cursor: 'default' };
    }
    if (option === selectedAnswer && !isCorrect) {
      return { ...base, borderColor: '#dc2626', backgroundColor: '#fef2f2', cursor: 'default' };
    }
    return { ...base, borderColor: 'var(--bb-surface-container)', backgroundColor: 'var(--bb-surface-container-lowest)', opacity: 0.45, cursor: 'default' };
  }

  function getLabelColor(option: string) {
    if (phase === 'revealed') {
      if (option === correctAnswer) return '#15803d';
      if (option === selectedAnswer && !isCorrect) return '#dc2626';
    }
    if (option === selectedAnswer) return 'var(--bb-primary)';
    return 'var(--bb-outline)';
  }

  return (
    <Stack gap={rem(12)}>
      {question.options.map((option, idx) => (
        <Box
          key={idx}
          style={getOptionStyle(option)}
          onClick={() => phase === 'answering' && onSelect(option)}
          onMouseEnter={(e) => {
            if (phase === 'answering' && option !== selectedAnswer) {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--bb-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (phase === 'answering' && option !== selectedAnswer) {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--bb-surface-container)';
            }
          }}
        >
          <Box
            style={{
              width: rem(32),
              height: rem(32),
              borderRadius: '50%',
              backgroundColor: phase === 'revealed' && option === correctAnswer
                ? '#16a34a'
                : phase === 'revealed' && option === selectedAnswer && !isCorrect
                  ? '#dc2626'
                  : option === selectedAnswer
                    ? 'var(--bb-primary)'
                    : 'var(--bb-surface-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text fz={rem(13)} fw={800} c={option === selectedAnswer || (phase === 'revealed' && option === correctAnswer) ? 'white' : 'var(--bb-outline)'}>
              {OPTION_LABELS[idx]}
            </Text>
          </Box>
          <Text fz="sm" fw={700} c={getLabelColor(option)} style={{ flex: 1 }}>
            {option}
          </Text>
        </Box>
      ))}
    </Stack>
  );
}
