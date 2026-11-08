import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'forest' | 'fresh' | 'orange' | 'darkgreen' | 'mint';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  color = 'forest',
  trend,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState<number | string>(
    typeof value === 'number' && !shouldReduceMotion ? 0 : value
  );

  useEffect(() => {
    if (typeof value !== 'number' || shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const duration = 800; // ms
    const steps = 25;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, shouldReduceMotion]);

  const colorVariants = {
    forest: {
      bg: 'bg-white',
      border: 'border-surface-200/80',
      iconBg: 'bg-forest text-white',
      valColor: 'text-forest',
    },
    darkgreen: {
      bg: 'bg-white',
      border: 'border-surface-200/80',
      iconBg: 'bg-darkgreen text-white',
      valColor: 'text-darkgreen',
    },
    fresh: {
      bg: 'bg-white',
      border: 'border-surface-200/80',
      iconBg: 'bg-freshgreen text-white',
      valColor: 'text-darkgreen',
    },
    orange: {
      bg: 'bg-white',
      border: 'border-surface-200/80',
      iconBg: 'bg-orange text-white',
      valColor: 'text-orange',
    },
    mint: {
      bg: 'bg-white',
      border: 'border-surface-200/80',
      iconBg: 'bg-mint text-forest',
      valColor: 'text-forest',
    },
  };

  const v = colorVariants[color];

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
      className={`relative ${v.bg} rounded-3xl p-6 border ${v.border} shadow-soft hover:shadow-soft-lg transition-shadow flex flex-col justify-between overflow-hidden group`}
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-mint/20 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-mint/40 transition-colors"></div>

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <h3 className={`text-3xl sm:text-4xl font-extrabold ${v.valColor} tracking-tight`}>
              {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
            </h3>
            {trend && (
              <span className="text-xs font-semibold text-freshgreen bg-mint/60 px-2 py-0.5 rounded-full">
                {trend}
              </span>
            )}
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl ${v.iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-surface-100 flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-freshgreen mr-2"></span>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
