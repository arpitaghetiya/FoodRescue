export type Role = 'DONOR' | 'NGO' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type DonationStatus =
  | 'AVAILABLE'
  | 'REQUESTED'
  | 'APPROVED'
  | 'PICKUP_SCHEDULED'
  | 'COLLECTED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export type RequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PICKUP_SCHEDULED'
  | 'COLLECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface NgoProfile {
  id: string;
  userId: string;
  registrationNumber: string;
  mission?: string | null;
  operationalAreas?: string | null;
  verificationStatus: VerificationStatus;
  verificationNote?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  address?: string | null;
  organization?: string | null;
  ngoProfile?: NgoProfile | null;
  createdAt?: string;
  _count?: {
    donations?: number;
    requests?: number;
  };
}

export interface Donation {
  id: string;
  donorId: string;
  donor: {
    id: string;
    name: string;
    organization?: string | null;
    phone?: string | null;
    email: string;
    address?: string | null;
  };
  title: string;
  category: string;
  quantity: string;
  quantityNumeric: number;
  description: string;
  dietaryInfo?: string | null;
  storageRequirement?: string | null;
  preparationDate: string;
  collectionDeadline: string;
  pickupLocation: string;
  pickupInstructions?: string | null;
  status: DonationStatus;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  requests?: DonationRequest[];
}

export interface DonationRequest {
  id: string;
  donationId: string;
  donation: Donation;
  ngoId: string;
  ngo: {
    id: string;
    name: string;
    organization?: string | null;
    phone?: string | null;
    email: string;
    ngoProfile?: NgoProfile | null;
  };
  requestedQuantity?: string | null;
  notes?: string | null;
  status: RequestStatus;
  donorResponseNote?: string | null;
  pickupScheduledAt?: string | null;
  collectedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  user?: {
    name: string;
    role: string;
    email: string;
  } | null;
  action: string;
  details: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDonors: number;
  totalNgos: number;
  verifiedNgos: number;
  pendingNgos: number;
  rejectedNgos: number;
  totalDonations: number;
  availableDonations: number;
  completedDonations: number;
  activeRequests: number;
}

