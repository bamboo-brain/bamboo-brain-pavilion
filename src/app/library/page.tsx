'use client';

import { useState } from 'react';
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
  Tabs,
  ActionIcon,
  Table,
  Progress,
  ScrollArea,
  Pagination,
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
} from '@tabler/icons-react';

const LIBRARY_FILES = [
  {
    id: '1',
    name: 'Beijing_Travel_Guide_V2.pdf',
    size: '4.2 MB',
    pages: '12',
    type: 'PDF DOCUMENT',
    hsk: 'HSK 4',
    date: 'Oct 24, 2023',
    status: 'Ready',
    progress: 100,
  },
  {
    id: '2',
    name: 'Daily_Life_Dialogue.mp4',
    size: '48.5 MB',
    duration: '15:20',
    type: 'VIDEO CLIP',
    hsk: 'HSK 3',
    date: 'Oct 23, 2023',
    status: 'Analyzing',
    progress: 92,
  },
  {
    id: '3',
    name: 'Business_Chinese_L6.mp3',
    size: '12.8 MB',
    duration: '45:00',
    type: 'AUDIO RECORDING',
    hsk: 'HSK 5',
    date: 'Oct 22, 2023',
    status: 'Ready',
    progress: 100,
  },
  {
    id: '4',
    name: 'Character_Writing_Manual.pdf',
    size: '1.5 MB',
    pages: '8',
    type: 'PDF DOCUMENT',
    hsk: 'HSK 1',
    date: 'Oct 21, 2023',
    status: 'Error',
    progress: 0,
    error: 'File unreadable',
  },
];

const FILTER_TAGS = ['All', 'PDFs', 'Videos', 'Audios', 'HSK 1', 'HSK 2', 'HSK 3', 'HSK 4+'];

export default function LibraryPage() {
  const [activePage, setPage] = useState(1);
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
          {/* Subtle Watermark Arrow */}
          <Box style={{
            position: 'absolute',
            right: rem(100),
            top: rem(-40),
            opacity: 0.1,
            pointerEvents: 'none',
          }}>
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
              style={{
                width: rem(420),
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Stack align="center" gap={rem(24)}>
                <Text fz={rem(16)} fw={700}>Drag and drop scrolls here.<br /><span style={{ opacity: 0.6, fontSize: rem(14) }}>Max size 100MB per file</span></Text>
                <Button
                  size="lg"
                  radius={12}
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
              </Stack>
            </Card>
          </Group>
        </Card>

        {/* The Archive Section */}
        <Stack gap={rem(32)}>
          <Stack gap={rem(4)}>
            <Title order={2} fz={rem(24)} fw={800} c="var(--bb-on-surface)">The Archive</Title>
            <Text fz="sm" fw={600} c="var(--bb-outline)">Your personal collection of 128 scholarly resources</Text>
          </Stack>

          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Stack gap={rem(32)}>
              {/* Search & Tabs Overlay */}
              <Group justify="space-between">
                <TextInput
                  placeholder="Search title, HSK, or tag..."
                  leftSection={<IconSearch size={18} color="var(--bb-outline)" />}
                  styles={{
                    input: {
                      width: rem(340),
                      height: rem(44),
                      borderRadius: rem(12),
                      backgroundColor: 'var(--bb-surface-container-low)',
                      border: 'none',
                    }
                  }}
                />
                <Group gap={rem(8)}>
                  {FILTER_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={tag === 'All' ? 'filled' : 'light'}
                      color={tag === 'All' ? 'var(--bb-primary)' : 'gray'}
                      radius="sm"
                      px={rem(14)}
                      py={rem(12)}
                      fw={800}
                      fz={rem(11)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </Group>

              {/* File Table */}
              <ScrollArea>
                <Table verticalSpacing="md" styles={{
                  thead: { borderBottom: '1px solid var(--bb-surface-container)' },
                  th: { color: 'var(--bb-outline)', fontWeight: 800, fontSize: rem(11), textTransform: 'uppercase', letterSpacing: rem(1) },
                  tr: { transition: 'background-color 0.2s ease' },
                  td: { borderBottom: '1px solid var(--bb-surface-container)' }
                }}>
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
                    {LIBRARY_FILES.map((file) => (
                      <Table.Tr key={file.id} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <Table.Td>
                          <Group gap="sm">
                            <Box p={rem(10)} bg="var(--bb-surface-container)" style={{ borderRadius: 10, display: 'flex' }}>
                              {file.type.includes('PDF') ? <IconFileTypePdf size={18} /> : file.type.includes('VIDEO') ? <IconVideo size={18} /> : <IconHeadphones size={18} />}
                            </Box>
                            <Stack gap={rem(2)}>
                              <Text fw={700} fz="sm">{file.name}</Text>
                              <Text fz="xs" c="var(--bb-outline)" fw={600}>
                                {file.size} • {file.pages ? `${file.pages} pages` : file.duration}
                              </Text>
                            </Stack>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text fz="xs" fw={800} c="var(--bb-on-surface-variant)">{file.type}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="green" variant="light" radius="sm" fw={800} fz={rem(10)}>{file.hsk}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text fz="xs" fw={700} c="var(--bb-outline)">{file.date}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {file.status === 'Ready' ? (
                              <Group gap={rem(4)}>
                                <IconCircleCheckFilled size={16} color="var(--bb-primary)" />
                                <Text fz="xs" fw={800} c="var(--bb-primary)">Ready</Text>
                              </Group>
                            ) : file.status === 'Analyzing' ? (
                              <Stack gap={rem(4)} w={100}>
                                <Text fz="xs" fw={800} c="var(--bb-primary)">{file.progress}% Analyzing</Text>
                                <Progress value={file.progress} size="xs" color="var(--bb-primary)" radius="xl" />
                              </Stack>
                            ) : (
                              <Group gap={rem(4)}>
                                <IconAlertCircleFilled size={16} color="red" />
                                <Text fz="xs" fw={800} c="red">{file.error}</Text>
                              </Group>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDots size={20} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              <Stack gap={rem(16)} align="center" mt={rem(16)}>
                <Pagination
                  value={activePage}
                  onChange={setPage}
                  total={32}
                  radius="md"
                  color="var(--bb-primary)"
                />
                <Text fz="xs" fw={700} c="var(--bb-outline)">
                  Showing {(activePage-1)*4 + 1} to {Math.min(activePage*4, 128)} of 128 scholarly assets
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </AppLayout>
  );
}
