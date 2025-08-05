'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetApiATAId, usePatchApiATAId, usePatchApiATAIdLineitems, usePostApiATAIdSubmit, getGetApiATAIdQueryKey } from '@/api/hooks/api';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import LineItemEditor, { type LineItemData } from './components/LineItemEditor';
import { ATATimeline } from '@/features/ata';

// Auto-save hook with debouncing
function useAutoSave(ataId: string, field: string, value: string, delay = 500) {
  const { mutate: updateATA } = usePatchApiATAId();
  
  useEffect(() => {
    if (!value && value !== '') return; // Don't save empty initial values
    
    const timeoutId = setTimeout(() => {
      const updateData = { [field]: value };
      updateATA({
        id: ataId,
        data: updateData
      });
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, ataId, field, delay, updateATA]);
}



export default function EditATAPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const ataId = params.id as string;

  // Get ATA details
  const { data: ataDetails, isLoading, error } = useGetApiATAId(ataId);

  // Form state
  const [title, setTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  
  // Line items state - the magic happens here!
  const [lineItems, setLineItems] = useState<LineItemData[]>([]);

  // Auto-save hooks
  useAutoSave(ataId, 'title', title);
  useAutoSave(ataId, 'projectName', projectName);
  useAutoSave(ataId, 'description', description);
  useAutoSave(ataId, 'recipientEmail', recipientEmail);
  useAutoSave(ataId, 'requestedBy', requestedBy);

  // Line items immediate save hook
  const { mutate: updateLineItems } = usePatchApiATAIdLineitems({
    mutation: {
      onSuccess: () => {
        // Invalidate the ATA details to refresh the total cost
        queryClient.invalidateQueries({ queryKey: getGetApiATAIdQueryKey(ataId) });
      },
      onError: (error) => {
        // 🚨 Show notification on failure (minimal approach)
        console.error('Failed to save line items. Please try again.', error);
      }
    }
  });

  // Submit to client hook
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: submitATA } = usePostApiATAIdSubmit({
    mutation: {
      onSuccess: () => {
        // Invalidate the ATA details to refresh the status
        queryClient.invalidateQueries({ queryKey: getGetApiATAIdQueryKey(ataId) });
        setIsSubmitting(false);
      },
      onError: (error) => {
        console.error('Failed to submit ATA request. Please try again.', error);
        setIsSubmitting(false);
      }
    }
  });

  // Update form state when data loads
  useEffect(() => {
    if (ataDetails) {
      setTitle(ataDetails.title || '');
      setProjectName(ataDetails.projectName || '');
      setDescription(ataDetails.description || '');
      setRecipientEmail(ataDetails.recipientEmail || '');
      setRequestedBy(ataDetails.requestedBy || '');
      
      // Convert existing line items to our format
      const existingLineItems: LineItemData[] = (ataDetails.lineItems || []).map(item => ({
        type: item.type!,
        description: item.description || '',
        costEstimate: item.costEstimate || 0,
        comment: item.comment || ''
      }));
      setLineItems(existingLineItems);
    }
  }, [ataDetails]);

  // Line items are now saved directly in action functions - no reactive useEffect needed

  // Line item management functions
  const addLineItem = () => {
    const newItem: LineItemData = {
      type: 0, // Default to 'Ändring'
      description: '',
      costEstimate: 0,
      comment: ''
    };
    const updatedItems = [...lineItems, newItem];
    setLineItems(updatedItems);
    
    // 🔥 IMMEDIATE SAVE - no debounce
    updateLineItems({
      id: ataId,
      data: {
        lineItems: updatedItems.map(item => ({
          type: item.type,
          description: item.description,
          costEstimate: item.costEstimate,
          comment: item.comment
        }))
      }
    });
  };

  const updateLineItem = (index: number, data: LineItemData) => {
    console.log('Updating line item', index, data);
    const updatedItems = lineItems.map((item, i) => i === index ? data : item);
    setLineItems(updatedItems);
    
    // 🔥 IMMEDIATE SAVE - no debounce
    updateLineItems({
      id: ataId,
      data: {
        lineItems: updatedItems.map(item => ({
          type: item.type,
          description: item.description,
          costEstimate: item.costEstimate,
          comment: item.comment
        }))
      }
    });
  };

  const removeLineItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    
    // 🔥 IMMEDIATE SAVE - no debounce
    updateLineItems({
      id: ataId,
      data: {
        lineItems: updatedItems.map(item => ({
          type: item.type,
          description: item.description,
          costEstimate: item.costEstimate,
          comment: item.comment
        }))
      }
    });
  };

  // Calculate total cost from current line items (real-time)
  const totalCost = lineItems.reduce((sum, item) => sum + item.costEstimate, 0);

  // Submit handler
  const handleSubmitToClient = () => {
    if (!recipientEmail || !title || isSubmitting || (ataDetails?.status !== 0 && ataDetails?.status !== 4)) return;
    
    setIsSubmitting(true);
    submitATA({ id: ataId });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Status display helper
  const getStatusDisplay = (status?: number) => {
    switch (status) {
      case 0: return { text: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100', emoji: '📝' };
      case 1: return { text: 'Submitted', color: 'text-blue-600', bgColor: 'bg-blue-100', emoji: '📤' };
      case 2: return { text: 'Under Review', color: 'text-yellow-600', bgColor: 'bg-yellow-100', emoji: '👁️' };
      case 3: return { text: 'Approved', color: 'text-green-600', bgColor: 'bg-green-100', emoji: '✅' };
      case 4: return { text: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100', emoji: '❌' };
      default: return { text: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100', emoji: '📝' };
    }
  };

  const statusDisplay = getStatusDisplay(ataDetails?.status);

  // Check if form should be readonly (only editable if Draft or Rejected)
  const isReadOnly = ataDetails?.status !== 0 && ataDetails?.status !== 4;

  // Status guidance message
  const getStatusMessage = (status?: number) => {
    switch (status) {
      case 0: return 'Ready to send to client when complete';
      case 1: return 'Waiting for client response - check timeline for feedback';
      case 2: return 'Client is reviewing your request';
      case 3: return 'Request has been approved!';
      case 4: return 'You can edit and resubmit this ÄTA';
      default: return 'Ready to send to client when complete';
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4.5rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading ÄTA request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to load ÄTA</h2>
        <p className="text-sm text-gray-600 mb-4">The ÄTA request could not be found or you don't have access to it.</p>
        <Button onClick={() => router.push('/ata')} size="sm">
          Back to ÄTA List
        </Button>
      </div>
    );
  }

  if (!ataDetails) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
                             <button
                 onClick={() => router.push('/ata')}
                 className="p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-all duration-150 hover:scale-105 cursor-pointer"
               >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="font-semibold text-gray-900">{title || 'Untitled ÄTA Request'}</h1>
                <p className="text-xs text-gray-500">Auto-saving changes</p>
              </div>
            </div>
            
                         <div className="flex items-center gap-3">
               <span className="text-sm font-medium text-gray-900">{formatCurrency(totalCost)}</span>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => router.push(`/ata/approve/${ataId}`)}
                 className="hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
               >
                 👁️ Preview
               </Button>
                             <Button 
                 size="sm"
                 onClick={handleSubmitToClient}
                 className="bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-150 hover:shadow-md disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
                 disabled={!recipientEmail || !title || isSubmitting || (ataDetails?.status !== 0 && ataDetails?.status !== 4)}
               >
                 {isSubmitting ? (
                   <>
                     <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                     Sending...
                   </>
                 ) : ataDetails?.status === 0 ? (
                   <>📤 Send to Client</>
                 ) : ataDetails?.status === 4 ? (
                   <>📤 Resubmit to Client</>
                 ) : (
                   <>✓ Submitted</>
                 )}
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Form */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Form - Takes 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Readonly Banner */}
            {isReadOnly && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">View Only Mode</h3>
                    <p className="text-xs text-blue-700">{getStatusMessage(ataDetails?.status)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Project Information - Horizontal Layout */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Project Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Kitchen electrical changes"
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 text-sm border rounded-md ${
                      isReadOnly 
                        ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Villa Renovation"
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 text-sm border rounded-md ${
                      isReadOnly 
                        ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Recipient Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="client@example.com"
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 text-sm border rounded-md ${
                      isReadOnly 
                        ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Requested By
                  </label>
                  <input
                    type="text"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    placeholder="Your name or company"
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 text-sm border rounded-md ${
                      isReadOnly 
                        ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional: Additional context or overview of the changes..."
                  rows={2}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 text-sm border rounded-md resize-none ${
                    isReadOnly 
                      ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
              </div>
            </div>

                         {/* Line Items - Professional Grid Layout */}
             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
               {/* Header */}
               <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                 <h2 className="text-sm font-semibold text-gray-900">Line Items</h2>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={addLineItem}
                   disabled={isReadOnly}
                   className={`text-xs transition-transform duration-150 ${
                     isReadOnly 
                       ? 'cursor-not-allowed opacity-50' 
                       : 'hover:scale-105 active:scale-95 cursor-pointer'
                   }`}
                 >
                   <span className="text-sm mr-1">+</span> Add Item
                 </Button>
               </div>

               {lineItems.length > 0 ? (
                 <div className="overflow-hidden">
                   <table className="w-full">
                     <thead className="bg-gray-100 sticky top-0 z-10">
                       <tr>
                         <th className="text-left py-4 px-3 text-xs font-semibold text-gray-800 uppercase tracking-wide border-b border-gray-300" style={{width: '150px'}}>
                           Type
                         </th>
                         <th className="text-left py-4 px-3 text-xs font-semibold text-gray-800 uppercase tracking-wide border-b border-gray-300">
                           Description
                         </th>
                         <th className="text-right py-4 px-3 text-xs font-semibold text-gray-800 uppercase tracking-wide border-b border-gray-300" style={{width: '120px'}}>
                           Cost
                         </th>
                         {/* TEMP HIDDEN: Comment column until we know user requirements
                         <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-300" style={{width: '140px'}}>
                           Comment
                         </th>
                         */}
                         <th className="text-center py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-300" style={{width: '50px'}}>
                           Action
                         </th>
                       </tr>
                     </thead>
                     <tbody>
                       {lineItems.map((item, index) => (
                         <LineItemEditor
                           key={index}
                           initialData={item}
                           onUpdate={(data) => updateLineItem(index, data)}
                           onRemove={() => removeLineItem(index)}
                           isEven={index % 2 === 0}
                           readOnly={isReadOnly}
                         />
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <div className="text-gray-400 text-3xl mb-3">📝</div>
                   <h3 className="text-sm font-medium text-gray-900 mb-2">No line items yet</h3>
                   <p className="text-xs text-gray-500 mb-4">Add your first change, addition, or deduction</p>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={addLineItem}
                     disabled={isReadOnly}
                     className={`text-xs transition-transform duration-150 ${
                       isReadOnly 
                         ? 'cursor-not-allowed opacity-50' 
                         : 'hover:scale-105 active:scale-95 hover:shadow-md cursor-pointer'
                     }`}
                   >
                     <span className="text-sm mr-1">+</span> Add First Item
                   </Button>
                 </div>
               )}
             </div>
          </div>

          {/* Sidebar - Summary & Actions */}
          <div className="space-y-6">
            
            {/* Quick Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                    {statusDisplay.emoji} {statusDisplay.text}
                  </span>
                </div>
                                 <div className="flex justify-between">
                   <span className="text-gray-600">Line Items</span>
                   <span className="font-medium">{lineItems.length}</span>
                 </div>
                                 <div className="flex justify-between">
                   <span className="text-gray-600">Total Cost</span>
                   <span className="font-semibold">{formatCurrency(totalCost)}</span>
                 </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-500">
                    {new Date(ataDetails.createdAt!).toLocaleDateString('sv-SE')}
                  </span>
                </div>
              </div>
              
              {/* Status Message */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 leading-relaxed">
                  📋 {getStatusMessage(ataDetails?.status)}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <ATATimeline timeline={ataDetails.timeline || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 