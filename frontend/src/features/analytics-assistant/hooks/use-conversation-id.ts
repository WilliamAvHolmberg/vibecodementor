import { useState, useEffect } from 'react';

const CONVERSATION_ID_KEY = 'analytics-assistant-conversation-id';

export function useConversationId() {
  const [conversationId, setConversationId] = useState<string>('');

  useEffect(() => {
    // Get existing conversation ID from localStorage or create a new one
    let storedId = localStorage.getItem(CONVERSATION_ID_KEY);
    
    if (!storedId) {
      // Generate a new GUID-like ID
      storedId = crypto.randomUUID();
      localStorage.setItem(CONVERSATION_ID_KEY, storedId);
    }
    
    setConversationId(storedId);
  }, []);

  const resetConversation = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem(CONVERSATION_ID_KEY, newId);
    setConversationId(newId);
    return newId;
  };

  return {
    conversationId,
    resetConversation
  };
} 