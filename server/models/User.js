const mongoose = require('mongoose');

// Represents an application user (regular user or admin)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // Must be unique across all users; used for login and OTP delivery
    email: { type: String, required: true, unique: true },
    // Stores the bcrypt-hashed password (never plaintext — see authController.register)
    password: { type: String, required: true },
    // Determines access level; defaults to 'user', only settable to 'admin' server-side
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // Whether the user has completed OTP verification (admins effectively bypass this check at login)
    isVerified: { type: Boolean, default: false }
}, { timestamps: true }); // Adds createdAt / updatedAt fields automatically

module.exports = mongoose.model('User', userSchema);
