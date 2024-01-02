import { REST, Routes, ApplicationCommand } from 'discord.js';
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

  public async getCommandID(name: String): Promise<string> {
    try {
      this.logger.info(`Getting command ID for: "${name}"`)

      if (!this.client.user?.id) throw new Error('Client user was not resolved while getting command ID.');

      const commands = await this.DiscordRest.get(Routes.applicationCommands(this.client.user.id)) as ApplicationCommand[];
      const command = commands.find((command: ApplicationCommand) => command.name === name);

      if (!command) throw new Error(`Command "${name}" was not found.`);

      return command?.id;
    } catch (err: any) {
      this.logger.error(`Error while getting command ID: ${err}`);
      throw new Error(err.stack);
    }
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

  public async refreshSlashCommand(name: string): Promise<void> {
    try {
      this.logger.info(`Refreshing slash command: "${name}"`);

      if (!this.client.user?.id) throw new Error('Client user was not resolved while refreshing slash command.');
      const commandId = await this.getCommandID(name);

      await this.DiscordRest.patch(Routes.applicationCommand(this.client.user.id, commandId), {
        body: this.client.commands.get(name)?.props
      });

      this.logger.ready(`Slash command "${name}" was refreshed!`);
    } catch (e: unknown) {
      this.logger.error(`Error while refreshing slash command: ${e}`);
    }
  }
}

export default RestManager;
