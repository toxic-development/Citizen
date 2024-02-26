import { Schema, model } from 'mongoose';

export const CmdModel = model('commands', new Schema({
    guild: {
        type: String,
        required: true
    },
    fivem: {
        type: Boolean,
        required: false,
        default: true
    },
    redm: {
        type: Boolean,
        required: false,
        default: false
    },
    forums: {
        type: Boolean,
        required: false,
        default: true
    },
}))