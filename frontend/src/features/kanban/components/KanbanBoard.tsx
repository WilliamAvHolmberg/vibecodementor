"use client";

import { useEffect } from 'react';
import { useGetApiKanbanBoardsBoardId } from '../../../api/hooks/api';
import { KanbanColumn } from './KanbanColumn';
import { useKanbanSignalR } from '../hooks/useKanbanSignalR';
import { useQueryClient } from '@tanstack/react-query';
import type { KanbanColumnDtoDTO } from '@/api/models';

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

interface KanbanBoardProps {
    boardId: string;
    onBoardUpdate?: (update: KanbanSignalRUpdate) => void;
}

export function KanbanBoard({ boardId, onBoardUpdate }: KanbanBoardProps) {
    const queryClient = useQueryClient();
    const { connected, updates, joinBoard, leaveBoard } = useKanbanSignalR();

    // Fetch board data with the generated hook - now properly typed!
    const { data: board, isLoading, error, refetch } = useGetApiKanbanBoardsBoardId(boardId);

    // Join this board's SignalR group when component mounts
    useEffect(() => {
        if (connected && boardId) {
            joinBoard(boardId);
        }

        return () => {
            if (connected && boardId) {
                leaveBoard(boardId);
            }
        };
    }, [connected, boardId, joinBoard, leaveBoard]);

    // Handle SignalR updates for this board - invalidate and refetch
    useEffect(() => {
        const relevantUpdates = updates.filter(update => update.boardId === boardId);

        if (relevantUpdates.length > 0) {
            const latestUpdate = relevantUpdates[relevantUpdates.length - 1];

            if (onBoardUpdate) {
                onBoardUpdate(latestUpdate);
            }

            console.log('🎯 Board update received, refetching...', latestUpdate);

            // Invalidate and refetch the board data
            refetch()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updates, boardId, onBoardUpdate, queryClient]);

    // Loading state
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading board...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !board) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">Failed to load board</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const getTotalTasks = () => {
        return (board.columns || []).reduce((total: number, column: KanbanColumnDtoDTO) =>
            total + (column.tasks?.length || 0), 0);
    };

    const getCompletedTasks = () => {
        const doneColumn = (board.columns || []).find((col: KanbanColumnDtoDTO) => col.name === 'DONE');
        return doneColumn?.tasks?.length || 0;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Board Header */}
            <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {board.title}
                        </h1>
                        {board.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {board.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{getTotalTasks()} tasks</span>
                        <span>{getCompletedTasks()} completed</span>
                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                    </div>
                </div>
            </div>

            {/* Columns */}
            <div className="flex-1 overflow-hidden min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                    {(board.columns || [])
                        .sort((a: KanbanColumnDtoDTO, b: KanbanColumnDtoDTO) => (a.order || 0) - (b.order || 0))
                        .map((column: KanbanColumnDtoDTO) => (
                            <KanbanColumn key={column.id} column={column} />
                        ))}
                </div>
            </div>
        </div>
    );
} 