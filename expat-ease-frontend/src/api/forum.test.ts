import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    acceptForumAnswer,
    createForumAnswer,
    createForumQuestion,
    getForumQuestion,
    getForumQuestions,
    voteOnForumAnswer,
    voteOnForumQuestion,
} from './forum';
import { apiFetch, getApiErrorDetail } from '../utils/api';

vi.mock('../utils/api', () => ({
    apiFetch: vi.fn(),
    getApiErrorDetail: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);
const getApiErrorDetailMock = vi.mocked(getApiErrorDetail);
const successfulResponse = (body: unknown = {}) => Response.json(body);

describe('forum API', () => {
    beforeEach(() => {
        apiFetchMock.mockReset();
        getApiErrorDetailMock.mockReset();
        apiFetchMock.mockResolvedValue(successfulResponse());
    });

    it('loads all questions with authorization', async () => {
        apiFetchMock.mockResolvedValue(successfulResponse([]));

        await getForumQuestions('test-token');

        expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/forum/questions', {
            headers: {
                Authorization: 'Bearer test-token',
                'Content-Type': 'application/json',
            },
        });
    });

    it('encodes a category when filtering questions', async () => {
        apiFetchMock.mockResolvedValue(successfulResponse([]));

        await getForumQuestions('test-token', 'work permits');

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/api/v1/forum/questions?category=work%20permits',
            expect.any(Object),
        );
    });

    it('loads a question thread', async () => {
        const question = { id: 7, answers: [] };
        apiFetchMock.mockResolvedValue(successfulResponse(question));

        await expect(getForumQuestion('test-token', 7)).resolves.toEqual(question);
        expect(apiFetchMock).toHaveBeenCalledWith('/api/v1/forum/questions/7', {
            headers: {
                Authorization: 'Bearer test-token',
                'Content-Type': 'application/json',
            },
        });
    });

    it('creates questions and answers with JSON payloads', async () => {
        apiFetchMock
            .mockResolvedValueOnce(successfulResponse({ id: 1 }))
            .mockResolvedValueOnce(successfulResponse({ id: 2 }));
        const question = { title: 'Title', content: 'Content', category: 'general' };

        await createForumQuestion('test-token', question);
        await createForumAnswer('test-token', 1, 'An answer');

        expect(apiFetchMock).toHaveBeenNthCalledWith(1, '/api/v1/forum/questions', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer test-token',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(question),
        });
        expect(apiFetchMock).toHaveBeenNthCalledWith(2, '/api/v1/forum/questions/1/answers', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer test-token',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: 'An answer' }),
        });
    });

    it('uses the correct mutation endpoints', async () => {
        apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

        await voteOnForumQuestion('test-token', 3, true);
        await voteOnForumAnswer('test-token', 4, false);
        await acceptForumAnswer('test-token', 4);

        expect(apiFetchMock.mock.calls.map(([endpoint]) => endpoint)).toEqual([
            '/api/v1/forum/questions/3/vote?is_upvote=true',
            '/api/v1/forum/answers/4/vote?is_upvote=false',
            '/api/v1/forum/answers/4/accept',
        ]);
    });

    it('surfaces API error details', async () => {
        apiFetchMock.mockResolvedValue(new Response(null, { status: 403 }));
        getApiErrorDetailMock.mockResolvedValue('Not permitted');

        await expect(getForumQuestions('test-token')).rejects.toThrow('Not permitted');
    });
});
