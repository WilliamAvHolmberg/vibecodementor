'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetApiATA, usePostApiATADraft, getGetApiATAQueryKey } from '@/api/hooks/api';
import { useQueryClient } from '@tanstack/react-query';
import type { ATAStatusDTO } from '@/api/models';

// Status mapping for display
const getStatusDisplay = (status: ATAStatusDTO | undefined) => {
  switch (status) {
    case 0: return { text: 'Draft', color: 'bg-gray-100 text-gray-700', emoji: '📝' };
    case 1: return { text: 'Submitted', color: 'bg-blue-100 text-blue-700', emoji: '📤' };
    case 2: return { text: 'Under Review', color: 'bg-yellow-100 text-yellow-700', emoji: '👀' };
    case 3: return { text: 'Approved', color: 'bg-green-100 text-green-700', emoji: '✅' };
    case 4: return { text: 'Rejected', color: 'bg-red-100 text-red-700', emoji: '❌' };
    default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-700', emoji: '❓' };
  }
};

export default function ATAPage() {
  const [expandedATAId, setExpandedATAId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get user's ATA requests
  const { data: ataRequests, isLoading, error } = useGetApiATA();

  // Create draft ATA mutation
  const { mutate: createDraft } = usePostApiATADraft({
    mutation: {
      onSuccess: (response) => {
        // Invalidate the ATA list to show the new draft
        queryClient.invalidateQueries({ queryKey: getGetApiATAQueryKey() });
        
        // Navigate to edit form
        router.push(`/ata/${response.id}/edit`);
        setIsCreating(false);
      },
      onError: (error) => {
        console.error('Failed to create draft ÄTA:', error);
        setIsCreating(false);
      }
    }
  });

  const handleATAClick = (ataId: string) => {
    router.push(`/ata/${ataId}/edit`);
  };

  const handleCreateATA = () => {
    setIsCreating(true);
    createDraft(); // No body needed for draft creation
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) return <div className="p-8">Loading ÄTA requests...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {JSON.stringify(error)}</div>;

  const hasATAs = ataRequests && ataRequests.length > 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">ÄTA Requests</h1>
        <button
          onClick={handleCreateATA}
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer transform hover:scale-[0.99] active:scale-[0.97] shadow-sm hover:shadow-md flex items-center gap-2"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating...
            </>
          ) : (
            <>
              <span className="text-lg">+</span> New ÄTA
            </>
          )}
        </button>
      </div>

      {hasATAs ? (
        <div className="space-y-4">
          {ataRequests.map((ata) => {
            const statusDisplay = getStatusDisplay(ata.status);
            const isExpanded = expandedATAId === ata.id;
            
            return (
              <div key={ata.id} className="group">
                {/* ATA Card */}
                <div 
                  className="p-6 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 cursor-pointer transition-all duration-200 group-hover:shadow-sm"
                  onClick={() => handleATAClick(ata.id!)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">{ata.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                          <span>{statusDisplay.emoji}</span>
                          {statusDisplay.text}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Project:</span> {ata.projectName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Recipient:</span> {ata.recipientEmail}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Items:</span> {ata.lineItemCount} line item{ata.lineItemCount !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created {formatDate(ata.createdAt!)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(ata.totalCost || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(ata.totalCost || 0) >= 0 ? '+ Addition' : '- Deduction'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details - Placeholder for now */}
                {isExpanded && (
                  <div className="mt-3 p-6 bg-gray-50 rounded-2xl">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">🚧</div>
                      <p className="text-sm">Detailed view coming soon</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Will show line items, comments, and actions
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 text-8xl mb-6">📋</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No ÄTA requests yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Create your first ÄTA request to manage changes, additions, or deductions in your construction projects.
          </p>
          <button
            onClick={handleCreateATA}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 cursor-pointer transform hover:scale-[0.99] active:scale-[0.97] shadow-sm hover:shadow-md flex items-center gap-3 mx-auto"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating ÄTA Request...
              </>
            ) : (
              'Create First ÄTA Request'
            )}
          </button>
        </div>
      )}
    </div>
  );
}