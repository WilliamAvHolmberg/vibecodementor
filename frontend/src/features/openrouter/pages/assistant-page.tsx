import React, { useState } from 'react';
import { FloatingChatButton } from '../components/FloatingChatButton';
import { ChatContainer } from '../components/ChatContainer';

export const AssistantPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };
  
  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Assistant</h1>
      <p className="mb-4">This page will contain assistant features and documentation.</p>
      
      {/* Content for the page will go here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-medium mb-4">How to use the assistant</h2>
        <p className="text-gray-600">
          Click the chat button in the bottom right corner to open the assistant.
          You can ask questions about your devices, troubleshoot issues, or get help with system features.
        </p>
      </div>
      
      <FloatingChatButton onClick={toggleChat} />
      <ChatContainer isOpen={isOpen} onClose={() => setIsOpen(false)} conversationId="1" />
    </div>
  );
}; 