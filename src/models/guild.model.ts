import { Schema, model } from 'mongoose';

export const GuildModel = model('guilds', new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: false,
    },
    blacklist: {
        type: Boolean,
        required: false,
    },
    beta: {
        type: Boolean,
        required: false,
    },
    role: {
        type: String,
        required: false,
        default: 'none'
    },
    channels: {
        type: Object,
        required: false,
        default: {
            forums: 'none',
            fivem: 'none',
            redm: 'none',
            logs: 'none'
        }
    },
    settings: {
        type: Object,
        required: false,
        default: {
            allow_Forums: false,
            allow_FiveM: false,
            allow_RedM: false,
            allow_Beta: false,
            allow_Logs: false,
            ownerOnly: false
        }
    }
}))