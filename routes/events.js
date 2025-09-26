const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// Get public events calendar
router.get('/calendar', async (req, res) => {
  try {
    const events = await Reservation.find({ 
      status: { $in: ['confirmed', 'completed'] } 
    })
    .populate('roomId', 'name')
    .select('eventTitle eventDate startTime endTime roomId')
    .sort({ eventDate: 1 });

    // Format events for calendar display
    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.eventTitle,
      date: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      room: event.roomId?.name || 'Unknown Room'
    }));

    res.json({ events: formattedEvents });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ message: 'Error fetching calendar events', error: error.message });
  }
});

module.exports = router;