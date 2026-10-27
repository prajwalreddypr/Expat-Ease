import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteDocument, getDocuments, uploadDocument } from './documents';
import { apiFetch, getApiErrorDetail } from '../utils/api';

vi.mock('../utils/api', () => ({ apiFetch: vi.fn(), getApiErrorDetail: vi.fn() }));

const apiFetchMock = vi.mocked(apiFetch);
const getApiErrorDetailMock = vi.mocked(getApiErrorDetail);

describe('documents API', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    getApiErrorDetailMock.mockReset();
    apiFetchMock.mockResolvedValue(Response.json([]));
  });

  it('loads documents with authorization', async () => {
    await getDocuments('test-token');
    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/documents/', {
      headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' },
    });
  });

  it('uploads multipart documents with an optional name', async () => {
    apiFetchMock.mockResolvedValue(Response.json({ id: 1 }));
    const file = new File(['document'], 'document.pdf', { type: 'application/pdf' });
    await uploadDocument('test-token', file, 'Passport');
    const [, options] = apiFetchMock.mock.calls[0];
    expect(options?.headers).toEqual({ Authorization: 'Bearer test-token' });
    expect(options?.body).toBeInstanceOf(FormData);
    expect((options?.body as FormData).get('custom_name')).toBe('Passport');
  });

  it('deletes documents through the ownership-protected endpoint', async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await deleteDocument('test-token', 7);
    expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/documents/7', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  it('surfaces upload error details', async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 400 }));
    getApiErrorDetailMock.mockResolvedValue('Unsupported file type');
    const file = new File(['bad'], 'bad.exe');
    await expect(uploadDocument('test-token', file, '')).rejects.toThrow('Unsupported file type');
  });
});
