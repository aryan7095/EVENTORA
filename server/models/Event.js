const mongoose = require('mongoose');

// Represents an event that users can browse and book tickets for
const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    // Total number of seats the event was created with (fixed capacity)
    totalSeats: { type: Number, required: true },
    // Seats currently unbooked; decremented when a booking is confirmed, incremented if cancelled
    availableSeats: { type: Number, required: true },
    // Optional image URL for the event
    image: { type: String },
    // Ticket price; defaults to 0 (free event) if not specified
    ticketPrice: { type: Number, required: true, default: 0 },
    // Reference to the admin/user who created this event
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }); // Adds createdAt / updatedAt fields automatically

module.exports = mongoose.model('Event', eventSchema);
