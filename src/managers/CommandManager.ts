import { readdirSync } from 'node:fs';
import { join, sep } from 'node:path';
import type { ICommand, ISlashCommand } from '../types/utils.interface';
import type Citizen from '../client/Citizen';
import { Collection } from 'discord.js';

class CommandManager {
  public client: Citizen;
  private commands: Collection<string, ISlashCommand> = new Collection();

  constructor(client: Citizen) {
    this.client = client;
  }

  /**
   * Get command instance
   * @param name Command name
   */
  public get(name: string): ISlashCommand | undefined {
    return this.commands.get(name);
  }

  /**
   * Get commands by category
   */
  public category(category: string): Collection<string, ISlashCommand> {
    return this.commands.filter((cmd: ISlashCommand) => cmd.props.category === category);
  }

  /**
   * Get all registered commands
   */
  public get all(): Collection<string, ISlashCommand> {
    return this.commands;
  }

  /**
   * Load all commands from directory
   */
  public load(dir: string): void {
    readdirSync(dir).forEach(async (subDir: string): Promise<void> => {
      const commands = readdirSync(`${dir}${sep}${subDir}${sep}`);

      for (const file of commands) {
        const commandInstance = await import(join(dir, subDir, file));
        const command: ISlashCommand = new commandInstance.default;

        if (command.props.name && typeof (command.props.name) === 'string') {
          if (this.commands.get(command.props.name)) return this.client.logger.error(`Two or more commands have the same name ${command.props.name}`);
          this.commands.set(command.props.name, command);
        }
      }
    });
  }
}

export default CommandManager;
