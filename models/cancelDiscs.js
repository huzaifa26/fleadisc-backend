import mongoose from "mongoose";


const cancelSchema = mongoose.Schema({
    disc: { type: mongoose.Schema.Types.ObjectId, ref: 'Disc', required: true },
    cancelFrom: { type: String, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
})

export const CancelDisc = mongoose.model("CancelDisc", cancelSchema);