import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getProfile, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRegistration, validateLogin, handleValidationErrors } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * Rate limiting for authentication endpoints
 
 */
const authRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 attempts per minute
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts. Please try again later.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use email as key for rate limiting
    keyGenerator: (req) => {
        return req.body.email || req.ip;
    }
});

/**
 * POST /api/auth/register
 * Register a new user account
 
 */
router.post('/register', validateRegistration, handleValidationErrors, asyncHandler(register));

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token in cookie
 
 */
router.post('/login', authRateLimit, validateLogin, handleValidationErrors, asyncHandler(login));

/**
 * POST /api/auth/logout
 * Clear authentication cookie
 */
router.post('/logout', logout);

/**
 * GET /api/auth/profile
 * Get current user profile (protected route)
 */
router.get('/profile', authenticateToken, asyncHandler(getProfile));

export default router;