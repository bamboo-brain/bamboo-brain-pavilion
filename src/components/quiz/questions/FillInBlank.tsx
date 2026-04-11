'use client';

import { useState, useEffect, useRef } from 'react';
import { Stack, Text, TextInput, Group, Box, rem } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import type { QuizQuestion } from '@/types/quiz';

interface FillInBlankProps {
  question: QuizQuestion;
  onSubmit: (answer: string) => void;
  phase: 'answering' | 'revealed';
  correctAnswer: string;
  isCorrect?: boolean;
}

export function FillInBlank({ question, onSubmit, phase, correctAnswer, isCorrect }: FillInBlankProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when question appears
  useEffect(() => {
    if (phase === 'answering') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [question.id, phase]);

  // Reset value when question changes
  useEffect(() => {
    setValue('');
  }, [question.id]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && phase === 'answering' && value.trim()) {
      e.preventDefault();
      e.stopPropagation();
      onSubmit(value.trim());
    }
  }

  const borderColor = phase === 'revealed'
    ? isCorrect ? '#16a34a' : '#dc2626'
    : undefined;

  return (
    <Stack gap={rem(24)}>
      <TextInput
        ref={inputRef}
        value={value}
        onChange={(e) => phase === 'answering' && setValue(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type the Chinese word…"
        disabled={phase === 'revealed'}
        size="lg"
        radius={14}
        styles={{
          input: {
            fontFamily: "'Noto Sans SC', sans-serif",
            fontSize: rem(24),
            textAlign: 'center',
            borderColor,
            borderWidth: phase === 'revealed' ? 2 : undefined,
          },
        }}
      />

      {phase === 'answering' && (
        <Text fz="xs" fw={600} c="var(--bb-outline)" ta="center">
          💡 Switch to Chinese input (IME) · Press Enter to submit
        </Text>
      )}

      {phase === 'revealed' && (
        <Box
          p={rem(16)}
          style={{
            borderRadius: rem(12),
            backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          <Group gap={rem(8)} align="center">
            <Box
              style={{
                width: rem(28),
                height: rem(28),
                borderRadius: '50%',
                backgroundColor: isCorrect ? '#16a34a' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isCorrect
                ? <IconCheck size={16} color="white" />
                : <IconX size={16} color="white" />}
            </Box>
            <Stack gap={rem(2)}>
              <Text fz="sm" fw={800} c={isCorrect ? '#15803d' : '#dc2626'}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Text>
              <Text fz="sm" fw={600} c="var(--bb-on-surface-variant)">
                Answer: <span style={{ fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 700 }}>{correctAnswer}</span>
              </Text>
            </Stack>
          </Group>
        </Box>
      )}
    </Stack>
  );
}
