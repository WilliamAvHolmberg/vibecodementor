"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { usePostApiKanbanBoards } from '@/api/hooks/api';
import type { KanbanBoardSummaryDtoDTO, CreateBoardResponseDTO } from '@/api/models';

interface BoardSelectorProps {
  boards: KanbanBoardSummaryDtoDTO[];
  onSelectBoard: (boardId: string) => void;
  onRefreshBoards?: () => void;
}

export function BoardSelector({ boards, onSelectBoard, onRefreshBoards }: BoardSelectorProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const createBoardMutation = usePostApiKanbanBoards();

  const handleCreateBoard = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    
    try {
      // Now properly typed as CreateBoardResponseDTO
      const response: CreateBoardResponseDTO = await createBoardMutation.mutateAsync({
        data: {
          title: title.trim(),
          description: description.trim()
        }
      });

      console.log('Board creation response:', response);

      if (response.boardId) {
        // Refresh the boards list if callback provided
        if (onRefreshBoards) {
          onRefreshBoards();
        }
        
        // Close modal and reset form
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        
        // Navigate to the new board
        router.push(`/kanban/${response.boardId}`);
      } else {
        console.error('No board ID found in response:', response);
        // If we can't get the ID, at least refresh the boards list
        if (onRefreshBoards) {
          onRefreshBoards();
        }
        // Close modal anyway
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
      }
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const progressColor = (completed: number, total: number) => {
    if (total === 0) return 'bg-gray-200';
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Your Boards
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select a board to start managing your tasks
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Board
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Board Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter board title..."
                  disabled={isCreating}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your board..."
                  rows={3}
                  disabled={isCreating}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setTitle('');
                    setDescription('');
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateBoard}
                  disabled={!title.trim() || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Board'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => (
          <Card 
            key={board.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-105 hover:-translate-y-1 hover:shadow-blue-200"
            onClick={() => onSelectBoard(board.id!)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                {board.title}
              </CardTitle>
              {board.description && (
                <CardDescription className="line-clamp-2">
                  {board.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="group-hover:bg-blue-100 transition-colors">
                  {board.taskCount} {board.taskCount === 1 ? 'task' : 'tasks'}
                </Badge>
                {(board.taskCount || 0) > 0 && (
                  <span className="text-sm text-gray-600">
                    {board.completedTaskCount}/{board.taskCount} done
                  </span>
                )}
              </div>
              
              {(board.taskCount || 0) > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${progressColor(board.completedTaskCount || 0, board.taskCount || 0)}`}
                    style={{ 
                      width: `${Math.round(((board.completedTaskCount || 0) / (board.taskCount || 1)) * 100)}%` 
                    }}
                  />
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-3">
                Updated {board.updatedAt ? new Date(board.updatedAt).toLocaleDateString() : 'Unknown'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 