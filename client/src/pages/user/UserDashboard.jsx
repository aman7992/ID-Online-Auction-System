import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  CheckCircle2,
  Heart,
  Bell,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  PlusCircle,
  FolderTree,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatINR } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UserDashboard = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [bidsRes, wonRes, myAucRes, watchRes, notifRes] = await Promise.all([
          api.get('/bids/my'),
          api.get('/bids/won'),
          api.get('/auctions/my-auctions'),
          api.get('/auctions/watchlist'),
          api.get('/notifications'),
        ]);

        setBids(bidsRes.data || []);
        setWonAuctions(wonRes.data || []);
        setMyAuctions(myAucRes.data || []);
        setWatchlistCount((watchRes.data || []).length);
        setNotifications(notifRes.data.notifications || []);
      } catch (err) {
        console.error('Failed to load user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your collector dashboard..." />;
  }

  const activeBids = bids.filter((b) => b.bidStatus === 'winning' || b.bidStatus === 'outbid');
  const winningBids = bids.filter((b) => b.bidStatus === 'winning');
  const activeMyAuctions = myAuctions.filter((a) => a.status === 'active');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-slate-100 dark:via-slate-900 to-slate-100 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collector & Consignor Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live overview of your bidding activity, consigned lots, watchlist, and settlement trophies in Indian Rupees (INR).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/user/sell"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell an Item</span>
            </Link>
            <Link
              to="/auctions"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <Gavel className="w-4 h-4 text-amber-500" />
              <span>Explore Auctions</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-1 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Bids</span>
            <Gavel className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white block">
            {activeBids.length}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            {winningBids.length} currently winning
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-1 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">My Auctions</span>
            <FolderTree className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white block">
            {myAuctions.length}
          </span>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold block">
            {activeMyAuctions.length} live for bidding
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-1 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Won Auctions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white block">
            {wonAuctions.length}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Completed acquisitions
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-1 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Watchlist</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900 dark:text-white block">
            {watchlistCount}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            Monitored rare lots
          </span>
        </div>
      </div>

      {/* Two Columns: Recent Bids & Won Auctions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Bids Feed */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-md transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-500" />
              My Bidding Activity
            </h3>
            <Link to="/user/bids" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              View All Bids
            </Link>
          </div>

          <div className="space-y-3">
            {bids.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                You haven't placed any bids yet.
              </p>
            ) : (
              bids.slice(0, 4).map((item) => (
                <div
                  key={item.auction._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.auction.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                      alt={item.auction.title}
                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/auctions/${item.auction._id}`}
                        className="font-semibold text-xs text-slate-900 dark:text-slate-200 hover:text-amber-500 truncate block"
                      >
                        {item.auction.title}
                      </Link>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                        My Bid: {formatINR(item.myHighestBid)} • Current: {formatINR(item.currentBid)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ml-2 ${
                      item.bidStatus === 'winning'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : item.bidStatus === 'won'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {item.bidStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Won Auctions Feed */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-md transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Auctions Won & Trophies
            </h3>
            <Link to="/user/won" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              View Trophies
            </Link>
          </div>

          <div className="space-y-3">
            {wonAuctions.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                You haven't won any auctions yet. Browse catalog and place your bid!
              </p>
            ) : (
              wonAuctions.slice(0, 4).map((auction) => (
                <div
                  key={auction._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={auction.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                      alt={auction.title}
                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/auctions/${auction._id}`}
                        className="font-semibold text-xs text-slate-900 dark:text-slate-200 hover:text-amber-500 truncate block"
                      >
                        {auction.title}
                      </Link>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold block">
                        Winning Amount: {formatINR(auction.currentBid)}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/auctions/${auction._id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 flex-shrink-0 ml-2"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
