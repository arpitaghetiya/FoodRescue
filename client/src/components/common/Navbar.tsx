import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'DONOR') return '/donor';
    if (user.role === 'NGO') return '/ngo';
    if (user.role === 'ADMIN') return '/admin';
    return '/';
  };

  const getRoleLabel = () => {
    if (!user) return '';
    if (user.role === 'DONOR') return 'Donor Dashboard';
    if (user.role === 'NGO') return 'NGO Dashboard';
    if (user.role === 'ADMIN') return 'Admin Dashboard';
    return 'Dashboard';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Browse Food', path: '/available' },
    { label: 'How It Works', path: '/how-it-works' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-white shadow-soft group-hover:bg-darkgreen transition-all duration-300">
              <HeartHandshake className="w-5 h-5 text-mint" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-forest">
                  Food<span className="text-freshgreen">Rescue</span>
                </span>
              </div>
              <span className="block text-[10px] uppercase tracking-widest font-bold text-darktext/50 -mt-1">
                Food Donation Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-surface-100/80 p-1.5 rounded-full border border-surface-200/60">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-darktext/80 hover:text-forest hover:bg-white/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-forest rounded-full shadow-xs"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'NGO' && user.ngoProfile && (
                  <div className="hidden lg:flex items-center">
                    {user.ngoProfile.verificationStatus === 'VERIFIED' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-mint text-forest border border-[#95D5B2]">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-freshgreen" />
                        Verified NGO
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF3E8] text-orange border border-[#FED7AA]">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        Pending Review
                      </span>
                    )}
                  </div>
                )}

                {/* Dashboard Button */}
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-forest text-mint hover:bg-darkgreen transition-all shadow-soft"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                  {getRoleLabel()}
                </Link>

                {/* User chip */}
                <div className="flex items-center space-x-2 pl-2 border-l border-surface-200">
                  <div className="text-right">
                    <p className="text-xs font-bold text-darktext leading-tight">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-darktext hover:text-forest hover:bg-surface-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-forest hover:bg-darkgreen shadow-soft hover:shadow-soft-md transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl text-darktext hover:bg-surface-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-surface-200 bg-white px-5 pt-4 pb-7 space-y-3"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-bold text-darktext hover:bg-surface-50 hover:text-forest"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-surface-200 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-2xl text-sm font-bold text-white bg-forest"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2 text-mint" />
                    {getRoleLabel()}
                  </Link>
                  <div className="px-4 py-1 text-xs text-slate-500">
                    Signed in as <strong className="text-darktext">{user.name}</strong> ({user.role})
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-3 rounded-2xl text-xs font-bold border border-surface-200 text-darktext bg-surface-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-3 rounded-2xl text-xs font-bold bg-forest text-white"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
