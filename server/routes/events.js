const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

// Event routes — reading is public, creating/updating/deleting requires admin auth
// GET /api/events - list all events (supports category/search query params)
router.get('/', getEvents);
// GET /api/events/:id - get a single event's details
router.get('/:id', getEventById);
// POST /api/events - create a new event (admin only)
router.post('/', protect, admin, createEvent);
// PUT /api/events/:id - update an existing event (admin only)
router.put('/:id', protect, admin, updateEvent);
// DELETE /api/events/:id - delete an event (admin only)
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;
