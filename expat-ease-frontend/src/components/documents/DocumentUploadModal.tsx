import type { ChangeEvent, FC } from 'react';

interface DocumentUploadModalProps {
  customName: string;
  uploading: boolean;
  uploadError: string | null;
  hasSelectedFile: boolean;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onCustomNameChange: (name: string) => void;
  onClose: () => void;
  onUpload: () => void;
}

const DocumentUploadModal: FC<DocumentUploadModalProps> = ({
  customName,
  uploading,
  uploadError,
  hasSelectedFile,
  onFileSelect,
  onCustomNameChange,
  onClose,
  onUpload,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Upload Document</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200" title="Close modal">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select File</label>
          <input type="file" onChange={onFileSelect} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" aria-label="Select file to upload" />
          <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Document Name (Optional)</label>
          <input type="text" value={customName} onChange={(event) => onCustomNameChange(event.target.value)} placeholder="Enter a custom name for this document" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
        </div>
        {uploadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        )}
        <div className="flex space-x-3 pt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">Cancel</button>
          <button onClick={onUpload} disabled={!hasSelectedFile || uploading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </div>
            ) : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DocumentUploadModal;
