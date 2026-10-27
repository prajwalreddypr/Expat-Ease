import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser, loginUser, updateSettlementCountry } from './auth';
import { apiFetch, getApiErrorDetail } from '../utils/api';

vi.mock('../utils/api', () => ({
  apiFetch: vi.fn(),
  getApiErrorDetail: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);
const getApiErrorDetailMock = vi.mocked(getApiErrorDetail);

describe('auth API', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    getApiErrorDetailMock.mockReset();
  });

  it('logs in with JSON credentials', async () => {
    apiFetchMock.mockResolvedValue(Response.json({ access_token: 'token', token_type: 'bearer' }));

    await expect(loginUser('user@example.com', 'secret')).resolves.toEqual({
      access_token: 'token',
      token_type: 'bearer',
    });
    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'secret' }),
    });
  });

  it('loads the current user with authorization', async () => {
    apiFetchMock.mockResolvedValue(Response.json({ id: 1 }));

    await getCurrentUser('test-token');

    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/users/me', {
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  it('updates settlement country and selection state together', async () => {
    apiFetchMock.mockResolvedValue(Response.json({ id: 1 }));

    await updateSettlementCountry('test-token', 'Germany');

    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settlement_country: 'Germany', country_selected: true }),
    });
  });

  it('surfaces the API detail when login fails', async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    getApiErrorDetailMock.mockResolvedValue('Incorrect email or password');

    await expect(loginUser('user@example.com', 'wrong')).rejects.toThrow(
      'Incorrect email or password',
    );
  });
});
