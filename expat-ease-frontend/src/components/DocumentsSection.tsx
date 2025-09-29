import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../utils/api';

interface Document {
    id: number;
    filename: string;
    original_filename: string;
    file_path: string;
    file_size: number;
    content_type: string;
    settlement_step_id: number | null;
    user_id: number;
    created_at: string;
    download_url: string;
}

const DocumentsSection: React.FC = () => {
    const { user, token } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [customName, setCustomName] = useState('');
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        if (token && user) {
            fetchDocuments();
        }
    }, [token, user]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(getApiUrl('/api/v1/documents/'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch documents: ${response.status}`);
            }

            const data = await response.json();
            setDocuments(data);
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setCustomName(file.name);
            setUploadError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !token) {
            setUploadError('Please select a file');
            return;
        }

        try {
            setUploading(true);
            setUploadError(null);

            const formData = new FormData();
            formData.append('file', selectedFile);
            if (customName.trim()) {
                formData.append('custom_name', customName.trim());
            }

            const response = await fetch(getApiUrl('/api/v1/documents/upload'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Upload failed');
            }

            const uploadedDocument = await response.json();
            setDocuments(prev => [uploadedDocument, ...prev]);

            // Reset form
            setSelectedFile(null);
            setCustomName('');
            setShowUploadModal(false);

        } catch (err) {
            console.error('Error uploading document:', err);
            setUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (documentId: number) => {
        if (!token) return;

        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            const response = await fetch(getApiUrl(`/api/v1/documents/${documentId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        } catch (err) {
            console.error('Error deleting document:', err);
            setError(err instanceof Error ? err.message : 'Delete failed');
        }
    };

    const handleViewDocument = (document: Document) => {
        // Open document in new tab - download_url is now a full Cloudinary URL
        window.open(document.download_url, '_blank');
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getFileIcon = (contentType: string): string => {
        if (contentType.includes('pdf')) return '📄';
        if (contentType.includes('image')) return '🖼️';
        if (contentType.includes('word')) return '📝';
        return '📎';
    };

    if (loading) {
        return (
            <div className="min-h-screen py-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your documents...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDocuments}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gradient mb-4 leading-tight py-2">
                        Manage Documents
                    </h1>
                    <p className="text-lg text-slate-600 mb-6">
                        Upload, view, and manage your important documents. Keep track of all your files in one place.
                    </p>
                </div>

                {/* Upload Button - Only show when there are existing documents */}
                {documents.length > 0 && (
                    <div className="mb-8">
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="btn btn-primary inline-flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Upload Document
                        </button>
                    </div>
                )}

                {/* Documents List */}
                <div className="space-y-4">
                    {documents.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📁</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h3>
                            <p className="text-gray-600 mb-6">Upload your first document to get started</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="btn btn-primary"
                            >
                                Upload Document
                            </button>
                        </div>
                    ) : (
                        documents.map((document) => (
                            <div
                                key={document.id}
                                className="card bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-3xl">{getFileIcon(document.content_type)}</div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                                {document.original_filename}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                                                <span>{formatFileSize(document.file_size)}</span>
                                                <span>•</span>
                                                <span>{formatDate(document.created_at)}</span>
                                                {document.settlement_step_id && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                                                            Settlement Step {document.settlement_step_id}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleViewDocument(document)}
                                            className="px-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDelete(document.id)}
                                            className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Upload Document</h2>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    title="Close modal"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Select File
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleFileSelect}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        aria-label="Select file to upload"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Document Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder="Enter a custom name for this document"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                {uploadError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">{uploadError}</p>
                                    </div>
                                )}

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!selectedFile || uploading}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        {uploading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Uploading...
                                            </div>
                                        ) : (
                                            'Upload'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentsSection;
