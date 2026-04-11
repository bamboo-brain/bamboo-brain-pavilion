'use client';
import {
  Drawer,
  Stack,
  Group,
  Text,
  Box,
  UnstyledButton,
  ActionIcon,
  rem,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import type { NotificationType } from '@/types/notification';

const TYPE_EMOJIS: Record<NotificationType, string> = {
  achievement: '🏆',
  processing_complete: '✅',
  tip: '💡',
  system: '⚙️',
  streak_reminder: '🔥',
  adaptation: '🤖',
  plan_due: '📅',
};

interface NotificationDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ opened, onClose }: NotificationDrawerProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = async (id: string, isRead: boolean, actionUrl?: string) => {
    if (!isRead) {
      await markAsRead(id);
    }
    if (actionUrl) {
      router.push(actionUrl);
      onClose();
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={rem(420)}
      padding={0}
      title={
        <Group justify="space-between" p={rem(20)} style={{ borderBottom: '1px solid var(--bb-surface-container)' }}>
          <Box>
            <Text fw={700} fz="lg" c="var(--bb-on-surface)">
              Notifications
            </Text>
            <Text fz="xs" c="var(--bb-on-surface-variant)" mt={rem(2)}>
              {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
            </Text>
          </Box>
          <ActionIcon variant="subtle" color="gray" onClick={onClose} size="lg">
            <IconX size={20} />
          </ActionIcon>
        </Group>
      }
      styles={{
        header: { display: 'none' },
        body: { padding: 0, display: 'flex', flexDirection: 'column' },
        content: { display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* Header */}
      <Group justify="space-between" px={rem(20)} pt={rem(20)} pb={rem(16)}>
        <Box>
          <Text fw={700} fz="lg" c="var(--bb-on-surface)">
            Notifications
          </Text>
          <Text fz="xs" c="var(--bb-on-surface-variant)" mt={rem(2)}>
            {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
          </Text>
        </Box>
        <ActionIcon variant="subtle" color="gray" onClick={onClose} size="lg">
          <IconX size={20} />
        </ActionIcon>
      </Group>

      {unreadCount > 0 && (
        <Group px={rem(20)} pb={rem(12)}>
          <UnstyledButton onClick={markAllAsRead} style={{ marginLeft: 'auto' }}>
            <Text fw={600} fz="sm" c="var(--bb-primary)">
              Mark all as read
            </Text>
          </UnstyledButton>
        </Group>
      )}

      <Divider />

      {/* List */}
      <ScrollArea style={{ flex: 1 }}>
        <Stack gap={rem(8)} px={rem(12)} py={rem(12)}>
          {notifications.length === 0 ? (
            <Box py={rem(60)} style={{ textAlign: 'center' }}>
              <Text fz={rem(40)} mb={rem(16)}>
                🔔
              </Text>
              <Text fw={600} fz="sm" c="var(--bb-on-surface)" mb={rem(4)}>
                No notifications yet
              </Text>
              <Text fz="xs" c="var(--bb-on-surface-variant)">
                We'll notify you about achievements, study tips, and more.
              </Text>
            </Box>
          ) : (
            notifications.map((n) => (
              <Group
                key={n.id}
                wrap="nowrap"
                align="flex-start"
                gap="md"
                p={rem(12)}
                style={{
                  backgroundColor: n.isRead ? 'transparent' : 'rgba(21, 66, 18, 0.03)',
                  borderRadius: 'var(--mantine-radius-md)',
                  borderLeft: n.isRead
                    ? 'none'
                    : `${rem(3)} solid var(--bb-primary)`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => handleNotificationClick(n.id, n.isRead, n.actionUrl)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = n.isRead
                    ? 'transparent'
                    : 'rgba(21, 66, 18, 0.03)')
                }
              >
                {/* Icon */}
                <Box
                  style={{
                    width: rem(40),
                    height: rem(40),
                    borderRadius: 'var(--mantine-radius-md)',
                    backgroundColor: 'var(--bb-surface-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: rem(20),
                    flexShrink: 0,
                  }}
                >
                  {TYPE_EMOJIS[n.type] ?? '📌'}
                </Box>

                {/* Content */}
                <Stack gap={rem(3)} style={{ flex: 1, minWidth: 0 }}>
                  <Group justify="space-between" gap="xs">
                    <Text
                      fw={700}
                      fz="xs"
                      c={n.isRead ? 'var(--bb-on-surface-variant)' : 'var(--bb-on-surface)'}
                      style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}
                    >
                      {n.title}
                    </Text>
                    {n.isRead && (
                      <Text fz={rem(9)} fw={600} c="var(--bb-outline)" tt="uppercase" style={{ flexShrink: 0 }}>
                        Read
                      </Text>
                    )}
                  </Group>
                  <Text
                    fz="xs"
                    c="var(--bb-on-surface-variant)"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {n.message}
                  </Text>
                  <Text fz={rem(10)} fw={600} c="var(--bb-outline)">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </Text>
                </Stack>

                {/* Delete */}
                <ActionIcon
                  color="gray"
                  variant="subtle"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  style={{ flexShrink: 0 }}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            ))
          )}
        </Stack>
      </ScrollArea>
    </Drawer>
  );
}
