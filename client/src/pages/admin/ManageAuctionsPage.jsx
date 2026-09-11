import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Play,
  Pause,
  StopCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { formatINR } from '../../utils/formatters';

const ManageAuctionsPage = () => {
  const { showToast } = useToast();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') q.set('status', statusFilter);
      if (searchQuery) q.set('keyword', searchQuery);
      q.set('page', page);
      q.set('limit', '10');

      const res = await api.get(`/auctions?${q.toString()}`);
      setAuctions(res.data.auctions || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to load auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAuctions();
  };

  const handleStatusChange = async (auctionId, newStatus) => {
    try {
      await api.put(`/auctions/${auctionId}/status`, { status: newStatus });
      showToast(`Auction status changed to ${newStatus}`, 'success');
      setAuctions((prev) =>
        prev.map((a) => (a._id === auctionId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAuction) return;
    try {
      await api.delete(`/auctions/${selectedAuction._id}`);
      showToast('Auction deleted successfully', 'info');
      setAuctions((prev) => prev.filter((a) => a._id !== selectedAuction._id));
      setDeleteModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete auction', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Gavel className="w-6 h-6 text-amber-400" />
            Manage Auction Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervise active lots, alter statuses, edit descriptions, or remove items
          </p>
        </div>

        <Link
          to="/admin/auctions/add"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-colors flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Auction</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl text-xs font-medium w-full sm:w-auto">
          {['all', 'active', 'paused', 'ended'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Auctions Table */}
      {loading ? (
        <LoadingSpinner message="Loading auctions table..." />
      ) : auctions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No auctions found matching criteria.
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
                <tr>
                  <th className="py-4 px-6">Lot Info</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Current Bid</th>
                  <th className="py-4 px-6">Bids Count</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Ends</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auctions.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
                          }}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-800"
                        />
                        <div className="min-w-0 max-w-xs">
                          <Link
                            to={`/auctions/${item._id}`}
                            className="font-bold text-slate-100 hover:text-amber-400 truncate block"
                          >
                            {item.title}
                          </Link>
                          <span className="text-[11px] text-slate-500 block">
                            Seller: {item.seller?.name || 'Platform Admin'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                        {item.category?.name}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-amber-400 text-sm">
                      {formatINR(item.currentBid || item.startingPrice)}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-200">
                      {item.bidCount || 0}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'paused'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-700/60 text-slate-400 border border-slate-600/40'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400">
                      {new Date(item.endTime).toLocaleDateString()}
                    </td>

                    {/* Action Controls */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Pause / Resume Controls */}
                        {item.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(item._id, 'paused')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                            title="Pause Auction"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'paused' && (
                          <button
                            onClick={() => handleStatusChange(item._id, 'active')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                            title="Resume Auction"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== 'ended' && (
                          <button
                            onClick={() => handleStatusChange(item._id, 'ended')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                            title="End Auction Immediately"
                          >
                            <StopCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <Link
                          to={`/admin/auctions/edit/${item._id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                          title="Edit Auction"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            setSelectedAuction(item);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                          title="Delete Auction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/auctions/${item._id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="View Live Listing"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        title="Delete Auction Lot"
        message={`Are you sure you want to delete "${selectedAuction?.title}"? This will permanently remove all associated bids and watchlists.`}
        confirmText="Delete Auction"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default ManageAuctionsPage;
