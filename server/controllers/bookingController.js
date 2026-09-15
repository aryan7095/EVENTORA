const Booking = require('../models/Booking');
const Event = require('../models/Event');
const OTP = require('../models/OTP');
const { sendBookingEmail, sendOTPEmail } = require('../utils/email');

// Generates a random 6-digit numeric OTP as a string (100000–999999)
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /bookings/send-otp - sends an OTP to the logged-in user's email
// as the first step before they can submit a booking request
exports.sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOTP();
        // Remove any previously issued booking OTP for this user before creating a new one
        await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
        await OTP.create({ email: req.user.email, otp, action: 'event_booking' });
        await sendOTPEmail(req.user.email, otp, 'event_booking');
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

// POST /bookings - creates a booking request for an event, gated behind OTP verification
exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;

        // Verify OTP explicitly before proceeding
        const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        // Make sure the event exists and has seats left
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

        // Prevent duplicate active bookings for the same user/event
        // (a previously cancelled booking doesn't block a new one)
        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });
        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Already booked or pending' });
        }

        // Create the booking as "pending" — seats are NOT deducted yet;
        // that happens only when an admin confirms the booking (see confirmBooking below)
        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });

        await OTP.deleteOne({ _id: validOTP._id }); // cleanup

        res.status(201).json({ message: 'Booking request submitted', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// PUT /bookings/:id/confirm - admin-only action to confirm a pending booking
// and set its payment status, deducting a seat from the event
exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body; // 'paid' or 'not_paid'
        const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Avoid double-confirming (which would double-deduct seats)
        if (booking.status === 'confirmed') return res.status(400).json({ message: 'Booking is already confirmed' });

        // Re-check seat availability at confirmation time (seats aren't reserved while pending)
        const event = await Event.findById(booking.eventId._id);
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }

        // Mark booking confirmed and optionally update payment status
        booking.status = 'confirmed';
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }
        await booking.save();

        // Deduct the seat only now, at confirmation time
        event.availableSeats -= 1;
        await event.save();

        // Send email on admin confirmation
        await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// GET /bookings/my - returns bookings for the current user,
// or ALL bookings (with populated user info) if the requester is an admin
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// DELETE /bookings/:id - cancels a booking (by its owner or an admin),
// restoring the event's seat count if the booking had already been confirmed
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        // Only the booking's owner or an admin can cancel it
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        // Track whether a seat was actually deducted for this booking (i.e. it was confirmed),
        // so we know whether to restore it below
        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled';
        await booking.save();

        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed) {
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
