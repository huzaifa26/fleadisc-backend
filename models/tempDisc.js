import mongoose from "mongoose";

const discSchema = mongoose.Schema({
    discId: { type: mongoose.Schema.Types.ObjectId, ref: "Disc", required: true },
});

const tempSchema = mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    disc: {
        type: [discSchema],
    },
    purchaseConfirmed: { type: Boolean, default: false },
    address: { type: String, default: null },
    addressSent: { type: Boolean, default: false },
    address: { type: String, default: null },
    shippingCost: { type: Number, default: null },
    shippingCostPaidBy: { type: String, default: null },
    paymentAddressConfirmed: { type: Boolean, default: false },
    paymentMethod: { type: Array, default: [] },
    paymentSent: { type: Boolean, default: false },
    paymentConfirmed: { type: Boolean, default: false },
    parcelSent: { type: Boolean, default: false },
    parcelReceived: { type: Boolean, default: false },
    soldToNextBidder: { type: Boolean, default: false },
    nextBidderConfirmedPurchased: { type: Boolean, default: false }
})

export const TempDisc = mongoose.model("Temp", tempSchema);