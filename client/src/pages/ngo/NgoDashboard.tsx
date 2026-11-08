import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../../services/api';
import { Donation, DonationRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { DonationCard } from '../../components/donation/DonationCard';
import { RequestModal } from '../../components/donation/RequestModal';
import { CardSkeleton } from '../../components/common/Skeleton';
import {
  Package,
  Clock,
  CheckCircle2,
  Search,
  ShieldCheck,
  ShieldAlert,
  Inbox,
  Truck,
  Building,
  MapPin,
} from 'lucide-react';

export const NgoDashboard: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();
  const toast = useToast();

  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [myRequests, setMyRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'browse' | 'requests'
  const [activeTab, setActiveTab] = useState<'browse' | 'requests'>('browse');

  // Filters for available donations
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Request Modal
  const [selectedDonationForRequest, setSelectedDonationForRequest] = useState<Donation | null>(null);

  const isVerified = user?.ngoProfile?.verificationStatus === 'VERIFIED';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, requestsRes] = await Promise.all([
        api.donations.getAvailable({
          search: search || undefined,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        }).catch(() => ({ success: false, donations: [] })),
        api.requests.getMyNgoRequests().catch(() => ({ success: false, requests: [] })),
      ]);

      if (donationsRes.donations) setAvailableDonations(donationsRes.donations);
      if (requestsRes.requests) setMyRequests(requestsRes.requests);
    } catch (err) {
      console.error('Failed to load NGO dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const approvedRequestsCount = myRequests.filter(
    (r) => r.status === 'APPROVED' || r.status === 'PICKUP_SCHEDULED'
  ).length;

  const completedCollectionsCount = myRequests.filter(
    (r) => r.status === 'COMPLETED' || r.status === 'COLLECTED'
  ).length;

  const categories = [
    'ALL',
    'Cooked Meals',
    'Bakery & Bread',
    'Produce & Fruits',
    'Packaged & Canned',
    'Dairy & Eggs',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-forest text-white rounded-2xl p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              NGO Dashboard
            </h1>
            {isVerified ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-mint text-forest flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-freshgreen" />
                Verified NGO
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange text-white flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Pending Verification
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-mint/80">
            {user?.organization || user?.name} • Reg No: {user?.ngoProfile?.registrationNumber || 'Pending'}
          </p>
        </div>

        <Link
          to="/available"
          className="inline-flex items-center px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-forest bg-white hover:bg-mint shadow-soft transition-all active:scale-95 shrink-0"
        >
          <Search className="w-4 h-4 mr-2 text-freshgreen" />
          Browse All 12 Listings
        </Link>
      </div>

      {/* Unverified Notice */}
      {!isVerified && (
        <div className="bg-[#FFF3E8] border border-[#FED7AA] rounded-2xl p-5 text-darktext flex items-start space-x-3.5">
          <ShieldAlert className="w-5 h-5 text-orange shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <h3 className="font-bold text-orange">Verification Pending</h3>
            <p className="text-slate-600">
              Your NGO registration is awaiting administrator review. You can browse all food listings, but requesting food is locked until verified.
            </p>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Browse Available Food"
          value={availableDonations.length}
          icon={Package}
          color="forest"
          subtitle="Available for request"
        />
        <StatCard
          label="My Requests"
          value={myRequests.length}
          icon={Clock}
          color="orange"
          subtitle="Total requests submitted"
        />
        <StatCard
          label="Approved Requests"
          value={approvedRequestsCount}
          icon={Truck}
          color="fresh"
          subtitle="Ready for pickup"
        />
        <StatCard
          label="Completed Collections"
          value={completedCollectionsCount}
          icon={CheckCircle2}
          color="mint"
          subtitle="Successfully collected"
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-soft space-y-6">
        <div className="flex items-center space-x-2 border-b border-surface-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'browse'
                ? 'bg-forest text-mint shadow-xs'
                : 'text-darktext/70 hover:text-forest hover:bg-surface-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Browse Available Food ({availableDonations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'requests'
                ? 'bg-forest text-mint shadow-xs'
                : 'text-darktext/70 hover:text-forest hover:bg-surface-50'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>My Requests ({myRequests.length})</span>
          </button>
        </div>

        {/* Tab 1: Browse Available Food */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Category Filters */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-forest text-mint'
                        : 'bg-surface-100 text-darktext/70 hover:bg-surface-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Search food name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-forest text-mint hover:bg-darkgreen transition-all"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Food Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : availableDonations.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-darktext">No food listings found</h3>
                <p className="text-xs text-slate-400 mt-1">Try another category or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableDonations.map((donation) => (
                  <DonationCard
                    key={donation.id}
                    donation={donation}
                    isNgo={true}
                    isVerifiedNgo={isVerified}
                    onRequest={(d) => setSelectedDonationForRequest(d)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {myRequests.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-darktext">No requests submitted yet</h3>
                <p className="text-xs text-slate-400 mt-1">Browse available food above to submit a request.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-surface-200 hover:border-surface-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-darktext text-sm">{req.donation?.title}</span>
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                      <p className="text-slate-600">
                        Donor: <strong>{req.donation?.donor?.organization || req.donation?.donor?.name}</strong> • Quantity: {req.requestedQuantity || req.donation?.quantity}
                      </p>
                      <p className="text-slate-500 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-darkgreen" />
                        {req.donation?.pickupLocation}
                      </p>
                      {req.donorResponseNote && (
                        <p className="text-forest bg-mint/40 p-2 rounded-lg font-medium">
                          Note from Donor: {req.donorResponseNote}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[11px] text-slate-400">
                        Submitted: {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      <RequestModal
        donation={selectedDonationForRequest}
        isOpen={!!selectedDonationForRequest}
        onClose={() => setSelectedDonationForRequest(null)}
        onSuccess={() => {
          setSelectedDonationForRequest(null);
          fetchData();
        }}
      />
    </div>
  );
};
