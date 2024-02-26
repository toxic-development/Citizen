import { Native, CFXNative } from "../types/native.interface";
import * as Models from '../models/models';
import Logger from "../utils/Logger"
import axios from 'axios';

export class NativeManager {
    private logger: Logger;
    public natives: Record<string, Native[]> = {};
    public cfxNatives: CFXNative[] = [];
    private readonly baseUrl = 'https://runtime.fivem.net/doc/natives.json';
    private readonly cfxUrl = 'https://runtime.fivem.net/doc/natives_cfx.json';

    private models = Models;

    constructor() {
        this.logger = new Logger('NativeManager');
    }

    public async createNatives(): Promise<void> {
        const instance = new NativeManager();
        await instance.getBaseNatives();
        await instance.getCFXNatives();
    }

    private async getBaseNatives(): Promise<void> {
        try {
            const { data } = await axios.get(this.baseUrl);
            this.natives = Object.entries(data).reduce((acc: Record<string, Native[]>, [category, natives]) => {
                acc[category] = Object.values(natives as object) as Native[];
                return acc;
            }, {} as Record<string, Native[]>);

            this.logger.info(`Successfully fetched: ${Object.keys(this.natives).length} native categories`);
        } catch (error: any) {
            this.logger.error(`Failed to get natives: ${error.message}`);
        }
    }

    private async getCFXNatives(): Promise<void> {

        const { data } = await axios.get(this.cfxUrl);

        this.cfxNatives = Object.values(data.CFX) as CFXNative[];
        this.logger.info(`Please wait while we sync the CFX natives. This process will definitely take a minute.`);

        const errors: string[] = [];
        const promises = this.cfxNatives.map(async (native: CFXNative) => {

            try {
                const exists = await this.models.cfxNativeSchema.findOne({ name: native.name });

                if (!exists) await this.models.cfxNativeSchema.create({
                    name: native.name,
                    apiset: native.apiset,
                    params: native.params,
                    results: native.results,
                    description: native.description,
                    examples: native.examples,
                    hash: native.hash,
                    url: 'https://docs.fivem.net/natives/?_' + native.hash,
                    ns: native.ns
                });

                else await this.models.cfxNativeSchema.findOneAndUpdate({ name: native.name }, {
                    name: native.name,
                    apiset: native.apiset,
                    params: native.params,
                    results: native.results,
                    description: native.description,
                    examples: native.examples,
                    hash: native.hash,
                    url: 'https://docs.fivem.net/natives/?_' + native.hash,
                    ns: native.ns
                });
            } catch (error: any) {
                errors.push(`Failed to update native: ${native.name} | Error: ${error.message}`);
            }
        });

        await Promise.allSettled(promises);

        const fulfilledCount = this.cfxNatives.length - errors.length;

        for (const error of errors) {
            this.logger.error(error);
        }

        this.logger.ready(`Finished syncing CFX Natives | ✅: ${fulfilledCount} ❌: ${errors.length}`);
    }

    public async findCfxNative(name: string): Promise<any> {

        this.logger.info(`Searching for native: ${name}`);
        this.logger.info(`Current Natives: ${this.cfxNatives.length}`)

        const native = this.cfxNatives.find((n: CFXNative) => n.name === name);

        console.log(native)

        return {
            name: native?.name,
            hash: native?.hash,
        }
    }
}