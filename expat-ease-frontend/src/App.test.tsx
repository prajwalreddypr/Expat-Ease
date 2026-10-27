import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the public landing page for a signed-out visitor', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Settle in with confidence.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', {
        name: /world map showing international journeys/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create free account' })).toBeInTheDocument()
  })
})
