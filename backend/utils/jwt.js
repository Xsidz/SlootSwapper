import jwt from 'jsonwebtoken';


export const generateToken = (userId) => {
    if (!userId) {
        throw new Error('User ID is required for token generation');
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }

    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        {
            expiresIn: '24h',
            issuer: 'slot-swapper',
            audience: 'slot-swapper-users'
        }
    );
};


export const verifyToken = (token) => {
    if (!token) {
        throw new Error('Token is required for verification');
    }

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'slot-swapper',
            audience: 'slot-swapper-users'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('Token not active yet');
        } else {
            throw new Error('Token verification failed');
        }
    }
};

export const extractTokenFromCookies = (cookies) => {
    if (!cookies || !cookies.token) {
        return null;
    }

    return cookies.token;
};


export const getCookieOptions = () => {
    return {
        httpOnly: true, // Prevent XSS attacks
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        path: '/' // Available for all routes
    };
};

export default {
    generateToken,
    verifyToken,
    extractTokenFromCookies,
    getCookieOptions
};