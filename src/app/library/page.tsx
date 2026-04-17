'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedValue } from '@mantine/hooks';
import {
  Title,
  Text,
  Stack,
  Group,
  Card,
  Button,
  Box,
  TextInput,
  Badge,
  rem,
  ActionIcon,
  Table,
  Progress,
  ScrollArea,
  Menu,
  Modal,
  Loader,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  IconUpload,
  IconSearch,
  IconFileTypePdf,
  IconVideo,
  IconHeadphones,
  IconFileTypePpt,
  IconDots,
  IconCircleCheckFilled,
  IconAlertCircleFilled,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
  IconCards,
  IconListCheck,
} from '@tabler/icons-react';
import { CreateDeckModal } from '@/components/flashcards/CreateDeckModal';
import { QuizSetupModal } from '@/components/quiz/QuizSetupModal';
import SearchResultCard from '@/components/library/SearchResultCard';
import { searchDocuments } from '@/lib/api/search';
import type { DocumentSearchResult } from '@/types/search';
import {
  uploadDocument,
  listDocuments,
  getDocument,
  getDocumentStatus,
  deleteDocument,
  type Document,
  type FileTypeFilter,
} from '@/lib/documents';

const PAGE_SIZE = 10;
const FILTER_TAGS = ['All', 'PDFs', 'Videos', 'Audios', 'HSK 1', 'HSK 2', 'HSK 3', 'HSK 4+'];
const ACCEPTED_TYPES = '.pdf,.mp4,.mov,.avi,.mp3,.wav,.m4a,.ogg,.ppt,.pptx,application/pdf,video/*,audio/*,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';
const MAX_SIZE = 100 * 1024 * 1024;

function getApiParams(filter: string, searchText: string): { fileType: FileTypeFilter; search?: string; hskLevel?: number } {
  switch (filter) {
    case 'PDFs':  return { fileType: 'pdf',   search: searchText || undefined };
    case 'Videos': return { fileType: 'video', search: searchText || undefined };
    case 'Audios': return { fileType: 'audio', search: searchText || undefined };
    case 'HSK 1': return { fileType: 'all', search: searchText || undefined, hskLevel: 1 };
    case 'HSK 2': return { fileType: 'all', search: searchText || undefined, hskLevel: 2 };
    case 'HSK 3': return { fileType: 'all', search: searchText || undefined, hskLevel: 3 };
    case 'HSK 4+': return { fileType: 'all', search: searchText || undefined, hskLevel: 4 };
    default:      return { fileType: 'all',   search: searchText || undefined };
  }
}

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType === 'video') return <IconVideo size={18} />;
  if (fileType === 'audio') return <IconHeadphones size={18} />;
  if (fileType === 'ppt')   return <IconFileTypePpt size={18} />;
  return <IconFileTypePdf size={18} />;
}

