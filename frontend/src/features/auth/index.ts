// Auth Feature Exports
// Usage: import { useAuth, AuthProvider, AuthFlow } from '@/features/auth'

// Context & Hooks
export { AuthProvider, useAuth } from './auth-context';
export { useAuth as useAuthHook } from './use-auth';

// Components
export { EmailInput } from './email-input';
export { OtpInput } from './otp-input';
export { AuthFlow } from './auth-flow';

// Types
export type { User, AuthState, AuthActions, AuthContextType } from './auth-context'; 