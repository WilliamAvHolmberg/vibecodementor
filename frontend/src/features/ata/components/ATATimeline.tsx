import type { ATATimelineEntryDTO, ATAStatusDTO } from '@/api/models';

interface ATATimelineProps {
  timeline: ATATimelineEntryDTO[];
}

function getStatusDisplay(status: ATAStatusDTO) {
  switch (status) {
    case 0: // Draft
      return {
        text: 'Draft',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        emoji: '📝',
        icon: '📝'
      };
    case 1: // Submitted
      return {
        text: 'Submitted',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        emoji: '📤',
        icon: '📤'
      };
    case 2: // UnderReview
      return {
        text: 'Under Review',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        emoji: '👁️',
        icon: '👁️'
      };
    case 3: // Approved
      return {
        text: 'Approved',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        emoji: '✅',
        icon: '✅'
      };
    case 4: // Rejected
      return {
        text: 'Rejected',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        emoji: '❌',
        icon: '❌'
      };
    default:
      return {
        text: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        emoji: '❓',
        icon: '❓'
      };
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ATATimeline({ timeline }: ATATimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-500">No timeline entries yet.</p>
      </div>
    );
  }

  // Sort timeline by timestamp (newest first)
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Timeline</h3>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {sortedTimeline.map((entry, index) => {
            const statusDisplay = getStatusDisplay(entry.status!);
            const isLast = index === sortedTimeline.length - 1;
            
            return (
              <div key={entry.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-200" />
                )}
                
                <div className="flex items-start gap-4">
                  {/* Status icon */}
                  <div className={`w-12 h-12 rounded-2xl ${statusDisplay.bgColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <span className="text-lg">{statusDisplay.emoji}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                        {statusDisplay.text}
                        {entry.submissionRound !== undefined && entry.submissionRound > 1 && (
                          <span className="ml-1 text-xs opacity-75">
                            (Round {entry.submissionRound})
                          </span>
                        )}
                      </span>
                      {entry.timestamp ? (
                        <span className="text-sm text-gray-500">
                          {formatDate(entry.timestamp)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Unknown time
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      by <span className="font-medium text-gray-900">{entry.changedByName}</span>
                    </div>
                    
                    {entry.comment && (
                      <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-gray-300">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {entry.comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}