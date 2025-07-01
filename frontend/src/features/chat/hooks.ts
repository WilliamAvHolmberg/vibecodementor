"use client";

// Chat Feature Hooks
import { useState, useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { ChatUser, ChatState, UserEventData, ChatMessage } from './types';
import { useGetApiChatMessages } from '@/api/hooks/api';

export function useSignalRConnection(username: string) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create SignalR connection using our Next.js proxy
    const newConnection = new HubConnectionBuilder()
      .withUrl('/hubs/chat', {
        withCredentials: false
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(async () => {
          // Set our username on the server
          await connection.invoke('SetUsername', username);
          setConnected(true);
        })
        .catch(error => {
          console.error('❌ SignalR Connection Error:', error);
          setConnected(false);
        });

      connection.onclose(() => {
        setConnected(false);
      });

      connection.onreconnecting(() => {
        setConnected(false);
      });

      connection.onreconnected(() => {
        setConnected(true);
      });
    }
  }, [connection, username]);

  return { connection, connected };
}

export function useChat(username: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    onlineUsers: [],
    isConnected: false,
    isLoading: true,
    isLoadingHistory: false,
    hasMoreMessages: true,
  });

  const { connection, connected } = useSignalRConnection(username);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load message history using generated API
  const { data: messageHistory, isLoading: isLoadingMessages, error } = useGetApiChatMessages(
    { take: 20 }, // Load last 20 messages
    { 
      query: { 
        enabled: true, // Always try to load messages
        refetchOnWindowFocus: false 
      } 
    }
  );

  // Load message history when data is available
  useEffect(() => {
    if (messageHistory && messageHistory.length > 0) {
      setState(prev => ({
        ...prev,
        messages: messageHistory,
        hasMoreMessages: messageHistory.length === 20, // If we got 20, there might be more
        isLoadingHistory: false,
      }));
    } else if (!isLoadingMessages && messageHistory) {
      // No history but request completed
      setState(prev => ({
        ...prev,
        hasMoreMessages: false,
        isLoadingHistory: false,
      }));
    }
  }, [messageHistory, isLoadingMessages]);

  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      isConnected: connected, 
      isLoading: false,
      isLoadingHistory: isLoadingMessages,
    }));
  }, [connected, isLoadingMessages]);

  useEffect(() => {
    if (connection) {
      // Listen for incoming messages
      connection.on('ReceiveMessage', (messageData: {
        id?: string;
        userName?: string;
        message: string;
        timestamp?: string;
        connectionId?: string;
        messageType?: string;
        isSystemMessage?: boolean;
      }) => {
        const newMessage: ChatMessage = {
          id: messageData.id || Date.now().toString(),
          userName: messageData.userName || username,
          message: messageData.message,
          timestamp: messageData.timestamp || new Date().toISOString(),
          connectionId: messageData.connectionId,
          messageType: messageData.messageType || 'chat',
          isSystemMessage: messageData.isSystemMessage || false,
        };
        
        // Check if message already exists (to avoid duplicates from real-time + history)
        setState(prev => {
          const messageExists = prev.messages.some(m => m.id === newMessage.id);
          if (messageExists) {
            return prev;
          }
          return {
            ...prev,
            messages: [...prev.messages, newMessage]
          };
        });
      });

      // Listen for user events (join/leave)
      connection.on('UserEvent', (eventData: UserEventData) => {
        // Handle user registration broadcasts from domain events
        if (eventData.type === 'UserRegistered') {
          const systemMessage: ChatMessage = {
            id: Date.now().toString(),
            userName: 'System',
            message: `🎉 ${eventData.message}`,
            timestamp: new Date().toISOString(),
            connectionId: null,
            messageType: 'system',
            isSystemMessage: true,
          };
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, systemMessage]
          }));
        }
      });

      // Listen for online users updates
      connection.on('OnlineUsers', (users: string[]) => {
        const chatUsers: ChatUser[] = users.map(username => ({
          id: username,
          username,
          isOnline: true
        }));
        setState(prev => ({
          ...prev,
          onlineUsers: chatUsers
        }));
      });
    }

    return () => {
      if (connection) {
        connection.off('ReceiveMessage');
        connection.off('UserEvent');
        connection.off('OnlineUsers');
      }
    };
  }, [connection, username]);

  useEffect(() => {
    // Only auto-scroll for new messages, not when loading initial history
    if (state.isLoading || state.isLoadingHistory) {
      return;
    }
    
    // Auto-scroll to bottom when new messages arrive within the chat container
    // Add a small delay to let the message animation start first
    const scrollTimer = setTimeout(() => {
      if (messagesEndRef.current) {
        const chatContainer = messagesEndRef.current.closest('.overflow-y-auto');
        if (chatContainer) {
          // Smooth scroll within the container with easing
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
          });
        }
        // Removed the fallback scrollIntoView to prevent page-level scrolling
      }
    }, 50); // Small delay to let animation start

    return () => clearTimeout(scrollTimer);
  }, [state.messages, state.isLoading, state.isLoadingHistory]);

  const sendMessage = async (message: string) => {
    if (connection && message.trim() && connected) {
      try {
        await connection.invoke('SendMessage', message.trim());
      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    }
  };

  // Function to load more messages (for pagination)
  const loadMoreMessages = async () => {
    if (!state.hasMoreMessages || state.isLoadingHistory) return;
    
    const oldestMessage = state.messages[0];
    if (!oldestMessage?.timestamp) return;

    setState(prev => ({ ...prev, isLoadingHistory: true }));
    
    // This would require a separate hook call - we'll implement this later
  };

  return {
    ...state,
    sendMessage,
    loadMoreMessages,
    messagesEndRef,
    error: (error as Error)?.message,
  };
} 