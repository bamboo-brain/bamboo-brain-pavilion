'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Title,
  Text,
  Stack,
  Group,
  Card,
  Button,
  Box,
  Badge,
  rem,
  TextInput,
  ActionIcon,
  Skeleton,
  Table,
} from '@mantine/core';
import { IconArrowLeft, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AddCardModal } from '@/components/flashcards/AddCardModal';
import { getDeck, addCard, removeCard } from '@/lib/flashcards';
import type { FlashcardDeck, Flashcard, AddCardRequest } from '@/types/flashcard';

export default function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? '';

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !deckId) return;
    getDeck(deckId, accessToken)
      .then(setDeck)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken, deckId]);

  async function handleAddCard(request: AddCardRequest) {
    const updated = await addCard(deckId, request, accessToken);
    setDeck(updated);
  }

  async function handleRemoveCard(cardId: string) {
    setRemovingId(cardId);
    try {
      await removeCard(deckId, cardId, accessToken);
      setDeck((prev) =>
        prev ? { ...prev, cards: prev.cards.filter((c) => c.id !== cardId), totalCards: prev.totalCards - 1 } : prev,
      );
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingId(null);
    }
  }

  const filtered = (deck?.cards ?? []).filter(
    (c) =>
      c.word.includes(search) ||
      c.pinyin.toLowerCase().includes(search.toLowerCase()) ||
      c.meaning.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppLayout
      title={
        loading ? (
          <Skeleton height={rem(32)} width={200} radius={8} />
        ) : (
          <Group gap="sm">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={() => router.push('/study-center')}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={1} fz={rem(28)} fw={800} c="var(--bb-on-surface)">
              {deck?.name}
            </Title>
          </Group>
        )
      }
    >
      <Stack gap={rem(32)}>
        {/* Stats bar */}
        {loading ? (
          <Skeleton height={rem(60)} radius={16} />
        ) : deck ? (
          <Card
            radius={16}
            p={rem(24)}
            style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}
          >
            <Group gap={rem(32)} wrap="wrap">
              <Stack gap={rem(2)}>
                <Text fz={rem(22)} fw={800} c="var(--bb-on-surface)">
                  {deck.totalCards}
                </Text>
                <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase" lts={1}>
                  Total Cards
                </Text>
              </Stack>
              <Stack gap={rem(2)}>
                <Text
                  fz={rem(22)}
                  fw={800}
                  c={deck.dueToday > 0 ? '#d9480f' : 'var(--bb-on-surface)'}
                >
                  {deck.dueToday}
                </Text>
                <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase" lts={1}>
                  Due Today
                </Text>
              </Stack>
              <Stack gap={rem(2)}>
                <Text fz={rem(22)} fw={800} c="var(--bb-primary)">
                  {deck.masteryPercentage}%
                </Text>
                <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase" lts={1}>
                  Mastery
                </Text>
              </Stack>
              {deck.tags.length > 0 && (
                <Group gap={rem(6)}>
                  {deck.tags.map((tag) => (
                    <Badge key={tag} variant="light" color="gray" size="sm" radius="sm" fw={800}>
                      {tag}
                    </Badge>
                  ))}
                </Group>
              )}
              <Box style={{ marginLeft: 'auto' }}>
                <Button
                  className="bb-btn-primary"
                  radius={12}
                  fw={800}
                  h={rem(44)}
                  disabled={deck.dueToday === 0}
                  onClick={() => router.push(`/study-center/${deckId}/study`)}
                >
                  Study Now ({deck.dueToday} due)
                </Button>
              </Box>
            </Group>
          </Card>
        ) : null}

        {/* Controls */}
        <Group justify="space-between" align="center">
          <TextInput
            placeholder="Search cards…"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius={10}
            style={{ width: rem(280) }}
          />
          <Button
            variant="light"
            color="green"
            radius={10}
            fw={800}
            leftSection={<IconPlus size={16} />}
            onClick={() => setAddCardOpen(true)}
          >
            Add Card
          </Button>
        </Group>

        {/* Cards table */}
        {loading ? (
          <Stack gap={rem(12)}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={rem(52)} radius={12} />
            ))}
          </Stack>
        ) : filtered.length === 0 ? (
          <Card
            radius={24}
            p={rem(48)}
            style={{
              backgroundColor: 'var(--bb-surface-container-lowest)',
              border: '2px dashed var(--bb-surface-container)',
              textAlign: 'center',
            }}
          >
            <Stack align="center" gap={rem(12)}>
              <Text fw={800} fz="lg" c="var(--bb-on-surface)">
                {search ? 'No cards match your search' : 'No cards yet'}
              </Text>
              {!search && (
                <Button
                  variant="light"
                  color="green"
                  radius={10}
                  fw={800}
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setAddCardOpen(true)}
                >
                  Add your first card
                </Button>
              )}
            </Stack>
          </Card>
        ) : (
          <Card
            radius={16}
            p={0}
            style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none', overflow: 'hidden' }}
          >
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 800, fontSize: rem(12), textTransform: 'uppercase', letterSpacing: 1 }}>
                    Word
                  </Table.Th>
                  <Table.Th style={{ fontWeight: 800, fontSize: rem(12), textTransform: 'uppercase', letterSpacing: 1 }}>
                    Pinyin
                  </Table.Th>
                  <Table.Th style={{ fontWeight: 800, fontSize: rem(12), textTransform: 'uppercase', letterSpacing: 1 }}>
                    Meaning
                  </Table.Th>
                  <Table.Th style={{ fontWeight: 800, fontSize: rem(12), textTransform: 'uppercase', letterSpacing: 1 }}>
                    HSK
                  </Table.Th>
                  <Table.Th style={{ width: rem(48) }} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((card) => (
                  <Table.Tr key={card.id}>
                    <Table.Td>
                      <Text
                        fz={rem(18)}
                        fw={700}
                        style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
                      >
                        {card.word}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz="sm" fw={600} c="var(--bb-primary)">
                        {card.pinyin}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz="sm" fw={600} c="var(--bb-on-surface-variant)" lineClamp={1}>
                        {card.meaning}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {card.hskLevel != null && (
                        <Badge variant="light" color="gray" size="xs" radius="sm" fw={800}>
                          HSK {card.hskLevel}
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        loading={removingId === card.id}
                        onClick={() => handleRemoveCard(card.id)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}
      </Stack>

      <AddCardModal
        isOpen={addCardOpen}
        onClose={() => setAddCardOpen(false)}
        onAdd={handleAddCard}
      />
    </AppLayout>
  );
}
