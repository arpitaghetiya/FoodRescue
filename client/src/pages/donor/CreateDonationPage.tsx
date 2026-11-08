import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  UtensilsCrossed,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Package,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const CreateDonationPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [dietaryInfo, setDietaryInfo] = useState('Vegetarian, Standard Food Safety Compliant');
  const [storageRequirement, setStorageRequirement] = useState('Ambient Room Temperature');

  // Dates
  const nowStr = new Date().toISOString().slice(0, 16);
  const futureStr = new Date(Date.now() + 6 * 3600000).toISOString().slice(0, 16);

  const [preparationDate, setPreparationDate] = useState(nowStr);
  const [collectionDeadline, setCollectionDeadline] = useState(futureStr);
  const [pickupLocation, setPickupLocation] = useState(user?.address || '');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Cooked Meals',
    'Bakery & Bread',
    'Packaged & Canned',
    'Produce & Fruits',
    'Dairy & Eggs',
    'Beverages',
    'Other',
  ];

  const presetImages = [
    {
      label: 'Cooked Meals',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Bakery',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Produce',
      url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Sandwiches',
      url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    },
    {
      label: 'Banquet Food',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !quantity || !description || !pickupLocation) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    const prepTime = new Date(preparationDate).getTime();
    const deadlineTime = new Date(collectionDeadline).getTime();

    if (deadlineTime <= Date.now()) {
      setError('Collection deadline must be in the future.');
      return;
    }

    if (deadlineTime <= prepTime) {
      setError('Collection deadline must be set after the preparation date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.donations.create({
        title,
        category,
        quantity,
        description,
        dietaryInfo,
        storageRequirement,
        preparationDate: new Date(preparationDate).toISOString(),
        collectionDeadline: new Date(collectionDeadline).toISOString(),
        pickupLocation,
        pickupInstructions,
        imageUrl,
      });

      toast.success('Food Listing Published!', 'Your surplus food is now visible to verified NGOs.');
      navigate('/donor');
    } catch (err: any) {
      setError(err.message || 'Failed to list food donation.');
      toast.error('Publication Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/donor"
        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-forest mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
        Back to Donor Dashboard
      </Link>

      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-10 border border-surface-200 shadow-soft-xl"
      >
        <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-surface-100">
          <div className="w-12 h-12 rounded-2xl bg-forest text-mint flex items-center justify-center shadow-soft">
            <UtensilsCrossed className="w-6 h-6 text-mint" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
              Create Surplus Food Donation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Publish excess edible food from your kitchen directly to verified local charities.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Item Details */}
          <div>
            <div className="flex items-center space-x-2 text-forest mb-4">
              <span className="w-6 h-6 rounded-full bg-mint text-forest flex items-center justify-center text-xs font-extrabold">
                1
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-darktext">
                Food Classification & Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="create-title" className="block text-xs font-bold text-darktext mb-1">
                  Food Item Name / Title *
                </label>
                <input
                  id="create-title"
                  type="text"
                  required
                  placeholder="e.g. 50 Servings Fresh Vegetable Biryani & Raita"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>

              <div>
                <label htmlFor="create-category" className="block text-xs font-bold text-darktext mb-1">
                  Food Category *
                </label>
                <select
                  id="create-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="create-quantity" className="block text-xs font-bold text-darktext mb-1">
                  Quantity & Packaging *
                </label>
                <input
                  id="create-quantity"
                  type="text"
                  required
                  placeholder="e.g. 50 Meal Boxes or 25 kg in 2 crates"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="create-desc" className="block text-xs font-bold text-darktext mb-1">
                  Description & Ingredients *
                </label>
                <textarea
                  id="create-desc"
                  rows={3}
                  required
                  placeholder="Describe meal contents, packaging condition, how it was prepared, and any allergen warnings..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50 resize-none"
                />
              </div>

              <div>
                <label htmlFor="create-dietary" className="block text-xs font-bold text-darktext mb-1">
                  Dietary Information
                </label>
                <input
                  id="create-dietary"
                  type="text"
                  placeholder="e.g. Vegetarian, Halal, Nut-Free, Contains Dairy"
                  value={dietaryInfo}
                  onChange={(e) => setDietaryInfo(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>

              <div>
                <label htmlFor="create-storage" className="block text-xs font-bold text-darktext mb-1">
                  Storage Condition
                </label>
                <select
                  id="create-storage"
                  value={storageRequirement}
                  onChange={(e) => setStorageRequirement(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                >
                  <option value="Ambient Room Temperature">Ambient Room Temperature</option>
                  <option value="Refrigerate Below 4°C">Refrigerate Below 4°C</option>
                  <option value="Hot Hold Above 65°C">Hot Hold Above 65°C</option>
                  <option value="Frozen Below -18°C">Frozen Below -18°C</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Freshness & Timing */}
          <div className="pt-6 border-t border-surface-100">
            <div className="flex items-center space-x-2 text-forest mb-4">
              <span className="w-6 h-6 rounded-full bg-mint text-forest flex items-center justify-center text-xs font-extrabold">
                2
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-darktext">
                Freshness Window & Strict Expiration
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="create-prep-time" className="block text-xs font-bold text-darktext mb-1">
                  Preparation Date & Time *
                </label>
                <input
                  id="create-prep-time"
                  type="datetime-local"
                  required
                  value={preparationDate}
                  onChange={(e) => setPreparationDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>

              <div>
                <label htmlFor="create-deadline" className="block text-xs font-bold text-darktext mb-1">
                  Collection Deadline (Strict Expiry) *
                </label>
                <input
                  id="create-deadline"
                  type="datetime-local"
                  required
                  value={collectionDeadline}
                  onChange={(e) => setCollectionDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Listings automatically lock and expire after this deadline.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Location */}
          <div className="pt-6 border-t border-surface-100">
            <div className="flex items-center space-x-2 text-forest mb-4">
              <span className="w-6 h-6 rounded-full bg-mint text-forest flex items-center justify-center text-xs font-extrabold">
                3
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-darktext">
                Pickup Logistics & Access
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="create-pickup-loc" className="block text-xs font-bold text-darktext mb-1">
                  Pickup Street Address *
                </label>
                <input
                  id="create-pickup-loc"
                  type="text"
                  required
                  placeholder="e.g. 452 Elm Street, Downtown Dining District"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="create-instructions" className="block text-xs font-bold text-darktext mb-1">
                  Driver Instructions & Building Entry
                </label>
                <input
                  id="create-instructions"
                  type="text"
                  placeholder="e.g. Ring back kitchen buzzer; ask for duty chef"
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Photo Selection */}
          <div className="pt-6 border-t border-surface-100">
            <div className="flex items-center space-x-2 text-forest mb-3">
              <span className="w-6 h-6 rounded-full bg-mint text-forest flex items-center justify-center text-xs font-extrabold">
                4
              </span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-darktext">
                Food Presentation Image
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-3.5">
              Select one of our royalty-free visual presets or enter a custom photo URL:
            </p>

            <div className="flex flex-wrap gap-2.5 mb-3.5">
              {presetImages.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    imageUrl === preset.url
                      ? 'bg-forest text-mint border-forest shadow-soft'
                      : 'bg-surface-50 text-darktext border-surface-200 hover:bg-surface-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 text-xs rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-surface-100 flex items-center justify-end space-x-3">
            <Link
              to="/donor"
              className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-surface-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 text-xs sm:text-sm font-bold text-mint bg-forest hover:bg-darkgreen rounded-2xl transition-all shadow-soft-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Food Listing...' : 'Publish Food Donation'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
