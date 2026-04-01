'use client';

import { useState } from 'react';
import {
  AppShell,
  Text,
  Stack,
  Group,
  TextInput,
  ActionIcon,
  Avatar,
  Box,
  UnstyledButton,
  rem,
  Popover,
  Indicator,
} from '@mantine/core';
import {
  LeafIcon,
  BookIcon,
  MicIcon,
  CalendarIcon,
} from '@/components/icons';
import {
  IconSearch,
  IconBell,
  IconUser,
  IconChartLine,
  IconSettings,
  IconSchool,
} from '@tabler/icons-react';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { IconLogout } from '@tabler/icons-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <IconChartLine size={20} />, path: '/dashboard' },
  { id: 'library', label: 'Library', icon: <BookIcon size={20} />, path: '/library' },
  { id: 'study', label: 'Study Center', icon: <IconSchool size={20} />, path: '/study-center' },
  { id: 'speaking', label: 'Speaking Studio', icon: <MicIcon size={20} />, path: '/speaking' },
  { id: 'planner', label: 'Planner', icon: <CalendarIcon size={20} />, path: '/planner' },
  { id: 'settings', label: 'Settings', icon: <IconSettings size={20} />, path: '/settings' },
];

export function AppLayout({ children, title }: { children: React.ReactNode; title?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <AppShell
      navbar={{
        width: 250,
        breakpoint: 'sm',
      }}
      padding={rem(40)}
      styles={{
        main: {
          backgroundColor: 'var(--bb-surface-container-low)',
        },
        navbar: {
          borderRight: 'none',
          backgroundColor: 'var(--bb-surface-container-lowest)',
        }
      }}
    >
      {/* ── Sidebar / Navigation ──────────────────────────────── */}
      <AppShell.Navbar p={0}>
        <Stack h="100%" py={rem(32)} gap={0}>
          {/* Brand */}
          <Group px={rem(24)} mb={rem(48)} gap="sm" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
            <Box
              style={{
                width: rem(36),
                height: rem(36),
                backgroundColor: 'var(--bb-primary)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <LeafIcon size={22} />
            </Box>
            <Stack gap={0}>
              <Text fw={700} fz="sm" c="var(--bb-primary)" lh={1.2}>
                BambooBrain
              </Text>
              <Text fw={600} fz={rem(10)} c="var(--bb-outline)" tt="uppercase" lts={rem(1.5)}>
                Scholar's Pavilion
              </Text>
            </Stack>
          </Group>

          {/* Navigation */}
          <Stack gap={rem(4)} flex={1}>
            {NAV_ITEMS.map((item) => (
              <UnstyledButton
                key={item.id}
                onClick={() => router.push(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: rem(16),
                  padding: `${rem(14)} ${rem(24)}`,
                  color: pathname === item.path ? 'var(--bb-primary)' : 'var(--bb-on-surface-variant)',
                  backgroundColor: pathname === item.path ? 'rgba(21, 66, 18, 0.06)' : 'transparent',
                  fontWeight: pathname === item.path ? 700 : 500,
                  fontSize: rem(15),
                  transition: 'all 0.2s ease',
                  borderRight: pathname === item.path ? `${rem(3)} solid var(--bb-primary)` : 'none',
                }}
              >
                <Box style={{ display: 'flex', color: 'inherit' }}>{item.icon}</Box>
                <Text fz="inherit" fw="inherit" c="inherit">
                  {item.label}
                </Text>
              </UnstyledButton>
            ))}
          </Stack>

          {/* User Profile */}
          <Box px={rem(16)} mt="auto">
            <Group
              py={rem(12)}
              px={rem(16)}
              style={{
                backgroundColor: 'var(--bb-surface-container-low)',
                borderRadius: 16,
                cursor: 'pointer',
              }}
            >
              <Avatar color="dark" radius="xl" size="md">
                A
              </Avatar>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text fw={700} fz="xs" c="var(--bb-on-surface)" truncate>
                  Scholar Alex
                </Text>
                <Text fz={rem(11)} c="var(--bb-outline)" fw={600}>
                  HSK Level 4
                </Text>
              </Box>
            </Group>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack gap={rem(64)}>
          {/* Header */}
          <Group justify="space-between" align="center">
            <Box>
              {title}
            </Box>
            <Group gap="xl">
              <TextInput
                placeholder="Search your library..."
                rightSection={<IconSearch size={20} color="var(--bb-outline)" />}
                styles={{
                  input: {
                    width: rem(340),
                    height: rem(48),
                    borderRadius: rem(12),
                    border: 'none',
                    backgroundColor: 'var(--bb-surface-container-lowest)',
                    paddingLeft: rem(20),
                    fontSize: rem(14),
                  },
                }}
              />
              <Group gap="md">
                <Popover width={340} position="bottom-end" shadow="lg" radius={rem(24)} offset={12} transitionProps={{ transition: 'pop-top-right' }}>
                  <Popover.Target>
                    <ActionIcon
                      variant="subtle"
                      radius="xl"
                      size="xl"
                      color="var(--bb-outline)"
                      styles={{ root: { backgroundColor: 'var(--bb-surface-container-lowest)', color: 'var(--bb-on-surface-variant)' } }}
                    >
                      <Indicator color="var(--bb-primary)" size={10} offset={2} processing>
                        <IconBell size={22} />
                      </Indicator>
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown p={0} style={{ border: 'none', backgroundColor: 'var(--bb-surface-container-lowest)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <NotificationList />
                  </Popover.Dropdown>
                </Popover>
                <Popover position="bottom-end" shadow="lg" radius={rem(16)} offset={12} transitionProps={{ transition: 'pop-top-right' }}>
                  <Popover.Target>
                    <ActionIcon
                      variant="subtle"
                      radius="xl"
                      size="xl"
                      color="var(--bb-outline)"
                      styles={{ root: { backgroundColor: 'var(--bb-surface-container-lowest)', color: 'var(--bb-on-surface-variant)' } }}
                    >
                      <IconUser size={22} />
                    </ActionIcon>
                  </Popover.Target>
                  <Popover.Dropdown p={rem(8)} style={{ border: 'none', backgroundColor: 'var(--bb-surface-container-lowest)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', minWidth: rem(180) }}>
                    <UnstyledButton
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: rem(10),
                        width: '100%',
                        padding: `${rem(10)} ${rem(14)}`,
                        borderRadius: rem(10),
                        color: 'var(--mantine-color-red-6)',
                        fontSize: rem(14),
                        fontWeight: 500,
                      }}
                    >
                      <IconLogout size={18} />
                      Sign out
                    </UnstyledButton>
                  </Popover.Dropdown>
                </Popover>
              </Group>
            </Group>
          </Group>

          {children}
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
