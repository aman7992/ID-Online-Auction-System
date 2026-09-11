import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserAvatar from '../../components/common/UserAvatar';
import { formatINR } from '../../utils/formatters';

const WinnersPage = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await api.get('/analytics/winners');
        setWinners(res.data || []);
      } catch (err) {
        console.error('Failed to load winners ledger:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading winners registry..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Auction Winners & Settlement Registry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete ledger of declared auction winners, contact info, and final hammer prices
        </p>
      </div>

      {winners.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          No completed auctions with declared winners yet.
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
                <tr>
                  <th className="py-4 px-6">Lot Info</th>
                  <th className="py-4 px-6">Winner (Highest Bidder)</th>
                  <th className="py-4 px-6">Winning Hammer Bid</th>
                  <th className="py-4 px-6">Seller</th>
                  <th className="py-4 px-6">Concluded Date</th>
                  <th className="py-4 px-6 text-right">View Lot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {winners.map((auction) => (
                  <tr key={auction._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={auction.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                          alt={auction.title}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
                          }}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-800"
                        />
                        <div className="min-w-0 max-w-xs">
                          <span className="font-bold text-slate-100 block truncate">
                            {auction.title}
                          </span>
                          <span className="text-[11px] text-amber-400 block">
                            {auction.category?.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar user={auction.winner} size="sm" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">
                            {auction.winner?.name || 'Verified Collector'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {auction.winner?.email}
                          </span>
                          {auction.winner?.phone && (
                            <span className="text-[10px] text-slate-500 block">
                              {auction.winner.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-amber-400 text-sm">
                      {formatINR(auction.currentBid || 0)}
                    </td>

                    <td className="py-4 px-6 text-slate-400">
                      {auction.seller?.name}
                    </td>

                    <td className="py-4 px-6 text-slate-400">
                      {new Date(auction.endTime).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/auctions/${auction._id}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnersPage;
