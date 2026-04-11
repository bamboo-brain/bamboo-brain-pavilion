import type { UserProfile } from '@/types/settings';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProfile(accessToken: string): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/api/settings/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export async function updateProfile(
  request: { name: string; bio: string },
  accessToken: string,
): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/api/settings/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update profile');
  return data;
}

export async function uploadAvatar(
  file: File,
  accessToken: string,
): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  // No Content-Type header — browser sets multipart boundary
  const res = await fetch(`${API_URL}/api/settings/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to upload avatar');
  return data;
}

export async function updateEmail(
  request: { newEmail: string; currentPassword: string },
  accessToken: string,
): Promise<{ email: string }> {
  const res = await fetch(`${API_URL}/api/settings/email`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update email');
  return data;
}

export async function updatePassword(
  request: { currentPassword: string; newPassword: string },
  accessToken: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/settings/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update password');
}

export async function updateIntegrations(
  request: { isGcalSyncEnabled: boolean; isMicrosoftAccountEnabled: boolean },
  accessToken: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/settings/integrations`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to update integrations');
}
