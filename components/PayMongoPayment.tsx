import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CreditCard, Smartphone, Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface PayMongoPaymentProps {
  reservationId: string;
  amount: number;
  type: 'downpayment' | 'balance';
  description: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

interface PaymentMethod {
  type: string;
  name: string;
  description: string;
  logo: string;
}

export function PayMongoPayment({
  reservationId,
  amount,
  type,
  description,
  onSuccess,
  onError,
  onCancel
}: PayMongoPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Card payment form state
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: ''
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await api.makeApiRequest('/payments/payment-methods');
      setPaymentMethods(response.methods || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Fallback payment methods
      setPaymentMethods([
        { type: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, JCB', logo: 'card' },
        { type: 'gcash', name: 'GCash', description: 'Pay using your GCash wallet', logo: 'gcash' },
        { type: 'paymaya', name: 'PayMaya', description: 'Pay using your PayMaya account', logo: 'paymaya' },
        { type: 'grab_pay', name: 'GrabPay', description: 'Pay using your Grab wallet', logo: 'grab_pay' }
      ]);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setErrorMessage('Please select a payment method');
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Create payment intent
      const paymentResponse = await api.makeApiRequest('/payments/create-payment', {
        method: 'POST',
        body: JSON.stringify({
          reservationId,
          amount,
          type,
          description
        })
      });

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Failed to create payment');
      }

      const { payment_intent, client_key } = paymentResponse;

      // Handle different payment methods
      if (selectedMethod === 'card') {
        await handleCardPayment(payment_intent, client_key);
      } else {
        await handleWalletPayment(payment_intent, selectedMethod);
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      onError(error.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPayment = async (paymentIntent: any, clientKey: string) => {
    try {
      // For card payments, we would typically use PayMongo's card element
      // This is a simplified version - in production, you'd integrate PayMongo's frontend SDK
      
      // Create a simulated payment method object
      const paymentMethodData = {
        type: 'card',
        card: {
          number: cardForm.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(cardForm.expiryMonth),
          exp_year: parseInt(cardForm.expiryYear),
          cvc: cardForm.cvc
        },
        billing: {
          name: cardForm.cardholderName,
        }
      };

      // In a real implementation, you would use PayMongo's frontend SDK here
      // For now, we'll simulate the payment flow
      
      // Simulate payment processing
      setTimeout(() => {
        setPaymentStatus('success');
        onSuccess({
          paymentIntentId: paymentIntent.id,
          amount,
          method: 'card'
        });
      }, 2000);

    } catch (error: any) {
      throw new Error('Card payment failed: ' + error.message);
    }
  };

  const handleWalletPayment = async (paymentIntent: any, method: string) => {
    try {
      // For wallet payments (GCash, PayMaya, GrabPay), PayMongo typically redirects to the wallet app
      // This would involve creating a redirect URL and handling the return flow
      
      // Simulate redirect URL creation
      const redirectUrl = `https://paymongo.example.com/redirect/${method}/${paymentIntent.id}`;
      setPaymentUrl(redirectUrl);
      
      // In a real implementation, you would redirect the user to this URL
      // For demo purposes, we'll simulate success after a delay
      setTimeout(() => {
        setPaymentStatus('success');
        onSuccess({
          paymentIntentId: paymentIntent.id,
          amount,
          method
        });
      }, 3000);

    } catch (error: any) {
      throw new Error(`${method} payment failed: ` + error.message);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-6 h-6" />;
      case 'gcash':
      case 'paymaya':
      case 'grab_pay':
        return <Smartphone className="w-6 h-6" />;
      default:
        return <Wallet className="w-6 h-6" />;
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground mb-4">
            Your {type} payment of ₱{amount.toLocaleString()} has been processed successfully.
          </p>
          <Button onClick={() => onSuccess({})}>Continue</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Amount to Pay:</span>
              <span className="font-medium">₱{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Type:</span>
              <Badge variant="outline">{type === 'downpayment' ? 'Downpayment (30%)' : 'Balance Payment'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Description:</span>
              <span className="text-sm text-muted-foreground">{description}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>Choose how you would like to pay</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.type}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMethod === method.type
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
              onClick={() => setSelectedMethod(method.type)}
            >
              <div className="flex items-center gap-3">
                {getMethodIcon(method.type)}
                <div className="flex-1">
                  <h4 className="font-medium">{method.name}</h4>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                {selectedMethod === method.type && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Card Details Form */}
      {selectedMethod === 'card' && (
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
            <CardDescription>Enter your card information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardForm.cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                  setCardForm(prev => ({ ...prev, cardNumber: value }));
                }}
                maxLength={19}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Month</Label>
                <Select value={cardForm.expiryMonth} onValueChange={(value) => setCardForm(prev => ({ ...prev, expiryMonth: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Year</Label>
                <Select value={cardForm.expiryYear} onValueChange={(value) => setCardForm(prev => ({ ...prev, expiryYear: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cardForm.cvc}
                  onChange={(e) => setCardForm(prev => ({ ...prev, cvc: e.target.value.replace(/\D/g, '') }))}
                  maxLength={4}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={cardForm.cardholderName}
                onChange={(e) => setCardForm(prev => ({ ...prev, cardholderName: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Payment URL for Wallet Payments */}
      {paymentUrl && selectedMethod !== 'card' && paymentStatus === 'processing' && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            You will be redirected to complete your payment. Please wait...
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          disabled={!selectedMethod || isLoading || (selectedMethod === 'card' && (!cardForm.cardNumber || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvc || !cardForm.cardholderName))}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ₱${amount.toLocaleString()}`
          )}
        </Button>
      </div>
    </div>
  );
}