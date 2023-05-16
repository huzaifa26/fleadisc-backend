import mongoose from "mongoose";

const bidSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bidPrice: { type: Number, required: true },
    createdAt: { type: String, required: true },
});
const buyerSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyPrice: { type: Number, required: true },
    createdAt: { type: String, required: true },
});

const discSchema = mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pictureURL: { type: String, required: true },
    quantity: { type: Number, required: true },
    discName: { type: String, required: true },
    brand: { type: String, required: true },
    range: { type: String, required: true },
    condition: { type: Number, required: true },
    plastic: { type: String, required: false },
    grams: { type: String, required: false },
    named: { type: Boolean, required: true },
    dyed: { type: Boolean, required: true },
    blank: { type: Boolean, required: true },
    glow: { type: Boolean, required: true },
    collectible: { type: Boolean, required: true },
    firstRun: { type: Boolean, required: true },
    priceType: { type: String, required: true },
    startingPrice: { type: String, required: true },
    minPrice: { type: String, required: false },
    endDay: { type: String, default: null, required: false },
    endTime: { type: String, default: null, required: false },
    createdAt: { type: Date, default: Date.now, required: true },
    bids: {
        type: [bidSchema],
        required: function () {
            return this.priceType !== "fixedPrice";
        },
    },
    buyer: {
        type: buyerSchema,
        required: false
    },
    isActive: { type: Boolean, default: true, required: false },
    isBought: { type: Boolean, default: false, required: false },
    isFinished: { type: Boolean, default: false, required: false },
});

export const Disc = mongoose.model("Disc", discSchema);