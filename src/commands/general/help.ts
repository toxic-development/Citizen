import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import type Citizen from '../../client/Citizen';
import config from '../../config/config';
import { SlashBase } from '../../utils/CommandBase';
import { SubCommandOptions } from '../../types/base.interface';
import { SlashCommandOptions, ISlashCommand } from '../../types/utils.interface';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } from 'discord.js'

class Help extends SlashBase {
    constructor(client: Citizen) {

        super({
            name: 'help',
            description: 'View all commands or get help with a specific command.',
            category: 'General',
            usage: '/help | /help <command>',
            example: '/help | /help ping',
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'command',
                    description: 'The command you want to get help with.',
                    required: false,
                    choices: [{
                        name: '/help',
                        value: 'help'
                    }, {
                        name: '/ping',
                        value: 'ping'
                    }, {
                        name: '/fivem',
                        value: 'fivem'
                    }],
                    type: SubCommandOptions.String
                }
            ],
        });
    }

    public async execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

        const command = interaction.options.getString('command');
        const general = client.commands.category('General');
        const fivem = client.commands.category('FiveM');

        if (command) {

            const cmd = client.commands.get(command);

            if (!cmd) interaction.reply({ content: 'That command does not exist.', ephemeral: true });

            if (cmd?.props.name === 'fivem') {

                let addCmd = cmd?.props.options?.find((option: any) => option.name === 'add');

                return interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: `Help for /${cmd?.props.name}`,
                            description: `${cmd?.props.description}`,
                            color: `${client.config.EmbedColor}`,
                            fields: [
                                {
                                    name: 'Add a server',
                                    value: `• \`${addCmd?.usage}\`\n• \`${addCmd?.example}\``,
                                    inline: true
                                }
                            ]
                        })
                    ]
                })
            }

            return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: `Help for ${cmd?.props.name}`,
                        description: `${cmd?.props.description}`,
                        color: `${client.config.EmbedColor}`,
                        fields: [
                            {
                                name: 'Usage',
                                value: `\`${cmd?.props.usage}\``
                            },
                            {
                                name: 'Example',
                                value: `\`${cmd?.props.example}\``
                            }
                        ]
                    })
                ]
            })
        } else {

            const select = new StringSelectMenuBuilder()
                .setCustomId('help')
                .setPlaceholder('Select a category to view its commands.')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Main Menu')
                        .setDescription('Back to the main help command')
                        .setValue('main'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('General')
                        .setDescription('All of our essential commands.')
                        .setValue('general'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('FiveM')
                        .setDescription('All of our FiveM commands.')
                        .setValue('fivem'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Development')
                        .setDescription('All of our development commands.')
                        .setValue('development')
                )

            const row: any = new ActionRowBuilder()
                .addComponents(select)

            await interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: 'Help',
                        description: `Select a category to view its commands.`,
                        color: `${client.config.EmbedColor}`,
                    })
                ],
                components: [row]
            })

            const collector = interaction.channel?.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                dispose: true,
                idle: 10000,
            });

            collector?.checkEnd();

            collector?.on('collect', async i => {

                switch (i.values[0]) {
                    case 'main':
                        await i.update({
                            embeds: [
                                new client.Embeds({
                                    title: 'Help',
                                    description: `Select a category to view its commands.`,
                                    color: `${client.config.EmbedColor}`,
                                })
                            ],
                            components: [row]
                        })
                        break;
                    case 'general':
                        await i.update({
                            embeds: [
                                new client.Embeds({
                                    title: 'General Commands',
                                    description: `Here is a list of all the essential commands.`,
                                    color: `${client.config.EmbedColor}`,
                                    fields: [
                                        {
                                            name: 'Commands',
                                            value: `**${general.map(cmd => cmd.props.name).join(', ')}**`
                                        }
                                    ]
                                })
                            ],
                            components: [row]
                        })
                        break;
                    case 'fivem':

                        const cmdArray: SlashCommandOptions[] = [];

                        await fivem.map((cmd: ISlashCommand) => {
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

                        await i.update({
                            embeds: [
                                new client.Embeds({
                                    title: 'FiveM Commands',
                                    description: 'Here is a list of all the FiveM commands. They can be ran using the base `/fivem` command ex: `/fivem add`',
                                    color: `${client.config.EmbedColor}`,
                                    fields: [...fields]
                                })
                            ],
                            components: [row]
                        })
                        break;
                    case 'development':

                        if (!client.config.developers.includes(i.user.id)) i.reply({ content: 'You are not a developer.', ephemeral: true });

                        await i.update({
                            embeds: [
                                new client.Embeds({
                                    title: 'Development Commands',
                                    description: `Here is a list of all the development commands.`,
                                    color: `${client.config.EmbedColor}`,
                                    fields: [
                                        {
                                            name: 'Commands',
                                            value: `**${client.commands.category('Development').map(cmd => cmd.props.name).join(', ')}**`
                                        }
                                    ]
                                })
                            ],
                            components: [row]
                        })
                        break;
                }
            })

            collector?.on('end', async (collected, reason) => {

                if (reason === 'user') {
                    interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Error: interaction closed',
                                description: `The interaction was closed and will now be aborted.`,
                                color: `${client.config.EmbedColor}`,
                                fields: [
                                    {
                                        name: 'Collector',
                                        value: `Collected: \`${collected.size}\` items before close`
                                    },
                                    {
                                        name: 'Reason',
                                        value: `Closed by: \`${interaction.user.tag}\``
                                    }
                                ]
                            })
                        ],
                        components: []
                    })

                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 5000)
                } else if (reason === 'idle') {
                    interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Error: interaction timed out',
                                description: `The interaction timed out after 10 seconds and will now be aborted.`,
                                color: `${client.config.EmbedColor}`,
                                fields: [
                                    {
                                        name: 'Collector',
                                        value: `Collected: \`${collected.size}\` items before close`
                                    }
                                ]
                            })
                        ],
                        components: []
                    })

                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 5000)
                } else {
                    interaction.editReply({
                        embeds: [
                            new client.Embeds({
                                title: 'Error: interaction closed',
                                description: `The interaction was closed and will now be aborted.`,
                                color: `${client.config.EmbedColor}`,
                                fields: [
                                    {
                                        name: 'Collector',
                                        value: `Collected: \`${collected.size}\` items before close`
                                    },
                                    {
                                        name: 'Reason',
                                        value: `Closed with reason: \`${reason}\``
                                    }
                                ]
                            })
                        ],
                        components: []
                    })

                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 5000)
                }
            })
        }
    }
}

export default Help;