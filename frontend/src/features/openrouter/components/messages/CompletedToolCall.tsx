import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CompletedToolCallProps {
    toolId: string;
    toolName: string;
    result?: string;
}

export default function CompletedToolCall({ toolId, toolName, result }: CompletedToolCallProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div className="mb-4 flex justify-start">
            <div className="max-w-[85%]">
                <div key={toolId} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 rounded-xl shadow-md overflow-hidden">
                    {/* Header */}
                    <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-800/20 transition-colors"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">Tool completed:</span>
                                <code className="bg-green-100 dark:bg-green-800/50 px-2 py-1 rounded-md text-xs font-mono border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200">
                                    {toolName}
                                </code>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                {isExpanded ? 'Hide details' : 'View details'}
                            </span>
                            {isExpanded ?
                                <ChevronUp className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                                <ChevronDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                            }
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                        <div className="px-3 pb-3 border-t border-green-200/50 dark:border-green-700/50">
                            {result && (
                                <div className="mt-3">
                                    <div className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center">
                                        <span className="mr-2">📊</span>
                                        Function Result:
                                    </div>
                                    <div className="bg-green-100/50 dark:bg-green-800/30 p-3 rounded-lg text-xs font-mono overflow-x-auto border border-green-200/50 dark:border-green-700/50">
                                        <pre className="whitespace-pre-wrap text-green-800 dark:text-green-200">{result}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Timestamp */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-left">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};