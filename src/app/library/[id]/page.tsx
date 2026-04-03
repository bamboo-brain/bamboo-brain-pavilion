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
  ActionIcon,
  Progress,
  ScrollArea,
  SimpleGrid,
  Loader,
  Tooltip,
  Divider,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  IconArrowLeft,
  IconFileTypePdf,
  IconVideo,
  IconHeadphones,
  IconFileTypePpt,
  IconCircleCheckFilled,
  IconAlertCircleFilled,
  IconBook2,
} from '@tabler/icons-react';
import {
  getDocument,
  getDocumentStatus,
  type Document,
  type ExtractedWord,
} from '@/lib/documents';

// ─── helpers ────────────────────────────────────────────────────────────────

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType === 'video') return <IconVideo size={22} />;
  if (fileType === 'audio') return <IconHeadphones size={22} />;
  if (fileType === 'ppt')   return <IconFileTypePpt size={22} />;
  return <IconFileTypePdf size={22} />;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function extractionStageLabel(progress: number): string {
  if (progress < 20) return 'Downloading from storage…';
  if (progress < 50) return 'Extracting text content…';
  if (progress < 80) return 'Identifying vocabulary with AI…';
  if (progress < 90) return 'Generating content tags…';
  if (progress < 100) return 'Calculating HSK level…';
  return 'Finalizing…';
}

const DONE_STATUSES = new Set(['ready', 'failed', 'error']);

// ─── Word tooltip ────────────────────────────────────────────────────────────

function WordChip({ word }: { word: ExtractedWord }) {
  return (
    <Tooltip
      multiline
      position="top"
      withArrow
      arrowSize={8}
      radius={12}
      p={rem(14)}
      label={
        <Stack gap={rem(4)} style={{ minWidth: rem(140) }}>
          <Text className="hanzi" fz={rem(22)} fw={700} lh={1}>{word.word}</Text>
          <Text fz={rem(13)} fw={600} c="dimmed" style={{ fontStyle: 'italic' }}>{word.pinyin}</Text>
          <Text fz={rem(13)}>{word.meaning}</Text>
          <Group gap={rem(6)} mt={rem(2)}>
            <Badge size="xs" color="green" variant="light" radius="sm" fw={800}>HSK {word.hskLevel}</Badge>
            <Text fz={rem(11)} c="dimmed">{word.frequency}× in doc</Text>
          </Group>
        </Stack>
      }
    >
      <span
        style={{
          color: 'var(--bb-primary)',
          borderBottom: '2px solid currentColor',
          cursor: 'help',
          display: 'inline',
        }}
      >
        {word.word}
      </span>
    </Tooltip>
  );
}

// ─── Annotated text renderer ─────────────────────────────────────────────────

