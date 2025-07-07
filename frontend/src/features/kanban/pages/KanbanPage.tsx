"use client";

import { useRouter } from 'next/navigation';
import { useAuth, AuthFlow } from '@/features/auth';
import { CreateFirstBoard } from '../components/CreateFirstBoard';
import { BoardSelector } from '../components/BoardSelector';
import { useKanbanBoards } from '../hooks/useKanbanBoards';

export function KanbanPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { boards, isLoading: boardsLoading, createBoard, isCreating, refetch } = useKanbanBoards();
  const router = useRouter();

  const handleSelectBoard = (boardId: string) => {
    // Navigate to the board page
    router.push(`/kanban/${boardId}`);
  };

  const handleRefreshBoards = () => {
    // Refetch the boards data
    refetch();
  };

  // Wrapper function for CreateFirstBoard that handles navigation
  const handleCreateFirstBoard = async (title: string, description?: string): Promise<void> => {
    try {
      const response = await createBoard(title, description);
      // Navigate to the new board if we got a valid response
      if (response.boardId) {
        router.push(`/kanban/${response.boardId}`);
      }
    } catch (error) {
      console.error('Failed to create board:', error);
      // Error is already handled by the mutation's onError callback
    }
  };

  // Loading state
  if (authLoading || boardsLoading) {
    return (
      <div className="h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign in form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              🎯 Kanban Board
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your AI-powered kanban boards
            </p>
          </div>
          
          <AuthFlow onSuccess={() => {
            // After successful auth, the page will automatically re-render
            // and show the boards since isAuthenticated will be true
          }} />
        </div>
      </div>
    );
  }

  // Authenticated but no boards exist
  if (boards.length === 0) {
    return (
      <div className="h-screen bg-white dark:bg-gray-900">
        <CreateFirstBoard 
          onCreateBoard={handleCreateFirstBoard}
          isCreating={isCreating}
        />
      </div>
    );
  }

  // Authenticated with boards - show board selector
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="py-8">
        <BoardSelector
          boards={boards}
          onSelectBoard={handleSelectBoard}
          onRefreshBoards={handleRefreshBoards}
        />
      </div>
    </div>
  );
} 