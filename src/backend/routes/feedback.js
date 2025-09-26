const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all public feedback
router.get('/', async (req, res) => {
  try {
    const feedback = await Feedback.find({ isPublic: true })
      .populate('userId', 'name')
      .populate('reservationId', 'eventTitle eventDate')
      .sort({ createdAt: -1 });
    
    res.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
});

// Get all feedback (Admin only)
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('userId', 'name email')
      .populate('reservationId', 'eventTitle eventDate')
      .sort({ createdAt: -1 });
    
    res.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
});

// Get feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('userId', 'name')
      .populate('reservationId', 'eventTitle eventDate');
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
});

// Submit new feedback
router.post('/', auth, async (req, res) => {
  try {
    const {
      reservationId,
      rating,
      title,
      comment,
      isPublic = false
    } = req.body;

    const newFeedback = new Feedback({
      userId: req.user.id,
      reservationId,
      rating,
      title,
      comment,
      isPublic
    });

    const savedFeedback = await newFeedback.save();
    await savedFeedback.populate('userId', 'name');
    await savedFeedback.populate('reservationId', 'eventTitle eventDate');

    res.status(201).json({
      success: true,
      feedback: savedFeedback,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
});

// Update feedback visibility (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const { isPublic } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { isPublic },
      { new: true }
    ).populate('userId', 'name')
     .populate('reservationId', 'eventTitle eventDate');

    if (!updatedFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      success: true,
      feedback: updatedFeedback,
      message: 'Feedback visibility updated successfully'
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Error updating feedback', error: error.message });
  }
});

// Delete feedback (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const feedbackId = req.params.id;

    const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!deletedFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Error deleting feedback', error: error.message });
  }
});

// Get feedback statistics (Admin only)
router.get('/admin/stats', adminAuth, async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const publicFeedback = await Feedback.countDocuments({ isPublic: true });
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalFeedback,
      publicFeedback,
      avgRating: avgRating[0]?.avgRating || 0,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ message: 'Error fetching feedback statistics', error: error.message });
  }
});

module.exports = router;