import { Event } from '../models/index.js';
import { validationResult } from 'express-validator';


export const createEvent = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: errors.array()
                }
            });
        }

        const { title, startTime, endTime, status } = req.body;
        const userId = req.user.userId;

       

        // Create new event
        const event = new Event({
            title,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: status || 'BUSY',
            userId
        });

        await event.save();

        res.status(201).json({
            success: true,
            data: { event },
            message: 'Event created successfully'
        });

    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EVENT_CREATION_FAILED',
                message: 'Failed to create event'
            }
        });
    }
};


export const getUserEvents = async (req, res) => {
    try {
        const userId = req.user.userId;
        const events = await Event.findByUserId(userId);

        res.json({
            success: true,
            data: { events },
            message: 'Events retrieved successfully'
        });

    } catch (error) {
        console.error('Get user events error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EVENTS_FETCH_FAILED',
                message: 'Failed to fetch events'
            }
        });
    }
};


export const getSwappableEvents = async (req, res) => {
    try {
        const userId = req.user.userId;
        const events = await Event.findSwappableEvents(userId);

        res.json({
            success: true,
            data: { events },
            message: 'Swappable events retrieved successfully'
        });

    } catch (error) {
        console.error('Get swappable events error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'MARKETPLACE_FETCH_FAILED',
                message: 'Failed to fetch marketplace events'
            }
        });
    }
};


export const updateEvent = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: errors.array()
                }
            });
        }

        const { id } = req.params;
        const userId = req.user.userId;
        const updates = req.body;

        // Find event
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Event not found'
                }
            });
        }

        // Check ownership
        if (!event.isOwnedBy(userId)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only update your own events'
                }
            });
        }

        // Check if event can be modified
        if (!event.canBeModified()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'EVENT_LOCKED',
                    message: 'Event cannot be modified (has pending swap requests or is in the past)'
                }
            });
        }

        // Note: Time conflict checking removed for flexibility
        // Users can update events to overlap with others if needed

        // Update event
        Object.assign(event, updates);
        if (updates.startTime) event.startTime = new Date(updates.startTime);
        if (updates.endTime) event.endTime = new Date(updates.endTime);

        await event.save();

        res.json({
            success: true,
            data: { event },
            message: 'Event updated successfully'
        });

    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EVENT_UPDATE_FAILED',
                message: 'Failed to update event'
            }
        });
    }
};


export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Find event
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Event not found'
                }
            });
        }

        // Check ownership
        if (!event.isOwnedBy(userId)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only delete your own events'
                }
            });
        }

        // Import SwapRequest model for cleanup
        const { SwapRequest } = await import('../models/index.js');

        // Clean up any swap requests involving this event
        await SwapRequest.deleteMany({
            $or: [
                { requesterSlotId: id },
                { targetSlotId: id }
            ]
        });

        // Delete event
        await Event.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EVENT_DELETION_FAILED',
                message: 'Failed to delete event'
            }
        });
    }
};


export const updateEventStatus = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: errors.array()
                }
            });
        }

        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;

        // Find event
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: 'Event not found'
                }
            });
        }

        // Check ownership
        if (!event.isOwnedBy(userId)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'You can only modify your own events'
                }
            });
        }

        // Prevent status changes on SWAP_PENDING events
        if (event.status === 'SWAP_PENDING') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'EVENT_LOCKED',
                    message: 'Cannot change status of events with pending swap requests'
                }
            });
        }

        // Update status
        event.status = status;
        await event.save();

        res.json({
            success: true,
            data: { event },
            message: 'Event status updated successfully'
        });

    } catch (error) {
        console.error('Update event status error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EVENT_STATUS_UPDATE_FAILED',
                message: 'Failed to update event status'
            }
        });
    }
};

export default {
    createEvent,
    getUserEvents,
    getSwappableEvents,
    updateEvent,
    deleteEvent,
    updateEventStatus
};