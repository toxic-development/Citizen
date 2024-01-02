import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import type Citizen from '../../client/Citizen';
import config from '../../config/config';
import { SlashBase } from '../../utils/CommandBase';

class Ping extends SlashBase {
  constructor() {
    super({
      name: 'ping',
      description: 'Get the bots latency and ping.',
      usage: '/ping',
      example: '/ping',
      category: 'General',
      cooldown: 5,
      ownerOnly: false,
      userPermissions: [],
      clientPermissions: [],
    });
  }

  public execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): any {

    return interaction.reply({
      embeds: [
        new client.Embeds({
          title: '🏓 Pong!',
          color: config.EmbedColor,
          description: `**Gateway Ping:** ${client.ws.ping}ms\n**REST Ping:** ${Date.now() - interaction.createdTimestamp}ms`,
        })
      ]
    });
  }
}

export default Ping;