import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { CalendarDays, Users, CreditCard, CheckCircle, AlertCircle, Shield, FileText } from 'lucide-react';
import { api } from '../lib/api';
import { Room, Package } from '../types';
import { TermsAndConditions } from './TermsAndConditions';
import { PayMongoPayment } from './PayMongoPayment';

interface ReservationSystemProps {
  onPageChange: (page: string) => void;
}

export function ReservationSystem({ onPageChange }: ReservationSystemProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [guestCount, setGuestCount] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [reservationId, setReservationId] = useState<string>('');
  const [showTerms, setShowTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToCybercrime, setAgreedToCybercrime] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [roomsData, packagesData] = await Promise.all([
          api.getRooms(),
          api.getPackages()
        ]);
        setRooms(roomsData);
        setPackages(packagesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Mock unavailable dates (for demonstration)
  const unavailableDates = [
    new Date(2024, 11, 10), // December 10, 2024
    new Date(2024, 11, 15), // December 15, 2024
    new Date(2024, 11, 25), // December 25, 2024
  ];

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable same-day reservations and past dates
    if (date < today) return true;
    
    // Disable unavailable dates
    return unavailableDates.some(unavailableDate => 
      date.toDateString() === unavailableDate.toDateString()
    );
  };

  const calculateTotal = () => {
    const room = rooms.find(r => r.id === selectedRoom);
    const pkg = packages.find(p => p.id === selectedPackage);
    const roomPrice = room?.price || 0;
    const packagePrice = pkg?.price || 0;
    return roomPrice + packagePrice;
  };

  const calculateDownpayment = () => {
    return Math.round(calculateTotal() * 0.3);
  };

  const calculateBalance = () => {
    return calculateTotal() - calculateDownpayment();
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedRoom || !selectedPackage) return;
    
    setIsLoading(true);
    try {
      const reservationData = {
        eventDate: selectedDate.toISOString(),
        roomId: selectedRoom,
        packageId: selectedPackage,
        guestCount: parseInt(guestCount),
        customerInfo,
        totalAmount: calculateTotal(),
        downpayment: calculateDownpayment(),
        balance: calculateBalance()
      };

      const response = await api.createReservation(reservationData);
      
      if (response.success) {
        setReservationId(response.reservationId);
        setShowPayment(true);
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      alert('Failed to submit reservation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentCompleted(true);
    setShowPayment(false);
    setIsSubmitted(true);
    setTimeout(() => {
      onPageChange('home');
    }, 5000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert('Payment failed: ' + error);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const canProceedToStep2 = selectedDate && selectedRoom && selectedPackage && guestCount;
  const canProceedToStep3 = customerInfo.name && customerInfo.email && customerInfo.phone;
  const canSubmit = agreedToTerms && agreedToPrivacy && agreedToCybercrime;

  // Show payment interface
  if (showPayment && reservationId) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl mb-2">Complete Your Payment</h1>
            <p className="text-muted-foreground">
              Secure your reservation with a 30% downpayment
            </p>
          </div>
          <PayMongoPayment
            reservationId={reservationId}
            amount={calculateDownpayment()}
            type="downpayment"
            description={`Downpayment for ${rooms.find(r => r.id === selectedRoom)?.name} reservation`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl mb-4">
              {paymentCompleted ? 'Payment Successful!' : 'Reservation Submitted!'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {paymentCompleted 
                ? 'Your downpayment has been processed and your reservation is confirmed.'
                : 'Your reservation has been submitted and is pending approval.'
              } You will receive an email confirmation shortly.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Reservation ID:</strong> #{reservationId}</p>
              <p><strong>Total Amount:</strong> ₱{calculateTotal().toLocaleString()}</p>
              {paymentCompleted ? (
                <>
                  <p><strong>Downpayment Paid:</strong> ₱{calculateDownpayment().toLocaleString()}</p>
                  <p><strong>Remaining Balance:</strong> ₱{calculateBalance().toLocaleString()}</p>
                </>
              ) : (
                <p><strong>Downpayment Due:</strong> ₱{calculateDownpayment().toLocaleString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Book Your Event</h1>
          <p className="text-muted-foreground">
            Follow the steps below to reserve your perfect venue
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <div className={`w-12 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  Select Date
                </CardTitle>
                <CardDescription>
                  Choose your event date (same-day booking not available)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  className="rounded-md border"
                />
                {selectedDate && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Selected date: {selectedDate.toLocaleDateString()}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Room & Package Selection */}
            <div className="space-y-6">
              {/* Room Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Room</CardTitle>
                  <CardDescription>Choose your preferred venue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rooms.map((room) => (
                    <div 
                      key={room.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRoom === room.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{room.name}</h3>
                        <Badge variant="outline">₱{room.price.toLocaleString()}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{room.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        Up to {room.capacity} guests
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Package Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Package</CardTitle>
                  <CardDescription>Choose your event package</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {packages.map((pkg) => (
                    <div 
                      key={pkg.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPackage === pkg.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                      onClick={() => setSelectedPackage(pkg.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{pkg.name}</h3>
                        <Badge variant="outline">₱{pkg.price.toLocaleString()}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                      <p className="text-sm text-muted-foreground">Duration: {pkg.duration}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Guest Count */}
              <Card>
                <CardHeader>
                  <CardTitle>Guest Count</CardTitle>
                  <CardDescription>Expected number of guests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    type="number"
                    placeholder="Enter number of guests"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    min="1"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  Please provide your contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requests">Special Requests</Label>
                  <Textarea
                    id="requests"
                    value={customerInfo.specialRequests}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder="Any special requirements or requests..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Event Date:</span>
                    <span>{selectedDate?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span>{rooms.find(r => r.id === selectedRoom)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Package:</span>
                    <span>{packages.find(p => p.id === selectedPackage)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests:</span>
                    <span>{guestCount} people</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Room Fee:</span>
                    <span>₱{rooms.find(r => r.id === selectedRoom)?.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Package Fee:</span>
                    <span>₱{packages.find(p => p.id === selectedPackage)?.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₱{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p><strong>Payment Terms:</strong></p>
                      <p>• Downpayment (30%): ₱{calculateDownpayment().toLocaleString()}</p>
                      <p>• Balance: ₱{calculateBalance().toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Downpayment is required to confirm booking. Balance due on event day.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <h4 className="font-medium text-foreground">Cancellation Policy:</h4>
                  <ul className="space-y-1 pl-4">
                    <li>• Free cancellation up to 30 days before event</li>
                    <li>• 50% refund 15-29 days before event</li>
                    <li>• No refund less than 14 days before event</li>
                    <li>• Rebooking allowed subject to availability</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-4xl mx-auto">
            {/* Terms and Conditions Agreement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Legal Agreement & Terms
                </CardTitle>
                <CardDescription>
                  Please review and agree to our terms and conditions before proceeding with payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Terms Preview */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Terms and Conditions Summary</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowTerms(true)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Read Full Terms
                    </Button>
                  </div>
                  
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p>This service complies with the <strong>Cybercrime Prevention Act of 2012 (RA 10175)</strong> and Data Privacy Act of 2012 (RA 10173)</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p>30% downpayment required upon booking confirmation, 70% balance due before event</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p>Cancellation fees apply based on timing. Review full terms for complete policy</p>
                    </div>
                  </div>
                </div>

                {/* Booking Summary Reminder */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Final Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                        <p><strong>Room:</strong> {rooms.find(r => r.id === selectedRoom)?.name}</p>
                        <p><strong>Package:</strong> {packages.find(p => p.id === selectedPackage)?.name}</p>
                      </div>
                      <div>
                        <p><strong>Guests:</strong> {guestCount} people</p>
                        <p><strong>Total:</strong> ₱{calculateTotal().toLocaleString()}</p>
                        <p><strong>Downpayment:</strong> ₱{calculateDownpayment().toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Agreement Checkboxes */}
                <div className="space-y-4">
                  <h4 className="font-medium">Required Agreements</h4>
                  
                  <div className="space-y-4 bg-white border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="terms-agreement"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      />
                      <div className="space-y-1">
                        <label 
                          htmlFor="terms-agreement" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the Terms and Conditions *
                        </label>
                        <p className="text-xs text-muted-foreground">
                          By checking this box, you agree to all venue rules, booking policies, and service terms.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="privacy-agreement"
                        checked={agreedToPrivacy}
                        onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                      />
                      <div className="space-y-1">
                        <label 
                          htmlFor="privacy-agreement" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the Privacy Policy and Data Processing *
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Your personal information will be processed in accordance with RA 10173 (Data Privacy Act).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="cybercrime-agreement"
                        checked={agreedToCybercrime}
                        onCheckedChange={(checked) => setAgreedToCybercrime(checked as boolean)}
                      />
                      <div className="space-y-1">
                        <label 
                          htmlFor="cybercrime-agreement" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I acknowledge compliance with Cybercrime Prevention Act *
                        </label>
                        <p className="text-xs text-muted-foreground">
                          I understand that any misuse of this service may result in criminal charges under RA 10175.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Notice */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-800">Legal Notice</h4>
                      <p className="text-sm text-red-700">
                        By proceeding with this reservation, you acknowledge that you have read, understood, and agree to be legally bound by our terms and conditions. 
                        This agreement is governed by Philippine law, and violations may result in civil and criminal penalties.
                      </p>
                      <p className="text-xs text-red-600">
                        <strong>Emergency Cybercrime Reporting:</strong> PNP-ACG: 02-723-0401 | NBI-CCD: 02-525-4093
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Next Step:</strong> After agreeing to these terms, you'll be redirected to our secure payment gateway to process your 30% downpayment of ₱{calculateDownpayment().toLocaleString()}.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={() => {
              if (step === 1) {
                onPageChange('home');
              } else {
                setStep(step - 1);
              }
            }}
          >
            {step === 1 ? 'Back to Home' : 'Back'}
          </Button>
          
          {step === 1 ? (
            <Button 
              onClick={() => setStep(2)}
              disabled={!canProceedToStep2}
            >
              Continue to Details
            </Button>
          ) : step === 2 ? (
            <Button 
              onClick={() => setStep(3)}
              disabled={!canProceedToStep3}
            >
              Review Terms & Pay
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Processing Payment...' : 'Proceed to Payment'}
            </Button>
          )}
        </div>
      </div>

      {/* Terms Modal */}
      <TermsAndConditions 
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        showAsModal={true}
      />
    </div>
  );
}