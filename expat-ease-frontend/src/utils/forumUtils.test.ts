import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDate } from './forumUtils'

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-13T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats recent timestamps consistently', () => {
    expect(formatDate('2026-10-13T11:30:00Z')).toBe('Just now')
    expect(formatDate('2026-10-13T09:00:00Z')).toBe('3h ago')
    expect(formatDate('2026-10-11T12:00:00Z')).toBe('2d ago')
  })
})
