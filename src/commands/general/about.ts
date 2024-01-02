import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import type Citizen from '../../client/Citizen';
import config from '../../config/config';
import { SlashBase } from '../../utils/CommandBase';
import { version } from '../../../package.json';

class About extends SlashBase {
  constructor() {
    super({
      name: 'about',
      description: 'Some information about the bot',
      usage: '/about',
      example: '/about',
      category: 'General',
      cooldown: 5,
      ownerOnly: false,
      userPermissions: [],
      clientPermissions: [],
    });
  }

  public async execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): Promise<any> {

    const uptime = await client.utils.formatUptime(client.uptime);

    return interaction.reply({
      embeds: [
        new client.Embeds({
          title: 'About Me',
          description: `Citizen, the FiveM and RedM bot you need. Offering a wide array of features to ensure your community is safe and engaged at all times. Including but not limited to : Server Statistics, Player Count, Management Abilities, and Command Usage.`,
          color: config.EmbedColor,
          fields: [
            {
              name: 'Version',
              value: `v${version}`,
              inline: true
            },
            {
              name: 'Discord.js',
              value: `v${require('discord.js').version}`,
              inline: true
            },
            {
              name: 'Node.js',
              value: `${process.version}`,
              inline: true
            },
            {
              name: 'Uptime',
              value: `**Days:** ${uptime.days}\n**Hours:** ${uptime.hours}\n**Minutes:** ${uptime.minutes}\n**Seconds:** ${uptime.seconds}`,
              inline: true
            },
            {
              name: 'Memory Usage',
              value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
              inline: true
            },
            {
              name: 'CPU Usage',
              value: `${(process.cpuUsage().system / 1024 / 1024).toFixed(2)}%`,
              inline: true
            },
            {
              name: 'User Count',
              value: `Total: ${client.users.cache.size}`,
              inline: true
            },
            {
              name: 'Channel Count',
              value: `Total: ${client.channels.cache.size}`,
              inline: true
            },
            {
              name: 'Server Count',
              value: `Total: ${client.guilds.cache.size}`,
              inline: true
            }
          ]
        })
      ]
    });
  }
}

export default About;