import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Donation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DonationCard } from '../../components/donation/DonationCard';
import { RequestModal } from '../../components/donation/RequestModal';
import { Modal } from '../../components/common/Modal';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Search, MapPin, Package, Filter, Clock, UtensilsCrossed, Sparkles } from 'lucide-react';

export const BrowseDonationsPage: React.FC = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('');

  // Modals
  const [selectedDonationForRequest, setSelectedDonationForRequest] = useState<Donation | null>(null);
  const [viewDetails, setViewDetails] = useState<Donation | null>(null);

  const isVerifiedNgo = user?.role === 'NGO' && user?.ngoProfile?.verificationStatus === 'VERIFIED';
  const isNgo = user?.role === 'NGO';

  const categories = [
    'ALL',
    'Cooked Meals',
    'Bakery & Bread',
    'Produce & Fruits',
    'Packaged & Canned',
    'Dairy & Eggs',
    'Beverages',
    'Other',
  ];

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await api.donations.getAvailable({
        search: search || undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        location: locationFilter || undefined,
      });
      if (res.donations) setDonations(res.donations);
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonations();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">
          Browse Available Food
        </h1>
        <p className="text-sm text-darktext/75 mt-1.5 max-w-2xl leading-relaxed">
          Find fresh surplus food ready for collection by verified charitable organizations.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-surface-200 shadow-soft space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-forest text-mint shadow-soft'
                  : 'bg-surface-100 text-darktext/70 hover:bg-surface-200 hover:text-darktext'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by meal title, ingredients, or food keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
            />
          </div>

          <div className="sm:col-span-3 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Filter by area / city..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-3 px-4 text-xs font-bold rounded-xl bg-forest text-mint hover:bg-darkgreen transition-all shadow-soft flex items-center justify-center active:scale-95"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-surface-200 shadow-soft">
          <Package className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-darktext">No matching food listings found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or reset your category filter to view all listings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              isNgo={isNgo}
              isVerifiedNgo={isVerifiedNgo}
              onRequest={(d) => setSelectedDonationForRequest(d)}
              onSelect={(d) => setViewDetails(d)}
            />
          ))}
        </div>
      )}

      {/* Claim Modal for NGO */}
      <RequestModal
        donation={selectedDonationForRequest}
        isOpen={!!selectedDonationForRequest}
        onClose={() => setSelectedDonationForRequest(null)}
        onSuccess={() => {
          setSelectedDonationForRequest(null);
          fetchDonations();
        }}
      />

      {/* Details Modal */}
      <Modal
        isOpen={!!viewDetails}
        onClose={() => setViewDetails(null)}
        title={viewDetails?.title || 'Food Listing Details'}
        subtitle={`Posted by ${viewDetails?.donor?.organization || viewDetails?.donor?.name}`}
      >
        {viewDetails && (
          <div className="space-y-5 text-xs sm:text-sm text-darktext">
            {viewDetails.imageUrl && (
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-surface-100">
                <img
                  src={viewDetails.imageUrl}
                  alt={viewDetails.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 bg-surface-50 p-4 rounded-2xl border border-surface-200">
              <div>
                <span className="text-slate-400 text-xs">Category:</span>
                <p className="font-bold text-darktext">{viewDetails.category}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Quantity:</span>
                <p className="font-bold text-darktext">{viewDetails.quantity}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Dietary:</span>
                <p className="font-bold text-darktext">{viewDetails.dietaryInfo || 'Standard'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Storage:</span>
                <p className="font-bold text-darktext">{viewDetails.storageRequirement || 'Ambient'}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-xs font-bold uppercase">Description:</span>
              <p className="text-slate-600 mt-1 leading-relaxed">{viewDetails.description}</p>
            </div>

            <div className="pt-3 border-t border-surface-100 space-y-2 text-xs">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-orange shrink-0" />
                <span>
                  Must collect before:{' '}
                  <strong>{new Date(viewDetails.collectionDeadline).toLocaleString()}</strong>
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-darkgreen shrink-0" />
                <span>{viewDetails.pickupLocation}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2.5 border-t border-surface-100">
              <button
                onClick={() => setViewDetails(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-surface-100 rounded-xl"
              >
                Close
              </button>
              {isVerifiedNgo && (
                <button
                  onClick={() => {
                    const d = viewDetails;
                    setViewDetails(null);
                    setSelectedDonationForRequest(d);
                  }}
                  className="px-6 py-2.5 text-xs font-bold text-mint bg-forest hover:bg-darkgreen rounded-xl shadow-soft"
                >
                  Request This Food
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
