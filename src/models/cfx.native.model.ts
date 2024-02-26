import { Schema, model } from 'mongoose';

export const cfxNativeSchema = model('cfxNatives', new Schema({
    name: { type: String, required: true },
    apiset: { type: String, required: true },
    params: { type: Array, required: true },
    results: { type: String, required: true },
    description: { type: String, required: false, default: 'No description available.' },
    examples: { type: Array, required: false, default: 'No examples available.' },
    hash: { type: String, required: true },
    url: { type: String, required: false },
    ns: { type: String, required: true }
}))