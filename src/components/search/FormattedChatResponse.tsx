'use client';

import { Box, Text, Stack, Group, Badge, rem } from '@mantine/core';

interface FormattedChatResponseProps {
  content: string;
}

export default function FormattedChatResponse({ content }: FormattedChatResponseProps) {
  // Check if content looks like a numbered list (1. 2. 3.)
  const isNumberedList = /^\d+\.\s/.test(content.trim());

  if (!isNumberedList) {
    // For regular text responses, just render as-is with better line height
    return (
      <Text fz="sm" c="var(--bb-on-surface)" lh={1.6}>
        {content}
      </Text>
    );
  }

  // Extract intro text (everything before first "1.")
  const introMatch = content.match(/^([^1]*?)(?=\n?\d+\.)/);
  const intro = introMatch?.[1]?.trim();

  // Split by number pattern: "1. ", "2. ", etc.
  // This regex captures: "N. **word (pinyin)** - meaning - From Source X: "example""
  const itemPattern =
    /(\d+)\.\s+\*\*([^*]+)\*\*\s*-\s*([^-]+)\s*-\s*From\s+Source\s+(\d+):\s+"([^"]+)"/g;

  const items: Array<{
    num: number;
    term: string;
    meaning: string;
    sourceNum: number;
    example: string;
  }> = [];

  let match;
  while ((match = itemPattern.exec(content)) !== null) {
    items.push({
      num: parseInt(match[1]),
      term: match[2].trim(),
      meaning: match[3].trim(),
      sourceNum: parseInt(match[4]),
      example: match[5].trim(),
    });
  }

  // Fallback: if regex didn't match, try simpler splitting
  if (items.length === 0) {
    const simpleSplit = content.split(/\n\d+\.\s+/).slice(1);
    simpleSplit.forEach((item, idx) => {
      // Try to extract: **word** - meaning - From Source X
      const simpleMatch = item.match(
        /\*\*([^*]+)\*\*\s*-\s*([^-]+)\s*(?:-\s*From\s+Source\s+(\d+):\s+"([^"]+)")?/
      );
      if (simpleMatch) {
        items.push({
          num: idx + 1,
          term: simpleMatch[1].trim(),
          meaning: simpleMatch[2].trim(),
          sourceNum: parseInt(simpleMatch[3] || '1'),
          example: simpleMatch[4]?.trim() || 'No example',
        });
      }
    });
  }

  return (
    <Stack gap={rem(12)}>
      {/* Introduction text */}
      {intro && (
        <Text fz="sm" c="var(--bb-on-surface)" lh={1.6} fw={500}>
          {intro}
        </Text>
      )}

      {/* Word list as cards */}
      {items.length > 0 ? (
        <Stack gap={rem(8)}>
          {items.map((item) => (
            <Box
              key={item.num}
              p={rem(12)}
              style={{
                backgroundColor: 'var(--bb-surface-container-lowest)',
                border: '1px solid var(--bb-surface-container)',
                borderRadius: rem(10),
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8f5e0';
                e.currentTarget.style.borderColor = 'var(--bb-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-lowest)';
                e.currentTarget.style.borderColor = 'var(--bb-surface-container)';
              }}
            >
              {/* Word number and term */}
              <Group justify="space-between" align="flex-start" mb={rem(8)}>
                <Group gap={rem(8)} align="flex-start">
                  <Badge size="sm" variant="light" color="var(--bb-primary)" style={{ marginTop: rem(2) }}>
                    {item.num}
                  </Badge>
                  <div>
                    <Text fw={700} fz="sm" c="var(--bb-on-surface)">
                      {item.term}
                    </Text>
                  </div>
                </Group>
                <Badge size="xs" variant="outline" color="gray">
                  Source {item.sourceNum}
                </Badge>
              </Group>

              {/* Meaning */}
              <Text fz={rem(12)} c="var(--bb-outline)" mb={rem(8)}>
                {item.meaning}
              </Text>

              {/* Example usage */}
              <Box
                p={rem(10)}
                style={{
                  backgroundColor: 'var(--bb-surface-container-low)',
                  borderRadius: rem(6),
                  fontSize: rem(11),
                  fontStyle: 'italic',
                  color: 'var(--bb-on-surface)',
                  lineHeight: 1.5,
                  borderLeft: '3px solid var(--bb-primary)',
                }}
              >
                "{item.example}"
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <Text fz="sm" c="var(--bb-on-surface)" lh={1.6}>
          {content}
        </Text>
      )}
    </Stack>
  );
}

