import { Collection, ApplicationCommandOptionType } from 'discord.js';
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
  public execute(client: Citizen, interaction: Interaction<CacheType>): any {
    if (interaction.isCommand()) {
      
      const command = client.commands.get(interaction.commandName);
      const guildcmds = client.guildcmds.get(interaction.commandName);

      const cmd = command || guildcmds;

      if (!cmd) return;

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

          if(cooldown) {
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
