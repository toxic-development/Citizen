import mongo, { Document } from 'mongoose';
import Citizen from '../client/Citizen';
import { FiveMServer, DatabaseResponse } from '../types/db.interface';
import { FiveMServerModel } from '../models/fivem';

export class DatabaseManager {

    public client: Citizen;

    constructor(client: Citizen) {
        this.client = client;
    }

    public async connect(): Promise<void> {
        try {
            await mongo.connect(process.env.MONGO_URI as string);
            this.client.logger.ready('Connected to database!')
        } catch (e: unknown) {
            this.client.logger.error(`Error while connecting to database: ${e}`)
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await mongo.disconnect();
            this.client.logger.ready('Disconnected from database!');
        } catch (e: unknown) {
            this.client.logger.error(`Error while disconnecting from database: ${e}`);
        }
    }

    public async checkPing(): Promise<void> {
        try {
            await mongo.connection.db.admin().ping();
            this.client.logger.ready('Ping to database successful!');
        } catch (e: unknown) {
            this.client.logger.error(`Error while pinging database: ${e}`);
        }
    }

    public async checkFiveMServer({ ip, port }: FiveMServer): Promise<DatabaseResponse> {

        const db = await FiveMServerModel.findOne({ ip: ip, port: port });

        if (!db) return {
            exists: false
        }

        return {
            exists: true,
        }
    }

    public async addFiveMServer({ ip, port, name, owner, guild }: FiveMServer): Promise<DatabaseResponse> {

        let check = await FiveMServerModel.findOne({ ip: ip, port: port });

        if (check) return {
            success: false,
            error: 'This FiveM Server already exists in the database.'
        }

        const db = new FiveMServerModel({
            id: this.client.utils.generateID(),
            ip: this.client.utils.obfuscateIP(ip as string),
            port: port,
            name: name,
            owner: owner,
            guild: guild
        });

        await db.save().catch((e: any) => {
            console.log(e.stack)

            return {
                success: false,
                error: e.message
            }
        });

        const gate = await this.client.gate.addGatedAccess({
            user: owner as string,
            server: db?.id as string,
            perms: {
                owner: true,
                canEdit: false,
                canDelete: false,
                canView: false
            }
        });

        if (!gate.success) return {
            success: false,
            error: gate.error
        }

        return {
            success: true,
            error: null,
            data: db
        }
    }

    public async getFiveMServer({ id, owner }: FiveMServer): Promise<DatabaseResponse> {

        const db = await FiveMServerModel.findOne({ id: id });
        const gate = await this.client.gate.getServerPermissions({ user: owner as string, server: id as string });

        if (!db) return {
            success: false,
            error: 'No server found with that ID.'
        }

        if (!gate.success) return {
            success: false,
            error: gate.error
        }

        if (!gate.perms?.owner && !gate.perms?.canView) return {
            success: false,
            error: 'You need the `owner` or `canView` permissions to view this server.',
        }

        return {
            success: true,
            error: null,
            data: db,
            perms: gate.perms
        }
    }

    public async getUserFiveMServers({ owner }: FiveMServer): Promise<DatabaseResponse> {

        const db = await FiveMServerModel.find({ owner: owner });

        if (!db) return {
            success: false,
            error: 'Whoops, looks like you don\'t have any servers registered.'
        }

        return {
            success: true,
            error: null,
            data: db
        }
    }

    public async removeFiveMServer({ id, owner }: FiveMServer): Promise<DatabaseResponse> {

        const db = await FiveMServerModel.findOne({ id: id });

        if (!db) return {
            success: false,
            error: 'No server found with that ID.'
        }

        if (db.owner !== owner) return {
            success: false,
            error: 'You do not own this server.'
        }

        await FiveMServerModel.findOneAndDelete({ id: id, owner: owner });

        return {
            success: true,
            error: null
        }
    }
}