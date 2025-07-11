"use client";

import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, StreamState, StreamEventType } from '../../openrouter/types';
import { useEventSourceStream } from '../../openrouter/hooks/useEventSourceStream';
import { useKanbanChatSessions, useKanbanChatSessionMessages } from './useKanbanChatSessions';

export const useKanbanChat = (boardId: string) => {
  // Track the active session ID (may differ from backend's "current" session)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Session management
  const { 
    currentSession, 
    sessionId, 
    isLoadingCurrentSession, 
    createNewSession, 
    isCreatingSession 
  } = useKanbanChatSessions(boardId);

  // Load messages from active session (or current session if none selected)
  const effectiveSessionId = activeSessionId || sessionId;
  const { 
    messages: sessionMessages, 
    isLoadingMessages,
  } = useKanbanChatSessionMessages(effectiveSessionId);

  // Messages state that will match backend structure
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentState, setCurrentState] = useState<StreamState | ''>('');
  const [currentStreamingContent, setCurrentStreamingContent] = useState('');
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null);

  // Use our EventSource abstraction
  const { isStreaming, startStream, closeStream, createUrlWithParams } = useEventSourceStream();

  // Auto-create session if none exists
  useEffect(() => {
    if (!isLoadingCurrentSession && !currentSession && !isCreatingSession) {
      console.log('🎯 No current session found, creating new session...');
      createNewSession();
    }
  }, [isLoadingCurrentSession, currentSession, isCreatingSession, createNewSession]);

  // Load messages from database when session is ready (ONCE per session)
  useEffect(() => {
    const currentEffectiveSessionId = activeSessionId || sessionId;
    
    if (currentEffectiveSessionId && currentEffectiveSessionId !== loadedSessionId && sessionMessages.length > 0) {
      console.log('🎯 Loading messages from database:', sessionMessages.length);
      setMessages(sessionMessages);
      setLoadedSessionId(currentEffectiveSessionId);
    } else if (currentEffectiveSessionId && currentEffectiveSessionId !== loadedSessionId && sessionMessages.length === 0 && !isLoadingMessages) {
      // Session exists but no messages - clear any existing messages and mark as loaded
      console.log('🎯 New session with no messages, clearing chat');
      setMessages([]);
      setLoadedSessionId(currentEffectiveSessionId);
    }
  }, [activeSessionId, sessionId, sessionMessages, loadedSessionId, isLoadingMessages]);

  // Function to send a message to Kanban LLM
  const sendMessage = useCallback(async (message: string, modelId: string = 'google/gemini-2.5-flash') => {
    const currentEffectiveSessionId = activeSessionId || sessionId;
    
    // Don't send if no session available yet
    if (!currentEffectiveSessionId) {
      console.log('🎯 No session ID available yet, waiting...');
      return;
    }

    try {
      // Reset streaming state
      setCurrentStreamingContent('');
      let contentBuffer = '';
      console.log(`🎯 Sending kanban message with model: ${modelId}`);

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: message,
        role: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Reset streaming content
      setCurrentStreamingContent('');
      setCurrentState(StreamState.Loading);

      // Create params for the kanban stream
      const params: Record<string, string> = {
        message,
        conversationId: currentEffectiveSessionId, // Use effective session ID
        model: modelId
      };

      // Add boardId if provided
      if (boardId) {
        params.boardId = boardId;
      }

      console.log('🎯 Kanban request parameters:', params);

      // Create URL with query parameters - use kanban-specific endpoint
      const url = createUrlWithParams(`/api/kanban/chat/stream`, params);
      console.log('🎯 Kanban stream URL:', url);

      // Start the stream with handlers for different events
      startStream(url, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onMessage: (parsedData: any, eventType?: string) => {
          const eventInfo = {
            type: eventType,
            data: parsedData,
            timestamp: new Date().toISOString()
          };

          // Create a more compact log for frequent text chunks
          if (eventType === StreamEventType.TextContent || eventType === 'chunk') {
            console.log(`🎯 Kanban stream [${eventType}]: ${parsedData.textDelta || parsedData.text || 'No text'}`);
          } else {
            // Log full event details for other event types
            console.log('🎯 Kanban stream event:', eventInfo);
          }

          // Direct handling of the StreamEventArgs events
          if (eventType) {
            switch (eventType) {
              case StreamEventType.StateChange:
                // Update state
                setCurrentState(parsedData.state as StreamState);

                // If complete state, finalize the message
                if (contentBuffer.trim()) {
                  const bufferCopy = `${contentBuffer}`;
                  setMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: bufferCopy,
                    timestamp: new Date(),
                    tool_calls: null
                  }]);

                  contentBuffer = '';
                  setCurrentStreamingContent('');
                }
                break;

              case StreamEventType.TextContent:
                // Update streaming content
                if (parsedData.textDelta) {
                  contentBuffer += parsedData.textDelta;
                  setCurrentStreamingContent(contentBuffer);
                }
                break;

              case StreamEventType.ToolCall:
                try {
                  if (parsedData.toolCall) {
                    // Add assistant message with the tool call
                    setMessages(prev => [...prev, {
                      id: crypto.randomUUID(),
                      role: 'assistant',
                      content: "", // Empty content with tool calls
                      timestamp: new Date(),
                      tool_calls: [parsedData.toolCall]
                    }]);
                  }
                } catch (error) {
                  console.error('❌ Error processing kanban tool call:', error);
                }
                break;

              case StreamEventType.ToolResult:
                try {
                  if (parsedData.toolResult && parsedData.toolCall) {
                    // Add tool message with the result
                    setMessages(prev => [...prev, {
                      id: crypto.randomUUID(),
                      role: 'tool',
                      content: parsedData.toolResult,
                      timestamp: new Date(),
                      tool_name: parsedData.toolName,
                      tool_call_id: parsedData.toolCall.id
                    }]);
                  }
                } catch (error) {
                  console.error('❌ Error processing kanban tool result:', error);
                }
                break;

              case StreamEventType.Error:
                console.error("🎯 Kanban stream error:", parsedData);

                // If we have content but no final message, add one
                if (contentBuffer.trim()) {
                  setMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: contentBuffer,
                    timestamp: new Date(),
                    tool_calls: null
                  }]);
                }
                closeStream();
                break;

              case 'done':
                // Handle the done event
                if (contentBuffer.trim()) {
                  // Add final assistant message
                  setMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: contentBuffer,
                    timestamp: new Date(),
                    tool_calls: null
                  }]);
                }
                closeStream();
                break;

              default:
                console.log('🎯 Unknown kanban event type:', eventType);
                break;
            }
          }
        },

        onError: (error) => {
          console.error("🎯 Kanban stream connection error:", error);

          // If we have content but error occurred, still add the message
          if (contentBuffer.trim()) {
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: contentBuffer,
              timestamp: new Date(),
              tool_calls: null
            }]);
          }

          closeStream();
        },

        onOpen: () => {
          console.log("🎯 Kanban stream connection opened successfully");
        }
      });

    } catch (error) {
      console.error('❌ Error sending kanban message:', error);
      closeStream();
    }
  }, [startStream, closeStream, createUrlWithParams, activeSessionId, sessionId, boardId]);

  // Load conversation history
  const loadConversationHistory = useCallback((history: ChatMessage[]) => {
    setMessages(history);
  }, []);

  // Reset chat function - now creates a new session
  const resetChat = useCallback(async () => {
    setMessages([]);
    setCurrentStreamingContent('');
    setCurrentState('');
    setLoadedSessionId(null); // Reset loaded session tracking
    setActiveSessionId(null); // Reset active session to use the new current session
    closeStream();
    
    // Create new session
    try {
      await createNewSession();
      console.log('🎯 Created new chat session');
    } catch (error) {
      console.error('❌ Error creating new session:', error);
    }
  }, [closeStream, createNewSession]);

  // Create new session function
  const startNewChat = useCallback(async () => {
    await resetChat();
  }, [resetChat]);

  // Switch to existing session function
  const switchToSession = useCallback(async (newSessionId: string) => {
    const currentEffectiveSessionId = activeSessionId || sessionId;
    
    if (newSessionId === currentEffectiveSessionId) {
      console.log('🎯 Already on this session');
      return;
    }

    console.log('🎯 Switching to session:', newSessionId);
    
    // Reset current state
    setMessages([]);
    setCurrentStreamingContent('');
    setCurrentState('');
    setLoadedSessionId(null);
    closeStream();

    // Set the new active session - this will trigger loading messages via useKanbanChatSessionMessages
    setActiveSessionId(newSessionId);
    
    console.log('🎯 Switched to session:', newSessionId);
  }, [activeSessionId, sessionId, closeStream]);

  return {
    // Messages and streaming state
    messages,
    isStreaming,
    currentStreamingContent,
    currentState,
    
    // Core functions
    sendMessage,
    resetChat,
    startNewChat,
    switchToSession,
    loadConversationHistory,
    
    // Session info
    sessionId: activeSessionId || sessionId, // Return the effective session ID
    currentSession,
    isLoadingCurrentSession,
    isLoadingMessages,
    
    // Loading states
    isReady: !isLoadingCurrentSession && !isCreatingSession && !!(activeSessionId || sessionId)
  };
}; 