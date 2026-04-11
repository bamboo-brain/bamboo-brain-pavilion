'use client';

import {
  Card,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  ActionIcon,
  Menu,
  rem,
  RingProgress,
} from '@mantine/core';
import { IconDots, IconTrash, IconCards, IconListCheck } from '@tabler/icons-react';
import type { FlashcardDeck } from '@/types/flashcard';

interface DeckCardProps {
  deck: FlashcardDeck;
  onStudy: (deckId: string) => void;
  onDelete: (deckId: string) => void;
  onView?: (deckId: string) => void;
  onQuiz?: (deckId: string) => void;
}

export function DeckCard({ deck, onStudy, onDelete, onView, onQuiz }: DeckCardProps) {
  return (
    <Card
      radius={24}
      p={rem(32)}
      style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}
    >
      <Stack gap={rem(24)}>
        <Group justify="space-between" align="flex-start">
          <Group gap={rem(8)} wrap="wrap" style={{ flex: 1 }}>
            {deck.tags.map((tag) => (
              <Badge key={tag} variant="light" color="gray" size="xs" radius="sm" fw={800}>
                {tag}
              </Badge>
            ))}
          </Group>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {onQuiz && (
                <Menu.Item
                  leftSection={<IconListCheck size={14} />}
                  onClick={() => onQuiz(deck.id)}
                >
                  Quiz Now
                </Menu.Item>
              )}
              <Menu.Item
                leftSection={<IconCards size={14} />}
                onClick={() => onView?.(deck.id)}
              >
                Edit deck
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => onDelete(deck.id)}
              >
                Delete deck
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Stack gap={rem(6)}>
          <Text
            fz={rem(18)}
            fw={800}
            c="var(--bb-on-surface)"
            lineClamp={1}
            style={onView ? { cursor: 'pointer' } : undefined}
            onClick={onView ? () => onView(deck.id) : undefined}
          >
            {deck.name}
          </Text>
          <Text fz="xs" c="var(--bb-on-surface-variant)" lh={1.5} fw={600} lineClamp={2}>
            {deck.description || 'No description'}
          </Text>
        </Stack>

        <Group justify="space-between" align="center">
          <Stack gap={rem(2)}>
            <Text
              fz={rem(24)}
              fw={800}
              c={deck.dueToday > 0 ? '#d9480f' : 'var(--bb-on-surface)'}
            >
              {deck.dueToday}
            </Text>
            <Text fz={rem(11)} fw={700} c="var(--bb-outline)" tt="uppercase" lts={1}>
              Due Today
            </Text>
          </Stack>
          <RingProgress
            size={60}
            thickness={6}
            roundCaps
            sections={[{ value: deck.masteryPercentage, color: 'var(--bb-primary)' }]}
            label={
              <Text fz={rem(10)} fw={800} ta="center">
                {deck.masteryPercentage}%
              </Text>
            }
          />
        </Group>

        <Button
          fullWidth
          radius={12}
          color={deck.dueToday > 0 ? 'var(--bb-primary)' : 'gray'}
          variant={deck.dueToday > 0 ? 'filled' : 'light'}
          fw={800}
          h={rem(48)}
          onClick={() => onStudy(deck.id)}
        >
          {deck.dueToday > 0 ? 'Study Now' : 'All Reviewed'}
        </Button>
      </Stack>
    </Card>
  );
}
