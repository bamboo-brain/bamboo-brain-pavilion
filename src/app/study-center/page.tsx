'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Title,
  Text,
  Stack,
  Group,
  Card,
  Button,
  Box,
  rem,
  SimpleGrid,
  Progress,
  Skeleton,
  Modal,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  IconBrain,
  IconChartBar,
  IconFlame,
  IconPlus,
  IconBolt,
  IconBook,
} from '@tabler/icons-react';
import { DeckCard } from '@/components/flashcards/DeckCard';
import { CreateDeckModal } from '@/components/flashcards/CreateDeckModal';
import { QuizSetupModal } from '@/components/quiz/QuizSetupModal';
import { getDecks, deleteDeck, getDueCards } from '@/lib/flashcards';
import { listDocuments, type Document } from '@/lib/documents';
import type { FlashcardDeck } from '@/types/flashcard';

export default function StudyCenterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const accessToken = session?.accessToken ?? '';

  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [blitzLoading, setBlitzLoading] = useState(false);
  const [quizDeck, setQuizDeck] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    Promise.allSettled([
      getDecks(accessToken),
      listDocuments(accessToken, { pageSize: 50, fileType: 'all' }),
    ])
      .then(([decksResult, docsResult]) => {
        if (decksResult.status === 'fulfilled') setDecks(decksResult.value);
        else console.error(decksResult.reason);
        if (docsResult.status === 'fulfilled') setDocuments(docsResult.value.items);
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  async function handleDelete() {
    if (!deleteTargetId || !accessToken) return;
    setDeleting(true);
    try {
      await deleteDeck(deleteTargetId, accessToken);
      setDecks((prev) => prev.filter((d) => d.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  }

  async function handleRandomBlitz() {
    if (!accessToken || decks.length === 0) return;
    setBlitzLoading(true);
    try {
      const allResults = await Promise.all(
        decks.map((deck) => getDueCards(deck.id, accessToken)),
      );
      const flatCards = allResults
        .flatMap((result) =>
          result.cards.map((card) => ({ ...card, deckId: result.deckId })),
        )
        .sort(() => Math.random() - 0.5);

      if (flatCards.length === 0) {
        alert('No cards due today across any deck!');
        return;
      }
      sessionStorage.setItem('blitzCards', JSON.stringify(flatCards));
      router.push('/study-center/blitz');
    } catch (e) {
      console.error(e);
    } finally {
      setBlitzLoading(false);
    }
  }

  const totalDue = decks.reduce((sum, d) => sum + d.dueToday, 0);
  const avgMastery =
    decks.length > 0
      ? Math.round(decks.reduce((sum, d) => sum + d.masteryPercentage, 0) / decks.length)
      : 0;

  return (
    <AppLayout
      title={
        <Group gap="sm">
          <Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>
            Study Center
          </Title>
        </Group>
      }
    >
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing={rem(40)}>
        {/* Main Section */}
        <Box style={{ gridColumn: 'span 2' }}>
          <Stack gap={rem(48)}>
            {/* Performance Stats */}
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
              {[
                {
                  label: 'Total Cards',
                  value: decks.reduce((s, d) => s + d.totalCards, 0).toLocaleString(),
                  sub: 'Across all decks',
                  icon: <IconBrain size={24} />,
                  color: 'var(--bb-primary)',
                },
                {
                  label: 'Avg. Mastery',
                  value: `${avgMastery}%`,
                  sub: loading ? '…' : decks.length > 0 ? 'Scholar Progress' : 'No decks yet',
                  icon: <IconChartBar size={24} />,
                  color: '#2a5185',
                },
                {
                  label: 'Due Today',
                  value: totalDue.toString(),
                  sub: totalDue === 0 ? 'All caught up!' : 'Cards to review',
                  icon: <IconFlame size={24} />,
                  color: totalDue > 0 ? '#d9480f' : 'var(--bb-primary)',
                },
              ].map((stat, idx) => (
                <Card
                  key={idx}
                  radius={24}
                  p={rem(32)}
                  style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}
                >
                  <Group justify="space-between" mb={rem(20)}>
                    <Box
                      p={rem(12)}
                      style={{
                        borderRadius: 12,
                        backgroundColor: 'var(--bb-surface-container-low)',
                        color: stat.color,
                        display: 'flex',
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Group>
                  <Stack gap={rem(4)}>
                    {loading ? (
                      <Skeleton height={rem(36)} width={80} radius={8} />
                    ) : (
                      <Text fz={rem(32)} fw={800} c="var(--bb-on-surface)">
                        {stat.value}
                      </Text>
                    )}
                    <Text fz={rem(14)} fw={700} c="var(--bb-on-surface-variant)">
                      {stat.label}
                    </Text>
                    <Text fz={rem(12)} fw={600} c="var(--bb-outline)">
                      {stat.sub}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>

            {/* Flashcard Decks */}
            <Stack gap={rem(32)}>
              <Group justify="space-between" align="flex-end">
                <Stack gap={rem(4)}>
                  <Title order={2} fz={rem(24)} fw={800}>
                    Flashcard Decks
                  </Title>
                  <Text fz="sm" fw={600} c="var(--bb-outline)">
                    Spaced Repetition System (SRS) Active
                  </Text>
                </Stack>
                <Group gap="md">
                  <Button
                    variant="subtle"
                    color="gray"
                    leftSection={<IconPlus size={18} />}
                    fw={800}
                    radius={10}
                    onClick={() => setCreateModalOpen(true)}
                  >
                    Create New Deck
                  </Button>
                  <Button
                    className="bb-btn-primary"
                    leftSection={<IconBolt size={18} />}
                    radius={10}
                    fw={800}
                    loading={blitzLoading}
                    onClick={handleRandomBlitz}
                    disabled={decks.length === 0}
                  >
                    Start Random Blitz
                  </Button>
                </Group>
              </Group>

              {loading ? (
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} height={280} radius={24} />
                  ))}
                </SimpleGrid>
              ) : decks.length === 0 ? (
                <Card
                  radius={24}
                  p={rem(64)}
                  style={{
                    backgroundColor: 'var(--bb-surface-container-lowest)',
                    border: '2px dashed var(--bb-surface-container)',
                    textAlign: 'center',
                  }}
                >
                  <Stack align="center" gap={rem(16)}>
                    <Box
                      p={rem(20)}
                      style={{
                        backgroundColor: 'var(--bb-surface-container-low)',
                        borderRadius: 16,
                        display: 'inline-flex',
                      }}
                    >
                      <IconBook size={32} color="var(--bb-outline)" />
                    </Box>
                    <Stack gap={rem(8)} align="center">
                      <Text fw={800} fz="lg" c="var(--bb-on-surface)">
                        No decks yet
                      </Text>
                      <Text fz="sm" c="var(--bb-outline)" fw={600} maw={320} ta="center">
                        Create your first flashcard deck to start practicing with spaced repetition.
                      </Text>
                    </Stack>
                    <Button
                      className="bb-btn-primary"
                      radius={12}
                      fw={800}
                      leftSection={<IconPlus size={18} />}
                      onClick={() => setCreateModalOpen(true)}
                    >
                      Create your first deck
                    </Button>
                  </Stack>
                </Card>
              ) : (
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                  {decks.map((deck) => (
                    <DeckCard
                      key={deck.id}
                      deck={deck}
                      onStudy={(id) => router.push(`/study-center/${id}/study`)}
                      onDelete={(id) => setDeleteTargetId(id)}
                      onView={(id) => router.push(`/study-center/${id}`)}
                      onQuiz={(id) => setQuizDeck({ id, name: decks.find(d => d.id === id)?.name ?? '' })}
                    />
                  ))}
                </SimpleGrid>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Sidebar */}
        <Stack gap={rem(40)}>
          {/* Today's Path */}
          <Card
            radius={24}
            p={rem(32)}
            style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}
          >
            <Title order={3} fz={rem(18)} fw={800} mb={rem(24)}>
              Today's Path
            </Title>
            <Stack gap={rem(24)}>
              <Stack gap={rem(8)}>
                <Group justify="space-between">
                  <Text fz="xs" fw={700}>Review 50 new Hanzi</Text>
                  <Text fz="xs" fw={800} c="var(--bb-primary)">32/50</Text>
                </Group>
                <Progress value={64} size="sm" radius="xl" color="var(--bb-primary)" bg="var(--bb-surface-container)" />
              </Stack>
              <Stack gap={rem(8)}>
                <Group justify="space-between">
                  <Text fz="xs" fw={700}>Complete 2 Quizzes</Text>
                  <Text fz="xs" fw={800} c="var(--bb-primary)">1/2</Text>
                </Group>
                <Progress value={50} size="sm" radius="xl" color="var(--bb-primary)" bg="var(--bb-surface-container)" />
              </Stack>
              <Stack gap={rem(8)}>
                <Group justify="space-between">
                  <Text fz="xs" fw={700}>45m Active Study</Text>
                  <Text fz="xs" fw={800} c="var(--bb-primary)">28m</Text>
                </Group>
                <Progress value={62} size="sm" radius="xl" color="var(--bb-primary)" bg="var(--bb-surface-container)" />
              </Stack>
            </Stack>
          </Card>

          {/* Retention Curve */}
          <Card
            radius={24}
            p={rem(32)}
            style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}
          >
            <Title order={3} fz={rem(18)} fw={800} mb={rem(8)}>
              Retention Curve
            </Title>
            <Text fz="xs" fw={600} c="var(--bb-outline)" mb={rem(24)}>
              Memory decay visualization
            </Text>
            <Group align="flex-end" justify="space-between" h={120} px={rem(4)}>
              {[0.9, 0.85, 0.7, 0.65, 0.8, 0.95, 0.9].map((val, idx) => (
                <Box
                  key={idx}
                  style={{
                    width: rem(12),
                    height: `${val * 100}%`,
                    backgroundColor:
                      idx === 5 ? 'var(--bb-primary)' : 'var(--bb-surface-container)',
                    borderRadius: 4,
                  }}
                />
              ))}
            </Group>
            <Group justify="space-between" mt={rem(12)} px={rem(4)}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <Text key={idx} fz={rem(10)} fw={700} c="var(--bb-outline)">
                  {day}
                </Text>
              ))}
            </Group>
          </Card>

          {/* Quick Actions */}
          <Card
            radius={24}
            p={rem(32)}
            style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}
          >
            <Title order={3} fz={rem(18)} fw={800} mb={rem(24)}>
              Quick Actions
            </Title>
            <Stack gap={rem(12)}>
              <Button
                variant="light"
                color="green"
                radius={12}
                fw={800}
                leftSection={<IconPlus size={18} />}
                onClick={() => setCreateModalOpen(true)}
              >
                New Deck
              </Button>
              <Button
                variant="light"
                color="orange"
                radius={12}
                fw={800}
                leftSection={<IconBolt size={18} />}
                loading={blitzLoading}
                onClick={handleRandomBlitz}
                disabled={decks.length === 0}
              >
                Random Blitz
              </Button>
            </Stack>
          </Card>
        </Stack>
      </SimpleGrid>

      {/* Quiz Setup Modal */}
      <QuizSetupModal
        isOpen={!!quizDeck}
        onClose={() => setQuizDeck(null)}
        sourceType="deck"
        sourceId={quizDeck?.id ?? ''}
        sourceName={quizDeck?.name ?? ''}
      />

      {/* Create Deck Modal */}
      <CreateDeckModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        documents={documents}
        onCreated={(deck) => {
          setCreateModalOpen(false);
          router.push(`/study-center/${deck.id}`);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title={<Text fw={800} fz="md">Delete deck?</Text>}
        centered
        radius={16}
      >
        <Stack gap={rem(24)}>
          <Text fz="sm" c="var(--bb-on-surface-variant)">
            This will permanently delete the deck and all its cards. This cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button color="red" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </AppLayout>
  );
}
