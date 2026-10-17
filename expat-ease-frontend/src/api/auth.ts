import type { User } from '../contexts/auth-context';
import { apiFetch, getApiErrorDetail } from '../utils/api';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

const authorizationHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const parseResponse = async <ResponseBody>(
  response: Response,
  fallbackMessage: string,
): Promise<ResponseBody> => {
  if (!response.ok) {
    const detail = await getApiErrorDetail(response).catch(() => undefined);
    throw new Error(detail || fallbackMessage);
  }
  return response.json() as Promise<ResponseBody>;
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiFetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse<LoginResponse>(response, 'Login failed');
};

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await apiFetch('/api/v1/users/me', {
    headers: authorizationHeaders(token),
  });
  return parseResponse<User>(response, 'Failed to fetch user profile');
};

export const updateSettlementCountry = async (
  token: string,
  country: string,
): Promise<User> => {
  const response = await apiFetch('/api/v1/users/me', {
    method: 'PATCH',
    headers: {
      ...authorizationHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      settlement_country: country,
      country_selected: true,
    }),
  });
  return parseResponse<User>(response, 'Failed to update settlement country');
};
