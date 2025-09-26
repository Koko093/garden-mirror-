const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const adminAuth = require('../middleware/adminAuth');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Error fetching room', error: error.message });
  }
});

// Create new room (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      capacity,
      price,
      hourlyRate,
      dailyRate,
      features,
      amenities,
      images,
      isActive = true
    } = req.body;

    const newRoom = new Room({
      name,
      description,
      capacity,
      price,
      hourlyRate,
      dailyRate,
      features,
      amenities,
      images,
      isActive
    });

    const savedRoom = await newRoom.save();
    res.status(201).json({
      success: true,
      roomId: savedRoom._id,
      room: savedRoom,
      message: 'Room created successfully'
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
});

// Update room (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const roomId = req.params.id;
    const updateData = req.body;

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      success: true,
      room: updatedRoom,
      message: 'Room updated successfully'
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: 'Error updating room', error: error.message });
  }
});

// Delete room (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const roomId = req.params.id;

    // Soft delete - set isActive to false
    const deletedRoom = await Room.findByIdAndUpdate(
      roomId,
      { isActive: false },
      { new: true }
    );

    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
});

module.exports = router;