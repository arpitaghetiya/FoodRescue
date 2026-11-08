import { Donation, DonationRequest, User, AdminStats, ActivityLog } from '../types';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE = rawApiUrl
  ? rawApiUrl.endsWith('/api')
    ? rawApiUrl
    : `${rawApiUrl}/api`
  : '/api';

const getHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const authToken = token || localStorage.getItem('foodrescue_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg) as any;
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data as T;
}

export const api = {
  // Auth
  auth: {
    register: (payload: any) =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<{ success: boolean; token: string; user: User; message: string }>(r)),

    login: (payload: { email: string; password: string }) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<{ success: boolean; token: string; user: User; message: string }>(r)),

    getMe: () =>
      fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; user: User }>(r)),
  },

  // Donations
  donations: {
    getAvailable: (params?: { search?: string; category?: string; location?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.category && params.category !== 'ALL') query.append('category', params.category);
      if (params?.location) query.append('location', params.location);
      return fetch(`${API_BASE}/donations/available?${query.toString()}`, {
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; count: number; donations: Donation[] }>(r));
    },

    getMyDonations: () =>
      fetch(`${API_BASE}/donations/my`, {
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; count: number; donations: Donation[] }>(r)),

    getById: (id: string) =>
      fetch(`${API_BASE}/donations/${id}`, {
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; donation: Donation }>(r)),

    create: (payload: any) =>
      fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<{ success: boolean; donation: Donation; message: string }>(r)),

    update: (id: string, payload: any) =>
      fetch(`${API_BASE}/donations/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<{ success: boolean; donation: Donation; message: string }>(r)),

    cancel: (id: string) =>
      fetch(`${API_BASE}/donations/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; message: string }>(r)),
  },

  // Requests
  requests: {
    create: (payload: { donationId: string; requestedQuantity?: string; notes?: string; pickupDate?: string }) =>
      fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<{ success: boolean; request: DonationRequest; message: string }>(r)),

    getMyNgoRequests: () =>
      fetch(`${API_BASE}/requests/ngo`, {
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; count: number; requests: DonationRequest[] }>(r)),

    getRequestsForDonor: () =>
      fetch(`${API_BASE}/requests/donor`, {
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; count: number; requests: DonationRequest[] }>(r)),

    updateStatus: (
      id: string,
      payload: {
        action: 'APPROVE' | 'REJECT' | 'SCHEDULE_PICKUP' | 'COLLECT' | 'COMPLETE' | 'CANCEL';
        donorResponseNote?: string;
        pickupScheduledAt?: string;
      }
    ) =>
      fetch(`${API_BASE}/requests/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<{ success: boolean; request: DonationRequest; message: string }>(r)),
  },

  // Admin
  admin: {
    getStats: () =>
      fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders(),
      }).then((r) =>
        handleResponse<{ success: boolean; stats: AdminStats; recentActivities: ActivityLog[] }>(r)
      ),

    getUsers: (params?: { role?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.role && params.role !== 'ALL') query.append('role', params.role);
      if (params?.search) query.append('search', params.search);
      return fetch(`${API_BASE}/admin/users?${query.toString()}`, {
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; count: number; users: User[] }>(r));
    },

    deleteUser: (id: string) =>
      fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; message: string }>(r)),

    verifyNgo: (ngoProfileId: string, payload: { status: 'VERIFIED' | 'REJECTED'; verificationNote?: string }) =>
      fetch(`${API_BASE}/admin/ngos/${ngoProfileId}/verify`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<{ success: boolean; message: string }>(r)),

    getAllDonations: (params?: { status?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      return fetch(`${API_BASE}/admin/donations?${query.toString()}`, {
        headers: getHeaders(),
      }).then((r) => handleResponse<{ success: boolean; count: number; donations: Donation[] }>(r));
    },

    removeDonation: (id: string, reason: string) =>
      fetch(`${API_BASE}/admin/donations/${id}/remove`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reason }),
      }).then((r) => handleResponse<{ success: boolean; message: string }>(r)),
  },

  // Public stats
  stats: {
    getPublicSummary: () =>
      fetch(`${API_BASE}/stats/public-summary`).then((r) =>
        handleResponse<{
          success: boolean;
          stats: {
            totalMealsRescued: number;
            activeDonors: number;
            partnerNgos: number;
            co2SavedKg: number;
            activeListingsCount: number;
          };
        }>(r)
      ),
  },
};

