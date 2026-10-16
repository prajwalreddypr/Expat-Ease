import { useCallback, useEffect, useState } from 'react';
import {
    createForumAnswer,
    createForumQuestion,
    getForumQuestion,
    getForumQuestions,
    voteOnForumQuestion,
} from '../api/forum';
import type { ForumAnswer, ForumQuestion, NewForumQuestion } from '../types/forum';

export const useForumQuestions = (token: string | null, selectedCategory: string) => {
    const [questions, setQuestions] = useState<ForumQuestion[]>([]);
    const [questionAnswers, setQuestionAnswers] = useState<Record<number, ForumAnswer[]>>({});
    const [loading, setLoading] = useState(true);

    const fetchQuestionAnswers = useCallback(async (questionId: number) => {
        if (!token) return;

        try {
            const question = await getForumQuestion(token, questionId);
            setQuestionAnswers((currentAnswers) => ({
                ...currentAnswers,
                [questionId]: question.answers || [],
            }));
        } catch {
            // Preserve the existing question list if its answers cannot be loaded.
        }
    }, [token]);

    const fetchQuestions = useCallback(async () => {
        if (!token) return;

        try {
            setLoading(true);
            const loadedQuestions = await getForumQuestions(token, selectedCategory);
            setQuestions(loadedQuestions);
            loadedQuestions.forEach((question) => {
                void fetchQuestionAnswers(question.id);
            });
        } catch {
            // Preserve the current list when a refresh fails.
        } finally {
            setLoading(false);
        }
    }, [fetchQuestionAnswers, selectedCategory, token]);

    useEffect(() => {
        if (token) void fetchQuestions();
    }, [fetchQuestions, token]);

    const addQuestion = async (question: NewForumQuestion): Promise<boolean> => {
        if (!token) return false;

        try {
            await createForumQuestion(token, question);
            await fetchQuestions();
            return true;
        } catch {
            return false;
        }
    };

    const addAnswer = async (questionId: number, content: string): Promise<boolean> => {
        if (!token) return false;

        try {
            await createForumAnswer(token, questionId, content);
            await fetchQuestionAnswers(questionId);
            return true;
        } catch {
            return false;
        }
    };

    const voteQuestion = async (questionId: number, isUpvote: boolean) => {
        if (!token) return;

        try {
            await voteOnForumQuestion(token, questionId, isUpvote);
            await fetchQuestions();
        } catch {
            // Keep the current vote totals if the request fails.
        }
    };

    return {
        questions,
        questionAnswers,
        loading,
        addQuestion,
        addAnswer,
        voteQuestion,
    };
};
