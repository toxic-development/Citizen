import { Guild } from 'discord.js';
import { GuildModel } from '../../models/guild.model';
import { CmdModel } from '../../models/cmd.model';
import type { CacheType, Interaction } from 'discord.js';
import EventBase from '../../utils/EventBase';
import type Citizen from '../Citizen';

class GuildCreate extends EventBase {
    constructor() {
        super({ name: 'guildCreate' });
    }

    /**
     * Execute event
     * @param client 
     * @param interaction 
     */
    public async execute(client: Citizen, guild: Guild): Promise<any> {

        let guildData = await GuildModel.findOne({ id: guild.id });
        let cmdData = await CmdModel.findOne({ id: guild.id });

        if (guildData?.blacklist) return guild.leave();

        if (!guildData) await new GuildModel({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL(),
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

        if (!cmdData) await new CmdModel({
            guild: guild.id,
            fivem: true,
            redm: false,
            forums: true
        }).save().catch((err: any) => client.logger.error(err.stack));

        return console.log(`[GUILD] ${guild.name} (${guild.id}) has been added to the database.`)
    }
}

export default GuildCreate;
