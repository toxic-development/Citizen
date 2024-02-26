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
            name: 'gate',
            description: 'View, update and manage a user permissions to your server commands.',
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
                    description: 'Get help with the gate command.',
                    type: SubCommandOptions.SubCommand,
                }
            ]
        });
    }

    public async execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {



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