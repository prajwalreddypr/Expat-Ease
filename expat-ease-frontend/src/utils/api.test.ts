import { describe, expect, it } from 'vitest'
import { getApiUrl } from './api'

describe('getApiUrl', () => {
  it('builds an API URL from the configured base URL', () => {
    expect(getApiUrl('/api/v1/users/me')).toBe(
      'http://localhost:8000/api/v1/users/me',
    )
  })
})
