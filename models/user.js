import mongoose from "mongoose";
import { UserRole } from '../config/role_list.js';

const ratingSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
});
const followingSchema = mongoose.Schema({
    disc: { type: mongoose.Schema.Types.ObjectId, ref: 'Disc', required: true },
}, { _id: false });

const paymentMethodSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    accountNo: {
        type: String,
        required: true
    },
});

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    roles: {
        type: [Number],
        enum: Object.values(UserRole).map(role => role.valueOf()),
        default: [UserRole.USER.valueOf()],
        required: false,
    },
    profilePicture: {
        type: String,
        default: null,
        required: false,
    },
    country: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false,
    },
    rating: {
        type: [ratingSchema],
        default: [],
        required: false,
    },
    following: {
        type: [followingSchema],
        default: [],
        required: false,
    },
    shippingCostPaidBy: {
        type: String,
        enum: ["Buyer", "Me"],
        default: 'Buyer',
        required: false,
    },
    deliveryAddress: {
        line1: {
            type: String,
            required: false,
        },
        line2: {
            type: String,
            required: false,
        },
        postalCode: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        state: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
    },
    shippingAddress: {
        line1: {
            type: String,
            required: false,
        },
        line2: {
            type: String,
            required: false,
        },
        postalCode: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        state: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
    },
    paymentMethods: {
        type: [paymentMethodSchema],
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: false,
    },
});


export const User = mongoose.model("User", userSchema);