import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { SubCommandOptions } from '../../types/base.interface';
import type Citizen from '../../client/Citizen';
import { SlashBase } from '../../utils/CommandBase';
import { ServerManager } from '../../managers';
import { formatWithOptions } from 'util';

class FiveMBase extends SlashBase {

  constructor() {
    super({
      name: 'servers',
      description: 'Base command used to view, add, manage or interact with your server(s).',
      usage: '/fivem <add/remove/list/view/stats>',
      example: '/fivem add <ip> <port> <name>',
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
              choices: [
                {
                  name: 'explain',
                  value: 'explain'
                },
                {
                  name: 'add',
                  value: 'add'
                },
                {
                  name: 'remove',
                  value: 'remove'
                },
                {
                  name: 'list',
                  value: 'list'
                },
                {
                  name: 'view',
                  value: 'view'
                }
              ]
            }
          ]
        },
        {
          name: 'add',
          usage: '/servers add <ip> <port> <name> <type>',
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
              description: 'The port of the FiveM Server (look in server.cfg).',
              required: true,
              type: SubCommandOptions.Integer
            },
            {
              name: 'name',
              description: 'The name of the FiveM Server.',
              required: true,
              type: SubCommandOptions.String
            },
            {
              name: 'type',
              description: 'The type of server (fivem, redm)',
              required: true,
              type: SubCommandOptions.String,
              choices: [
                {
                  name: 'FiveM',
                  value: 'fivem'
                },
                {
                  name: 'RedM',
                  value: 'redm'
                }
              ]
            }
          ],
          type: SubCommandOptions.SubCommand
        },
        {
          name: 'remove',
          usage: '/servers remove <id>',
          example: '/servers remove 123456789',
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
          name: 'list',
          usage: '/servers list',
          example: '/servers list',
          description: 'List all FiveM Servers in your account.',
          type: SubCommandOptions.SubCommand
        },
        {
          name: 'view',
          usage: '/servers view <id>',
          example: '/servers view 123456789',
          description: 'View a FiveM Server in your account.',
          options: [
            {
              name: 'id',
              description: 'The ID of the FiveM Server.',
              required: true,
              type: SubCommandOptions.String
            },
            {
              name: 'encryption',
              description: 'Do you want to view the decrypted ip? (owner only)',
              required: true,
              type: SubCommandOptions.Boolean,
            }
          ],
          type: SubCommandOptions.SubCommand
        }
      ]
    });
  }

  public async execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

    const serverManager = await new ServerManager(client);

    switch (interaction.options.getSubcommand()) {

      /**
       * HELP PORTION OF THE COMMAND
       */
      case 'help': {
        const command = interaction.options.getString('command');

        switch (command) {
          case 'explain': {
            return interaction.reply({
              embeds: [
                new client.Embeds({
                  title: 'Servers: explanation',
                  description: 'Information regarding our servers command its usage and how it works.',
                  fields: [
                    {
                      name: 'Server IP\'s',
                      value: 'For security purposes we encrypt your server IP at the first moment it is stored in our database.',
                      inline: false
                    },
                    {
                      name: 'Server ID\'s',
                      value: 'Server ID\'s are a randomly generated string of characters which are used to identify your server, these ID\'s are unique and cannot be changed.',
                      inline: false
                    },
                    {
                      name: 'Server Types',
                      value: 'Currently we only support FiveM but are looking to add support for RedM and possibly even Minecraft in the near future.',
                      inline: false
                    },
                    {
                      name: 'Server Permissions',
                      value: 'Server permissions are used to allow other users to interact with your server, these permissions can be granted to users by the server owner. The owner is assigned when the server is added to/created in your account.',
                      inline: false
                    }
                  ]
                })
              ]
            })
          }
        }
      }

        break;

      /**
       * BASE PORTION OF THE COMMAND  
       */
      case 'add': {
        const ip = interaction.options.getString('ip');
        const port = interaction.options.getInteger('port');
        const name = interaction.options.getString('name');
        const type = interaction.options.getString('type') as string;

        const id = await client.utils.generateID();

        const check = await serverManager.doesServerExist({ id: id })

        if (check.exists) return interaction.reply({
          content: 'Server already exists.',
          ephemeral: true
        });

        const db = await serverManager.addServer({
          id: id,
          ip: ip as string,
          port: port as number,
          name: name as string,
          user: interaction.user.id,
          type: type as 'fivem' | 'redm',
          guild: interaction?.guild?.id as string
        })

        if (!db.success) return interaction.reply({
          content: db.error as string,
          ephemeral: false
        });

        return interaction.reply({
          ephemeral: false,
          embeds: [
            new client.Embeds({
              title: 'Server Added',
              description: `Your server has been added to your account, please note that your server ip has been encrypted in our database for security reasons however the server owner will be able to decrypt it on request. Due to this encryption all server interactions will be handled using the ID listed below.`,
              fields: [
                {
                  name: 'Server ID',
                  value: db.data.id,
                  inline: true
                },
                {
                  name: 'Server Name',
                  value: db.data.name,
                  inline: true
                },
                {
                  name: 'Server Type',
                  value: db.data.type,
                  inline: true
                }
              ]
            })
          ]
        })
      }

      case 'view': {
        const id = interaction.options.getString('id');
        const method = interaction.options.getBoolean('encryption');

        const db = await serverManager.getServer({
          id: id as string,
          user: interaction.user.id
        });

        if (!db.success) return interaction.reply({
          content: db.error as string,
          ephemeral: true
        });

        return interaction.reply({
          ephemeral: method && db?.perms?.owner ? true : false,
          embeds: [
            new client.Embeds({
              title: 'Server Details',
              description: `Here are the details for the server you requested.`,
              fields: [
                {
                  name: 'Server ID',
                  value: db.data.id,
                  inline: true
                },
                {
                  name: 'Server IP',
                  value: method && db?.perms?.owner ? client.utils.removeObfuscation(db.data.ip) : client.utils.spliceEncyptedIP(db.data.ip),
                  inline: true
                },
                {
                  name: 'Server Port',
                  value: `${db.data.port}`,
                  inline: true
                },
                {
                  name: 'Server Name',
                  value: db.data.name,
                  inline: true
                },
                {
                  name: 'Server Type',
                  value: db.data.type,
                  inline: true
                },
                {
                  name: 'Created At',
                  value: client.utils.formatDate(db.data.created),
                  inline: true
                }
              ]
            })
          ]
        })
      }

      case 'remove': {
        const id = interaction.options.getString('id');

        const db = await serverManager.deleteServer({
          id: id as string,
          user: interaction.user.id
        });

        if (!db.success) return interaction.reply({
          content: db.error as string,
          ephemeral: true
        })

        return interaction.reply({
          content: 'Server has been removed.',
          ephemeral: false
        });
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