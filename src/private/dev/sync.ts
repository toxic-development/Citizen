import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import type Citizen from '../../client/Citizen';
import config from '../../config/config';
import { SlashBase } from '../../utils/CommandBase';

class Sync extends SlashBase {
    constructor() {
        super({
            name: 'sync',
            description: 'Sync/Update a command.',
            category: 'Dev',
            cooldown: 5,
            ownerOnly: true,
            userPermissions: [],
            clientPermissions: [],
            options: [
                {
                    name: 'command',
                    description: 'The command to sync.',
                    type: 3,
                    required: true
                }
            ]
        });
    }

    public async execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

        const cmd = await interaction.options.getString('command');

        if (!client.commands.get(cmd as string)) return interaction.reply({
            embeds: [
                new client.Embeds({
                    title: 'Error',
                    description: `Command not found: ${cmd}`,
                    color: config.errorColor
                })
            ]
        });

        try {

            await client.restApi.refreshSlashCommand(cmd as string);

            return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: 'Success',
                        description: `Command updated: ${cmd}`,
                        color: config.mainColor
                    })
                ]
            })


        } catch (err: any) {

            client.logger.error(err.stack);

            return interaction.reply({
                embeds: [
                    new client.Embeds({
                        title: 'Error',
                        description: `Error while updating command: ${err.message}`,
                        color: config.errorColor
                    })
                ]
            });
        }
    }
}

export default Sync;