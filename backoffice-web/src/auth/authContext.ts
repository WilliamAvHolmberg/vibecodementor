import { createContext, useContext } from 'react'
import { ApplicationRoleType } from '../app/routing/types'

export type AuthUser = { 
  userId: string
  email: string
  roles: ApplicationRoleType[]
}

export type OtpStep = 'idle' | 'email-sent' | 'verifying'

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  otpStep: OtpStep
  otpEmail: string | null
  error: string | null
}

export interface AuthActions {
  sendOtp: (email: string) => Promise<boolean>
  verifyOtp: (email: string, otpCode: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  backToEmail: () => void
  refetchAuth: () => void
}

export type AuthContextType = AuthState & AuthActions

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
