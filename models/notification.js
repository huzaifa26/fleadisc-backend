import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: { type: Date, default: Date.now, required: false },
});

export const Notification = mongoose.model("Notification", notificationSchema);
