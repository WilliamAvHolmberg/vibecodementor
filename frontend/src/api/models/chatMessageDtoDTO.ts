/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * API
 * Clean Architecture API with JWT Authentication
 * OpenAPI spec version: v1
 */

export interface ChatMessageDtoDTO {
  id?: string;
  /** @nullable */
  userName?: string | null;
  /** @nullable */
  message?: string | null;
  timestamp?: string;
  /** @nullable */
  connectionId?: string | null;
  /** @nullable */
  messageType?: string | null;
  isSystemMessage?: boolean;
}
