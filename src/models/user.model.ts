import { Schema, model } from 'mongoose';

export const UserModel = model('users', new Schema({
    id: {
        type: String,
        required: true,
    },
    blacklist: {
        type: Boolean,
        required: false,
    },
    servers: [
        {
            id: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
            permissions: {
                owner: {
                    type: Boolean,
                    required: false,
                    default: false
                },
                canRcon: {
                    type: Boolean,
                    required: false,
                    default: false
                },
                canEdit: {
                    type: Boolean,
                    required: false,
                    default: false
                },
                canView: {
                    type: Boolean,
                    required: false,
                    default: false
                },
                canDelete: {
                    type: Boolean,
                    required: false,
                    default: false
                },
            }
        }
    ]
}))