'use client';

import { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Button,
  Select,
  rem,
  Textarea,
} from '@mantine/core';
import type { AddCardRequest } from '@/types/flashcard';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (card: AddCardRequest) => Promise<void>;
}

export function AddCardModal({ isOpen, onClose, onAdd }: AddCardModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [word, setWord] = useState('');
  const [pinyin, setPinyin] = useState('');
  const [meaning, setMeaning] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [hskLevel, setHskLevel] = useState<string | null>(null);

  async function handleAdd() {
    if (!word.trim() || !pinyin.trim() || !meaning.trim()) {
      setError('Word, pinyin and meaning are required');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onAdd({
        word: word.trim(),
        pinyin: pinyin.trim(),
        meaning: meaning.trim(),
        exampleSentence: exampleSentence.trim() || undefined,
        exampleTranslation: exampleTranslation.trim() || undefined,
        hskLevel: hskLevel ? Number(hskLevel) : undefined,
      });
      setWord('');
      setPinyin('');
      setMeaning('');
      setExampleSentence('');
      setExampleTranslation('');
      setHskLevel(null);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add card');
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
      title={<Text fw={800} fz="lg">Add Flashcard</Text>}
      centered
      radius={16}
      size="md"
    >
      <Stack gap={rem(16)}>
        <TextInput
          label="Word (Chinese)"
          placeholder="e.g. 北京"
          value={word}
          onChange={(e) => setWord(e.currentTarget.value)}
          radius={10}
          styles={{ input: { fontFamily: "'Noto Sans SC', sans-serif", fontSize: rem(18) } }}
        />
        <TextInput
          label="Pinyin"
          placeholder="e.g. Běijīng"
          value={pinyin}
          onChange={(e) => setPinyin(e.currentTarget.value)}
          radius={10}
        />
        <TextInput
          label="Meaning"
          placeholder="e.g. Beijing, capital of China"
          value={meaning}
          onChange={(e) => setMeaning(e.currentTarget.value)}
          radius={10}
        />
        <Textarea
          label="Example sentence (optional)"
          placeholder="e.g. 我在北京工作。"
          value={exampleSentence}
          onChange={(e) => setExampleSentence(e.currentTarget.value)}
          radius={10}
          styles={{ input: { fontFamily: "'Noto Sans SC', sans-serif" } }}
          autosize
          minRows={2}
        />
        <TextInput
          label="Example translation (optional)"
          placeholder="e.g. I work in Beijing."
          value={exampleTranslation}
          onChange={(e) => setExampleTranslation(e.currentTarget.value)}
          radius={10}
        />
        <Select
          label="HSK Level (optional)"
          placeholder="Select level…"
          data={['1', '2', '3', '4', '5', '6']}
          value={hskLevel}
          onChange={setHskLevel}
          radius={10}
          clearable
        />

        {error && (
          <Text fz="sm" c="red" fw={600}>
            {error}
          </Text>
        )}

        <Group justify="flex-end" gap="sm" mt={rem(8)}>
          <Button variant="subtle" color="gray" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="bb-btn-primary"
            radius={10}
            fw={800}
            loading={loading}
            onClick={handleAdd}
          >
            Add Card
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
