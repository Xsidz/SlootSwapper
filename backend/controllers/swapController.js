

import { Event, SwapRequest } from '../models/index.js';
import mongoose from 'mongoose';
import { NotFoundError, ConflictError, AuthorizationError } from '../middleware/errorHandler.js';


export const getSwappableSlots = async (req, res) => {
    const currentUserId = req.user.userId;

    // Find all swappable events excluding current user's events and SWAP_PENDING events
    const swappableSlots = await Event.find({
        userId: { $ne: currentUserId }, // Exclude current user's events
        status: 'SWAPPABLE' // Only SWAPPABLE events, excludes SWAP_PENDING 
    })
        .populate('userId', 'name email')
        .sort({ startTime: 1 })
        .select('title startTime endTime status userId createdAt updatedAt');

    res.json({
        success: true,
        data: {
            slots: swappableSlots,
            count: swappableSlots.length
        },
        message: 'Swappable slots retrieved successfully'
    });
};


export const createSwapRequest = async (req, res) => {
    const { requesterSlotId, targetSlotId, message } = req.body;
    const requesterUserId = req.user.userId;

    // Prevent self-swaps 
    const targetSlot = await Event.findById(targetSlotId);
    if (!targetSlot) {
        throw new NotFoundError('Target slot not found');
    }

    if (targetSlot.userId.toString() === requesterUserId) {
        throw new ConflictError('You cannot swap with your own slots');
    }

    // Verify requester slot exists and is owned by requester 
    const requesterSlot = await Event.findById(requesterSlotId);
    if (!requesterSlot || requesterSlot.userId.toString() !== requesterUserId) {
        throw new AuthorizationError('You can only offer your own slots for swapping');
    }

    // Verify both slots are SWAPPABLE 
    if (requesterSlot.status !== 'SWAPPABLE') {
        throw new ConflictError('Your slot must be marked as swappable to create a swap request');
    }

    if (targetSlot.status !== 'SWAPPABLE') {
        throw new ConflictError('Target slot is not available for swapping');
    }


    const existingRequest = await SwapRequest.findOne({
        targetSlotId: targetSlotId,
        status: 'PENDING'
    });

    if (existingRequest) {
        throw new ConflictError('This slot already has a pending swap request');
    }


    const duplicateRequest = await SwapRequest.findOne({
        requesterUserId: requesterUserId,
        targetSlotId: targetSlotId,
        status: 'PENDING'
    });

    if (duplicateRequest) {
        throw new ConflictError('You already have a pending request for this slot');
    }


    const session = await mongoose.startSession();

    try {
        let swapRequest;
        await session.withTransaction(async () => {
            // Update both events to SWAP_PENDING status
            await Event.findByIdAndUpdate(
                requesterSlotId,
                { status: 'SWAP_PENDING' },
                { session }
            );

            await Event.findByIdAndUpdate(
                targetSlotId,
                { status: 'SWAP_PENDING' },
                { session }
            );

            // Create swap request
            swapRequest = new SwapRequest({
                requesterUserId,
                requesterSlotId,
                targetUserId: targetSlot.userId,
                targetSlotId,
                message: message || ''
            });

            await swapRequest.save({ session });

            // Populate the created request for response
            await swapRequest.populate([
                { path: 'requesterUserId', select: 'name email' },
                { path: 'targetUserId', select: 'name email' },
                { path: 'requesterSlotId', select: 'title startTime endTime' },
                { path: 'targetSlotId', select: 'title startTime endTime' }
            ]);
        });

        res.status(201).json({
            success: true,
            data: { swapRequest },
            message: 'Swap request created successfully'
        });
    } finally {
        await session.endSession();
    }
};


