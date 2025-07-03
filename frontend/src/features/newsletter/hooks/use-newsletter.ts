'use client';

import { useState } from 'react';
import { usePostApiNewsletterSubscribe } from '@/api/hooks/api';
import type { SubscribeToNewsletterRequestDTO } from '@/api/models';

export interface NewsletterFormData {
  email: string;
}

export interface NewsletterState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  message: string | null;
}

export function useNewsletter() {
  const [state, setState] = useState<NewsletterState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
    message: null
  });

  const subscribeNewsletter = usePostApiNewsletterSubscribe();

  const subscribe = async (formData: NewsletterFormData) => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null, message: null }));

    try {
      const requestData: SubscribeToNewsletterRequestDTO = {
        email: formData.email
      };

      const response = await subscribeNewsletter.mutateAsync({ data: requestData });
      setState({
        isSubmitting: false,
        isSuccess: true,
        error: null,
        message: response.message || 'Thanks for subscribing!'
      });

      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to subscribe. Please try again.';
      
      setState({
        isSubmitting: false,
        isSuccess: false,
        error: errorMessage,
        message: null
      });

      return false;
    }
  };

  const reset = () => {
    setState({
      isSubmitting: false,
      isSuccess: false,
      error: null,
      message: null
    });
  };

  return {
    ...state,
    subscribe,
    reset,
    // For analytics or additional data
    isNewSubscription: subscribeNewsletter.data?.isNewSubscription
  };
} 