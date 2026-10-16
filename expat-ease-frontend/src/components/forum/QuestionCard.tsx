import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ForumQuestion } from '../../types/forum';
import { formatDate, getCategoryColor } from '../../utils/forumUtils';

interface QuestionCardProps {
    question: ForumQuestion;
    onVote?: (questionId: number, isUpvote: boolean) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onVote }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/forum/question/${question.id}`);
    };

    return (
        <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={handleClick}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                            {question.user.profile_photo ? (
                                <img
                                    src={question.user.profile_photo}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-sm font-semibold">
                                    {question.user.full_name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">{question.user.full_name}</h3>
                            <p className="text-sm text-slate-500">{formatDate(question.created_at)}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                            {question.category}
                        </span>
                        {question.is_resolved && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                ✓ Resolved
                            </span>
                        )}
                    </div>
                </div>

                {/* Question Content */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{question.title}</h2>
                    <p className="text-slate-600 line-clamp-2">{question.content}</p>
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{question.answer_count} answers</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{question.view_count} views</span>
                        </div>
                    </div>

                    {/* Voting */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onVote?.(question.id, true);
                            }}
                            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                            <span className="text-sm text-slate-600">{question.upvotes}</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onVote?.(question.id, false);
                            }}
                            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                            <span className="text-sm text-slate-600">{question.downvotes}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
