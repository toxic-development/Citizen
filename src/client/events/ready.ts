import { ActivityType } from 'discord.js';
import EventBase from '../../utils/EventBase';
import type Citizen from '../Citizen';

class Ready extends EventBase {
  constructor() {
    super({ name: 'ready', once: true });
  }

  /**
   * Execute event
   * @param client
   */
  public async execute(client: Citizen): Promise<void> {
    client.restApi.registerSlashCommands();
    client.restApi.registerGuildCommands(client.config.GuildID);

    await client.db.connect()

    client.logger.info(`${client.user?.tag} is online!`);

    client?.user?.setStatus('dnd');

    client?.user?.setActivity({
      name: 'Under active development!',
      type: ActivityType.Custom
    })
  }
}

export default Ready;
