"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePostApiAuthSendOtp, usePostApiAuthVerifyOtp } from '@/api/hooks/api';
import type { 
  SendOtpRequestDTO, 
  VerifyOtpRequestDTO 
} from '@/api/models';

export interface User {
  email: string;
  token: string;
  expiresAt: string;
}

export interface AuthState {
  // Current state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // OTP flow state
  otpStep: 'idle' | 'email-sent' | 'verifying';
  otpEmail: string | null;
  
  // Error state
  error: string | null;
}

export interface AuthActions {
  // OTP Authentication flow
  sendOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otpCode: string) => Promise<boolean>;
  
  // Token management
  logout: () => void;
  clearError: () => void;
  
  // State checks
  isTokenExpired: () => boolean;
}

export type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

// Storage keys
const TOKEN_KEY = 'rapid-dev-auth-token';
const USER_KEY = 'rapid-dev-auth-user';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    otpStep: 'idle',
    otpEmail: null,
    error: null,
  });

  // API mutations
  const sendOtpMutation = usePostApiAuthSendOtp();
  const verifyOtpMutation = usePostApiAuthVerifyOtp();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem(USER_KEY);
        if (savedUser) {
          const user: User = JSON.parse(savedUser);
          
          // Check if token is expired
          const expiresAt = new Date(user.expiresAt);
          const now = new Date();
          
          if (expiresAt > now) {
            setState(prev => ({
              ...prev,
              user,
              isAuthenticated: true,
              isLoading: false,
            }));
            return;
          } else {
            // Token expired, clear storage
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear corrupted data
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    };

    initAuth();
  }, []);

  // Save user to storage when authenticated
  const saveUserToStorage = (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, user.token);
  };

  // Clear user from storage
  const clearUserFromStorage = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  // Send OTP to email
  const sendOtp = async (email: string): Promise<boolean> => {
    setState(prev => ({ ...prev, error: null, otpEmail: email }));
    
    try {
      const request: SendOtpRequestDTO = { email };
      await sendOtpMutation.mutateAsync({ data: request });
      
      setState(prev => ({ 
        ...prev, 
        otpStep: 'email-sent',
        otpEmail: email,
      }));
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : 'Failed to send OTP';
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        otpStep: 'idle',
      }));
      return false;
    }
  };

  // Verify OTP and authenticate
  const verifyOtp = async (email: string, otpCode: string): Promise<boolean> => {
    setState(prev => ({ ...prev, error: null, otpStep: 'verifying' }));
    
    try {
      const request: VerifyOtpRequestDTO = { email, otpCode };
      const response = await verifyOtpMutation.mutateAsync({ data: request });
      
      if (response.token && response.email && response.expiresAt) {
        const user: User = {
          email: response.email,
          token: response.token,
          expiresAt: response.expiresAt,
        };
        
        saveUserToStorage(user);
        
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          otpStep: 'idle',
          otpEmail: null,
        }));
        
        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : 'Invalid OTP code';
        
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        otpStep: 'email-sent', // Stay on OTP input step
      }));
      return false;
    }
  };

  // Logout user
  const logout = () => {
    clearUserFromStorage();
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      otpStep: 'idle',
      otpEmail: null,
      error: null,
    }));
  };

  // Clear error message
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Check if token is expired
  const isTokenExpired = (): boolean => {
    if (!state.user) return true;
    
    const expiresAt = new Date(state.user.expiresAt);
    const now = new Date();
    return expiresAt <= now;
  };

  // Auto-logout on token expiry
  useEffect(() => {
    if (state.user && isTokenExpired()) {
      logout();
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [state.user]);

  const contextValue: AuthContextType = {
    // State
    ...state,
    
    // Actions
    sendOtp,
    verifyOtp,
    logout,
    clearError,
    isTokenExpired,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 