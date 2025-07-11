"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  useGetApiKanbanBoardsBoardIdCurrentSession,
  useGetApiKanbanBoardsBoardIdSessions,
  useGetApiKanbanChatSessionsSessionIdMessages,
  usePostApiKanbanChatSessions,
  getGetApiKanbanBoardsBoardIdCurrentSessionQueryKey,
  getGetApiKanbanBoardsBoardIdSessionsQueryKey,
  getGetApiKanbanChatSessionsSessionIdMessagesQueryKey
} from '../../../api/hooks/api';
import type { 
  CreateChatSessionRequestDTO,
  GetCurrentChatSessionResponseDTO,
  GetBoardChatSessionsResponseDTO,
  GetChatSessionMessagesResponseDTO,
  ChatMessageResponseDtoDTO
} from '../../../api/models';
import { ChatMessage } from '../../openrouter/types';

export const useKanbanChatSessions = (boardId: string) => {
  const queryClient = useQueryClient();

  // Get current active session for the board
  const { 
    data: currentSession, 
    isLoading: isLoadingCurrentSession,
    error: currentSessionError
  } = useGetApiKanbanBoardsBoardIdCurrentSession(boardId, {
    query: {
      enabled: !!boardId,
      staleTime: 30000, // 30 seconds
    }
  });

  // Get all sessions for the board (for history)
  const { 
    data: allSessions, 
    isLoading: isLoadingAllSessions 
  } = useGetApiKanbanBoardsBoardIdSessions(boardId, {
    query: {
      enabled: !!boardId,
      staleTime: 60000, // 1 minute
    }
  });

  // Create new session mutation
  const createSessionMutation = usePostApiKanbanChatSessions({
    mutation: {
      onSuccess: (data) => {
        // Invalidate and refetch current session
        queryClient.invalidateQueries({
          queryKey: getGetApiKanbanBoardsBoardIdCurrentSessionQueryKey(boardId)
        });
        queryClient.invalidateQueries({
          queryKey: getGetApiKanbanBoardsBoardIdSessionsQueryKey(boardId)
        });
      }
    }
  });

  // Helper function to create a new session
  const createNewSession = async () => {
    if (!boardId) throw new Error('Board ID is required');
    
    const request: CreateChatSessionRequestDTO = {
      boardId: boardId
    };
    
    return await createSessionMutation.mutateAsync({ data: request });
  };

  // Helper function to convert API messages to ChatMessage format
  const convertApiMessagesToChatMessages = (apiMessages: ChatMessageResponseDtoDTO[]): ChatMessage[] => {
    return apiMessages.map(msg => ({
      id: msg.id || crypto.randomUUID(),
      content: msg.content || '',
      role: (msg.role || 'user') as 'user' | 'assistant' | 'system' | 'tool',
      timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      tool_calls: null, // These will be handled separately
      tool_name: undefined,
      tool_call_id: undefined
    }));
  };

  return {
    // Current session data
    currentSession: currentSession || null,
    sessionId: currentSession?.sessionId || null,
    isLoadingCurrentSession,
    currentSessionError,

    // All sessions data
    allSessions: allSessions || null,
    isLoadingAllSessions,

    // Session management
    createNewSession,
    isCreatingSession: createSessionMutation.isPending,
    createSessionError: createSessionMutation.error,

    // Helper functions
    convertApiMessagesToChatMessages,

    // Query invalidation helpers
    invalidateCurrentSession: () => {
      queryClient.invalidateQueries({
        queryKey: getGetApiKanbanBoardsBoardIdCurrentSessionQueryKey(boardId)
      });
    },
    invalidateAllSessions: () => {
      queryClient.invalidateQueries({
        queryKey: getGetApiKanbanBoardsBoardIdSessionsQueryKey(boardId)
      });
    }
  };
};

// Hook for loading messages from a specific session
export const useKanbanChatSessionMessages = (sessionId: string | null) => {
  const { 
    data: sessionMessages, 
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages
  } = useGetApiKanbanChatSessionsSessionIdMessages(sessionId!, {
    query: {
      enabled: !!sessionId,
      staleTime: 10000, // 10 seconds
    }
  });

  // Helper function to convert API messages to ChatMessage format
  const convertTochatMessages = (apiMessages: ChatMessageResponseDtoDTO[]): ChatMessage[] => {
    return apiMessages.map(msg => ({
      id: msg.id || crypto.randomUUID(),
      content: msg.content || '',
      role: (msg.role || 'user') as 'user' | 'assistant' | 'system' | 'tool',
      timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      tool_calls: null,
      tool_name: undefined,
      tool_call_id: undefined
    }));
  };

  const messages = sessionMessages?.messages ? 
    convertTochatMessages(sessionMessages.messages) : [];

  return {
    messages,
    sessionData: sessionMessages || null,
    isLoadingMessages,
    messagesError,
    refetchMessages
  };
}; 