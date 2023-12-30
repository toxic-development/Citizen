import { REST, Routes } from 'discord.js';
import type Citizen from '../client/Citizen';
import config from '../config/config';
import type { ICommand, ISlashCommand } from '../types/utils.interface';
import Logger from '../utils/Logger';

class RestManager {
  public client: Citizen;
  private logger: Logger = new Logger('Rest');
  private DiscordRest = new REST({ version: config.restVersion });

  constructor(client: Citizen) {
    this.client = client;

    this.DiscordRest.setToken(process.env.CLIENT_TOKEN as string);
  }

  /**
   * Register slash commands against the Discord API
   */
  public async registerSlashCommands(): Promise<void> {
    try {
      this.logger.info('Initializing application commands.');

      if (!this.client.user?.id) throw new Error('Client user was not resolved while initializing application commands.');
      await this.DiscordRest.put(Routes.applicationCommands(this.client.user.id), {
        body: this.client.commands.all.map((command: ISlashCommand) => command.props)
      });

      this.logger.ready(`${this.client.commands.all.size} application commands are registered!`);
    } catch (e: unknown) {
      this.logger.error(`Error while registering slash commands: ${e}`);
    }
  }

  public async registerGuildCommands(guildId: string): Promise<void> {
    try {
      this.logger.info('Initializing guild commands.');

      if (!this.client.user?.id) throw new Error('Client user was not resolved while initializing guild commands.');
      if (!guildId) throw new Error('Guild ID was not resolved while initializing guild commands.');

      await this.DiscordRest.put(Routes.applicationGuildCommands(this.client.user.id, guildId), {
        body: this.client.guildcmds.all.map((command: ISlashCommand) => command.props)
      });

      this.logger.ready(`${this.client.guildcmds.all.size} guild commands are registered!`);
    } catch (e: unknown) {
      this.logger.error(`Error while registering guild commands: ${e}`);
    }
  }
}

export default RestManager;
