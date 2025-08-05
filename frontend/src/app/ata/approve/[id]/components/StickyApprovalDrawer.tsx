'use client';

import { useState } from 'react';
import type { ATAStatusDTO } from '@/api/models';

interface StickyApprovalDrawerProps {
  ataStatus: ATAStatusDTO | undefined;
  isProcessing: boolean;
  onApprove: (comment?: string) => void;
  onReject: (comment?: string) => void;
}

export default function StickyApprovalDrawer({
  ataStatus,
  isProcessing,
  onApprove,
  onReject
}: StickyApprovalDrawerProps) {
  const [showCommentField, setShowCommentField] = useState(false);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  if (ataStatus !== 1) return null; // Only show for submitted status

  const handleApproveClick = () => {
    setActionType('approve');
    setShowCommentField(true);
  };

  const handleRejectClick = () => {
    setActionType('reject');
    setShowCommentField(true);
  };

  const handleSubmitAction = () => {
    if (!actionType) return;
    
    if (actionType === 'approve') {
      onApprove(comment.trim() || undefined);
    } else {
      onReject(comment.trim() || undefined);
    }
    
    setShowCommentField(false);
    setActionType(null);
    setComment('');
  };

  const handleCancel = () => {
    setActionType(null);
    setShowCommentField(false);
    setComment('');
  };

  return (
    <div 
      className="fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/60"
      style={{ 
        position: 'fixed',
        zIndex: 9999,
        left: 0,
        right: 0,
        bottom: 0,
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)'
      }}
    >
      <div className="w-full max-w-4xl mx-auto px-6 py-6">
        {!showCommentField ? (
          // Initial buttons
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Your Decision</h3>
            <div className="flex gap-3">
              <button
                onClick={handleApproveClick}
                disabled={isProcessing}
                className="bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 ease-out flex items-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer hover:cursor-pointer"
                style={{ 
                  boxShadow: '0 8px 24px rgba(34, 197, 94, 0.25), 0 2px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Approve Request
              </button>
              <button
                onClick={handleRejectClick}
                disabled={isProcessing}
                className="bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 ease-out flex items-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer hover:cursor-pointer"
                style={{ 
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25), 0 2px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Reject Request
              </button>
            </div>
          </div>
        ) : (
          // Comment field view
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
              </h3>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 cursor-pointer hover:cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 tracking-wide">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  actionType === 'approve' 
                    ? 'Add any additional notes about the approval...'
                    : 'Please provide a reason for rejection...'
                }
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none text-base placeholder-gray-400 transition-all duration-200"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
                rows={4}
                autoFocus
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSubmitAction}
                disabled={isProcessing}
                className={`${
                  actionType === 'approve' 
                    ? 'bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                    : 'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                } disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:cursor-pointer text-white px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 ease-out flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0`}
                style={{
                  boxShadow: actionType === 'approve' 
                    ? '0 8px 24px rgba(34, 197, 94, 0.25), 0 2px 6px rgba(0, 0, 0, 0.1)'
                    : '0 8px 24px rgba(239, 68, 68, 0.25), 0 2px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    {`Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:cursor-pointer text-gray-700 px-8 py-4 rounded-2xl font-medium text-base transition-all duration-200 border border-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}