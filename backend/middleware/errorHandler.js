
export class AppError extends Error {
    constructor(message, statusCode, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation error class for input validation failures
 */
export class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}

/**
 * Authentication error class for auth failures
 */
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

/**
 * Authorization error class for permission failures
 */
export class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

/**
 * Not found error class for resource not found
 */
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

/**
 * Conflict error class for business rule violations
 */
export class ConflictError extends AppError {
    constructor(message = 'Conflict with existing data') {
        super(message, 409, 'CONFLICT_ERROR');
    }
}

/**
 * Rate limit error class for too many requests
 */
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_ERROR');
    }
}

/**
 * Database error class for database operation failures
 */
export class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, 'DATABASE_ERROR');
    }
}

/**
 * Sanitize error message for logging while protecting user privacy
 
 */
function sanitizeErrorForLogging(error, req) {
    const sanitized = {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip
    };

    // Remove sensitive information from logs
    if (req.body) {
        const sanitizedBody = { ...req.body };
        delete sanitizedBody.password;
        delete sanitizedBody.currentPassword;
        delete sanitizedBody.newPassword;
        sanitized.requestBody = sanitizedBody;
    }

    return sanitized;
}

/**
 * Format error response for client

 */
function formatErrorResponse(error) {
    const response = {
        success: false,
        error: {
            code: error.code || 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Something went wrong'
        }
    };

    // Add validation details if available
    if (error.details) {
        response.error.details = error.details;
    }

    return response;
}

/**
 * Centralized error handling middleware
 
 */
export const errorHandler = (error, req, res, next) => {
    // Log error for debugging while protecting user privacy
    const sanitizedError = sanitizeErrorForLogging(error, req);

    if (error.isOperational) {
        // Log operational errors at info level
        console.info('Operational Error:', JSON.stringify(sanitizedError, null, 2));
    } else {
        // Log programming errors at error level
        console.error('Programming Error:', JSON.stringify(sanitizedError, null, 2));
    }

    // Handle specific error types
    let processedError = error;

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        const details = {};
        Object.keys(error.errors).forEach(key => {
            details[key] = error.errors[key].message;
        });
        processedError = new ValidationError('Validation failed', details);
    }

    // Handle Mongoose duplicate key errors
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        processedError = new ConflictError(message);
    }

    // Handle Mongoose cast errors
    if (error.name === 'CastError') {
        processedError = new ValidationError('Invalid ID format');
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        processedError = new AuthenticationError('Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
        processedError = new AuthenticationError('Token expired');
    }

    // Ensure we have a proper AppError
    if (!processedError.isOperational) {
        processedError = new AppError(
            processedError.message || 'Something went wrong',
            processedError.statusCode || 500,
            processedError.code || 'INTERNAL_SERVER_ERROR'
        );
    }

    // Send error response
    const statusCode = processedError.statusCode || 500;
    const errorResponse = formatErrorResponse(processedError);

    res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper to catch async errors in route handlers
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

export default {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    DatabaseError,
    errorHandler,
    asyncHandler,
    notFoundHandler
};