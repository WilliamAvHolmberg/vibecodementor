/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * API
 * Clean Architecture API with JWT Authentication
 * OpenAPI spec version: v1
 */

export interface CheckInHabitResponseDTO {
  checkInId?: string;
  habitId?: string;
  date?: string;
  isSuccess?: boolean;
  /** @nullable */
  reflection?: string | null;
  completedAt?: string;
}
