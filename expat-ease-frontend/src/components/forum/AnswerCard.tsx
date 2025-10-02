import React from 'react';

interface Answer {
    id: number;
    content: string;
    created_at: string;
    updated_at?: string;
    is_accepted: boolean;
    upvotes: number;
    downvotes: number;
    user: {
        id: number;
        full_name: string;
        profile_photo?: string;
        country?: string;
    };
}

interface AnswerCardProps {
    answer: Answer;
    onVote?: (answerId: number, isUpvote: boolean) => void;
    onAccept?: (answerId: number) => void;
    canAccept?: boolean;
    currentUserId?: number;
}

const AnswerCard: React.FC<AnswerCardProps> = ({
    answer,
    onVote,
    onAccept,
    canAccept = false
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className={`card transition-shadow duration-200 ${answer.is_accepted ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                            {answer.user.profile_photo ? (
                                <img
                                    src={answer.user.profile_photo}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-sm font-semibold">
                                    {answer.user.full_name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">{answer.user.full_name}</h3>
                            <p className="text-sm text-slate-500">{formatDate(answer.created_at)}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {answer.is_accepted && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Accepted Answer</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Answer Content */}
                <div className="mb-4">
                    <p className="text-slate-700 whitespace-pre-wrap">{answer.content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    {/* Voting */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onVote?.(answer.id, true)}
                            className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            <span className="text-sm text-slate-600">{answer.upvotes}</span>
                        </button>
                        <button
                            onClick={() => onVote?.(answer.id, false)}
                            className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                            <span className="text-sm text-slate-600">{answer.downvotes}</span>
                        </button>
                    </div>

                    {/* Accept Button (only for question author) */}
                    {canAccept && !answer.is_accepted && (
                        <button
                            onClick={() => onAccept?.(answer.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            Accept Answer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnswerCard;
