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
  Box,
  Badge,
  rem,
  SimpleGrid,
  Button,
  Skeleton,
  Collapse,
  ActionIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConversationBubble } from '@/components/speaking/ConversationBubble';
import { MicIcon } from '@/components/icons';
import {
  IconArrowLeft,
  IconRefresh,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { getSession } from '@/lib/api/speaking';
import type { SpeakingSession } from '@/types/speaking';

function fluencyColor(fluency: string) {
  if (fluency === 'Excellent') return '#2f9e44';
  if (fluency === 'Great') return '#0c8599';
  if (fluency === 'Good') return '#1971c2';
  return '#e67700';
}

export default function SessionSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const { data: authSession } = useSession();
  const accessToken = authSession?.accessToken ?? '';
  const sessionId = params?.id as string;
  const userName = authSession?.user?.name?.split(' ')[0]?.toUpperCase() ?? 'YOU';

  const [speakingSession, setSpeakingSession] = useState<SpeakingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcriptOpened, { toggle: toggleTranscript }] = useDisclosure(false);

  useEffect(() => {
    if (!accessToken || !sessionId) return;
    let cancelled = false;
    getSession(sessionId, accessToken)
      .then((s) => { if (!cancelled) setSpeakingSession(s); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [accessToken, sessionId]);

  if (loading) {
    return (
      <AppLayout title={<Title order={1} fz={rem(24)} fw={800}>Loading summary...</Title>}>
        <Stack gap={rem(24)}>
          <Skeleton h={rem(120)} radius={24} />
          <Skeleton h={rem(280)} radius={24} />
        </Stack>
      </AppLayout>
    );
  }

  if (!speakingSession) {
    return (
      <AppLayout title="Summary Not Found">
        <Stack align="center" mt={rem(80)} gap={rem(16)}>
          <Text size="xl" fw={700}>Session not found.</Text>
          <Button variant="subtle" onClick={() => router.push('/speaking')} leftSection={<IconArrowLeft size={18} />}>
            Back to Speaking Studio
          </Button>
        </Stack>
      </AppLayout>
    );
  }

  const { insights, topVocabulary, topic } = speakingSession;
  const allToneCorrections = speakingSession.turns.flatMap((t) => t.toneCorrections);

  return (
    <AppLayout
      title={
        <Group gap="sm">
          <ActionIcon variant="subtle" color="gray" onClick={() => router.push('/speaking')}>
            <IconArrowLeft size={22} />
          </ActionIcon>
          <Title order={1} fz={rem(24)} fw={800} c="var(--bb-on-surface)">
            Session Complete
          </Title>
        </Group>
      }
    >
      <Stack gap={rem(32)} maw={rem(800)}>
        {/* Topic header */}
        <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
          <Group gap="md" mb={rem(24)}>
            <Box p={rem(14)} bg="rgba(21, 66, 18, 0.06)" style={{ borderRadius: 14, color: 'var(--bb-primary)', display: 'flex' }}>
              <MicIcon size={28} />
            </Box>
            <Stack gap={0}>
              <Text fz="xs" fw={700} tt="uppercase" c="var(--bb-outline)" style={{ letterSpacing: rem(1) }}>
                Session Complete
              </Text>
              <Title order={2} fz={rem(22)} fw={800}>{topic}</Title>
            </Stack>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Box
              p={rem(20)}
              style={{ borderRadius: 16, backgroundColor: 'rgba(21, 66, 18, 0.04)', textAlign: 'center' }}
            >
              <Text fz={rem(36)} fw={900} c="var(--bb-primary)">
                {insights ? `${insights.accuracyScore}%` : '—'}
              </Text>
              <Text fz="xs" fw={700} tt="uppercase" c="var(--bb-outline)">Accuracy</Text>
            </Box>

            <Box
              p={rem(20)}
              style={{ borderRadius: 16, backgroundColor: 'rgba(9, 57, 108, 0.04)', textAlign: 'center' }}
            >
              <Text fz={rem(36)} fw={900} style={{ color: insights ? fluencyColor(insights.fluency) : 'var(--bb-outline)' }}>
                {insights?.fluency ?? '—'}
              </Text>
              <Text fz="xs" fw={700} tt="uppercase" c="var(--bb-outline)">Fluency</Text>
            </Box>

            <Box
              p={rem(20)}
              style={{ borderRadius: 16, backgroundColor: 'var(--bb-surface-container-low)', textAlign: 'center' }}
            >
              <Text fz={rem(36)} fw={900} c="var(--bb-on-surface)">
                {insights?.duration ?? '—'}
              </Text>
              <Text fz="xs" fw={700} tt="uppercase" c="var(--bb-outline)">Duration</Text>
            </Box>
          </SimpleGrid>
        </Card>

        {/* Tone corrections */}
        {allToneCorrections.length > 0 && (
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Title order={3} fz={rem(18)} fw={800} mb={rem(20)}>
              Tone Corrections ({allToneCorrections.length})
            </Title>
            <Stack gap={rem(12)}>
              {allToneCorrections.map((correction, i) => (
                <Box
                  key={i}
                  p={rem(14)}
                  style={{
                    backgroundColor: 'rgba(217, 72, 15, 0.04)',
                    borderLeft: '4px solid #d9480f',
                    borderRadius: '0 10px 10px 0',
                  }}
                >
                  <Group gap={rem(8)} mb={rem(4)}>
                    <Text className="hanzi" fz={rem(18)} fw={600} c="#d9480f">{correction.word}</Text>
                    <Text fz="xs" fw={700} c="var(--bb-outline)">
                      correct: <Text span fw={800} c="var(--bb-primary)">{correction.correctPinyin}</Text>
                      {' · '}
                      spoken: <Text span fw={800} c="#d9480f">{correction.spokenPinyin}</Text>
                    </Text>
                  </Group>
                  <Text fz="sm" fw={500} c="var(--bb-on-surface-variant)">{correction.message}</Text>
                </Box>
              ))}
            </Stack>
          </Card>
        )}

        {/* Top vocabulary */}
        {topVocabulary?.length > 0 && (
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Title order={3} fz={rem(18)} fw={800} mb={rem(16)}>Top Vocabulary Used</Title>
            <Group gap={rem(8)} wrap="wrap">
              {topVocabulary.map((item) => (
                <Badge
                  key={item.word}
                  color="gray"
                  variant="light"
                  radius="sm"
                  fw={700}
                  px={rem(12)}
                  py={rem(8)}
                  size="lg"
                >
                  <Text span className="hanzi" fz={rem(16)}>{item.word}</Text>
                  {' '}
                  <Text span fz="xs" c="var(--bb-outline)">· {item.meaning}</Text>
                </Badge>
              ))}
            </Group>
          </Card>
        )}

        {/* Full transcript (collapsible) */}
        <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
          <Group
            justify="space-between"
            mb={transcriptOpened ? rem(20) : 0}
            style={{ cursor: 'pointer' }}
            onClick={toggleTranscript}
          >
            <Title order={3} fz={rem(18)} fw={800}>Full Transcript</Title>
            <ActionIcon variant="subtle" color="gray">
              {transcriptOpened ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
            </ActionIcon>
          </Group>
          <Collapse in={transcriptOpened}>
            <Stack gap={rem(12)}>
              {speakingSession.turns.map((turn) => (
                <ConversationBubble key={turn.id} turn={turn} userName={userName} />
              ))}
            </Stack>
          </Collapse>
        </Card>

        {/* Actions */}
        <Group gap={rem(12)}>
          <Button
            className="bb-btn-primary"
            radius={12}
            leftSection={<IconRefresh size={18} />}
            onClick={() => router.push('/speaking')}
          >
            New Topic
          </Button>
          <Button
            variant="light"
            color="gray"
            radius={12}
            onClick={() => router.push('/speaking')}
          >
            Done
          </Button>
        </Group>
      </Stack>
    </AppLayout>
  );
}
