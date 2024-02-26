import { GuildMember } from 'discord.js';
import { UserModel } from '../../models/user.model';
import type { CacheType, Interaction } from 'discord.js';
import EventBase from '../../utils/EventBase';
import type Citizen from '../Citizen';

class GuildMemberAdd extends EventBase {
    constructor() {
        super({ name: 'guildMemberAdd' });
    }

    /**
     * Execute event
     * @param client 
     * @param interaction 
     */
    public async execute(client: Citizen, member: GuildMember): Promise<any> {

        let userData = await UserModel.findOne({ id: member.id });

        if (!userData) await new UserModel({
            id: member.id,
            blacklist: false,
        }).save().catch((err: any) => client.logger.error(err.stack));

        return console.log(`[GUILD] ${member.user.username} (${member.id}) has been added to the database.`)
    }
}

export default GuildMemberAdd;
