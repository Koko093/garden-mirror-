import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Shield, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { LegalComplianceModal } from './LegalComplianceModal';

export function Footer() {
  const [showLegalCompliance, setShowLegalCompliance] = useState(false);

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Garden Mirror</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your premier destination for unforgettable events. Creating magical moments since 2020 with world-class venues and exceptional service in a beautiful garden setting.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800">
                  <Twitter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <nav className="space-y-2">
                {[
                  { label: 'Home', path: '/' },
                  { label: 'About Us', path: '/about' },
                  { label: 'Packages', path: '/packages' },
                  { label: 'Gallery', path: '/gallery' },
                  { label: 'Contact', path: '/contact' },
                  { label: 'Feedback', path: '/feedback' }
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block text-gray-300 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    123 Event Boulevard<br />
                    Makati City, Metro Manila<br />
                    Philippines 1200
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-300 text-sm">+63 2 8123 4567</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-300 text-sm">info@gardenmirror.com</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="text-gray-300 text-sm">
                    <p>Mon - Fri: 9:00 AM - 7:00 PM</p>
                    <p>Sat - Sun: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal & Services */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Services & Legal</h4>
              <div className="space-y-2">
                <Link
                  to="/reservation"
                  className="block text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Book an Event
                </Link>
                <Link
                  to="/admin/login"
                  className="block text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  Admin Access
                </Link>
                <button
                  onClick={() => setShowLegalCompliance(true)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors duration-200"
                >
                  <Shield className="h-3 w-3" />
                  <span>Legal Compliance</span>
                </button>
                <div className="text-gray-400 text-xs mt-3 p-2 bg-gray-800 rounded">
                  <p className="font-medium mb-1">Legal Compliance:</p>
                  <p>This website complies with:</p>
                  <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                    <li>Cybercrime Prevention Act (RA 10175)</li>
                    <li>Data Privacy Act (RA 10173)</li>
                    <li>E-Commerce Act (RA 8792)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-gray-700" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} Garden Mirror. All rights reserved.
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Cybercrime Law Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>Made in the Philippines</span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="mt-6 p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="text-xs text-red-200">
              <p className="font-medium mb-1">Emergency Cybercrime Reporting:</p>
              <div className="flex flex-col md:flex-row md:space-x-4 space-y-1 md:space-y-0">
                <span>PNP-ACG: 02-723-0401</span>
                <span>NBI-CCD: 02-525-4093</span>
                <span>Email: report@gardenmirror.com</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Compliance Modal */}
      <LegalComplianceModal 
        isOpen={showLegalCompliance}
        onClose={() => setShowLegalCompliance(false)}
      />
    </>
  );
}