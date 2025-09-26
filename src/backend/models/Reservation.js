const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservationNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: [true, 'Package is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  eventDetails: {
    eventType: {
      type: String,
      required: [true, 'Event type is required']
    },
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      maxlength: [200, 'Event name cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    expectedGuests: {
      type: Number,
      required: [true, 'Expected number of guests is required'],
      min: [1, 'Expected guests must be at least 1']
    },
    specialRequests: [String],
    dietaryRestrictions: [String],
    accessibilityNeeds: [String]
  },
  dateTime: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    setupTime: String,
    cleanupTime: String
  },
  contact: {
    primaryContact: {
      name: {
        type: String,
        required: [true, 'Primary contact name is required']
      },
      phone: {
        type: String,
        required: [true, 'Primary contact phone is required']
      },
      email: {
        type: String,
        required: [true, 'Primary contact email is required']
      },
      relationship: String
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  pricing: {
    packagePrice: {
      type: Number,
      required: [true, 'Package price is required']
    },
    addOns: [{
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }],
    discounts: [{
      type: String,
      amount: Number,
      percentage: Number,
      reason: String
    }],
    taxes: {
      vatAmount: Number,
      serviceTaxAmount: Number,
      otherTaxes: Number
    },
    subtotal: Number,
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required']
    }
  },
  payment: {
    downPaymentAmount: {
      type: Number,
      required: [true, 'Down payment amount is required']
    },
    remainingBalance: {
      type: Number,
      required: [true, 'Remaining balance is required']
    },
    downPaymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    balancePaymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    downPaymentDate: Date,
    balancePaymentDueDate: Date,
    balancePaymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'gcash', 'paymaya', 'grab_pay', 'cash'],
      default: 'credit_card'
    },
    paymentIntentId: String, // PayMongo payment intent ID
    paymongoPaymentId: String, // PayMongo payment ID after completion
    transactionIds: [{
      paymentType: String,
      transactionId: String,
      amount: Number,
      date: Date,
      status: String,
      paymentMethod: String
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  documents: [{
    type: {
      type: String,
      enum: ['contract', 'invoice', 'receipt', 'permit', 'insurance', 'other']
    },
    name: String,
    url: String,
    uploadDate: { type: Date, default: Date.now },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'meeting', 'note']
    },
    subject: String,
    message: String,
    from: String,
    to: String,
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],
  timeline: [{
    event: String,
    description: String,
    date: { type: Date, default: Date.now },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'timeline.performedByModel'
    },
    performedByModel: {
      type: String,
      enum: ['User', 'Admin']
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'cancellation.cancelledByModel'
    },
    cancelledByModel: {
      type: String,
      enum: ['User', 'Admin']
    },
    cancellationDate: Date,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    },
    refundDate: Date
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submissionDate: Date,
    response: String,
    responseDate: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  internalNotes: [{
    note: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: true }
  }],
  assignedStaff: [{
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    role: String,
    responsibilities: [String],
    assignedDate: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reservationSchema.index({ reservationNumber: 1 });
reservationSchema.index({ user: 1, createdAt: -1 });
reservationSchema.index({ package: 1 });
reservationSchema.index({ room: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ 'dateTime.startDate': 1 });
reservationSchema.index({ 'dateTime.endDate': 1 });
reservationSchema.index({ 'payment.downPaymentStatus': 1 });
reservationSchema.index({ 'payment.balancePaymentStatus': 1 });
reservationSchema.index({ createdAt: -1 });

// Virtual for duration in days
reservationSchema.virtual('duration').get(function() {
  if (!this.dateTime.startDate || !this.dateTime.endDate) return 0;
  const diffTime = Math.abs(this.dateTime.endDate - this.dateTime.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for payment status
reservationSchema.virtual('paymentStatus').get(function() {
  if (this.payment.downPaymentStatus === 'paid' && this.payment.balancePaymentStatus === 'paid') {
    return 'fully_paid';
  } else if (this.payment.downPaymentStatus === 'paid') {
    return 'partially_paid';
  }
  return 'unpaid';
});

// Virtual for days until event
reservationSchema.virtual('daysUntilEvent').get(function() {
  if (!this.dateTime.startDate) return null;
  const today = new Date();
  const eventDate = new Date(this.dateTime.startDate);
  const diffTime = eventDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is upcoming
reservationSchema.virtual('isUpcoming').get(function() {
  const daysUntil = this.daysUntilEvent;
  return daysUntil !== null && daysUntil > 0;
});

// Virtual for is overdue payment
reservationSchema.virtual('isOverduePayment').get(function() {
  if (!this.payment.balancePaymentDueDate) return false;
  const today = new Date();
  return today > this.payment.balancePaymentDueDate && 
         this.payment.balancePaymentStatus !== 'paid';
});

// Pre-save middleware to generate reservation number
reservationSchema.pre('save', async function(next) {
  if (this.isNew && !this.reservationNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find the last reservation for today
    const lastReservation = await this.constructor
      .findOne({ reservationNumber: new RegExp(`^GM${year}${month}${day}`) })
      .sort({ reservationNumber: -1 });
    
    let sequence = 1;
    if (lastReservation) {
      const lastSequence = parseInt(lastReservation.reservationNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.reservationNumber = `GM${year}${month}${day}${String(sequence).padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate pricing
reservationSchema.pre('save', function(next) {
  if (this.isModified('pricing')) {
    let subtotal = this.pricing.packagePrice;
    
    // Add add-ons
    if (this.pricing.addOns) {
      subtotal += this.pricing.addOns.reduce((sum, addon) => {
        return sum + (addon.price * (addon.quantity || 1));
      }, 0);
    }
    
    // Apply discounts
    if (this.pricing.discounts) {
      this.pricing.discounts.forEach(discount => {
        if (discount.percentage) {
          subtotal -= (subtotal * discount.percentage / 100);
        } else if (discount.amount) {
          subtotal -= discount.amount;
        }
      });
    }
    
    this.pricing.subtotal = subtotal;
    
    // Add taxes
    let totalAmount = subtotal;
    if (this.pricing.taxes) {
      totalAmount += (this.pricing.taxes.vatAmount || 0);
      totalAmount += (this.pricing.taxes.serviceTaxAmount || 0);
      totalAmount += (this.pricing.taxes.otherTaxes || 0);
    }
    
    this.pricing.totalAmount = totalAmount;
    
    // Calculate down payment and remaining balance
    const downPaymentPercentage = 0.3; // 30% down payment
    this.payment.downPaymentAmount = totalAmount * downPaymentPercentage;
    this.payment.remainingBalance = totalAmount - this.payment.downPaymentAmount;
    
    // Set balance payment due date (7 days before event)
    if (this.dateTime.startDate) {
      const dueDate = new Date(this.dateTime.startDate);
      dueDate.setDate(dueDate.getDate() - 7);
      this.payment.balancePaymentDueDate = dueDate;
    }
  }
  next();
});

// Method to add timeline event
reservationSchema.methods.addTimelineEvent = function(event, description, performedBy, performedByModel, metadata = {}) {
  this.timeline.push({
    event,
    description,
    performedBy,
    performedByModel,
    metadata
  });
  return this.save();
};

// Method to update status with timeline
reservationSchema.methods.updateStatus = function(newStatus, performedBy, performedByModel, reason = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.addTimelineEvent(
    'status_change',
    `Status changed from ${oldStatus} to ${newStatus}${reason ? `: ${reason}` : ''}`,
    performedBy,
    performedByModel
  );
  
  return this.save();
};

// Method to process payment
reservationSchema.methods.processPayment = function(paymentType, amount, transactionId, status = 'completed') {
  this.payment.transactionIds.push({
    paymentType,
    transactionId,
    amount,
    date: new Date(),
    status
  });
  
  if (paymentType === 'down_payment') {
    this.payment.downPaymentStatus = status === 'completed' ? 'paid' : 'failed';
    this.payment.downPaymentDate = new Date();
  } else if (paymentType === 'balance_payment') {
    this.payment.balancePaymentStatus = status === 'completed' ? 'paid' : 'failed';
    this.payment.balancePaymentDate = new Date();
  }
  
  return this.save();
};

// Static method to get reservations by date range
reservationSchema.statics.getByDateRange = function(startDate, endDate, status = null) {
  const query = {
    $or: [
      {
        'dateTime.startDate': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      },
      {
        'dateTime.endDate': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    ]
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('user', 'name email phone')
    .populate('package', 'name category price')
    .populate('room', 'name capacity')
    .sort({ 'dateTime.startDate': 1 });
};

// Static method to check room availability
reservationSchema.statics.checkRoomAvailability = function(roomId, startDate, endDate, excludeReservationId = null) {
  const query = {
    room: roomId,
    status: { $in: ['confirmed', 'in_progress'] },
    $or: [
      {
        'dateTime.startDate': {
          $gte: new Date(startDate),
          $lt: new Date(endDate)
        }
      },
      {
        'dateTime.endDate': {
          $gt: new Date(startDate),
          $lte: new Date(endDate)
        }
      },
      {
        'dateTime.startDate': { $lte: new Date(startDate) },
        'dateTime.endDate': { $gte: new Date(endDate) }
      }
    ]
  };
  
  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }
  
  return this.findOne(query);
};

module.exports = mongoose.model('Reservation', reservationSchema);