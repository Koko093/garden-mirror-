import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, Award, Users, Calendar } from 'lucide-react';

export function AboutPage() {
  const achievements = [
    { number: '500+', label: 'Events Hosted', icon: Calendar },
    { number: '5000+', label: 'Happy Clients', icon: Users },
    { number: '15+', label: 'Years Experience', icon: Award },
    { number: '98%', label: 'Client Satisfaction', icon: Heart }
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      description: 'With over 15 years in event management, Sarah founded Garden Mirror to make dream celebrations accessible to everyone.'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      description: 'Michael ensures every event runs smoothly, coordinating with vendors and managing logistics with precision.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Creative Director',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      description: 'Emily brings creative vision to life, designing stunning setups that exceed client expectations.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200')"
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl mb-6">About Garden Mirror</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We believe every celebration deserves to be extraordinary. For over 15 years, 
            we've been turning dreams into reality, creating unforgettable moments that last a lifetime.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Garden Mirror was born from a simple belief: every celebration should be as unique 
                as the people celebrating. Founded in 2008 by Sarah Johnson, we started as a 
                small family business with just one beautiful garden venue and a big dream.
              </p>
              <p>
                Today, we've grown into one of the region's most trusted event management companies, 
                but we've never lost sight of our core values: personalized service, attention to 
                detail, and creating magical moments that bring people together.
              </p>
              <p>
                From intimate gatherings to grand celebrations, we've had the privilege of being 
                part of thousands of special moments. Each event teaches us something new, and 
                we're constantly evolving to better serve our clients.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img 
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=400" 
              alt="Event setup"
              className="w-full h-48 object-cover rounded-lg"
            />
            <img 
              src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400" 
              alt="Wedding celebration"
              className="w-full h-48 object-cover rounded-lg mt-8"
            />
            <img 
              src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400" 
              alt="Birthday party"
              className="w-full h-48 object-cover rounded-lg -mt-8"
            />
            <img 
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400" 
              alt="Corporate event"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">Our Achievements</h2>
            <p className="text-muted-foreground text-lg">
              Numbers that reflect our commitment to excellence
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <achievement.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2">{achievement.number}</div>
                <div className="text-muted-foreground">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To create extraordinary experiences that bring people together, celebrating 
                life's most precious moments with unparalleled service, creativity, and attention 
                to detail. We strive to exceed expectations and turn dreams into reality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Excellence</h4>
                <p className="text-sm text-muted-foreground">
                  We pursue perfection in every detail, no matter how small.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Integrity</h4>
                <p className="text-sm text-muted-foreground">
                  Transparent pricing, honest communication, and reliable service.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Creativity</h4>
                <p className="text-sm text-muted-foreground">
                  Innovative solutions and unique designs for every celebration.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground text-lg">
              The passionate people behind your perfect events
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-1">{member.name}</h3>
                  <Badge variant="secondary" className="mb-4">{member.role}</Badge>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl mb-4">Why Choose Garden Mirror?</h2>
          <p className="text-muted-foreground text-lg">
            What sets us apart from other event management companies
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Personalized Service',
              description: 'Every client gets dedicated attention and customized solutions tailored to their unique vision and budget.',
              icon: '🎯'
            },
            {
              title: 'End-to-End Solutions',
              description: 'From initial planning to final cleanup, we handle every aspect of your event so you can enjoy the celebration.',
              icon: '🎪'
            },
            {
              title: 'Experienced Team',
              description: 'Our seasoned professionals bring decades of combined experience and industry expertise to your event.',
              icon: '👥'
            },
            {
              title: 'Beautiful Venues',
              description: 'Multiple stunning locations to choose from, each offering unique ambiance and modern amenities.',
              icon: '🏛️'
            },
            {
              title: 'Flexible Packages',
              description: 'Customizable packages that can be tailored to fit any budget without compromising on quality.',
              icon: '📦'
            },
            {
              title: 'Stress-Free Process',
              description: 'Our streamlined booking system and clear communication make planning your event effortless.',
              icon: '✨'
            }
          ].map((feature, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-medium mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <Card className="max-w-4xl mx-auto bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl md:text-3xl mb-4">Ready to Create Something Amazing?</h2>
            <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Let's work together to make your next celebration unforgettable. 
              Contact us today to start planning your perfect event.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="secondary" className="px-6 py-2">
                📞 +1 (555) 123-4567
              </Badge>
              <Badge variant="secondary" className="px-6 py-2">
                📧 info@gardenmirror.com
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}