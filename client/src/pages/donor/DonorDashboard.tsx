import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../../services/api';
import { Donation, DonationRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import {
  UtensilsCrossed,
  Package,
  Clock,
  CheckCircle2,
  PlusCircle,
  Inbox,
  AlertCircle,
  Check,
  X,
  MapPin,
  Calendar,
  Trash2,
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();
  const toast = useToast();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'requests'>('listings');

  // Modal for approving/responding
  const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
  const [approvalAction, setApprovalAction] = useState<'APPROVE' | 'REJECT' | 'COLLECT' | 'COMPLETE' | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, requestsRes] = await Promise.all([
        api.donations.getMyDonations().catch(() => ({ success: false, donations: [] })),
        api.requests.getRequestsForDonor().catch(() => ({ success: false, requests: [] })),
      ]);

      if (donationsRes.donations) setDonations(donationsRes.donations);
      if (requestsRes.requests) setRequests(requestsRes.requests);
    } catch (err) {
      console.error('Failed to load donor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalDonations = donations.length;
  const availableDonations = donations.filter((d) => d.status === 'AVAILABLE').length;
  const requestsReceived = requests.length;
  const completedDonations = donations.filter((d) => d.status === 'COMPLETED').length;

  const handleActionClick = (req: DonationRequest, action: 'APPROVE' | 'REJECT' | 'COLLECT' | 'COMPLETE') => {
    setSelectedRequest(req);
    setApprovalAction(action);
    setActionError(null);
    setResponseNote(
      action === 'APPROVE'
        ? 'Approved for pickup. Ready at specified collection point.'
        : action === 'REJECT'
        ? 'Unable to fulfill this request at this time.'
        : ''
    );
  };

  const handleExecuteAction = async () => {
    if (!selectedRequest || !approvalAction) return;

    try {
      setActionLoading(true);
      setActionError(null);

      await api.requests.updateStatus(selectedRequest.id, {
        action: approvalAction,
        donorResponseNote: responseNote,
        pickupScheduledAt: pickupDate || undefined,
      });

      toast.success(
        'Request Updated',
        `Successfully marked as ${approvalAction}.`
      );

      setSelectedRequest(null);
      setApprovalAction(null);
      await fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update request.');
      toast.error('Action Failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDonation = async (donationId: string) => {
    if (!window.confirm('Are you sure you want to cancel this donation listing?')) {
      return;
    }

    try {
      await api.donations.cancel(donationId);
      toast.info('Listing Cancelled', 'The donation has been withdrawn.');
      await fetchData();
    } catch (err: any) {
      toast.error('Cancellation Failed', err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-forest text-white rounded-2xl p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Donor Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-mint/80 mt-1">
            {user?.organization || user?.name} • {user?.address || 'Bengaluru'}
          </p>
        </div>

        <Link
          to="/donor/create"
          className="inline-flex items-center px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-forest bg-white hover:bg-mint shadow-soft transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4 mr-2 text-freshgreen" />
          Add New Donation
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Donations"
          value={totalDonations}
          icon={UtensilsCrossed}
          color="forest"
          subtitle="All created listings"
        />
        <StatCard
          label="Available Donations"
          value={availableDonations}
          icon={Package}
          color="fresh"
          subtitle="Awaiting NGO claims"
        />
        <StatCard
          label="Requests Received"
          value={requestsReceived}
          icon={Clock}
          color="orange"
          subtitle="All received requests"
        />
        <StatCard
          label="Completed Donations"
          value={completedDonations}
          icon={CheckCircle2}
          color="mint"
          subtitle="Successfully handed over"
        />
      </div>

      {/* Tab Navigation: View My Donations & Manage Requests */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-soft space-y-6">
        <div className="flex items-center space-x-2 border-b border-surface-100 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'listings'
                ? 'bg-forest text-mint shadow-xs'
                : 'text-darktext/70 hover:text-forest hover:bg-surface-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>View My Donations ({donations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 relative ${
              activeTab === 'requests'
                ? 'bg-forest text-mint shadow-xs'
                : 'text-darktext/70 hover:text-forest hover:bg-surface-50'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Manage Requests ({requests.length})</span>
            {requests.filter((r) => r.status === 'PENDING').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange"></span>
            )}
          </button>
        </div>

        {/* Content Section */}
        {activeTab === 'listings' ? (
          <div>
            {loading ? (
              <div className="space-y-3">
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-12">
                <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-darktext">No food donations created yet</h3>
                <p className="text-xs text-slate-400 mt-1">Click "Add New Donation" to list surplus food.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-surface-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">Food Name</th>
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-4 font-bold">Quantity</th>
                      <th className="py-3 px-4 font-bold">Pickup Deadline</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {donations.map((d) => (
                      <tr key={d.id} className="hover:bg-surface-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-darktext">{d.title}</td>
                        <td className="py-3.5 px-4 text-slate-600">{d.category}</td>
                        <td className="py-3.5 px-4 font-semibold text-darkgreen">{d.quantity}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {new Date(d.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                          {new Date(d.collectionDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={d.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {d.status === 'AVAILABLE' && (
                            <button
                              type="button"
                              onClick={() => handleCancelDonation(d.id)}
                              className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="space-y-3">
                <TableRowSkeleton />
                <TableRowSkeleton />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-darktext">No requests received yet</h3>
                <p className="text-xs text-slate-400 mt-1">When an NGO requests your food, it will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-surface-200 hover:border-surface-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-darktext text-sm">
                          {req.ngo?.organization || req.ngo?.name}
                        </span>
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600">
                        Requested: <strong>{req.donation?.title}</strong> ({req.requestedQuantity || req.donation?.quantity})
                      </p>
                      {req.notes && (
                        <p className="text-xs text-slate-500 italic">"{req.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleActionClick(req, 'APPROVE')}
                            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-forest text-mint hover:bg-darkgreen transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleActionClick(req, 'REJECT')}
                            className="px-3.5 py-2 text-xs font-bold rounded-lg border border-surface-200 text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {(req.status === 'APPROVED' || req.status === 'PICKUP_SCHEDULED') && (
                        <button
                          type="button"
                          onClick={() => handleActionClick(req, 'COLLECT')}
                          className="px-3.5 py-2 text-xs font-bold rounded-lg bg-orange text-white hover:bg-orange/90 transition-colors"
                        >
                          Confirm Handover
                        </button>
                      )}

                      {req.status === 'COLLECTED' && (
                        <button
                          type="button"
                          onClick={() => handleActionClick(req, 'COMPLETE')}
                          className="px-3.5 py-2 text-xs font-bold rounded-lg bg-darkgreen text-white hover:bg-forest transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={
          approvalAction === 'APPROVE'
            ? 'Approve Request'
            : approvalAction === 'REJECT'
            ? 'Reject Request'
            : approvalAction === 'COLLECT'
            ? 'Confirm Food Handover'
            : 'Complete Donation'
        }
      >
        {selectedRequest && (
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-slate-600">
              Organization: <strong>{selectedRequest.ngo?.organization || selectedRequest.ngo?.name}</strong>
            </p>
            <p className="text-slate-600">
              Food: <strong>{selectedRequest.donation?.title}</strong>
            </p>

            <div>
              <label className="block font-bold text-darktext mb-1">Response Note</label>
              <textarea
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-surface-200 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                placeholder="Add pickup instructions or a note for the NGO..."
              ></textarea>
            </div>

            {actionError && (
              <p className="text-rose-600 text-xs">{actionError}</p>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-surface-200 hover:bg-surface-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteAction}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-forest text-mint hover:bg-darkgreen"
              >
                {actionLoading ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
