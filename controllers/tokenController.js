import jwt from 'jsonwebtoken'
import { RefreshToken } from '../models/refreshToken.js';

export const handleRefreshToken = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    console.log(refreshToken);
    console.log('inside it');
    if (!refreshToken) {
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH);
        const token = await RefreshToken.findOne({ userId: decoded.userId, token: refreshToken });
        if (!token || token.userId.toString() !== decoded.userId) {
            console.log('--');
            return res.sendStatus(403);
        }
        const accessToken = jwt.sign({ UserInfo: { userId: decoded.userId, roles: decoded.roles } }, process.env.JWT_SECRET, { expiresIn: '30s' });
        res.json({ accessToken });
    } catch (error) {
        return res.sendStatus(403);
    }
};

export const handleLogout = async (req, res) => {
    const refreshToken = req.cookies?.jwt;

    if (!refreshToken) {
        return res.sendStatus(204);
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH);
        const token = await RefreshToken.findOne({ userId: decoded.userId, token: refreshToken });

        if (!token || token.userId.toString() !== decoded.userId) {
            res.clearCookie('jwt', { secure: true, sameSite: 'None', httpOnly: true });
            return res.sendStatus(403);
        }

        await RefreshToken.deleteOne({ token: refreshToken });
        res.clearCookie('jwt', { secure: true, sameSite: 'None', httpOnly: true });

        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};