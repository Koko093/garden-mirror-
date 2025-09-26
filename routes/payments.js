const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const fetch = require('node-fetch');

// PayMongo API Base URL
const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

// Helper function to create PayMongo payment
const createPayMongoPayment = async (amount, description, reservationId) => {
  try {
    const paymentIntentData = {
      data: {
        attributes: {
          amount: amount * 100, // PayMongo uses cents
          payment_method_allowed: [
            'card',
            'paymaya',
            'grab_pay', 
            'gcash'
          ],
          payment_method_options: {
            card: {
              request_three_d_secure: 'automatic'
            }
          },
          currency: 'PHP',
          description: description,
          statement_descriptor: 'Garden Mirror',
          metadata: {
            reservation_id: reservationId
          }
        }
      }
    };

    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`
      },
      body: JSON.stringify(paymentIntentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`PayMongo error: ${errorData.errors?.[0]?.detail || 'Payment creation failed'}`);
    }

    return await response.json();
  } catch (error) {
    console.error('PayMongo payment creation error:', error);
    throw error;
  }
};

// Create payment intent for reservation downpayment
router.post('/create-payment', auth, async (req, res) => {
  try {
    const { reservationId, amount, type, description } = req.body;

    if (!reservationId || !amount || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: reservationId, amount, type'
      });
    }

    // Find the reservation
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Verify user owns this reservation
    if (reservation.user && reservation.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this reservation'
      });
    }

    // Create PayMongo payment intent
    const paymentDescription = description || `${type === 'downpayment' ? 'Downpayment' : 'Balance'} for Reservation #${reservation.reservation_id}`;
    
    const paymentIntent = await createPayMongoPayment(
      amount,
      paymentDescription,
      reservationId
    );

    // Update reservation with payment intent ID
    reservation.payment.paymentIntentId = paymentIntent.data.id;
    await reservation.save();

    res.json({
      success: true,
      payment_intent: paymentIntent.data,
      client_key: paymentIntent.data.attributes.client_key,
      next_action: paymentIntent.data.attributes.next_action
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment'
    });
  }
});

// Handle PayMongo webhook events
router.post('/paymongo-webhook', async (req, res) => {
  try {
    const sig = req.headers['paymongo-signature'];
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    // Verify webhook signature (if webhook secret is configured)
    if (webhookSecret && sig) {
      const crypto = require('crypto');
      const computedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body, 'utf8')
        .digest('hex');
      
      if (sig !== computedSig) {
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body;
    
    switch (event.data.attributes.type) {
      case 'payment_intent.payment_succeeded':
        await handlePaymentSuccess(event.data);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.data.attributes.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Handle successful payment
const handlePaymentSuccess = async (paymentData) => {
  try {
    const paymentIntentId = paymentData.attributes.payment_intent_id;
    const reservationId = paymentData.attributes.metadata?.reservation_id;

    if (!reservationId) {
      console.error('No reservation ID in payment metadata');
      return;
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      console.error(`Reservation not found: ${reservationId}`);
      return;
    }

    // Determine payment type based on amount
    const paidAmount = paymentData.attributes.amount / 100; // Convert from cents
    const isDownpayment = paidAmount === reservation.payment.downPaymentAmount;

    if (isDownpayment) {
      reservation.payment.downPaymentStatus = 'paid';
      reservation.payment.downPaymentDate = new Date();
      reservation.status = 'confirmed';
    } else {
      reservation.payment.balancePaymentStatus = 'paid';
      reservation.payment.balancePaymentDate = new Date();
    }

    reservation.payment.paymongoPaymentId = paymentData.id;
    await reservation.save();

    console.log(`Payment processed successfully for reservation ${reservationId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

// Handle failed payment
const handlePaymentFailure = async (paymentData) => {
  try {
    const reservationId = paymentData.attributes.metadata?.reservation_id;

    if (!reservationId) {
      console.error('No reservation ID in payment metadata');
      return;
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      console.error(`Reservation not found: ${reservationId}`);
      return;
    }

    reservation.payment.downPaymentStatus = 'failed';
    await reservation.save();

    console.log(`Payment failed for reservation ${reservationId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

// Get payment methods available
router.get('/payment-methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      {
        type: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, JCB',
        logo: 'card'
      },
      {
        type: 'gcash',
        name: 'GCash',
        description: 'Pay using your GCash wallet',
        logo: 'gcash'
      },
      {
        type: 'paymaya',
        name: 'PayMaya',
        description: 'Pay using your PayMaya account',
        logo: 'paymaya'
      },
      {
        type: 'grab_pay',
        name: 'GrabPay',
        description: 'Pay using your Grab wallet',
        logo: 'grab_pay'
      }
    ]
  });
});

// Verify payment status
router.get('/verify/:paymentIntentId', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment status');
    }

    const paymentIntent = await response.json();

    res.json({
      success: true,
      status: paymentIntent.data.attributes.status,
      payment_intent: paymentIntent.data
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment status'
    });
  }
});

// Get user's payment history
router.get('/history', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ 
      user_id: req.user.id,
      payment_status: { $in: ['downpayment_paid', 'fully_paid'] }
    })
    .populate('room_id', 'name')
    .populate('package_id', 'name')
    .sort({ created_at: -1 });

    const paymentHistory = reservations.map(reservation => ({
      id: reservation._id,
      reservation_id: reservation.reservation_id,
      room_name: reservation.room_id?.name,
      package_name: reservation.package_id?.name,
      event_date: reservation.event_date,
      total_amount: reservation.total_amount,
      downpayment_amount: reservation.downpayment_amount,
      balance_amount: reservation.balance_amount,
      payment_status: reservation.payment_status,
      downpayment_paid_at: reservation.downpayment_paid_at,
      balance_paid_at: reservation.balance_paid_at,
      created_at: reservation.created_at
    }));

    res.json({
      success: true,
      payments: paymentHistory
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

module.exports = router;