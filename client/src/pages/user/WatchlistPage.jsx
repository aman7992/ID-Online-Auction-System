import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import api from '../../services/api';
import AuctionCard from '../../components/common/AuctionCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/auctions/watchlist');
      setWatchlist(res.data || []);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleWatchlistChange = (auctionId, isWatchlisted) => {
    if (!isWatchlisted) {
      setWatchlist((prev) => prev.filter((item) => item._id !== auctionId));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching your saved auctions..." />;
  }

  if (watchlist.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your Watchlist is Empty"
        description="Click the heart icon on any auction card to save lots here for quick tracking."
        actionText="Explore Auctions"
        actionLink="/auctions"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          My Watchlist
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {watchlist.length} {watchlist.length === 1 ? 'lot' : 'lots'} saved for monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlist.map((auction) => (
          <AuctionCard
            key={auction._id}
            auction={{ ...auction, isWatchlisted: true }}
            onWatchlistChange={handleWatchlistChange}
          />
        ))}
      </div>
    </div>
  );
};

export default WatchlistPage;