export const respondToSwapRequest = async (req, res) => {
    const { action, responseMessage } = req.body;
    const swapRequest = req.swapRequest;
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            if (action === 'accept') {

                const requesterSlotId = swapRequest.requesterSlotId._id;
                const targetSlotId = swapRequest.targetSlotId._id;


                const requesterEvent = await Event.findById(requesterSlotId, null, { session });
                const targetEvent = await Event.findById(targetSlotId, null, { session });

                if (!requesterEvent || !targetEvent) {
                    throw new Error('One or both events not found');
                }


                const requesterOriginalStartTime = requesterEvent.startTime;
                const requesterOriginalEndTime = requesterEvent.endTime;
                const targetOriginalStartTime = targetEvent.startTime;
                const targetOriginalEndTime = targetEvent.endTime;




                await Event.findByIdAndUpdate(
                    requesterSlotId,
                    {
                        startTime: targetOriginalStartTime,
                        endTime: targetOriginalEndTime,
                        status: 'BUSY'
                    },
                    { session }
                );

                await Event.findByIdAndUpdate(
                    targetSlotId,
                    {
                        startTime: requesterOriginalStartTime,
                        endTime: requesterOriginalEndTime,
                        status: 'BUSY'
                    },
                    { session }
                );



                // Update swap request status
                swapRequest.status = 'ACCEPTED';
                swapRequest.responseMessage = responseMessage || '';
                swapRequest.respondedAt = new Date();

            } else if (action === 'reject') {

                await Event.findByIdAndUpdate(
                    swapRequest.requesterSlotId._id,
                    { status: 'SWAPPABLE' },
                    { session }
                );

                await Event.findByIdAndUpdate(
                    swapRequest.targetSlotId._id,
                    { status: 'SWAPPABLE' },
                    { session }
                );

                // Update swap request status
                swapRequest.status = 'REJECTED';
                swapRequest.responseMessage = responseMessage || '';
                swapRequest.respondedAt = new Date();
            }

            await swapRequest.save({ session });

            // Populate the updated request for response
            await swapRequest.populate([
                { path: 'requesterUserId', select: 'name email' },
                { path: 'targetUserId', select: 'name email' },
                { path: 'requesterSlotId', select: 'title startTime endTime userId' },
                { path: 'targetSlotId', select: 'title startTime endTime userId' }
            ]);
        });

        res.json({
            success: true,
            data: { swapRequest },
            message: `Swap request ${action}ed successfully`
        });
    } finally {
        await session.endSession();
    }
};


export const getIncomingRequests = async (req, res) => {
    const userId = req.user.userId;
    const { status } = req.query;

    // Build query filter
    const filter = { targetUserId: userId };
    if (status && ['PENDING', 'ACCEPTED', 'REJECTED'].includes(status.toUpperCase())) {
        filter.status = status.toUpperCase();
    }


    const requests = await SwapRequest.find(filter)
        .populate('requesterUserId', 'name email')
        .populate('targetUserId', 'name email')
        .populate('requesterSlotId', 'title startTime endTime')
        .populate('targetSlotId', 'title startTime endTime')
        .sort({ createdAt: -1 }); // Most recent first

    res.json({
        success: true,
        data: {
            requests,
            count: requests.length
        },
        message: 'Incoming swap requests retrieved successfully'
    });
};


export const getOutgoingRequests = async (req, res) => {
    const userId = req.user.userId;
    const { status } = req.query;

    // Build query filter
    const filter = { requesterUserId: userId };
    if (status && ['PENDING', 'ACCEPTED', 'REJECTED'].includes(status.toUpperCase())) {
        filter.status = status.toUpperCase();
    }


    const requests = await SwapRequest.find(filter)
        .populate('requesterUserId', 'name email')
        .populate('targetUserId', 'name email')
        .populate('requesterSlotId', 'title startTime endTime')
        .populate('targetSlotId', 'title startTime endTime')
        .sort({ createdAt: -1 }); // Most recent first

    res.json({
        success: true,
        data: {
            requests,
            count: requests.length
        },
        message: 'Outgoing swap requests retrieved successfully'
    });
};

export default {
    getSwappableSlots,
    createSwapRequest,
    respondToSwapRequest,
    getIncomingRequests,
    getOutgoingRequests
};