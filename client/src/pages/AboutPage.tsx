import React from 'react';
import { HeartHandshake, UtensilsCrossed, Building2, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="inline-block px-3 py-1 rounded-full bg-mint text-forest text-xs font-bold border border-[#B7E4C7]">
          University Capstone Project
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">
          About FoodRescue
        </h1>
        <p className="text-sm text-darktext/75 leading-relaxed max-w-xl mx-auto">
          FoodRescue is a web platform connecting commercial food donors with verified charitable organizations to reduce food waste and support communities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-xl bg-mint text-forest flex items-center justify-center font-bold">
            <UtensilsCrossed className="w-5 h-5 text-forest" />
          </div>
          <h2 className="text-lg font-bold text-darktext">The Purpose</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every day, edible surplus food from restaurants, bakeries, and catered events goes to waste simply because there is no direct channel to notify nearby shelters. FoodRescue bridges that gap with instant online listings.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-soft space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] text-orange flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-darktext">Our Solution</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Food businesses can list surplus food in under two minutes. Only verified NGOs can request listings, ensuring food is collected safely and distributed freely to those in need.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-200 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-forest">Key Platform Principles</h3>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-freshgreen shrink-0" />
            <span>100% free food donation and collection for humanitarian causes.</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-freshgreen shrink-0" />
            <span>Administrator verification for all non-profit organizations.</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-freshgreen shrink-0" />
            <span>Accurate preparation timestamps and strict pickup deadlines.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
