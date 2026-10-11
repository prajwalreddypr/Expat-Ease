import { createContext, useContext } from 'react'

export interface User {
  id: number
  email: string
  full_name: string | null
  is_active: boolean
  created_at: string
  country: string | null
  settlement_country: string | null
  country_selected: boolean
  profile_photo: string | null
  street_address: string | null
  city: string | null
  postal_code: string | null
  phone_number: string | null
}

export interface AuthContextValue {
  user: User | null
  token: string | null
  selectedCountry: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  selectCountry: (country: string) => void
  refreshUser: () => Promise<void>
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
