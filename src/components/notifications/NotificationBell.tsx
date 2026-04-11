'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stack,
  Group,
  Text,
  Box,
  ScrollArea,
  rem,
  UnstyledButton,
  Badge,
  ActionIcon,
  Indicator,
} from '@mantine/core';
import { IconBell, IconCircleFilled, IconX } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/context/NotificationContext';
import type { Notification, NotificationType } from '@/types/notification';

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

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) await markAsRead(n.id);
    if (n.actionUrl) router.push(n.actionUrl);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell button with unread badge */}
      <Indicator
        processing={isConnected}
        color="var(--bb-primary)"
        size={8}
        offset={-4}
        position="bottom-end"
      >
        <ActionIcon
          onClick={() => setIsOpen((prev) => !prev)}
          variant="subtle"
          color="gray"
          size="lg"
        >
          <IconBell size={20} stroke={1.5} />
        </ActionIcon>
      </Indicator>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <Badge
          size="xs"
          variant="filled"
          color="var(--bb-primary)"
          p={2}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            minWidth: rem(20),
            height: rem(20),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            borderRadius: '50%',
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <Box
          style={{
            position: 'absolute',
            right: 0,
            top: rem(50),
            width: rem(340),
            backgroundColor: 'white',
            borderRadius: 'var(--mantine-radius-md)',
            boxShadow: 'var(--mantine-shadow-lg)',
            border: '1px solid var(--bb-surface-container)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Group
            justify="space-between"
            mb={rem(12)}
            px={rem(16)}
            pt={rem(16)}
            pb={rem(8)}
            style={{
              borderBottom: '1px solid var(--bb-surface-container)',
            }}
          >
            <Text fw={800} fz="sm" tt="uppercase" lts={rem(1)} c="var(--bb-on-surface-variant)">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <UnstyledButton onClick={markAllAsRead}>
                <Text fz="xs" fw={700} c="var(--bb-primary)">
                  Mark all as read
                </Text>
              </UnstyledButton>
            )}
          </Group>

          {/* List */}
          <ScrollArea.Autosize mah={400} type="scroll">
            <Stack gap={0}>
              {notifications.length === 0 ? (
                <Box py={rem(40)} px={rem(16)} style={{ textAlign: 'center' }}>
                  <Text fz="sm" c="var(--bb-on-surface-variant)">
                    No notifications yet
                  </Text>
                </Box>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <Group
                    key={n.id}
                    wrap="nowrap"
                    align="flex-start"
                    gap="sm"
                    px={rem(16)}
                    py={rem(12)}
                    style={{
                      transition: 'background-color 0.2s ease',
                      backgroundColor: n.isRead ? 'transparent' : 'rgba(21, 66, 18, 0.03)',
                      borderBottom: '1px solid var(--bb-surface-container)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = n.isRead
                        ? 'transparent'
                        : 'rgba(21, 66, 18, 0.03)')
                    }
                    onClick={() => handleClick(n)}
                  >
                    {/* Unread dot */}
                    {!n.isRead && (
                      <Box mt={rem(4)} style={{ flexShrink: 0 }}>
                        <IconCircleFilled size={8} color="var(--bb-primary)" />
                      </Box>
                    )}

                    {/* Content */}
                    <Stack gap={rem(2)} style={{ flex: 1, minWidth: 0 }}>
                      <Text fz="sm" fw={700} c="var(--bb-on-surface)">
                        {TYPE_EMOJIS[n.type] ?? '📌'} {n.title}
                      </Text>
                      <Text
                        fz="xs"
                        c="var(--bb-on-surface-variant)"
                        lh={1.4}
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
                      <Text fz={rem(10)} fw={700} c="var(--bb-outline)" mt={rem(4)}>
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </Text>
                    </Stack>

                    {/* Delete button */}
                    <ActionIcon
                      color="gray"
                      variant="subtle"
                      size="xs"
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
          </ScrollArea.Autosize>

          {/* Footer */}
          <Box
            style={{
              borderTop: '1px solid var(--bb-surface-container)',
              padding: `${rem(12)} ${rem(16)}`,
              textAlign: 'center',
            }}
          >
            <UnstyledButton
              onClick={() => {
                setIsOpen(false);
                router.push('/notifications');
              }}
            >
              <Text fz="sm" c="var(--bb-on-surface-variant)" fw={500}>
                View all history
              </Text>
            </UnstyledButton>
          </Box>
        </Box>
      )}
    </div>
  );
}
