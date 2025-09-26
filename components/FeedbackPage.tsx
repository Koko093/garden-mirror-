import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Star, Send, WifiOff } from 'lucide-react';
import { api } from '../lib/api';
import { Feedback } from '../types';

interface FeedbackPageProps {
  onPageChange: (page: string) => void;
}

export function FeedbackPage({ onPageChange }: FeedbackPageProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  const [formData, setFormData] = useState({
    reservationId: '',
    name: '',
    email: '',
    rating: 0,
    comment: '',
    isPublic: true
  });

  useEffect(() => {
    const loadFeedback = async () => {
      setIsLoading(true);
      try {
        const feedbackData = await api.getFeedback();
        // Only show public feedback
        const publicFeedback = feedbackData.filter(f => f.isPublic);
        setFeedback(publicFeedback);
        // Check if we're using mock data by looking for mock IDs
        const usingMockData = feedbackData.some(f => f.id.length <= 2);
        setIsUsingFallbackData(usingMockData);
      } catch (error) {
        setIsUsingFallbackData(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadFeedback();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.submitFeedback({
        reservationId: formData.reservationId,
        customerInfo: {
          name: formData.name,
          email: formData.email
        },
        rating: formData.rating,
        comment: formData.comment,
        isPublic: formData.isPublic
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setShowForm(false);
        setFormData({
          reservationId: '',
          name: '',
          email: '',
          rating: 0,
          comment: '',
          isPublic: true
        });
        // Reload feedback
        const loadFeedback = async () => {
          const feedbackData = await api.getFeedback();
          setFeedback(feedbackData.filter(f => f.isPublic));
        };
        loadFeedback();
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const renderStars = (rating: number, interactive = false) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-muted-foreground'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => setFormData({...formData, rating: i + 1}) : undefined}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Status Indicator */}
      {isUsingFallbackData && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-sm text-yellow-800">
            <WifiOff className="w-4 h-4" />
            <span>Demo Mode: Showing sample feedback (backend not connected)</span>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl mb-6">Customer Reviews</h1>
          <p className="text-xl text-muted-foreground mb-8">
            See what our customers say about their events with us
          </p>
          <Button onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        </div>
      </section>

      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Feedback Form */}
          {showForm && (
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Share Your Experience</CardTitle>
                <CardDescription>
                  Help others by sharing your feedback about your event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                      <h3 className="mb-2">Thank You for Your Feedback!</h3>
                      <p>Your review has been submitted successfully.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reservationId">Reservation ID</Label>
                        <Input
                          id="reservationId"
                          name="reservationId"
                          value={formData.reservationId}
                          onChange={handleInputChange}
                          placeholder="RES123456"
                          required
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Rating</Label>
                      <div className="flex gap-1 mt-2">
                        {renderStars(formData.rating, true)}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="comment">Your Review</Label>
                      <Textarea
                        id="comment"
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="mt-2"
                        placeholder="Tell us about your experience..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="isPublic" className="text-sm">
                        Make this review public (others can see it)
                      </Label>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting || formData.rating === 0}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Review
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {/* Feedback List */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-4">What Our Customers Say</h2>
              <p className="text-muted-foreground">
                Read reviews from our satisfied customers
              </p>
            </div>

            {feedback.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {feedback.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{item.customerInfo?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {renderStars(item.rating)}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        "{item.comment}"
                      </p>

                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="text-xs">
                          Reservation #{item.reservationId}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Verified Customer
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl mb-6">Ready to Create Your Own Memorable Event?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join our satisfied customers and book your event today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => onPageChange('reservation')}>
              Book Your Event
            </Button>
            <Button size="lg" variant="outline" onClick={() => onPageChange('packages')}>
              View Packages
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}