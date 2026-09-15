const mongoose = require('mongoose');

// Represents a user's request to book a seat at an event
const bookingSchema = new mongoose.Schema({
    // Reference to the user who made the booking
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Reference to the event being booked
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    // Booking lifecycle state: starts as "pending" until an admin confirms or cancels it
    status: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'pending' },
    // Whether payment has been marked as received; set/updated by admin during confirmation
    paymentStatus: { type: String, enum: ['paid', 'not_paid'], default: 'not_paid' },
    // Ticket price at time of booking (snapshot, so later event price changes don't affect existing bookings)
    amount: { type: Number, required: true },
    // Timestamp of when the booking was made
    bookedAt: { type: Date, default: Date.now }
}, { timestamps: true }); // Adds createdAt / updatedAt fields automatically

module.exports = mongoose.model('Booking', bookingSchema);
