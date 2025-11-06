import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    validateSwapRequest,
    validateSwapResponse,
    validateObjectId,
    handleValidationErrors,
    validateSwapRequestAuth
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
    getSwappableSlots,
    createSwapRequest,
    respondToSwapRequest,
    getIncomingRequests,
    getOutgoingRequests
} from '../controllers/swapController.js';

const router = express.Router();

/**
 * GET /api/swappable-slots
 * Fetch available swappable slots for marketplace
 
 */
router.get('/swappable-slots', authenticateToken, asyncHandler(getSwappableSlots));

/**
 * POST /api/swap-request
 * Create a new swap request
 
 */
router.post('/swap-request',
    authenticateToken,
    validateSwapRequest,
    handleValidationErrors,
    asyncHandler(createSwapRequest)
);

/**
 * POST /api/swap-response/:requestId
 * Accept or reject a swap request
 
 */
router.post('/swap-response/:requestId',
    authenticateToken,
    validateObjectId('requestId'),
    validateSwapResponse,
    handleValidationErrors,
    validateSwapRequestAuth,
    asyncHandler(respondToSwapRequest)
);

/**
 * GET /api/swap-requests/incoming
 * Get incoming swap requests for the authenticated user
 
 */
router.get('/swap-requests/incoming', authenticateToken, asyncHandler(getIncomingRequests));

/**
 * GET /api/swap-requests/outgoing
 * Get outgoing swap requests for the authenticated user
 
 */
router.get('/swap-requests/outgoing', authenticateToken, asyncHandler(getOutgoingRequests));

export default router;