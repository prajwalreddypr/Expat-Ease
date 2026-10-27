import type { FC } from 'react';
import type { UserDocument } from '../../types/documents';
import { formatDocumentDate, formatFileSize, getFileIcon } from '../../utils/documentFormatting';

interface DocumentListProps {
  documents: UserDocument[];
  onUpload: () => void;
  onDelete: (documentId: number) => void;
}

const DocumentList: FC<DocumentListProps> = ({ documents, onUpload, onDelete }) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h3>
        <p className="text-gray-600 mb-6">Upload your first document to get started</p>
        <button onClick={onUpload} className="btn btn-primary">Upload Document</button>
      </div>
    );
  }

  return documents.map((document) => (
    <div key={document.id} className="card bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg rounded-xl p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-3xl">{getFileIcon(document.content_type)}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{document.original_filename}</h3>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span>{formatFileSize(document.file_size)}</span>
              <span>•</span>
              <span>{formatDocumentDate(document.created_at)}</span>
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
            onClick={() => window.open(document.download_url, '_blank')}
            className="px-3 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
          <button
            onClick={() => onDelete(document.id)}
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
  ));
};

export default DocumentList;
