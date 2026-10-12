import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, getApiUrl } from './api'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getApiUrl', () => {
  it('builds an API URL from the configured base URL', () => {
    expect(getApiUrl('/api/v1/users/me')).toBe(
      'http://localhost:8000/api/v1/users/me',
    )
  })

  it('sends requests through the configured API base URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response())
    const options = {
      method: 'POST',
      headers: { Authorization: 'Bearer test-token' },
    }

    await apiFetch('/api/v1/users/me', options)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/users/me',
      options,
    )
  })
})
