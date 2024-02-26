import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import type Citizen from '../../client/Citizen';
import config from '../../config/config';
import { SlashBase } from '../../utils/CommandBase';
import { SubCommandOptions } from '../../types/base.interface';
import { SlashCommandOptions, ISlashCommand } from '../../types/utils.interface';

class Help extends SlashBase {
    constructor(client: Citizen) {

        super({
            name: 'help',
            description: 'View a list of commands or info.',
            category: 'General',
            usage: '/help',
            example: '/help',
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'category',
                    description: 'Select a category to view commands from.',
                    type: SubCommandOptions.String,
                    required: false,
                    choices: [
                        {
                            name: 'general',
                            value: 'general'
                        },
                        {
                            name: 'servers',
                            value: 'servers'
                        },
                    ]
                }
            ]
        });
    }

    public async execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

        const category = await interaction.options.getString('category');

        switch (category) {

            case 'general': {

                const generalCommands = client.commands.category('General');
                const generalArray: SlashCommandOptions[] = [];

                await generalCommands.map((cmd: ISlashCommand) => {
                    generalArray.push(cmd.props)
                })

                const general = generalArray.map((c: SlashCommandOptions) => {
                    return {
                        name: c.name,
                        value: `**About:** ${c.description}\n**Usage:** \`${c.usage}\`\n**Example:** \`${c.example}\``,
                        inline: true
                    }
                })

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'General Commands',
                            description: "Here is a list of all the general commands, you can run them using `/<command>`. Example: `/ping`",
                            color: config.EmbedColor,
                            fields: [...general]
                        })
                    ]
                })
            }

            case 'servers': {

                const serrversCommands = client.commands.category('Servers');
                const serversArray: SlashCommandOptions[] = [];

                await serrversCommands.map(async (cmd: ISlashCommand) => {
                    await cmd?.props?.options?.map((opt: SlashCommandOptions) => {
                        serversArray.push(opt)
                    })
                })

                const servers = serversArray.map((c: SlashCommandOptions) => {
                    return {
                        name: c.name,
                        value: `**About:** ${c.description}\n**Usage:** \`${c.usage}\`\n**Example:** \`${c.example}\``,
                        inline: true
                    }
                })

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'Servers Commands',
                            description: "Here is a list of all the servers commands, you can run them using `/<command>`. Example: `/servers add`",
                            color: config.EmbedColor,
                            fields: [...servers]
                        })
                    ]
                })
            }

            default: return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: 'Useful Information',
                        description: 'Here is some useful information about the bot.',
                        color: config.EmbedColor,
                        fields: [
                            {
                                name: 'Useful Links',
                                value: `• [Dashboard](https://citizenbot.xyz)\n
                                • [Invite Link](${config.invite})\n
                                • [Support Server](https://toxicdevs.site/discord)\n
                                • [GitHub](https://github.com/toxic-development/Citizen)\n
                                • [Twitter/X](https://twitter.com/CitizenFXBot)`,
                                inline: true
                            }
                        ]
                    })
                ]
            })
        }
    }
}

export default Help;