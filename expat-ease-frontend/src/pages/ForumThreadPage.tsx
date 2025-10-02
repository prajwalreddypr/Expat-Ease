import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../utils/api';
import AnswerCard from '../components/forum/AnswerCard';

interface Question {
    id: number;
    title: string;
    content: string;
    category: string;
    created_at: string;
    is_resolved: boolean;
    view_count: number;
    answer_count: number;
    upvotes: number;
    downvotes: number;
    user: {
        id: number;
        full_name: string;
        profile_photo?: string;
        country?: string;
    };
}

interface Answer {
    id: number;
    content: string;
    created_at: string;
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

const ForumThreadPage: React.FC = () => {
    const { questionId } = useParams<{ questionId: string }>();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [answerContent, setAnswerContent] = useState('');

    const fetchQuestionDetails = async () => {
        try {
            setLoading(true);
            console.log('Fetching question details for ID:', questionId);
            const response = await fetch(getApiUrl(`/api/v1/forum/questions/${questionId}`), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Question details response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Question data received:', data);
                setQuestion(data);
                setAnswers(data.answers || []);
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch question details:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error fetching question details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (questionId && token) {
            fetchQuestionDetails();
        }
    }, [questionId, token]);

    const handlePostAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answerContent.trim()) return;

        try {
            console.log('Posting answer:', answerContent);
            const response = await fetch(getApiUrl(`/api/v1/forum/questions/${questionId}/answers`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: answerContent.trim() })
            });

            console.log('Answer post response status:', response.status);
            if (response.ok) {
                console.log('Answer posted successfully');
                setAnswerContent('');
                fetchQuestionDetails(); // Refresh to get updated answers
            } else {
                const errorText = await response.text();
                console.error('Failed to post answer:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error posting answer:', error);
        }
    };

    const handleVoteQuestion = async (questionId: number, isUpvote: boolean) => {
        try {
            console.log('Voting on question:', questionId, 'isUpvote:', isUpvote);
            const response = await fetch(getApiUrl(`/api/v1/forum/questions/${questionId}/vote?is_upvote=${isUpvote}`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Vote response status:', response.status);
            if (response.ok) {
                console.log('Vote successful, refreshing question...');
                fetchQuestionDetails();
            } else {
                const errorText = await response.text();
                console.error('Failed to vote on question:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error voting on question:', error);
        }
    };

    const handleVoteAnswer = async (answerId: number, isUpvote: boolean) => {
        try {
            console.log('Voting on answer:', answerId, 'isUpvote:', isUpvote);
            const response = await fetch(getApiUrl(`/api/v1/forum/answers/${answerId}/vote?is_upvote=${isUpvote}`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Answer vote response status:', response.status);
            if (response.ok) {
                console.log('Answer vote successful, refreshing...');
                fetchQuestionDetails();
            } else {
                const errorText = await response.text();
                console.error('Failed to vote on answer:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error voting on answer:', error);
        }
    };

    const handleAcceptAnswer = async (answerId: number) => {
        try {
            console.log('Accepting answer:', answerId);
            const response = await fetch(getApiUrl(`/api/v1/forum/answers/${answerId}/accept`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Accept answer response status:', response.status);
            if (response.ok) {
                console.log('Answer accepted successfully');
                fetchQuestionDetails();
            } else {
                const errorText = await response.text();
                console.error('Failed to accept answer:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error accepting answer:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            housing: 'bg-blue-100 text-blue-800',
            banking: 'bg-green-100 text-green-800',
            legal: 'bg-purple-100 text-purple-800',
            work: 'bg-orange-100 text-orange-800',
            education: 'bg-indigo-100 text-indigo-800',
            healthcare: 'bg-red-100 text-red-800',
            transportation: 'bg-yellow-100 text-yellow-800',
            social: 'bg-pink-100 text-pink-800',
            general: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors.general;
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                        <p className="text-slate-600 mt-4">Loading question...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen pt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Question not found</h2>
                        <button
                            onClick={() => navigate('/forum')}
                            className="btn bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                        >
                            Back to Forum
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/forum')}
                        className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Forum
                    </button>
                </div>

                {/* Question */}
                <div className="card mb-6">
                    <div className="p-6">
                        {/* Question Header */}
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
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-800 mb-4">{question.title}</h1>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{question.content}</p>
                        </div>

                        {/* Question Stats and Actions */}
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

                            {/* Question Voting */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleVoteQuestion(question.id, true)}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                    </svg>
                                    <span className="text-sm text-slate-600">{question.upvotes}</span>
                                </button>
                                <button
                                    onClick={() => handleVoteQuestion(question.id, false)}
                                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
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

                {/* Inline Answer Form */}
                <div className="card mb-6">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Your Answer</h3>
                        <form onSubmit={handlePostAnswer} className="space-y-4">
                            <div>
                                <textarea
                                    value={answerContent}
                                    onChange={(e) => setAnswerContent(e.target.value)}
                                    rows={4}
                                    placeholder="Write your answer here..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setAnswerContent('')}
                                    className="btn bg-slate-200 text-slate-700 hover:bg-slate-300"
                                >
                                    Clear
                                </button>
                                <button
                                    type="submit"
                                    className="btn bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl"
                                >
                                    Post Answer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Answers */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">
                        {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                    </h2>

                    {answers.length === 0 ? (
                        <div className="card text-center py-12">
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                                    <span className="text-white text-3xl">💭</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">
                                No Answers Yet
                            </h3>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                Be the first to answer this question and help the community!
                            </p>
                        </div>
                    ) : (
                        answers.map((answer) => (
                            <AnswerCard
                                key={answer.id}
                                answer={answer}
                                onVote={handleVoteAnswer}
                                onAccept={user?.id === question.user.id ? handleAcceptAnswer : undefined}
                                canAccept={user?.id === question.user.id}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForumThreadPage;
