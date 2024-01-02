export interface ForumUser {
    id?: number;
    username?: string;
    last_posted_at?: string;
    last_seen_at?: string;
    created_at?: string;
    trust_level?: number;
    moderator?: boolean;
    admin?: boolean;
    badge_count?: number;
    time_read?: number;
    recent_time_read?: number;
    profile_view_count?: number;
    total_followers?: number;
    total_following?: number;
    success?: any;
    error?: any;
    data?: any;
}

export interface UserAuthTokens {
    id: number;
    created_at: string;
    seen_at: string;
    is_active: boolean;
}

export interface UserAPIKeys {
    id: number;
    application_name: string;
    scopes: string[];
    created_at: string;
    last_used_at: string;
    revoked_at?: string;
}

export interface AssociatedAccounts {
    name: string;
    description: string;
}

export interface UserBadges {
    id: number;
    granted_at: string;
    created_at: string;
    count: number;
    badge_id: number;
    user_id: number;
    granted_by_id: number;
}

export type BadgeTypes = [
    {
        id: 1,
        name: 'Gold',
        sort_order: 9
    },
    {
        id: 2,
        name: 'Silver',
        sort_order: 8
    },
    {
        id: 3,
        name: 'Bronze',
        sort_order: 7
    }
]

export type BadgeGroupings = [
    {
        id: 1,
        name: 'Getting Started',
        position: 10,
        system: true
    },
    {
        id: 2,
        name: 'Community',
        position: 11,
        system: true
    },
    {
        id: 3,
        name: 'Posting',
        position: 12,
        system: true
    },
    {
        id: 4,
        name: 'Trust Level',
        position: 13,
        system: true
    }
]

export type Badges = [
    {
        id: 1,
        name: 'Basic',
        description: 'Granted all essential functions',
        badge_grouping_id: BadgeGroupings['3']['id']
        badge_type_id: BadgeTypes['2']['id']
    },
    {
        id: 2,
        name: 'Member',
        description: 'Granted invitations, group messaging and more likes.'
        badge_grouping_id: BadgeGroupings['3']['id']
        badge_type_id: BadgeTypes['2']['id']
    },
    {
        id: 3,
        name: 'Regular',
        description: 'Granted re-categorize, rename, followed links, wiki and more likes.'
        badge_grouping_id: BadgeGroupings['3']['id']
        badge_type_id: BadgeTypes['1']['id']
    },
    {
        id: 4,
        name: 'Leader',
        description: 'Granted global edit, pin, close, archive, split, merge and more likes.',
        badge_grouping_id: BadgeGroupings['3']['id']
        badge_type_id: BadgeTypes['0']['id']
    },
    {
        id: 5,
        name: 'Welcome',
        description: 'Received their first like',
        badge_grouping_id: BadgeGroupings['1']['id']
        badge_type_id: BadgeTypes['2']['id']
    }
]

export interface ForumTopic {
    id: number;
    title: string;
    fancy_title: string;
    slug?: string;
    posts_count: number;
    reply_count: number;
    highest_post_number?: number;
    created_at: string;
    last_posted_at?: string;
    bumped: boolean;
    bumped_at?: string;
    archetype?: string;
    unseen?: boolean;
    pinned?: boolean;
    unpinned?: boolean | null;
    excerpt?: string | any;
    visible?: boolean;
    closed?: boolean;
    archived?: boolean;
    tags?: string[];
    category_id: number;
}

export interface ForumPost {
    id: string;
    username: string;
    avatar_template: string;
    created_at: string;
    like_count: number;
    blurb: string;
    post_number: number;
    topic_id: number;
}

export interface SearchParams {
    q?: string;
    type?: string;
    username?: string;
    category?: string;
    tags?: string;
    before?: string;
    after?: string;
    order?: string;
    assigned?: string;
    in?: string;
    with?: string;
    status?: string;
    group?: string;
    group_messages?: string;
    min_posts?: number;
    max_posts?: number;
    min_views?: number;
    max_views?: number;
}

export interface SearchResponse {
    success: boolean;
    error: any;
    data?: any;
}

export interface FilteredSearch {
    query: string;
    type: ForumTypes;
    max?: number;
}

export enum ForumTypes {
    topic = 'topic',
    post = 'post'
}

export type ForumPostType = {
    post_stream: PostStream;
    timeline_lookup: any[];
    suggested_topics: any[];
    tags_description: any[];
    tags: any[];
    id: number;
    title: string;
    fancy_title: string;
    posts_count: number;
    created_at: string;
    views: number;
    reply_count: number;
    like_count: number;
    last_posted_at: string;
    visible: boolean;
    closed: boolean;
    archived: boolean;
    has_summary: boolean;
    archetype: string;
    slug: string;
    details: {
        participants: string[];
        created_by: {
            id: number;
            username: string;
            avatar_template: string;
        }
        last_poster: {
            id: number;
            username: string;
            avatar_template: string;
        }
        links: {
            title: string | null;
            url: string;
            internal: boolean;
            attachment: boolean;
            reflection: boolean;
            clicks: number;
            domain: string;
        }
    }
}

export type PostStream = {
    posts: PostInfo[];
    stream?: number[];
}

export type PostInfo = {
    id: number;
    title?: string;
    fancy_title?: string;
    views?: number;
    username: string;
    avatar_template: string;
    created_at: string;
    like_count: number;
    post_number: number;
    post_type: number;
    reply_count: number;
    reads: number;
    reader_count: number;
    score: number;
    topic_id: number;
    topic_slug: string;
    version: number;
    link_counts: PostLinks[];
    reaction_users_count: number;
    reactions: PostReactions[]
    suggested_topics: any[];
}

export type PostLinks = {
    url: string;
    internal: boolean;
    reflection: boolean;
    title: string | null;
    clicks: number;
}

export type PostReactions = {
    id: string;
    type: string;
    count: number;
}

