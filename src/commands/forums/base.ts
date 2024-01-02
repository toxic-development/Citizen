import config from '../../config/config';
import { SlashBase } from '../../utils/CommandBase';
import { ForumManager } from '../../managers/ForumManager';
import { SubCommandOptions } from '../../types/base.interface';
import { SlashCommandOptions, ISlashCommand } from '../../types/utils.interface';
import { ForumUser, ForumTypes, ForumPost } from '../../types/forum.interface';

import type Citizen from '../../client/Citizen';
import type { CacheType, ChatInputCommandInteraction } from 'discord.js';

class Forum extends SlashBase {
    constructor() {

        super({
            name: 'forums',
            description: 'Interact with the FiveM/cfx.re forums.',
            usage: '/forums <subcommand> [args]',
            example: '/forums search <query>',
            category: 'Forums',
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'help',
                    description: 'Get help with the forums command.',
                    type: SubCommandOptions.SubCommand,
                },
                {
                    name: 'user',
                    description: 'Find a user on the FiveM/cfx.re forums.',
                    type: SubCommandOptions.SubCommand,
                    options: [
                        {
                            name: 'username',
                            description: 'The users forum username',
                            type: SubCommandOptions.String,
                            required: true
                        }
                    ]
                },
                {
                    name: 'search',
                    description: 'Search the FiveM/cfx.re forums.',
                    type: SubCommandOptions.SubCommand,
                    options: [
                        {
                            name: 'type',
                            description: 'The type of search to perform',
                            type: SubCommandOptions.String,
                            required: true,
                            choices: [
                                {
                                    name: 'Topic',
                                    value: 'topic'
                                },
                                {
                                    name: 'Post',
                                    value: 'post'
                                }
                            ]
                        },
                        {
                            name: 'query',
                            description: 'The search query',
                            type: SubCommandOptions.String,
                            required: true
                        },
                        {
                            name: 'limit',
                            description: 'The amount of results to return (max: 9)',
                            type: SubCommandOptions.Integer,
                            required: false
                        }
                    ]
                },
                {
                    name: 'post',
                    description: 'Get a post from the FiveM/cfx.re forums.',
                    type: SubCommandOptions.SubCommand,
                    options: [
                        {
                            name: 'topic',
                            description: 'The topic ID',
                            type: SubCommandOptions.Integer,
                            required: true
                        },
                        {
                            name: 'post',
                            description: 'The post number (optional in most cases)',
                            type: SubCommandOptions.Integer,
                            required: false
                        }
                    ]
                },
            ]
        });
    }

    public async execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

        const forumManager = new ForumManager(client);

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {

            /**
             * Help for the forums command.
             */
            case 'help': {

                const forums = client.commands.category('Forums');

                const cmdArray: SlashCommandOptions[] = [];

                await forums.map((cmd: ISlashCommand) => {
                    cmd.props.options?.map((opt: SlashCommandOptions) => {
                        cmdArray.push(opt)
                    })
                })

                const fields = cmdArray.map((c: SlashCommandOptions) => {
                    return {
                        name: c.name,
                        value: `**About:** ${c.description}\n**Usage:** \`${c.usage}\`\n**Example:** \`${c.example}\``,
                        inline: true
                    }
                })

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Forums Command Help',
                            color: config.EmbedColor,
                            fields: [
                                {
                                    name: 'Subcommands',
                                    value: '`user`, `search`, `post`'
                                },
                                {
                                    name: 'Subcommand Usage',
                                    value: `\`/forums user <username>\`\n\`/forums search <type> <query>\`\n\`/forums post <topic> <post>\``
                                },
                                {
                                    name: 'Subcommand Description',
                                    value: 'Find a user on the forums.\nSearch the forums.\nGet a post from the forums.'
                                }
                            ]
                        })
                    ]
                });
            }

            /**
             * Get a user from the forums.
             */
            case 'user': {

                const user = interaction.options.getString('username');

                forumManager.getForumUser(user as string).then((u: ForumUser) => {

                    if (!u.success) return interaction.reply({
                        content: `**${u.error}**`,
                        ephemeral: true
                    });

                    const avatar = u.data.avatar_template.replace('{size}', '144');

                    return interaction.reply({
                        embeds: [
                            new client.Embeds({
                                title: `Forum User: ${u.data.username}`,
                                color: config.EmbedColor,
                                url: `https://forum.cfx.re/u/${u.data.username}`,
                                thumbnail: `https://forum.cfx.re/${avatar}`,
                                fields: [
                                    {
                                        name: 'Followers',
                                        value: `${u.data.total_followers}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Following',
                                        value: `${u.data.total_following}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Badge Count',
                                        value: `${u.data.badge_count}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Last Seen',
                                        value: `${client.utils.formatDate(u.data.last_seen_at)}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Last Posted',
                                        value: `${client.utils.formatDate(u.data.last_posted_at)}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Account Created',
                                        value: `${client.utils.formatDate(u.data.created_at)}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Trust Level',
                                        value: `${u.data.trust_level}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Forum Admin',
                                        value: `${u.data.admin ? 'Yes' : 'No'}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Forum Moderator',
                                        value: `${u.data.moderator ? 'Yes' : 'No'}`,
                                        inline: true
                                    }
                                ]
                            })
                        ]
                    })
                });

                break;
            }

            /**
             * Search the forums.
             */
            case 'search': {

                const query: string = interaction.options.getString('query') as string;
                const type: string = interaction.options.getString('type') as string;
                let limit: number = interaction.options.getInteger('limit') as number;

                if (!limit) limit = 2;

                if (limit > 9) return interaction.reply({
                    content: '**Limit cannot be greater than 9.**',
                    ephemeral: true
                });

                if (type === 'topic') {
                    forumManager.filterByType({ query, type: ForumTypes.topic, max: limit }).then((t: any) => {

                        return console.log(t)
                    })
                } else if (type === 'post') {
                    forumManager.filterByType({ query, type: ForumTypes.post, max: limit }).then((p: any) => {

                        let postArray = [];

                        let fields = p.data.map((post: ForumPost) => {
                            return {
                                name: post.blurb.slice(0, 25) + '...',
                                value: `**User:** ${post.id}\n**ID:** ${post.id}\n**Created:** ${client.utils.formatDate(post.created_at as any)}\n**Topic:** ${post.topic_id}\n**Post Number:** ${post.post_number}\n**Likes:** ${post.like_count}\n**Link:** [View Post](https://forum.cfx.re/t/${post.topic_id}/${post.post_number})`,
                                inline: true
                            }
                        });

                        forumManager.getPost(4893262, 1)

                        return interaction.reply({
                            embeds: [
                                new client.Embeds({
                                    title: `Search Results: ${query}`,
                                    color: config.EmbedColor,
                                    fields: [...fields]
                                })
                            ]
                        })
                    })
                }

                break;
            }

            /**
             * Get a post from the forums.
             */
            case 'post': {

                const topicId: number = interaction.options.getInteger('topic') as number;
                const postNumber: number = interaction.options.getInteger('post') as number;

                forumManager.getPost(topicId, postNumber).then((p: any) => {

                    console.log(p?.data?.title)

                    if (!p.success) return interaction.reply({
                        content: `**${p.error}**`,
                        ephemeral: true
                    })

                    return interaction.reply({
                        embeds: [
                            new client.Embeds({
                                title: `Post By: ${p.data.post_stream.posts[0].username}`,
                                color: config.EmbedColor,
                                description: `Information for this post.`,
                                url: `https://forum.cfx.re/t/${p.data.post_stream.posts[0].topic_slug}/${p.data.post_stream.posts[0].topic_id}`,
                                thumbnail: `https://forum.cfx.re/${p.data.post_stream.posts[0].avatar_template.replace('{size}', '144')}`,
                                fields: [
                                    {
                                        name: 'Title',
                                        value: `${p.data.title}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Created',
                                        value: `${client.utils.formatDate(p.data.created_at)}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Likes',
                                        value: `${p.data.like_count}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Views',
                                        value: `${p.data.views}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Replies',
                                        value: `${p.data.reply_count}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Participants',
                                        value: `${p.data.details.participants.length}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Total Links',
                                        value: `${p.data.details.links.length}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Total Tags',
                                        value: `${p.data.tags.length}`,
                                        inline: true
                                    },
                                    {
                                        name: 'Tags List',
                                        value: `${p.data.tags.join(', ')}`,
                                        inline: true
                                    }
                                ]
                            })
                        ]
                    })
                });

                break;
            }

            default: {
                return interaction.reply({
                    content: '**Invalid subcommand.**',
                    ephemeral: true
                });
            }
        }
    }
}

export default Forum;