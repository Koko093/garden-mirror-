import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatBot({ isOpen, onToggle }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Garden Mirror assistant. How can I help you today?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock chatbot responses
  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('price') || message.includes('cost') || message.includes('fee')) {
      return 'Our packages range from ₱15,000 to ₱25,000, plus room fees from ₱8,000 to ₱15,000. Would you like specific pricing for a particular package?';
    }
    
    if (message.includes('package') || message.includes('wedding') || message.includes('birthday')) {
      return 'We offer three main packages:\n\n1. Ultimate Wedding Package (₱25,000)\n2. Birthday Celebration (₱15,000)\n3. Corporate Event (₱20,000)\n\nEach package includes venue decoration, photography, catering, and more. Which one interests you?';
    }
    
    if (message.includes('book') || message.includes('reserve') || message.includes('reservation')) {
      return 'To make a reservation:\n\n1. Visit our booking page\n2. Select your event date\n3. Choose a room and package\n4. Provide your details\n5. Pay the 30% downpayment\n\nWould you like me to guide you to our booking system?';
    }
    
    if (message.includes('payment') || message.includes('downpayment') || message.includes('deposit')) {
      return 'Our payment structure:\n\n• 30% downpayment to confirm booking\n• Remaining 70% due on event day\n• We accept credit cards, bank transfers, and cash\n\nDownpayment is required within 48 hours of reservation.';
    }
    
    if (message.includes('cancel') || message.includes('refund') || message.includes('policy')) {
      return 'Cancellation Policy:\n\n• Free cancellation: 30+ days before event\n• 50% refund: 15-29 days before event\n• No refund: Less than 14 days before event\n• Rebooking allowed subject to availability';
    }
    
    if (message.includes('room') || message.includes('venue') || message.includes('capacity')) {
      return 'We have three beautiful venues:\n\n1. Grand Ballroom (200 guests) - ₱15,000\n2. Garden Pavilion (150 guests) - ₱12,000\n3. Intimate Hall (80 guests) - ₱8,000\n\nAll rooms include basic amenities. Which size fits your event?';
    }
    
    if (message.includes('date') || message.includes('available') || message.includes('calendar')) {
      return 'To check availability:\n\n1. Visit our booking calendar\n2. Same-day reservations are not allowed\n3. Some dates may be blocked for maintenance\n\nWould you like to check specific dates?';
    }
    
    if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
      return 'Contact Information:\n\n📧 Email: info@gardenmirror.com\n📞 Phone: +1 (555) 123-4567\n📍 Address: 123 Garden Street, City\n\nOffice Hours: Monday-Sunday 7AM-10PM\nChat Support: 24/7 Available\nLive Agent: Monday-Sunday 7AM-10PM';
    }

    if (message.includes('time') || message.includes('hours') || message.includes('open') || message.includes('close') || message.includes('schedule')) {
      return 'Our Schedule & Availability:\n\n🕐 Chat Support: 24/7 (Automated)\n👤 Live Agents: Monday-Sunday 7AM-10PM\n🏢 Office Hours: Monday-Sunday 7AM-10PM\n📞 Phone Support: Monday-Sunday 7AM-10PM\n\n⏰ Response Times:\n• Immediate: Automated chat\n• Within 30 minutes: Live agent (business hours)\n• Within 2 hours: Email inquiries\n• Peak hours: 9AM-12PM, 2PM-6PM';
    }

    if (message.includes('agent') || message.includes('human') || message.includes('live') || message.includes('representative')) {
      return 'Live Agent Availability:\n\n👥 Live Support Hours:\n• Monday-Sunday: 7AM-10PM\n• Peak Response Times: 9AM-12PM, 2PM-6PM\n• Late Evening: 7PM-10PM (Limited agents)\n\n🤖 I\'m available 24/7 for:\n• Package information\n• Venue details\n• Booking assistance\n• Pricing questions\n• General inquiries\n\nFor urgent matters, a live agent will respond within 30 minutes during business hours.';
    }

    if (message.includes('weekend') || message.includes('saturday') || message.includes('sunday') || message.includes('holiday')) {
      return 'Weekend & Holiday Support:\n\n📅 Weekend Hours:\n• Saturday: 7AM-10PM (Full support)\n• Sunday: 7AM-10PM (Full support)\n• 24/7 Automated chat support\n\n🎉 Holiday Schedule:\n• Major holidays: 9AM-6PM (Reduced hours)\n• Christmas & New Year: Limited live support\n• Emergency bookings: Always available via chat\n• Holiday events: Special extended hours available';
    }

    if (message.includes('when') || message.includes('what time') || message.includes('business hours') || message.includes('support hours')) {
      return 'Operating Hours:\n\n🕐 Main Office: Monday-Sunday 7AM-10PM\n📞 Phone Support: Monday-Sunday 7AM-10PM\n💬 Chat (Me): Available 24/7\n👥 Live Agents: Monday-Sunday 7AM-10PM\n\n📧 Email responses: Within 2 hours during business hours\n🚨 Emergency support: Always available via chat\n🌙 Night inquiries: Responded to by 8AM next day';
    }

    if (message.includes('morning') || message.includes('afternoon') || message.includes('evening') || message.includes('night')) {
      return 'Time-Based Support:\n\n🌅 Morning (7AM-12PM):\n• Full live agent support\n• Quick response times\n• Best time for bookings\n\n🌞 Afternoon (12PM-6PM):\n• Peak hours - highest activity\n• All services available\n• Might have slight delays\n\n🌆 Evening (6PM-10PM):\n• Full support available\n• Great for after-work inquiries\n• Live agents on duty\n\n🌙 Night (10PM-7AM):\n• Automated chat only\n• Responses by 8AM next day\n• Emergency bookings accepted';
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return 'Hello! Welcome to Garden Mirror. I can help you with:\n\n• Package information\n• Venue details\n• Booking process\n• Pricing\n• Availability\n• Support hours & times\n• Policies\n\nWhat would you like to know?';
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return 'You\'re welcome! Is there anything else I can help you with today?';
    }
    
    // Default response
    return 'I can help you with information about our packages, venues, booking process, pricing, support hours, and policies. Could you please be more specific about what you\'d like to know?';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const quickResponses = [
    'Show me packages',
    'Check availability',
    'Pricing information',
    'Support hours',
    'Contact details'
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          className="rounded-full w-14 h-14 shadow-lg"
          size="sm"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 h-96 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5" />
              Garden Mirror Assistant
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.isBot && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    {!message.isBot && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Responses */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Quick options:</p>
              <div className="flex flex-wrap gap-1">
                {quickResponses.map((response, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setInputValue(response);
                      setTimeout(handleSendMessage, 100);
                    }}
                  >
                    {response}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button size="sm" onClick={handleSendMessage} disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}