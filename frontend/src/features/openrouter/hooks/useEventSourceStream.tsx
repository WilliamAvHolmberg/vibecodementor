import { useState, useRef, useEffect, useCallback } from 'react';
import { StreamEventType } from '../types';

type EventSourceOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessage: (data: any, eventType?: string) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
};

/**
 * Hook for handling EventSource (SSE) connections with a simple API
 */
export const useEventSourceStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup function to close EventSource connection
  const closeStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  // Start streaming from the given URL
  const startStream = useCallback((url: string, options: EventSourceOptions) => {
    // Close any existing connection
    closeStream();

    try {
      console.log("Starting EventSource connection to:", url);

      // Create new EventSource connection with minimal configuration
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;
      setIsStreaming(true);

      // Set up generic message handler for backward compatibility
      eventSource.onmessage = (event) => {
        try {
          console.log("Generic message event received:", event);
          const parsedData = JSON.parse(event.data);
          // Pass both data and null eventType to indicate generic message
          options.onMessage(parsedData, undefined);
        } catch (error) {
          console.error('Error parsing SSE message:', error, event.data);
        }
      };

      // Register specific event handlers for named events from OpenRouter
      const namedEvents: StreamEventType[] = [StreamEventType.TextContent, StreamEventType.StateChange, StreamEventType.ToolCall, StreamEventType.ToolResult, StreamEventType.Error, StreamEventType.Complete];

      namedEvents.forEach(eventName => {
        eventSource.addEventListener(eventName, (event: MessageEvent) => {
          try {
            console.log(`Named event '${eventName}' received:`, event);
            const parsedData = JSON.parse(event.data);
            // Pass both data and event type
            options.onMessage(parsedData, eventName);
          } catch (error) {
            console.error(`Error parsing ${eventName} event:`, error, event.data);
          }
        });
      });

      // Error handler with improved error reporting
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        if (options.onError) {
          options.onError(error);
        }
        
        // Log connection state
        console.log("EventSource readyState:", eventSource.readyState);
        console.log("EventSource URL:", eventSource.url);

        // Only close if in CLOSED state (2) or if the error seems unrecoverable
        if (eventSource.readyState === 2) {
          console.log("EventSource in CLOSED state, closing stream");
          closeStream();
        }
      };

      // Open handler with connection verification
      eventSource.onopen = () => {
        console.log("EventSource connection opened");
        if (options.onOpen) {
          options.onOpen();
        }
      };

      return true;
    } catch (error) {
      console.error('Error starting EventSource stream:', error);
      setIsStreaming(false);
      return false;
    }
  }, [closeStream]);

  // Create a URL with query parameters
  const createUrlWithParams = useCallback((baseUrl: string, params: Record<string, string>) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      closeStream();
    };
  }, [closeStream]);

  return {
    isStreaming,
    startStream,
    closeStream,
    createUrlWithParams,
  };
}; 