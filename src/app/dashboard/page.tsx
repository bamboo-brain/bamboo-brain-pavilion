'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import {
  Title,
  Text,
  Stack,
  Group,
  Card,
  Progress,
  Button,
  Box,
  SimpleGrid,
  UnstyledButton,
  Badge,
  rem,
  Skeleton,
  TextInput,
} from '@mantine/core';
import { AddTaskModal } from '@/components/dashboard/AddTaskModal';
import { ActivityHeatmap } from '@/components/stats/ActivityHeatmap';
import { StreakCounter } from '@/components/stats/StreakCounter';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  TreeIcon,
  FireIcon,
} from '@/components/icons';
import {
  IconUpload,
  IconChartLine,
  IconChevronRight,
  IconFileTypePdf,
  IconVideo,
  IconHeadphones,
  IconFileTypePpt,
  IconBook2,
  IconMicrophone,
  IconBrain,
  IconSearch,
} from '@tabler/icons-react';
import { listDocuments, type Document } from '@/lib/documents';
import { getUserStats } from '@/lib/api/planner';
import type { UserStats } from '@/types/stats';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function docIcon(fileType: string) {
  if (fileType === 'video') return <IconVideo size={20} />;
  if (fileType === 'audio') return <IconHeadphones size={20} />;
  if (fileType === 'ppt')   return <IconFileTypePpt size={20} />;
  return <IconFileTypePdf size={20} />;
}

function docMeta(doc: Document): string {
  if (doc.extractionStatus === 'ready') {
    return doc.extractedWords.length > 0
      ? `${doc.extractedWords.length} vocab words extracted`
      : 'Ready to study';
  }
  if (doc.extractionStatus === 'analyzing') return 'AI Extraction Active';
  if (doc.extractionStatus === 'pending')   return 'Queued for extraction';
  return 'Extraction error';
}

function docStatus(doc: Document): { label: string; color: string } {
  if (doc.extractionStatus === 'ready') return { label: 'READY TO STUDY', color: 'green' };
  if (doc.extractionStatus === 'analyzing' || doc.extractionStatus === 'pending')
    return { label: 'EXTRACTING...', color: 'blue' };
  return { label: 'ERROR', color: 'red' };
}

