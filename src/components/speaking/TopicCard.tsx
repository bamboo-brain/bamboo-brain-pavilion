'use client';

import { Box, Text, Badge, rem } from '@mantine/core';
import type { SuggestedTopic } from '@/types/speaking';

interface TopicCardProps {
  topic: SuggestedTopic;
  isSelected: boolean;
  onSelect: (topic: SuggestedTopic) => void;
}

function hskBadgeColor(level: number) {
  if (level <= 2) return 'green';
  if (level <= 4) return 'blue';
  return 'violet';
}

export function TopicCard({ topic, isSelected, onSelect }: TopicCardProps) {
  return (
    <Box
      onClick={() => onSelect(topic)}
      p={rem(16)}
      style={{
        borderRadius: 12,
        border: `2px solid ${isSelected ? 'var(--bb-primary)' : 'var(--bb-surface-container)'}`,
        backgroundColor: isSelected ? 'rgba(21, 66, 18, 0.04)' : 'var(--bb-surface-container-lowest)',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: rem(8) }}>
        <Box style={{ display: 'flex', alignItems: 'flex-start', gap: rem(12) }}>
          <Text fz={rem(28)} style={{ lineHeight: 1, flexShrink: 0, marginTop: rem(2) }}>
            {topic.emoji}
          </Text>
          <Box>
            <Text fw={700} fz="sm" c="var(--bb-on-surface)">{topic.topic}</Text>
            <Text fz="xs" fw={500} c="var(--bb-outline)" mt={rem(2)}>{topic.description}</Text>
          </Box>
        </Box>
        <Badge
          color={hskBadgeColor(topic.hskLevel)}
          variant="light"
          size="xs"
          fw={800}
          radius="sm"
          style={{ flexShrink: 0 }}
        >
          HSK {topic.hskLevel}
        </Badge>
      </Box>
    </Box>
  );
}
