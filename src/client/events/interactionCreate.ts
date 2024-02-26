import { Collection, ApplicationCommandOptionType } from 'discord.js';
import { GuildModel } from '../../models/guild.model';
import { CmdModel } from '../../models/cmd.model';
import type { CacheType, Interaction } from 'discord.js';
import EventBase from '../../utils/EventBase';
import type Citizen from '../Citizen';

class InteractionCreate extends EventBase {
  constructor() {
    super({ name: 'interactionCreate' });
  }

  /**
   * Execute event
   * @param client 
   * @param interaction 
   */
  public async execute(client: Citizen, interaction: Interaction<CacheType>): Promise<any> {
    if (interaction.isCommand()) {

      const command = client.commands.get(interaction.commandName);
      const guildcmds = client.guildcmds.get(interaction.commandName);

      let db: any = await GuildModel.findOne({ id: interaction?.guild?.id });
      let cmddb: any = await CmdModel.findOne({ guild: interaction?.guild?.id });

      if (db?.blacklist) {

        await interaction.reply({
          content: 'Whoops, this server is blacklisted from using my services, you should probably contact our [support team](https://toxicdevs.site/discord).',
          ephemeral: true
        });

        if (interaction?.guild?.id !== '871440804638519337') interaction.guild?.leave();
      }

      if (!db) db = await new GuildModel({
        id: interaction?.guild?.id,
        name: interaction?.guild?.name,
        icon: interaction?.guild?.iconURL(),
        blacklist: false,
        beta: false,
        role: 'none',
        channels: {
          forums: 'none',
          fivem: 'none',
          redm: 'none',
          logs: 'none'
        },
        settings: {
          allow_Forums: false,
          allow_FiveM: false,
          allow_RedM: false,
          allow_Beta: false,
          allow_Logs: false,
          ownerOnly: false
        }
      }).save().catch((err: any) => client.logger.error(err.stack));

      if (!cmddb) cmddb = await new CmdModel({
        guild: interaction?.guild?.id,
        fivem: true,
        redm: false,
        forums: true
      }).save().catch((err: any) => client.logger.error(err.stack));

      const cmd = command || guildcmds;

      if (!cmd) return;

      if (cmd.props.name === 'forums' && !cmddb?.forums) return interaction.reply({
        content: 'Whoops, looks like our forums commands have been disabled by the server owner or an administrator.',
        ephemeral: true
      });

      if (cmd.props.name === 'fivem' && !cmddb?.fivem) return interaction.reply({
        content: 'Whoops, looks like our FiveM commands have been disabled by the server owner or an administrator.',
        ephemeral: true
      });

      if (cmd.props.ownerOnly && interaction.member?.user.id !== client.config.OwnerID) return;

      if (cmd.props.cooldown) {
        if (!client.cooldowns.has(cmd.props.name)) {
          client.cooldowns.set(cmd.props.name, new Collection());
        }

        const now = Date.now();

        const timestamps = client.cooldowns.get(cmd.props.name);
        const cooldownAmount = cmd.props.cooldown * 1000;

        if (timestamps?.has(interaction.user.id)) {
          const cooldown = timestamps.get(interaction.user.id);

          if (cooldown) {
            const expirationTime = cooldown + cooldownAmount;

            if (now < expirationTime) {
              const timeLeft = (expirationTime - now) / 1000;
              return interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.props.name}\` command.`, ephemeral: true });
            }
          }
        }

        timestamps?.set(interaction.user.id, now);
        setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);
      }

      const args: any = [];

      for (let option of interaction.options.data) {
        if (option.type === ApplicationCommandOptionType.Subcommand) {
          if (option.name) args.push(option.name);
          option.options?.forEach((x) => {
            if (x.value) args.push(x.value);
          });
        } else if (option.value) args.push(option.value);
      }

      try {

        cmd.execute(client, interaction, args)

      } catch (err: any) {
        client.logger.error(`Error while executing command ${cmd.props.name}: ${err.stack}`);
        interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  }
}

export default InteractionCreate;
