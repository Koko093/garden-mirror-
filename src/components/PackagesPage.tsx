import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Check, Star, Wifi, WifiOff } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { api } from '../lib/api';
import { Package } from '../types';

interface PackagesPageProps {
  onPageChange: (page: string) => void;
}

export function PackagesPage({ onPageChange }: PackagesPageProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);

  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      try {
        const packagesData = await api.getPackages();
        setPackages(packagesData);
        // Check if we're using mock data by looking for mock IDs
        const usingMockData = packagesData.some(pkg => pkg.id.length <= 2);
        setIsUsingFallbackData(usingMockData);
      } catch (error) {
        setIsUsingFallbackData(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadPackages();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading packages...</p>
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
            <span>Demo Mode: Showing sample packages (backend not connected)</span>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl mb-6">Event Packages</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose from our carefully crafted packages designed to make your event unforgettable
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={pkg.id} className={`relative overflow-hidden ${index === 1 ? 'ring-2 ring-primary' : ''}`}>
                {index === 1 && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-base">
                    {pkg.description}
                  </CardDescription>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl">₱{pkg.price.toLocaleString()}</span>
                    <span className="text-muted-foreground">/ {pkg.duration}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium">Package Includes:</h4>
                    <ul className="space-y-2">
                      {pkg.inclusions.map((inclusion, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => onPageChange('reservation')}
                    variant={index === 1 ? 'default' : 'outline'}
                  >
                    Select Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {packages.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No packages available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl mb-6">Additional Services</h2>
          <p className="text-muted-foreground mb-12">
            Enhance your event with our premium add-on services
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Extended Photography',
                price: '₱5,000',
                description: 'Additional 4 hours of professional photography'
              },
              {
                name: 'Premium Flowers',
                price: '₱8,000',
                description: 'Upgraded floral arrangements and centerpieces'
              },
              {
                name: 'Live Band',
                price: '₱15,000',
                description: '4-piece live band for 3 hours'
              },
              {
                name: 'Cocktail Bar',
                price: '₱12,000',
                description: 'Professional bartender with premium drinks'
              }
            ].map((addon, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{addon.name}</CardTitle>
                  <div className="text-2xl text-primary">{addon.price}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {addon.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl mb-6">Need a Custom Package?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Let us create a personalized package that perfectly fits your vision and budget
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => onPageChange('contact')}>
              Contact Us
            </Button>
            <Button size="lg" variant="outline" onClick={() => onPageChange('reservation')}>
              Book Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}