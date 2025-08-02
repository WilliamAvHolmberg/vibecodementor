'use client';

import React from 'react';
import { useAuth } from './auth-context';
import { AuthFlow } from './auth-flow';

interface AuthGuardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: string;
  loadingMessage?: string;
  onSuccess?: () => void;
}

export function AuthGuard({ 
  children, 
  title = "Sign In Required",
  description = "Please sign in to access this page",
  icon = "🔐",
  loadingMessage = "Loading...",
  onSuccess
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign in form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {icon} {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
          
          <AuthFlow onSuccess={onSuccess} />
        </div>
      </div>
    );
  }

  // Authenticated - render protected content
  return <>{children}</>;
} 