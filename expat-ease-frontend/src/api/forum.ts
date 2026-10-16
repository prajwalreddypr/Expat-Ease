import type { ForumAnswer, ForumQuestion, ForumQuestionDetail, NewForumQuestion } from '../types/forum';
import { apiFetch, getApiErrorDetail } from '../utils/api';

const authorizationHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
});

const parseResponse = async <ResponseBody>(response: Response): Promise<ResponseBody> => {
    if (!response.ok) {
        const detail = await getApiErrorDetail(response).catch(() => undefined);
        throw new Error(detail || `Forum request failed with status ${response.status}`);
    }
    return response.json() as Promise<ResponseBody>;
};

export const getForumQuestions = async (
    token: string,
    category = 'all',
): Promise<ForumQuestion[]> => {
    const endpoint = category === 'all'
        ? '/api/v1/forum/questions'
        : `/api/v1/forum/questions?category=${encodeURIComponent(category)}`;
    const response = await apiFetch(endpoint, {
        headers: authorizationHeaders(token),
    });
    return parseResponse<ForumQuestion[]>(response);
};

export const getForumQuestion = async (
    token: string,
    questionId: number | string,
): Promise<ForumQuestionDetail> => {
    const response = await apiFetch(`/api/v1/forum/questions/${questionId}`, {
        headers: authorizationHeaders(token),
    });
    return parseResponse<ForumQuestionDetail>(response);
};

export const createForumQuestion = async (
    token: string,
    question: NewForumQuestion,
): Promise<ForumQuestion> => {
    const response = await apiFetch('/api/v1/forum/questions', {
        method: 'POST',
        headers: authorizationHeaders(token),
        body: JSON.stringify(question),
    });
    return parseResponse<ForumQuestion>(response);
};

export const createForumAnswer = async (
    token: string,
    questionId: number | string,
    content: string,
): Promise<ForumAnswer> => {
    const response = await apiFetch(`/api/v1/forum/questions/${questionId}/answers`, {
        method: 'POST',
        headers: authorizationHeaders(token),
        body: JSON.stringify({ content }),
    });
    return parseResponse<ForumAnswer>(response);
};

export const voteOnForumQuestion = async (
    token: string,
    questionId: number | string,
    isUpvote: boolean,
): Promise<void> => {
    const response = await apiFetch(
        `/api/v1/forum/questions/${questionId}/vote?is_upvote=${isUpvote}`,
        { method: 'POST', headers: authorizationHeaders(token) },
    );
    if (!response.ok) await parseResponse(response);
};

export const voteOnForumAnswer = async (
    token: string,
    answerId: number,
    isUpvote: boolean,
): Promise<void> => {
    const response = await apiFetch(
        `/api/v1/forum/answers/${answerId}/vote?is_upvote=${isUpvote}`,
        { method: 'POST', headers: authorizationHeaders(token) },
    );
    if (!response.ok) await parseResponse(response);
};

export const acceptForumAnswer = async (token: string, answerId: number): Promise<void> => {
    const response = await apiFetch(`/api/v1/forum/answers/${answerId}/accept`, {
        method: 'POST',
        headers: authorizationHeaders(token),
    });
    if (!response.ok) await parseResponse(response);
};
