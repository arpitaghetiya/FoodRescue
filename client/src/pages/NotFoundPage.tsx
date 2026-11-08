import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-5">
        <div className="w-18 h-18 rounded-3xl bg-mint text-forest flex items-center justify-center mx-auto shadow-soft">
          <HeartHandshake className="w-10 h-10 text-darkgreen" />
        </div>
        <h1 className="text-6xl font-extrabold text-forest tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-darktext">Page Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          The requested resource doesn’t exist or has been relocated to another section of the marketplace.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 rounded-2xl text-xs font-bold text-mint bg-forest hover:bg-darkgreen shadow-soft transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
