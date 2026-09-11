import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, ExternalLink, ArrowUpRight, CheckCircle2, AlertTriangle, IndianRupee } from 'lucide-react';
import api from '../../services/api';
import { formatINR } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyBidsPage = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await api.get('/bids/my');
        setBids(res.data || []);
      } catch (err) {
        console.error('Failed to load user bids:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Fetching your bid history..." />;
  }

  if (bids.length === 0) {
    return (
      <EmptyState
        icon={Gavel}
        title="No Bids Placed Yet"
        description="You haven't participated in any active auctions. Browse our catalog and start bidding in INR."
        actionText="Browse Auctions"
        actionLink="/auctions"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Bidding Activity
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track all auctions you have entered bids on and monitor your standing in Indian Rupees (INR)
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-4 px-6">Auction Lot</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">My Highest Bid</th>
                <th className="py-4 px-6">Current Highest</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {bids.map((item) => (
                <tr key={item.auction._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.auction.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                        alt={item.auction.title}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0 max-w-xs">
                        <Link
                          to={`/auctions/${item.auction._id}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-amber-500 dark:hover:text-amber-400 truncate block transition-colors"
                        >
                          {item.auction.title}
                        </Link>
                        <span className="text-[11px] text-slate-500 dark:text-slate-500 block">
                          Total placed bids: {item.totalUserBidsOnItem}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium">
                      {item.auction.category?.name || 'General'}
                    </span>
                  </td>

                  <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {formatINR(item.myHighestBid)}
                  </td>

                  <td className="py-4 px-6 font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {formatINR(item.currentBid)}
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.bidStatus === 'winning'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : item.bidStatus === 'won'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                          : item.bidStatus === 'outbid'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600/40'
                      }`}
                    >
                      {item.bidStatus === 'winning' && <CheckCircle2 className="w-3 h-3" />}
                      {item.bidStatus === 'outbid' && <AlertTriangle className="w-3 h-3" />}
                      {item.bidStatus}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <Link
                      to={`/auctions/${item.auction._id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                    >
                      <span>{item.bidStatus === 'outbid' ? 'Outbid - Bid Again' : 'View Lot'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyBidsPage;
