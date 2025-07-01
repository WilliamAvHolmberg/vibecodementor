"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useChat } from './hooks';
import { ChatState } from './types';

interface ChatContextType extends ChatState {
  sendMessage: (message: string) => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  currentUsername: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  username: string;
  children: ReactNode;
}

export default function ChatProvider({ username, children }: ChatProviderProps) {
  const chatState = useChat(username);

  return (
    <ChatContext.Provider value={{ ...chatState, currentUsername: username }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 