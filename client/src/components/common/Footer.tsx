import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Mail, Phone, MapPin, Heart, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const isProduction = import.meta.env.PROD;
  const showDemoBar = !isProduction || import.meta.env.VITE_ENABLE_DEMO_LOGINS === 'true';

  return (
    <footer className="bg-forest text-slate-300 border-t border-darkgreen">
      {/* Demo Credentials Quick-Bar */}
      {showDemoBar && (
        <div className="bg-darkgreen/90 border-b border-forest py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-mint gap-2">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-freshgreen animate-pulse"></span>
              <span className="font-bold text-white">Sample Evaluation Accounts:</span>
              <span className="text-mint/90 hidden md:inline">
                Donor (`donor.green@foodrescue.org`), NGO (`ngo.hope@foodrescue.org`)
              </span>
            </div>
            <Link
              to="/login"
              className="text-white hover:text-freshgreen font-bold flex items-center group transition-colors"
            >
              Demo Sign In <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-darkgreen flex items-center justify-center text-white shadow-soft">
                <HeartHandshake className="w-5 h-5 text-mint" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Food<span className="text-freshgreen">Rescue</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Connecting commercial food donors with verified local charities to reduce food waste and support communities in need.
            </p>
          </div>

          {/* Col 2: Simple Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-mint mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/available" className="hover:text-white transition-colors">
                  Browse Food
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="space-y-2.5 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-widest text-mint mb-3">
              Contact
            </h4>
            <div className="flex items-start space-x-2 text-slate-300">
              <MapPin className="w-4 h-4 text-freshgreen mt-0.5 shrink-0" />
              <span>Tech Campus, Bengaluru, Karnataka 560100</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Mail className="w-4 h-4 text-freshgreen shrink-0" />
              <span>support@foodrescue.org</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Phone className="w-4 h-4 text-freshgreen shrink-0" />
              <span>+91 80 2555 0199</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-darkgreen flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© 2026 FoodRescue Platform.</p>
          <p className="flex items-center text-mint font-medium">
            Designed for Zero Hunger <Heart className="w-3.5 h-3.5 ml-1.5 text-orange fill-orange inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
