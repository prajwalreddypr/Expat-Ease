import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../utils/api';
import { useToast } from '../Toast';
import { sanitizeText } from '../../utils/sanitize';

interface ReportButtonProps {
    contentId: number;
    contentType: 'question' | 'answer';
    reportedUserId: number;
    className?: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({
    contentId,
    contentType,
    reportedUserId,
    className = ''
}) => {
    const { token, user } = useAuth();
    const { addToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reportReasons = [
        { value: 'spam', label: 'Spam', description: 'Repetitive, unwanted content' },
        { value: 'harassment', label: 'Harassment', description: 'Abusive or threatening behavior' },
        { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Offensive or inappropriate material' },
        { value: 'off_topic', label: 'Off Topic', description: 'Content not related to the discussion' },
        { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
        { value: 'copyright_violation', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted material' },
        { value: 'other', label: 'Other', description: 'Other violation not listed above' }
    ];

    const handleSubmitReport = async () => {
        if (!selectedReason) {
            addToast({
                type: 'warning',
                message: 'Please select a reason for reporting'
            });
            return;
        }

        if (!user || user.id === reportedUserId) {
            addToast({
                type: 'error',
                message: 'You cannot report your own content'
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const reportData = {
                content_type: contentType,
                content_id: contentId,
                reason: selectedReason,
                description: sanitizeText(description)
            };

            const response = await fetch(getApiUrl('/api/v1/forum/reports'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to submit report' }));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            addToast({
                type: 'success',
                message: 'Report submitted successfully. Thank you for helping keep our community safe.'
            });

            setShowModal(false);
            setSelectedReason('');
            setDescription('');

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit report';
            addToast({
                type: 'error',
                message: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedReason('');
        setDescription('');
    };

    if (!user || user.id === reportedUserId) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`flex items-center space-x-1 text-slate-500 hover:text-red-600 transition-colors text-sm ${className}`}
                aria-label={`Report ${contentType}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Report</span>
            </button>

            {/* Report Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-800">Report Content</h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                    aria-label="Close report modal"
                                    title="Close"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-600 mb-3">
                                        Please select a reason for reporting this {contentType}:
                                    </p>

                                    <div className="space-y-2">
                                        {reportReasons.map((reason) => (
                                            <label
                                                key={reason.value}
                                                className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                                            >
                                                <input
                                                    type="radio"
                                                    name="reason"
                                                    value={reason.value}
                                                    checked={selectedReason === reason.value}
                                                    onChange={(e) => setSelectedReason(e.target.value)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-800">{reason.label}</div>
                                                    <div className="text-sm text-slate-600">{reason.description}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                                        Additional Details (Optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Provide any additional context about why you're reporting this content..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                        maxLength={500}
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{description.length}/500 characters</p>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitReport}
                                        disabled={isSubmitting || !selectedReason}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Report'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReportButton;
