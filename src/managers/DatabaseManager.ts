import mongo from 'mongoose';
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

    public async registerSchema(name: string, schema: any): Promise<void> {
        try {
            await mongo.model(name, schema);
            this.client.logger.ready(`Registered schema: ${name}`);
        } catch (e: unknown) {
            this.client.logger.error(`Error while registering schema: ${e}`);
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

    public async addFiveMServer({ id, ip, port, name, owner, guild }: FiveMServer): Promise<DatabaseResponse> {

        let check = await FiveMServerModel.findOne({ ip: ip, port: port });

        if (check) return {
            success: false,
            error: 'This FiveM Server already exists in the database.'
        }

        const db = new FiveMServerModel({
            id: id,
            ip: ip,
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

        return {
            success: true,
            error: null,
            data: db
        }
    }

    public async getFiveMServer({ id, owner }: FiveMServer): Promise<DatabaseResponse> {

        const db = await FiveMServerModel.findOne({ id: id, owner: owner });

        if (!db) return {
            success: false,
            error: 'No server found with that ID.'
        }

        if (db.owner !== owner) return {
            success: false,
            error: 'You do not own this server.'
        }

        return {
            success: true,
            error: null,
            data: db
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