"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { KanbanSubtask } from './KanbanSubtask';
import type { KanbanTaskDtoDTO, KanbanSubtaskDtoDTO } from '@/api/models';

interface KanbanTaskProps {
  task: KanbanTaskDtoDTO;
}

export function KanbanTask({ task }: KanbanTaskProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((st: KanbanSubtaskDtoDTO) => st.isCompleted).length;
  const totalSubtasks = subtasks.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 group">
      {/* Task Header - Always visible and clickable */}
      <div 
        className="p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {task.title}
              </h3>
              {totalSubtasks > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              )}
            </div>
            
            {/* Show description preview when collapsed */}
            {!isExpanded && task.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {/* Expand/Collapse button */}
          <button className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Progress bar when collapsed */}
        {!isExpanded && totalSubtasks > 0 && (
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700">
          {/* Full description */}
          {task.description && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Task metadata */}
          <div className="mt-3 space-y-2">
            {task.createdAt && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3 mr-2" />
                <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="w-3 h-3 mr-2 flex items-center justify-center">↻</span>
                <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Subtasks - only show when expanded */}
          {subtasks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </h4>
              <div className="space-y-2">
                {subtasks.map((subtask: KanbanSubtaskDtoDTO, index: number) => (
                  <KanbanSubtask 
                    key={`${task.id}-subtask-${index}`} 
                    subtask={subtask} 
                    index={index} 
                  />
                ))}
              </div>
              
              {/* Detailed progress indicator */}
              <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {Math.round((completedSubtasks / totalSubtasks) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 