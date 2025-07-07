"use client";

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGetApiKanbanBoards, usePostApiKanbanBoards, getGetApiKanbanBoardsQueryKey } from '@/api/hooks/api';
import { CreateBoardRequestDTO } from '@/api/models';

export function useKanbanBoards() {
  const queryClient = useQueryClient();
  
  // Get boards query
  const {
    data: boardsData,
    isLoading,
    error,
    refetch: refetchQuery
  } = useGetApiKanbanBoards();

  // Create board mutation
  const createBoardMutation = usePostApiKanbanBoards({
    mutation: {
      onSuccess: () => {
        toast.success('Board created successfully!');
        // Invalidate boards query to refetch
        queryClient.invalidateQueries({
          queryKey: getGetApiKanbanBoardsQueryKey()
        });
      },
      onError: (error) => {
        console.error('Failed to create board:', error);
        toast.error('Failed to create board. Please try again.');
      }
    }
  });

  const createBoard = useCallback(async (title: string, description?: string) => {
    const request: CreateBoardRequestDTO = {
      title,
      description: description || null
    };
    
    return createBoardMutation.mutateAsync({ data: request });
  }, [createBoardMutation]);

  const refetch = useCallback(async () => {
    return refetchQuery();
  }, [refetchQuery]);

  // Use the generated API data directly
  const boards = boardsData || [];

  return {
    boards,
    isLoading: isLoading || createBoardMutation.isPending,
    error,
    createBoard,
    refetch,
    isCreating: createBoardMutation.isPending
  };
} 