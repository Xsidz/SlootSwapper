import mongoose from 'mongoose';

/**
 * Simple SwapRequest Schema
 
 */
const swapRequestSchema = new mongoose.Schema({
    requesterUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requesterSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING',
        required: true
    },
    message: {
        type: String,
        trim: true,
        default: ''
    },
    responseMessage: {
        type: String,
        trim: true,
        default: ''
    },
    respondedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Basic indexes for performance
swapRequestSchema.index({ requesterUserId: 1 });
swapRequestSchema.index({ targetUserId: 1 });
swapRequestSchema.index({ status: 1 });

// Create and export the SwapRequest model
const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

export default SwapRequest;