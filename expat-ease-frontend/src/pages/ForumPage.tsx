import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../utils/api';
import NewQuestionForm from '../components/forum/NewQuestionForm';

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

const ForumPage: React.FC = () => {
    const { token, user } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [questionAnswers, setQuestionAnswers] = useState<{ [key: number]: Answer[] }>({});
    const [answerContent, setAnswerContent] = useState<{ [key: number]: string }>({});


    const categories = [
        { value: 'all', label: 'All Questions', icon: '💬' },
        { value: 'housing', label: 'Housing', icon: '🏠' },
        { value: 'banking', label: 'Banking', icon: '🏦' },
        { value: 'legal', label: 'Legal', icon: '⚖️' },
        { value: 'work', label: 'Work', icon: '💼' },
        { value: 'education', label: 'Education', icon: '🎓' },
        { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
        { value: 'transportation', label: 'Transportation', icon: '🚌' },
        { value: 'social', label: 'Social', icon: '👥' },
        { value: 'general', label: 'General', icon: '💭' }
    ];

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const url = selectedCategory === 'all'
                ? getApiUrl('/api/v1/forum/questions')
                : getApiUrl(`/api/v1/forum/questions?category=${selectedCategory}`);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setQuestions(data);
                // Fetch answers for all questions
                data.forEach((question: Question) => {
                    fetchQuestionAnswers(question.id);
                });
            } else {
                console.error('Failed to fetch questions');
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestionAnswers = async (questionId: number) => {
        try {
            console.log('Fetching answers for question:', questionId);
            const response = await fetch(getApiUrl(`/api/v1/forum/questions/${questionId}`), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Answers response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Answers data received:', data.answers);
                setQuestionAnswers(prev => ({
                    ...prev,
                    [questionId]: data.answers || []
                }));
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch answers:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error fetching answers:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchQuestions();
        }
    }, [token, selectedCategory]);

    const handleNewQuestion = async (data: { title: string; content: string; category: string }) => {
        try {
            console.log('Submitting question:', data);
            const response = await fetch(getApiUrl('/api/v1/forum/questions'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('Question response status:', response.status);
            if (response.ok) {
                console.log('Question created successfully');
                setShowNewQuestionForm(false);
                fetchQuestions();
            } else {
                const errorText = await response.text();
                console.error('Failed to create question:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error creating question:', error);
        }
    };

    const handlePostAnswer = async (questionId: number) => {
        const content = answerContent[questionId];
        if (!content?.trim()) return;

        try {
            console.log('Posting answer for question:', questionId, 'Content:', content);
            const response = await fetch(getApiUrl(`/api/v1/forum/questions/${questionId}/answers`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: content.trim() })
            });

            console.log('Answer post response status:', response.status);
            if (response.ok) {
                console.log('Answer posted successfully');
                setAnswerContent(prev => ({ ...prev, [questionId]: '' }));
                fetchQuestionAnswers(questionId); // Refresh answers
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
                console.log('Vote successful, refreshing questions...');
                fetchQuestions();
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
                // Find which question this answer belongs to and refresh its answers
                const questionId = Object.keys(questionAnswers).find(id =>
                    questionAnswers[parseInt(id)].some(answer => answer.id === answerId)
                );
                if (questionId) {
                    fetchQuestionAnswers(parseInt(questionId));
                }
            } else {
                const errorText = await response.text();
                console.error('Failed to vote on answer:', response.status, errorText);
            }
        } catch (error) {
            console.error('Error voting on answer:', error);
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

    if (showNewQuestionForm) {
        return (
            <div className="min-h-screen pt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <NewQuestionForm
                        onSubmit={handleNewQuestion}
                        onCancel={() => setShowNewQuestionForm(false)}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gradient mb-2">
                                Community Forum
                            </h1>
                            <p className="text-lg text-slate-600">
                                Connect with other expats, ask questions, and share your experiences.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowNewQuestionForm(true)}
                            className="btn bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Ask Question
                        </button>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.value}
                                onClick={() => setSelectedCategory(category.value)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.value
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {category.icon} {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                            <p className="text-slate-600 mt-4">Loading questions...</p>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="card text-center py-12">
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                                    <span className="text-white text-3xl">💬</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">
                                No Questions Yet
                            </h2>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                Be the first to ask a question and help build our community!
                            </p>
                            <button
                                onClick={() => setShowNewQuestionForm(true)}
                                className="btn bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center"
                            >
                                Ask the First Question
                            </button>
                        </div>
                    ) : (
                        questions.map((question) => (
                            <div key={question.id} className="bg-white border border-slate-200 rounded-lg mb-3">
                                <div className="p-3">
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                                                {question.user.profile_photo ? (
                                                    <img
                                                        src={question.user.profile_photo}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white text-xs font-semibold">
                                                        {question.user.full_name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800 text-xs">{question.user.full_name}</h3>
                                                <p className="text-xs text-slate-500">{formatDate(question.created_at)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                                                {question.category}
                                            </span>
                                            {question.is_resolved && (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Question Content */}
                                    <div className="mb-2">
                                        <h2 className="text-sm font-bold text-slate-800 mb-1">{question.title}</h2>
                                        <p className="text-slate-700 text-xs">{question.content}</p>
                                    </div>

                                    {/* Question Stats and Actions */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3 text-xs text-slate-500">
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <span>{question.answer_count}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleVoteQuestion(question.id, true)}
                                                className="flex items-center space-x-1 px-1 py-1 rounded hover:bg-slate-100 transition-colors"
                                            >
                                                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                                </svg>
                                                <span className="text-xs text-slate-600">{question.upvotes}</span>
                                            </button>
                                            <button
                                                onClick={() => handleVoteQuestion(question.id, false)}
                                                className="flex items-center space-x-1 px-1 py-1 rounded hover:bg-slate-100 transition-colors"
                                            >
                                                <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                                </svg>
                                                <span className="text-xs text-slate-600">{question.downvotes}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Answers List - Show First */}
                                    <div className="mt-2 pt-2 border-t border-slate-200">
                                        <div className="space-y-2">
                                            {!questionAnswers[question.id] ? (
                                                <div className="text-center py-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mx-auto"></div>
                                                    <p className="text-slate-600 mt-1 text-xs">Loading...</p>
                                                </div>
                                            ) : questionAnswers[question.id].length === 0 ? (
                                                <div className="text-center py-2">
                                                    <p className="text-slate-600 text-xs">No answers yet</p>
                                                </div>
                                            ) : (
                                                questionAnswers[question.id].map((answer) => (
                                                    <div key={answer.id} className="bg-slate-50 rounded p-2">
                                                        <div className="flex items-start space-x-2">
                                                            <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                                                                {answer.user.profile_photo ? (
                                                                    <img
                                                                        src={answer.user.profile_photo}
                                                                        alt="Profile"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-white text-xs font-semibold">
                                                                        {answer.user.full_name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <span className="text-xs font-semibold text-slate-800">{answer.user.full_name}</span>
                                                                    <span className="text-xs text-slate-500">{formatDate(answer.created_at)}</span>
                                                                    {answer.is_accepted && (
                                                                        <span className="px-1 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">✓</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-700">{answer.content}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Answer Form - Only if user is not the question author */}
                                        {user?.id !== question.user.id && (
                                            <div className="mt-3 pt-2 border-t border-slate-200">
                                                <h3 className="text-xs font-bold text-slate-800 mb-2">Add Answer</h3>
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={answerContent[question.id] || ''}
                                                        onChange={(e) => setAnswerContent(prev => ({ ...prev, [question.id]: e.target.value }))}
                                                        rows={2}
                                                        placeholder="Write your answer..."
                                                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                    <div className="flex justify-end space-x-1">
                                                        <button
                                                            onClick={() => setAnswerContent(prev => ({ ...prev, [question.id]: '' }))}
                                                            className="px-2 py-1 text-xs bg-slate-200 text-slate-700 hover:bg-slate-300 rounded"
                                                        >
                                                            Clear
                                                        </button>
                                                        <button
                                                            onClick={() => handlePostAnswer(question.id)}
                                                            className="px-2 py-1 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded hover:shadow-md"
                                                        >
                                                            Post
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForumPage;
