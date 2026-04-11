'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Button,
  Select,
  ScrollArea,
  Loader,
  rem,
} from '@mantine/core';
import { TopicCard } from './TopicCard';
import { getSuggestedTopics, startSession } from '@/lib/api/speaking';
import type { SpeakingSession, SuggestedTopic } from '@/types/speaking';

interface TopicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (session: SpeakingSession) => void;
}

const HSK_LEVELS = ['1', '2', '3', '4', '5', '6'].map((l) => ({
  value: l,
  label: `HSK ${l}`,
}));

async function checkMicPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    alert(
      'Microphone access is required for Speaking Studio. Please allow microphone access in your browser settings.',
    );
    return false;
  }
}

export function TopicSelectionModal({
  isOpen,
  onClose,
  onStart,
}: TopicSelectionModalProps) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? '';
  const router = useRouter();

  const [topics, setTopics] = useState<SuggestedTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<SuggestedTopic | null>(null);

  const [customTopic, setCustomTopic] = useState('');
  const [hskLevel, setHskLevel] = useState<string>('3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    let cancelled = false;
    setTopicsLoading(true);
    getSuggestedTopics(accessToken)
      .then((data) => { if (!cancelled) setTopics(data); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setTopicsLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, accessToken]);

  function handleSelectTopic(topic: SuggestedTopic) {
    setSelectedTopic(topic);
    setCustomTopic(topic.topic);
    setHskLevel(String(topic.hskLevel));
  }

  async function handleStart() {
    const topic = customTopic.trim();
    if (!topic) {
      setError('Please enter or select a topic');
      return;
    }
    const hasMic = await checkMicPermission();
    if (!hasMic) return;

    setError(null);
    setLoading(true);
    try {
      const newSession = await startSession(
        {
          topic,
          topicDescription:
            selectedTopic?.topic === topic
              ? selectedTopic.description
              : `Conversation about ${topic}`,
          hskLevel: Number(hskLevel),
        },
        accessToken,
      );
      onStart(newSession);
      router.push(`/speaking/${newSession.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setError(null);
    setSelectedTopic(null);
    setCustomTopic('');
    setHskLevel('3');
    onClose();
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={<Text fw={800} fz="lg">Choose a Conversation Topic</Text>}
      centered
      radius={16}
      size="md"
    >
      <Stack gap={rem(20)}>
        {topicsLoading ? (
          <Group justify="center" py={rem(24)}>
            <Loader size="sm" color="var(--bb-primary)" />
          </Group>
        ) : (
          <ScrollArea h={rem(280)} offsetScrollbars>
            <Stack gap={rem(8)}>
              {topics.map((t) => (
                <TopicCard
                  key={t.id}
                  topic={t}
                  isSelected={selectedTopic?.id === t.id}
                  onSelect={handleSelectTopic}
                />
              ))}
            </Stack>
          </ScrollArea>
        )}

        <Stack gap={rem(12)}>
          <TextInput
            label="Or enter a custom topic"
            placeholder="e.g. Discussing Chinese history..."
            value={customTopic}
            onChange={(e) => {
              setCustomTopic(e.currentTarget.value);
              setSelectedTopic(null);
            }}
            radius={10}
          />
          <Select
            label="HSK Level"
            data={HSK_LEVELS}
            value={hskLevel}
            onChange={(v) => setHskLevel(v ?? '3')}
            radius={10}
            allowDeselect={false}
          />
        </Stack>

        {error && (
          <Text fz="sm" c="red" fw={600}>{error}</Text>
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
            onClick={handleStart}
          >
            Start Session →
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
