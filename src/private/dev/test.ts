import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import type Citizen from '../../client/Citizen';
import config from '../../config/config';
import { SlashBase } from '../../utils/CommandBase';

class Test extends SlashBase {
  constructor() {
    super({
      name: 'test',
      description: 'test command',
      category: 'dev',
      cooldown: 5,
      ownerOnly: true,
      userPermissions: [],
      clientPermissions: [],
      options: [
        {
          name: 'test',
          description: 'test',
          type: 3,
          required: true
        }
      ]
    });
  }

  public execute(client: Citizen, interaction: ChatInputCommandInteraction<CacheType>): any {

    return interaction.reply({
      embeds: [{
        color: config.mainColor,
        title: 'Test Command',
        description: `This is a test command: ${interaction.options.getString('test')}`,
        thumbnail: {
          url: config.ClientLogo
        },
        footer: {
            text: config.FooterText,
            icon_url: config.ClientLogo
        }
      }]
    });
  }
}

export default Test;