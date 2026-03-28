'use client';

import React from 'react';
import { Group, ThemeIcon, Text } from '@mantine/core';
import styles from './FeaturePill.module.css';

interface FeaturePillProps {
  icon: React.ReactNode;
  label: string;
}

export function FeaturePill({ icon, label }: FeaturePillProps) {
  return (
    <Group gap="md" wrap="nowrap" className={styles.featurePill}>
      <ThemeIcon size={34} radius="md" className={styles.featureIcon}>
        {icon}
      </ThemeIcon>
      <Text size="sm" fw={500} c="white" style={{ letterSpacing: '0.015em', lineBreak: 'anywhere' }}>
        {label}
      </Text>
    </Group>
  );
}
