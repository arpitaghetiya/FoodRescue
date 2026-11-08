import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Donation } from '../../types';
import { StatusBadge } from '../common/Badge';
import {
  MapPin,
  Clock,
  Package,
  Building,
  ArrowRight,
  ShieldAlert,
  Flame,
  Utensils,
  Calendar,
} from 'lucide-react';

interface DonationCardProps {
  donation: Donation;
  onSelect?: (donation: Donation) => void;
  onRequest?: (donation: Donation) => void;
  isNgo?: boolean;
  isVerifiedNgo?: boolean;
  showActions?: boolean;
}

export const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  onSelect,
  onRequest,
  isNgo = false,
  isVerifiedNgo = false,
  showActions = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [imgError, setImgError] = useState(false);

  const deadline = new Date(donation.collectionDeadline);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));
  const isExpired = deadline <= now;
  const isUrgent = hoursLeft > 0 && hoursLeft <= 6;

  // Format dynamic deadline relative to now
  const formatDeadline = (date: Date): string => {
    if (isNaN(date.getTime())) return 'Time unrecorded';

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    if (isExpired) {
      const pastHours = Math.abs(hoursLeft);
      if (pastHours < 24) {
        return `Expired (${pastHours}h ago)`;
      }
      return `Expired (${date.toLocaleDateString([], { month: 'short', day: 'numeric' })})`;
    }

    if (isToday) {
      return `Today by ${timeStr}`;
    }
    if (isTomorrow) {
      return `Tomorrow by ${timeStr}`;
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  const defaultImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y: -6, transition: { duration: 0.25 } }}
      className="bg-white rounded-3xl border border-surface-200/90 shadow-soft hover:shadow-soft-xl transition-all duration-300 flex flex-col overflow-hidden group h-full"
    >
      {/* Image Banner */}
      <div className="relative aspect-[16/10] w-full bg-surface-100 overflow-hidden shrink-0">
        <img
          src={imgError || !donation.imageUrl ? defaultImage : donation.imageUrl}
          alt={donation.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-darktext/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

        {/* Category Badge top left */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-forest shadow-soft backdrop-blur-md flex items-center space-x-1">
            <Utensils className="w-3 h-3 text-freshgreen" />
            <span>{donation.category}</span>
          </span>
        </div>

        {/* Status Badge top right */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <StatusBadge status={donation.status} size="sm" />
        </div>

        {/* Expiry Warning Overlay */}
        {isUrgent && donation.status === 'AVAILABLE' && (
          <div className="absolute bottom-3 left-3.5 right-3.5 bg-orange/95 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl flex items-center justify-between font-bold shadow-soft">
            <span className="flex items-center">
              <Flame className="w-3.5 h-3.5 mr-1.5 animate-bounce" /> Urgent Collection
            </span>
            <span>{hoursLeft > 0 ? `${hoursLeft}h left` : 'Expiring soon'}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Donor attribution */}
          <div className="flex items-center space-x-2 text-xs text-darktext/70 mb-2">
            <div className="p-1 rounded-lg bg-mint text-forest shrink-0">
              <Building className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-forest truncate">
              {donation.donor?.organization || donation.donor?.name || 'Verified Food Donor'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-darktext group-hover:text-forest transition-colors line-clamp-1">
            {donation.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {donation.description}
          </p>

          {/* Key Attributes Grid */}
          <div className="mt-4 pt-3.5 border-t border-surface-100 grid grid-cols-2 gap-2.5 text-xs text-darktext/80">
            <div className="flex items-center space-x-2 bg-surface-50 p-2 rounded-xl">
              <Package className="w-4 h-4 text-freshgreen shrink-0" />
              <span className="font-bold truncate">{donation.quantity}</span>
            </div>

            <div className="flex items-center space-x-2 bg-surface-50 p-2 rounded-xl">
              <Clock className="w-4 h-4 text-orange shrink-0" />
              <span className={`truncate ${isExpired ? 'text-rose-600 font-semibold' : ''}`}>
                {formatDeadline(deadline)}
              </span>
            </div>

            <div className="col-span-2 flex items-center space-x-2 text-slate-500 px-1">
              <MapPin className="w-3.5 h-3.5 text-darkgreen shrink-0" />
              <span className="truncate text-[11px]">{donation.pickupLocation}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {showActions && (
          <div className="pt-2 border-t border-surface-100 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onSelect && onSelect(donation)}
              className="flex-1 py-2.5 px-3.5 text-xs font-bold rounded-xl border border-surface-200 text-darktext hover:bg-surface-100 transition-colors text-center"
            >
              Details
            </button>

            {isNgo && donation.status === 'AVAILABLE' && (
              <button
                type="button"
                onClick={() => onRequest && onRequest(donation)}
                disabled={!isVerifiedNgo || isExpired}
                className={`flex-1 py-2.5 px-3.5 text-xs font-bold rounded-xl flex items-center justify-center transition-all shadow-soft active:scale-95 ${
                  isExpired
                    ? 'bg-surface-100 text-slate-400 cursor-not-allowed border border-surface-200'
                    : isVerifiedNgo
                    ? 'bg-forest text-mint hover:bg-darkgreen'
                    : 'bg-surface-100 text-slate-400 cursor-not-allowed border border-surface-200'
                }`}
                title={
                  isExpired
                    ? 'This donation has expired and cannot be claimed'
                    : !isVerifiedNgo
                    ? 'Account verification required to claim food'
                    : 'Claim Food Donation'
                }
              >
                {isExpired ? (
                  <span>Expired</span>
                ) : !isVerifiedNgo ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 mr-1 text-orange" />
                    Unverified
                  </>
                ) : (
                  <>
                    Claim Food
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
