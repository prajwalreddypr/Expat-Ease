const TOKEN_KEY = 'token';
const SELECTED_COUNTRY_KEY = 'selectedCountry';

export interface StoredAuthSession {
  token: string | null;
  selectedCountry: string | null;
}

export const getStoredAuthSession = (): StoredAuthSession => ({
  token: localStorage.getItem(TOKEN_KEY),
  selectedCountry: localStorage.getItem(SELECTED_COUNTRY_KEY),
});

export const storeAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const storeSelectedCountry = (country: string) => {
  localStorage.setItem(SELECTED_COUNTRY_KEY, country);
};

export const clearStoredAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SELECTED_COUNTRY_KEY);
};
