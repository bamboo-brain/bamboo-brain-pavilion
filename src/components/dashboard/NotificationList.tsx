'use client';

import { Stack, Group, Text, Box, ScrollArea, rem, UnstyledButton } from '@mantine/core';
import { IconCircleFilled } from '@tabler/icons-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'achievement' | 'update' | 'system';
}

const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Achievement!',
    message: 'You\'ve completed your 7-day streak! Keep up the momentum.',
    time: '2m ago',
    read: false,
    type: 'achievement',
  },
  {
    id: '2',
    title: 'Processing Complete',
    message: 'Beijing_Travel_Guide_V2.pdf is now ready for review.',
    time: '1h ago',
    read: false,
    type: 'update',
  },
  {
    id: '3',
    title: 'HSK 4 Tip',
    message: 'Try practicing narrative structures today to improve your flow.',
    time: '3h ago',
    read: true,
    type: 'system',
  },
  {
    id: '4',
    title: 'System Update',
    message: 'BambooBrain Pavilion has been updated with better transcription.',
    time: 'Yesterday',
    read: true,
    type: 'system',
  },
];

export function NotificationList() {
  return (
    <Box style={{ width: rem(340) }}>
      <Group justify="space-between" mb={rem(16)} px={rem(16)} pt={rem(16)}>
        <Text fw={800} fz="sm" tt="uppercase" lts={rem(1)}>Notifications</Text>
        <UnstyledButton>
          <Text fz="xs" fw={700} c="var(--bb-primary)">Mark all as read</Text>
        </UnstyledButton>
      </Group>

      <ScrollArea.Autosize mah={400} type="scroll">
        <Stack gap={0}>
          {DUMMY_NOTIFICATIONS.map((notif) => (
            <UnstyledButton
              key={notif.id}
              px={rem(16)}
              py={rem(12)}
              style={{
                transition: 'background-color 0.2s ease',
                backgroundColor: notif.read ? 'transparent' : 'rgba(21, 66, 18, 0.03)',
                borderBottom: '1px solid var(--bb-surface-container)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : 'rgba(21, 66, 18, 0.03)')}
            >
              <Group wrap="nowrap" align="flex-start" gap="sm">
                {!notif.read && (
                  <Box mt={rem(4)}>
                    <IconCircleFilled size={8} color="var(--bb-primary)" />
                  </Box>
                )}
                <Stack gap={rem(2)} flex={1}>
                  <Text fz="sm" fw={700} c="var(--bb-on-surface)">
                    {notif.title}
                  </Text>
                  <Text fz="xs" c="var(--bb-on-surface-variant)" lh={1.4}>
                    {notif.message}
                  </Text>
                  <Text fz={rem(10)} fw={700} c="var(--bb-outline)" mt={rem(4)}>
                    {notif.time}
                  </Text>
                </Stack>
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      </ScrollArea.Autosize>
      
      <UnstyledButton
        w="100%"
        py={rem(12)}
        style={{ textAlign: 'center', borderTop: '1px solid var(--bb-surface-container)' }}
      >
        <Text fz="xs" fw={700} c="var(--bb-outline)">View all history</Text>
      </UnstyledButton>
    </Box>
  );
}
