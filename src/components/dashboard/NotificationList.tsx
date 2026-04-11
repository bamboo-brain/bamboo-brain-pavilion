'use client';

import { Stack, Group, Text, Box, ScrollArea, rem, UnstyledButton, ActionIcon } from '@mantine/core';
import { IconCircleFilled, IconX } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import type { NotificationType } from '@/types/notification';

// Icon per notification type
const TYPE_EMOJIS: Record<NotificationType, string> = {
  achievement: '🏆',
  processing_complete: '✅',
  tip: '💡',
  system: '⚙️',
  streak_reminder: '🔥',
  adaptation: '🤖',
  plan_due: '📅',
};

export function NotificationList({ onDrawerOpen }: { onDrawerOpen?: () => void }) {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const handleNotificationClick = async (id: string, isRead: boolean, actionUrl?: string) => {
    if (!isRead) {
      await markAsRead(id);
    }
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  return (
    <>
      <Box style={{ width: rem(340) }}>
        <Group justify="space-between" mb={rem(16)} px={rem(16)} pt={rem(16)}>
          <Text fw={800} fz="sm" tt="uppercase" lts={rem(1)}>Notifications</Text>
          {notifications.length > 0 && (
            <UnstyledButton onClick={markAllAsRead}>
              <Text fz="xs" fw={700} c="var(--bb-primary)">Mark all as read</Text>
            </UnstyledButton>
          )}
        </Group>

        <ScrollArea.Autosize mah={400} type="scroll">
          <Stack gap={0}>
            {notifications.length === 0 ? (
              <Box py={rem(24)} px={rem(16)} style={{ textAlign: 'center' }}>
                <Text fz="sm" c="var(--bb-on-surface-variant)">
                  No notifications yet
                </Text>
              </Box>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <Group
                  key={notif.id}
                  wrap="nowrap"
                  align="flex-start"
                  gap="sm"
                  px={rem(16)}
                  py={rem(12)}
                  style={{
                    transition: 'background-color 0.2s ease',
                    backgroundColor: notif.isRead ? 'transparent' : 'rgba(21, 66, 18, 0.03)',
                    borderBottom: '1px solid var(--bb-surface-container)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = notif.isRead ? 'transparent' : 'rgba(21, 66, 18, 0.03)')}
                  onClick={() => handleNotificationClick(notif.id, notif.isRead, notif.actionUrl)}
                >
                  {!notif.isRead && (
                    <Box mt={rem(4)} style={{ flexShrink: 0 }}>
                      <IconCircleFilled size={8} color="var(--bb-primary)" />
                    </Box>
                  )}
                  <Stack gap={rem(2)} flex={1} style={{ minWidth: 0 }}>
                    <Text fz="sm" fw={700} c="var(--bb-on-surface)">
                      {TYPE_EMOJIS[notif.type] ?? '📌'} {notif.title}
                    </Text>
                    <Text fz="xs" c="var(--bb-on-surface-variant)" lh={1.4} style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {notif.message}
                    </Text>
                    <Text fz={rem(10)} fw={700} c="var(--bb-outline)" mt={rem(4)}>
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </Text>
                  </Stack>

                  {/* Delete button */}
                  <ActionIcon
                    color="gray"
                    variant="subtle"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    style={{ flexShrink: 0 }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              ))
            )}
          </Stack>
        </ScrollArea.Autosize>
        
        <UnstyledButton
          w="100%"
          py={rem(12)}
          style={{ textAlign: 'center', borderTop: '1px solid var(--bb-surface-container)' }}
          onClick={() => onDrawerOpen?.()}
        >
          <Text fz="xs" fw={700} c="var(--bb-outline)">View all history</Text>
        </UnstyledButton>
      </Box>

    </>
  );
}
