const express = require('express');
const router = express.Router();
const { bookEvent, confirmBooking, getMyBookings, cancelBooking, sendBookingOTP } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

// Booking routes — all require authentication (protect); confirming is admin-only
// POST /api/bookings/send-otp - sends OTP to the logged-in user before booking
router.post('/send-otp', protect, sendBookingOTP);
// POST /api/bookings - submit a booking request (requires valid OTP)
router.post('/', protect, bookEvent);
// PUT /api/bookings/:id/confirm - admin confirms a pending booking and sets payment status
router.put('/:id/confirm', protect, admin, confirmBooking);
// GET /api/bookings/my - get current user's bookings, or all bookings if admin
router.get('/my', protect, getMyBookings);
// DELETE /api/bookings/:id - cancel a booking (owner or admin)
router.delete('/:id', protect, cancelBooking);

module.exports = router;
