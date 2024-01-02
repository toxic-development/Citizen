import { Schema, model } from 'mongoose';

export const UserModel = model('citizen_users', new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    servers: [
        {
            id: {
                type: String,
                required: true,
            },
            permissions: {
                owner: {
                    type: Boolean,
                    required: true,
                },
                canEdit: {
                    type: Boolean,
                    required: true,
                },
                canDelete: {
                    type: Boolean,
                    required: true,
                },
                canView: {
                    type: Boolean,
                    required: true,
                }
            }
        }
    ]
}));