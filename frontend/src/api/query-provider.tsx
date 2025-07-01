'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Time before data is considered stale
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Time before inactive queries are garbage collected
            gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
            // Retry configuration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors)
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            // Don't refetch on window focus by default
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Global error handling for mutations
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
              console.error('Mutation error:', error);
              // You can add global error handling here (toast notifications, etc.)
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 