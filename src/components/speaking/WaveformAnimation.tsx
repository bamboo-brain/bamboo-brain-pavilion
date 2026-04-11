'use client';

import { useEffect, useRef, useState } from 'react';
import { Group, rem } from '@mantine/core';

interface WaveformAnimationProps {
  isActive: boolean;
  level: number;
  barCount?: number;
}

export function WaveformAnimation({
  isActive,
  level,
  barCount = 20,
}: WaveformAnimationProps) {
  const [tick, setTick] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const animate = () => {
      setTick(Date.now());
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isActive]);

  const bars = Array.from({ length: barCount });
  const baseHeight = 8;
  const maxHeight = 48;

  return (
    <Group gap={rem(2)} justify="center" align="flex-end" h={rem(maxHeight)}>
      {bars.map((_, i) => {
        const variance = Math.sin(i * 0.5 + tick * 0.005) * 0.5 + 0.5;
        const height = isActive
          ? baseHeight + (maxHeight - baseHeight) * Math.max(0.1, level) * variance
          : baseHeight;

        return (
          <div
            key={i}
            style={{
              width: rem(3),
              height: rem(height),
              backgroundColor: 'var(--bb-primary)',
              borderRadius: rem(2),
              opacity: isActive ? 0.8 : 0.3,
              transition: isActive ? 'none' : 'height 0.3s ease, opacity 0.3s ease',
            }}
          />
        );
      })}
    </Group>
  );
}
