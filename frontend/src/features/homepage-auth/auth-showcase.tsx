"use client";

import { Button } from '@/shared/components/ui/button';
import { Shield, Check, LogOut } from 'lucide-react';
import { AuthFlow, useAuth } from '@/features/auth';
import { toast } from 'sonner';

function AuthDemoContent() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleAuthSuccess = () => {
    toast.success('🎉 Authentication successful!');
  };

  const handleLogout = () => {
    logout();
    toast.info('👋 Signed out successfully');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
      {isAuthenticated && user ? (
        // Authenticated state
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <div className="text-2xl">✅</div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Successful!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, <span className="font-medium">{user.email}</span>
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      ) : (
        // Authentication flow
        <AuthFlow onSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export function AuthShowcase() {
  return (
    <section id="auth" className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-4">
              Email + OTP Authentication
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Modern passwordless authentication with JWT tokens
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Auth Demo */}
            <AuthDemoContent />

          {/* Features List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Passwordless Authentication
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Secure email-based OTP system with no passwords to remember
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  JWT Token Security
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Stateless authentication with automatic token expiry
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Rate Limited OTP
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Built-in rate limiting prevents abuse and spam
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Email Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Powered by Resend for reliable email delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 