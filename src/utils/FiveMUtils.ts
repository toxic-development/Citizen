import { RconPacket } from "../types/rcon.interface";
import { Transform } from "stream";

/**
 * Encodes a RconPacket into a Buffer
 * @param packet The packet to encode
 * @returns The encoded packet
 */
export function encodePacket(packet: RconPacket): Buffer {
    const buffer = Buffer.alloc(packet.payload.length + 14);

    buffer.writeInt32LE(packet.payload.length + 10, 0);
    buffer.writeInt32LE(packet.id, 4);
    buffer.writeInt32LE(packet.type, 8);
    packet.payload.copy(buffer, 12);

    return buffer;
}

/**
 * Decodes a Buffer into a RconPacket
 * @param buffer The buffer to decode
 * @returns The decoded packet
 */
export function decodePacket(buffer: Buffer): RconPacket {
    const length = buffer.readInt32LE(0);
    const id = buffer.readInt32LE(4);
    const type = buffer.readInt32LE(8);
    const payload = buffer.slice(12, length - 2);

    return { id, type, payload };
}

/**
 * Creates a Transform stream that splits a buffer into RconPackets
 * @returns The Transform stream
 */
export function createSplitter() {
    let transform = new Transform();
    let buffer = Buffer.alloc(0);

    transform._transform = (chunk, _encoding, callback) => {
        buffer = Buffer.concat([buffer, chunk]);

        let offset = 0;

        while (offset + 4 < buffer.length) {
            const length = buffer.readInt32LE(offset);

            if (offset + 4 + length > buffer.length) break;

            transform.push(buffer.slice(offset, offset + 4 + length));

            offset += 4 + length;
        }

        buffer = buffer.subarray(offset);

        callback();
    }

    return transform;
}