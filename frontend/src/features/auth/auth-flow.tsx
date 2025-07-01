"use client";

import { useAuth } from './use-auth';
import { EmailInput } from './email-input';
import { OtpInput } from './otp-input';

interface AuthFlowProps {
  onSuccess?: () => void;
  className?: string;
}

export function AuthFlow({ onSuccess, className = "" }: AuthFlowProps) {
  const { otpStep, otpEmail, isAuthenticated, user } = useAuth();

  // If already authenticated, show success state
  if (isAuthenticated && user) {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <div className="text-2xl">✅</div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Welcome back!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You&apos;re signed in as <span className="font-medium">{user.email}</span>
        </p>
      </div>
    );
  }

  // Show OTP input if email has been sent
  if (otpStep === 'email-sent' && otpEmail) {
    return (
      <OtpInput
        email={otpEmail}
        onSuccess={onSuccess}
        className={className}
      />
    );
  }

  // Default: show email input
  return (
    <EmailInput
      onSuccess={onSuccess}
      className={className}
    />
  );
} 