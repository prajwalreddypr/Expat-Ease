import React, { useState } from 'react';

interface NewAnswerFormProps {
    onSubmit: (content: string) => void;
    onCancel: () => void;
}

const NewAnswerForm: React.FC<NewAnswerFormProps> = ({ onSubmit, onCancel }) => {
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content.trim());
            setContent('');
        }
    };

    return (
        <div className="card">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Answer</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Content */}
                    <div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your knowledge and help others..."
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                            required
                            maxLength={2000}
                        />
                        <p className="text-xs text-slate-500 mt-1">{content.length}/2000 characters</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                        >
                            Post Answer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewAnswerForm;
