import React from 'react';
import { TextMessage } from './TextMessage';
import { ChatMessage, ToolCall } from '../../types';
import CompletedToolCall from './CompletedToolCall';
import { Loader2 } from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface MessageRendererProps {
  message: ChatMessage;
  isLast: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDeviceSelect?: (device: any) => void;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ message, isLast }) => {

  const renderToolCalls = (toolCalls: ToolCall[]) => {
    return (
      <div className="p-1 rounded-lg max-w-[80%] bg-blue-50 border border-blue-200 shadow-sm animate-pulse">
        <div className="flex items-center space-x-2 text-blue-600 font-medium mb-2">
          <Sparkles className="h-5 w-5 animate-spin text-blue-500" />
          <span>Running AI Tools...</span>
        </div>
        {toolCalls.map(toolCall => (
          <div key={toolCall.id} className="ml-7 mb-1 text-sm flex items-center text-blue-700">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            <span>Calling <code className="bg-blue-100 px-1 rounded">{toolCall.function.name}</code></span>
          </div>
        ))}
        <div className="ml-7 mt-2 text-xs text-blue-600">This may take a few seconds...</div>
      </div>
    );
  };

  const renderMessageContent = (message: ChatMessage) => {
    // Handle different content formats
    switch (message.role) {
      case 'tool':
        return <CompletedToolCall toolId={message.tool_call_id!} toolName={message.tool_name!} result={message.content as string} />;
      case 'assistant':
      case 'user':
        return <TextMessage role={message.role} message={message.content as string} />;
    }
  };

  return <>
    {renderMessageContent(message)}
    {message.tool_calls && isLast ? renderToolCalls(message.tool_calls) : null}
  </>
}; 