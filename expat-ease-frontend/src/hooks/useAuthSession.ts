import { useCallback, useEffect, useState } from 'react';
import { getCurrentUser, loginUser, updateSettlementCountry } from '../api/auth';
import type { AuthContextValue, User } from '../contexts/auth-context';
import {
  clearAuthToken,
  clearStoredAuthSession,
  getStoredAuthSession,
  storeAuthToken,
  storeSelectedCountry,
} from '../utils/authStorage';

export const useAuthSession = (): AuthContextValue => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async (authToken: string) => {
    try {
      const loadedUser = await getCurrentUser(authToken);
      setUser(loadedUser);

      if (loadedUser.country_selected && loadedUser.settlement_country) {
        setSelectedCountry(loadedUser.settlement_country);
        storeSelectedCountry(loadedUser.settlement_country);
      }
    } catch {
      clearAuthToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedSession = getStoredAuthSession();
    setSelectedCountry(storedSession.selectedCountry);

    if (storedSession.token) {
      setToken(storedSession.token);
      void loadUserProfile(storedSession.token);
    } else {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  const login = async (email: string, password: string) => {
    const loginResponse = await loginUser(email, password);
    setToken(loginResponse.access_token);
    storeAuthToken(loginResponse.access_token);
    await loadUserProfile(loginResponse.access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSelectedCountry(null);
    clearStoredAuthSession();
    window.location.href = '/';
  };

  const selectCountry = async (country: string) => {
    setSelectedCountry(country);
    storeSelectedCountry(country);

    if (!user || !token) return;

    try {
      const updatedUser = await updateSettlementCountry(token, country);
      setUser(updatedUser);
    } catch {
      // Country selection remains available locally if synchronization fails.
    }
  };

  const refreshUser = async () => {
    if (token) await loadUserProfile(token);
  };

  return {
    user,
    token,
    selectedCountry,
    login,
    logout,
    selectCountry,
    refreshUser,
    isLoading,
  };
};
