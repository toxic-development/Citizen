import { Schema, model } from 'mongoose';

export const FiveMServerModel = model('fivem_servers', new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    ip: {
        type: String,
        required: true
    },
    port: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    },
    guild: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: new Date()
    }
}));