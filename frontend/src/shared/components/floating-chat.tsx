"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { MessageCircle, X, Minus } from 'lucide-react';
import ChatProvider, { useChatContext } from '@/features/chat/chat-provider';
import ChatMessage from '@/features/chat/chat-message';
import { Input } from '@/shared/components/ui/input';
import { Send } from 'lucide-react';

// Chat Interface Component (reuses existing chat logic)
function FloatingChatInterface({ onClose, onMinimize }: { onClose: () => void; onMinimize: () => void }) {
  const { messages, messagesEndRef, currentUsername, isLoadingHistory, sendMessage, isConnected } = useChatContext();
  const [message, setMessage] = useState('');

  const handleSendMessage = async () => {
    if (message.trim()) {
      await sendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-6 sm:right-24 z-[60] w-80 max-w-[calc(100vw-2rem)] h-96 max-h-[calc(100vh-6rem)] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">Live Chat</span>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={onMinimize}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white hover:bg-white/20"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoadingHistory && (
          <div className="text-center text-muted-foreground py-4 animate-pulse">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
            <div className="text-xs mt-2">Loading...</div>
          </div>
        )}
        
        {messages.length === 0 && !isLoadingHistory ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start chatting!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                currentUsername={currentUsername}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            className="flex-1 h-9 text-sm"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!isConnected || !message.trim()}
            size="sm"
            className="h-9 w-9 p-0 bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Floating Chat Component
export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // Start with 0, only count real messages
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [floatingUsername] = useState(() => `FloatingUser${Math.floor(Math.random() * 1000)}`);

  // Monitor messages for unread count (when chat is closed)
  const ChatMonitor = () => {
    const { messages, isLoadingHistory } = useChatContext();
    
    useEffect(() => {
      // Initialize baseline after first load
      if (!hasInitialized && !isLoadingHistory && messages.length >= 0) {
        setLastMessageCount(messages.length);
        setHasInitialized(true);
        return;
      }

      // Only count new messages that arrive after initialization when chat is closed
      if (hasInitialized && !isOpen && messages.length > lastMessageCount) {
        const newMessages = messages.length - lastMessageCount;
        setUnreadCount(prev => prev + newMessages);
      }
      
      // Always update the last message count
      if (hasInitialized) {
        setLastMessageCount(messages.length);
      }
    }, [messages.length, isLoadingHistory]);

    return null;
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setUnreadCount(0); // Reset unread count when opening
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  const handleMinimizeChat = () => {
    setIsOpen(false);
  };

  return (
    <ChatProvider username={floatingUsername}>
      <ChatMonitor />
      
      {/* Floating Chat Interface */}
      {isOpen && (
        <FloatingChatInterface 
          onClose={handleCloseChat}
          onMinimize={handleMinimizeChat}
        />
      )}

      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 sm:right-24 z-[60] h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce"
          style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}
        >
          <div className="relative">
            <MessageCircle className="w-16 h-16 text-white" />
            {unreadCount > 0 && (
              <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </Button>
      )}
    </ChatProvider>
  );
} 