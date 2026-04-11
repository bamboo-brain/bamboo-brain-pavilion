'use client';

import { useState, useEffect, useRef } from 'react';
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
  Avatar,
  TextInput,
  Divider,
  Modal,
  Textarea,
  PasswordInput,
  Skeleton,
} from '@mantine/core';
import { AppLayout } from '@/components/layout/AppLayout';
import { GoogleIcon, MicrosoftIcon } from '@/components/icons';
import {
  IconSettings,
  IconShieldLock,
  IconBell,
  IconUserCircle,
  IconChevronRight,
  IconCircleCheckFilled,
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import type { UserProfile } from '@/types/settings';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  updateEmail,
  updatePassword,
  updateIntegrations,
} from '@/lib/api/settings';

type Toast = { text: string; type: 'success' | 'error' };

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const accessToken = session?.accessToken ?? '';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!accessToken) return;
    getProfile(accessToken)
      .then((data) => {
        setProfile(data);
        setEditName(data.name ?? '');
        setEditBio(data.bio ?? '');
      })
      .catch(() => showToast('Failed to load profile', 'error'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  function showToast(text: string, type: 'success' | 'error') {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }

  function startEdit() {
    if (!profile) return;
    setEditName(profile.name ?? '');
    setEditBio(profile.bio ?? '');
    setIsEditingProfile(true);
  }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateProfile({ name: editName, bio: editBio }, accessToken);
      setProfile(updated);
      setIsEditingProfile(false);
      await updateSession({ name: updated.name });
      showToast('Profile updated', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    e.target.value = '';
    setSaving(true);
    try {
      const { avatarUrl } = await uploadAvatar(file, accessToken);
      setProfile({ ...profile, image: avatarUrl });
      await updateSession({ image: avatarUrl });
      showToast('Avatar updated', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to upload avatar', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleIntegration(key: 'isGcalSyncEnabled' | 'isMicrosoftAccountEnabled') {
    if (!profile) return;
    const newValue = !profile[key];
    const optimistic = { ...profile, [key]: newValue };
    setProfile(optimistic);
    try {
      await updateIntegrations(
        {
          isGcalSyncEnabled: optimistic.isGcalSyncEnabled,
          isMicrosoftAccountEnabled: optimistic.isMicrosoftAccountEnabled,
        },
        accessToken,
      );
    } catch (err: unknown) {
      setProfile(profile); // revert
      showToast(err instanceof Error ? err.message : 'Failed to update integration', 'error');
    }
  }

  const passwordAgeText = () => {
    if (!profile?.passwordChangedAt) return 'Never changed';
    const months = Math.floor(
      (Date.now() - new Date(profile.passwordChangedAt).getTime()) /
        (1000 * 60 * 60 * 24 * 30),
    );
    if (months === 0) return 'Changed recently';
    return `Last changed ${months} month${months !== 1 ? 's' : ''} ago`;
  };

  const providerLabel = () => {
    if (profile?.provider === 'google') return 'Managed by Google';
    if (profile?.provider === 'azure-ad') return 'Managed by Microsoft';
    return null;
  };

  const displayName = profile?.name ?? session?.user?.name ?? 'Scholar';
  const displayEmail = profile?.email ?? session?.user?.email ?? '—';
  const displayAvatar = profile?.image ?? session?.user?.image ?? null;

  return (
    <AppLayout
      title={
        <Title order={1} fz={rem(32)} fw={800} c="var(--bb-on-surface)" style={{ letterSpacing: rem(-0.5) }}>
          Scholar's Settings
        </Title>
      }
    >
      {/* Toast */}
      {toast && (
        <Box
          style={{
            position: 'fixed',
            top: rem(24),
            right: rem(24),
            zIndex: 9999,
            padding: `${rem(12)} ${rem(20)}`,
            borderRadius: rem(12),
            border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            backgroundColor: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: toast.type === 'success' ? '#166534' : '#991b1b',
            fontWeight: 600,
            fontSize: rem(14),
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {toast.text}
        </Box>
      )}

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleAvatarChange}
      />

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing={rem(40)}>
        {/* Main Settings Section (Spans 2 columns) */}
        <Box style={{ gridColumn: 'span 2' }}>
          <Stack gap={rem(48)}>
            {/* Profile Overview */}
            <Card radius={32} p={rem(48)} style={{ backgroundColor: 'var(--bb-surface-container-lowest)', border: 'none' }}>
              {loading ? (
                <Group gap={rem(32)} align="flex-start" wrap="nowrap">
                  <Skeleton circle height={120} />
                  <Stack gap={rem(16)} style={{ flex: 1 }}>
                    <Skeleton height={28} width="60%" />
                    <Skeleton height={16} width="90%" />
                    <Skeleton height={16} width="75%" />
                  </Stack>
                </Group>
              ) : isEditingProfile ? (
                <Stack gap={rem(20)}>
                  <TextInput
                    label="Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    radius={10}
                    styles={{ input: { fontWeight: 700 } }}
                  />
                  <Textarea
                    label="Bio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    radius={10}
                    minRows={3}
                    autosize
                  />
                  <Group gap="md">
                    <Button radius={10} fw={800} color="bamboo" loading={saving} onClick={saveProfile}>
                      Save Changes
                    </Button>
                    <Button variant="subtle" color="gray" radius={10} fw={800} onClick={() => setIsEditingProfile(false)}>
                      Cancel
                    </Button>
                  </Group>
                </Stack>
              ) : (
                <Group gap={rem(32)} align="flex-start" wrap="nowrap">
                  <Avatar
                    size={rem(120)}
                    radius={120}
                    src={displayAvatar}
                    style={{ border: `${rem(4)} solid var(--bb-primary)` }}
                  />
                  <Stack gap={rem(16)} style={{ flex: 1 }}>
                    <Box>
                      <Group gap="sm" mb={rem(4)}>
                        <Title order={2} fz={rem(28)} fw={800}>{displayName}</Title>
                        <Badge variant="filled" color="gray" radius="sm" fw={800}>FREE TRIAL</Badge>
                      </Group>
                      <Text fz="sm" fw={600} c="var(--bb-on-surface-variant)" lh={1.6}>
                        {profile?.bio || 'No bio yet.'}
                      </Text>
                    </Box>
                    <Group gap="md">
                      <Button variant="light" color="gray" radius={10} fw={800} onClick={startEdit}>
                        Edit Profile
                      </Button>
                      <Button
                        variant="subtle"
                        color="gray"
                        radius={10}
                        fw={800}
                        loading={saving}
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        {saving ? 'Uploading...' : 'Change Avatar'}
                      </Button>
                    </Group>
                  </Stack>
                </Group>
              )}
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
                    {loading ? (
                      <>
                        <Skeleton height={64} mx={rem(16)} my={rem(8)} radius={16} />
                        <Skeleton height={64} mx={rem(16)} my={rem(8)} radius={16} />
                        <Skeleton height={64} mx={rem(16)} my={rem(8)} radius={16} />
                      </>
                    ) : (
                      <>
                        <SettingsItem
                          icon={<IconUserCircle size={20} />}
                          title="Name & Identification"
                          value={displayName}
                          onClick={startEdit}
                        />
                        <Divider color="var(--bb-surface-container-low)" mx={rem(16)} />
                        <SettingsItem
                          icon={<IconSettings size={20} />}
                          title="Scholar's Email"
                          value={displayEmail}
                          subtitle={!profile?.isCredentialsUser ? providerLabel() ?? undefined : undefined}
                          onClick={profile?.isCredentialsUser ? () => setShowEmailModal(true) : undefined}
                        />
                        <Divider color="var(--bb-surface-container-low)" mx={rem(16)} />
                        <SettingsItem
                          icon={<IconShieldLock size={20} />}
                          title="Password & Passkeys"
                          value={profile?.isCredentialsUser ? passwordAgeText() : 'Managed by identity provider'}
                          onClick={profile?.isCredentialsUser ? () => setShowPasswordModal(true) : undefined}
                        />
                      </>
                    )}
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
                  {loading ? (
                    <>
                      <Skeleton height={200} radius={24} />
                      <Skeleton height={200} radius={24} />
                    </>
                  ) : (
                    <>
                      <IntegrationCard
                        icon={<GoogleIcon size={24} />}
                        title="Google Calendar"
                        desc="Auto-sync study slots with your daily schedule."
                        connected={profile?.isGcalSyncEnabled ?? false}
                        onToggle={() => handleToggleIntegration('isGcalSyncEnabled')}
                        connectedBorderColor="var(--bb-primary)"
                      />
                      <IntegrationCard
                        icon={<MicrosoftIcon size={24} />}
                        title="Microsoft Account"
                        desc="Connect for enterprise access and notes sync."
                        connected={profile?.isMicrosoftAccountEnabled ?? false}
                        onToggle={() => handleToggleIntegration('isMicrosoftAccountEnabled')}
                        connectedBorderColor="#3b82f6"
                      />
                    </>
                  )}
                </SimpleGrid>
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
              overflow: 'hidden',
            }}
          >
            <Box style={{ position: 'absolute', top: rem(-20), right: rem(-20), opacity: 0.1 }}>
              <IconCircleCheckFilled size={160} />
            </Box>
            <Stack gap={rem(24)} style={{ position: 'relative', zIndex: 1 }}>
              <Box>
                <Text fz={rem(12)} fw={800} style={{ opacity: 0.8 }} tt="uppercase" lts={1}>Current Plan</Text>
                <Title order={3} fz={rem(24)} fw={800} mt={rem(4)}>Free Trial</Title>
              </Box>
              <Stack gap={rem(12)}>
                {[
                  'Up to 3 document uploads',
                  'HSK 1-2 library access only',
                  'Basic AI Speaking Tutor (5 sessions/day)',
                  'Standard flashcard reviews',
                ].map((feature, i) => (
                  <Group key={i} gap="xs">
                    <IconCircleCheckFilled size={16} color="white" />
                    <Text fz={rem(13)} fw={600}>{feature}</Text>
                  </Group>
                ))}
              </Stack>
              <Button fullWidth radius={12} variant="white" color="var(--bb-primary)" fw={800} h={rem(48)}>
                Upgrade to Pro
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

      {/* Password Modal */}
      <PasswordModal
        opened={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        accessToken={accessToken}
        onSuccess={() => showToast('Password updated successfully', 'success')}
        onError={(msg) => showToast(msg, 'error')}
      />

      {/* Email Modal */}
      <EmailModal
        opened={showEmailModal}
        currentEmail={displayEmail}
        onClose={() => setShowEmailModal(false)}
        accessToken={accessToken}
        onSuccess={(newEmail) => {
          if (profile) setProfile({ ...profile, email: newEmail });
          showToast('Email updated successfully', 'success');
        }}
        onError={(msg) => showToast(msg, 'error')}
      />
    </AppLayout>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsItem({
  icon,
  title,
  value,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  const clickable = !!onClick;
  return (
    <Group
      p={rem(16)}
      justify="space-between"
      style={{
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background-color 0.2s ease',
        borderRadius: 16,
      }}
      onMouseEnter={(e) => {
        if (clickable) e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)';
      }}
      onMouseLeave={(e) => {
        if (clickable) e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onClick={onClick}
    >
      <Group gap="md">
        <Box p={rem(8)} style={{ color: 'var(--bb-primary)', display: 'flex' }}>{icon}</Box>
        <Box>
          <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase" lts={1} mb={rem(2)}>{title}</Text>
          <Text fz="sm" fw={700}>{value}</Text>
          {subtitle && (
            <Text fz="xs" fw={600} c="var(--bb-outline)">{subtitle}</Text>
          )}
        </Box>
      </Group>
      {clickable && <IconChevronRight size={18} color="var(--bb-outline)" />}
    </Group>
  );
}

function IntegrationCard({
  icon,
  title,
  desc,
  connected,
  onToggle,
  connectedBorderColor,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  connected: boolean;
  onToggle: () => void;
  connectedBorderColor: string;
}) {
  return (
    <Card
      radius={24}
      p={rem(32)}
      style={{
        backgroundColor: 'var(--bb-surface-container-lowest)',
        border: connected
          ? `1px solid ${connectedBorderColor}`
          : '1px dashed var(--bb-surface-container)',
        transition: 'all 0.2s ease',
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
          color={connected ? 'gray' : 'bamboo'}
          fw={800}
          onClick={onToggle}
        >
          {connected ? 'Disconnect' : 'Connect Now'}
        </Button>
      </Stack>
    </Card>
  );
}

function PasswordModal({
  opened,
  onClose,
  accessToken,
  onSuccess,
  onError,
}: {
  opened: boolean;
  onClose: () => void;
  accessToken: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  function reset() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit() {
    if (newPassword !== confirmPassword) {
      onError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      onError('New password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await updatePassword({ currentPassword, newPassword }, accessToken);
      onSuccess();
      reset();
      onClose();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={() => { reset(); onClose(); }}
      title={<Text fw={800} fz="lg">Change Password</Text>}
      radius={20}
      centered
    >
      <Stack gap="md">
        <PasswordInput
          label="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          radius={10}
        />
        <PasswordInput
          label="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          radius={10}
        />
        <PasswordInput
          label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          radius={10}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        />
        <Group justify="flex-end" gap="sm" mt="xs">
          <Button variant="default" radius={10} fw={700} onClick={() => { reset(); onClose(); }}>
            Cancel
          </Button>
          <Button
            color="bamboo"
            radius={10}
            fw={800}
            loading={saving}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            onClick={handleSubmit}
          >
            Update Password
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function EmailModal({
  opened,
  currentEmail,
  onClose,
  accessToken,
  onSuccess,
  onError,
}: {
  opened: boolean;
  currentEmail: string;
  onClose: () => void;
  accessToken: string;
  onSuccess: (newEmail: string) => void;
  onError: (msg: string) => void;
}) {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);

  function reset() {
    setNewEmail('');
    setCurrentPassword('');
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const { email } = await updateEmail({ newEmail, currentPassword }, accessToken);
      onSuccess(email);
      reset();
      onClose();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={() => { reset(); onClose(); }}
      title={<Text fw={800} fz="lg">Change Email</Text>}
      radius={20}
      centered
    >
      <Stack gap="md">
        <Box>
          <Text fz="xs" fw={700} c="var(--bb-outline)" tt="uppercase" lts={1} mb={rem(4)}>Current email</Text>
          <Text fz="sm" fw={700}>{currentEmail}</Text>
        </Box>
        <TextInput
          label="New email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          radius={10}
        />
        <PasswordInput
          label="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          radius={10}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        />
        <Group justify="flex-end" gap="sm" mt="xs">
          <Button variant="default" radius={10} fw={700} onClick={() => { reset(); onClose(); }}>
            Cancel
          </Button>
          <Button
            color="bamboo"
            radius={10}
            fw={800}
            loading={saving}
            disabled={!newEmail || !currentPassword}
            onClick={handleSubmit}
          >
            Update Email
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
