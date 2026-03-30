'use client';

import { useParams, useRouter } from 'next/navigation';
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
  ActionIcon,
  Avatar,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  IconPlayerPlayFilled,
  IconChevronRight,
  IconArrowLeft,
  IconVolume,
} from '@tabler/icons-react';
import {
  MicIcon
} from '@/components/icons'

const SESSIONS = [
  { id: '1', topic: 'Job Interview in Shanghai', date: 'Oct 28, 2023', accuracy: '94%', duration: '12:40', level: 'HSK 5' },
  { id: '2', topic: 'Ordering Coffee in Beijing', date: 'Oct 26, 2023', accuracy: '88%', duration: '08:15', level: 'HSK 3' },
  { id: '3', topic: 'Discussing Contemporary Art', date: 'Oct 24, 2023', accuracy: '91%', duration: '22:30', level: 'HSK 6' },
  { id: '4', topic: 'Daily Life Dialogue', date: 'Oct 22, 2023', accuracy: '96%', duration: '05:50', level: 'HSK 2' },
];

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const currentSession = SESSIONS.find(s => s.id === id);

  if (!currentSession) {
    return (
      <AppLayout title="Session Not Found">
        <Stack align="center" mt={rem(80)}>
          <Text size="xl" fw={700}>Oops! Session not found.</Text>
          <ActionIcon 
            variant="filled" 
            size="xl" 
            radius="md" 
            onClick={() => router.push('/speaking')}
            className="bb-btn-primary"
          >
            <IconArrowLeft />
          </ActionIcon>
        </Stack>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={
        <Group gap="sm">
          <ActionIcon variant="subtle" color="gray" onClick={() => router.push('/speaking')}>
            <IconArrowLeft size={22} />
          </ActionIcon>
          <Title order={1} fz={rem(24)} fw={800} c="var(--bb-on-surface)">
            {currentSession.topic}
          </Title>
        </Group>
      }
    >
      <SimpleGrid cols={{ base: 1, lg: 4 }} spacing={rem(40)}>
        {/* Studio View (Spans 3 columns) */}
        <Box style={{ gridColumn: 'span 3' }}>
          <Stack gap={rem(40)}>
            {/* AI Interaction Area */}
            <Card
              radius={32}
              p={rem(64)}
              style={{
                backgroundColor: 'white',
                backgroundImage: 'radial-gradient(circle at top right, rgba(21, 66, 18, 0.03) 0%, transparent 70%)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.02)'
              }}
            >
              <Stack align="center" gap={rem(48)}>
                <Stack align="center" gap={rem(16)}>
                  <Avatar size={rem(120)} radius={120} src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop" style={{ border: `${rem(4)} solid var(--bb-primary)` }} />
                  <Box style={{ textAlign: 'center' }}>
                    <Text fw={800} fz="lg">Master Ling AI</Text>
                    <Text fz="xs" fw={700} c="var(--bb-primary)">PERSONAL SCHOLAR</Text>
                  </Box>
                </Stack>

                {/* Waveform Mockup */}
                <Stack align="center" gap={rem(12)} w="100%" maw={400}>
                  <Group gap={rem(4)} justify="center" h={rem(40)} align="flex-end">
                    {[0.4, 0.6, 0.9, 0.7, 0.5, 0.8, 1, 0.6, 0.4, 0.7, 0.9, 0.5, 0.3, 0.6, 0.8].map((v, i) => (
                      <Box key={i} style={{ width: rem(4), height: `${v * 100}%`, backgroundColor: 'var(--bb-primary)', borderRadius: 2, opacity: 0.8 }} />
                    ))}
                  </Group>
                  <Text fz="xs" fw={700} c="var(--bb-outline)">Listening to your pronunciation...</Text>
                </Stack>

                {/* Transcription Area */}
                <Stack gap={rem(32)} w="100%">
                  <Box p={rem(24)} bg="var(--bb-surface-container-low)" style={{ borderRadius: 20 }}>
                    <Group justify="space-between" mb={rem(12)}>
                      <Badge variant="dot" color="blue" size="sm">MASTER LING</Badge>
                      <ActionIcon variant="subtle" size="sm"><IconVolume size={16} /></ActionIcon>
                    </Group>
                    <Text className="hanzi" fz={rem(22)} fw={500} mb={rem(8)}>你要点什么咖啡？</Text>
                    <Text fz="sm" fw={600} c="var(--bb-on-surface-variant)" fs="italic">Nǐ yào diǎn shénme kāfēi? (What coffee would you like to order?)</Text>
                  </Box>

                  <Box p={rem(24)} bg="rgba(21, 66, 18, 0.03)" style={{ borderRadius: 20, border: '1px solid rgba(21, 66, 18, 0.08)' }}>
                    <Group justify="space-between" mb={rem(12)}>
                      <Badge variant="dot" color="green" size="sm">YOU (ALEX)</Badge>
                    </Group>
                    <Text className="hanzi" fz={rem(22)} fw={500} mb={rem(8)}>
                      我要一杯<span style={{ color: '#d9480f', textDecoration: 'underline' }}>美式</span>咖啡。
                    </Text>
                    <Text fz="sm" fw={600} c="var(--bb-on-surface-variant)">Wǒ yào yī bēi měishì kāfēi.</Text>

                    <Card mt={rem(16)} p={rem(12)} radius="md" style={{ backgroundColor: 'rgba(217, 72, 15, 0.05)', border: '1px solid rgba(217, 72, 15, 0.1)' }}>
                      <Group gap="xs">
                        <MicIcon size={14} color="#d9480f" />
                        <Text fz={rem(12)} fw={700} c="#d9480f">TONE CORRECTION: "Měishì" (3rd tone) was pronounced slightly as 2nd tone.</Text>
                      </Group>
                    </Card>
                  </Box>
                </Stack>
              </Stack>
            </Card>

            {/* Controls */}
            <Group justify="center" gap="xl">
              <ActionIcon size={rem(64)} radius="xl" variant="light" color="gray"><IconVolume size={24} /></ActionIcon>
              <ActionIcon size={rem(80)} radius="xl" className="bb-btn-primary" style={{ boxShadow: '0 8px 24px rgba(21, 66, 18, 0.3)' }}>
                <MicIcon size={32} />
              </ActionIcon>
              <ActionIcon size={rem(64)} radius="xl" variant="light" color="gray" onClick={() => router.push('/speaking')}><IconPlayerPlayFilled size={24} /></ActionIcon>
            </Group>
          </Stack>
        </Box>

        {/* Session Overview Sidebar */}
        <Stack gap={rem(32)}>
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Title order={3} fz={rem(18)} fw={800} mb={rem(24)}>Session Insights</Title>
            <Stack gap={rem(24)}>
              <Group justify="space-between">
                <Text fz="sm" fw={700}>Accuracy Score</Text>
                <Text fz="sm" fw={800} c="var(--bb-primary)">{currentSession.accuracy}</Text>
              </Group>
              <Group justify="space-between">
                <Text fz="sm" fw={700}>Fluency</Text>
                <Text fz="sm" fw={800} c="var(--bb-primary)">Great</Text>
              </Group>
              <Group justify="space-between">
                <Text fz="sm" fw={700}>Duration</Text>
                <Text fz="sm" fw={800} c="var(--bb-outline)">{currentSession.duration}</Text>
              </Group>
            </Stack>
          </Card>

          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Title order={3} fz={rem(18)} fw={800} mb={rem(24)}>Top Vocabulary Used</Title>
            <Group gap="xs">
              {['咖啡 (Coffee)', '美式 (Americano)', '杯 (Cup)', '点 (Order)'].map(word => (
                <Badge key={word} color="gray" variant="light" radius="sm" fw={700} px={rem(10)} py={rem(12)}>{word}</Badge>
              ))}
            </Group>
          </Card>
        </Stack>
      </SimpleGrid>
    </AppLayout>
  );
}
