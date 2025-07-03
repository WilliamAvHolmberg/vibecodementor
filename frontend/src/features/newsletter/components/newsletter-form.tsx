'use client';

import { useState } from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import type { NewsletterFormData } from '../hooks/use-newsletter';

interface NewsletterFormProps {
  onSuccess?: () => void;
  className?: string;
  // Accept state and functions as props
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (formData: NewsletterFormData) => Promise<boolean>;
}

export function NewsletterForm({ 
  onSuccess, 
  className = '',
  isSubmitting,
  error,
  onSubmit
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    const formData: NewsletterFormData = { email: email.trim() };
    const success = await onSubmit(formData);
    if (success) {
      setEmail(''); // Clear form on success
      onSuccess?.();
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = email.trim() && isValidEmail(email.trim());

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Email Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          className="pl-10 pr-4 py-3 text-base"
          required
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Subscribing...
          </>
        ) : (
          <>
            Subscribe Now
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  );
} 