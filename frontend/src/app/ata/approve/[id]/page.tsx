'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ATATimeline } from '@/features/ata';
import StickyApprovalDrawer from './components/StickyApprovalDrawer';
import { useGetApiATAApproveId, usePostApiATAApproveId, usePostApiATARejectId, getGetApiATAApproveIdQueryKey } from '@/api/hooks/api';

function getStatusDisplay(status: number) {
    switch (status) {
        case 0: return { text: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100' };
        case 1: return { text: 'Submitted', color: 'text-blue-600', bgColor: 'bg-blue-100' };
        case 2: return { text: 'Under Review', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
        case 3: return { text: 'Approved', color: 'text-green-600', bgColor: 'bg-green-100' };
        case 4: return { text: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' };
        default: return { text: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
}

export default function ATAApprovalPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const ataId = params.id as string;

    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch ATA details
    const { data: ataData, isLoading, error } = useGetApiATAApproveId(ataId);

    // Mutations
    const approveMutation = usePostApiATAApproveId();
    const rejectMutation = usePostApiATARejectId();

    const handleApprove = async (comment?: string) => {
        setIsProcessing(true);
        try {
            await approveMutation.mutateAsync({
                id: ataId,
                data: comment ? { comment } : { comment: '' }
            });

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: getGetApiATAApproveIdQueryKey(ataId) });

            // Show success state
            setIsProcessing(false);
        } catch (error) {
            console.error('Failed to approve ATA request:', error);
            setIsProcessing(false);
        }
    };

    const handleReject = async (comment?: string) => {
        setIsProcessing(true);
        try {
            await rejectMutation.mutateAsync({
                id: ataId,
                data: { comment: comment || '' }
            });

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: getGetApiATAApproveIdQueryKey(ataId) });

            // Show success state
            setIsProcessing(false);
        } catch (error) {
            console.error('Failed to reject ATA request:', error);
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xl font-semibold text-gray-700">Loading ÄTA request...</p>
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !ataData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-lg border border-gray-100">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">ÄTA Not Found</h1>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">The requested ÄTA could not be found or you don't have permission to view it.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const statusDisplay = getStatusDisplay(ataData.status ?? 0);
    const isReadOnly = (ataData.status ?? 0) !== 1; // Not submitted

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50" style={{ paddingBottom: (ataData.status ?? 0) === 1 ? '200px' : '40px' }}>
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
                    {/* Header */}
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                        {/* Status Banner */}
                        {(ataData.status ?? 0) === 3 && (
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4">
                                <div className="flex items-center justify-center text-white">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-semibold">This ÄTA request has been approved. Thank you for your review.</span>
                                </div>
                            </div>
                        )}

                        <div className="px-8 py-8">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h1 className="text-4xl font-bold text-gray-900">ÄTA Request</h1>
                                        {(ataData.status ?? 0) !== 3 && (
                                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                                                {statusDisplay.text}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xl text-gray-600 font-medium">{ataData.title}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100">
                                    <div className="text-sm font-medium text-blue-600 mb-1">Total Cost</div>
                                    <div className="text-4xl font-bold text-blue-700 mb-1">
                                        {(ataData.totalCost ?? 0).toLocaleString('sv-SE')} kr
                                    </div>
                                    <div className="text-sm text-blue-500 font-medium">Additional cost</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Project</div>
                                        <div className="text-lg font-bold text-gray-900">{ataData.projectName}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requested by</div>
                                        <div className="text-lg font-bold text-gray-900">{ataData.requestedBy}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</div>
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                                                {statusDisplay.text}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Submitted</div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {ataData.createdAt ? new Date(ataData.createdAt).toLocaleDateString('sv-SE', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            }) : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {ataData.description && (
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
                                    <div className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Description</div>
                                    <div className="text-gray-800 leading-relaxed text-lg">
                                        {ataData.description}
                                    </div>
                                </div>
                            )}
                        </div>

                        {isReadOnly && (ataData.status ?? 0) !== 1 && (ataData.status ?? 0) !== 3 && (
                            <div className="px-8 py-4 bg-amber-50 border-t border-amber-200">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-amber-800 font-medium">
                                        Read-only view: You can review the details but no actions are available for this status.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Work Items */}
                    {ataData.lineItems && ataData.lineItems.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-100">
                                <h2 className="text-3xl font-bold text-gray-900">Work Items</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-widest">Type</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-widest">Description</th>
                                            <th className="px-8 py-5 text-right text-xs font-bold text-gray-700 uppercase tracking-widest">Cost</th>
                                            <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-widest">Comment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ataData.lineItems.map((item, index) => (
                                            <tr key={index} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                                }`}>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${item.type === 0
                                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                                            : item.type === 1
                                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                                                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
                                                        }`}>
                                                        {item.type === 0 ? 'Ändring' : item.type === 1 ? 'Tillägg' : 'Avgående'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-base font-semibold text-gray-900 leading-relaxed">
                                                        {item.description}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="text-xl font-bold text-gray-900">
                                                        {(item.costEstimate ?? 0).toLocaleString('sv-SE')} kr
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-sm text-gray-600 italic">
                                                        {item.comment || '-'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="mb-6">
                        <ATATimeline timeline={ataData.timeline || []} />
                    </div>
                </div>
            </div>

            {/* Sticky Approval Drawer */}
            <StickyApprovalDrawer
                ataStatus={ataData.status ?? 0}
                isProcessing={isProcessing}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </>
    );
}