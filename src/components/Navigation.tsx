import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Menu, X, Calendar, Settings, Users, MessageSquare, LogOut, Shield, User } from 'lucide-react';

export function Navigation() {
  const { isAuthenticated, isAdmin, logout, getDisplayName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const customerPages = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/packages', label: 'Packages' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/contact', label: 'Contact' },
    { path: '/feedback', label: 'Reviews' }
  ];

  const adminPages = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Settings },
    { path: '/admin/reservations', label: 'Reservations', icon: Calendar },
    { path: '/admin/rooms', label: 'Rooms', icon: Users },
    { path: '/admin/packages', label: 'Packages', icon: Users },
    { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare }
  ];

  const pages = isAdmin ? adminPages : customerPages;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <h1 className="text-xl font-bold text-primary">
                {isAdmin ? 'Garden Mirror Admin' : 'Garden Mirror'}
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {pages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    location.pathname === page.path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isAdmin && 'icon' in page && <page.icon className="w-4 h-4" />}
                    {page.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAdmin && !isAuthenticated && (
              <Link to="/login">
                <Button variant="outline">
                  Sign In
                </Button>
              </Link>
            )}
            
            {!isAdmin && isAuthenticated && (
              <>
                <Link to="/reservation">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Now
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {getDisplayName()}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            )}
            
            {isAdmin && (
              <>
                <Link to="/">
                  <Button variant="outline">
                    Back to Website
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {pages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md w-full text-left transition-colors ${
                    location.pathname === page.path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isAdmin && 'icon' in page && <page.icon className="w-4 h-4" />}
                    {page.label}
                  </div>
                </Link>
              ))}
              
              {/* Customer mobile actions */}
              {!isAdmin && !isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md w-full text-left bg-primary text-primary-foreground"
                >
                  Sign In
                </Link>
              )}

              {!isAdmin && isAuthenticated && (
                <>
                  <Link
                    to="/reservation"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md w-full text-left bg-primary text-primary-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Book Now
                    </div>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md w-full text-left text-muted-foreground hover:text-primary hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      My Profile
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block px-3 py-2 rounded-md w-full text-left text-destructive hover:bg-destructive/10"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </div>
                  </button>
                </>
              )}
              
              {/* Admin mobile actions */}
              {isAdmin && (
                <>
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md w-full text-left text-muted-foreground hover:text-primary hover:bg-accent"
                  >
                    Back to Website
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block px-3 py-2 rounded-md w-full text-left text-destructive hover:bg-destructive/10"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}