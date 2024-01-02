import axios from 'axios';
import type Citizen from '../client/Citizen';
import * as FiveMTypings from '../types/fivem.interface';

export class FiveMManager {
    public client: Citizen;
    private ip: string;
    private port: number;

    constructor(client: Citizen, config: { ip: string, port: number }) {
        this.client = client;
        this.ip = config.ip;
        this.port = config.port;

        if (!this.ip || !this.port) throw new Error('FiveM API: Invalid IP or Port');

        this.checkConnection().then(() => {
            this.client.logger.ready(`[FiveM API]: Connected to ${this.getServerAddress()}`);
        }).catch((err: any) => {
            this.client.logger.error(`[FiveM API]: could not connect to ${this.getServerAddress()} - ${err}`);
        });
    }

    private checkConnection(): any {

        return axios.get(`http://${this.getServerAddress()}/`)
    }

    private getIP(): string {
        return this.ip;
    }

    private getPort(): number {
        return this.port;
    }

    private async getDynamicEndpoint(): Promise<FiveMTypings.DynamicEndpoint> {
        const res = await axios.get(`http://${this.getServerAddress()}/dynamic.json`);
        return res.data;
    }

    private async getInfoEndpoint(): Promise<FiveMTypings.InfoEndpoint> {
        const res = await axios.get(`http://${this.getServerAddress()}/info.json`);
        return res.data;
    }

    private async getPlayersEndpoint(): Promise<FiveMTypings.PlayersEndpoint> {
        const res = await axios.get(`http://${this.getServerAddress()}/players.json`);
        return res.data;
    }

    public getServerAddress(): string {
        return `${this.getIP()}:${this.getPort()}`;
    }

    public async getPlayers(): Promise<FiveMTypings.PlayersEndpoint> {
        return await this.getPlayersEndpoint().then(data => data).catch(err => err);
    }

    public async getPlayerCount(): Promise<number> {
        return await this.getDynamicEndpoint().then(data => data.clients).catch(err => err);
    }

    public async getMaxPlayers(): Promise<number> {
        return await this.getDynamicEndpoint().then(data => data.sv_maxclients).catch(err => err);
    }

    public async getServerInfo(): Promise<FiveMTypings.InfoEndpoint> {

        return await this.getInfoEndpoint().then(data => data).catch(err => err);
    }

    public async getServerResources(): Promise<FiveMTypings.InfoEndpoint> {
        return await this.getInfoEndpoint().then(data => data.resources).catch(err => err);
    }

    public async getServerVersion(): Promise<string> {
        return await this.getInfoEndpoint().then(data => data.server).catch(err => err);
    }

    public async getServerName(): Promise<string> {
        return await this.getInfoEndpoint().then(data => data.vars.sv_projectName).catch(err => err);
    }

    public async getServerTags(): Promise<string> {
        return await this.getInfoEndpoint().then(data => data.vars.tags).catch(err => err);
    }

    public async getServerMapName(): Promise<string> {
        return await this.getDynamicEndpoint().then(data => data.mapname).catch(err => err);
    }

    public async getOneSyncStatus(): Promise<boolean> {
        return await this.getInfoEndpoint().then(data => data.vars.onesync_enabled).catch(err => err);
    }
}