import React, { useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onExecuteCommand: (commandId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  suggestions: any[];
  autoFocus?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onExecuteCommand,
  suggestions,
  autoFocus = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize function
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setTimeout(adjustHeight, 0);
  };
  
  // Handle message send
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue);
    setInputValue('');
    
    // Reset height
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '50px';
      }
    }, 10);
  };
  
  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (commandId: string) => {
    onExecuteCommand(commandId);
  };
  
  return (
    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      {/* Enhanced Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex justify-start p-4 space-x-2 border-t border-gray-200/50 dark:border-gray-700/50">
          {suggestions.map(suggestion => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion.id)}
              className="group px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 
                        border border-orange-200 dark:border-orange-700 rounded-full text-orange-700 dark:text-orange-300
                        text-sm hover:from-orange-200 hover:to-red-200 dark:hover:from-orange-800/50 dark:hover:to-red-800/50 
                        hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200 
                        transform hover:scale-105 shadow-sm hover:shadow-md"
            >
              <span className="group-hover:font-medium">{suggestion.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Modern Input Field */}
      <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              autoFocus={autoFocus}
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your analytics, users, or performance data..."
              className="w-full p-4 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-2xl
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                        focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-700 
                        focus:border-orange-400 dark:focus:border-orange-500
                        text-sm resize-none transition-all duration-200 shadow-sm
                        placeholder:text-gray-500 dark:placeholder:text-gray-400"
              style={{
                minHeight: "56px",
                overflow: inputValue.split('\n').length > 5 ? 'auto' : 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            />
            
            {/* Enhanced Send Button */}
            <div className="absolute right-3 bottom-3 flex items-center">
              <button
                onClick={handleSendMessage}
                className={`group relative p-2.5 rounded-xl transition-all duration-200 transform ${
                  inputValue.trim() 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-110' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                disabled={!inputValue.trim()}
              >
                <ArrowUp className={`w-4 h-4 transition-transform ${inputValue.trim() ? 'group-hover:animate-bounce' : ''}`} />
                {inputValue.trim() && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Input Hint */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> to send • <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}; 