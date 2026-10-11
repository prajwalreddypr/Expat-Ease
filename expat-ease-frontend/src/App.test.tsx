import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the public landing page for a signed-out visitor', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Welcome to Expat Ease' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Log in' })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
  })
})
