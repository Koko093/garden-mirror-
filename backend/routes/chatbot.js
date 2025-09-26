const express = require('express');
const router = express.Router();

// Chatbot message handler
router.post('/message', async (req, res) => {
  try {
    const { message, context } = req.body;

    // Simple keyword-based responses
    const responses = {
      'hello': 'Hello! Welcome to Garden Mirror. How can I help you today?',
      'hi': 'Hi there! I\'m here to help you with your event planning needs.',
      'help': 'I can assist you with:\n- Room availability\n- Package information\n- Pricing details\n- Booking process\n- Contact information',
      'rooms': 'We have several beautiful event spaces available. Would you like to know about our rooms or check availability?',
      'packages': 'We offer various event packages to suit your needs. Would you like more details about our packages?',
      'price': 'Our pricing varies based on the room, package, and duration. Please contact us for a detailed quote.',
      'contact': 'You can reach us at:\nPhone: +63 912 345 6789\nEmail: info@gardenmirror.com\nAddress: 123 Event Street, Manila, Philippines',
      'hours': 'Our business hours are:\nMonday - Sunday: 8:00 AM - 10:00 PM',
      'booking': 'To make a booking, you can use our online reservation system or contact us directly.',
      'thanks': 'You\'re welcome! Is there anything else I can help you with?',
      'bye': 'Thank you for contacting Garden Mirror! Have a great day!'
    };

    // Find matching response
    const lowerMessage = message.toLowerCase();
    let response = 'I\'m sorry, I didn\'t understand that. Could you please rephrase your question or ask about rooms, packages, pricing, or contact information?';

    for (const [keyword, reply] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        response = reply;
        break;
      }
    }

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    res.status(500).json({ message: 'Error processing message', error: error.message });
  }
});

module.exports = router;