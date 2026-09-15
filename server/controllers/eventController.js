const Event = require('../models/Event');

// GET /events - returns all events, optionally filtered by category and/or
// a case-insensitive title search
exports.getEvents = async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) filters.category = req.query.category;
        // Case-insensitive partial match on title for search functionality
        if (req.query.search) filters.title = { $regex: req.query.search, $options: 'i' };

        // Populate creator's name/email instead of just their ID
        const events = await Event.find(filters).populate('createdBy', 'name email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// GET /events/:id - returns a single event by ID
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// POST /events - creates a new event (admin-only, enforced elsewhere e.g. via route middleware)
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, totalSeats, ticketPrice, image } = req.body;
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            // availableSeats starts equal to totalSeats since no bookings exist yet
            availableSeats: totalSeats,
            // Default to a free event if no price is given
            ticketPrice: ticketPrice || 0,
            image: image || '',
            // Track which admin/user created this event
            createdBy: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// PUT /events/:id - updates an existing event with whatever fields are provided in the body
exports.updateEvent = async (req, res) => {
    try {
        // Note: passes req.body directly, so any field on the Event model could be updated here
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// DELETE /events/:id - deletes an event by ID
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
