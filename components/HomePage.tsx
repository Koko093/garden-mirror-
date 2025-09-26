import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Star, Calendar, Users, MapPin, Phone, Mail } from 'lucide-react';
import { api } from '../lib/api';
import { Package, Feedback } from '../types';

export function HomePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [packagesData, feedbackData] = await Promise.all([
          api.getPackages(),
          api.getFeedback()
        ]);
        setPackages(packagesData);
        setFeedback(feedbackData.filter(f => f.isPublic));
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Mock events data (could be loaded from API as well)
  const mockEvents = [
    {
      id: '1',
      title: 'Sarah & Michael\'s Wedding',
      description: 'Beautiful garden wedding celebration',
      date: new Date('2024-10-15'),
      images: ['https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800'],
      category: 'Wedding'
    },
    {
      id: '2',
      title: 'Corporate Annual Gala',
      description: 'Elegant corporate celebration',
      date: new Date('2024-10-20'),
      images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'],
      category: 'Corporate'
    },
    {
      id: '3',
      title: 'Birthday Celebration',
      description: 'Fun-filled birthday party',
      date: new Date('2024-10-25'),
      images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800'],
      category: 'Birthday'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-center text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200')"
          }}
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl mb-6">
            Create Unforgettable Moments
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Perfect venues and comprehensive packages for your special celebrations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/reservation">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-3"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Your Event
              </Button>
            </Link>
            <Link to="/packages">
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                View Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">Our Event Packages</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive packages designed to make your celebration perfect
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted overflow-hidden">
                <img 
                  src={pkg.images[0]}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <Badge variant="secondary">₱{pkg.price.toLocaleString()}</Badge>
                </div>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Duration: {pkg.duration}
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Package Includes:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {pkg.inclusions.slice(0, 3).map((inclusion, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {inclusion}
                        </li>
                      ))}
                      {pkg.inclusions.length > 3 && (
                        <li className="text-primary">
                          +{pkg.inclusions.length - 3} more inclusions
                        </li>
                      )}
                    </ul>
                  </div>
                  <Link to="/reservation" className="w-full">
                    <Button className="w-full">
                      Book This Package
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Why Choose Garden Mirror</h2>
            <p className="text-muted-foreground text-lg">
              We make your special moments truly unforgettable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: 'Expert Planning',
                description: 'Professional event coordination from start to finish'
              },
              {
                icon: Star,
                title: 'Premium Quality',
                description: 'High-quality venues and services for your special day'
              },
              {
                icon: Calendar,
                title: 'Flexible Booking',
                description: 'Easy rebooking and flexible payment options'
              },
              {
                icon: MapPin,
                title: 'Perfect Locations',
                description: 'Beautiful venues in prime locations'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Events Gallery */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">Recent Celebrations</h2>
          <p className="text-muted-foreground text-lg">
            Take a look at some of our recent successful events
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted overflow-hidden">
                <img 
                  src={event.images[0]}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{event.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {event.date.toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium mb-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/gallery">
            <Button variant="outline">
              View All Events
            </Button>
          </Link>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground text-lg">
              Read testimonials from our satisfied customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeletons
              [...Array(3)].map((_, i) => (
                <Card key={i} className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j) => (
                          <div key={j} className="w-4 h-4 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                      <div className="ml-2 w-12 h-4 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-muted rounded animate-pulse w-24" />
                      <div className="h-3 bg-muted rounded animate-pulse w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : feedback.length > 0 ? (
              feedback.slice(0, 6).map((feedbackItem) => (
                <Card key={feedbackItem.id} className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < feedbackItem.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({feedbackItem.rating}/5)
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      "{feedbackItem.comment}"
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        - {feedbackItem.customerInfo?.name || feedbackItem.user?.name || 'Anonymous'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(feedbackItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // No feedback message
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to share your experience!
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Link to="/feedback">
              <Button variant="outline">
                Read More Reviews
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl md:text-3xl mb-4">Ready to Plan Your Event?</h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Contact us today to discuss your event needs and get a personalized quote
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/reservation">
                <Button 
                  size="lg" 
                  variant="secondary"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>


    </div>
  );
}