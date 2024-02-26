import { RconOptions, RconPacket, RconPacketType, RconEvents, DefaultRconOptions } from '../types/rcon.interface';
import { createSplitter, decodePacket, encodePacket } from '../utils/FiveMUtils';
import TypedEventEmitter from 'typed-emitter';
import { PromiseQueue } from './QueueManager';
import { EventEmitter } from 'events';
import { Socket, connect } from "net";


export class Rcon {
    private sendQueue: PromiseQueue;
    private callbacks = new Map<number, (packet: RconPacket) => void>();
    private requestId = 0;

    config: Required<RconOptions>
    emitter = new EventEmitter() as TypedEventEmitter<RconEvents>;
    socket: Socket | null = null;
    authenticated = false;

    on = this.emitter.on.bind(this.emitter);
    once = this.emitter.once.bind(this.emitter);
    off = this.emitter.off.bind(this.emitter);

    constructor(options: RconOptions) {
        this.config = { ...DefaultRconOptions, ...options };
        this.sendQueue = new PromiseQueue(this.config.maxPending);

        if (this.config.maxPending < 1) this.emitter.setMaxListeners(this.config.maxPending);
    }

    /**
     * Establish a connection to the RCON server.
     * @returns A promise that resolves to the RCON instance.
     */
    public async connect(): Promise<Rcon> {
        if (this.socket) throw new Error('Already connected or connecting');

        const socket = this.socket = connect({
            host: this.config.host,
            port: this.config.port
        })

        try {
            await new Promise<void>((resolve, reject) => {
                socket.once('error', (error) => reject(error));
                socket.on('connect', () => {
                    socket.off('error', reject);
                    resolve();
                })
            })
        } catch (error) {
            this.socket = null;
            throw error;
        }

        socket.setNoDelay(true);

        socket.on('error', (error) => this.emitter.emit('error', error));

        this.emitter.emit('connect');

        this.socket.on('close', () => {
            this.emitter.emit('end');
            this.sendQueue.pause();
            this.socket = null;
            this.authenticated = false;
        });

        this.socket.pipe(createSplitter()).on('data', this.handlePacket.bind(this));

        const id = this.requestId;
        const packet = await this.sendPacket(RconPacketType.Auth, Buffer.from(this.config.password));

        this.sendQueue.resume();

        if (packet.id !== id || packet.id == -1) {
            this.sendQueue.pause();
            this.socket.destroy();
            this.socket = null;
            throw new Error('Failed to authenticate');
        }

        this.authenticated = true;
        this.emitter.emit('authenticated');

        return this;
    }

    /**
     * Close the connection to the RCON server.
     * @returns A promise that resolves when the connection is closed.
     */
    public async end(): Promise<void> {
        if (!this.socket || !this.socket.connecting) throw new Error('Not connected');
        if (!this.socket.writable) throw new Error('End called twice, socket is not writable');

        this.sendQueue.pause();
        this.socket.end();

        await new Promise<void>(resolve => this.on('end', resolve));
    }

    /**
     * Send a command to the RCON server.
     * @param command The command to send.
     * @returns A promise that resolves to the response from the server.
     */
    public async send(command: string): Promise<string> {
        const payload = await this.sendRaw(Buffer.from(command, 'utf-8'));

        return payload.toString('utf-8');
    }

    /**
     * Send a raw payload to the RCON server.
     * @param payload The payload to send.
     * @returns A promise that resolves to the response from the server.
     */
    public async sendRaw(buffer: Buffer): Promise<Buffer> {
        if (!this.authenticated) throw new Error('RCON socket is not authenticated');
        if (!this.socket) throw new Error('RCON socket is not connected');

        const packet = await this.sendPacket(RconPacketType.Command, buffer);

        return packet.payload;
    }

    /**
     * Send a packet to the RCON server.
     * @param type The type of packet to send.
     * @param payload The payload to send.
     * @returns A promise that resolves to the response from the server.
     */
    private async sendPacket(type: RconPacketType, payload: Buffer): Promise<RconPacket> {
        const id = this.requestId++;

        const createSendPromise = () => {
            this.socket!.write(encodePacket({ id, type, payload }));

            return new Promise<RconPacket>((resolve, reject) => {
                const onEnd = () => (reject(new Error('RCON socket connection closed')), clearTimeout(timeout))

                this.emitter.on('end', onEnd);

                const timeout = setTimeout(() => {
                    this.off('end', onEnd);
                    reject(new Error(`Timeout for packet id: ${id}`));
                }, this.config.timeout);

                this.callbacks.set(id, packet => {
                    this.off('end', onEnd);
                    clearTimeout(timeout);
                    resolve(packet);
                })
            })
        }

        if (type == RconPacketType.Auth) return createSendPromise();
        else return await this.sendQueue.add(createSendPromise);
    }

    /**
     * Handle a packet received from the RCON server.
     * @param data The packet data.
     * @returns void
     */
    private handlePacket(data: Buffer): void {
        const packet = decodePacket(data);

        const id = this.authenticated ? packet.id : this.requestId - 1;
        const handler = this.callbacks.get(id);

        if (handler) {
            handler(packet);
            this.callbacks.delete(id);
        }
    }
}