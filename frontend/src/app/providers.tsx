"use client";

import { QueryProvider } from "@/api/query-provider";
import { AuthProvider } from "@/features/auth";
import { Toaster } from "@/shared/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  );
} 