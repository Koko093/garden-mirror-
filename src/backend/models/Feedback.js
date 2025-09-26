const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous feedback
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  respondedAt: {
    type: Date
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isReported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ isPublic: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ reservationId: 1 });

// Virtual for average rating calculation
feedbackSchema.statics.getAverageRating = async function() {
  const result = await this.aggregate([
    { $match: { isPublic: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  return result[0]?.avgRating || 0;
};

// Method to get rating distribution
feedbackSchema.statics.getRatingDistribution = async function() {
  return await this.aggregate([
    { $match: { isPublic: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
};

// Method to get recent feedback
feedbackSchema.statics.getRecentFeedback = async function(limit = 10) {
  return await this.find({ isPublic: true })
    .populate('userId', 'name')
    .populate('reservationId', 'eventTitle eventDate')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Feedback', feedbackSchema);