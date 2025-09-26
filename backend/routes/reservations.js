const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all reservations (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .populate('room', 'name capacity')
      .populate('package', 'name price')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      reservations 
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching reservations', 
      error: error.message 
    });
  }
});

// Get user's reservations
router.get('/my-reservations', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate('room', 'name capacity')
      .populate('package', 'name price')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      reservations 
    });
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching reservations', 
      error: error.message 
    });
  }
});

// Get reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('roomId', 'name capacity')
      .populate('packageId', 'name price inclusions');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ message: 'Error fetching reservation', error: error.message });
  }
});

// Create new reservation
router.post('/', auth, async (req, res) => {
  try {
    const {
      room,
      package: packageId,
      eventDetails,
      dateTime,
      contact,
      pricing
    } = req.body;

    // Generate unique reservation number
    const reservationNumber = `RES${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate down payment (30% by default)
    const downPaymentAmount = Math.round(pricing.totalAmount * 0.3);
    const remainingBalance = pricing.totalAmount - downPaymentAmount;

    const newReservation = new Reservation({
      reservationNumber,
      user: req.user.id,
      room,
      package: packageId,
      eventDetails: {
        eventType: eventDetails.eventType || 'Event',
        eventName: eventDetails.eventName || 'Customer Event',
        description: eventDetails.description || '',
        expectedGuests: eventDetails.expectedGuests || 1,
        specialRequests: eventDetails.specialRequests || [],
        dietaryRestrictions: eventDetails.dietaryRestrictions || [],
        accessibilityNeeds: eventDetails.accessibilityNeeds || []
      },
      dateTime: {
        startDate: new Date(dateTime.startDate),
        endDate: new Date(dateTime.endDate || dateTime.startDate),
        startTime: dateTime.startTime || '09:00',
        endTime: dateTime.endTime || '17:00',
        setupTime: dateTime.setupTime,
        cleanupTime: dateTime.cleanupTime
      },
      contact: {
        primaryContact: {
          name: contact.primaryContact.name,
          phone: contact.primaryContact.phone,
          email: contact.primaryContact.email,
          relationship: contact.primaryContact.relationship || 'Self'
        },
        emergencyContact: contact.emergencyContact || {}
      },
      pricing: {
        packagePrice: pricing.packagePrice,
        addOns: pricing.addOns || [],
        discounts: pricing.discounts || [],
        taxes: pricing.taxes || {},
        subtotal: pricing.subtotal || pricing.totalAmount,
        totalAmount: pricing.totalAmount
      },
      payment: {
        downPaymentAmount,
        remainingBalance,
        downPaymentStatus: 'pending',
        balancePaymentStatus: 'pending',
        balancePaymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentMethod: 'credit_card'
      },
      status: 'pending'
    });

    const savedReservation = await newReservation.save();
    
    // Populate the saved reservation for response
    await savedReservation.populate('room', 'name capacity');
    await savedReservation.populate('package', 'name price');
    await savedReservation.populate('user', 'name email');
    
    res.status(201).json({
      success: true,
      reservationId: savedReservation._id,
      reservationNumber: savedReservation.reservationNumber,
      reservation: savedReservation,
      message: 'Reservation created successfully'
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
});

// Update reservation status
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const updateData = req.body;

    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservationId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email')
    .populate('roomId', 'name capacity')
    .populate('packageId', 'name price');

    if (!updatedReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json({
      success: true,
      reservation: updatedReservation,
      message: 'Reservation updated successfully'
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ message: 'Error updating reservation', error: error.message });
  }
});

// Check availability
router.post('/check-availability', async (req, res) => {
  try {
    const { roomId, eventDate, startTime, endTime } = req.body;

    // Check for existing reservations that conflict
    const conflictingReservations = await Reservation.find({
      roomId,
      eventDate,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
          ]
        }
      ]
    });

    const available = conflictingReservations.length === 0;

    res.json({
      available,
      conflicts: conflictingReservations
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Error checking availability', error: error.message });
  }
});

// Cancel reservation
router.delete('/:id', auth, async (req, res) => {
  try {
    const reservationId = req.params.id;
    
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user owns the reservation or is admin
    if (reservation.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
  }
});

module.exports = router;