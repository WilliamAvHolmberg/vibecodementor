/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * API
 * Clean Architecture API with JWT Authentication
 * OpenAPI spec version: v1
 */
import type { KanbanSubtaskDtoDTO } from './kanbanSubtaskDtoDTO';

export interface KanbanTaskDtoDTO {
  id?: string;
  /** @nullable */
  title?: string | null;
  /** @nullable */
  description?: string | null;
  position?: number;
  createdAt?: string;
  updatedAt?: string;
  /** @nullable */
  subtasks?: KanbanSubtaskDtoDTO[] | null;
}
