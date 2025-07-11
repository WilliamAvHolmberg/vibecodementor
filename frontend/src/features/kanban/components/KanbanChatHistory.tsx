"use client";

import { Clock, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useKanbanChatSessions } from '../hooks/useKanbanChatSessions';

interface KanbanChatHistoryProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  currentSessionId?: string | null;
}

export function KanbanChatHistory({ 
  boardId, 
  isOpen, 
  onClose, 
  onSelectSession,
  currentSessionId 
}: KanbanChatHistoryProps) {
  const { allSessions, isLoadingAllSessions } = useKanbanChatSessions(boardId);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const sessions = allSessions?.sessions || [];

  return (
    <div className={`absolute inset-0 z-50 transition-all duration-300 ease-in-out ${
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Subtle Overlay Background */}
      <div 
        className={`absolute inset-0 bg-gray-900/20 dark:bg-gray-900/40 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* History Panel */}
      <div className={`absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-l border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Chat History
              </h3>
            </div>
            
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoadingAllSessions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading chat history...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No chat history yet
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Start a conversation to see it here
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const isCurrentSession = session.sessionId === currentSessionId;
              
              return (
                                 <button
                   key={session.sessionId}
                   onClick={() => {
                     if (session.sessionId) {
                       onSelectSession(session.sessionId);
                       onClose();
                     }
                   }}
                   className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm ${
                     isCurrentSession
                       ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 ring-1 ring-blue-200 dark:ring-blue-700'
                       : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600'
                   }`}
                 >
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2 min-w-0">
                       {isCurrentSession && (
                         <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                       )}
                       <div className="min-w-0">
                         <div className="flex items-center space-x-2">
                           <span className={`text-sm font-medium truncate ${
                             isCurrentSession 
                               ? 'text-blue-900 dark:text-blue-100' 
                               : 'text-gray-900 dark:text-gray-100'
                           }`}>
                             {session.createdAt ? formatDate(session.createdAt) : 'Unknown date'}
                           </span>
                           {isCurrentSession && (
                             <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full flex-shrink-0">
                               Current
                             </span>
                           )}
                         </div>
                         
                         <div className="flex items-center space-x-2 mt-1">
                           <span className="text-xs text-gray-500 dark:text-gray-400">
                             {session.messageCount || 0} message{(session.messageCount || 0) !== 1 ? 's' : ''}
                           </span>
                           <span className="text-xs text-gray-400">•</span>
                           <span className="text-xs text-gray-500 dark:text-gray-400">
                             {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : 'Unknown'}
                           </span>
                         </div>
                       </div>
                     </div>
                   </div>
                 </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click on a conversation to switch to it
          </p>
        </div>
      </div>
    </div>
  );
} 