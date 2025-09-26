import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { api } from '../lib/api';

interface GalleryPageProps {
  onPageChange: (page: string) => void;
}

export function GalleryPage({ onPageChange }: GalleryPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock gallery data (in real app, this would come from API)
  const mockGalleryItems = [
    {
      id: '1',
      title: 'Elegant Wedding Reception',
      category: 'wedding',
      image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
      description: 'Beautiful wedding ceremony at our Grand Ballroom'
    },
    {
      id: '2',
      title: 'Corporate Gala Event',
      category: 'corporate',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      description: 'Professional corporate event setup'
    },
    {
      id: '3',
      title: 'Birthday Celebration',
      category: 'birthday',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
      description: 'Colorful birthday party setup'
    },
    {
      id: '4',
      title: 'Garden Wedding',
      category: 'wedding',
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      description: 'Outdoor garden ceremony'
    },
    {
      id: '5',
      title: 'Anniversary Dinner',
      category: 'anniversary',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      description: 'Intimate anniversary celebration'
    },
    {
      id: '6',
      title: 'Corporate Meeting',
      category: 'corporate',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      description: 'Professional meeting setup'
    },
    {
      id: '7',
      title: 'Holiday Party',
      category: 'holiday',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
      description: 'Festive holiday celebration'
    },
    {
      id: '8',
      title: 'Graduation Party',
      category: 'graduation',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      description: 'Graduation celebration setup'
    }
  ];

  useEffect(() => {
    const loadGallery = async () => {
      setIsLoading(true);
      try {
        // In a real app, you'd fetch gallery images from your API
        setGalleryItems(mockGalleryItems);
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGallery();
  }, []);

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'wedding', label: 'Weddings' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'birthday', label: 'Birthdays' },
    { value: 'anniversary', label: 'Anniversaries' },
    { value: 'holiday', label: 'Holidays' },
    { value: 'graduation', label: 'Graduations' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl mb-6">Event Gallery</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Browse through our collection of memorable events and celebrations
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'secondary'}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-square relative">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {categories.find(c => c.value === item.category)?.label}
                      </Badge>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <div className="aspect-video relative">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="pt-4">
                    <h3 className="text-2xl mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No events found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}