import type { UserDocument } from '../types/documents';
import { apiFetch, getApiErrorDetail } from '../utils/api';

const authorizationHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export const getDocuments = async (token: string): Promise<UserDocument[]> => {
  const response = await apiFetch('/api/v1/documents/', {
    headers: { ...authorizationHeaders(token), 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Failed to fetch documents: ${response.status}`);
  return response.json() as Promise<UserDocument[]>;
};

export const uploadDocument = async (
  token: string,
  file: File,
  customName: string,
): Promise<UserDocument> => {
  const formData = new FormData();
  formData.append('file', file);
  if (customName.trim()) formData.append('custom_name', customName.trim());
  const response = await apiFetch('/api/v1/documents/upload', {
    method: 'POST',
    headers: authorizationHeaders(token),
    body: formData,
  });
  if (!response.ok) {
    const detail = await getApiErrorDetail(response).catch(() => undefined);
    throw new Error(detail || 'Upload failed');
  }
  return response.json() as Promise<UserDocument>;
};

export const deleteDocument = async (token: string, documentId: number): Promise<void> => {
  const response = await apiFetch(`/api/v1/documents/${documentId}`, {
    method: 'DELETE',
    headers: authorizationHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to delete document');
};
