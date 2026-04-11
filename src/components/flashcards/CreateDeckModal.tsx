'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Button,
  Select,
  SegmentedControl,
  Badge,
  rem,
} from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import { createDeck, createDeckFromDocument } from '@/lib/flashcards';
import { listDocuments, type Document } from '@/lib/documents';
import type { FlashcardDeck } from '@/types/flashcard';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDocumentId?: string;
  defaultDocumentName?: string;
  onCreated: (deck: FlashcardDeck) => void;
}

export function CreateDeckModal({
  isOpen,
  onClose,
  defaultDocumentId,
  defaultDocumentName,
  onCreated,
}: CreateDeckModalProps) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? '';

  const [documents, setDocuments] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const [tab, setTab] = useState<'document' | 'manual'>('document');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    let cancelled = false;
    setDocsLoading(true);

    async function fetchAll() {
      const all: Document[] = [];
      let token: string | undefined;
      do {
        const result = await listDocuments(accessToken, {
          pageSize: 50,
          fileType: 'all',
          continuationToken: token,
        });
        all.push(...result.items);
        token = result.pagination.continuationToken ?? undefined;
        if (!result.pagination.hasMore) break;
      } while (token);
      return all;
    }

    fetchAll()
      .then((all) => { if (!cancelled) setDocuments(all); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setDocsLoading(false); });

    return () => { cancelled = true; };
  }, [isOpen, accessToken]);

  // From-document tab state
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    defaultDocumentId ?? null,
  );
  const [docDeckName, setDocDeckName] = useState(
    defaultDocumentName ? `${defaultDocumentName} Vocabulary` : '',
  );
  const [maxCards, setMaxCards] = useState<number | string>(50);
  const [hskRange, setHskRange] = useState<'all' | '1-2' | '3-4' | '5-6'>('all');

  // Manual tab state
  const [manualName, setManualName] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const readyDocs = documents.filter((d) => d.extractionStatus === 'ready');
  const docOptions = readyDocs.map((d) => ({ value: d.id, label: d.fileName }));

  function addTag() {
    const t = tagInput.trim().toUpperCase();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function hskRangeToLevels(range: string): { min?: number; max?: number } {
    if (range === '1-2') return { min: 1, max: 2 };
    if (range === '3-4') return { min: 3, max: 4 };
    if (range === '5-6') return { min: 5, max: 6 };
    return {};
  }

  async function handleCreate() {
    setError(null);
    setLoading(true);
    try {
      if (tab === 'document') {
        if (!selectedDocId) throw new Error('Please select a document');
        if (!docDeckName.trim()) throw new Error('Please enter a deck name');
        const { min, max } = hskRangeToLevels(hskRange);
        const deck = await createDeckFromDocument(
          {
            name: docDeckName.trim(),
            description: `Vocabulary from document`,
            documentId: selectedDocId,
            maxCards: maxCards === 'all' ? undefined : Number(maxCards),
            minHskLevel: min,
            maxHskLevel: max,
          },
          accessToken,
        );
        onCreated(deck);
      } else {
        if (!manualName.trim()) throw new Error('Please enter a deck name');
        const deck = await createDeck(
          {
            name: manualName.trim(),
            description: manualDesc.trim(),
            tags,
            sourceType: 'manual',
            cards: [],
          },
          accessToken,
        );
        onCreated(deck);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create deck');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setError(null);
    onClose();
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={<Text fw={800} fz="lg">Create Flashcard Deck</Text>}
      centered
      radius={16}
      size="md"
    >
      <Stack gap={rem(24)}>
        <SegmentedControl
          fullWidth
          value={tab}
          onChange={(v) => setTab(v as 'document' | 'manual')}
          data={[
            { label: 'From Document', value: 'document' },
            { label: 'Manual', value: 'manual' },
          ]}
          radius={10}
        />

        {tab === 'document' ? (
          <Stack gap={rem(16)}>
            <Select
              label="Document"
              placeholder={docsLoading ? 'Loading documents…' : 'Select a document…'}
              data={docOptions}
              value={selectedDocId}
              onChange={setSelectedDocId}
              radius={10}
              disabled={docsLoading || !!defaultDocumentId}
              styles={{ input: { borderRadius: rem(10) } }}
            />
            <TextInput
              label="Deck name"
              placeholder="e.g. Beijing Travel Vocabulary"
              value={docDeckName}
              onChange={(e) => setDocDeckName(e.currentTarget.value)}
              radius={10}
            />
            <Stack gap={rem(8)}>
              <Text fz="sm" fw={700}>Max cards</Text>
              <Group gap={rem(8)}>
                {[10, 20, 50].map((n) => (
                  <Button
                    key={n}
                    variant={maxCards === n ? 'filled' : 'light'}
                    color={maxCards === n ? 'var(--bb-primary)' : 'gray'}
                    size="xs"
                    radius={8}
                    fw={800}
                    onClick={() => setMaxCards(n)}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant={maxCards === 'all' ? 'filled' : 'light'}
                  color={maxCards === 'all' ? 'var(--bb-primary)' : 'gray'}
                  size="xs"
                  radius={8}
                  fw={800}
                  onClick={() => setMaxCards('all')}
                >
                  All
                </Button>
              </Group>
            </Stack>
            <Stack gap={rem(8)}>
              <Text fz="sm" fw={700}>HSK level filter</Text>
              <Group gap={rem(8)}>
                {(['all', '1-2', '3-4', '5-6'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={hskRange === range ? 'filled' : 'light'}
                    color={hskRange === range ? 'var(--bb-primary)' : 'gray'}
                    size="xs"
                    radius={8}
                    fw={800}
                    onClick={() => setHskRange(range)}
                  >
                    {range === 'all' ? 'All' : `HSK ${range}`}
                  </Button>
                ))}
              </Group>
            </Stack>
          </Stack>
        ) : (
          <Stack gap={rem(16)}>
            <TextInput
              label="Deck name"
              placeholder="e.g. HSK 4 Finance"
              value={manualName}
              onChange={(e) => setManualName(e.currentTarget.value)}
              radius={10}
            />
            <TextInput
              label="Description"
              placeholder="What is this deck for?"
              value={manualDesc}
              onChange={(e) => setManualDesc(e.currentTarget.value)}
              radius={10}
            />
            <Stack gap={rem(8)}>
              <Text fz="sm" fw={700}>Tags</Text>
              <Group gap={rem(8)} wrap="wrap">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="light"
                    color="gray"
                    size="sm"
                    radius="sm"
                    fw={800}
                    rightSection={
                      <ActionIconInline onClick={() => removeTag(tag)} />
                    }
                  >
                    {tag}
                  </Badge>
                ))}
                <Group gap={rem(4)}>
                  <TextInput
                    placeholder="Add tag…"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.currentTarget.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    size="xs"
                    radius={8}
                    styles={{ input: { width: rem(100) } }}
                  />
                  <Button size="xs" variant="subtle" color="gray" onClick={addTag} px={rem(6)}>
                    <IconPlus size={14} />
                  </Button>
                </Group>
              </Group>
            </Stack>
          </Stack>
        )}

        {error && (
          <Text fz="sm" c="red" fw={600}>
            {error}
          </Text>
        )}

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="bb-btn-primary"
            radius={10}
            fw={800}
            loading={loading}
            onClick={handleCreate}
          >
            Create Deck
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function ActionIconInline({ onClick }: { onClick: () => void }) {
  return (
    <span
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
    >
      <IconX size={10} />
    </span>
  );
}
