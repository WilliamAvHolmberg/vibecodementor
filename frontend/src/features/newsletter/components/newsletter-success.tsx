'use client';

import { CheckCircle2, Mail } from 'lucide-react';

interface NewsletterSuccessProps {
  message?: string;
  className?: string;
}

export function NewsletterSuccess({ 
  message = "Thanks for subscribing!", 
  className = '' 
}: NewsletterSuccessProps) {
  return (
    <div className={`text-center p-6 ${className}`}>
      {/* Success Icon */}
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* Success Message */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        You&apos;re All Set! 🎉
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {message}
      </p>

      {/* Additional Info */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
        <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Check your email for updates
        </span>
      </div>
    </div>
  );
} 