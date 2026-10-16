import React, { useState } from 'react';
import type { NewForumQuestion } from '../../types/forum';

interface NewQuestionFormProps {
    onSubmit: (data: NewForumQuestion) => void;
    onCancel: () => void;
}

const NewQuestionForm: React.FC<NewQuestionFormProps> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');

    const categories = [
        { value: 'general', label: 'General', icon: '💬' },
        { value: 'housing', label: 'Housing', icon: '🏠' },
        { value: 'banking', label: 'Banking', icon: '🏦' },
        { value: 'legal', label: 'Legal', icon: '⚖️' },
        { value: 'work', label: 'Work', icon: '💼' },
        { value: 'education', label: 'Education', icon: '🎓' },
        { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
        { value: 'transportation', label: 'Transportation', icon: '🚌' },
        { value: 'social', label: 'Social', icon: '👥' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSubmit({ title: title.trim(), content: content.trim(), category });
        }
    };

    return (
        <div className="card">
            <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Ask a Question</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                            Question Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's your question?"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                            maxLength={200}
                        />
                        <p className="text-xs text-slate-500 mt-1">{title.length}/200 characters</p>
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                            Category
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Content */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
                            Question Details <span className="text-slate-400 text-sm">(Optional)</span>
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Provide more details about your question... (optional)"
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
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
                            Post Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewQuestionForm;
