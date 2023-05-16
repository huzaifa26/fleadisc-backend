import mongoose from 'mongoose'

const refreshSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '1d' },
    },
});

export const RefreshToken = mongoose.model('RefreshToken', refreshSchema);