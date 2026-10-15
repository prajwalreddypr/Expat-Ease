import { useCallback, useEffect, useState } from 'react';
import {
  getSettlementSteps,
  resetSettlementSteps,
  updateSettlementStep,
  uploadSettlementDocument,
} from '../api/checklist';
import type { ToastContextValue } from '../components/toast-context';
import type { SettlementStep, StepDocumentInfo } from '../types/checklist';

interface UseChecklistOptions {
  token: string | null;
  userReady: boolean;
  addToast: ToastContextValue['addToast'];
}

interface UploadedDocument extends StepDocumentInfo {
  filename?: string;
}

export const useChecklist = ({ token, userReady, addToast }: UseChecklistOptions) => {
  const [steps, setSteps] = useState<SettlementStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [wasCompleteOnLoad, setWasCompleteOnLoad] = useState(false);

  const fetchSteps = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getSettlementSteps(token);
      if (!response.ok) throw new Error(`Failed to fetch settlement steps: ${response.status}`);
      const data: SettlementStep[] = await response.json();
      setSteps(data);
      setWasCompleteOnLoad(
        data.length > 0 && data.every((step) => step.is_completed || step.is_skipped),
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && userReady) fetchSteps();
  }, [fetchSteps, token, userReady]);

  const updateStepCompletion = async (stepId: number, isCompleted: boolean) => {
    if (!token) return;

    try {
      const response = await updateSettlementStep(token, stepId, { is_completed: isCompleted });
      if (!response.ok) throw new Error('Failed to update step');
      const updated: SettlementStep = await response.json();
      setSteps((currentSteps) => currentSteps.map((step) => {
        if (step.id === stepId) return updated;
        if (step.step_number === updated.step_number + 1 && isCompleted) {
          return { ...step, is_unlocked: true };
        }
        return step;
      }));
    } catch {
      addToast({ type: 'error', message: 'Failed to update step. Please try again.' });
    }
  };

  const skipStep = async (stepId: number, reason: string) => {
    if (!token) return;

    try {
      const response = await updateSettlementStep(token, stepId, {
        is_skipped: true,
        skip_reason: reason || null,
      });
      if (!response.ok) throw new Error('Failed to skip step');
      const updated: SettlementStep = await response.json();
      setSteps((currentSteps) => currentSteps.map((step) => {
        if (step.id === stepId) return updated;
        if (step.step_number === updated.step_number + 1) return { ...step, is_unlocked: true };
        return step;
      }));
      addToast({ type: 'success', message: 'Step marked as not applicable.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to skip step. Please try again.' });
    }
  };

  const unskipStep = async (stepId: number) => {
    if (!token) return;

    try {
      const response = await updateSettlementStep(token, stepId, { is_skipped: false });
      if (!response.ok) throw new Error('Failed to undo skip');
      const updated: SettlementStep = await response.json();
      setSteps((currentSteps) => currentSteps.map((step) => step.id === stepId ? updated : step));
      addToast({ type: 'success', message: 'Step restored.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to undo skip. Please try again.' });
    }
  };

  const saveNotes = async (stepId: number, notes: string) => {
    if (!token) return;

    try {
      const response = await updateSettlementStep(token, stepId, { notes });
      if (!response.ok) throw new Error('Failed to save notes');
      const updated: SettlementStep = await response.json();
      setSteps((currentSteps) => currentSteps.map((step) => step.id === stepId ? updated : step));
      addToast({ type: 'success', message: 'Notes saved.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to save notes. Please try again.' });
    }
  };

  const uploadDocument = async (stepId: number, file: File, label?: string) => {
    if (!token) return;

    setUploadingFile(stepId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (label) formData.append('custom_name', label);
      const response = await uploadSettlementDocument(token, stepId, formData);
      if (!response.ok) throw new Error('Upload failed');
      const document: UploadedDocument = await response.json();
      setSteps((currentSteps) => currentSteps.map((step) => step.id === stepId
        ? {
            ...step,
            documents: [
              ...step.documents,
              {
                id: document.id,
                original_filename: document.original_filename,
                file_path: document.file_path,
              },
            ],
          }
        : step));
      addToast({ type: 'success', message: 'Document uploaded successfully.' });
    } catch {
      addToast({ type: 'error', message: 'Failed to upload document. Please try again.' });
    } finally {
      setUploadingFile(null);
    }
  };

  const resetSteps = async () => {
    if (!token) return false;

    try {
      setIsResetting(true);
      setError(null);
      const response = await resetSettlementSteps(token);
      if (!response.ok) {
        const responseError = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(responseError.detail || `Reset failed: ${response.status}`);
      }
      setSteps(await response.json());
      setWasCompleteOnLoad(false);
      addToast({ type: 'success', message: 'Settlement steps reset. You can start over!' });
      return true;
    } catch (caughtError) {
      addToast({
        type: 'error',
        message: caughtError instanceof Error ? caughtError.message : 'Failed to reset steps.',
      });
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    steps,
    loading,
    error,
    uploadingFile,
    isResetting,
    wasCompleteOnLoad,
    fetchSteps,
    updateStepCompletion,
    skipStep,
    unskipStep,
    saveNotes,
    uploadDocument,
    resetSteps,
  };
};
