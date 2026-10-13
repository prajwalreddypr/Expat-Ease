const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getApiUrl = (endpoint: string) => {
    return `${API_BASE_URL}${endpoint}`;
};

export const apiFetch = (endpoint: string, options?: RequestInit) => {
    return fetch(getApiUrl(endpoint), options);
};

export const getApiErrorDetail = async (response: Response): Promise<string | undefined> => {
    const body: unknown = await response.json();
    if (typeof body !== 'object' || body === null || !('detail' in body)) {
        return undefined;
    }
    return typeof body.detail === 'string' ? body.detail : undefined;
};
