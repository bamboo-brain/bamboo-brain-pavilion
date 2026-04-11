'use client';

import { useState } from 'react';
import { Box, Text, Button, Stack, rem } from '@mantine/core';
import { adaptPlan } from '@/lib/api/planner';

interface AdaptationBannerProps {
  planId: string;
  accessToken: string;
  lastAgentNote?: string;
  onAdapted: (note: string) => void;
}

export function AdaptationBanner({ planId, accessToken, lastAgentNote, onAdapted }: AdaptationBannerProps) {
  const [isAdapting, setIsAdapting] = useState(false);
  const [adapted, setAdapted] = useState(false);

  async function handleAdapt() {
    setIsAdapting(true);
    try {
      const updated = await adaptPlan(planId, accessToken);
      const note = updated.agentNotes?.[updated.agentNotes.length - 1]?.message ?? 'Your plan has been updated.';
      setAdapted(true);
      onAdapted(note);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdapting(false);
    }
  }

  if (adapted && lastAgentNote) {
    return (
      <Box
        p={rem(16)}
        style={{
          borderRadius: rem(16),
          backgroundColor: 'rgba(21,66,18,0.04)',
          border: '1px solid rgba(21,66,18,0.15)',
        }}
      >
        <Text fz="sm" fw={600} c="var(--bb-on-surface)">
          🤖 <Text span fw={800}>Master Ling:</Text> {lastAgentNote}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      p={rem(16)}
      style={{
        borderRadius: rem(16),
        backgroundColor: 'rgba(251,191,36,0.08)',
        border: '1px solid rgba(251,191,36,0.3)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: rem(12),
      }}
    >
      <Text fz={rem(24)} style={{ flexShrink: 0 }}>🤖</Text>
      <Stack gap={rem(8)} style={{ flex: 1 }}>
        <Text fz="sm" fw={800} c="#92400e">Master Ling wants to review your progress</Text>
        <Text fz="xs" fw={500} c="#b45309">
          It&apos;s been a week since your plan was last updated. Let the AI adapt your schedule based on your recent performance.
        </Text>
      </Stack>
      <Button
        size="xs"
        radius={8}
        h={rem(36)}
        fw={800}
        loading={isAdapting}
        onClick={handleAdapt}
        style={{ backgroundColor: '#d97706', color: 'white', flexShrink: 0 }}
      >
        {isAdapting ? 'Adapting...' : 'Adapt My Plan'}
      </Button>
    </Box>
  );
}
