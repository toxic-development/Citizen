export interface RconOptions {
    host: string;
    password: string;
    timeout?: number;
    maxPending?: number;
    port?: number;
}

export interface RconEvents {
    connect: () => void;
    authenticated: () => void;
    error: (error: Error) => void;
    end: () => void;
    [event: string]: ((error: Error) => void) | (() => void);
}

export const DefaultRconOptions = {
    port: 30120,
    timeout: 5000,
    maxPending: 1
}

export interface RconPacket {
    id: number;
    type: number;
    payload: Buffer;
}

export interface QueuedItem<T> {
    promiseGenerator: () => Promise<T>;
    resolve: (value: T) => any;
    reject: (reason?: any) => any;
}

export enum RconPacketType {
    Auth = 3,
    AuthResponse = 2,
    Command = 2,
    CommandResponse = 0
}