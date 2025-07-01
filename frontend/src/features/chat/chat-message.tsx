// Chat Message Component
import { ChatMessage as ChatMessageType } from './types';

interface ChatMessageProps {
  message: ChatMessageType;
  currentUsername: string;
}

export default function ChatMessage({ message, currentUsername }: ChatMessageProps) {
  const isOwnMessage = message.userName === currentUsername;
  const isSystemMessage = message.userName === 'System';

  return (
    <div
      className={`flex flex-col space-y-1 animate-in slide-in-from-bottom-2 duration-300 ${
        isOwnMessage ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 ${
          isSystemMessage
            ? 'bg-blue-100 text-blue-800 mx-auto text-center'
            : isOwnMessage
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700'
        }`}
      >
        {!isOwnMessage && !isSystemMessage && (
          <div className="text-xs font-medium mb-1 opacity-70">
            {message.userName}
          </div>
        )}
        {isOwnMessage && !isSystemMessage && (
          <div className="text-xs font-medium mb-1 opacity-70 text-right">
            You
          </div>
        )}
        <div className="text-sm">{message.message}</div>
      </div>
      <div className={`text-xs text-muted-foreground ${isOwnMessage ? 'text-right' : 'text-left'}`}>
        {new Date(message.timestamp || '').toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })}
      </div>
    </div>
  );
} 