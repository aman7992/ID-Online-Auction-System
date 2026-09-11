import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Trophy,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

const MyAuctionsPage = () => {
  const { showToast } = useToast();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [auctionToDelete, setAuctionToDelete] = useState(null);

  const fetchMyAuctions = async () => {
    setLoading(true);
    try {
      const q = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/auctions/my-auctions${q}`);
      setAuctions(res.data || []);
    } catch (err) {
      console.error('Failed to load my auctions:', err);
      showToast('Failed to load your auctions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAuctions();
  }, [statusFilter]);

  const handleDeleteConfirm = async () => {
    if (!auctionToDelete) return;
    try {
      await api.delete(`/auctions/${auctionToDelete._id}`);
      showToast('Auction deleted successfully', 'success');
      setAuctions((prev) => prev.filter((a) => a._id !== auctionToDelete._id));
      setDeleteModalOpen(false);
      setAuctionToDelete(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete auction', 'error');
    }
  };

  const statusTabs = [
    { id: 'all', label: 'All Lots' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'draft', label: 'Draft' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Gavel className="w-6 h-6 text-amber-500" />
            My Auctions & Consignments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your listed lots, track live bids in INR, supervise auction timers, and review winners
          </p>
        </div>

        <Link
          to="/user/sell"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Sell an Item</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Auctions Table / Feed */}
      {loading ? (
        <LoadingSpinner message="Fetching your auction lots..." />
      ) : auctions.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No Auctions Found"
          description={
            statusFilter === 'all'
              ? "You haven't listed any items for auction yet. Start selling today!"
              : `No auctions found with status "${statusFilter}".`
          }
          actionText="Sell Your First Item"
          actionLink="/user/sell"
        />
      ) : (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-4 px-6">Lot Info</th>
                  <th className="py-4 px-6">Starting Price</th>
                  <th className="py-4 px-6">Current Bid</th>
                  <th className="py-4 px-6">Bids Placed</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Start / End Dates</th>
                  <th className="py-4 px-6">Winner</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {auctions.map((item) => {
                  const isEnded = item.status === 'ended' || new Date(item.endTime) <= new Date();
                  const canEdit = item.status !== 'ended';
                  const canDelete = item.bidCount === 0;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0 max-w-xs">
                            <Link
                              to={`/auctions/${item._id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-400 truncate block transition-colors"
                            >
                              {item.title}
                            </Link>
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 block font-medium">
                              {item.category?.name || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {formatINR(item.startingPrice)}
                      </td>

                      <td className="py-4 px-6 font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                        {formatINR(item.currentBid || item.startingPrice)}
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100">
                        {item.bidCount || 0}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : item.status === 'ended'
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              : item.status === 'paused'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {item.status === 'ended' ? 'Completed' : item.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                        <div>Start: {formatDate(item.startTime)}</div>
                        <div>End: {formatDateTime(item.endTime)}</div>
                      </td>

                      <td className="py-4 px-6">
                        {item.winner ? (
                          <div className="flex items-center gap-2">
                            <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <span className="font-semibold text-slate-900 dark:text-white text-xs truncate max-w-[120px]">
                              {item.winner.name}
                            </span>
                          </div>
                        ) : isEnded ? (
                          <span className="text-slate-400 text-[11px]">No Bids</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Bidding Live</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View link */}
                          <Link
                            to={`/auctions/${item._id}`}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Edit button */}
                          {canEdit && (
                            <Link
                              to={`/user/auctions/edit/${item._id}`}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 transition-colors"
                              title="Edit Auction"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Delete button (only when no bids) */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => {
                                setAuctionToDelete(item);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 transition-colors"
                              title="Delete Auction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        title="Delete Auction Lot"
        message={`Are you sure you want to delete "${auctionToDelete?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete Auction"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setAuctionToDelete(null);
        }}
      />
    </div>
  );
};

export default MyAuctionsPage;
