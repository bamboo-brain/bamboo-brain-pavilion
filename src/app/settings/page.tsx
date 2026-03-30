'use client';

import {
  Title,
  Text,
  Stack,
  Group,
  Card,
  Button,
  Box,
  Badge,
  rem,
  SimpleGrid,
  ActionIcon,
  Avatar,
  Switch,
  TextInput,
  Divider,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  GoogleIcon,
  MicrosoftIcon,
} from '@/components/icons';
import {
  IconSettings,
  IconShieldLock,
  IconBell,
  IconPalette,
  IconUserCircle,
  IconTrash,
  IconChevronRight,
  IconCircleCheckFilled,
} from '@tabler/icons-react';

export default function SettingsPage() {
  return (
    <AppLayout
      title={
        <Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>
          Scholar's Settings
        </Title>
      }
    >
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing={rem(40)}>
        {/* Main Settings Section (Spans 2 columns) */}
        <Box style={{ gridColumn: 'span 2' }}>
          <Stack gap={rem(48)}>
            {/* Profile Overview */}
            <Card radius={32} p={rem(48)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
              <Group gap={rem(32)} align="flex-start" wrap="nowrap">
                <Avatar size={rem(120)} radius={120} src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" style={{ border: `${rem(4)} solid var(--bb-primary)` }} />
                <Stack gap={rem(16)} style={{ flex: 1 }}>
                  <Box>
                    <Group gap="sm" mb={rem(4)}>
                      <Title order={2} fz={rem(28)} fw={800}>Master Li</Title>
                      <Badge variant="filled" color="var(--bb-primary)" radius="sm" fw={800}>PRO SCHOLAR</Badge>
                    </Group>
                    <Text fz="sm" fw={600} c="var(--bb-on-surface-variant)" lh={1.6}>
                      Dedicated scholar of the Mandarinate since 2021. Currently mastering intermediate grammatical structures and classical idioms.
                    </Text>
                  </Box>
                  <Group gap="md">
                    <Button variant="light" color="gray" radius={10} fw={800}>Edit Profile</Button>
                    <Button variant="subtle" color="gray" radius={10} fw={800}>Change Avatar</Button>
                  </Group>
                </Stack>
              </Group>
            </Card>

            {/* Account & Scholarship Sections */}
            <Stack gap={rem(40)}>
              {/* Account & Security */}
              <Box>
                <Group gap="sm" mb={rem(24)}>
                  <IconShieldLock size={22} color="var(--bb-primary)" />
                  <Title order={3} fz={rem(20)} fw={800}>Account & Security</Title>
                </Group>
                <Card radius={24} p={rem(8)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
                  <Stack gap={0}>
                    <SettingsItem 
                      icon={<IconUserCircle size={20} />} 
                      title="Name & Identification" 
                      value="Li Wei (Master Li)" 
                    />
                    <Divider color="var(--bb-surface-container-low)" mx={rem(16)} />
                    <SettingsItem 
                      icon={<IconSettings size={20} />} 
                      title="Scholar's Email" 
                      value="li.wei@mandarinate.edu" 
                    />
                    <Divider color="var(--bb-surface-container-low)" mx={rem(16)} />
                    <SettingsItem 
                      icon={<IconShieldLock size={20} />} 
                      title="Password & Passkeys" 
                      value="Last changed 3 months ago" 
                    />
                  </Stack>
                </Card>
              </Box>

              {/* The Scholar's Toolkit */}
              <Box>
                <Group gap="sm" mb={rem(24)}>
                  <IconSettings size={22} color="var(--bb-primary)" />
                  <Title order={3} fz={rem(20)} fw={800}>The Scholar's Toolkit</Title>
                </Group>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                  <IntegrationCard 
                    icon={<GoogleIcon size={24} />} 
                    title="Google Calendar" 
                    desc="Auto-sync study slots with your daily schedule." 
                    connected={true} 
                  />
                  <IntegrationCard 
                    icon={<MicrosoftIcon size={24} />} 
                    title="Microsoft Account" 
                    desc="Connect for enterprise access and notes sync." 
                    connected={false} 
                  />
                </SimpleGrid>
              </Box>

              {/* Pavilion Notifications */}
              <Box>
                <Group gap="sm" mb={rem(24)}>
                  <IconBell size={22} color="var(--bb-primary)" />
                  <Title order={3} fz={rem(20)} fw={800}>Pavilion Notifications</Title>
                </Group>
                <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
                  <Stack gap={rem(24)}>
                    <SwitchItem title="Study Reminders" desc="Gentle prompts to keep your review streak active." defaultChecked />
                    <Divider color="var(--bb-surface-container-low)" />
                    <SwitchItem title="New Library Extractions" desc="Alerts when AI finishes processing your uploaded scripts." defaultChecked />
                    <Divider color="var(--bb-surface-container-low)" />
                    <SwitchItem title="Scholarly Community" desc="Notifications for group discussion replies and likes." />
                  </Stack>
                </Card>
              </Box>

              {/* Display & Ease */}
              <Box>
                <Group gap="sm" mb={rem(24)}>
                  <IconPalette size={22} color="var(--bb-primary)" />
                  <Title order={3} fz={rem(20)} fw={800}>Display & Ease</Title>
                </Group>
                <Card radius={24} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
                  <Stack gap={rem(24)}>
                    <SwitchItem title="High Contrast Hanzi (高对比度模式)" desc="Enhanced stroke clarity for character recognition." defaultChecked />
                    <Divider color="var(--bb-surface-container-low)" />
                    <SwitchItem title="Pinyin Overlays" desc="Show Pinyin assistance by default during reading." defaultChecked />
                  </Stack>
                </Card>
              </Box>

              {/* Danger Zone */}
              <Box mt={rem(40)}>
                <Title order={3} fz={rem(18)} fw={800} c="red" mb={rem(16)}>Danger Zone</Title>
                <Card radius={24} p={rem(32)} style={{ backgroundColor: 'rgba(186, 26, 26, 0.05)', border: '1px solid rgba(186, 26, 26, 0.1)' }}>
                  <Group justify="space-between">
                    <Box style={{ flex: 1, paddingRight: rem(32) }}>
                      <Text fw={700} fz="sm" c="red" mb={rem(4)}>Terminate Scholar's Journey</Text>
                      <Text fz="xs" fw={600} c="var(--bb-on-surface-variant)">Permanently delete your profile and all learning progress. This cannot be undone.</Text>
                    </Box>
                    <Button variant="outline" color="red" radius={10} fw={800} leftSection={<IconTrash size={16} />}>Delete Profile</Button>
                  </Group>
                </Card>
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* Sidebar Section (1 column) */}
        <Stack gap={rem(40)}>
          {/* Pro Scholar Plan */}
          <Card 
            radius={32} 
            p={rem(32)} 
            style={{ 
              background: 'linear-gradient(135deg, var(--bb-primary) 0%, var(--bb-primary-container) 100%)', 
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box style={{ position: 'absolute', top: rem(-20), right: rem(-20), opacity: 0.1 }}>
              <IconCircleCheckFilled size={160} />
            </Box>
            <Stack gap={rem(24)} style={{ position: 'relative', zIndex: 1 }}>
              <Box>
                <Text fz={rem(12)} fw={800} style={{ opacity: 0.8 }} tt="uppercase" lts={1}>Current Plan</Text>
                <Title order={3} fz={rem(24)} fw={800} mt={rem(4)}>Pro Scholar</Title>
              </Box>
              <Stack gap={rem(12)}>
                {[
                  'Unlimited calligraphy sessions',
                  'Full HSK 1-6 library access',
                  'Advanced AI Speaking Tutor',
                  'Early access to new features'
                ].map((feature, i) => (
                  <Group key={i} gap="xs">
                    <IconCircleCheckFilled size={16} color="white" />
                    <Text fz={rem(13)} fw={600}>{feature}</Text>
                  </Group>
                ))}
              </Stack>
              <Button fullWidth radius={12} variant="white" color="var(--bb-primary)" fw={800} h={rem(48)}>
                Manage Subscription
              </Button>
            </Stack>
          </Card>

          {/* Help & Support */}
          <Card radius={32} p={rem(32)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
            <Title order={3} fz={rem(18)} fw={800} mb={rem(24)}>Need Assistance?</Title>
            <Stack gap={rem(16)}>
              <Button variant="light" color="gray" fullWidth radius={12} h={rem(54)} fw={800} leftSection={<IconSettings size={18} />} justify="flex-start" styles={{ inner: { justifyContent: 'flex-start' } }}>
                Scholar's Help Center
              </Button>
              <Button variant="light" color="gray" fullWidth radius={12} h={rem(54)} fw={800} leftSection={<IconBell size={18} />} justify="flex-start" styles={{ inner: { justifyContent: 'flex-start' } }}>
                Submit Feedback
              </Button>
            </Stack>
            <Text fz={rem(11)} fw={600} c="var(--bb-outline)" ta="center" mt={rem(24)}>
              BambooBrain Version 2.4.0 (Build 829)<br />The Scholarly Grove
            </Text>
          </Card>
        </Stack>
      </SimpleGrid>
    </AppLayout>
  );
}

function SettingsItem({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <Group 
      p={rem(16)} 
      justify="space-between" 
      style={{ 
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        borderRadius: 16
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <Group gap="md">
        <Box p={rem(8)} style={{ color: 'var(--bb-primary)', display: 'flex' }}>{icon}</Box>
        <Box>
          <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase" lts={1} mb={rem(2)}>{title}</Text>
          <Text fz="sm" fw={700}>{value}</Text>
        </Box>
      </Group>
      <IconChevronRight size={18} color="var(--bb-outline)" />
    </Group>
  );
}

function IntegrationCard({ icon, title, desc, connected }: { icon: React.ReactNode; title: string; desc: string; connected: boolean }) {
  return (
    <Card 
      radius={24} 
      p={rem(32)} 
      style={{ 
        backgroundColor: 'var(--bb-surface-container-lowest)', 
        border: connected ? '1px solid var(--bb-primary)' : '1px dashed var(--bb-surface-container)',
        transition: 'all 0.2s ease'
      }}
    >
      <Stack gap={rem(20)}>
        <Group justify="space-between">
          <Box>{icon}</Box>
          <Badge variant={connected ? 'light' : 'outline'} color={connected ? 'green' : 'gray'} radius="sm" fw={800}>
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </Badge>
        </Group>
        <Box>
          <Text fw={800} fz="sm" mb={rem(6)}>{title}</Text>
          <Text fz="xs" fw={600} c="var(--bb-on-surface-variant)" lh={1.5}>{desc}</Text>
        </Box>
        <Button 
          fullWidth 
          radius={10} 
          variant="light" 
          color={connected ? 'gray' : 'var(--bb-primary)'} 
          fw={800}
        >
          {connected ? 'Disconnect' : 'Connect Now'}
        </Button>
      </Stack>
    </Card>
  );
}

function SwitchItem({ title, desc, defaultChecked }: { title: string; desc: string; defaultChecked?: boolean }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Box style={{ flex: 1 }}>
        <Text fw={700} fz="sm" mb={rem(2)}>{title}</Text>
        <Text fz="xs" fw={600} c="var(--bb-outline)" lh={1.4}>{desc}</Text>
      </Box>
      <Switch 
        defaultChecked={defaultChecked} 
        size="md" 
        color="var(--bb-primary)"
        styles={{
          track: { cursor: 'pointer' }
        }}
      />
    </Group>
  );
}
