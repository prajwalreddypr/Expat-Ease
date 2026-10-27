import type { User } from '../contexts/auth-context';
import type { ProfileFormData } from '../types/profile';
import { apiFetch, getApiErrorDetail } from '../utils/api';

const parseUserResponse = async (response: Response, fallbackMessage: string): Promise<User> => {
  if (!response.ok) {
    const detail = await getApiErrorDetail(response).catch(() => undefined);
    throw new Error(detail || fallbackMessage);
  }
  return response.json() as Promise<User>;
};

export const uploadProfilePhoto = async (token: string, photo: File): Promise<User> => {
  const formData = new FormData();
  formData.append('file', photo);
  const response = await apiFetch('/api/v1/users/me/profile-photo', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return parseUserResponse(response, 'Failed to upload profile photo');
};

export const updateProfile = async (
  token: string,
  profile: ProfileFormData,
  profilePhoto: string | null,
): Promise<User> => {
  const response = await apiFetch('/api/v1/users/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...profile, profile_photo: profilePhoto }),
  });
  return parseUserResponse(response, 'Failed to update profile');
};
