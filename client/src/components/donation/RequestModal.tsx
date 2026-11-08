import React, { useState } from 'react';
import { Donation } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Package, Clock, MapPin, AlertCircle, ShieldCheck } from 'lucide-react';

interface RequestModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  donation,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [safetyChecked, setSafetyChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!donation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyChecked) {
      setError('Please acknowledge the food safety and prompt collection commitment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await api.requests.create({
        donationId: donation.id,
        requestedQuantity: requestedQuantity.trim() || donation.quantity,
        notes: notes.trim() || 'Food distribution to local community beneficiaries.',
        pickupDate: pickupDate || undefined,
      });

      toast.success('Food Claim Submitted!', 'The donor has received your request and distribution plan.');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
      toast.error('Request Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Surplus Food"
      subtitle={`Connecting with ${donation.donor?.organization || donation.donor?.name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Donation Brief Card */}
        <div className="bg-surface-50 rounded-2xl p-4 border border-surface-200 text-xs space-y-2">
          <p className="font-bold text-darktext text-sm">{donation.title}</p>
          <div className="grid grid-cols-2 gap-2 text-darktext/80">
            <div className="flex items-center space-x-1.5">
              <Package className="w-3.5 h-3.5 text-forest" />
              <span>Available: <strong>{donation.quantity}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-orange" />
              <span>Deadline: {new Date(donation.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div className="flex items-center text-slate-500 pt-1">
            <MapPin className="w-3.5 h-3.5 mr-1 text-darkgreen shrink-0" />
            <span className="truncate">{donation.pickupLocation}</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label htmlFor="req-qty" className="block text-xs font-bold text-darktext mb-1">
            Requested Quantity <span className="text-slate-400 font-normal">(Leave blank to claim all)</span>
          </label>
          <input
            id="req-qty"
            type="text"
            placeholder={donation.quantity}
            value={requestedQuantity}
            onChange={(e) => setRequestedQuantity(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
          />
        </div>

        {/* Planned Pickup Date/Time */}
        <div>
          <label htmlFor="req-time" className="block text-xs font-bold text-darktext mb-1">
            Estimated Collection Time
          </label>
          <input
            id="req-time"
            type="datetime-local"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
          />
        </div>

        {/* Distribution Notes */}
        <div>
          <label htmlFor="req-notes" className="block text-xs font-bold text-darktext mb-1">
            Distribution Details & Notes for Donor
          </label>
          <textarea
            id="req-notes"
            rows={3}
            placeholder="Explain how your NGO will distribute this food (e.g. evening shelter dinner, family parcels)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50 resize-none"
          />
        </div>

        {/* Food Safety Agreement */}
        <div className="p-3 bg-mint/30 rounded-2xl border border-mint">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={safetyChecked}
              onChange={(e) => setSafetyChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded text-forest border-surface-200 focus:ring-forest"
            />
            <span className="text-xs text-darktext leading-relaxed font-medium">
              We certify that our NGO will collect this food within the deadline using clean, temperature-safe transport and distribute it free of charge to beneficiaries.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-surface-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-surface-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-mint bg-forest hover:bg-darkgreen rounded-xl transition-all shadow-soft flex items-center disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
