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
      example: '/fivem add <ip> <port> <name>',
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
              description: 'The port of the FiveM Server.',
              required: true,
              type: SubCommandOptions.Integer
            },
            {
              name: 'name',
              description: 'The name of the FiveM Server (look in server.cfg).',
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
            },
            {
              name: 'encrypted',
              description: 'IPs in our DB are encrypted do you want to reverse this?',
              required: true,
              type: SubCommandOptions.Boolean
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
        },
        {
          name: 'rcon',
          usage: '/fivem rcon <id> <pass> <command>',
          example: '/fivem rcon 123456789 password status',
          description: 'Send an RCON command to your FiveM Server.',
          options: [
            {
              name: 'id',
              description: 'The ID of the FiveM Server.',
              required: true,
              type: SubCommandOptions.String
            },
            {
              name: 'pass',
              description: 'The RCON password of the FiveM Server.',
              required: true,
              type: SubCommandOptions.String
            },
            {
              name: 'command',
              description: 'The RCON command you want to send.',
              required: true,
              type: SubCommandOptions.String
            }
          ],
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

        const db = await client.db.addFiveMServer({
          ip: ip,
          port: port,
          name: name,
          owner: interaction.user.id,
          guild: interaction?.guild?.id
        });

        if (!db.success) return interaction.reply({ content: `${db.error}`, ephemeral: true });

        interaction.reply({
          ephemeral: false,
          embeds: [
            new client.Embeds({
              title: 'Success: server added.',
              color: client.config.EmbedColor,
              description: 'Your FiveM Server has been added to your account.',
              fields: [
                {
                  name: 'ID',
                  value: `${db.data.id}`,
                  inline: true
                },
                {
                  name: 'IP (AES Encrypted)',
                  value: `${db.data.ip}`,
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
                },
                {
                  name: 'Permissions',
                  value: 'Owner',
                  inline: true
                }
              ]
            })
          ]
        })
      }

        break;

      case 'view': {

        const id = interaction.options.getString('id', true);
        const decrypt = interaction.options.getBoolean('encrypted')

        const db = await client.db.getFiveMServer({
          id: id,
          owner: interaction.user.id
        });

        if (!db.success) return interaction.reply({ content: `${db.error}`, ephemeral: true });

        if (decrypt && !db.perms?.owner) {

          return interaction.reply({
            ephemeral: true,
            content: `${interaction.user.tag} we noticed you wanted to decrypt the IP but only the server owner can execute this action and you are not the owner.`,
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
                    name: 'IP (AES Encrypted)',
                    value: `${db.data.ip}`,
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

        } else if (decrypt && db.perms?.owner) {

          return interaction.reply({
            ephemeral: true,
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
                    name: 'IP (Decrypted)',
                    value: `${client.utils.removeObfuscation(db.data.ip)}`,
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

        } else {

          return interaction.reply({
            ephemeral: false,
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
                    name: 'IP (AES Encrypted)',
                    value: `${db.data.ip}`,
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
      }

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