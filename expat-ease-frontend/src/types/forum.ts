export interface ForumUser {
    id: number;
    full_name: string;
    profile_photo?: string;
    country?: string;
}

export interface ForumQuestion {
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
    user: ForumUser;
}

export interface ForumAnswer {
    id: number;
    content: string;
    created_at: string;
    updated_at?: string;
    is_accepted: boolean;
    upvotes: number;
    downvotes: number;
    user: ForumUser;
}
