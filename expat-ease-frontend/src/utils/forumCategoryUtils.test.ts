import { describe, expect, it } from 'vitest'
import { getCategoryColor } from './forumUtils'

describe('getCategoryColor', () => {
  it('returns the configured classes for a known category', () => {
    expect(getCategoryColor('housing')).toBe('bg-blue-100 text-blue-800')
  })

  it('uses the general category classes for an unknown category', () => {
    expect(getCategoryColor('unknown')).toBe('bg-gray-100 text-gray-800')
  })
})
