import axios from 'axios';
import type Citizen from '../client/Citizen';
import * as FiveMTypings from '../types/fivem.interface';
import Logger from '../utils/Logger';
import { FilteredSearch, SearchParams, SearchResponse, ForumTypes, ForumPostType } from '../types/forum.interface';
import qs from 'qs';

export class ForumManager {
    public client: Citizen;
    public logger: Logger

    constructor(client: Citizen) {
        this.client = client;
        this.logger = new Logger('Forums');

        this.checkConnection().then(() => {
            this.client.logger.ready(`[Forums]: Connected to "forum.cfx.re"`);
        }).catch((err: any) => {
            this.client.logger.error(`[Forums]: could not connect to "forum.cfx.re" - ${err}`);
        });
    }

    private checkConnection(): any {

        return axios.get(`https://forum.cfx.re`)
    }

    public async getForumUser(user: string): Promise<SearchResponse> {
        const forum = await fetch(`https://forum.cfx.re/users/${user}.json`)

        if (forum.status !== 200) return {
            success: false,
            error: forum.statusText
        }

        else if (forum.statusText === 'Not Found') return {
            success: false,
            error: 'Unable to locate that user.'
        }

        const u: any = await forum.json();

        return {
            success: true,
            error: false,
            data: u?.user
        }
    }

    public async searchForums(params: SearchParams): Promise<SearchResponse> {

        const qs = new URLSearchParams({
            q: params.q as string,
            max_posts: params.max_posts as any
        })

        const response = await axios.get(`https://forum.cfx.re/search.json?${qs}`);

        if (response.status !== 200) return {
            success: false,
            error: response.statusText
        };

        console.log(response.data.posts)

        let limitedPosts: any = [];

        if (params.type === 'topics') limitedPosts = response.data.topics.slice(0, params.max_posts);
        else if (params.type === 'posts') limitedPosts = response.data.posts.slice(0, params.max_posts);

        else return {
            success: false,
            error: 'Invalid type.'
        }

        return {
            success: true,
            error: false,
            data: limitedPosts
        }
    }

    public async getPost(topicId: number, postNumber: number): Promise<SearchResponse> {

        const forum = await fetch(`https://forum.cfx.re/t/${topicId}/${postNumber}.json`);

        if (forum.status !== 200) return {
            success: false,
            error: forum.statusText
        }

        if (!topicId) return {
            success: false,
            error: 'You must provide a topic ID.'
        }

        if (!postNumber) return {
            success: false,
            error: 'You must provide a post number.'
        }

        const post: ForumPostType = await forum.json() as ForumPostType;

        return {
            success: true,
            error: false,
            data: post
        }
    }

    public async filterByType({ query, type, max }: FilteredSearch): Promise<SearchResponse> {

        const qs = new URLSearchParams({
            q: query as string,
        })

        const forum = await fetch(`https://forum.cfx.re/search.json?${qs}`);
        const allowed: ForumTypes = ForumTypes[type as keyof typeof ForumTypes];

        let data;

        if (forum.status !== 200) return data = {
            success: false,
            error: forum.statusText
        }

        if (!max) data = {
            success: false,
            error: 'You must provide a max amount of posts to return.'
        }

        if (type !== allowed) return data = {
            success: false,
            error: `Valid types are: ${Object.keys(ForumTypes).join(', ')}`
        }

        if (type == allowed) data = {
            success: true,
            error: false,
            data: type.includes('topic') ?
                await forum.json().then((d: any) => d.topics.slice(0, max)) :
                await forum.json().then((d: any) => d.posts.slice(0, max))
        }

        return data as SearchResponse;
    }
}