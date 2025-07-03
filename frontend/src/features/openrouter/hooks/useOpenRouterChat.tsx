import { useState, useCallback } from 'react';
import { ChatMessage, StreamState, StreamEventType } from '../types';
import { useEventSourceStream } from './useEventSourceStream';

export const useOpenRouterChat = (conversationId: string) => {
    // Messages state that will match backend structure
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentState, setCurrentState] = useState<StreamState | ''>('');
    const [currentStreamingContent, setCurrentStreamingContent] = useState('');
    console.log(messages)

    // Use our EventSource abstraction
    const { isStreaming, startStream, closeStream, createUrlWithParams } = useEventSourceStream();


    // Function to send a message to OpenRouter
    const sendMessage = async (message: string, modelId: string = 'google/gemini-2.5-flash-preview') => {
    //const sendMessage = async (message: string, modelId: string = 'anthropic/claude-sonnet-4') => {
        try {
            // Reset streaming state
            setCurrentStreamingContent('');
            let contentBuffer = '';
            console.log(`Sending message to OpenRouter with model: ${modelId}`);

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

            // Create params for the stream
            const params = {
                message,
                conversationId,
                model: modelId  // Include the model ID in the request
            };

            console.log('Request parameters:', params);

            // Create URL with query parameters
            const url = createUrlWithParams(`/api/openrouter/tools/chat/stream`, params);
            console.log('Stream URL:', url);

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
                        console.log(`Stream event [${eventType}]: ${parsedData.textDelta || parsedData.text || 'No text'}`);
                    } else {
                        // Log full event details for other event types
                        console.log('Stream event:', eventInfo);
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
                                    console.error('Error processing tool call:', error);
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
                                    console.error('Error processing tool result:', error);
                                }
                                break;

                            case StreamEventType.Error:
                                console.error("Stream error event:", parsedData);

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
                                console.log('Unknown event type:', eventType);
                                break;
                        }
                    }
                },

                onError: (error) => {
                    console.error("Stream connection error:", error);

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
                    console.log("Stream connection opened successfully");
                }
            });

        } catch (error) {
            console.error('Error sending message:', error);
            closeStream();
        }
    };

    // Load conversation history
    const loadConversationHistory = useCallback((history: ChatMessage[]) => {
        setMessages(history);
    }, []);

    // Reset chat function
    const resetChat = useCallback(() => {
        setMessages([]);
        setCurrentStreamingContent('');
        setCurrentState('');
        closeStream();
    }, [closeStream]);

    return {
        messages,
        isStreaming,
        currentStreamingContent,
        currentState,
        sendMessage,
        resetChat,
        loadConversationHistory
    };
}; 