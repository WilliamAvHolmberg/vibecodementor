"use client";

import { QueryProvider } from "@/api/query-provider";
import { AuthProvider } from "@/features/auth";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  );
} 