function AnnotatedText({ text, words }: { text: string; words: ExtractedWord[] }) {
  if (!text) return null;
  if (words.length === 0) return <span>{text}</span>;

  const wordMap = new Map(words.map((w) => [w.word, w]));
  const sorted = [...words].sort((a, b) => b.word.length - a.word.length);
  const escaped = sorted.map((w) => w.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const word = wordMap.get(part);
        return word ? <WordChip key={i} word={word} /> : <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Processing view ─────────────────────────────────────────────────────────

function ProcessingCard({ doc }: { doc: Document }) {
  const isFailed = doc.extractionStatus === 'error' || doc.extractionStatus === 'failed' as string;
  return (
    <Card
      radius={24}
      p={rem(48)}
      style={{
        backgroundColor: 'var(--bb-surface-container-lowest)',
        border: 'none',
        maxWidth: rem(600),
        margin: '0 auto',
      }}
    >
      <Stack align="center" gap={rem(32)}>
        <Box
          p={rem(20)}
          style={{
            backgroundColor: isFailed ? 'rgba(255,0,0,0.06)' : 'rgba(21,66,18,0.06)',
            borderRadius: 20,
            display: 'flex',
          }}
        >
          <FileIcon fileType={doc.fileType} />
        </Box>

        <Stack align="center" gap={rem(8)}>
          <Text fw={800} fz="lg" ta="center">{doc.fileName}</Text>
          <Text fz="sm" c="var(--bb-outline)" fw={600} ta="center">
            {formatFileSize(doc.fileSize)}
            {doc.pageCount ? ` • ${doc.pageCount} pages` : doc.duration ? ` • ${doc.duration}` : ''}
          </Text>
        </Stack>

        {isFailed ? (
          <Stack align="center" gap={rem(12)}>
            <Group gap={rem(8)}>
              <IconAlertCircleFilled size={20} color="red" />
              <Text fw={700} c="red">Extraction failed</Text>
            </Group>
            <Text fz="sm" c="var(--bb-outline)" ta="center">
              The AI scribe could not process this file. It may be corrupted or in an unsupported format.
            </Text>
          </Stack>
        ) : (
          <Stack w="100%" gap={rem(12)}>
            <Group justify="space-between">
              <Text fz="sm" fw={700} c="var(--bb-on-surface-variant)">
                {extractionStageLabel(doc.extractionProgress)}
              </Text>
              <Text fz="sm" fw={800} c="var(--bb-primary)">{doc.extractionProgress}%</Text>
            </Group>
            <Progress
              value={doc.extractionProgress}
              size="md"
              radius="xl"
              color="var(--bb-primary)"
              bg="var(--bb-surface-container)"
              animated
            />
            <Group justify="center" gap={rem(8)} mt={rem(4)}>
              <Loader size="xs" color="var(--bb-primary)" />
              <Text fz="xs" c="var(--bb-outline)" fw={600}>
                The AI scribe is preparing your document. This page updates automatically.
              </Text>
            </Group>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

// ─── Ready view ──────────────────────────────────────────────────────────────

function ReadyView({ doc }: { doc: Document }) {
  const sortedWords = [...doc.extractedWords].sort((a, b) => b.frequency - a.frequency);

  return (
    <SimpleGrid cols={{ base: 1, lg: 3 }} spacing={rem(32)} style={{ alignItems: 'start' }}>
      {/* Extracted Text — spans 2 columns */}
      <Box style={{ gridColumn: 'span 2' }}>
        <Card radius={24} p={rem(40)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
          <Group justify="space-between" mb={rem(24)}>
            <Title order={3} fz={rem(18)} fw={800} c="var(--bb-on-surface)">Extracted Text</Title>
            <Group gap={rem(8)}>
              {doc.extractedWords.length > 0 && (
                <Badge color="green" variant="light" radius="sm" fw={800} fz={rem(11)}>
                  {doc.extractedWords.length} vocab words highlighted
                </Badge>
              )}
            </Group>
          </Group>

          {doc.extractedText ? (
            <ScrollArea h={rem(520)} offsetScrollbars>
              <Text
                className="hanzi"
                fz={rem(18)}
                lh={2}
                c="var(--bb-on-surface)"
                style={{ wordBreak: 'break-all' }}
              >
                <AnnotatedText text={doc.extractedText} words={doc.extractedWords} />
              </Text>
            </ScrollArea>
          ) : (
            <Text fz="sm" c="var(--bb-outline)" fw={600}>No text content was extracted from this document.</Text>
          )}
        </Card>
      </Box>

      {/* Vocabulary + Metadata — 1 column */}
      <Stack gap={rem(24)}>
        {/* Document metadata */}
        <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
          <Title order={3} fz={rem(16)} fw={800} c="var(--bb-on-surface)" mb={rem(20)}>Document Info</Title>
          <Stack gap={rem(14)}>
            <Group justify="space-between">
              <Text fz="sm" fw={600} c="var(--bb-outline)">HSK Level</Text>
              {doc.hskLevel != null ? (
                <Badge color="green" variant="light" radius="sm" fw={800}>HSK {doc.hskLevel}</Badge>
              ) : (
                <Text fz="sm" c="var(--bb-outline)">—</Text>
              )}
            </Group>
            <Group justify="space-between">
              <Text fz="sm" fw={600} c="var(--bb-outline)">File size</Text>
              <Text fz="sm" fw={700}>{formatFileSize(doc.fileSize)}</Text>
            </Group>
            {doc.pageCount != null && (
              <Group justify="space-between">
                <Text fz="sm" fw={600} c="var(--bb-outline)">Pages</Text>
                <Text fz="sm" fw={700}>{doc.pageCount}</Text>
              </Group>
            )}
            {doc.duration && (
              <Group justify="space-between">
                <Text fz="sm" fw={600} c="var(--bb-outline)">Duration</Text>
                <Text fz="sm" fw={700}>{doc.duration}</Text>
              </Group>
            )}
            <Group justify="space-between">
              <Text fz="sm" fw={600} c="var(--bb-outline)">Uploaded</Text>
              <Text fz="sm" fw={700}>{formatDate(doc.uploadedAt)}</Text>
            </Group>
          </Stack>

          {doc.tags.length > 0 && (
            <>
              <Divider my={rem(20)} color="var(--bb-surface-container)" />
              <Text fz="xs" fw={800} c="var(--bb-outline)" tt="uppercase" lts={rem(1)} mb={rem(12)}>Tags</Text>
              <Group gap={rem(6)}>
                {doc.tags.map((tag) => (
                  <Badge key={tag} variant="light" color="gray" radius="sm" fw={700} fz={rem(10)}>{tag}</Badge>
                ))}
              </Group>
            </>
          )}
        </Card>

        {/* Vocabulary list */}
        {sortedWords.length > 0 && (
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group justify="space-between" mb={rem(20)}>
              <Title order={3} fz={rem(16)} fw={800} c="var(--bb-on-surface)">Vocabulary</Title>
              <Box p={rem(8)} style={{ borderRadius: 8, backgroundColor: 'var(--bb-surface-container-low)', color: 'var(--bb-primary)', display: 'flex' }}>
                <IconBook2 size={18} />
              </Box>
            </Group>
            <ScrollArea h={rem(360)} offsetScrollbars>
              <Stack gap={rem(4)}>
                {sortedWords.map((word) => (
                  <Box
                    key={word.word}
                    p={rem(14)}
                    style={{
                      borderRadius: 14,
                      backgroundColor: 'var(--bb-surface-container-low)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap={rem(2)}>
                        <Text className="hanzi" fz={rem(20)} fw={700} lh={1.2}>{word.word}</Text>
                        <Text fz={rem(12)} fw={600} c="var(--bb-primary)" style={{ fontStyle: 'italic' }}>{word.pinyin}</Text>
                        <Text fz={rem(12)} c="var(--bb-on-surface-variant)">{word.meaning}</Text>
                      </Stack>
                      <Stack gap={rem(4)} align="flex-end" style={{ flexShrink: 0 }}>
                        <Badge color="green" variant="light" radius="sm" fw={800} fz={rem(10)}>HSK {word.hskLevel}</Badge>
                        <Text fz={rem(11)} c="var(--bb-outline)" fw={600}>{word.frequency}×</Text>
                      </Stack>
                    </Group>
                  </Box>
                ))}
              </Stack>
            </ScrollArea>
          </Card>
        )}
      </Stack>
    </SimpleGrid>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params?.id as string;
  const accessToken = session?.accessToken ?? '';

  const [doc, setDoc] = useState<Document | null>(null);
  const [notFound, setNotFound] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial fetch
  useEffect(() => {
    if (!accessToken || !id) return;
    getDocument(id, accessToken)
      .then(setDoc)
      .catch(() => setNotFound(true));
  }, [id, accessToken]);

  // Poll status while processing
  useEffect(() => {
    if (!doc || !accessToken) return;
    if (DONE_STATUSES.has(doc.extractionStatus)) return;

    pollRef.current = setInterval(async () => {
      try {
        const status = await getDocumentStatus(doc.id, accessToken);
        // Always keep progress in sync
        setDoc((prev) =>
          prev
            ? { ...prev, extractionProgress: status.extractionProgress, extractionStatus: status.extractionStatus as Document['extractionStatus'] }
            : prev,
        );
        if (DONE_STATUSES.has(status.extractionStatus)) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          // Fetch the full document (with extractedWords / text) once ready
          const full = await getDocument(doc.id, accessToken);
          setDoc(full);
        }
      } catch { /* ignore */ }
    }, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // Re-attach whenever the status changes (e.g. page opened while processing)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc?.extractionStatus, accessToken]);

  if (notFound) {
    return (
      <AppLayout title="Not Found">
        <Stack align="center" mt={rem(80)} gap={rem(16)}>
          <Text fz="xl" fw={700}>Document not found.</Text>
          <ActionIcon size="xl" radius="md" variant="light" color="gray" onClick={() => router.push('/library')}>
            <IconArrowLeft />
          </ActionIcon>
        </Stack>
      </AppLayout>
    );
  }

  if (!doc) {
    return (
      <AppLayout title="">
        <Group justify="center" mt={rem(80)}>
          <Loader color="var(--bb-primary)" />
        </Group>
      </AppLayout>
    );
  }

  const isProcessing = !DONE_STATUSES.has(doc.extractionStatus);
  const isReady      = doc.extractionStatus === 'ready';

  return (
    <AppLayout
      title={
        <Group gap={rem(12)} align="center">
          <ActionIcon variant="subtle" color="gray" onClick={() => router.push('/library')}>
            <IconArrowLeft size={22} />
          </ActionIcon>
          <Stack gap={rem(2)}>
            <Title order={1} fz={rem(22)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.3) }}>
              {doc.fileName}
            </Title>
            <Group gap={rem(8)}>
              {doc.hskLevel != null && (
                <Badge color="green" variant="light" radius="sm" fw={800} fz={rem(10)}>HSK {doc.hskLevel}</Badge>
              )}
              {isProcessing && (
                <Group gap={rem(4)}>
                  <Loader size={10} color="var(--bb-primary)" />
                  <Text fz={rem(12)} fw={700} c="var(--bb-primary)">Processing…</Text>
                </Group>
              )}
              {isReady && (
                <Group gap={rem(4)}>
                  <IconCircleCheckFilled size={14} color="var(--bb-primary)" />
                  <Text fz={rem(12)} fw={700} c="var(--bb-primary)">Ready</Text>
                </Group>
              )}
            </Group>
          </Stack>
        </Group>
      }
    >
      {isProcessing || doc.extractionStatus === ('failed' as string) || doc.extractionStatus === 'error'
        ? <ProcessingCard doc={doc} />
        : <ReadyView doc={doc} />
      }
    </AppLayout>
  );
}
