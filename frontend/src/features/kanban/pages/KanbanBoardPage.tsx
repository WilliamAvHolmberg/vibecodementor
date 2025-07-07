"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth, AuthFlow } from '@/features/auth';
import { KanbanBoard } from '../components/KanbanBoard';
import { KanbanChatContainer } from '../components/KanbanChatContainer';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

interface KanbanSignalRUpdate {
  type: 'BoardCreated' | 'TaskCreated' | 'TaskMoved' | 'TaskUpdated';
  boardId: string;
  taskId?: string;
  title?: string;
  columnName?: string;
  fromColumn?: string;
  toColumn?: string;
  updateType?: string;
  userId: string;
  timestamp: string;
}

interface KanbanBoardPageProps {
  boardId: string;
}

export function KanbanBoardPage({ boardId }: KanbanBoardPageProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [conversationId] = useState(() => `kanban-${boardId}-${Date.now()}`);
  
  // Resizable panel state
  const [chatWidth, setChatWidth] = useState(400); // Default 400px instead of 320px
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBoardUpdate = (update: KanbanSignalRUpdate) => {
    console.log('🎯 Board update received:', update);
    // The KanbanBoard component will handle the refetch automatically
  };

  // Resizing handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;
    
    // Set min/max bounds for chat width
    const minWidth = 300;
    const maxWidth = containerRect.width * 0.6; // Max 60% of total width
    
    setChatWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add/remove event listeners for resizing
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Loading state
  if (authLoading) {
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
      <div className="h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 flex items-center justify-center">
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
          }} />
        </div>
      </div>
    );
  }

  // Authenticated - show the board
  return (
    <div className="h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-5rem)] bg-white dark:bg-gray-900 flex flex-col">
      {/* Board Header - Fixed height */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Link href="/kanban">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Boards</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Board Content with Resizable Panels - Takes remaining height */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden min-h-0">
        {/* Board Section - Flexible width */}
        <div 
          className="flex-shrink-0 overflow-hidden"
          style={{ width: `calc(100% - ${chatWidth}px)` }}
        >
          <div className="h-full p-4">
            <KanbanBoard 
              boardId={boardId}
              onBoardUpdate={handleBoardUpdate}
            />
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={`flex-shrink-0 w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-400 cursor-col-resize transition-colors relative ${
            isResizing ? 'bg-blue-500 dark:bg-blue-400' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Visual indicator dots */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-1">
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
          </div>
        </div>

        {/* Chat Section - Fixed width */}
        <div 
          className="flex-shrink-0 overflow-hidden"
          style={{ width: `${chatWidth}px` }}
        >
          <KanbanChatContainer
            boardId={boardId}
            conversationId={conversationId}
          />
        </div>
      </div>
    </div>
  );
} 