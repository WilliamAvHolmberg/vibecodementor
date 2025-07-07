"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePostApiAuthSendOtp, usePostApiAuthVerifyOtp, useGetApiAuthMe } from '@/api/hooks/api';
import { useQueryClient } from '@tanstack/react-query';
import type { 
  SendOtpRequestDTO, 
  VerifyOtpRequestDTO 
} from '@/api/models';

export interface User {
  userId: string;
  email: string;
  isAuthenticated: boolean;
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
  
  // Manual refresh of auth state
  refetchAuth: () => void;
}

export type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    otpStep: 'idle',
    otpEmail: null,
    error: null,
  });

  // Use the /me endpoint to check authentication status
  const {
    data: meData,
    isLoading: meLoading,
    error: meError,
    refetch: refetchMe
  } = useGetApiAuthMe({
    query: {
      retry: false, // Don't retry on 401
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  });

  // API mutations
  const sendOtpMutation = usePostApiAuthSendOtp();
  const verifyOtpMutation = usePostApiAuthVerifyOtp();

  // Update auth state based on /me endpoint response
  useEffect(() => {
    if (meLoading) {
      setState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (meError) {
      // 401 or other auth errors - user is not authenticated
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      return;
    }

    if (meData && meData.isAuthenticated && meData.userId && meData.email) {
      // User is authenticated
      const user: User = {
        userId: meData.userId,
        email: meData.email,
        isAuthenticated: meData.isAuthenticated,
      };

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
    } else {
      // Response received but user not authenticated
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, [meData, meLoading, meError]);

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
      await verifyOtpMutation.mutateAsync({ data: request });
      
      // After successful verification, the server should have set the auth cookie
      // Refetch the /me endpoint to get updated user info
      await refetchMe();
      
      setState(prev => ({
        ...prev,
        otpStep: 'idle',
        otpEmail: null,
      }));
      
      return true;
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
    // Clear React Query cache
    queryClient.clear();
    
    // Reset state
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      otpStep: 'idle',
      otpEmail: null,
      error: null,
    }));

    // Note: Server cookies will expire naturally or we could add a logout endpoint
    // For now, clearing the cache and state is sufficient
    
    // Optionally call a logout endpoint here:
    // try {
    //   await fetch('/api/auth/logout', { method: 'POST' });
    // } catch (error) {
    //   console.error('Logout error:', error);
    // }
  };

  // Clear error message
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Manual refresh of auth state
  const refetchAuth = () => {
    refetchMe();
  };

  const contextValue: AuthContextType = {
    // State
    ...state,
    
    // Actions
    sendOtp,
    verifyOtp,
    logout,
    clearError,
    refetchAuth,
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