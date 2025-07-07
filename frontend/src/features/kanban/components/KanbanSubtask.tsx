"use client";

import { Check } from 'lucide-react';
import type { KanbanSubtaskDtoDTO } from '@/api/models';

interface KanbanSubtaskProps {
  subtask: KanbanSubtaskDtoDTO;
  index: number;
}

export function KanbanSubtask({ subtask }: KanbanSubtaskProps) {
  return (
    <div className="flex items-center space-x-2 py-1 text-sm">
      <div className={`flex items-center justify-center w-3 h-3 rounded border flex-shrink-0 ${
        subtask.isCompleted 
          ? 'bg-green-500 border-green-500' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
      }`}>
        {subtask.isCompleted && <Check className="w-2 h-2 text-white" />}
      </div>
      
      <span className={`flex-1 ${
        subtask.isCompleted 
          ? 'text-gray-500 dark:text-gray-400 line-through' 
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {subtask.title}
      </span>
    </div>
  );
} 