"use client";

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Mail, ArrowRight } from 'lucide-react';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

interface EmailInputProps {
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export function EmailInput({ disabled = false, className = "" }: EmailInputProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { sendOtp, error, clearError, otpStep } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    clearError();
    
    const success = await sendOtp(email.trim());
    
    setIsSubmitting(false);
    
    if (success) {
      toast.success('📧 Verification code sent to your email!');
    }
  };

  const isLoading = isSubmitting || otpStep === 'verifying';

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Sign in with email
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We&apos;ll send you a secure code to verify your identity
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled || isLoading}
            className="pl-10"
            autoComplete="email"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={!email.trim() || disabled || isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {otpStep === 'verifying' ? 'Verifying...' : 'Sending code...'}
            </div>
          ) : (
            <div className="flex items-center">
              Send verification code
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          )}
        </Button>
      </form>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        By continuing, you agree to our terms of service
      </div>
    </div>
  );
} 