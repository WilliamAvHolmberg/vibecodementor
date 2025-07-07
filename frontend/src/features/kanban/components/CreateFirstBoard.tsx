"use client";

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface CreateFirstBoardProps {
  onCreateBoard: (title: string, description?: string) => Promise<void>;
  isCreating?: boolean;
}

export function CreateFirstBoard({ onCreateBoard, isCreating = false }: CreateFirstBoardProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await onCreateBoard(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  if (!showForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Create Your First Board
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by creating a kanban board to manage your tasks with AI assistance.
          </p>
          
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Board
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
          Create New Board
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Board Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Project Board"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this board for?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={isCreating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !title.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Board
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 