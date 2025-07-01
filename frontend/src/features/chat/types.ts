// Chat Feature Types
import type { ChatMessageDtoDTO } from '@/api/models';

// Re-export the generated type for convenience
export type ChatMessage = ChatMessageDtoDTO;

export interface ChatUser {
  id: string;
  username: string;
  isOnline: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  onlineUsers: ChatUser[];
  isConnected: boolean;
  isLoading: boolean;
  isLoadingHistory: boolean;
  hasMoreMessages: boolean;
}

export interface SendMessageRequest {
  username: string;
  message: string;
}

export interface UserEventData {
  type: 'UserRegistered' | 'UserLeft' | 'UserJoined';
  userId: string;
  email?: string;
  message: string;
  timestamp: string;
}

export interface GetMessagesParams {
  take?: number;
  before?: string;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  count: number;
  hasMore: boolean;
} 