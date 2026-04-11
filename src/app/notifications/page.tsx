'use client';
import { useRouter } from 'next/navigation';
import {
  Stack,
  Group,
  Text,
  Box,
  UnstyledButton,
  ActionIcon,
  Container,
  rem,
  Divider,
} from '@mantine/core';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
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

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <Container size="md">
      <Stack gap={rem(32)}>
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => router.back()}
              size="lg"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Box>
              <Text fw={700} fz={rem(28)} c="var(--bb-on-surface)">
                Notifications
              </Text>
              <Text fz="sm" c="var(--bb-on-surface-variant)" mt={rem(4)}>
                {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
              </Text>
            </Box>
          </Group>
          {unreadCount > 0 && (
            <UnstyledButton onClick={markAllAsRead}>
              <Text fw={600} c="var(--bb-primary)">
                Mark all as read
              </Text>
            </UnstyledButton>
          )}
        </Group>

        <Divider />

        {/* List */}
        <Stack gap={rem(12)}>
          {notifications.length === 0 ? (
            <Box py={rem(60)} style={{ textAlign: 'center' }}>
              <Text fz={rem(48)} mb={rem(16)}>
                🔔
              </Text>
              <Text fw={600} fz="lg" c="var(--bb-on-surface)" mb={rem(8)}>
                No notifications yet
              </Text>
              <Text fz="sm" c="var(--bb-on-surface-variant)">
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
                p={rem(16)}
                style={{
                  backgroundColor: n.isRead ? 'transparent' : 'rgba(21, 66, 18, 0.03)',
                  borderRadius: 'var(--mantine-radius-md)',
                  borderLeft: n.isRead
                    ? 'none'
                    : `${rem(3)} solid var(--bb-primary)`,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (!n.isRead) markAsRead(n.id);
                  if (n.actionUrl) router.push(n.actionUrl);
                }}
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
                    width: rem(48),
                    height: rem(48),
                    borderRadius: 'var(--mantine-radius-md)',
                    backgroundColor: 'var(--bb-surface-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: rem(24),
                    flexShrink: 0,
                  }}
                >
                  {TYPE_EMOJIS[n.type] ?? '📌'}
                </Box>

                {/* Content */}
                <Stack gap={rem(4)} style={{ flex: 1, minWidth: 0 }}>
                  <Group justify="space-between">
                    <Text
                      fw={700}
                      fz="sm"
                      c={n.isRead ? 'var(--bb-on-surface-variant)' : 'var(--bb-on-surface)'}
                    >
                      {n.title}
                    </Text>
                    {n.isRead && (
                      <Text fz={rem(11)} fw={600} c="var(--bb-outline)" tt="uppercase">
                        Read
                      </Text>
                    )}
                  </Group>
                  <Text
                    fz="sm"
                    c="var(--bb-on-surface-variant)"
                    lh={1.5}
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {n.message}
                  </Text>
                  <Text fz={rem(12)} fw={600} c="var(--bb-outline)">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </Text>
                </Stack>

                {/* Delete */}
                <ActionIcon
                  color="gray"
                  variant="subtle"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  style={{ flexShrink: 0 }}
                >
                  <IconX size={18} />
                </ActionIcon>
              </Group>
            ))
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
