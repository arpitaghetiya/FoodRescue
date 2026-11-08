import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminStats, User, Donation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import {
  Users,
  ShieldCheck,
  Clock,
  UtensilsCrossed,
  Check,
  X,
  Trash2,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'verifyNgos' | 'manageUsers' | 'manageDonations'
  const [activeTab, setActiveTab] = useState<'verifyNgos' | 'manageUsers' | 'manageDonations'>('verifyNgos');

  // NGO verification modal
  const [selectedNgoForAction, setSelectedNgoForAction] = useState<User | null>(null);
  const [ngoActionStatus, setNgoActionStatus] = useState<'VERIFIED' | 'REJECTED' | null>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [donationStatusFilter, setDonationStatusFilter] = useState('ALL');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, donationsRes] = await Promise.all([
        api.admin.getStats().catch(() => null),
        api.admin.getUsers({
          role: userRoleFilter !== 'ALL' ? userRoleFilter : undefined,
        }).catch(() => null),
        api.admin.getAllDonations({
          status: donationStatusFilter !== 'ALL' ? donationStatusFilter : undefined,
        }).catch(() => null),
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (usersRes?.users) setUsers(usersRes.users);
      if (donationsRes?.donations) setDonations(donationsRes.donations);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userRoleFilter, donationStatusFilter]);

  const handleVerifyNgoSubmit = async () => {
    if (!selectedNgoForAction || !selectedNgoForAction.ngoProfile || !ngoActionStatus) return;

    try {
      setActionLoading(true);
      await api.admin.verifyNgo(selectedNgoForAction.ngoProfile.id, {
        status: ngoActionStatus,
        verificationNote: verificationNote.trim() || undefined,
      });

      toast.success(
        `NGO ${ngoActionStatus === 'VERIFIED' ? 'Verified' : 'Rejected'}`,
        `${selectedNgoForAction.organization || selectedNgoForAction.name} status updated.`
      );

      setSelectedNgoForAction(null);
      setNgoActionStatus(null);
      setVerificationNote('');
      await fetchDashboardData();
    } catch (err: any) {
      toast.error('Verification Update Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (targetUser.id === user?.id) {
      toast.error('Action Denied', 'Administrators cannot delete their own account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${targetUser.name}"?`)) {
      return;
    }

    try {
      await api.admin.deleteUser(targetUser.id);
      toast.success('User Removed', `Account for ${targetUser.name} deleted.`);
      await fetchDashboardData();
    } catch (err: any) {
      toast.error('User Deletion Failed', err.message);
    }
  };

  const ngosList = users.filter((u) => u.role === 'NGO');
  const pendingNgosList = ngosList.filter((u) => u.ngoProfile?.verificationStatus === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-forest text-white rounded-2xl p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-mint/80 mt-1">
            System overview and non-profit verification console.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-forest bg-white hover:bg-mint shadow-soft transition-all flex items-center active:scale-95 shrink-0"
        >
          <RefreshCw className="w-4 h-4 mr-1.5 text-freshgreen" />
          Refresh
        </button>
      </div>

      {/* 3 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? '...'}
          icon={Users}
          color="forest"
          subtitle={`${stats?.totalDonors ?? 0} Donors • ${stats?.totalNgos ?? 0} NGOs`}
        />
        <StatCard
          label="Pending NGO Verifications"
          value={stats?.pendingNgos ?? '...'}
          icon={Clock}
          color="orange"
          subtitle="Awaiting review"
        />
        <StatCard
          label="Total Donations"
          value={stats?.totalDonations ?? '...'}
          icon={UtensilsCrossed}
          color="fresh"
          subtitle="All platform listings"
        />
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-soft space-y-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-surface-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('verifyNgos')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'verifyNgos'
                ? 'bg-forest text-mint shadow-xs'
                : 'text-darktext/70 hover:text-forest hover:bg-surface-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify NGOs ({pendingNgosList.length} Pending)</span>
            {pendingNgosList.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manageUsers')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'manageUsers'
                ? 'bg-forest text-mint shadow-xs'
                : 'text-darktext/70 hover:text-forest hover:bg-surface-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Users ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manageDonations')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'manageDonations'
                ? 'bg-forest text-mint shadow-xs'
                : 'text-darktext/70 hover:text-forest hover:bg-surface-50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Manage Donations ({donations.length})</span>
          </button>
        </div>

        {/* Tab 1: Verify NGOs */}
        {activeTab === 'verifyNgos' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-darktext">NGO Verification List</h2>
            {ngosList.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No NGO accounts registered yet.</p>
            ) : (
              <div className="space-y-3">
                {ngosList.map((ngo) => {
                  const status = ngo.ngoProfile?.verificationStatus || 'PENDING';
                  return (
                    <div
                      key={ngo.id}
                      className="p-4 rounded-xl border border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-darktext text-sm">{ngo.organization || ngo.name}</span>
                          <StatusBadge status={status} size="sm" />
                          <span className="text-slate-400">Reg: {ngo.ngoProfile?.registrationNumber}</span>
                        </div>
                        <p className="text-slate-600">
                          Contact: {ngo.name} ({ngo.email}) • {ngo.phone || 'No phone'}
                        </p>
                        {ngo.ngoProfile?.mission && (
                          <p className="text-slate-500 italic">"{ngo.ngoProfile.mission}"</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {status !== 'VERIFIED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNgoForAction(ngo);
                              setNgoActionStatus('VERIFIED');
                              setVerificationNote('Charity registration verified and approved.');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-freshgreen text-white hover:bg-darkgreen font-semibold"
                          >
                            Verify NGO
                          </button>
                        )}

                        {status !== 'REJECTED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNgoForAction(ngo);
                              setNgoActionStatus('REJECTED');
                              setVerificationNote('Application rejected due to incomplete documentation.');
                            }}
                            className="px-3 py-1.5 rounded-lg border border-surface-200 text-rose-600 hover:bg-rose-50 font-semibold"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Manage Users */}
        {activeTab === 'manageUsers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-darktext">Registered Users</h2>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500">Filter Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-surface-200 text-xs bg-surface-50"
                >
                  <option value="ALL">All Roles</option>
                  <option value="DONOR">Donors</option>
                  <option value="NGO">NGOs</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-surface-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">User Name</th>
                    <th className="py-2.5 px-3 font-bold">Email</th>
                    <th className="py-2.5 px-3 font-bold">Role</th>
                    <th className="py-2.5 px-3 font-bold">Organization</th>
                    <th className="py-2.5 px-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-50/70">
                      <td className="py-2.5 px-3 font-bold text-darktext">{u.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-100 text-darktext">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{u.organization || '—'}</td>
                      <td className="py-2.5 px-3 text-right">
                        {u.id !== user?.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Manage Donations */}
        {activeTab === 'manageDonations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-darktext">All Donations</h2>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500">Filter Status:</span>
                <select
                  value={donationStatusFilter}
                  onChange={(e) => setDonationStatusFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-surface-200 text-xs bg-surface-50"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="REQUESTED">Requested</option>
                  <option value="APPROVED">Approved</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-surface-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Food Title</th>
                    <th className="py-2.5 px-3 font-bold">Category</th>
                    <th className="py-2.5 px-3 font-bold">Donor</th>
                    <th className="py-2.5 px-3 font-bold">Quantity</th>
                    <th className="py-2.5 px-3 font-bold">Deadline</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-surface-50/70">
                      <td className="py-2.5 px-3 font-bold text-darktext">{d.title}</td>
                      <td className="py-2.5 px-3 text-slate-600">{d.category}</td>
                      <td className="py-2.5 px-3 text-slate-600">{d.donor?.organization || d.donor?.name}</td>
                      <td className="py-2.5 px-3 font-semibold text-darkgreen">{d.quantity}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {new Date(d.collectionDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={d.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      <Modal
        isOpen={!!selectedNgoForAction}
        onClose={() => setSelectedNgoForAction(null)}
        title={ngoActionStatus === 'VERIFIED' ? 'Approve NGO Verification' : 'Reject NGO Verification'}
      >
        {selectedNgoForAction && (
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-slate-600">
              Organization: <strong>{selectedNgoForAction.organization || selectedNgoForAction.name}</strong>
            </p>
            <p className="text-slate-600">
              Registration Number: <strong>{selectedNgoForAction.ngoProfile?.registrationNumber}</strong>
            </p>

            <div>
              <label className="block font-bold text-darktext mb-1">Audit Note</label>
              <textarea
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                placeholder="Enter verification notes..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedNgoForAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-surface-200 hover:bg-surface-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleVerifyNgoSubmit}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${
                  ngoActionStatus === 'VERIFIED' ? 'bg-freshgreen hover:bg-darkgreen' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
