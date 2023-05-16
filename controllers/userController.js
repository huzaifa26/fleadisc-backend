import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import axios from "axios"
import { User } from '../models/user.js'
import { tryCatch } from '../utils/tryCatch.js';
import AppError from '../utils/AppError.js';
import { Notification } from "../models/notification.js";

export const signinController = tryCatch(async (req, res) => {
    if (req.body.googleAccessToken) {
        const userInfo = await axios.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${req.body.googleAccessToken}` } },
        );
        const user = await User.findOne({ email: userInfo.data.email });
        if (!user) { throw new AppError('account_not_found', 'Email not found, please create an account', 401) }
        const accessToken = jwt.sign(
            { UserInfo: { userId: user._id.toString(), roles: user.roles } },
            process.env.JWT_SECRET,
            {
                //5 to 15 min in production
                expiresIn: '15min'
            }
        );
        const refreshToken = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_REFRESH,
            {
                expiresIn: '1d'
            }
        );
        // save refresh token to database
        // await RefreshToken.create({ userId: user._id, token: refreshToken, roles: user.roles });

        //maxAge is 24 hours
        // res.cookie('refreshToken', refreshToken, { sameSite: 'None', httpOnly: false, secure: false, maxAge: 24 * 60 * 60 * 1000 })
        res.status(200).json({ message: 'Login successful', accessToken: accessToken, name: user.name, userId: user._id.toString(), email: user.email, profilePicture: user.profilePicture, roles: user.roles, country: user.country, city: user.city });
    }
    else {
        const { email, password } = req.body;

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) { throw new AppError('account_not_found', 'Please create an account', 401) }
        if (user && user.password === undefined) { throw new AppError('gmail_account', 'Sign in with google', 401) }

        // match password
        const isPasswordOk = await bcrypt.compare(password, user.password);
        if (!isPasswordOk) { throw new AppError('inccorect_password', 'Password is inncorrect', 401) }
        const accessToken = jwt.sign(
            { UserInfo: { userId: user._id.toString(), roles: user.roles } },
            process.env.JWT_SECRET,
            {
                //5 to 15 min in production
                expiresIn: '1H'
            }
        );
        const refreshToken = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_REFRESH,
            {
                expiresIn: '1d'
            }
        );
        // save refresh token to database
        // await RefreshToken.create({ userId: user._id, token: refreshToken, roles: user.roles });

        //maxAge is 24 hours
        // res.cookie('refreshToken', refreshToken, { domain: 'localhost', path: '/', sameSite: 'Lax', httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 })
        // res.cookie('refreshToken', refreshToken, {
        //     sameSite: 'lax',
        //     httpOnly: true,
        //     secure: false,
        //     maxAge: 24 * 60 * 60 * 1000
        // });

        res.status(200).json({ message: 'Login successful', accessToken: accessToken, name: user.name, userId: user._id.toString(), email: user.email, profilePicture: user.profilePicture, roles: user.roles, country: user.country, city: user.city });
    }
})

export const signupController = tryCatch(async (req, res) => {
    if (req.body.googleAccessToken) {
        const userInfo = await axios.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${req.body.googleAccessToken}` } },
        );

        const user = await User.findOne({ email: userInfo.data.email });
        if (user) {
            throw new AppError('account_exist', 'Email already exists', 401)
        }
        await User.create({ name: userInfo.data.name, email: userInfo.data.email, profilePicture: userInfo.data.picture, country: req.body.country, city: req.body.city, currency: req.body.currency })
        res.status(201).json({ message: 'User registered successfully' });
    }
    else {
        const { name, email, password, country, currency, city } = req.body;
        // check if email already exists
        const user = await User.findOne({ email });
        if (user) {
            throw new AppError('account_exist', 'Email already exists', 401)
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        // create new user
        await User.create({ name, email, password: hashedPassword, country, currency, city });
        res.status(201).json({ message: 'User registered successfully' });
    }
})