function fileTypeLabel(fileType: string): string {
  const labels: Record<string, string> = {
    pdf: 'PDF DOCUMENT', video: 'VIDEO CLIP', audio: 'AUDIO RECORDING', ppt: 'PRESENTATION',
  };
  return labels[fileType] ?? fileType.toUpperCase();
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function extractionStageLabel(progress: number): string {
  if (progress < 20) return 'Downloading from storage…';
  if (progress < 50) return 'Extracting text content…';
  if (progress < 80) return 'Identifying vocabulary with AI…';
  if (progress < 90) return 'Generating content tags…';
  if (progress < 100) return 'Calculating HSK level…';
  return 'Finalizing…';
}

function LibraryPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = session?.accessToken ?? '';

  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tokenCacheRef = useRef<Map<number, string | undefined>>(new Map([[1, undefined]]));

  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const prevFilterRef = useRef(activeFilter);
  const prevSearchRef = useRef(debouncedSearch);

  const [aiSearchResults, setAiSearchResults] = useState<DocumentSearchResult | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tracks a document that was just uploaded and is being processed
  const [uploadingDoc, setUploadingDoc] = useState<{
    id: string; fileName: string; progress: number; status: string;
  } | null>(null);
  const uploadPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [createDeckDoc, setCreateDeckDoc] = useState<{ id: string; name: string } | null>(null);
  const [quizDoc, setQuizDoc] = useState<{ id: string; name: string } | null>(null);

  // Read `q` query param on mount (from dashboard search)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // AI semantic search effect
  useEffect(() => {
    if (!accessToken || !debouncedSearch.trim()) {
      setAiSearchResults(null);
      return;
    }

    let cancelled = false;
    setIsAiSearching(true);

    const fileType = ['PDFs', 'Videos', 'Audios'].includes(activeFilter)
      ? activeFilter.slice(0, -1).toLowerCase()
      : undefined;
    const hskLevel = activeFilter.startsWith('HSK') ? parseInt(activeFilter.split(' ')[1]) : undefined;

    searchDocuments(debouncedSearch, accessToken, { top: 10, fileType, hskLevel })
      .then((results) => { if (!cancelled) setAiSearchResults(results); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setIsAiSearching(false); });

    return () => { cancelled = true; };
  }, [debouncedSearch, activeFilter, accessToken]);

  // Main fetch effect
  useEffect(() => {
    if (!accessToken) return;

    const filterChanged =
      prevFilterRef.current !== activeFilter || prevSearchRef.current !== debouncedSearch;

    let page = currentPage;
    if (filterChanged) {
      prevFilterRef.current = activeFilter;
      prevSearchRef.current = debouncedSearch;
      tokenCacheRef.current.clear();
      tokenCacheRef.current.set(1, undefined);
      page = 1;
      if (currentPage !== 1) {
        setCurrentPage(1);
        // Will re-run once currentPage settles to 1
      }
    }

    const token = page === 1 ? undefined : tokenCacheRef.current.get(page);
    const { fileType, search: apiSearch } = getApiParams(activeFilter, debouncedSearch);

    let cancelled = false;
    setLoading(true);

    listDocuments(accessToken, { pageSize: PAGE_SIZE, continuationToken: token, fileType, search: apiSearch })
      .then((result) => {
        if (cancelled) return;
        setDocuments(result.items);
        setTotalCount(result.pagination.totalCount);
        setHasMore(result.pagination.hasMore);
        if (result.pagination.continuationToken) {
          tokenCacheRef.current.set(page + 1, result.pagination.continuationToken);
        }
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [accessToken, currentPage, activeFilter, debouncedSearch]);

  // Poll for documents that are pending/analyzing
  useEffect(() => {
    if (!accessToken) return;
    const inProgress = documents.filter(
      (d) => d.extractionStatus === 'pending' || d.extractionStatus === 'analyzing',
    );
    if (inProgress.length === 0) return;

    const interval = setInterval(async () => {
      for (const doc of inProgress) {
        try {
          const updated = await getDocument(doc.id, accessToken);
          setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        } catch { /* ignore */ }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [documents, accessToken]);

  // Cleanup poll on unmount
  useEffect(() => () => { if (uploadPollRef.current) clearInterval(uploadPollRef.current); }, []);

  function refreshList() {
    tokenCacheRef.current.clear();
    tokenCacheRef.current.set(1, undefined);
    prevFilterRef.current = '';
    setCurrentPage(1);
  }

  async function handleUpload(file: File) {
    if (!accessToken) return;
    if (file.size > MAX_SIZE) {
      setUploadError('File size exceeds 100MB limit.');
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const doc = await uploadDocument(file, accessToken);
      setUploading(false);

      // Start tracking the extraction progress
      setUploadingDoc({ id: doc.id, fileName: doc.fileName, progress: 0, status: 'pending' });

      uploadPollRef.current = setInterval(async () => {
        try {
          const status = await getDocumentStatus(doc.id, accessToken);
          setUploadingDoc((prev) =>
            prev ? { ...prev, progress: status.extractionProgress, status: status.extractionStatus } : null,
          );
          if (['ready', 'failed', 'error'].includes(status.extractionStatus)) {
            clearInterval(uploadPollRef.current!);
            uploadPollRef.current = null;
            // Show final state briefly, then refresh the archive
            setTimeout(() => { setUploadingDoc(null); refreshList(); }, 1800);
          }
        } catch { /* ignore transient errors */ }
      }, 3000);
    } catch (e) {
      setUploading(false);
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  }

  async function confirmDelete() {
    if (!deleteTargetId || !accessToken) return;
    setDeleting(true);
    try {
      await deleteDocument(deleteTargetId, accessToken);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTargetId));
      setTotalCount((n) => n - 1);
      setDeleteTargetId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const showingFrom = (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <AppLayout
      title={
        <Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>
          Library
        </Title>
      }
    >
      <Stack gap={rem(48)}>
        {/* Hero Upload Area */}
        <Card
          radius={32}
          p={rem(64)}
          style={{
            background: 'linear-gradient(135deg, #154212 0%, #2d5a27 100%)',
            color: 'white',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box style={{ position: 'absolute', right: rem(100), top: rem(-40), opacity: 0.1, pointerEvents: 'none' }}>
            <IconUpload size={rem(400)} />
          </Box>

          <Group justify="space-between" align="center" wrap="nowrap" style={{ position: 'relative', zIndex: 1 }}>
            <Stack gap={rem(32)} maw={500}>
              <Stack gap={rem(12)}>
                <Title order={1} fz={rem(48)} fw={800} style={{ letterSpacing: rem(-1.5) }}>
                  Feed your curiosity.
                </Title>
                <Text fz={rem(18)} fw={500} style={{ opacity: 0.9 }}>
                  Drag manuscripts, recordings, or lectures here. Our AI scribe will prepare them for your scholarly review.
                </Text>
              </Stack>
              <Group gap="xl">
                <IconFileTypePdf size={32} style={{ opacity: 0.8 }} />
                <IconVideo size={32} style={{ opacity: 0.8 }} />
                <IconHeadphones size={32} style={{ opacity: 0.8 }} />
                <IconFileTypePpt size={32} style={{ opacity: 0.8 }} />
              </Group>
            </Stack>

            <Card
              radius={24}
              p={rem(40)}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragEnter={() => setIsDragOver(true)}
              onDragLeave={() => setIsDragOver(false)}
              style={{
                width: rem(420),
                backgroundColor: isDragOver ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
                border: `2px dashed ${isDragOver ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <Stack align="center" gap={rem(24)}>
                {uploading ? (
                  <Stack align="center" gap={rem(12)}>
                    <Loader color="white" size="md" />
                    <Text fz={rem(14)} fw={700} style={{ opacity: 0.85 }}>Uploading…</Text>
                  </Stack>
                ) : (
                  <>
                    <Text fz={rem(16)} fw={700}>
                      Drag and drop scrolls here.<br />
                      <span style={{ opacity: 0.6, fontSize: rem(14) }}>Max size 100MB per file</span>
                    </Text>
                    {uploadError && (
                      <Text fz={rem(13)} fw={700} style={{ color: '#ffb3b3' }}>{uploadError}</Text>
                    )}
                    <Button
                      size="lg"
                      radius={12}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        backgroundColor: 'white',
                        color: 'var(--bb-primary)',
                        fontWeight: 800,
                        paddingLeft: rem(32),
                        paddingRight: rem(32),
                      }}
                    >
                      Browse Files
                    </Button>
                  </>
                )}
              </Stack>
            </Card>
          </Group>
        </Card>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />

        {/* Upload Progress Tracker */}
        {uploadingDoc && (
          <Card
            radius={20}
            p={rem(24)}
            style={{
              backgroundColor: 'var(--bb-surface-container-lowest)',
              border: '1px solid var(--bb-surface-container)',
            }}
          >
            <Group wrap="nowrap" align="center" gap={rem(20)}>
              <Box
                p={rem(12)}
                style={{ backgroundColor: 'var(--bb-surface-container)', borderRadius: 12, display: 'flex', flexShrink: 0 }}
              >
                <IconUpload size={20} color="var(--bb-primary)" />
              </Box>
              <Stack gap={rem(6)} style={{ flex: 1, minWidth: 0 }}>
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={700} fz="sm" truncate>{uploadingDoc.fileName}</Text>
                  {['failed', 'error'].includes(uploadingDoc.status) ? (
                    <Badge color="red" variant="light" size="sm" radius="sm" fw={800}>Failed</Badge>
                  ) : uploadingDoc.status === 'ready' ? (
                    <Badge color="green" variant="light" size="sm" radius="sm" fw={800}>Ready</Badge>
                  ) : (
                    <Text fz="xs" fw={700} c="var(--bb-primary)">{uploadingDoc.progress}%</Text>
                  )}
                </Group>
                {['failed', 'error'].includes(uploadingDoc.status) ? (
                  <Group gap={rem(6)}>
                    <IconAlertCircleFilled size={14} color="red" />
                    <Text fz="xs" c="red" fw={600}>Extraction failed. The file may be unreadable.</Text>
                  </Group>
                ) : uploadingDoc.status === 'ready' ? (
                  <Group gap={rem(6)}>
                    <IconCircleCheckFilled size={14} color="var(--bb-primary)" />
                    <Text fz="xs" c="var(--bb-primary)" fw={600}>Document ready — loading your archive…</Text>
                  </Group>
                ) : (
                  <>
                    <Progress value={uploadingDoc.progress} size="xs" color="var(--bb-primary)" radius="xl" animated />
                    <Text fz="xs" c="var(--bb-outline)" fw={600}>{extractionStageLabel(uploadingDoc.progress)}</Text>
                  </>
                )}
              </Stack>
            </Group>
          </Card>
        )}

        {/* The Archive Section */}
        <Stack gap={rem(32)}>
          <Stack gap={rem(4)}>
            <Title order={2} fz={rem(24)} fw={800} c="var(--bb-on-surface)">The Archive</Title>
            <Text fz="sm" fw={600} c="var(--bb-outline)">
              Your personal collection of {totalCount} scholarly resources
            </Text>
          </Stack>

          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Stack gap={rem(32)}>
              {/* Search & Filter */}
              <Group justify="space-between" wrap="wrap" gap="sm">
                <TextInput
                  placeholder="Search title, HSK, or tag..."
                  leftSection={<IconSearch size={18} color="var(--bb-outline)" />}
                  value={search}
                  onChange={(e) => {
                    if (!activeFilter.startsWith('HSK')) setSearch(e.currentTarget.value);
                  }}
                  disabled={activeFilter.startsWith('HSK')}
                  styles={{
                    input: {
                      width: rem(340),
                      height: rem(44),
                      borderRadius: rem(12),
                      backgroundColor: 'var(--bb-surface-container-low)',
                      border: 'none',
                    },
                  }}
                />
                <Group gap={rem(8)}>
                  {FILTER_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={tag === activeFilter ? 'filled' : 'light'}
                      color={tag === activeFilter ? 'var(--bb-primary)' : 'gray'}
                      radius="sm"
                      px={rem(14)}
                      py={rem(12)}
                      fw={800}
                      fz={rem(11)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => {
                        setActiveFilter(tag);
                        if (tag.startsWith('HSK')) setSearch('');
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </Group>

              {/* AI Search Results */}
              {aiSearchResults && (
                <Stack gap={rem(16)}>
                  <Group justify="space-between" align="center">
                    <Text fz="sm" fw={600} c="var(--bb-outline)">
                      {aiSearchResults.totalCount} documents found for &quot;{aiSearchResults.query}&quot;
                    </Text>
                    {isAiSearching && <Loader size="xs" color="var(--bb-primary)" />}
                  </Group>

                  {aiSearchResults.hits.length === 0 ? (
                    <Stack align="center" py={rem(48)} gap={rem(8)}>
                      <Text fz={rem(36)}>🔍</Text>
                      <Text fw={700} c="var(--bb-on-surface)">
                        No documents found for &quot;{search}&quot;
                      </Text>
                      <Text fz="sm" c="var(--bb-outline)" fw={600}>
                        Try different keywords or upload relevant documents
                      </Text>
                    </Stack>
                  ) : (
                    <Stack gap={0}>
                      {aiSearchResults.hits.map((hit) => (
                        <SearchResultCard
                          key={hit.documentId}
                          hit={hit}
                          onOpen={() => router.push(`/library/${hit.documentId}`)}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              )}

              {/* File Table — hidden when AI search is active */}
              {!aiSearchResults && (<ScrollArea>
                {loading ? (
                  <Group justify="center" py={rem(48)}>
                    <Loader color="var(--bb-primary)" />
                  </Group>
                ) : documents.length === 0 ? (
                  <Text ta="center" py={rem(48)} c="var(--bb-outline)" fw={600}>
                    No documents found.
                  </Text>
                ) : (
                  <Table
                    verticalSpacing="md"
                    styles={{
                      thead: { borderBottom: '1px solid var(--bb-surface-container)' },
                      th: { color: 'var(--bb-outline)', fontWeight: 800, fontSize: rem(11), textTransform: 'uppercase', letterSpacing: rem(1) },
                      tr: { transition: 'background-color 0.2s ease' },
                      td: { borderBottom: '1px solid var(--bb-surface-container)' },
                    }}
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>File Name</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>HSK Level</Table.Th>
                        <Table.Th>Upload Date</Table.Th>
                        <Table.Th>AI Extraction</Table.Th>
                        <Table.Th />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {documents.map((doc) => (
                        <Table.Tr
                          key={doc.id}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          onClick={() => router.push(`/library/${doc.id}`)}
                        >
                          <Table.Td>
                            <Group gap="sm">
                              <Box p={rem(10)} bg="var(--bb-surface-container)" style={{ borderRadius: 10, display: 'flex' }}>
                                <FileIcon fileType={doc.fileType} />
                              </Box>
                              <Stack gap={rem(2)}>
                                <Text fw={700} fz="sm">{doc.fileName}</Text>
                                <Text fz="xs" c="var(--bb-outline)" fw={600}>
                                  {formatFileSize(doc.fileSize)}
                                  {doc.pageCount ? ` • ${doc.pageCount} pages` : doc.duration ? ` • ${doc.duration}` : ''}
                                </Text>
                              </Stack>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text fz="xs" fw={800} c="var(--bb-on-surface-variant)">{fileTypeLabel(doc.fileType)}</Text>
                          </Table.Td>
                          <Table.Td>
                            {doc.hskLevel != null ? (
                              <Badge color="green" variant="light" radius="sm" fw={800} fz={rem(10)}>
                                HSK {doc.hskLevel}
                              </Badge>
                            ) : (
                              <Text fz="xs" c="var(--bb-outline)">—</Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Text fz="xs" fw={700} c="var(--bb-outline)">{formatDate(doc.uploadedAt)}</Text>
                          </Table.Td>
                          <Table.Td>
                            {doc.extractionStatus === 'ready' ? (
                              <Group gap={rem(4)}>
                                <IconCircleCheckFilled size={16} color="var(--bb-primary)" />
                                <Text fz="xs" fw={800} c="var(--bb-primary)">Ready</Text>
                              </Group>
                            ) : doc.extractionStatus === 'analyzing' || doc.extractionStatus === 'pending' ? (
                              <Stack gap={rem(4)} w={100}>
                                <Text fz="xs" fw={800} c="var(--bb-primary)">
                                  {doc.extractionProgress}% Analyzing
                                </Text>
                                <Progress value={doc.extractionProgress} size="xs" color="var(--bb-primary)" radius="xl" />
                              </Stack>
                            ) : (
                              <Group gap={rem(4)}>
                                <IconAlertCircleFilled size={16} color="red" />
                                <Text fz="xs" fw={800} c="red">Error</Text>
                              </Group>
                            )}
                          </Table.Td>
                          <Table.Td onClick={(e) => e.stopPropagation()}>
                            <Menu position="bottom-end" withinPortal>
                              <Menu.Target>
                                <ActionIcon variant="subtle" color="gray">
                                  <IconDots size={20} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                {doc.extractionStatus === 'ready' && (
                                  <>
                                    <Menu.Item
                                      leftSection={<IconListCheck size={14} />}
                                      onClick={() => setQuizDoc({ id: doc.id, name: doc.fileName })}
                                    >
                                      Start Quiz
                                    </Menu.Item>
                                    <Menu.Item
                                      leftSection={<IconCards size={14} />}
                                      onClick={() => setCreateDeckDoc({ id: doc.id, name: doc.fileName })}
                                    >
                                      Create Flashcard Deck
                                    </Menu.Item>
                                    <Menu.Divider />
                                  </>
                                )}
                                <Menu.Item
                                  color="red"
                                  leftSection={<IconTrash size={14} />}
                                  onClick={() => setDeleteTargetId(doc.id)}
                                >
                                  Delete
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </ScrollArea>)}

              {/* Pagination */}
              {!aiSearchResults && !loading && totalCount > 0 && (
                <Stack gap={rem(16)} align="center" mt={rem(16)}>
                  <Group gap={rem(12)}>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <IconChevronLeft size={18} />
                    </ActionIcon>
                    <Text fz="sm" fw={700} c="var(--bb-on-surface)">
                      Page {currentPage} of {totalPages}
                    </Text>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      disabled={!hasMore}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <IconChevronRight size={18} />
                    </ActionIcon>
                  </Group>
                  <Text fz="xs" fw={700} c="var(--bb-outline)">
                    Showing {showingFrom}–{showingTo} of {totalCount} scholarly assets
                  </Text>
                </Stack>
              )}
            </Stack>
          </Card>
        </Stack>
      </Stack>

      {/* Start Quiz Modal */}
      <QuizSetupModal
        isOpen={!!quizDoc}
        onClose={() => setQuizDoc(null)}
        sourceType="document"
        sourceId={quizDoc?.id ?? ''}
        sourceName={quizDoc?.name ?? ''}
      />

      {/* Create Flashcard Deck Modal */}
      <CreateDeckModal
        isOpen={!!createDeckDoc}
        onClose={() => setCreateDeckDoc(null)}
        defaultDocumentId={createDeckDoc?.id}
        defaultDocumentName={createDeckDoc?.name}
        onCreated={(deck) => {
          setCreateDeckDoc(null);
          router.push(`/study-center/${deck.id}`);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title={<Text fw={800} fz="md">Delete document?</Text>}
        centered
        radius={16}
      >
        <Stack gap={rem(24)}>
          <Text fz="sm" c="var(--bb-on-surface-variant)">
            This will permanently remove the document and its extracted content. This cannot be undone.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button color="red" loading={deleting} onClick={confirmDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>


    </AppLayout>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={null}>
      <LibraryPageContent />
    </Suspense>
  );
}
