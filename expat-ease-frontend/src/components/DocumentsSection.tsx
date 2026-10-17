import { useState } from 'react';
import type { ChangeEvent, FC } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useDocuments } from '../hooks/useDocuments';
import DocumentList from './documents/DocumentList';
import DocumentUploadModal from './documents/DocumentUploadModal';

const DocumentsSection: FC = () => {
  const { user, token } = useAuth();
  const {
    documents,
    loading,
    error,
    uploading,
    uploadError,
    setUploadError,
    fetchDocuments,
    addDocument,
    removeDocument,
  } = useDocuments(token, Boolean(user));
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCustomName(file.name);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (await addDocument(selectedFile, customName)) {
      setSelectedFile(null);
      setCustomName('');
      setShowUploadModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
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
          <button onClick={fetchDocuments} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4 leading-tight py-2">Manage Documents</h1>
          <p className="text-lg text-slate-600 mb-6">
            Upload, view, and manage your important documents. Keep track of all your files in one place.
          </p>
        </div>

        {documents.length > 0 && (
          <div className="mb-8">
            <button onClick={() => setShowUploadModal(true)} className="btn btn-primary inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload Document
            </button>
          </div>
        )}

        <div className="space-y-4">
          <DocumentList
            documents={documents}
            onUpload={() => setShowUploadModal(true)}
            onDelete={removeDocument}
          />
        </div>

        {showUploadModal && (
          <DocumentUploadModal
            customName={customName}
            uploading={uploading}
            uploadError={uploadError}
            hasSelectedFile={Boolean(selectedFile)}
            onFileSelect={handleFileSelect}
            onCustomNameChange={setCustomName}
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUpload}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentsSection;
