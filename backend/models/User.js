import mongoose from 'mongoose';

/**
 * User Schema - Simple model without middleware
 
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_, ret) {
            // Remove password from JSON output
            delete ret.password;
            return ret;
        }
    }
});

/**
 * Index for email uniqueness and query performance
 */
userSchema.index({ email: 1 }, { unique: true });

/**
 * Instance method to get user data without sensitive information
 * @returns {Object} - User object without password
 */
userSchema.methods.toSafeObject = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};



// Create and export the User model
const User = mongoose.model('User', userSchema);

export default User;