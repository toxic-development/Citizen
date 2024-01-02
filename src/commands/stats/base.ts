import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import type Citizen from '../../client/Citizen';
import { SlashBase } from '../../utils/CommandBase';
import { SubCommandOptions } from '../../types/base.interface';
import { FiveMManager } from '../../managers/FiveMManager';

class Stats extends SlashBase {
    constructor() {
        super({
            name: 'stats',
            description: 'View your server stats and information.',
            usage: '/stats <game> <server_id> <type>',
            example: '/stats fivem 123456789 playercount',
            category: 'Stats',
            cooldown: 5,
            ownerOnly: false,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'game',
                    description: 'The game to get stats for (fivem/redm).',
                    type: SubCommandOptions.String,
                    options: [
                        {
                            name: 'fivem',
                            description: 'View stats for your FiveM server(s)',
                            required: false,
                            type: SubCommandOptions.Boolean
                        },
                        {
                            name: 'redm',
                            description: 'View stats for your RedM server(s)',
                            required: false,
                            options: [],
                            type: SubCommandOptions.Boolean
                        }
                    ]
                },
                {
                    name: 'server_id',
                    description: 'The ID of the server to get stats for.',
                    type: SubCommandOptions.String
                },
                {
                    name: 'type',
                    description: 'The type of stats to get (playercount, serverinfo, etc).',
                    type: SubCommandOptions.String,
                    choices: [
                        {
                            name: 'serverinfo',
                            value: 's_info'
                        },
                        {
                            name: 'playercount',
                            value: 'p_count'
                        },
                    ]
                }
            ]
        });
    }

    public async execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

        const game = interaction.options.getString('game');
        const type = interaction.options.getString('type');

        /**
         * GET THE STATS COMMANDS BY GAME
         * @todo Add support for RedM
         */
        switch (game) {

            case 'fivem': {

                const s_id = await interaction.options.getString('server_id');

                const server = await client.db.getFiveMServer({ id: `${s_id}`, owner: `${interaction.user.id}` });

                if (!server.success) interaction.reply({ content: `${server.error}`, ephemeral: false });

                if (server.data) {

                    const s_api = new FiveMManager(client, {
                        ip: server.data.ip,
                        port: server.data.port
                    });

                    const serverAPI = await s_api.getServerInfo();

                    switch (type) {

                        case 's_info': {

                            interaction.reply({
                                embeds: [
                                    new client.Embeds({
                                        title: `${serverAPI.vars.sv_projectName ? serverAPI.vars.sv_projectName : serverAPI.vars.sv_hostname} Server Info`,
                                        description: `${serverAPI.vars.sv_projectDesc ? serverAPI.vars.sv_projectDesc : 'No description provided.'}`,
                                        color: client.config.EmbedColor,
                                        fields: [
                                            {
                                                name: 'Server',
                                                value: `${serverAPI.server}`,
                                                inline: true
                                            },
                                            {
                                                name: 'Locale',
                                                value: `${serverAPI.vars.locale}`,
                                                inline: true
                                            },
                                            {
                                                name: 'One Sync',
                                                value: `${serverAPI.vars.onesync_enabled == "true" ? 'Enabled' : 'Disabled'}`,
                                                inline: true
                                            },
                                            {
                                                name: 'Enhanced Host Support',
                                                value: `${serverAPI.vars.sv_enhancedHostSupport == "true" ? 'Enabled' : 'Disabled'}`,
                                                inline: true
                                            },
                                            {
                                                name: 'Client Modifications',
                                                value: `${serverAPI.vars.sv_scriptHookAllowed ? 'Allowed' : 'Not Allowed'}`,
                                                inline: true
                                            },
                                            {
                                                name: 'Max Clients',
                                                value: `${serverAPI.vars.sv_maxClients}`,
                                                inline: true
                                            },
                                            {
                                                name: 'Resources',
                                                value: `${serverAPI.resources.length}`,
                                                inline: true
                                            },
                                            {
                                                name: 'Tags',
                                                value: `${serverAPI.vars.tags ? serverAPI.vars.tags : 'None'}`,
                                                inline: true
                                            },
                                            {
                                                name: 'txAdmin Version',
                                                value: `${serverAPI.vars["txAdmin-version"] ? serverAPI.vars["txAdmin-version"] : 'None'}`,
                                                inline: true
                                            }
                                        ]
                                    })
                                ]
                            })
                        }

                            break;

                        case 'p_count': {

                            if (!server.success) interaction.reply({ content: `${server.error}`, ephemeral: false });

                            let s_api2 = await s_api.getServerInfo();
                            let players = await s_api.getPlayerCount();

                            return interaction.reply({
                                embeds: [
                                    new client.Embeds({
                                        title: `${s_api2.vars.sv_projectName ? s_api2.vars.sv_projectName : s_api2.vars.sv_hostname} Player Count`,
                                        description: `${s_api2.vars.sv_projectDesc ? s_api2.vars.sv_projectDesc : 'No description provided.'}`,
                                        color: client.config.EmbedColor,
                                        fields: [
                                            {
                                                name: 'Players',
                                                value: `${players}`,
                                                inline: true
                                            },
                                            {
                                                name: 'Max Players',
                                                value: `${s_api2.vars.sv_maxClients}`,
                                                inline: true
                                            }
                                        ]
                                    })
                                ]
                            })
                        }
                    }
                }
            }

                break;

            case 'redm': {

                interaction.reply({
                    embeds: [
                        new client.Embeds({
                            title: 'RedM Stats',
                            description: 'RedM stats are not yet supported.',
                            color: client.config.EmbedColor
                        })
                    ]
                })
            }

                break;

            default: {

                interaction.reply({ content: 'That game is not supported.', ephemeral: true });
            }
        }
    }
}

export default Stats;