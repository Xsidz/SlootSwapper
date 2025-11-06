import mongoose from 'mongoose';

/**
 * Event Schema with validation and business logic
 
 */
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.startTime;
            },
            message: 'End time must be after start time'
        }
    },
    status: {
        type: String,
        enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'],
        default: 'BUSY',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Basic indexes for performance
eventSchema.index({ userId: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ startTime: 1 });

// Instance methods
eventSchema.methods.isOwnedBy = function (userId) {
    return this.userId.toString() === userId.toString();
};

eventSchema.methods.canBeModified = function () {
    // Events cannot be modified if they have SWAP_PENDING status or are in the past
    const now = new Date();
    return this.status !== 'SWAP_PENDING' && this.startTime > now;
};

// Static methods
eventSchema.statics.findByUserId = function (userId) {
    return this.find({ userId }).sort({ startTime: 1 });
};

eventSchema.statics.findSwappableEvents = function (excludeUserId) {
    return this.find({
        userId: { $ne: excludeUserId },
        status: 'SWAPPABLE'
    }).populate('userId', 'name email').sort({ startTime: 1 });
};

eventSchema.statics.hasTimeConflict = async function (userId, startTime, endTime, excludeEventId = null) {
    const query = {
        userId,
        $or: [
            {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
            }
        ]
    };

    if (excludeEventId) {
        query._id = { $ne: excludeEventId };
    }

    const conflictingEvent = await this.findOne(query);
    return !!conflictingEvent;
};

// Create and export the Event model
const Event = mongoose.model('Event', eventSchema);

export default Event;