const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getApiUrl = (endpoint: string) => {
    return `${API_BASE_URL}${endpoint}`;
};

export const apiFetch = (endpoint: string, options?: RequestInit) => {
    return fetch(getApiUrl(endpoint), options);
};
