import { apiFetch } from '../utils/api';

interface SettlementStepUpdate {
  is_completed?: boolean;
  is_skipped?: boolean;
  skip_reason?: string | null;
  notes?: string;
}

const authorizationHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const getSettlementSteps = (token: string) =>
  apiFetch('/api/v1/settlement-steps/', {
    headers: authorizationHeaders(token),
  });

export const updateSettlementStep = (
  token: string,
  stepId: number,
  update: SettlementStepUpdate,
) =>
  apiFetch(`/api/v1/settlement-steps/${stepId}`, {
    method: 'PATCH',
    headers: {
      ...authorizationHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });

export const uploadSettlementDocument = (
  token: string,
  stepId: number,
  formData: FormData,
) =>
  apiFetch(`/api/v1/documents/upload?settlement_step_id=${stepId}`, {
    method: 'POST',
    headers: authorizationHeaders(token),
    body: formData,
  });

export const resetSettlementSteps = (token: string) =>
  apiFetch('/api/v1/settlement-steps/reset', {
    method: 'POST',
    headers: {
      ...authorizationHeaders(token),
      'Content-Type': 'application/json',
    },
  });
