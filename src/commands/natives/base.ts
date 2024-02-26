import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { SubCommandOptions } from '../../types/base.interface';
import type Citizen from '../../client/Citizen';
import { SlashBase } from '../../utils/CommandBase';
import { ServerManager } from '../../managers';
import { formatWithOptions } from 'util';

class FiveMBase extends SlashBase {

    constructor() {
        super({
            name: 'natives',
            description: 'Base Command for Viewing and Searching FiveM Natives.',
            usage: '/natives <subcommand> <options>',
            example: '/natives help',
            category: 'Servers',
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'help',
                    usage: '/servers help',
                    example: '/servers help',
                    description: 'View the help menu for the servers command.',
                    type: SubCommandOptions.SubCommand,
                    options: [
                        {
                            name: 'command',
                            description: 'The command you want to view help for.',
                            required: false,
                            type: SubCommandOptions.String,
                        }
                    ]
                },
                {
                    name: 'cfx',
                    description: 'View/Find a CFX Native.',
                    type: SubCommandOptions.SubCommand,
                    options: [
                        {
                            name: 'name',
                            description: 'The name of the native you want to find.',
                            type: SubCommandOptions.String,
                            required: true,
                        }
                    ]
                }
            ]
        });
    }

    public async execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

        switch (interaction.options.getSubcommand()) {
            case 'help': {
                return interaction.reply('This command is a work in progress.');
            }

            case 'cfx': {

                const name = interaction.options.getString('name');
                const native = await client.natives.findCfxNative(name as string);

                if (!native) return interaction.reply('Unable to locate a native with that name.');

                return interaction.reply(`\`\`\`json\n${JSON.stringify(native, null, 2)}\`\`\``);
            }
        }
    }
}

export default FiveMBase;