'use client';

import { useEffect } from 'react';
import { Stack, Text, Box, ActionIcon, rem } from '@mantine/core';
import { IconVolume } from '@tabler/icons-react';
import type { QuizQuestion } from '@/types/quiz';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface ListeningProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  phase: 'answering' | 'revealed';
  correctAnswer?: string;
  isCorrect?: boolean;
}

export function Listening({
  question,
  selectedAnswer,
  onSelect,
  phase,
  correctAnswer,
  isCorrect,
}: ListeningProps) {
  const audioText = question.audioText ?? question.word;

  function playAudio() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(audioText);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  // Auto-play when question first appears
  useEffect(() => {
    if (phase === 'answering') {
      const t = setTimeout(playAudio, 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  function getOptionStyle(option: string): React.CSSProperties {
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

    if (option === correctAnswer) {
      return { ...base, borderColor: '#16a34a', backgroundColor: '#f0fdf4', cursor: 'default' };
    }
    if (option === selectedAnswer && !isCorrect) {
      return { ...base, borderColor: '#dc2626', backgroundColor: '#fef2f2', cursor: 'default' };
    }
    return { ...base, borderColor: 'var(--bb-surface-container)', backgroundColor: 'var(--bb-surface-container-lowest)', opacity: 0.45, cursor: 'default' };
  }

  return (
    <Stack gap={rem(24)} align="center">
      {/* Play button */}
      <Stack align="center" gap={rem(12)}>
        <ActionIcon
          size={rem(72)}
          radius="50%"
          onClick={playAudio}
          style={{
            backgroundColor: 'var(--bb-surface-container-low)',
            border: '2px solid var(--bb-surface-container)',
            color: 'var(--bb-primary)',
          }}
        >
          <IconVolume size={32} />
        </ActionIcon>
        <Text fz="xs" fw={600} c="var(--bb-outline)">
          Tap to play again
        </Text>
      </Stack>

      {/* Options */}
      <Stack gap={rem(10)} style={{ width: '100%' }}>
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
            <Text
              fz={rem(20)}
              fw={700}
              c={
                phase === 'revealed' && option === correctAnswer ? '#15803d'
                  : phase === 'revealed' && option === selectedAnswer && !isCorrect ? '#dc2626'
                  : option === selectedAnswer ? 'var(--bb-primary)'
                  : 'var(--bb-on-surface)'
              }
              style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
            >
              {option}
            </Text>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
