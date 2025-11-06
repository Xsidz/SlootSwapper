import express from 'express';
import {
    createEvent,
    getUserEvents,
    getSwappableEvents,
    updateEvent,
    deleteEvent,
    updateEventStatus
} from '../controllers/eventController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
    validateEventCreation,
    validateEventUpdate,
    validateEventStatusUpdate,
    validateObjectId,
    handleValidationErrors,
    validateEventOwnership
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * All event routes require authentication
 */
router.use(authenticateToken);

/**
 * GET /api/events
 * Fetch user's events
 
 */
router.get('/', asyncHandler(getUserEvents));

/**
 * POST /api/events
 * Create a new event
 
 */
router.post('/', validateEventCreation, handleValidationErrors, asyncHandler(createEvent));

/**
 * PUT /api/events/:id
 * Update an existing event
 
 */
router.put('/:id',
    validateObjectId('id'),
    validateEventUpdate,
    handleValidationErrors,
    validateEventOwnership,
    asyncHandler(updateEvent)
);

/**
 * DELETE /api/events/:id
 * Delete an event and cleanup associated swap requests
 
 */
router.delete('/:id',
    validateObjectId('id'),
    handleValidationErrors,
    validateEventOwnership,
    asyncHandler(deleteEvent)
);

/**
 * PATCH /api/events/:id/status
 * Update event status (BUSY/SWAPPABLE)
 
 */
router.patch('/:id/status',
    validateObjectId('id'),
    validateEventStatusUpdate,
    handleValidationErrors,
    validateEventOwnership,
    asyncHandler(updateEventStatus)
);

/**
 * GET /api/events/marketplace
 * Get swappable events from other users (marketplace)
 * This will be used by the swap system
 */
router.get('/marketplace', asyncHandler(getSwappableEvents));

export default router;