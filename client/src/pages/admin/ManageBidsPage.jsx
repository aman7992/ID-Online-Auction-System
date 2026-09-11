import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Gavel, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserAvatar from '../../components/common/UserAvatar';
import { formatINR } from '../../utils/formatters';

const ManageBidsPage = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBids, setTotalBids] = useState(0);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bids/admin?page=${page}&limit=15`);
      setBids(res.data.bids || []);
      setTotalPages(res.data.pages || 1);
      setTotalBids(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load bids log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            Platform Bids Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit history of all {totalBids.toLocaleString()} bids executed across active and closed auctions
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading bids audit logs..." />
      ) : bids.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No bids recorded on the system yet.
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
                <tr>
                  <th className="py-4 px-6">Auction Lot</th>
                  <th className="py-4 px-6">Bidder</th>
                  <th className="py-4 px-6">Bid Amount</th>
                  <th className="py-4 px-6">Auction Status</th>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6 text-right">View Lot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {bids.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-200">
                      {b.auction?.title || 'Unknown Auction Lot'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar user={b.bidder} size="sm" />
                        <div>
                          <span className="font-bold text-slate-100 block">
                            {b.bidder?.name || 'Collector'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {b.bidder?.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-amber-400 text-sm">
                      {formatINR(b.amount || 0)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.auction?.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-700/60 text-slate-400'
                        }`}
                      >
                        {b.auction?.status || 'ended'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {b.auction?._id && (
                        <Link
                          to={`/auctions/${b.auction._id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
    </div>
  );
};

export default ManageBidsPage;
