import { useCallback, useEffect, useState } from 'react';
import { deleteDocument, getDocuments, uploadDocument } from '../api/documents';
import type { UserDocument } from '../types/documents';

export const useDocuments = (token: string | null, userReady: boolean) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      setDocuments(await getDocuments(token));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && userReady) void fetchDocuments();
  }, [fetchDocuments, token, userReady]);

  const addDocument = async (file: File | null, customName: string): Promise<boolean> => {
    if (!file || !token) {
      setUploadError('Please select a file');
      return false;
    }
    try {
      setUploading(true);
      setUploadError(null);
      const uploadedDocument = await uploadDocument(token, file, customName);
      setDocuments((currentDocuments) => [uploadedDocument, ...currentDocuments]);
      return true;
    } catch (caughtError) {
      setUploadError(caughtError instanceof Error ? caughtError.message : 'Upload failed');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (documentId: number) => {
    if (!token || !window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(token, documentId);
      setDocuments((currentDocuments) => currentDocuments.filter(
        (document) => document.id !== documentId,
      ));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Delete failed');
    }
  };

  return {
    documents,
    loading,
    error,
    uploading,
    uploadError,
    setUploadError,
    fetchDocuments,
    addDocument,
    removeDocument,
  };
};
