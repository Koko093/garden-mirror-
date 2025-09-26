const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true,
    maxlength: [100, 'Package name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Package description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Graduation', 'Baby Shower', 'Reunion', 'Holiday', 'Other'],
    required: [true, 'Package category is required']
  },
  price: {
    type: Number,
    required: [true, 'Package price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function(v) {
        return !v || v < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  duration: {
    type: String,
    required: [true, 'Package duration is required'],
    maxlength: [50, 'Duration cannot exceed 50 characters']
  },
  maxGuests: {
    type: Number,
    required: [true, 'Maximum guests is required'],
    min: [1, 'Maximum guests must be at least 1']
  },
  inclusions: [{
    type: String,
    required: true,
    maxlength: [200, 'Inclusion cannot exceed 200 characters']
  }],
  exclusions: [{
    type: String,
    maxlength: [200, 'Exclusion cannot exceed 200 characters']
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    caption: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  features: {
    catering: {
      included: { type: Boolean, default: false },
      options: [String],
      additionalCost: Number
    },
    decoration: {
      included: { type: Boolean, default: false },
      theme: String,
      options: [String],
      additionalCost: Number
    },
    entertainment: {
      included: { type: Boolean, default: false },
      options: [String],
      additionalCost: Number
    },
    photography: {
      included: { type: Boolean, default: false },
      hours: Number,
      additionalCost: Number
    },
    transportation: {
      included: { type: Boolean, default: false },
      options: [String],
      additionalCost: Number
    }
  },
  availability: {
    daysOfWeek: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeSlots: [{
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    }],
    blackoutDates: [{
      date: Date,
      reason: String
    }],
    seasonalPricing: [{
      season: String,
      startDate: Date,
      endDate: Date,
      priceMultiplier: { type: Number, default: 1 }
    }]
  },
  requirements: {
    advanceBooking: {
      type: Number,
      default: 7,
      min: [1, 'Advance booking must be at least 1 day']
    },
    downPayment: {
      type: Number,
      default: 0.3,
      min: [0, 'Down payment cannot be negative'],
      max: [1, 'Down payment cannot exceed 100%']
    },
    cancellationPolicy: {
      type: String,
      maxlength: [500, 'Cancellation policy cannot exceed 500 characters']
    },
    ageRestrictions: String,
    specialRequirements: [String]
  },
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  addOns: [{
    name: String,
    description: String,
    price: Number,
    category: String,
    available: { type: Boolean, default: true }
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'active'
  },
  priority: {
    type: Number,
    default: 0,
    min: [0, 'Priority cannot be negative']
  },
  tags: [String],
  seoData: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  analytics: {
    views: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
packageSchema.index({ name: 1 });
packageSchema.index({ category: 1 });
packageSchema.index({ price: 1 });
packageSchema.index({ status: 1 });
packageSchema.index({ priority: -1 });
packageSchema.index({ createdAt: -1 });
packageSchema.index({ 'analytics.views': -1 });
packageSchema.index({ 'analytics.bookings': -1 });

// Virtual for effective price (considering discount)
packageSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice || this.price;
});

// Virtual for discount percentage
packageSchema.virtual('discountPercentage').get(function() {
  if (!this.discountPrice) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Virtual for main image
packageSchema.virtual('mainImage').get(function() {
  const mainImg = this.images.find(img => img.isMain);
  return mainImg || this.images[0];
});

// Virtual for average rating
packageSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual for total reviews count
packageSchema.virtual('totalReviews').get(function() {
  return this.reviews ? this.reviews.length : 0;
});

// Virtual for availability status
packageSchema.virtual('isAvailable').get(function() {
  return this.status === 'active';
});

// Pre-save middleware to update analytics
packageSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    this.analytics.conversionRate = (this.analytics.bookings / this.analytics.views) * 100;
  }
  next();
});

// Static method to get popular packages
packageSchema.statics.getPopular = function(limit = 6) {
  return this.find({ status: 'active' })
    .sort({ 'analytics.bookings': -1, 'analytics.views': -1, priority: -1 })
    .limit(limit)
    .populate('rooms', 'name capacity images');
};

// Static method to get packages by category
packageSchema.statics.getByCategory = function(category, limit = 10) {
  const query = { status: 'active' };
  if (category && category !== 'all') {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit)
    .populate('rooms', 'name capacity images');
};

// Method to increment views
packageSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

// Method to add review
packageSchema.methods.addReview = function(userId, rating, comment) {
  this.reviews.push({
    user: userId,
    rating,
    comment,
    verified: false
  });
  
  return this.save();
};

// Method to check availability for date range
packageSchema.methods.isAvailableForDates = function(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check blackout dates
  const hasBlackoutConflict = this.availability.blackoutDates.some(blackout => {
    const blackoutDate = new Date(blackout.date);
    return blackoutDate >= start && blackoutDate <= end;
  });
  
  if (hasBlackoutConflict) return false;
  
  // Check day of week availability
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[start.getDay()];
  
  if (this.availability.daysOfWeek.length > 0 && 
      !this.availability.daysOfWeek.includes(dayOfWeek)) {
    return false;
  }
  
  return true;
};

module.exports = mongoose.model('Package', packageSchema);