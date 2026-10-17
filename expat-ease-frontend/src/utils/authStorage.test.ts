import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAuthToken,
  clearStoredAuthSession,
  getStoredAuthSession,
  storeAuthToken,
  storeSelectedCountry,
} from './authStorage';

describe('auth storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and reads the token and selected country', () => {
    storeAuthToken('test-token');
    storeSelectedCountry('France');

    expect(getStoredAuthSession()).toEqual({
      token: 'test-token',
      selectedCountry: 'France',
    });
  });

  it('can invalidate a token without removing country selection', () => {
    storeAuthToken('test-token');
    storeSelectedCountry('Germany');

    clearAuthToken();

    expect(getStoredAuthSession()).toEqual({
      token: null,
      selectedCountry: 'Germany',
    });
  });

  it('clears the complete local session on logout', () => {
    storeAuthToken('test-token');
    storeSelectedCountry('France');

    clearStoredAuthSession();

    expect(getStoredAuthSession()).toEqual({ token: null, selectedCountry: null });
  });
});
