import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageRole } from '@/features/openrouter/types';

interface TextMessageProps {
  role: MessageRole;
  message: string;
}

export const TextMessage: React.FC<TextMessageProps> = ({ role, message }) => {
  return (
    <div className={`mb-6 ${role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className={`max-w-[85%] ${role === 'user' ? 'order-2' : ''}`}>
        {/* Message Bubble */}
        <div
          className={`relative p-4 rounded-2xl shadow-lg ${
            role === 'assistant'
              ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-md'
              : 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-br-md ml-auto shadow-orange-200 dark:shadow-orange-900/50'
          }`}
          style={{
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}
        >
          <ReactMarkdown 
            components={{
              // Enhanced styling for markdown elements
              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
              a: ({ children, href }) => (
                <a 
                  href={href} 
                  className={`font-medium underline decoration-2 underline-offset-2 transition-colors ${
                    role === 'user' 
                      ? 'text-orange-100 hover:text-white decoration-orange-200' 
                      : 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 decoration-orange-300'
                  }`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className={`px-2 py-1 rounded-md font-mono text-sm ${
                  role === 'user' 
                    ? 'bg-orange-400/20 text-orange-100' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                }`}>
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className={`p-4 rounded-xl overflow-x-auto my-3 font-mono text-sm border ${
                  role === 'user' 
                    ? 'bg-orange-400/20 border-orange-300/50' 
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                  {children}
                </pre>
              ),
              ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              h1: ({ children }) => <h1 className="text-xl font-bold mb-3 leading-tight">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold mb-3 leading-tight">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-bold mb-2 leading-tight">{children}</h3>,
              blockquote: ({ children }) => (
                <blockquote className={`border-l-4 pl-4 py-2 my-3 rounded-r-lg ${
                  role === 'user' 
                    ? 'border-orange-300 bg-orange-400/10' 
                    : 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600'
                }`}>
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-3">
                  <table className={`min-w-full border border-collapse rounded-lg overflow-hidden ${
                    role === 'user' 
                      ? 'border-orange-300' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className={`border px-3 py-2 text-left font-semibold ${
                  role === 'user' 
                    ? 'border-orange-300 bg-orange-400/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}>
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className={`border px-3 py-2 ${
                  role === 'user' 
                    ? 'border-orange-300' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}>
                  {children}
                </td>
              ),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
        
        {/* Timestamp */}
        <div className={`mt-2 text-xs text-gray-500 dark:text-gray-400 ${role === 'user' ? 'text-right' : 'text-left'}`}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}; 