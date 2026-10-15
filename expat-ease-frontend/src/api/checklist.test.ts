import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSettlementSteps,
  resetSettlementSteps,
  updateSettlementStep,
  uploadSettlementDocument,
} from './checklist';
import { apiFetch } from '../utils/api';

vi.mock('../utils/api', () => ({
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

describe('checklist API', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    apiFetchMock.mockResolvedValue(new Response());
  });

  it('loads settlement steps with authorization', async () => {
    await getSettlementSteps('test-token');

    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/settlement-steps/', {
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  it('updates a settlement step with a JSON payload', async () => {
    await updateSettlementStep('test-token', 12, { is_completed: true });

    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/settlement-steps/12', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_completed: true }),
    });
  });

  it('uploads a step document without overriding the multipart content type', async () => {
    const formData = new FormData();

    await uploadSettlementDocument('test-token', 4, formData);

    expect(apiFetchMock).toHaveBeenCalledWith(
      '/api/v1/documents/upload?settlement_step_id=4',
      {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token' },
        body: formData,
      },
    );
  });

  it('resets settlement steps through the reset endpoint', async () => {
    await resetSettlementSteps('test-token');

    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/settlement-steps/reset', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-token',
        'Content-Type': 'application/json',
      },
    });
  });
});
