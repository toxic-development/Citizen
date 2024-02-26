import { Schema, model } from 'mongoose';

export const ServerModel = model('servers', new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    ip: {
        type: String,
        required: true,
    },
    port: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: false,
        default: 'fivem'
    },
    guild: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    }
}))