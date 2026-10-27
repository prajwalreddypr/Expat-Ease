import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateProfile, uploadProfilePhoto } from './profile';
import { apiFetch, getApiErrorDetail } from '../utils/api';

vi.mock('../utils/api', () => ({
  apiFetch: vi.fn(),
  getApiErrorDetail: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);
const getApiErrorDetailMock = vi.mocked(getApiErrorDetail);

describe('profile API', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    getApiErrorDetailMock.mockReset();
    apiFetchMock.mockResolvedValue(Response.json({ id: 1 }));
  });

  it('uploads profile photos as multipart form data', async () => {
    const photo = new File(['photo'], 'photo.png', { type: 'image/png' });

    await uploadProfilePhoto('test-token', photo);

    const [, options] = apiFetchMock.mock.calls[0];
    expect(apiFetchMock.mock.calls[0][0]).toBe('/api/v1/users/me/profile-photo');
    expect(options?.method).toBe('POST');
    expect(options?.headers).toEqual({ Authorization: 'Bearer test-token' });
    expect(options?.body).toBeInstanceOf(FormData);
  });

  it('updates the complete editable profile payload', async () => {
    const profile = {
      full_name: 'Expat User',
      street_address: '1 Main Street',
      city: 'Paris',
      postal_code: '75001',
      phone_number: '+33123456789',
    };

    await updateProfile('test-token', profile, 'https://example.com/photo.png');

    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...profile,
        profile_photo: 'https://example.com/photo.png',
      }),
    });
  });

  it('surfaces profile API errors', async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 413 }));
    getApiErrorDetailMock.mockResolvedValue('File is too large');

    const photo = new File(['photo'], 'photo.png', { type: 'image/png' });
    await expect(uploadProfilePhoto('test-token', photo)).rejects.toThrow('File is too large');
  });
});
