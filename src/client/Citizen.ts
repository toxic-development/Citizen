import { Client, ClientOptions, EmbedBuilder, Collection } from 'discord.js';
import { join } from 'node:path';
import Config from '../config/config';
import { CitizenEmbed } from '../utils/EmbedBuilder';
import { CitizenUtilities } from '../utils/Citizen';
import { ServerManager, GateManager, DatabaseManager } from '../managers';
import { NativeManager } from '../managers/NativeManager';
import type { IConfig } from '../types/utils.interface';
import PrivateManager from '../managers/PrivateManager';
import CommandManager from '../managers/CommandManager';
import EventManager from '../managers/EventManager';
import RestManager from '../managers/RestManager';
import Logger from '../utils/Logger';

class Citizen extends Client {
  public logger: Logger = new Logger('Client');
  public cooldowns = new Collection<string, Collection<string, number>>();
  public guildcmds: PrivateManager = new PrivateManager(this);
  public commands: CommandManager = new CommandManager(this);
  public serverManager: ServerManager = new ServerManager(this);
  public utils: CitizenUtilities = new CitizenUtilities(this);
  public db: DatabaseManager = new DatabaseManager(this);
  public events: EventManager = new EventManager(this);
  public natives: NativeManager = new NativeManager();
  public restApi: RestManager = new RestManager(this);
  public gate: GateManager = new GateManager(this);
  public Embeds: any = CitizenEmbed
  public config: IConfig = Config;

  constructor(options: ClientOptions) {
    super(options);
    this.init();
  }

  public async authenticate(token: string): Promise<void> {
    try {
      this.logger.info(`Initializing client with token ${token.substring(0, 5)}.****`);
      await this.login(token);
    } catch (e: unknown) {
      this.logger.error(`Error while initializing client: ${e}`);
    }
  }

  private init(): void {
    this.guildcmds.load(join(__dirname, '../private/'));
    this.commands.load(join(__dirname, '../commands/'));
    this.events.load(join(__dirname, './events/'));
  }
}

export default Citizen;
