'use client';
import { useState } from 'react';
import {
  ActionIcon,
  Popover,
  Stack,
  UnstyledButton,
  rem,
  Box,
  Text,
} from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';

interface UnifiedChatLauncherProps {
  onOpenAdvisor: () => void;
  onOpenRagChat: () => void;
}

export default function UnifiedChatLauncher({
  onOpenAdvisor,
  onOpenRagChat,
}: UnifiedChatLauncherProps) {
  const [opened, setOpened] = useState(false);

  const handleAdvisor = () => {
    onOpenAdvisor();
    setOpened(false);
  };

  const handleRagChat = () => {
    onOpenRagChat();
    setOpened(false);
  };

  return (
    <Popover
      position="top-end"
      withArrow={false}
      shadow="md"
      opened={opened}
      onChange={setOpened}
      middlewares={{ flip: true, shift: true }}
    >
      <Popover.Target>
        <ActionIcon
          size="xl"
          radius="100%"
          style={{
            position: 'fixed',
            bottom: rem(24),
            right: rem(24),
            zIndex: 40,
            backgroundColor: 'var(--bb-primary)',
            color: 'white',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
          }}
          onClick={() => setOpened(!opened)}
        >
          <IconMessage size={24} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown
        style={{
          backgroundColor: 'var(--bb-surface-container-low)',
          border: '1px solid var(--bb-outline)',
          borderRadius: rem(12),
          padding: rem(8),
          zIndex: 9999,
        }}
      >
        <Stack gap={rem(4)}>
          <UnstyledButton
            onClick={handleAdvisor}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: rem(8),
              padding: rem(12),
              borderRadius: rem(12),
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bb-surface-container)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ fontSize: rem(18) }}>🎓</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <Text fz={rem(14)} fw={600} c="var(--bb-on-surface)">
                Ask Master Ling
              </Text>
              <Text fz={rem(11)} c="var(--bb-outline)">
                Study & Plan
              </Text>
            </div>
          </UnstyledButton>

          <UnstyledButton
            onClick={handleRagChat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: rem(8),
              padding: rem(12),
              borderRadius: rem(12),
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bb-surface-container)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ fontSize: rem(18) }}>📚</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <Text fz={rem(14)} fw={600} c="var(--bb-on-surface)">
                Ask about Documents
              </Text>
              <Text fz={rem(11)} c="var(--bb-outline)">
                Library Q&A
              </Text>
            </div>
          </UnstyledButton>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
