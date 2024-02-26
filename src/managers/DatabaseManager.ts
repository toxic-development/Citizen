import mongo, { Document } from 'mongoose';
import Citizen from 'src/client/Citizen';
import * as Models from '../models/models';

export class DatabaseManager {

    public client: Citizen;
    private models = Models;

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
}