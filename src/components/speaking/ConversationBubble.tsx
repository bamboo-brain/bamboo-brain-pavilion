'use client';

import { Box, Text, Badge, ActionIcon, Group, rem } from '@mantine/core';
import { IconVolume } from '@tabler/icons-react';
import type { ConversationTurn } from '@/types/speaking';

interface ConversationBubbleProps {
  turn: ConversationTurn;
  userName?: string;
}

export function ConversationBubble({ turn, userName = 'YOU' }: ConversationBubbleProps) {
  const isAI = turn.role === 'ai';

  function playAudio() {
    if (turn.audioUrl) {
      new Audio(turn.audioUrl).play();
    }
  }

  // Highlight corrected words in orange
  let highlightedText = turn.text;
  if (turn.toneCorrections.length > 0) {
    highlightedText = turn.toneCorrections.reduce((text, correction) => {
      return text.replace(
        correction.word,
        `<span style="color: #d9480f; font-weight: 600;">${correction.word}</span>`,
      );
    }, turn.text);
  }

  return (
    <Box
      p={rem(20)}
      style={{
        borderRadius: 16,
        backgroundColor: isAI ? 'var(--bb-surface-container-low)' : 'var(--bb-surface-container-lowest)',
        border: isAI
          ? '2px solid var(--bb-surface-container)'
          : '1px solid var(--bb-surface-container)',
        borderLeft: isAI ? `3px solid var(--bb-primary)` : undefined,
      }}
    >
      <Group justify="space-between" mb={rem(10)}>
        <Badge
          variant="dot"
          color={isAI ? 'blue' : 'green'}
          size="sm"
          fw={700}
        >
          {isAI ? 'MASTER LING' : userName}
        </Badge>
        {isAI && turn.audioUrl && (
          <ActionIcon variant="subtle" size="sm" color="gray" onClick={playAudio}>
            <IconVolume size={16} />
          </ActionIcon>
        )}
      </Group>

      <Text
        className="hanzi"
        fz={rem(20)}
        fw={500}
        c="var(--bb-on-surface)"
        mb={rem(6)}
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />

      {turn.pinyin && (
        <Text fz="sm" fw={600} c="var(--bb-on-surface-variant)" mb={rem(4)}>
          {turn.pinyin}
        </Text>
      )}

      {turn.translation && (
        <Text fz="sm" fw={500} c="var(--bb-outline)" fs="italic">
          {turn.translation}
        </Text>
      )}

      {turn.toneCorrections.map((correction, i) => (
        <Box
          key={i}
          mt={rem(10)}
          p={rem(10)}
          style={{
            backgroundColor: 'rgba(217, 72, 15, 0.05)',
            borderLeft: '4px solid #d9480f',
            borderRadius: '0 8px 8px 0',
          }}
        >
          <Text fz={rem(12)} fw={700} c="#d9480f">
            🎤 TONE CORRECTION:{' '}
            <Text span fw={500} c="#d9480f" fz={rem(12)}>
              {correction.message}
            </Text>
          </Text>
        </Box>
      ))}
    </Box>
  );
}
