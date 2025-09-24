import React, { useState, useRef } from 'react';

interface Task {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    country: string;
    order_index: number;
    is_required: boolean;
    estimated_days: number | null;
    created_at: string;
    updated_at: string;
    unlocked: boolean;
    documents: Document[];
}

interface Document {
    id: number;
    filename: string;
    original_filename: string;
    file_path: string;
    file_size: number;
    content_type: string;
    task_id: number;
    user_id: number;
    created_at: string;
    download_url: string;
}

interface ChecklistStepProps {
    task: Task;
    stepNumber: number;
    onStatusUpdate: (taskId: number, status: string) => Promise<void>;
    onDocumentUpload: (taskId: number, file: File) => Promise<void>;
}

const ChecklistStep: React.FC<ChecklistStepProps> = ({
    task,
    stepNumber,
    onStatusUpdate,
    onDocumentUpload,
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getStatusIcon = () => {
        if (!task.unlocked) {
            return <span className="text-gray-400">🔒</span>;
        }
        switch (task.status) {
            case 'completed':
                return <span className="text-green-500">✅</span>;
            case 'in_progress':
                return <span className="text-blue-500">🔄</span>;
            default:
                return <span className="text-gray-400">⭕</span>;
        }
    };

    const getPriorityColor = () => {
        switch (task.priority) {
            case 'urgent':
                return 'border-red-200 bg-red-50';
            case 'high':
                return 'border-orange-200 bg-orange-50';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50';
            case 'low':
                return 'border-green-200 bg-green-50';
            default:
                return 'border-gray-200 bg-white';
        }
    };

    const getPriorityText = () => {
        switch (task.priority) {
            case 'urgent':
                return 'Urgent';
            case 'high':
                return 'High';
            case 'medium':
                return 'Medium';
            case 'low':
                return 'Low';
            default:
                return 'Medium';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Invalid file type. Only PDF and image files are allowed.');
            return;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setUploadError('File too large. Maximum size is 5MB.');
            return;
        }

        try {
            setIsUploading(true);
            setUploadError(null);
            await onDocumentUpload(task.id, file);
        } catch (error) {
            setUploadError('Failed to upload file. Please try again.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await onStatusUpdate(task.id, newStatus);
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };


    return (
        <div className={`bg-white rounded-lg shadow-sm border-2 ${getPriorityColor()} ${!task.unlocked ? 'opacity-60' : ''
            }`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full text-primary-600 font-semibold text-sm">
                            {stepNumber}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                {getStatusIcon()}
                                <span>{task.title}</span>
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {getPriorityText()} Priority
                                </span>
                                {task.estimated_days && (
                                    <span className="text-sm text-gray-500">
                                        ⏱️ {task.estimated_days} days
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {!task.unlocked && (
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <span>🔒</span>
                            <span>Locked</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">{task.description}</p>

                {/* Documents Section */}
                {task.documents.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h4>
                        <div className="space-y-2">
                            {task.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">
                                            {doc.content_type.startsWith('image/') ? '🖼️' : '📄'}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{doc.original_filename}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={doc.download_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                    >
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Section */}
                {task.unlocked && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Document:
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                                className="hidden"
                                aria-label="Upload document file"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? 'Uploading...' : 'Choose File'}
                            </button>
                            <span className="text-xs text-gray-500">
                                PDF, JPG, PNG, GIF, WEBP (max 5MB)
                            </span>
                        </div>
                        {uploadError && (
                            <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>

                    {task.unlocked && task.status !== 'completed' && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleStatusChange('in_progress')}
                                disabled={task.status === 'in_progress'}
                                className="px-3 py-1 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Start
                            </button>
                            <button
                                onClick={() => handleStatusChange('completed')}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Mark Complete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChecklistStep;
