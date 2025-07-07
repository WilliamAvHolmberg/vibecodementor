"use client";

import { KanbanTask } from './KanbanTask';
import type { KanbanColumnDtoDTO, KanbanTaskDtoDTO } from '@/api/models';

interface KanbanColumnProps {
  column: KanbanColumnDtoDTO;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const getColumnColor = (columnName: string) => {
    switch (columnName.toUpperCase()) {
      case 'TODO':
        return 'text-blue-600 dark:text-blue-400';
      case 'IN_PROGRESS':
        return 'text-orange-600 dark:text-orange-400';
      case 'DONE':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const tasks = column.tasks || [];

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 h-full flex flex-col">
      {/* Column Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className={`font-semibold text-sm ${getColumnColor(column.name || '')}`}>
            {(column.name || '').replace('_', ' ')}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-600">
            <p className="text-xs">No tasks</p>
          </div>
        ) : (
          tasks
            .sort((a: KanbanTaskDtoDTO, b: KanbanTaskDtoDTO) => (a.position || 0) - (b.position || 0))
            .map((task: KanbanTaskDtoDTO) => (
              <KanbanTask key={task.id} task={task} />
            ))
        )}
      </div>
    </div>
  );
} 