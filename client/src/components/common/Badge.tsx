import React from 'react';
import { DonationStatus, RequestStatus, VerificationStatus } from '../../types';
import {
  CheckCircle2,
  Clock,
  Truck,
  Check,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface BadgeProps {
  status: DonationStatus | RequestStatus | VerificationStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses =
    size === 'sm' ? 'px-2.5 py-1 text-xs font-semibold' : 'px-3.5 py-1.5 text-xs font-bold';

  let colorClasses = 'bg-surface-100 text-darktext border-surface-200';
  let Icon = Clock;
  let pulse = false;

  switch (status) {
    case 'AVAILABLE':
      colorClasses = 'bg-mint text-forest border-[#B7E4C7]';
      Icon = CheckCircle2;
      break;
    case 'REQUESTED':
    case 'PENDING':
      colorClasses = 'bg-[#FFF3E8] text-orange border-[#FED7AA]';
      Icon = Clock;
      pulse = true;
      break;
    case 'APPROVED':
      colorClasses = 'bg-[#EBF5FB] text-[#1B4E6B] border-[#AED6F1]';
      Icon = Check;
      break;
    case 'PICKUP_SCHEDULED':
      colorClasses = 'bg-[#F4EFFB] text-[#5B2C8C] border-[#D7BDE2]';
      Icon = Truck;
      pulse = true;
      break;
    case 'COLLECTED':
      colorClasses = 'bg-[#E8F8F5] text-[#117A65] border-[#A3E4D7]';
      Icon = Truck;
      break;
    case 'COMPLETED':
      colorClasses = 'bg-forest text-mint border-forest shadow-xs';
      Icon = CheckCircle2;
      break;
    case 'VERIFIED':
      colorClasses = 'bg-mint text-forest border-[#95D5B2] font-bold';
      Icon = ShieldCheck;
      break;
    case 'REJECTED':
      colorClasses = 'bg-[#FDF2F2] text-[#9B1C1C] border-[#F8B4B4]';
      Icon = XCircle;
      break;
    case 'EXPIRED':
      colorClasses = 'bg-surface-200 text-slate-600 border-surface-300';
      Icon = AlertTriangle;
      break;
    case 'CANCELLED':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      break;
    default:
      colorClasses = 'bg-surface-100 text-darktext border-surface-200';
      Icon = Clock;
  }

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all ${sizeClasses} ${colorClasses}`}
    >
      <span className="relative flex h-2 w-2 mr-1.5">
        {pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
        )}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current opacity-90"></span>
      </span>
      <Icon className="w-3.5 h-3.5 mr-1 shrink-0 opacity-80" />
      <span className="capitalize">{formatText(status).toLowerCase()}</span>
    </span>
  );
};
