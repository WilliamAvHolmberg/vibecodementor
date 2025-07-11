"use client";

import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { useKanbanChat } from '../hooks/useKanbanChat';
import { MessageRenderer } from '../../openrouter/components/messages/MessageRenderer';
import { TextMessage } from '../../openrouter/components/messages/TextMessage';
import { ChatInput } from '../../openrouter/components/inputs/ChatInput';
import { Button } from '../../../shared/components/ui/button';
import { KanbanChatHistory } from './KanbanChatHistory';

interface KanbanChatContainerProps {
  boardId: string;
}

export function KanbanChatContainer({ 
  boardId
}: KanbanChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);

  const {
    messages,
    isStreaming,
    currentStreamingContent,
    sendMessage,
    startNewChat,
    switchToSession,
    sessionId,
    isReady,
    isLoadingCurrentSession
  } = useKanbanChat(boardId);

  const handleSelectSession = (newSessionId: string) => {
    switchToSession(newSessionId);
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingContent]);

  const handleSendMessage = (content: string) => {
    if (!isReady) {
      console.log('🎯 Chat not ready yet, please wait...');
      return;
    }
    sendMessage(content);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 relative">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              Kanban Assistant
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowHistory(true)}
              variant="ghost"
              size="sm"
              disabled={!isReady}
              className="text-xs"
            >
              <Clock className="w-3 h-3 mr-1" />
              History
            </Button>
            
            <Button
              onClick={startNewChat}
              variant="outline"
              size="sm"
              disabled={!isReady}
              className="text-xs"
            >
              New Chat
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isLoadingCurrentSession ? 'Loading session...' : 
             !isReady ? 'Setting up chat...' :
             'Manage your board with natural language'}
          </p>
          
          {sessionId && (
            <p className="text-xs text-gray-400 font-mono">
              {sessionId.substring(0, 8)}...
            </p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isReady && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isLoadingCurrentSession ? 'Loading your chat session...' : 'Setting up chat...'}
            </p>
          </div>
        )}

        {isReady && messages.length === 0 && !currentStreamingContent && (
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
                  disabled={!isReady}
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

      {/* Chat History Overlay */}
      <KanbanChatHistory
        boardId={boardId}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectSession={handleSelectSession}
        currentSessionId={sessionId}
      />
    </div>
  );
} 