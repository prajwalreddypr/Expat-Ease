import { useCallback, useEffect, useState } from 'react';
import {
    acceptForumAnswer,
    createForumAnswer,
    getForumQuestion,
    voteOnForumAnswer,
    voteOnForumQuestion,
} from '../api/forum';
import type { ForumAnswer, ForumQuestion } from '../types/forum';

export const useForumThread = (questionId: string | undefined, token: string | null) => {
    const [question, setQuestion] = useState<ForumQuestion | null>(null);
    const [answers, setAnswers] = useState<ForumAnswer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestionDetails = useCallback(async () => {
        if (!questionId || !token) return;

        try {
            setLoading(true);
            const questionDetail = await getForumQuestion(token, questionId);
            setQuestion(questionDetail);
            setAnswers(questionDetail.answers || []);
        } catch {
            setQuestion(null);
            setAnswers([]);
        } finally {
            setLoading(false);
        }
    }, [questionId, token]);

    useEffect(() => {
        if (questionId && token) void fetchQuestionDetails();
    }, [fetchQuestionDetails, questionId, token]);

    const addAnswer = async (content: string): Promise<boolean> => {
        if (!questionId || !token) return false;

        try {
            await createForumAnswer(token, questionId, content);
            await fetchQuestionDetails();
            return true;
        } catch {
            return false;
        }
    };

    const voteQuestion = async (id: number, isUpvote: boolean) => {
        if (!token) return;

        try {
            await voteOnForumQuestion(token, id, isUpvote);
            await fetchQuestionDetails();
        } catch {
            // Keep the current vote totals if the request fails.
        }
    };

    const voteAnswer = async (answerId: number, isUpvote: boolean) => {
        if (!token) return;

        try {
            await voteOnForumAnswer(token, answerId, isUpvote);
            await fetchQuestionDetails();
        } catch {
            // Keep the current vote totals if the request fails.
        }
    };

    const acceptAnswer = async (answerId: number) => {
        if (!token) return;

        try {
            await acceptForumAnswer(token, answerId);
            await fetchQuestionDetails();
        } catch {
            // Keep the current answer state if the request fails.
        }
    };

    return {
        question,
        answers,
        loading,
        addAnswer,
        voteQuestion,
        voteAnswer,
        acceptAnswer,
    };
};
