const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['banquet_hall', 'conference_room', 'outdoor_garden', 'ballroom', 'meeting_room', 'ceremony_hall'],
    required: [true, 'Room type is required']
  },
  capacity: {
    min: {
      type: Number,
      required: [true, 'Minimum capacity is required'],
      min: [1, 'Minimum capacity must be at least 1']
    },
    max: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      min: [1, 'Maximum capacity must be at least 1']
    },
    optimal: {
      type: Number,
      required: [true, 'Optimal capacity is required'],
      min: [1, 'Optimal capacity must be at least 1']
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    area: Number,
    unit: {
      type: String,
      enum: ['meters', 'feet'],
      default: 'meters'
    }
  },
  amenities: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['audio_visual', 'furniture', 'lighting', 'climate', 'accessibility', 'catering', 'other']
    },
    included: {
      type: Boolean,
      default: true
    },
    additionalCost: {
      type: Number,
      default: 0
    }
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
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  location: {
    floor: String,
    building: String,
    address: {
      street: String,
      city: String,
      province: String,
      zipCode: String,
      country: {
        type: String,
        default: 'Philippines'
      }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    accessibility: {
      wheelchairAccessible: {
        type: Boolean,
        default: false
      },
      elevatorAccess: {
        type: Boolean,
        default: false
      },
      parkingAvailable: {
        type: Boolean,
        default: false
      },
      publicTransport: String
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative']
    },
    currency: {
      type: String,
      default: 'PHP'
    },
    pricingType: {
      type: String,
      enum: ['per_hour', 'per_day', 'per_event', 'flat_rate'],
      default: 'per_day'
    },
    minimumBooking: {
      hours: {
        type: Number,
        default: 4
      },
      days: {
        type: Number,
        default: 1
      }
    },
    seasonalPricing: [{
      season: String,
      startDate: Date,
      endDate: Date,
      priceMultiplier: {
        type: Number,
        default: 1
      }
    }],
    weekendSurcharge: {
      type: Number,
      default: 0
    },
    holidaySurcharge: {
      type: Number,
      default: 0
    }
  },
  availability: {
    operatingHours: {
      start: {
        type: String,
        default: '08:00'
      },
      end: {
        type: String,
        default: '22:00'
      }
    },
    daysOfWeek: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    blackoutDates: [{
      date: Date,
      reason: String,
      isRecurring: {
        type: Boolean,
        default: false
      }
    }],
    maintenanceSchedule: [{
      startDate: Date,
      endDate: Date,
      description: String,
      type: {
        type: String,
        enum: ['cleaning', 'renovation', 'repair', 'inspection']
      }
    }]
  },
  features: {
    layout: {
      type: String,
      enum: ['classroom', 'theater', 'banquet', 'cocktail', 'conference', 'u_shape', 'boardroom', 'reception']
    },
    setupOptions: [String],
    naturalLight: {
      type: Boolean,
      default: false
    },
    soundproofing: {
      type: Boolean,
      default: false
    },
    airConditioning: {
      type: Boolean,
      default: false
    },
    heating: {
      type: Boolean,
      default: false
    },
    wifi: {
      available: {
        type: Boolean,
        default: true
      },
      speed: String,
      password: String
    },
    catering: {
      kitchenAccess: {
        type: Boolean,
        default: false
      },
      cateringAllowed: {
        type: Boolean,
        default: true
      },
      preferredVendors: [String],
      restrictions: [String]
    }
  },
  policies: {
    cancellation: {
      policy: String,
      noticePeriod: {
        type: Number,
        default: 48
      },
      refundPercentage: {
        type: Number,
        default: 50
      }
    },
    smoking: {
      type: String,
      enum: ['allowed', 'prohibited', 'designated_areas'],
      default: 'prohibited'
    },
    alcohol: {
      type: String,
      enum: ['allowed', 'prohibited', 'licensed_only'],
      default: 'allowed'
    },
    pets: {
      type: String,
      enum: ['allowed', 'prohibited', 'service_animals_only'],
      default: 'prohibited'
    },
    music: {
      allowed: {
        type: Boolean,
        default: true
      },
      volumeLimit: String,
      cutoffTime: String
    },
    decoration: {
      allowed: {
        type: Boolean,
        default: true
      },
      restrictions: [String],
      cleanupRequired: {
        type: Boolean,
        default: true
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'renovation'],
    default: 'active'
  },
  popularity: {
    bookingCount: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    views: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    seoTitle: String,
    seoDescription: String,
    keywords: [String],
    tags: [String],
    featured: {
      type: Boolean,
      default: false
    },
    priority: {
      type: Number,
      default: 0
    }
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
roomSchema.index({ name: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ 'capacity.max': 1 });
roomSchema.index({ 'pricing.basePrice': 1 });
roomSchema.index({ 'popularity.rating.average': -1 });
roomSchema.index({ 'popularity.bookingCount': -1 });
roomSchema.index({ createdAt: -1 });
roomSchema.index({ 'metadata.featured': -1, 'metadata.priority': -1 });

// Virtual for main image
roomSchema.virtual('mainImage').get(function() {
  const mainImg = this.images.find(img => img.isMain);
  return mainImg || this.images[0];
});

// Virtual for capacity range
roomSchema.virtual('capacityRange').get(function() {
  return `${this.capacity.min}-${this.capacity.max} guests`;
});

// Virtual for price per person
roomSchema.virtual('pricePerPerson').get(function() {
  if (!this.capacity.optimal || this.capacity.optimal === 0) return 0;
  return Math.round(this.pricing.basePrice / this.capacity.optimal);
});

// Virtual for is available
roomSchema.virtual('isAvailable').get(function() {
  return this.status === 'active';
});

// Virtual for total area
roomSchema.virtual('totalArea').get(function() {
  if (this.dimensions && this.dimensions.length && this.dimensions.width) {
    return this.dimensions.length * this.dimensions.width;
  }
  return this.dimensions ? this.dimensions.area : 0;
});

// Pre-save middleware to calculate area
roomSchema.pre('save', function(next) {
  if (this.dimensions && this.dimensions.length && this.dimensions.width && !this.dimensions.area) {
    this.dimensions.area = this.dimensions.length * this.dimensions.width;
  }
  next();
});

// Pre-save middleware to validate capacity
roomSchema.pre('save', function(next) {
  if (this.capacity.min > this.capacity.max) {
    return next(new Error('Minimum capacity cannot be greater than maximum capacity'));
  }
  if (this.capacity.optimal > this.capacity.max || this.capacity.optimal < this.capacity.min) {
    return next(new Error('Optimal capacity must be between minimum and maximum capacity'));
  }
  next();
});

// Method to check availability for date range
roomSchema.methods.isAvailableForDates = async function(startDate, endDate) {
  if (this.status !== 'active') return false;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check blackout dates
  const hasBlackoutConflict = this.availability.blackoutDates.some(blackout => {
    const blackoutDate = new Date(blackout.date);
    return blackoutDate >= start && blackoutDate <= end;
  });

  if (hasBlackoutConflict) return false;

  // Check maintenance schedule
  const hasMaintenanceConflict = this.availability.maintenanceSchedule.some(maintenance => {
    const maintenanceStart = new Date(maintenance.startDate);
    const maintenanceEnd = new Date(maintenance.endDate);
    return (maintenanceStart <= end && maintenanceEnd >= start);
  });

  if (hasMaintenanceConflict) return false;

  // Check day of week availability
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[start.getDay()];

  if (this.availability.daysOfWeek.length > 0 && 
      !this.availability.daysOfWeek.includes(dayOfWeek)) {
    return false;
  }

  return true;
};

// Method to calculate price for date range
roomSchema.methods.calculatePrice = function(startDate, endDate, guestCount = null) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  
  let price = this.pricing.basePrice;
  let multiplier = 1;

  // Calculate based on pricing type
  if (this.pricing.pricingType === 'per_hour') {
    const hours = Math.ceil(diffTime / (1000 * 60 * 60));
    multiplier = Math.max(hours, this.pricing.minimumBooking.hours || 1);
  } else if (this.pricing.pricingType === 'per_day') {
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    multiplier = Math.max(days, this.pricing.minimumBooking.days || 1);
  }

  price *= multiplier;

  // Apply weekend surcharge
  const dayOfWeek = start.getDay();
  if ((dayOfWeek === 0 || dayOfWeek === 6) && this.pricing.weekendSurcharge > 0) {
    price += this.pricing.weekendSurcharge;
  }

  // Apply seasonal pricing
  const currentSeason = this.pricing.seasonalPricing.find(season => {
    const seasonStart = new Date(season.startDate);
    const seasonEnd = new Date(season.endDate);
    return start >= seasonStart && start <= seasonEnd;
  });

  if (currentSeason) {
    price *= currentSeason.priceMultiplier;
  }

  return Math.round(price);
};

// Method to increment views
roomSchema.methods.incrementViews = function() {
  this.popularity.views += 1;
  return this.save();
};

// Method to update rating
roomSchema.methods.updateRating = function(newRating) {
  const currentAverage = this.popularity.rating.average;
  const currentCount = this.popularity.rating.count;
  
  const newCount = currentCount + 1;
  const newAverage = ((currentAverage * currentCount) + newRating) / newCount;
  
  this.popularity.rating.average = Math.round(newAverage * 10) / 10;
  this.popularity.rating.count = newCount;
  
  return this.save();
};

// Static method to get available rooms
roomSchema.statics.getAvailable = function(startDate, endDate, capacity = null) {
  const query = { status: 'active' };
  
  if (capacity) {
    query['capacity.max'] = { $gte: capacity };
    query['capacity.min'] = { $lte: capacity };
  }

  return this.find(query)
    .sort({ 'popularity.rating.average': -1, 'popularity.bookingCount': -1 });
};

// Static method to get popular rooms
roomSchema.statics.getPopular = function(limit = 6) {
  return this.find({ status: 'active' })
    .sort({ 
      'popularity.bookingCount': -1, 
      'popularity.rating.average': -1,
      'metadata.priority': -1 
    })
    .limit(limit);
};

// Static method to get featured rooms
roomSchema.statics.getFeatured = function(limit = 3) {
  return this.find({ 
    status: 'active', 
    'metadata.featured': true 
  })
    .sort({ 'metadata.priority': -1, createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Room', roomSchema);