import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  UtensilsCrossed,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      num: '1',
      title: 'Donor Posts Surplus Food',
      desc: 'Restaurants, cafes, bakeries, or supermarkets list their excess edible food with quantity, category, pickup location, and a collection deadline.',
      color: 'bg-mint text-forest',
    },
    {
      num: '2',
      title: 'Admin Verifies NGOs',
      desc: 'To ensure food reaches real charities and is handled safely, administrators review each NGO registration before allowing food requests.',
      color: 'bg-[#FFF3E8] text-orange',
    },
    {
      num: '3',
      title: 'NGO Requests Food',
      desc: 'Verified NGOs browse available listings in their area, check food details, and request the items their community needs.',
      color: 'bg-[#EBF5FB] text-[#1B4E6B]',
    },
    {
      num: '4',
      title: 'Donor Approves Request',
      desc: 'The donor reviews the NGO request and confirms the pickup time and instructions.',
      color: 'bg-mint text-forest',
    },
    {
      num: '5',
      title: 'Food Is Collected',
      desc: 'The NGO arrives before the deadline to collect the food in clean, temperature-safe containers.',
      color: 'bg-[#FFF3E8] text-orange',
    },
    {
      num: '6',
      title: 'Meals Distributed',
      desc: 'The food is served to families and individuals in need, and the donation cycle is marked complete.',
      color: 'bg-forest text-mint',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-block px-3 py-1 rounded-full bg-mint text-forest text-xs font-bold border border-[#B7E4C7]">
          Simple Redistribution Process
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest tracking-tight">
          How FoodRescue Works
        </h1>
        <p className="text-sm text-darktext/75 leading-relaxed">
          From kitchen surplus to community meals. Here is how donors and verified charities coordinate safe food handovers.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step) => (
          <motion.div
            key={step.num}
            whileHover={shouldReduceMotion ? {} : { y: -4 }}
            className="bg-white rounded-2xl p-6 sm:p-7 border border-surface-200 shadow-soft space-y-3"
          >
            <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center font-extrabold text-base shadow-xs`}>
              {step.num}
            </div>
            <h3 className="text-base font-bold text-darktext">{step.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Simple Guidelines Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-surface-200 shadow-soft max-w-3xl mx-auto space-y-4">
        <h3 className="text-lg font-bold text-forest">Food Safety & Quality Guidelines</h3>
        <ul className="space-y-2.5 text-xs text-slate-600">
          <li className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-freshgreen shrink-0 mt-0.5" />
            <span><strong>Wholesome, unserved food only:</strong> Prepared meals, bakery items, fresh produce, and packaged foods that are safe to consume.</span>
          </li>
          <li className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-freshgreen shrink-0 mt-0.5" />
            <span><strong>Strict pickup deadlines:</strong> All food must be collected within the designated window. Expired listings cannot be claimed.</span>
          </li>
          <li className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-freshgreen shrink-0 mt-0.5" />
            <span><strong>Verified organizations only:</strong> Only verified NGOs and shelters can request and receive donations.</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center pt-2">
        <Link
          to="/available"
          className="inline-flex items-center px-7 py-3.5 rounded-xl font-bold text-mint bg-forest hover:bg-darkgreen shadow-soft text-sm transition-all active:scale-95 group"
        >
          Browse Available Food
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
