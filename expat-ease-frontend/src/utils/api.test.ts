import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, getApiErrorDetail, getApiUrl } from './api'

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

  it('reads a string detail from an API error response', async () => {
    const response = Response.json({ detail: 'Email already registered' }, { status: 400 })

    await expect(getApiErrorDetail(response)).resolves.toBe('Email already registered')
  })

  it('returns undefined when an API response has no string detail', async () => {
    const response = Response.json({ message: 'Bad request' }, { status: 400 })

    await expect(getApiErrorDetail(response)).resolves.toBeUndefined()
  })
})
