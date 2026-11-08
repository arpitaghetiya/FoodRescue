import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  HeartHandshake,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);

  const isProduction = import.meta.env.PROD;
  const showDemoAccounts = !isProduction || import.meta.env.VITE_ENABLE_DEMO_LOGINS === 'true';

  const allDemoAccounts = [
    // Admin demo account is strictly excluded in production builds
    ...(!isProduction
      ? [
          {
            roleKey: 'admin',
            role: 'Administrator',
            email: 'admin@foodrescue.org',
            pass: 'Admin@123',
            desc: 'System Admin (Local dev only) • Verify NGOs & manage users',
            badge: 'Admin Dev',
            targetPath: '/admin',
            color: 'bg-forest text-mint border-forest',
          },
        ]
      : []),
    {
      roleKey: 'donor',
      role: 'Food Donor (Restaurant)',
      email: 'donor.green@foodrescue.org',
      pass: 'Donor@123',
      desc: 'Green Garden Bistro • Post meals, approve NGO claims',
      badge: 'Donor Portal',
      targetPath: '/donor',
      color: 'bg-mint text-forest border-[#B7E4C7]',
    },
    {
      roleKey: 'ngo',
      role: 'Verified NGO',
      email: 'ngo.hope@foodrescue.org',
      pass: 'Ngo@123',
      desc: 'Hope Haven Shelter • Browse & claim available surplus food',
      badge: 'Verified NGO',
      targetPath: '/ngo',
      color: 'bg-[#EBF5FB] text-[#1B4E6B] border-[#AED6F1]',
    },
    {
      roleKey: 'unverified',
      role: 'Evaluation NGO (Unverified)',
      email: 'ngo.new@foodrescue.org',
      pass: 'Ngo@123',
      desc: 'New Dawn Relief • Test restrictions on unverified accounts',
      badge: 'Pending Review',
      targetPath: '/ngo',
      color: 'bg-[#FFF3E8] text-orange border-[#FED7AA]',
    },
  ];

  const demoAccounts = showDemoAccounts ? allDemoAccounts : [];

  // Auto-fill if query parameter passed, e.g. ?role=donor or ?role=admin
  useEffect(() => {
    const roleParam = searchParams.get('role')?.toLowerCase();
    if (roleParam) {
      const match = demoAccounts.find((d) => d.roleKey === roleParam || d.role.toLowerCase().includes(roleParam));
      if (match) {
        setEmail(match.email);
        setPassword(match.pass);
      }
    }
  }, [searchParams]);

  const executeLogin = async (userEmail: string, userPass: string, targetRoleName?: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await login(userEmail, userPass);
      toast.success(
        `Welcome, ${user.name}!`,
        targetRoleName ? `Authenticated into ${targetRoleName}.` : `Signed in as ${user.role}.`
      );

      const state = location.state as { from?: { pathname: string } } | undefined;
      if (state?.from?.pathname) {
        navigate(state.from.pathname, { replace: true });
        return;
      }

      if (user.role === 'DONOR') navigate('/donor', { replace: true });
      else if (user.role === 'NGO') navigate('/ngo', { replace: true });
      else if (user.role === 'ADMIN') navigate('/admin', { replace: true });
      else navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      toast.error('Authentication Failed', err.message);
    } finally {
      setLoading(false);
      setLoggingInRole(null);
    }
  };

  const handle1ClickLogin = async (demo: typeof demoAccounts[0]) => {
    setEmail(demo.email);
    setPassword(demo.pass);
    setLoggingInRole(demo.roleKey);
    await executeLogin(demo.email, demo.pass, demo.role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }
    await executeLogin(email, password);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full gap-8 items-start ${
          demoAccounts.length > 0 ? 'max-w-4xl grid grid-cols-1 md:grid-cols-12' : 'max-w-md'
        }`}
      >
        {/* Left Column: Login Card */}
        <div className={demoAccounts.length > 0 ? 'md:col-span-7 bg-white rounded-3xl p-8 sm:p-10 shadow-soft-xl border border-surface-200' : 'bg-white rounded-3xl p-8 sm:p-10 shadow-soft-xl border border-surface-200'}>
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-white shadow-soft">
                <HeartHandshake className="w-6 h-6 text-mint" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-forest">
                Food<span className="text-freshgreen">Rescue</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-darktext tracking-tight">
              Sign in to your portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a quick demo role on the right or enter credentials below.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-darktext mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.org"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-pass" className="block text-xs font-bold text-darktext mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="login-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-forest bg-surface-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-forest hover:bg-darkgreen shadow-soft-lg hover:shadow-soft-xl transition-all flex items-center justify-center text-sm disabled:opacity-50 mt-4 active:scale-95 group"
            >
              {loading && !loggingInRole ? 'Authenticating...' : 'Sign In to FoodRescue'}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-100 text-center text-xs text-slate-500">
            Don’t have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-forest hover:text-darkgreen underline underline-offset-2"
            >
              Register here as Donor or NGO
            </Link>
          </div>
        </div>

        {/* Right Column: 1-Click Demo Accounts */}
        {demoAccounts.length > 0 && (
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-7 shadow-soft-xl border border-surface-200">
              <div className="flex items-center space-x-2 text-forest mb-2">
                <Sparkles className="w-4 h-4 text-orange" />
                <h3 className="text-xs font-extrabold uppercase tracking-widest">
                  1-Click Demonstration Accounts
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Click any sample role below for instant authentication into that dashboard:
              </p>

              <div className="space-y-3">
                {demoAccounts.map((demo) => {
                  const isThisLoading = loading && loggingInRole === demo.roleKey;
                  return (
                    <button
                      key={demo.email}
                      type="button"
                      disabled={loading}
                      onClick={() => handle1ClickLogin(demo)}
                      className="w-full text-left p-3.5 rounded-2xl border border-surface-200 hover:border-freshgreen hover:bg-surface-50/90 transition-all group relative active:scale-[0.99] disabled:opacity-60"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-darktext group-hover:text-forest flex items-center">
                          <Zap className="w-3.5 h-3.5 mr-1.5 text-orange shrink-0" />
                          {demo.role}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${demo.color}`}>
                          {demo.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{demo.desc}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-darkgreen font-semibold">
                          {demo.email}
                        </span>
                        <span className="text-[10px] font-bold text-forest group-hover:underline flex items-center">
                          {isThisLoading ? 'Entering...' : 'Instant Login →'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-surface-100 text-[11px] text-slate-500 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-freshgreen shrink-0" />
                <span>
                  Sample evaluation profiles for quick role testing.
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
