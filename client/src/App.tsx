import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BrowseDonationsPage } from './pages/ngo/BrowseDonationsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Role Dashboards
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { CreateDonationPage } from './pages/donor/CreateDonationPage';
import { NgoDashboard } from './pages/ngo/NgoDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-surface-50 text-darktext">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/available" element={<BrowseDonationsPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Protected Donor Routes */}
                <Route
                  path="/donor"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor/create"
                  element={
                    <ProtectedRoute allowedRoles={['DONOR']}>
                      <CreateDonationPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected NGO Routes */}
                <Route
                  path="/ngo"
                  element={
                    <ProtectedRoute allowedRoles={['NGO']}>
                      <NgoDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ngo/browse"
                  element={
                    <ProtectedRoute allowedRoles={['NGO']}>
                      <BrowseDonationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
