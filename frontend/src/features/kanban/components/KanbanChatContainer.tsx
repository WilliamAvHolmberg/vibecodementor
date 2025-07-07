"use client";

import { useEffect, useRef } from 'react';
import { useKanbanChat } from '../hooks/useKanbanChat';
import { MessageRenderer } from '../../openrouter/components/messages/MessageRenderer';
import { TextMessage } from '../../openrouter/components/messages/TextMessage';
import { ChatInput } from '../../openrouter/components/inputs/ChatInput';

interface KanbanChatContainerProps {
  boardId?: string;
  conversationId: string;
}

export function KanbanChatContainer({ 
  boardId, 
  conversationId
}: KanbanChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isStreaming,
    currentStreamingContent,
    sendMessage
  } = useKanbanChat(conversationId, boardId);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingContent]);

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            Kanban Assistant
          </h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Manage your board with natural language
        </p>
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !currentStreamingContent && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tell me what you want to do with your board.
            </p>
            <div className="space-y-2 text-left">
              {[
                "Create a task 'Fix bug' in TODO",
                "Move task to IN_PROGRESS", 
                "Add subtask 'Write tests'"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  className="block w-full text-left p-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  &quot;{suggestion}&quot;
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages
          .filter(message => {
            if (!message.content) return false;
            if (typeof message.content === 'string') {
              return message.content.trim().length > 0;
            }
            return Array.isArray(message.content) && message.content.length > 0;
          })
          .map((message, index) => (
            <MessageRenderer
              isLast={index === messages.length - 1}
              key={message.id}
              message={message}
            />
          ))}
        
        {currentStreamingContent && currentStreamingContent.trim().length > 0 && (
          <TextMessage message={currentStreamingContent} role="assistant" />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Status indicator */}
      {isStreaming && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-75" />
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-150" />
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              Thinking...
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <ChatInput
          onSendMessage={handleSendMessage}
          onExecuteCommand={() => {}}
          suggestions={[]}
          autoFocus={false}
        />
      </div>
    </div>
  );
} 