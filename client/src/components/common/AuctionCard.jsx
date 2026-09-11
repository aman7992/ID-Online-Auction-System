import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Gavel, ArrowUpRight, CheckCircle, Tag } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/formatters';

const AuctionCard = ({ auction, onWatchlistChange }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isWatchlisted, setIsWatchlisted] = useState(auction.isWatchlisted || false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please log in to add items to your watchlist', 'info');
      return;
    }

    try {
      setLoadingWatchlist(true);
      const res = await api.post(`/auctions/${auction._id}/watchlist`);
      setIsWatchlisted(res.data.isWatchlisted);
      showToast(res.data.message, 'success');
      if (onWatchlistChange) onWatchlistChange(auction._id, res.data.isWatchlisted);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update watchlist', 'error');
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const isEnded = auction.status === 'ended' || new Date(auction.endTime) <= new Date();

  return (
    <div className="group relative bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img
          src={auction.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
          alt={auction.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Category Pill */}
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/80">
            {auction.category?.name || 'General'}
          </span>

          {/* Watchlist Toggle */}
          <button
            type="button"
            onClick={handleWatchlistToggle}
            disabled={loadingWatchlist}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md border transition-all duration-200 ${
              isWatchlisted
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-rose-400 hover:border-slate-600'
            }`}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Countdown Pill at Bottom of Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <CountdownTimer endTime={auction.endTime} compact={true} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/auctions/${auction._id}`}>
            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-1 mb-1.5" title={auction.title}>
              {auction.title}
            </h3>
          </Link>
          <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
            {auction.description}
          </p>
        </div>

        <div>
          {/* Price & Bids Section */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-end justify-between mb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                {isEnded ? 'Winning Bid' : 'Current Bid'}
              </span>
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {formatINR(auction.currentBid || auction.startingPrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                {auction.bidCount || 0} {auction.bidCount === 1 ? 'bid' : 'bids'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                Start: {formatINR(auction.startingPrice)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Link
            to={`/auctions/${auction._id}`}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              isEnded
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600/50'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
            }`}
          >
            {isEnded ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                View Auction Result
              </>
            ) : (
              <>
                <Gavel className="w-4 h-4" />
                Place Bid Now
                <ArrowUpRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
