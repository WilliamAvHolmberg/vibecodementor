"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

interface OtpInputProps {
  email: string;
  onSuccess?: () => void;
  onBack?: () => void;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({ email, onSuccess, onBack, disabled = false, className = "" }: OtpInputProps) {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { verifyOtp, sendOtp, error, clearError, otpStep } = useAuth();

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newOtp.every(digit => digit !== '')) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const code = otpCode.join('');
      if (code.length === 6) {
        handleSubmit(code);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 6) {
      const newOtp = digits.split('');
      setOtpCode(newOtp);
      inputRefs.current[5]?.focus();
      handleSubmit(digits);
    }
  };

  const handleSubmit = async (code?: string) => {
    const codeToSubmit = code || otpCode.join('');
    
    if (codeToSubmit.length !== 6 || isSubmitting) return;
    
    setIsSubmitting(true);
    clearError();
    
    const success = await verifyOtp(email, codeToSubmit);
    
    setIsSubmitting(false);
    
    if (success) {
      onSuccess?.();
    }
  };

  const handleResendCode = async () => {
    clearError();
    const success = await sendOtp(email);
    if (success) {
      toast.success('📧 New verification code sent!');
    }
  };

  const isLoading = isSubmitting || otpStep === 'verifying';
  const isComplete = otpCode.every(digit => digit !== '');

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Enter verification code
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        {/* OTP Input Grid */}
        <div className="flex justify-center gap-2">
          {otpCode.map((digit, index) => (
            <input
              key={index}
                             ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={disabled || isLoading}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Verify Button */}
        <Button
          onClick={() => handleSubmit()}
          disabled={!isComplete || disabled || isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Verifying...
            </div>
          ) : (
            'Verify code'
          )}
        </Button>

        {/* Actions */}
        <div className="flex items-center justify-between text-sm">
          <button
            onClick={onBack}
            disabled={disabled || isLoading}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          <button
            onClick={handleResendCode}
            disabled={disabled || isLoading}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Resend code
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        The code expires in 10 minutes
      </div>
    </div>
  );
} 