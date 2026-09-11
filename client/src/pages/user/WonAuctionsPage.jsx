import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, CheckCircle2, PackageCheck, ArrowRight, ShieldCheck, Mail, Phone, IndianRupee } from 'lucide-react';
import api from '../../services/api';
import { formatINR, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const WonAuctionsPage = () => {
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWonAuctions = async () => {
      try {
        const res = await api.get('/bids/won');
        setWonAuctions(res.data || []);
      } catch (err) {
        console.error('Failed to load won auctions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWonAuctions();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Retrieving your won auction trophies..." />;
  }

  if (wonAuctions.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No Won Auctions Yet"
        description="When you win an auction, the item and fulfillment details will appear here."
        actionText="Browse Live Auctions"
        actionLink="/auctions"
      />
    );
  }

  const totalWonValue = wonAuctions.reduce((acc, cur) => acc + (cur.currentBid || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header with summary stat */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Won Auctions & Trophies
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review completed auctions where your bid was declared the winning hammer offer in INR
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Acquisitions:</span>
          <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatINR(totalWonValue)}
          </span>
        </div>
      </div>

      {/* Grid of Won Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wonAuctions.map((auction) => (
          <div
            key={auction._id}
            className="bg-white dark:bg-slate-900/90 border border-amber-500/30 rounded-3xl overflow-hidden shadow-xl relative flex flex-col justify-between transition-colors"
          >
            {/* Top Ribbon */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-slate-950 flex items-center justify-between text-xs font-bold shadow-sm">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                OFFICIAL HAMMER WINNER
              </span>
              <span>Closed: {formatDate(auction.endTime)}</span>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <img
                  src={auction.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                  alt={auction.title}
                  className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 border border-slate-200 dark:border-slate-800"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {auction.category?.name || 'Luxury Lot'}
                  </span>
                  <Link
                    to={`/auctions/${auction._id}`}
                    className="font-bold text-base text-slate-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-400 transition-colors line-clamp-1 block mt-0.5"
                  >
                    {auction.title}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {auction.description}
                  </p>
                </div>
              </div>

              {/* Price Details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block">
                    Winning Hammer Bid
                  </span>
                  <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                    {formatINR(auction.currentBid)}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Settlement Confirmed
                </span>
              </div>

              {/* Seller Contact Accordion */}
              {auction.seller && (
                <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between">
                  <span>Consigned by: <strong>{auction.seller.name}</strong></span>
                  <span className="text-slate-400">{auction.seller.email}</span>
                </div>
              )}
            </div>

            <div className="p-6 pt-0">
              <Link
                to={`/auctions/${auction._id}`}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <span>View Full Auction Record</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WonAuctionsPage;
