import { Loader2, X } from 'lucide-react';
import React, { useRef, useEffect } from 'react';
import { MessageRenderer } from './messages/MessageRenderer';
import { ChatInput } from './inputs/ChatInput'
import { useOpenRouterChat } from '../hooks/useOpenRouterChat';
import { TextMessage } from './messages/TextMessage';

interface ChatContainerProps {  
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
  deviceId?: string;
  initialMessage?: string | null;
  onInitialMessageSent?: () => void;
  isCompact?: boolean;
  onChatStart?: () => void;
  onSendMessageRef?: (sendMessage: (message: string) => void) => void;
  suggestions?: string[];
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  conversationId, 
  isOpen, 
  onClose, 
  deviceId, 
  initialMessage, 
  onInitialMessageSent,
  isCompact = false,
  onChatStart,
  onSendMessageRef,
  suggestions = []
}) => {
  const {
    messages,
    isStreaming,
    currentStreamingContent,
    currentState,
    sendMessage
  } = useOpenRouterChat(conversationId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Only scroll within the messages container, not the page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (deviceId && messages.length === 0 && isOpen) {
      sendMessage(`Get me the latest data for device ${deviceId}`);
    }
  }, [deviceId, messages.length, isOpen, sendMessage]);
  
  // Send initial message when provided
  useEffect(() => {
    if (initialMessage && isOpen && messages.length === 0) {
      sendMessage(initialMessage);
      onInitialMessageSent?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage, isOpen, messages.length, sendMessage, onInitialMessageSent]);

  // Always auto-scroll the messages container to show latest content
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingContent]);

  // Handle sending text messages
  const handleSendMessage = (content: string) => {
    if (isCompact && onChatStart) {
      onChatStart();
    }
    sendMessage(content);
  };

  // Expose sendMessage function to parent
  useEffect(() => {
    if (onSendMessageRef) {
      onSendMessageRef(handleSendMessage);
    }
  }, [onSendMessageRef]);

  // Handle device selection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDeviceSelect = (device: any) => {
    // Device selection logic can be implemented here
    console.log('Device selected:', device);
  };


  if (!isOpen) return null;

  // Compact mode: show suggestions and input when no messages yet
  if (isCompact && messages.length === 0 && !currentStreamingContent) {
    return (
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl rounded-t-lg shadow-xl border border-gray-200/20 dark:border-gray-700/20 border-t-orange-200 dark:border-t-orange-700 overflow-hidden">
        <div className="p-6 text-center border-b border-orange-100 dark:border-orange-800">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🎮 Try the AI Assistant Live
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto mb-4">
            Click any question below or ask your own
          </p>

          {/* Integrated Suggestions */}
          {suggestions.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  className="group text-left p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all duration-200 text-sm text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white border-2 border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600 transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex items-center mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                    <span className="group-hover:font-semibold font-medium">&quot;{suggestion}&quot;</span>
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity pl-5">
                    Click to test with real data →
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <ChatInput
          onSendMessage={handleSendMessage}
          onExecuteCommand={() => {}}
          suggestions={[]}
          autoFocus={false}
        />
      </div>
    );
  }

  return (
    <div
      className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl rounded-t-lg shadow-2xl 
                flex flex-col overflow-hidden border border-gray-200/20 dark:border-gray-700/20 border-t-orange-200 dark:border-t-orange-700 transition-all duration-500 ease-in-out"
      style={{
        height: isCompact ? '400px' : '600px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05)',
      }}
    >
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20"></div>
        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg"></div>
          <div>
            <h3 className="font-semibold text-white text-sm tracking-wide">OpenRouter AI Assistant</h3>
            <p className="text-orange-100 text-xs">Live • Real data access</p>
          </div>
        </div>
        {!isCompact && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-all duration-200 hover:scale-110 relative z-10 p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
        {messages.length === 0 && !currentStreamingContent && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Ready to analyze your data!</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Ask me anything about your analytics, users, or website performance.</p>

            {/* Integrated Suggestions for expanded mode */}
            {suggestions.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="group text-left p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all duration-200 text-sm text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white border-2 border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600 transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center mb-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                      <span className="group-hover:font-semibold font-medium">&quot;{suggestion}&quot;</span>
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity pl-5">
                      Click to test with real data →
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {messages
          .filter(message => {
            if (!message.content) return false;
            if (typeof message.content === 'string') {
              return message.content.trim().length > 0;
            }
            // For array content, check if it has any meaningful content
            return Array.isArray(message.content) && message.content.length > 0;
          })
          .map((message, index) => (
            <MessageRenderer
              isLast={index === messages.length - 1}
              key={message.id}
              message={message}
              onDeviceSelect={handleDeviceSelect}
            />
          ))}
        {currentStreamingContent && currentStreamingContent.trim().length > 0 ? (
          <div>
            <TextMessage message={currentStreamingContent} role="assistant" />
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Status indicator */}
      {isStreaming && currentState ? (
        <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-t border-orange-200/50 dark:border-orange-700/50">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 text-orange-600 animate-spin" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">{currentState}</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onExecuteCommand={() => { }}
        suggestions={[]}
        autoFocus={false}
      />
    </div>
  );
}; 