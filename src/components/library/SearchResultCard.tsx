'use client';

import { Card, Group, Stack, Text, Badge, Box, rem } from '@mantine/core';
import type { DocumentSearchHit } from '@/types/search';

const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  video: '🎬',
  audio: '🎵',
  ppt: '📊',
};

interface SearchResultCardProps {
  hit: DocumentSearchHit;
  onOpen: () => void;
}

export default function SearchResultCard({ hit, onOpen }: SearchResultCardProps) {
  return (
    <Card
      radius={16}
      p={rem(16)}
      mb={rem(8)}
      style={{
        backgroundColor: 'var(--bb-surface-container-lowest)',
        border: '1px solid var(--bb-surface-container)',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--bb-primary)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(21,66,18,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--bb-surface-container)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Group align="flex-start" gap={rem(12)} wrap="nowrap">
        <Text fz={rem(24)} style={{ flexShrink: 0, lineHeight: 1 }}>
          {FILE_ICONS[hit.documentType] ?? '📄'}
        </Text>

        <Stack gap={rem(8)} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={rem(8)} wrap="nowrap">
            <Text fw={700} fz="sm" truncate style={{ flex: 1 }}>
              {hit.documentTitle}
            </Text>

            {hit.hskLevel != null && (
              <Badge color="green" variant="light" radius="sm" size="xs" fw={800} style={{ flexShrink: 0 }}>
                HSK {hit.hskLevel}
              </Badge>
            )}

            {/* Relevance score bar */}
            <Group gap={rem(4)} style={{ flexShrink: 0 }} wrap="nowrap">
              <Box
                style={{
                  width: rem(48),
                  height: rem(6),
                  backgroundColor: 'var(--bb-surface-container)',
                  borderRadius: rem(4),
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    width: `${Math.round(hit.score * 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--bb-primary)',
                    borderRadius: rem(4),
                  }}
                />
              </Box>
              <Text fz={rem(11)} c="var(--bb-outline)" fw={600}>
                {Math.round(hit.score * 100)}%
              </Text>
            </Group>
          </Group>

          {/* Matching vocabulary words */}
          {hit.topWords.length > 0 && (
            <Group gap={rem(6)} wrap="wrap">
              {hit.topWords.map((word, i) => (
                <Box
                  key={i}
                  title={word.meaning}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: rem(4),
                    padding: `${rem(2)} ${rem(8)}`,
                    backgroundColor: 'var(--bb-surface-container-low)',
                    border: '1px solid var(--bb-surface-container)',
                    borderRadius: rem(20),
                  }}
                >
                  <Text fz={rem(11)} fw={700} c="var(--bb-on-surface)">
                    {word.word}
                  </Text>
                  <Text fz={rem(11)} c="var(--bb-outline)">
                    {word.pinyin}
                  </Text>
                </Box>
              ))}
            </Group>
          )}
        </Stack>
      </Group>
    </Card>
  );
}