export const checkEmail = tryCatch(async (req, res) => {
    let email
    if (req.body.from === 'google') {
        const userInfo = await axios.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${req.body.googleAccessToken}` } },
        );
        email = userInfo.data.email
    }
    else {
        email = req.body.email;
    }
    const user = await User.findOne({ email: email });

    if (user) {
        throw new AppError('account_exist', 'Email already exists', 401)
    }
    else
        res.status(200).json({ message: 'User not registered before' });
})

export const getUserFollowing = tryCatch(async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('following');
    if (user && user.following) {
        res.status(200).json(user.following);
    } else {
        res.status(200).json([]);
    }
});


export const addToFollowing = tryCatch(async (req, res) => {
    const { userId, discId } = req.body;

    // Find the user by userId and check if they already follow the disc
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('not_found', 'User not found', 404);
    }

    // Check if the user is already following the disc
    const isFollowing = user.following.some((following) => {
        return following.disc.toString() === discId.toString();
    });
    if (isFollowing) {
        throw new AppError('already_exists', 'User is already following the disc', 409);
    }

    // Create a new object with the discId and push it to the following array
    const newFollowing = {
        disc: discId,
    };
    user.following.push(newFollowing);
    await user.save();

    res.status(201).json({
        status: 'success',
        message: 'User is now following the disc',
        data: null,
    });
});

export const removeFromFollowing = tryCatch(async (req, res) => {
    const { userId, discId } = req.params;

    // Find the user by userId and remove the disc from their following list
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('not_found', 'User not found', 404);
    }

    if (!user.following || user.following.length === 0) {
        throw new AppError('bad_request', 'User does not follow the disc', 400);
    }

    const followingIndex = user.following.findIndex((f) => f.disc.toString() === discId.toString());
    if (followingIndex === -1) {
        throw new AppError('bad_request', 'User does not follow the disc', 400);
    }

    user.following.splice(followingIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Disc removed from following list' });
});

export const userInfoById = tryCatch(async (req, res) => {
    const { userId } = req.params;
    // Find the user by userId and check if they already follow the disc
    const user = await User.findById(userId);
    res.status(200).json(user);
})
export const changePicture = tryCatch(async (req, res) => {
    const { userId, pictureURL } = req.body;

    // Find the user by userId and update the profilePicture field with the new picture URL
    const user = await User.findByIdAndUpdate(userId, { $set: { profilePicture: pictureURL } }, { new: true });

    // If the user is not found, send an error response
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Send a success response with the updated user object
    res.status(200).json({ message: 'Picture updated successfully' });
});
export const editUser = tryCatch(async (req, res) => {

    const userId = req.params.userId;
    const updates = req.body;

    const user = await User.findById(userId);

    // // Update the user document with the new form data
    user.name = updates.name
    user.country = updates.country
    user.deliveryAddress.line1 = updates.deliveryAddressLine1
    user.deliveryAddress.line2 = updates.deliveryAddressLine2
    user.deliveryAddress.postalCode = updates.deliveryPostalCode
    user.deliveryAddress.city = updates.deliveryCity
    user.deliveryAddress.state = updates.deliveryState
    user.deliveryAddress.country = updates.deliveryCountry
    user.shippingAddress.line1 = updates.shippingAddressLine1
    user.shippingAddress.line2 = updates.shippingAddressLine2
    user.shippingAddress.postalCode = updates.shippingPostalCode
    user.shippingAddress.city = updates.shippingCity
    user.shippingAddress.state = updates.shippingState
    user.shippingAddress.country = updates.shippingCountry
    user.paymentMethods = updates.paymentMethods
    user.shippingCostPaidBy = updates.shippingCostPaidBy
    // Save the updated user document to the database
    await user.save();
    // Send the updated user document as the response
    res.json(user);
})

export const getNotifications = tryCatch(async (req, res) => {
    const { userId } = req.params;
    const notifications = await Notification.find({ user: userId, read: false, type: "Disc" })
    res.status(200).json(notifications);
});

export const setReadNotifications = tryCatch(async (req, res) => {
    const { userId } = req.body;
    const notifications = await Notification.find({ user: userId, read: false, type: "Disc" })
    notifications.forEach(async (notification) => {
        notification.read = true
        await notification.save()
    })
    res.status(200).json({ message: "Notifications set to read" });
});