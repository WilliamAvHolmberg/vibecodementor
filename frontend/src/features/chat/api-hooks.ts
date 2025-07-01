// Chat API hooks with proper typing
// This will use the generated API client but with manual typing until Orval types are fixed

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { ChatMessage, GetMessagesParams } from './types';

// API functions with proper typing
export const getChatMessages = async (params?: GetMessagesParams): Promise<ChatMessage[]> => {
  const response = await apiClient.get<ChatMessage[]>('/api/Chat/messages', { params });
  return response.data;
};

// React Query hooks
export const useGetChatMessages = (params?: GetMessagesParams) => {
  return useQuery({
    queryKey: ['chat-messages', params],
    queryFn: () => getChatMessages(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for infinite loading (for pagination)
export const useGetChatMessagesInfinite = (take: number = 20) => {
  return useQuery({
    queryKey: ['chat-messages-infinite'],
    queryFn: () => getChatMessages({ take }),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// Hook for loading older messages (pagination)
export const useGetOlderMessages = (before?: string, take: number = 20) => {
  return useQuery({
    queryKey: ['chat-messages-older', before],
    queryFn: () => getChatMessages({ take, before }),
    enabled: !!before, // Only run when we have a before timestamp
    staleTime: 1000 * 60 * 10, // 10 minutes for older messages
    refetchOnWindowFocus: false,
  });
}; 