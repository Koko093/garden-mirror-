import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { OTPVerification } from './OTPVerification';
import { getApiBaseUrl } from '../config/api';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      province: '',
      zipCode: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name === 'phone') {
      // Format phone number as user types
      let formattedPhone = value.replace(/\D/g, ''); // Remove non-digits
      
      if (formattedPhone.length > 0) {
        if (formattedPhone.startsWith('63')) {
          formattedPhone = '+63 ' + formattedPhone.slice(2);
        } else if (formattedPhone.startsWith('0')) {
          formattedPhone = '+63 ' + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith('+63')) {
          formattedPhone = '+63 ' + formattedPhone;
        }
        
        // Add spacing for better readability
        const cleanPhone = formattedPhone.replace(/\D/g, '');
        if (cleanPhone.length >= 2) {
          const countryCode = cleanPhone.slice(0, 2);
          const number = cleanPhone.slice(2);
          
          if (number.length >= 3 && number.length <= 6) {
            formattedPhone = `+${countryCode} ${number.slice(0, 3)} ${number.slice(3)}`;
          } else if (number.length >= 7) {
            formattedPhone = `+${countryCode} ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
          } else {
            formattedPhone = `+${countryCode} ${number}`;
          }
        }
      }
      
      setFormData(prev => ({
        ...prev,
        phone: formattedPhone.slice(0, 17) // Limit length
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.phone) {
      toast.error('Phone number is required');
      return false;
    }

    // Remove all non-digits for validation
    const phoneNumbers = formData.phone.replace(/\D/g, '');
    
    // Check if it's a valid Philippine number (starts with 63 or 0, followed by 9 digits)
    const phoneRegex = /^(63|0)?9[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumbers)) {
      toast.error('Please enter a valid Philippine phone number');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      // Send OTP to email first
      const response = await fetch(`${getApiBaseUrl()}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      toast.success('OTP sent to your email! Please verify to complete registration.');
      setShowOTPVerification(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerificationSuccess = async (otpToken: string) => {
    setIsLoading(true);
    
    try {
      // Complete registration with OTP token
      await register({
        ...formData,
        otpToken
      });
      toast.success('Registration successful! Welcome to Garden Mirror!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      setShowOTPVerification(false); // Go back to form on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const response = await fetch(`${getApiBaseUrl()}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        name: formData.name,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend OTP');
    }
  };

  // Show OTP verification if needed
  if (showOTPVerification) {
    return (
      <OTPVerification
        email={formData.email}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onResendOTP={handleResendOTP}
        onBack={() => setShowOTPVerification(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-primary">Garden Mirror</h1>
            <p className="text-muted-foreground mt-2">Create your account today</p>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              {step === 1 ? 'Enter your basic information' : 'Complete your profile'}
            </CardDescription>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Continue to Step 2
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 flex items-center">
                      <span className="text-sm mr-2">🇵🇭</span>
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+63 9XX XXX XXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-12"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a valid Philippine phone number
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Address (Optional)</Label>
                  
                  <div className="space-y-3">
                    <Input
                      name="address.street"
                      type="text"
                      placeholder="Street Address"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        name="address.city"
                        type="text"
                        placeholder="City"
                        value={formData.address.city}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="address.province"
                        type="text"
                        placeholder="Province"
                        value={formData.address.province}
                        onChange={handleInputChange}
                      />
                    </div>

                    <Input
                      name="address.zipCode"
                      type="text"
                      placeholder="Zip Code"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-full"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}