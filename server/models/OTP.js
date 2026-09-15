const mongoose = require('mongoose');

// Represents a one-time password issued for either account verification or event booking
const otpSchema = new mongoose.Schema({
    // Email address the OTP was sent to (used to look it up during verification)
    email: { type: String, required: true },
    // The 6-digit OTP code itself
    otp: { type: String, required: true },
    // What the OTP is being used for — scopes it to a specific flow so an OTP
    // issued for one purpose can't be reused for another
    action: { type: String, enum: ['account_verification', 'event_booking'], required: true },
    // MongoDB TTL index: this document is automatically deleted 300 seconds (5 minutes)
    // after createdAt, causing the OTP to expire on its own
    createdAt: { type: Date, default: Date.now, expires: 300 } // OTP expires in 5 minutes
});

module.exports = mongoose.model('OTP', otpSchema);
