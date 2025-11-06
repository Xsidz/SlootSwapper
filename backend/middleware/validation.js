import { body, param, validationResult } from 'express-validator';
import { ValidationError } from './errorHandler.js';

/**
 * Enhanced validation middleware with sanitization and business rules
 * Requirements: 11.1, 11.2, 12.5
 */

/**
 * Middleware to handle validation results
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const details = {};
        errors.array().forEach(error => {
            details[error.path] = error.msg;
        });
        throw new ValidationError('Validation failed', details);
    }
    next();
};

/**
 * Sanitize and validate MongoDB ObjectId
 */
export const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName} format`)
        .customSanitizer(value => value.trim())
];

/**
 * Validation rules for user registration with enhanced sanitization
 * Requirements: 1.1, 1.2, 1.3, 12.5
 */
export const validateRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

/**
 * Validation rules for user login with sanitization
 
 */
export const validateLogin = [
    body('email')
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 254 })
        .withMessage('Email address is too long'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ max: 128 })
        .withMessage('Password is too long')
];

/**
 * Validation rules for password change
 */
export const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)
        .withMessage('New password must contain at least one letter and one number')
];

/**
 * Simple validation rules for event creation
 */
export const validateEventCreation = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),

    body('startTime')
        .isISO8601()
        .withMessage('Start time must be a valid date')
        .custom((value) => {
            const startTime = new Date(value);
            const now = new Date();
            if (startTime <= now) {
                throw new Error('Start time must be in the future');
            }
            return true;
        }),

    body('endTime')
        .isISO8601()
        .withMessage('End time must be a valid date')
        .custom((value, { req }) => {
            const endTime = new Date(value);
            const startTime = new Date(req.body.startTime);
            if (endTime <= startTime) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['BUSY', 'SWAPPABLE'])
        .withMessage('Status must be either BUSY or SWAPPABLE')
];

/**
 * Validation rules for event updates with business rules
 
 */
export const validateEventUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),

    body('startTime')
        .optional()
        .isISO8601()
        .withMessage('Start time must be a valid date')
        .custom((value) => {
            const startTime = new Date(value);
            const now = new Date();
            if (startTime <= now) {
                throw new Error('Start time must be in the future');
            }
            return true;
        }),

    body('endTime')
        .optional()
        .isISO8601()
        .withMessage('End time must be a valid date')
        .custom((value, { req }) => {
            if (!value) return true;
            const endTime = new Date(value);
            if (req.body.startTime) {
                const startTime = new Date(req.body.startTime);
                if (endTime <= startTime) {
                    throw new Error('End time must be after start time');
                }
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['BUSY', 'SWAPPABLE'])
        .withMessage('Status must be either BUSY or SWAPPABLE')
];

/**
 * Validation rules for event status updates
 
 */
export const validateEventStatusUpdate = [
    body('status')
        .isIn(['BUSY', 'SWAPPABLE'])
        .withMessage('Status must be either BUSY or SWAPPABLE')
        .customSanitizer(value => value.toUpperCase())
];

/**
 * Validation rules for swap request creation
 
 */
export const validateSwapRequest = [
    body('requesterSlotId')
        .isMongoId()
        .withMessage('Invalid requester slot ID format')
        .customSanitizer(value => value.trim()),

    body('targetSlotId')
        .isMongoId()
        .withMessage('Invalid target slot ID format')
        .customSanitizer(value => value.trim())
        .custom((value, { req }) => {
            if (value === req.body.requesterSlotId) {
                throw new Error('Cannot swap with the same slot');
            }
            return true;
        })
];

/**
 * Validation rules for swap response
 
 */
export const validateSwapResponse = [
    body('action')
        .isIn(['accept', 'reject'])
        .withMessage('Action must be either accept or reject')
        .customSanitizer(value => value.toLowerCase())
];

/**
 * Business rule validation for event ownership
 
 */
export const validateEventOwnership = async (req, res, next) => {
    try {
        const Event = (await import('../models/Event.js')).default;
        const eventId = req.params.id;
        const userId = req.user.userId;

        const event = await Event.findById(eventId);
        if (!event) {
            const { NotFoundError } = await import('./errorHandler.js');
            throw new NotFoundError('Event not found');
        }

        if (event.userId.toString() !== userId) {
            const { AuthorizationError } = await import('./errorHandler.js');
            throw new AuthorizationError('You can only modify your own events');
        }

        req.event = event;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Business rule validation for swap request authorization
 
 */
export const validateSwapRequestAuth = async (req, res, next) => {
    try {
        const SwapRequest = (await import('../models/SwapRequest.js')).default;
        const requestId = req.params.requestId;
        const userId = req.user.userId;

        const swapRequest = await SwapRequest.findById(requestId)
            .populate('targetSlotId');

        if (!swapRequest) {
            const { NotFoundError } = await import('./errorHandler.js');
            throw new NotFoundError('Swap request not found');
        }

        if (swapRequest.targetSlotId.userId.toString() !== userId) {
            const { AuthorizationError } = await import('./errorHandler.js');
            throw new AuthorizationError('You can only respond to swap requests for your own slots');
        }

        if (swapRequest.status !== 'PENDING') {
            const { ConflictError } = await import('./errorHandler.js');
            throw new ConflictError('This swap request has already been processed');
        }

        req.swapRequest = swapRequest;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Rate limiting validation middleware
 
 */
export const validateRateLimit = (windowMs, maxRequests, message) => {
    const requests = new Map();

    return async (req, res, next) => {
        const key = req.ip + ':' + (req.user?.id || 'anonymous');
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        for (const [reqKey, timestamps] of requests.entries()) {
            const validTimestamps = timestamps.filter(time => time > windowStart);
            if (validTimestamps.length === 0) {
                requests.delete(reqKey);
            } else {
                requests.set(reqKey, validTimestamps);
            }
        }

        // Check current requests
        const userRequests = requests.get(key) || [];
        const recentRequests = userRequests.filter(time => time > windowStart);

        if (recentRequests.length >= maxRequests) {
            const { RateLimitError } = await import('./errorHandler.js');
            throw new RateLimitError(message || 'Too many requests');
        }

        // Add current request
        recentRequests.push(now);
        requests.set(key, recentRequests);

        next();
    };
};

export default {
    handleValidationErrors,
    validateObjectId,
    validateRegistration,
    validateLogin,
    validatePasswordChange,
    validateEventCreation,
    validateEventUpdate,
    validateEventStatusUpdate,
    validateSwapRequest,
    validateSwapResponse,
    validateEventOwnership,
    validateSwapRequestAuth,
    validateRateLimit
};