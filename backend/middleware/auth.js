import { verifyToken, extractTokenFromCookies } from '../utils/jwt.js';
import { User } from '../models/index.js';


export const authenticateToken = async (req, res, next) => {
    try {
        // Extract token from cookies first, then from Authorization header
        let token = extractTokenFromCookies(req.cookies);

        if (!token) {
            // Try to extract from Authorization header
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'NO_TOKEN',
                    message: 'Access token is required'
                }
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: error.message
                }
            });
        }

        // Verify user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: 'User associated with token no longer exists'
                }
            });
        }

        // Attach user information to request object
        req.user = {
            userId: user._id.toString(),
            email: user.email,
            name: user.name
        };

        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication failed'
            }
        });
    }
};


export const optionalAuth = async (req, res, next) => {
    try {
        // Extract token from cookies first, then from Authorization header
        let token = extractTokenFromCookies(req.cookies);

        if (!token) {
            // Try to extract from Authorization header
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            // No token provided, continue without user info
            req.user = null;
            return next();
        }

        try {
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.userId);

            if (user) {
                req.user = {
                    userId: user._id.toString(),
                    email: user.email,
                    name: user.name
                };
            } else {
                req.user = null;
            }
        } catch (error) {
            // Invalid token, continue without user info
            req.user = null;
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        req.user = null;
        next();
    }
};

export default {
    authenticateToken,
    optionalAuth
};