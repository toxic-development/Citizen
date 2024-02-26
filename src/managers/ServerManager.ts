import mongo, { Document } from 'mongoose';
import Citizen from '../client/Citizen';
import { FiveMServer, DatabaseResponse } from '../types/db.interface';
import * as Models from '../models/models';

export class ServerManager {

    public client: Citizen;
    private models = Models;

    constructor(client: Citizen) {
        this.client = client;
    }

    public async doesServerExist({ id, user }: FiveMServer): Promise<DatabaseResponse> {

        let db = await this.getServer({ id: id, user: user });

        if (!db.success) return {
            exists: false,
            error: db.error
        }

        return {
            exists: true,
        }
    }

    public async getServer({ id, user }: FiveMServer): Promise<DatabaseResponse> {

        const db = await this.models.ServerModel.findOne({ id: id });

        const gate = await this.client.gate.verifyPermsForAction({
            user: user as string,
            server: id as string,
            action: 'view'
        })

        if (!db) return {
            success: false,
            error: 'Server does not exist you can add it using the `/servers add` command.'
        }

        if (!gate.success) return {
            success: false,
            error: gate.error
        }

        return {
            success: true,
            data: db,
            perms: gate.perms
        }
    }

    public async addServer({ id, ip, port, name, user, type, guild }: FiveMServer): Promise<DatabaseResponse> {

        const check = await this.doesServerExist({ id: id });

        let message;

        if (check.exists) return {
            success: false,
            error: 'Server already exists.'
        }

        if (type === 'redm') return {
            success: false,
            error: 'RedM is not supported yet, join our [Discord Server](<https://toxicdevs.site/discord>) for access to our release announcement.'
        }

        if (type !== 'fivem' && type !== 'redm') return {
            success: false,
            error: 'Invalid server type.'
        }

        const db = new this.models.ServerModel({
            id: id,
            ip: this.client.utils.obfuscateIP(ip as string),
            port: port,
            name: name,
            type: type,
            guild: guild,
        });
        await db.save().catch(async (e: Error) => {
            console.log(e.stack)
            if (e.message.includes('duplicate key error')) message = `Error: duplicate key found, double check the provided port and try again or contact our [support team](<https://toxicdevs.site/discord>).`
            else if (e.message.includes('validation failed')) message = `Error: missing required database field, please forward this issue to our [support team](<https://toxicdevs.site/discord>).`
            else message = 'Unable to add server to the database, if this issues persists please contact [support](<https://toxicdevs.site/discord>).'
        })

        const u = await this.models.UserModel.findOne({ id: user });

        if (u) await this.models.UserModel.updateOne({ id: user }, {
            $push: {
                servers: {
                    id: id,
                    type: type,
                    perms: ['owner']
                }
            }
        }).catch(async (e: Error) => {
            console.log(e.stack)
            if (e.message.includes('validation failed')) message = `Error: missing required database field, please forward this issue to our [support team](<https://toxicdevs.site/discord>).`
            else message = 'Unable to add server to your user data, if this issues persists please contact [support](<https://toxicdevs.site/discord>).'
        })

        if (!u) await new this.models.UserModel({
            id: user,
            servers: [{
                id: id,
                type: type,
                perms: ['owner']
            }]
        }).save().catch((e: Error) => {
            console.log(e.stack)
            if (e.message.includes('validation failed')) message = `Error: missing required database field, please forward this issue to our [support team](<https://toxicdevs.site/discord>).`
            else message = 'Unable to add server to your user data, if this issues persists please contact [support](<https://toxicdevs.site/discord>).'
        });

        if (message) return {
            success: false,
            error: message
        }

        return {
            success: true,
            data: db
        }
    }

    public async deleteServer({ id, user }: FiveMServer): Promise<DatabaseResponse> {

        const u = await this.models.UserModel.findOne({ id: user });
        const server = await this.models.ServerModel.findOne({ id: id });

        if (!u) return {
            success: false,
            error: 'Unable to locate your user data.'
        }

        if (!server) return {
            success: false,
            error: 'Unable to locate that server data.'
        }

        const gate = await this.client.gate.verifyPermsForAction({
            user: user as string,
            server: id as string,
            action: 'delete'
        })

        if (!gate.success) return {
            success: false,
            error: gate.error
        }

        await this.models.ServerModel.findOneAndDelete({ id: id }).catch((e: Error) => {
            return {
                success: false,
                error: e.message
            }
        })

        await this.models.UserModel.updateMany({
            'servers.id': id
        }, {
            $pull: {
                servers: {
                    id: id
                }
            }
        }).catch((e: Error) => {
            return {
                success: false,
                error: e.message
            }
        })

        return {
            success: true,
            error: 'Server deleted.'
        }
    }

}