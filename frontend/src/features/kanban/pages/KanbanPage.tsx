"use client";

import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/features/auth';
import { CreateFirstBoard } from '../components/CreateFirstBoard';
import { BoardSelector } from '../components/BoardSelector';
import { useKanbanBoards } from '../hooks/useKanbanBoards';

export function KanbanPage() {
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

  return (
    <AuthGuard
      title="Kanban Board"
      description="Sign in to access your AI-powered kanban boards"
      icon="🎯"
      loadingMessage="Loading boards..."
    >
      <KanbanContent 
        boards={boards}
        boardsLoading={boardsLoading}
        createBoard={createBoard}
        isCreating={isCreating}
        refetch={refetch}
        handleSelectBoard={handleSelectBoard}
        handleCreateFirstBoard={handleCreateFirstBoard}
        handleRefreshBoards={handleRefreshBoards}
      />
    </AuthGuard>
  );
}

function KanbanContent({ 
  boards, 
  boardsLoading, 
  createBoard, 
  isCreating, 
  refetch, 
  handleSelectBoard, 
  handleCreateFirstBoard, 
  handleRefreshBoards 
}: {
  boards: any[];
  boardsLoading: boolean;
  createBoard: any;
  isCreating: boolean;
  refetch: any;
  handleSelectBoard: (boardId: string) => void;
  handleCreateFirstBoard: (title: string, description?: string) => Promise<void>;
  handleRefreshBoards: () => void;
}) {
  // Loading state for boards
  if (boardsLoading) {
    return (
      <div className="h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading boards...</p>
        </div>
      </div>
    );
  }

  // No boards exist
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

  // Show board selector
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