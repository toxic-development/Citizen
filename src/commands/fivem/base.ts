import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { SubCommandOptions } from '../../types/base.interface';
import type Citizen from '../../client/Citizen';
import { SlashBase } from '../../utils/CommandBase';
import { FiveMServerModel } from '../../models/fivem';
import { FiveMServer } from '../../types/db.interface';

class FiveMBase extends SlashBase {
  constructor() {
    super({
      name: 'fivem',
      description: 'Base command used to view, add, manage or interact with your FiveM Server(s).',
      usage: '/fivem <add/remove/list/view/stats>',
      example : '/fivem add <ip> <port> <name>',
      category: 'FiveM',
      cooldown: 5,
      ownerOnly: false,
      userPermissions: [],
      clientPermissions: [],
      options: [
        {
          name: 'add',
          usage: '/fivem add <ip> <port> <name>',
          example: '/fivem add 127.0.0.1 30120 My Server',
          description: 'Add a FiveM Server to your account.',
          options: [
            {
              name: 'ip',
              description: 'The IP address of the FiveM Server.',
              required: true,
              type: SubCommandOptions.String
            },
            {
              name: 'port',
              description: 'The port of the FiveM Server (usually 30120).',
              required: true,
              type: SubCommandOptions.Integer
            },
            {
              name: 'name',
              description: 'The name of the FiveM Server.',
              required: true,
              type: SubCommandOptions.String
            }
          ],
          type: SubCommandOptions.SubCommand
        },
        {
          name: 'remove',
          usage: '/fivem remove <id>',
          example: '/fivem remove 123456789',
          description: 'Remove a FiveM Server from your account.',
          options: [
            {
              name: 'id',
              description: 'The ID of the FiveM Server.',
              required: true,
              type: SubCommandOptions.String
            }
          ],
          type: SubCommandOptions.SubCommand
        },
        {
          name: 'view',
          usage: '/fivem view <id>',
          example: '/fivem view 123456789',
          description: 'View a FiveM Server from your account.',
          options: [
            {
              name: 'id',
              description: 'The ID of the FiveM Server.',
              required: true,
              type: SubCommandOptions.String
            }
          ],
          type: SubCommandOptions.SubCommand
        },
        {
          name: 'list',
          usage: '/fivem list',
          example: '/fivem list',
          description: 'List all the fivem servers registered to your account.',
          type: SubCommandOptions.SubCommand
        }
      ]
    });
  }

  public async execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

    switch (interaction.options.getSubcommand()) {

      case 'add': {

        const ip = interaction.options.getString('ip', true);
        const port = interaction.options.getInteger('port', true);
        const name = interaction.options.getString('name', true);

        const db = await client.db.addFiveMServer({ id: client.utils.generateID(), ip: ip, port: port, name: name, owner: interaction.user.id, guild: interaction?.guild?.id });
        if (!db.success) interaction.reply({ content: `${db.error}`, ephemeral: true });

        interaction.reply({
          ephemeral: true,
          embeds: [
            new client.Embeds({
              title: 'Success: server registered.',
              color: client.config.EmbedColor,
              description: 'Your FiveM Server has been registered to your account. Make sure you keep a copy of the ID below, as you will need it to manage your server.',
              fields: [
                {
                  name: 'ID',
                  value: `${db.data.id}`,
                  inline: true
                },
                {
                  name: 'IP',
                  value: `${client.utils.obfuscateIP(db.data.ip)}`,
                  inline: true
                },
                {
                  name: 'Port',
                  value: `${db.data.port}`,
                  inline: true
                },
                {
                  name: 'Name',
                  value: `${db.data.name}`,
                  inline: true
                },
                {
                  name: 'Guild',
                  value: `${db.data.guild}`,
                  inline: true
                }
              ]
            })
          ]
        })
      }

      break;

      case 'remove': {

        const id = interaction.options.getString('id', true);

        const db = await client.db.removeFiveMServer({ id: id, owner: interaction.user.id });

        if (!db.success) return interaction.reply({ content: `${db.error}`, ephemeral: false });

        interaction.reply({
          embeds: [
            new client.Embeds({
              title: 'Success: server removed.',
              color: client.config.EmbedColor,
              description: 'Your FiveM Server has been removed from your account.'
            })
          ]
        })
      }

      break;

      case 'view': {

        const id = interaction.options.getString('id', true);

        const db = await client.db.getFiveMServer({ id: id, owner: interaction.user.id });

        if (!db.success) interaction.reply({ content: `${db.error}`, ephemeral: true });

        interaction.reply({
          embeds: [
            new client.Embeds({
              title: 'Success: server found.',
              color: client.config.EmbedColor,
              description: 'Your FiveM Server has been found.',
              fields: [
                {
                  name: 'ID',
                  value: `${db.data.id}`,
                  inline: true
                },
                {
                  name: 'IP',
                  value: `${client.utils.obfuscateIP(db.data.ip)}`,
                  inline: true
                },
                {
                  name: 'Port',
                  value: `${db.data.port}`,
                  inline: true
                },
                {
                  name: 'Name',
                  value: `${db.data.name}`,
                  inline: true
                },
                {
                  name: 'Guild',
                  value: `${db.data.guild}`,
                  inline: true
                }
              ]
            })
          ]
        })
      }

      break;

      case 'list': {

        const db = await client.db.getUserFiveMServers({ owner: interaction.user.id });

        if (!db.success) interaction.reply({ content: `${db.error}`, ephemeral: true });

        const serversArray: FiveMServer[] = [];

        await db.data.map(async (s: FiveMServer) => {
          
          let date = client.utils.formatDate(s?.created);

          serversArray.push({
            id: s?.id,
            ip: s?.ip,
            port: s?.port,
            name: s?.name,
            owner: s?.owner,
            guild: s?.guild,
            created: date
          })
        })

        const fields = await serversArray.map((s: any) => {
          return {
            name: s.name,
            value: `ID: ${s.id}\nIP: ${client.utils.obfuscateIP(s.ip)}\nPort: ${s.port}\nCreated: ${s.created}\nGuild: ${s.guild}`,
            inline: true
          }
        })

        interaction.reply({
          embeds: [
            new client.Embeds({
              title: 'Success: servers found.',
              color: client.config.EmbedColor,
              description: 'Here are all the FiveM Servers registered to your account.',
              fields: [...fields]
            })
          ]
        })
      }

      break;

      default: {
        interaction.reply({
          content: 'No valid subcommand was provided.',
          ephemeral: true
        });
      }
    }
  }
}

export default FiveMBase;