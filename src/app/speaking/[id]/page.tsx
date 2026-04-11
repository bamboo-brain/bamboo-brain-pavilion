'use client';

import { useState, useEffect, useRef } from 'react';
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
  ActionIcon,
  Avatar,
  Button,
  Loader,
  Skeleton,
  Notification,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import { WaveformAnimation } from '@/components/speaking/WaveformAnimation';
import { ConversationBubble } from '@/components/speaking/ConversationBubble';
import { SessionInsightsPanel } from '@/components/speaking/SessionInsightsPanel';
import { MicButton } from '@/components/speaking/MicButton';
import { IconArrowLeft, IconPlayerStop, IconAlertCircle } from '@tabler/icons-react';
import { getSession, processAudioTurn, endSession } from '@/lib/api/speaking';
import { AudioRecorder, blobToBase64, convertToWav, createAudioAnalyser } from '@/lib/audio-recorder';
import type { SpeakingSession, ConversationTurn } from '@/types/speaking';

export default function ActiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: authSession } = useSession();
  const accessToken = authSession?.accessToken ?? '';
  const sessionId = params?.id as string;
  const userName = authSession?.user?.name?.split(' ')[0]?.toUpperCase() ?? 'YOU';

  const [speakingSession, setSpeakingSession] = useState<SpeakingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [ending, setEnding] = useState(false);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const recorderRef = useRef<AudioRecorder>(new AudioRecorder());
  const analyserRef = useRef<ReturnType<typeof createAudioAnalyser> | null>(null);
  const animFrameRef = useRef<number | undefined>(undefined);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load session + start timer
  useEffect(() => {
    if (!accessToken || !sessionId) return;
    let cancelled = false;

    getSession(sessionId, accessToken)
      .then((s) => {
        if (!cancelled) {
          setSpeakingSession(s);
          setLoading(false);
          // Auto-play first AI turn if audio exists
          const firstAI = s.turns.find((t) => t.role === 'ai' && t.audioUrl);
          if (firstAI?.audioUrl) playAudio(firstAI.audioUrl);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    durationIntervalRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(durationIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [accessToken, sessionId]);

  function playAudio(url: string) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsAIPlaying(true);
    audio.play().catch((err) => {
      setIsAIPlaying(false);
      showError(`Could not play audio: ${err.message}`);
    });
    audio.onended = () => setIsAIPlaying(false);
    audio.onerror = () => {
      setIsAIPlaying(false);
      showError('Audio playback failed');
    };
  }

  function showError(msg: string) {
    clearTimeout(errorTimerRef.current);
    setErrorMsg(msg);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 4000);
  }

  // Auto-scroll on new turns
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [speakingSession?.turns.length]);

  async function handleMicDown() {
    if (isProcessing || !speakingSession) return;
    setIsRecording(true);
    await recorderRef.current.start();

    // Start analyser for waveform
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      analyserRef.current = createAudioAnalyser(stream);
      const animate = () => {
        setAudioLevel(analyserRef.current?.getLevel() ?? 0);
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    } catch {
      // Analyser is optional; recording proceeds without visualisation
    }
  }

  async function handleMicUp() {
    if (!isRecording || !speakingSession) return;
    setIsRecording(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    setAudioLevel(0);
    setIsProcessing(true);

    try {
      const webmBlob = await recorderRef.current.stop();
      const wavBlob = await convertToWav(webmBlob);
      const base64 = await blobToBase64(wavBlob);
      const mimeType = 'audio/wav';

      // Optimistic placeholder
      const placeholder: ConversationTurn = {
        id: 'pending',
        role: 'user',
        text: '...',
        toneCorrections: [],
        timestamp: new Date().toISOString(),
      };
      setSpeakingSession((prev) =>
        prev ? { ...prev, turns: [...prev.turns, placeholder] } : prev,
      );

      const aiTurn = await processAudioTurn(
        speakingSession.id,
        { audioBase64: base64, mimeType },
        accessToken,
      );

      // Refresh full session
      const updated = await getSession(speakingSession.id, accessToken);
      setSpeakingSession(updated);

      // Play the latest AI turn audio from the refreshed session
      const latestAI = [...updated.turns].reverse().find((t) => t.role === 'ai' && t.audioUrl);
      if (latestAI?.audioUrl) playAudio(latestAI.audioUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to process audio';
      showError(msg);
      // Remove placeholder on error
      setSpeakingSession((prev) =>
        prev ? { ...prev, turns: prev.turns.filter((t) => t.id !== 'pending') } : prev,
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleEndSession() {
    if (!speakingSession) return;
    setEnding(true);
    try {
      await endSession(
        speakingSession.id,
        { durationSeconds: sessionDuration },
        accessToken,
      );
      router.push(`/speaking/${speakingSession.id}/summary`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to end session';
      showError(msg);
      setEnding(false);
    }
  }

  if (loading) {
    return (
      <AppLayout title={<Title order={1} fz={rem(24)} fw={800}>Loading session...</Title>}>
        <SimpleGrid cols={{ base: 1, lg: 4 }} spacing={rem(40)}>
          <Box style={{ gridColumn: 'span 3' }}>
            <Skeleton h={rem(500)} radius={32} />
          </Box>
          <Stack gap={rem(24)}>
            <Skeleton h={rem(220)} radius={24} />
            <Skeleton h={rem(180)} radius={24} />
          </Stack>
        </SimpleGrid>
      </AppLayout>
    );
  }

  if (!speakingSession) {
    return (
      <AppLayout title="Session Not Found">
        <Stack align="center" mt={rem(80)} gap={rem(16)}>
          <Text size="xl" fw={700}>Session not found.</Text>
          <Button variant="subtle" onClick={() => router.push('/speaking')} leftSection={<IconArrowLeft size={18} />}>
            Back to Speaking Studio
          </Button>
        </Stack>
      </AppLayout>
    );
  }

  const isCompleted = speakingSession.status === 'completed';

  return (
    <>
      {errorMsg && (
        <div style={{ position: 'fixed', top: rem(24), right: rem(24), zIndex: 9999, maxWidth: rem(360) }}>
          <Notification
            icon={<IconAlertCircle size={18} />}
            color="red"
            title="Error"
            onClose={() => setErrorMsg(null)}
            withBorder
            radius={12}
            styles={{ root: { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' } }}
          >
            {errorMsg}
          </Notification>
        </div>
      )}
      <AppLayout
      title={
        <Group gap="sm">
          <ActionIcon variant="subtle" color="gray" onClick={() => router.push('/speaking')}>
            <IconArrowLeft size={22} />
          </ActionIcon>
          <Stack gap={0}>
            <Title order={1} fz={rem(22)} fw={800} c="var(--bb-on-surface)">
              {speakingSession.topic}
            </Title>
            <Badge color={speakingSession.status === 'active' ? 'green' : 'gray'} variant="dot" size="xs" fw={700}>
              {speakingSession.status === 'active' ? 'Live' : 'Completed'}
            </Badge>
          </Stack>
        </Group>
      }
    >
      <SimpleGrid cols={{ base: 1, lg: 4 }} spacing={rem(32)}>
        {/* Main conversation area — spans 3 cols */}
        <Box style={{ gridColumn: 'span 3' }}>
          <Stack gap={rem(32)}>
            <Card
              radius={32}
              p={rem(48)}
              style={{
                backgroundColor: 'white',
                backgroundImage: 'radial-gradient(circle at top right, rgba(21, 66, 18, 0.03) 0%, transparent 70%)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.02)',
              }}
            >
              <Stack align="center" gap={rem(32)}>
                {/* Avatar */}
                <Stack align="center" gap={rem(12)}>
                  <Avatar
                    size={rem(100)}
                    radius={100}
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"
                    style={{ border: `${rem(3)} solid var(--bb-primary)` }}
                  />
                  <Box style={{ textAlign: 'center' }}>
                    <Text fz="xs" fw={800} tt="uppercase" style={{ letterSpacing: rem(2) }} c="var(--bb-outline)">
                      Master Ling AI
                    </Text>
                    <Text fz="xs" fw={700} c="var(--bb-primary)" tt="uppercase" style={{ letterSpacing: rem(1.5) }}>
                      Personal Scholar
                    </Text>
                  </Box>
                </Stack>

                {/* Waveform */}
                <Stack align="center" gap={rem(8)} w="100%" maw={360}>
                  <WaveformAnimation isActive={isRecording || isProcessing || isAIPlaying} level={isAIPlaying ? 0.6 : audioLevel} />
                  <Text fz="xs" fw={700} c="var(--bb-outline)">
                    {isRecording
                      ? 'Listening to your pronunciation...'
                      : isProcessing
                      ? 'Processing your response...'
                      : isAIPlaying
                      ? 'Master Ling is speaking...'
                      : 'Ready to listen'}
                  </Text>
                </Stack>

                {/* Conversation turns */}
                <Stack gap={rem(16)} w="100%">
                  {speakingSession.turns.map((turn) => (
                    <ConversationBubble
                      key={turn.id}
                      turn={turn}
                      userName={userName}
                    />
                  ))}
                  {isProcessing && speakingSession.turns[speakingSession.turns.length - 1]?.id === 'pending' && (
                    <Group justify="center" py={rem(8)}>
                      <Loader size="xs" color="var(--bb-primary)" />
                    </Group>
                  )}
                  <div ref={chatBottomRef} />
                </Stack>
              </Stack>
            </Card>

            {/* Controls */}
            {!isCompleted && (
              <Group justify="center" gap={rem(32)} pb={rem(16)}>
                <MicButton
                  isRecording={isRecording}
                  isProcessing={isProcessing}
                  onMouseDown={handleMicDown}
                  onMouseUp={handleMicUp}
                  onTouchStart={handleMicDown}
                  onTouchEnd={handleMicUp}
                />
                <Button
                  variant="light"
                  color="red"
                  radius={12}
                  h={rem(48)}
                  leftSection={ending ? <Loader size={14} /> : <IconPlayerStop size={16} />}
                  disabled={ending || isRecording || isProcessing}
                  onClick={handleEndSession}
                >
                  End Session
                </Button>
              </Group>
            )}

            {isCompleted && (
              <Group justify="center">
                <Button
                  className="bb-btn-primary"
                  radius={12}
                  onClick={() => router.push(`/speaking/${speakingSession.id}/summary`)}
                >
                  View Summary
                </Button>
              </Group>
            )}
          </Stack>
        </Box>

        {/* Insights sidebar */}
        <SessionInsightsPanel
          insights={speakingSession.insights}
          currentDuration={sessionDuration}
          topVocabulary={speakingSession.topVocabulary ?? []}
        />
      </SimpleGrid>
    </AppLayout>
    </>
  );
}