const HSK_LABELS: Record<number, { label: string; hanzi: string }> = {
  0: { label: 'Absolute Beginner', hanzi: '初级' },
  1: { label: 'HSK Level 1',       hanzi: '一级' },
  2: { label: 'HSK Level 2',       hanzi: '二级' },
  3: { label: 'HSK Level 3',       hanzi: '三级' },
  4: { label: 'HSK Level 4',       hanzi: '四级' },
  5: { label: 'HSK Level 5',       hanzi: '五级' },
  6: { label: 'HSK Level 6',       hanzi: '六级' },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [taskModalOpened, { close: closeTaskModal }] = useDisclosure(false);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [dashQuery, setDashQuery] = useState('');

  const accessToken = session?.accessToken ?? '';
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Scholar';
  const hskLevel = session?.user?.hskLevel ?? 1;
  const hsk = HSK_LABELS[hskLevel] ?? HSK_LABELS[1];

  // Derive current-week streak day highlights from real data
  const streakDays: boolean[] = (() => {
    if (!userStats?.streakHistory?.length) return Array(7).fill(false);
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      return userStats.streakHistory.some((s) => s.date.startsWith(iso) && s.active);
    });
  })();

  // Current HSK level progress (0–100)
  const hskProgress = userStats?.hskProgress.find((p) => p.level === hskLevel);
  const hskProgressPct = hskProgress?.percentage ?? 0;

  // Today's activity
  const todayIso = new Date().toISOString().split('T')[0];
  const todayActivity = userStats?.dailyActivity.find((d) => d.date.startsWith(todayIso));
  const HANZI_GOAL = 50;
  const QUIZ_GOAL = 2;
  const MINUTES_GOAL = 45;

  useEffect(() => {
    if (!accessToken) return;
    setLoadingDocs(true);
    listDocuments(accessToken, { pageSize: 3 })
      .then((res) => setRecentDocs(res.items))
      .catch(console.error)
      .finally(() => setLoadingDocs(false));
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    getUserStats(accessToken).then(setUserStats).catch(() => {});
  }, [accessToken]);

  return (
    <AppLayout
      title={
        <Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>
          Welcome back, {firstName}.
        </Title>
      }
    >
      {/* ── Dashboard Content ────────────────────────────────── */}
      <Stack gap={rem(64)}>

        {/* Feature Grid: Status & Streak */}
        <SimpleGrid cols={{ base: 1, lg: 5 }} spacing={rem(32)}>
          {/* Current Stage Card */}
          <Box style={{ gridColumn: 'span 3' }}>
            <Card
              radius={24}
              p={rem(48)}
              h="100%"
              style={{
                backgroundColor: 'var(--bb-surface-container-lowest)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  right: rem(-60),
                  bottom: rem(-60),
                  opacity: 0.04,
                  color: 'var(--bb-primary)',
                  pointerEvents: 'none',
                }}
              >
                <TreeIcon size={rem(340)} />
              </Box>
              <Stack gap={rem(40)} style={{ position: 'relative', zIndex: 1 }}>
                <Badge
                  variant="light"
                  color="cyan"
                  radius="sm"
                  px={rem(14)}
                  py={rem(10)}
                  fw={800}
                  fz={rem(11)}
                  style={{ width: 'fit-content', backgroundColor: '#e0f2ff', color: '#004a77' }}
                >
                  CURRENT STAGE
                </Badge>

                <Stack gap={rem(12)}>
                  <Title order={2} fz={rem(36)} fw={800} c="var(--bb-on-surface)">
                    {hsk.label} <span className="hanzi" style={{ fontSize: rem(32), marginLeft: rem(8) }}>{hsk.hanzi}</span>
                  </Title>
                  <Text fz={rem(18)} c="var(--bb-on-surface-variant)" lh={1.6} maw={600} fw={500}>
                    {hskProgressPct > 0
                      ? `You're ${hskProgressPct}% through HSK ${hskLevel}. Keep pushing to reach HSK ${Math.min(hskLevel + 1, 6)} proficiency.`
                      : `Start studying to build your HSK ${hskLevel} progress.`}
                  </Text>
                </Stack>

                <Stack gap={rem(12)}>
                  <Group justify="space-between">
                    <Text fz={rem(12)} fw={700} c="var(--bb-outline)" tt="uppercase" lts={rem(1.2)}>
                      HSK {hskLevel} Start
                    </Text>
                    <Text fz={rem(12)} fw={700} c="var(--bb-outline)" tt="uppercase" lts={rem(1.2)}>
                      HSK {Math.min(hskLevel + 1, 6)} Bridge
                    </Text>
                  </Group>
                  <Progress
                    value={hskProgressPct}
                    size="lg"
                    radius="xl"
                    color="var(--bb-primary)"
                    bg="var(--bb-surface-container)"
                    style={{ height: rem(10) }}
                  />
                </Stack>
              </Stack>
            </Card>
          </Box>

          {/* Weekly Streak Card */}
          <Box style={{ gridColumn: 'span 2' }}>
            <Card
              radius={24}
              p={rem(48)}
              style={{
                background: 'linear-gradient(135deg, #0a220a 0%, #154212 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(21, 66, 18, 0.2)',
              }}
            >
              <Stack gap={rem(32)} align="center" justify="center" h="100%">
                <Text fz={rem(13)} fw={700} tt="uppercase" lts={rem(2.5)} style={{ opacity: 0.8 }}>
                  Weekly Streak
                </Text>
                <Group gap="md" align="center">
                  <FireIcon size={rem(48)} style={{ color: '#bcf0ae' }} />
                  <Title fz={rem(56)} fw={800} style={{ letterSpacing: rem(-1) }}>
                    {userStats?.currentStreak ?? 0} Days
                  </Title>
                </Group>
                <Group gap={rem(10)} justify="center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                    const active = streakDays[idx];
                    return (
                      <Box
                        key={idx}
                        style={{
                          width: rem(38), height: rem(38), borderRadius: rem(10),
                          backgroundColor: active ? '#bcf0ae' : 'rgba(255, 255, 255, 0.12)',
                          color: active ? '#154212' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: rem(14),
                        }}
                      >
                        {day}
                      </Box>
                    );
                  })}
                </Group>
                {userStats && (
                  <Text fz="xs" style={{ opacity: 0.65 }}>
                    Best: {userStats.longestStreak} days · {userStats.studyMinutesToday} min today
                  </Text>
                )}
                <Button
                  fullWidth radius={12}
                  style={{ backgroundColor: 'white', color: 'var(--bb-primary)', fontWeight: 800, height: rem(54), fontSize: rem(16), boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  onClick={() => router.push('/study-center')}
                >
                  Extend Streak
                </Button>
              </Stack>
            </Card>
          </Box>
        </SimpleGrid>

        {/* Quick Actions & Recent Uploads */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={rem(32)}>
          {/* Quick Actions Panel */}
          <Box>
            <Text fz={rem(13)} fw={800} c="var(--bb-on-surface-variant)" tt="uppercase" lts={rem(2)} mb={rem(24)}>
              Quick Actions
            </Text>
            <UnstyledButton
              onClick={() => router.push('/library')}
              style={{
                height: rem(260),
                width: '100%',
                background: 'linear-gradient(135deg, #154212 0%, #2d5a27 100%)',
                borderRadius: rem(24),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(21, 66, 18, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(21, 66, 18, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(21, 66, 18, 0.15)';
              }}
            >
              <IconUpload size={rem(56)} style={{ marginBottom: rem(20), opacity: 0.95 }} />
              <Title order={4} fz={rem(20)} fw={800}>
                Upload New File
              </Title>
              <Text fz={rem(14)} style={{ opacity: 0.85 }} mt={rem(6)} fw={500}>
                PDF, MP4, or Audio
              </Text>
            </UnstyledButton>
          </Box>

          {/* Recent Uploads Panel */}
          <Box>
            <Group justify="space-between" mb={rem(24)}>
              <Text fz={rem(13)} fw={800} c="var(--bb-on-surface-variant)" tt="uppercase" lts={rem(2)}>
                Recent Uploads
              </Text>
              <UnstyledButton onClick={() => router.push('/library')}>
                <Group gap={rem(4)}>
                  <Text fz="xs" fw={800} c="var(--bb-primary)">
                    View All Library
                  </Text>
                  <IconChevronRight size={14} color="var(--bb-primary)" />
                </Group>
              </UnstyledButton>
            </Group>

            <Card radius={24} p={rem(16)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
              <Stack gap={rem(4)}>
                {loadingDocs ? (
                  <>
                    <Skeleton height={64} radius={16} />
                    <Skeleton height={64} radius={16} />
                    <Skeleton height={64} radius={16} />
                  </>
                ) : recentDocs.length === 0 ? (
                  <Text fz="sm" c="var(--bb-outline)" fw={600} ta="center" py={rem(24)}>
                    No uploads yet. Add your first document!
                  </Text>
                ) : (
                  recentDocs.map((doc) => {
                    const status = docStatus(doc);
                    return (
                      <Group
                        key={doc.id}
                        wrap="nowrap"
                        align="center"
                        p={rem(16)}
                        style={{ borderRadius: 16, transition: 'background-color 0.2s ease', cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Box
                          p={rem(10)}
                          style={{
                            backgroundColor: 'var(--bb-surface-container)',
                            borderRadius: 12,
                            color: 'var(--bb-on-surface-variant)',
                            display: 'flex',
                          }}
                        >
                          {docIcon(doc.fileType)}
                        </Box>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text fz={rem(14)} fw={700} c="var(--bb-on-surface)" truncate>
                            {doc.fileName}
                          </Text>
                          <Text fz={rem(12)} c="var(--bb-outline)" fw={600} mt={rem(2)}>
                            Added {timeAgo(doc.uploadedAt)} • {docMeta(doc)}
                          </Text>
                        </Box>
                        <Badge
                          size="xs"
                          variant="light"
                          color={status.color}
                          radius="sm"
                          px={rem(8)}
                          fw={800}
                          fz={rem(9)}
                        >
                          {status.label}
                        </Badge>
                      </Group>
                    );
                  })
                )}
              </Stack>
            </Card>
          </Box>
        </SimpleGrid>

        {/* Bottom Grid: Mastery & Tasks */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={rem(32)}>
          {/* Mastery Progress Card */}
          <Card radius={24} p={rem(40)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group justify="space-between" align="center" mb={rem(32)}>
              <Title order={3} fz={rem(18)} fw={800} c="var(--bb-on-surface)">
                Mastery Progress
              </Title>
              <Box p={rem(8)} style={{ borderRadius: 8, backgroundColor: 'var(--bb-surface-container-low)', color: 'var(--bb-primary)', display: 'flex' }}>
                <IconChartLine size={20} />
              </Box>
            </Group>

            <Group p={rem(24)} bg="var(--bb-surface-container-low)" style={{ borderRadius: 20 }} mb={rem(32)}>
              <Text fz={rem(40)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-1) }}>
                {userStats?.totalCharactersLearned.toLocaleString() ?? '—'}
              </Text>
              <Box>
                <Text fz={rem(16)} fw={800} c="var(--bb-on-surface)" lh={1.2}>
                  Characters Learned
                </Text>
                <Text fz={rem(12)} fw={600} c="var(--bb-outline)" mt={rem(4)}>
                  {hskProgress
                    ? `Target: ${hskProgress.totalWords.toLocaleString()} for HSK ${hskLevel}`
                    : 'Keep studying to build progress'}
                </Text>
              </Box>
            </Group>

            <Stack gap={rem(6)} mb={rem(32)}>
              <Text fz={rem(11)} fw={800} c="var(--bb-on-surface-variant)" tt="uppercase" lts={rem(2)}>
                This Week
              </Text>
              <Text fz={rem(24)} fw={800} c="var(--bb-on-surface)">
                {userStats?.charactersThisWeek ?? 0} Words
              </Text>
            </Stack>

            <Button
              variant="filled"
              className="bb-btn-primary"
              fullWidth
              radius={12}
              h={rem(54)}
              fw={800}
              fz={rem(15)}
            >
              Start Review Session
            </Button>
          </Card>

          {/* Today's Path Card */}
          <Card radius={24} p={rem(40)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group justify="space-between" align="center" mb={rem(32)}>
              <Title order={3} fz={rem(18)} fw={800} c="var(--bb-on-surface)">
                Today&apos;s Path
              </Title>
            </Group>

            <Stack gap={rem(24)}>
              {[
                {
                  label: `Review ${HANZI_GOAL} new Hanzi`,
                  actual: todayActivity?.flashcardsReviewed ?? 0,
                  goal: HANZI_GOAL,
                  fmt: (v: number, g: number) => `${v}/${g}`,
                },
                {
                  label: `Complete ${QUIZ_GOAL} Quizzes`,
                  actual: todayActivity?.quizzesCompleted ?? 0,
                  goal: QUIZ_GOAL,
                  fmt: (v: number, g: number) => `${v}/${g}`,
                },
                {
                  label: `Active Study`,
                  actual: userStats?.studyMinutesToday ?? 0,
                  goal: MINUTES_GOAL,
                  fmt: (v: number, g: number) => `${v}/${g}m`,
                },
              ].map((item) => {
                const pct = Math.min(100, Math.round((item.actual / item.goal) * 100));
                return (
                  <Stack key={item.label} gap={rem(6)}>
                    <Group justify="space-between">
                      <Text fz={rem(14)} fw={700} c="var(--bb-on-surface)">{item.label}</Text>
                      <Text fz={rem(14)} fw={800} c="var(--bb-primary)">{item.fmt(item.actual, item.goal)}</Text>
                    </Group>
                    <Progress
                      value={pct}
                      size="sm"
                      radius="xl"
                      color="var(--bb-primary)"
                      bg="var(--bb-surface-container)"
                    />
                  </Stack>
                );
              })}
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Stats row */}
        {userStats && (
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing={rem(16)}>
            {[
              { icon: <StreakCounter currentStreak={userStats.currentStreak} longestStreak={userStats.longestStreak} />, label: null },
              {
                icon: <Group gap={rem(8)} align="center"><Text fz={rem(32)} className="hanzi" fw={900} c="var(--bb-primary)">{userStats.totalCharactersLearned.toLocaleString()}</Text></Group>,
                label: 'Characters Learned',
                sub: `+${userStats.charactersThisWeek} this week`,
              },
              {
                icon: <Group gap={rem(8)} align="center"><IconBrain size={28} color="var(--bb-primary)" /><Text fz={rem(32)} fw={900} c="var(--bb-primary)">{userStats.hskProgress.find(p => p.percentage < 100)?.percentage ?? 100}%</Text></Group>,
                label: 'Retention Rate',
                sub: `${userStats.totalFlashcardsReviewed} cards reviewed`,
              },
              {
                icon: <Group gap={rem(8)} align="center"><IconMicrophone size={28} color="#2a5185" /><Text fz={rem(32)} fw={900} c="#2a5185">{userStats.studyMinutesToday}</Text></Group>,
                label: 'Minutes Today',
                sub: `${Math.round(userStats.totalStudyMinutes / 60)}h total`,
              },
            ].map((stat, i) => (
              <Card key={i} radius={24} p={rem(24)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
                {stat.icon}
                {stat.label && (
                  <>
                    <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase" mt={rem(6)} style={{ letterSpacing: rem(0.5) }}>{stat.label}</Text>
                    {stat.sub && <Text fz={rem(11)} fw={600} c="var(--bb-outline)">{stat.sub}</Text>}
                  </>
                )}
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Activity heatmap */}
        {userStats && userStats.dailyActivity.length > 0 && (
          <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Group justify="space-between" mb={rem(20)}>
              <Stack gap={0}>
                <Title order={3} fz={rem(18)} fw={800}>Study Activity</Title>
                <Text fz="xs" fw={600} c="var(--bb-outline)">Last 90 days</Text>
              </Stack>
              <Group gap={rem(16)}>
                <Stack gap={0} align="flex-end">
                  <Text fz={rem(20)} fw={900} c="var(--bb-primary)">{userStats.studyMinutesThisWeek}</Text>
                  <Text fz="xs" fw={600} c="var(--bb-outline)">min this week</Text>
                </Stack>
              </Group>
            </Group>
            <ActivityHeatmap dailyActivity={userStats.dailyActivity} days={90} />
          </Card>
        )}

        {/* Retention Curve */}
        {userStats && userStats.retentionCurve.length > 0 && (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={rem(32)}>
            <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
              <Stack gap={rem(4)} mb={rem(24)}>
                <Title order={3} fz={rem(18)} fw={800} c="var(--bb-on-surface)">Retention Curve</Title>
                <Text fz="xs" fw={600} c="var(--bb-outline)">Memory decay visualization</Text>
              </Stack>
              {/* Bar chart — last 7 data points */}
              {(() => {
                const points = userStats.retentionCurve.slice(-7);
                const maxRate = Math.max(...points.map((p) => p.retentionRate), 1);
                const DAY_ABBR = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                return (
                  <Group gap={rem(8)} align="flex-end" style={{ height: rem(120) }}>
                    {points.map((pt, i) => {
                      const heightPct = (pt.retentionRate / maxRate) * 100;
                      const isHighest = pt.retentionRate === maxRate;
                      const dayLabel = DAY_ABBR[new Date(pt.date).getDay()];
                      return (
                        <Stack key={i} align="center" gap={rem(6)} style={{ flex: 1 }}>
                          <Box
                            style={{
                              width: '100%',
                              height: rem(100 * (heightPct / 100)),
                              minHeight: rem(8),
                              borderRadius: `${rem(6)} ${rem(6)} 0 0`,
                              backgroundColor: isHighest ? 'var(--bb-primary)' : 'var(--bb-surface-container)',
                              transition: 'height 0.6s cubic-bezier(0.4,0,0.2,1)',
                            }}
                          />
                          <Text fz={rem(11)} fw={700} c="var(--bb-outline)">{dayLabel}</Text>
                        </Stack>
                      );
                    })}
                  </Group>
                );
              })()}
            </Card>

            {/* HSK progress mini-card alongside */}
            <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
              <Group justify="space-between" align="center" mb={rem(24)}>
                <Title order={3} fz={rem(18)} fw={800}>HSK Progress</Title>
                <Box p={rem(8)} style={{ borderRadius: 8, backgroundColor: 'var(--bb-surface-container-low)', color: 'var(--bb-primary)', display: 'flex' }}>
                  <IconBook2 size={20} />
                </Box>
              </Group>
              <Stack gap={rem(12)}>
                {userStats.hskProgress.map((lvl) => (
                  <Group key={lvl.level} gap={rem(12)} align="center" wrap="nowrap">
                    <Text fz="xs" fw={800} c="var(--bb-outline)" w={rem(44)} style={{ flexShrink: 0 }}>HSK {lvl.level}</Text>
                    <Box style={{ flex: 1, backgroundColor: 'var(--bb-surface-container)', borderRadius: rem(8), height: rem(8), overflow: 'hidden' }}>
                      <Box style={{ width: `${lvl.percentage}%`, height: '100%', backgroundColor: 'var(--bb-primary)', opacity: lvl.percentage === 100 ? 1 : 0.7, borderRadius: rem(8), transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
                    </Box>
                    <Text fz="xs" fw={800} c={lvl.percentage === 100 ? 'var(--bb-primary)' : 'var(--bb-outline)'} w={rem(36)} ta="right" style={{ flexShrink: 0 }}>{lvl.percentage}%</Text>
                    <Text fz="xs" fw={600} c="var(--bb-outline)" w={rem(90)} ta="right" style={{ flexShrink: 0 }}>{lvl.wordsLearned}/{lvl.totalWords}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </SimpleGrid>
        )}

      </Stack>

      {/* Modals */}
      <AddTaskModal opened={taskModalOpened} onClose={closeTaskModal} />
    </AppLayout>
  );
}
