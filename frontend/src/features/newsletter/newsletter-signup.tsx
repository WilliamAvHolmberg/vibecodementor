'use client';

import { Mail } from 'lucide-react';
import { NewsletterForm } from './components/newsletter-form';
import { NewsletterSuccess } from './components/newsletter-success';
import { useNewsletter } from './hooks/use-newsletter';

interface NewsletterSignupProps {
  className?: string;
}

export function NewsletterSignup({ className = '' }: NewsletterSignupProps) {
  const { isSuccess, message, reset, isSubmitting, error, subscribe } = useNewsletter();
  
  return (
    <section 
      id="newsletter"
      className={`py-16 px-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 ${className}`}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
            Stay in the <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Loop</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Get the latest updates on new features, tutorials, and AI development insights delivered straight to your inbox.
          </p>
        </div>

        {/* Newsletter Form/Success Container */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden">
          <div className="p-8 md:p-12">
            
            {isSuccess ? (
              <div>
                <NewsletterSuccess message={message || undefined} />
                <div className="text-center mt-6">
                  <button
                    onClick={reset}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-sm transition-colors"
                  >
                    Subscribe another email
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Form Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Never Miss an Update
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Join developers building the future with AI-powered tools.
                  </p>
                </div>

                {/* Newsletter Form */}
                <div className="max-w-md mx-auto">
                  <NewsletterForm 
                    isSubmitting={isSubmitting}
                    error={error}
                    onSubmit={subscribe}
                  />
                </div>

                {/* Trust Indicators */}
                <div className="text-center mt-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No spam, ever. Unsubscribe anytime with one click.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 