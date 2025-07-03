import { Loader2 } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { ToolCall } from '../../types';

interface ActiveToolCallProps {
    toolCalls: ToolCall[];
}

export function ActiveToolCall({ toolCalls }: ActiveToolCallProps) {
    return (
        <div className="mb-6 flex justify-start">
            <div className="max-w-[85%]">
                <div className="p-4 rounded-2xl rounded-tl-md bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200 dark:border-orange-700 shadow-lg">
                    
                    {/* Header */}
                    <div className="flex items-center space-x-3 text-orange-700 dark:text-orange-300 font-semibold mb-3">
                        <Sparkles className="h-5 w-5 animate-spin text-orange-600 dark:text-orange-400" />
                        <span>🔧 Running AI Tools...</span>
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>
                    
                    {/* Tool Calls */}
                    <div className="space-y-2">
                        {toolCalls.map(toolCall => (
                            <div key={toolCall.id} className="flex items-center space-x-3 text-sm text-orange-800 dark:text-orange-200">
                                <Loader2 className="h-4 w-4 animate-spin text-orange-600 dark:text-orange-400" />
                                <span>Executing</span>
                                <code className="bg-orange-100 dark:bg-orange-800/50 px-2 py-1 rounded-md font-mono text-xs border border-orange-200 dark:border-orange-700">
                                    {toolCall.function.name}
                                </code>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-3 text-xs text-orange-600 dark:text-orange-400 font-medium">
                        ⚡ Accessing live database and processing your request...
                    </div>
                </div>
                
                {/* Timestamp */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-left">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}; 