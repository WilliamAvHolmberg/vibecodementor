"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Send, Edit2, Check, X } from 'lucide-react';
import ChatProvider, { useChatContext } from './chat-provider';
import ChatMessage from './chat-message';

function ChatMessages() {
  const { messages, messagesEndRef, currentUsername, isLoadingHistory } = useChatContext();

  return (
    <div className="flex-1 overflow-y-auto space-y-4 px-1 py-4 scroll-smooth">
      {/* Loading indicator for history */}
      {isLoadingHistory && (
        <div className="text-center text-muted-foreground py-8 animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          </div>
          <div className="text-sm mt-2">Loading messages...</div>
        </div>
      )}
      
      {/* Messages */}
      {messages.length === 0 && !isLoadingHistory ? (
        <div className="text-center text-muted-foreground py-12 animate-in fade-in duration-500">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-lg font-light">Start the conversation</p>
          <p className="text-sm opacity-60 mt-1">Your first message will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
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
  );
}

function ChatInput() {
  const [message, setMessage] = useState('');
  const { sendMessage, isConnected } = useChatContext();

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
    <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
      <div className="flex gap-3">
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
          className="flex-1 border-0 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!isConnected || !message.trim()}
          size="icon"
          className="h-12 w-12 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function InlineUsernameEditor() {
  const { currentUsername } = useChatContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUsername);

  const handleSave = () => {
    if (newUsername.trim() && newUsername.trim() !== currentUsername) {
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('rapid-dev-chat-username', newUsername.trim());
        // Trigger storage event to update the username
        window.dispatchEvent(new Event('storage'));
      }
    }
    setIsEditing(false);
    setNewUsername(currentUsername);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewUsername(currentUsername);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          onKeyDown={handleKeyPress}
          className="text-sm h-8 w-32 border-blue-200 focus:border-blue-400"
          autoFocus
        />
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={!newUsername.trim()}
          className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <span className="font-medium text-blue-600">{currentUsername}</span>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}


function ChatContainer() {
  const { isConnected } = useChatContext();

  return (
    <div className="h-[480px]">
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden h-full">
        {/* Clean Header with Status */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs">💬</span>
            </div>
            <div>
              <h3 className="text-lg font-light text-gray-900 dark:text-white">Live Chat Demo</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                <span>•</span>
                <span>Real-time SignalR</span>
              </div>
            </div>
          </div>
          <InlineUsernameEditor />
        </div>
        
        <ChatMessages />
        <div className="px-6 pb-4">
          <ChatInput />
        </div>
      </div>
    </div>
  );
}

interface ChatProps {
  username?: string;
}

// Generate a unique username for this session
function generateUsername(): string {
  const adjectives = ['Cool', 'Swift', 'Bright', 'Smart', 'Quick', 'Bold', 'Wise', 'Kind'];
  const animals = ['Panda', 'Fox', 'Wolf', 'Eagle', 'Tiger', 'Bear', 'Lion', 'Owl'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective}${animal}${number}`;
}

// Get or create a persistent username
function getPersistentUsername(): string {
  if (typeof window === 'undefined') return 'Anonymous'; // SSR safety
  
  const STORAGE_KEY = 'rapid-dev-chat-username';
  
  // Try to get existing username from localStorage
  const savedUsername = localStorage.getItem(STORAGE_KEY);
  if (savedUsername) {
    return savedUsername;
  }
  
  // Generate new username and save it
  const newUsername = generateUsername();
  localStorage.setItem(STORAGE_KEY, newUsername);
  return newUsername;
}

export default function Chat({ username }: ChatProps) {
  // Use state to track the current username for real-time updates
  const [currentUsername, setCurrentUsername] = useState(() => {
    return username || getPersistentUsername();
  });

  // Listen for localStorage changes (from UsernameEditor)
  useEffect(() => {
    const handleStorageChange = () => {
      if (!username) { // Only update if no username was provided as prop
        const newUsername = getPersistentUsername();
        setCurrentUsername(newUsername);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [username]);
  
  return (
    <ChatProvider username={currentUsername} key={currentUsername}>
      <ChatContainer />
    </ChatProvider>
  );
} 