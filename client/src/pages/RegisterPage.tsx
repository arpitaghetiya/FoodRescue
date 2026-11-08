import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  HeartHandshake,
  UtensilsCrossed,
  Building,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<'DONOR' | 'NGO'>('DONOR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [organization, setOrganization] = useState('');
  // NGO fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [mission, setMission] = useState('');
  const [operationalAreas, setOperationalAreas] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'NGO') setRole('NGO');
    else if (roleParam === 'DONOR') setRole('DONOR');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !organization) {
      setError('Please fill in all required fields.');
      return;
    }

    if (role === 'NGO' && !registrationNumber) {
      setError('Official charity / NGO registration number is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const user = await register({
        name,
        email,
        password,
        role,
        phone,
        address,
        organization,
        registrationNumber: role === 'NGO' ? registrationNumber : undefined,
        mission: role === 'NGO' ? mission : undefined,
        operationalAreas: role === 'NGO' ? operationalAreas : undefined,
      });

      toast.success(
        role === 'NGO' ? 'NGO Account Registered!' : 'Welcome to FoodRescue!',
        role === 'NGO'
          ? 'Your registration has been submitted and is pending administrator review.'
          : 'Your donor profile is ready. You can now post surplus food.'
      );

      if (user.role === 'DONOR') {
        navigate('/donor', { replace: true });
      } else {
        navigate('/ngo', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
      toast.error('Registration Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-3xl p-8 sm:p-12 shadow-soft-xl border border-surface-200"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-white shadow-soft">
              <HeartHandshake className="w-6 h-6 text-mint" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-forest">
              Food<span className="text-freshgreen">Rescue</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-darktext tracking-tight">
            Create your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose whether you are donating surplus food or receiving meals for charity.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-surface-100 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => setRole('DONOR')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
              role === 'DONOR'
                ? 'bg-forest text-mint shadow-soft'
                : 'text-darktext/70 hover:text-darktext hover:bg-white/60'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-freshgreen" />
            <span>Food Donor (Restaurant / Hotel)</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('NGO')}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
              role === 'NGO'
                ? 'bg-orange text-white shadow-soft'
                : 'text-darktext/70 hover:text-darktext hover:bg-white/60'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>NGO / Receiver (Shelter / Charity)</span>
          </button>
        </div>

        {role === 'NGO' && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFF3E8] border border-[#FED7AA] text-orange text-xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Important Notice on NGO Verification:</span>
              <p className="mt-0.5 text-darktext/80 leading-relaxed font-normal">
                To guarantee safe, dignified, and legal food distribution, all newly registered NGO accounts undergo administrative document verification before food claim privileges are unlocked.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-darktext mb-1">
                Contact Person Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. Marco Rossi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>
            </div>

            {/* Organization Name */}
            <div>
              <label htmlFor="reg-org" className="block text-xs font-bold text-darktext mb-1">
                {role === 'DONOR' ? 'Business / Restaurant Name *' : 'NGO / Shelter Name *'}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reg-org"
                  type="text"
                  required
                  placeholder={role === 'DONOR' ? 'e.g. Green Garden Bistro' : 'e.g. Hope Haven Shelter'}
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-darktext mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="contact@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-pass" className="block text-xs font-bold text-darktext mb-1">
                Password (min 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reg-pass"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="block text-xs font-bold text-darktext mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reg-phone"
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="reg-addr" className="block text-xs font-bold text-darktext mb-1">
                Physical Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="reg-addr"
                  type="text"
                  placeholder="123 Main St, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>
            </div>
          </div>

          {/* NGO Specific Fields */}
          {role === 'NGO' && (
            <div className="pt-4 border-t border-surface-200 space-y-4">
              <div>
                <label htmlFor="reg-ngo-num" className="block text-xs font-bold text-darktext mb-1">
                  Non-Profit Charity Registration Number *
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="reg-ngo-num"
                    type="text"
                    required
                    placeholder="e.g. 501(c)(3) # 12-3456789 or NGO-REG-2026"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-mission" className="block text-xs font-bold text-darktext mb-1">
                  Mission Statement & Target Beneficiaries
                </label>
                <textarea
                  id="reg-mission"
                  rows={2}
                  placeholder="Briefly describe who your NGO serves (e.g. unhoused individuals, food-insecure children)..."
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50 resize-none"
                />
              </div>

              <div>
                <label htmlFor="reg-areas" className="block text-xs font-bold text-darktext mb-1">
                  Operational Neighborhoods / Districts
                </label>
                <input
                  id="reg-areas"
                  type="text"
                  placeholder="e.g. Downtown, Westside, University District"
                  value={operationalAreas}
                  onChange={(e) => setOperationalAreas(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-forest hover:bg-darkgreen shadow-soft-lg hover:shadow-soft-xl transition-all flex items-center justify-center text-sm disabled:opacity-50 mt-5 active:scale-95 group"
          >
            {loading ? 'Submitting Registration...' : `Register as ${role === 'DONOR' ? 'Food Donor' : 'NGO'}`}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-surface-100 text-center text-xs text-slate-500">
          Already registered with FoodRescue?{' '}
          <Link
            to="/login"
            className="font-bold text-forest hover:text-darkgreen underline underline-offset-2"
          >
            Sign in to your portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
