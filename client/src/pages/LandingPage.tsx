import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../services/api';
import { Donation } from '../types';
import { DonationCard } from '../components/donation/DonationCard';
import { CardSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  UtensilsCrossed,
  Search,
  ArrowRight,
  Building2,
  HeartHandshake,
  CheckCircle,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { login, user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoLoggingIn, setDemoLoggingIn] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const donationsRes = await api.donations.getAvailable().catch(() => null);
        if (donationsRes?.donations) {
          // Display a small selection of 3 or 4 available food listings
          setAvailableDonations(donationsRes.donations.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching available donations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleQuickDemoLogin = async (
    roleKey: string,
    email: string,
    pass: string,
    roleTitle: string,
    targetPath: string
  ) => {
    try {
      setDemoLoggingIn(roleKey);
      const loggedUser = await login(email, pass);
      toast.success(
        `Welcome, ${loggedUser.name}!`,
        `Logged in to ${roleTitle}.`
      );
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      toast.error('Demo Login Error', err.message || 'Unable to sign in.');
    } finally {
      setDemoLoggingIn(null);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="pt-8 sm:pt-14 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-mint text-forest border border-[#B7E4C7]">
            Simple • Direct • Free Food Redistribution
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-forest tracking-tight leading-tight">
            Rescue Surplus Food. <br />
            <span className="text-freshgreen">Feed Those in Need.</span>
          </h1>

          <p className="text-base sm:text-lg text-darktext/80 max-w-2xl mx-auto leading-relaxed">
            FoodRescue connects restaurants, bakeries, and food businesses with verified NGOs to prevent food waste and nourish local communities.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={isAuthenticated && user?.role === 'DONOR' ? '/donor/create' : '/register?role=DONOR'}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-mint bg-forest hover:bg-darkgreen shadow-soft transition-all flex items-center justify-center text-sm active:scale-95"
            >
              <UtensilsCrossed className="w-4 h-4 mr-2 text-freshgreen" />
              Donate Food
            </Link>
            <Link
              to="/available"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-darktext bg-white hover:bg-surface-100 border border-surface-200 shadow-soft transition-all flex items-center justify-center text-sm active:scale-95"
            >
              <Search className="w-4 h-4 mr-2 text-forest" />
              Find Food
            </Link>
          </div>

          {/* Quick Demo Accounts Bar */}
          {(!import.meta.env.PROD || import.meta.env.VITE_ENABLE_DEMO_LOGINS === 'true') && (
            <div className="pt-6">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-white border border-surface-200 shadow-xs text-xs">
                <span className="text-slate-500 font-medium px-2 flex items-center">
                  <Zap className="w-3.5 h-3.5 text-orange mr-1" />
                  1-Click Demo Login:
                </span>
                <button
                  type="button"
                  disabled={demoLoggingIn !== null}
                  onClick={() =>
                    handleQuickDemoLogin('donor', 'donor.green@foodrescue.org', 'Donor@123', 'Donor Dashboard', '/donor')
                  }
                  className="px-3 py-1.5 rounded-lg bg-mint text-forest font-semibold hover:bg-[#c2edca] transition-colors"
                >
                  Donor
                </button>
                <button
                  type="button"
                  disabled={demoLoggingIn !== null}
                  onClick={() =>
                    handleQuickDemoLogin('ngo', 'ngo.hope@foodrescue.org', 'Ngo@123', 'NGO Dashboard', '/ngo')
                  }
                  className="px-3 py-1.5 rounded-lg bg-[#EBF5FB] text-[#1B4E6B] font-semibold hover:bg-[#d5eaf9] transition-colors"
                >
                  Verified NGO
                </button>
                {!import.meta.env.PROD && (
                  <button
                    type="button"
                    disabled={demoLoggingIn !== null}
                    onClick={() =>
                      handleQuickDemoLogin('admin', 'admin@foodrescue.org', 'Admin@123', 'Admin Dashboard', '/admin')
                    }
                    className="px-3 py-1.5 rounded-lg bg-forest text-mint font-semibold hover:bg-darkgreen transition-colors"
                  >
                    Admin (Dev Only)
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* 2. SIMPLE THREE-STEP EXPLANATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Three simple steps to rescue and redistribute surplus food.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-soft">
            <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center font-extrabold text-base mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-darktext mb-1">Donor posts surplus food</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Food businesses post excess food with quantity, category, pickup location, and collection deadline.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-soft">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] text-orange flex items-center justify-center font-extrabold text-base mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-darktext mb-1">NGO requests food</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verified NGOs browse listings in their area and submit a request for the items they need.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-soft">
            <div className="w-10 h-10 rounded-xl bg-forest text-mint flex items-center justify-center font-extrabold text-base mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-darktext mb-1">Donor approves & food is collected</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The donor reviews and approves the request, and the NGO collects the food before the deadline.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SMALL SELECTION OF AVAILABLE FOOD LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
              Available Food Listings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sample food donations ready for collection by verified NGOs.
            </p>
          </div>
          <Link
            to="/available"
            className="inline-flex items-center text-xs sm:text-sm font-bold text-forest hover:text-darkgreen group"
          >
            Browse all 12 food listings{' '}
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : availableDonations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableDonations.map((donation) => (
              <DonationCard key={donation.id} donation={donation} showActions={true} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-surface-200 shadow-soft">
            <p className="text-darktext font-bold text-sm">No active listings available right now.</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon or add a new donation.</p>
          </div>
        )}
      </section>

      {/* 4. WHO CAN USE FOODRESCUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
            Who Can Use FoodRescue?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Built for organizations that prepare food and charities that serve communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Donors Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-200 shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-xl bg-forest text-mint flex items-center justify-center">
              <Building2 className="w-6 h-6 text-mint" />
            </div>
            <h3 className="text-xl font-bold text-forest">Food Donors</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Restaurants, cafes, bakeries, hotels, caterers, and supermarkets with wholesome, unserved excess food can post listings in seconds and prevent edible food from going to waste.
            </p>
            <ul className="space-y-2 text-xs text-darktext/80 pt-1">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-freshgreen shrink-0" />
                <span>Simple 1-minute donation listing form</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-freshgreen shrink-0" />
                <span>Only verified NGOs receive food</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-freshgreen shrink-0" />
                <span>Review and approve claims before collection</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/register?role=DONOR"
                className="inline-flex items-center text-xs font-bold text-forest hover:text-darkgreen"
              >
                Register as a Donor &rarr;
              </Link>
            </div>
          </div>

          {/* NGOs Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-200 shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange text-white flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-darktext">NGOs & Shelters</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Charitable organizations, homeless shelters, community kitchens, and disaster relief groups can access free surplus food to support families and individuals in need.
            </p>
            <ul className="space-y-2 text-xs text-darktext/80 pt-1">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-orange shrink-0" />
                <span>100% free food redistribution</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-orange shrink-0" />
                <span>Search and filter by food category and location</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-orange shrink-0" />
                <span>Quick claiming process for verified accounts</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                to="/register?role=NGO"
                className="inline-flex items-center text-xs font-bold text-orange hover:text-orange/80"
              >
                Register as an NGO &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
