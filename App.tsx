import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { AboutPage } from "./components/AboutPage";
import { GalleryPage } from "./components/GalleryPage";
import { PackagesPage } from "./components/PackagesPage";
import { ContactPage } from "./components/ContactPage";
import { FeedbackPage } from "./components/FeedbackPage";
import { ReservationSystem } from "./components/ReservationSystem";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLogin } from "./components/AdminLogin";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ProfilePage } from "./components/ProfilePage";
import { ChatBot } from "./components/ChatBot";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Component
function AppContent() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Customer Routes */}
          <Route
            path="/"
            element={
              <>
                <Navigation />
                <main>
                  <HomePage />
                </main>
                <Footer />
                <ChatBot
                  isOpen={isChatBotOpen}
                  onToggle={() =>
                    setIsChatBotOpen(!isChatBotOpen)
                  }
                />
              </>
            }
          />

          <Route
            path="/about"
            element={
              <>
                <Navigation />
                <main>
                  <AboutPage />
                </main>
                <Footer />
                <ChatBot
                  isOpen={isChatBotOpen}
                  onToggle={() =>
                    setIsChatBotOpen(!isChatBotOpen)
                  }
                />
              </>
            }
          />

          <Route
            path="/packages"
            element={
              <>
                <Navigation />
                <main>
                  <PackagesPage />
                </main>
                <Footer />
                <ChatBot
                  isOpen={isChatBotOpen}
                  onToggle={() =>
                    setIsChatBotOpen(!isChatBotOpen)
                  }
                />
              </>
            }
          />

          <Route
            path="/gallery"
            element={
              <>
                <Navigation />
                <main>
                  <GalleryPage />
                </main>
                <Footer />
                <ChatBot
                  isOpen={isChatBotOpen}
                  onToggle={() =>
                    setIsChatBotOpen(!isChatBotOpen)
                  }
                />
              </>
            }
          />

          <Route
            path="/contact"
            element={
              <>
                <Navigation />
                <main>
                  <ContactPage />
                </main>
                <Footer />
                <ChatBot
                  isOpen={isChatBotOpen}
                  onToggle={() =>
                    setIsChatBotOpen(!isChatBotOpen)
                  }
                />
              </>
            }
          />

          <Route
            path="/feedback"
            element={
              <>
                <Navigation />
                <main>
                  <FeedbackPage />
                </main>
                <Footer />
                <ChatBot
                  isOpen={isChatBotOpen}
                  onToggle={() =>
                    setIsChatBotOpen(!isChatBotOpen)
                  }
                />
              </>
            }
          />

          {/* Protected Customer Routes */}
          <Route
            path="/reservation"
            element={
              <ProtectedRoute>
                <Navigation />
                <main>
                  <ReservationSystem />
                </main>
                <Footer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Navigation />
                <main>
                  <ProfilePage />
                </main>
                <Footer />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </Router>
  );
}

// Main App with Providers
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}