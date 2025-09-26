const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Feedback = require('../models/Feedback');
const Package = require('../models/Package');
const Room = require('../models/Room');

// Get dashboard analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalReservations = await Reservation.countDocuments();
    const totalRevenue = await Reservation.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get monthly bookings for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Reservation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get room utilization
    const roomUtilization = await Reservation.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $lookup: { from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'room' } },
      { $unwind: '$room' },
      { $group: { _id: '$room.name', bookings: { $sum: 1 } } },
      { $project: { room: '$_id', utilization: '$bookings', _id: 0 } }
    ]);

    // Get pending payments
    const pendingPayments = await Reservation.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$balanceAmount' } } }
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalBookings: totalReservations,
      activeUsers: totalUsers,
      pendingPayments: pendingPayments[0]?.total || 0,
      monthlyBookings: monthlyBookings.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        bookings: item.bookings,
        revenue: item.revenue
      })),
      roomUtilization,
      revenueTrend: '+12%', // Mock trend data
      bookingsTrend: '+8%',
      pendingTrend: '-5%',
      usersTrend: '+15%'
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get all payments
router.get('/payments', adminAuth, async (req, res) => {
  try {
    const payments = await Reservation.find({ 
      $or: [
        { downpaymentAmount: { $gt: 0 } },
        { balanceAmount: { $gt: 0 } }
      ]
    })
    .populate('userId', 'name email')
    .populate('roomId', 'name')
    .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Process payment
router.post('/payments', adminAuth, async (req, res) => {
  try {
    const { reservationId, amount, type, method } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Update payment information based on type
    if (type === 'downpayment') {
      reservation.downpaymentAmount = amount;
      reservation.balanceAmount = reservation.totalAmount - amount;
      reservation.status = 'confirmed';
    } else if (type === 'balance') {
      reservation.balanceAmount = Math.max(0, reservation.balanceAmount - amount);
      if (reservation.balanceAmount === 0) {
        reservation.status = 'completed';
      }
    }

    await reservation.save();

    res.json({
      success: true,
      paymentId: `PAY${Date.now()}`,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

// Export reservations
router.post('/export/reservations', adminAuth, async (req, res) => {
  try {
    const { status, dateFrom, search } = req.body;
    
    // Build query
    let query = {};
    if (status) query.status = status;
    if (dateFrom) query.eventDate = { $gte: new Date(dateFrom) };
    if (search) {
      query.$or = [
        { eventTitle: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }

    const reservations = await Reservation.find(query)
      .populate('roomId', 'name')
      .populate('packageId', 'name')
      .sort({ createdAt: -1 });

    // In a real implementation, you would generate a CSV/Excel file
    // For now, we'll just return a success message
    res.json({
      success: true,
      downloadUrl: '#', // Would be actual download URL
      message: 'Export completed successfully',
      count: reservations.length
    });
  } catch (error) {
    console.error('Error exporting reservations:', error);
    res.status(500).json({ message: 'Error exporting reservations', error: error.message });
  }
});

// System settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    // In a real app, you'd store these in a settings collection
    // For now, return default settings
    res.json({
      businessName: 'Garden Mirror',
      logo: '/logo.png',
      downpaymentPercentage: 30,
      currency: 'PHP',
      timezone: 'Asia/Manila',
      emailNotifications: true,
      smsNotifications: false,
      autoConfirmReservations: false,
      allowCancellations: true,
      cancellationDeadlineHours: 24,
      businessAddress: '123 Event Street, Manila, Philippines',
      businessPhone: '+63 912 345 6789',
      businessEmail: 'info@gardenmirror.com',
      taxRate: 12
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

// Update system settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    // In a real app, you'd update the settings in database
    // For now, just return success
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

// Invoice routes
router.post('/invoices/generate/:reservationId', adminAuth, async (req, res) => {
  try {
    const reservationId = req.params.reservationId;
    // In a real implementation, generate PDF invoice
    res.json({
      success: true,
      invoiceUrl: '#', // Would be actual PDF URL
      message: 'Invoice generated successfully'
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Error generating invoice', error: error.message });
  }
});

router.get('/invoices', adminAuth, async (req, res) => {
  try {
    // Return mock invoice data
    res.json({ invoices: [] });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
});

module.exports = router;