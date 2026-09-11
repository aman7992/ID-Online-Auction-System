import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Gavel,
  ShieldCheck,
  Heart,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Tag,
  ArrowRight,
  Info,
  ChevronDown,
  Sparkles,
  IndianRupee,
  Trophy,
  Star,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDateTime, formatDate } from '../../utils/formatters';
import CountdownTimer from '../../components/common/CountdownTimer';
import AuctionCard from '../../components/common/AuctionCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserAvatar from '../../components/common/UserAvatar';

const AuctionDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { joinAuction, leaveAuction, socket } = useSocket();
  const { showToast } = useToast();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  // Fetch auction details
  const fetchAuction = async () => {
    try {
      const res = await api.get(`/auctions/${id}`);
      setAuction(res.data);
      setBids(res.data.bids || []);
      setIsWatchlisted(res.data.isWatchlisted || false);

      // Pre-fill minimum next bid
      const nextMin =
        res.data.bidCount === 0
          ? res.data.startingPrice
          : (res.data.currentBid || res.data.startingPrice) + (res.data.minimumIncrement || 500);
      setBidAmount(nextMin.toString());
    } catch (err) {
      console.error('Failed to load auction details:', err);
      showToast('Failed to load auction details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
  }, [id]);

  // Socket.IO real-time updates for this auction
  useEffect(() => {
    if (id) {
      joinAuction(id);

      const handleBidUpdate = (payload) => {
        if (payload.auctionId === id) {
          setAuction((prev) =>
            prev
              ? {
                  ...prev,
                  currentBid: payload.currentBid,
                  bidCount: payload.bidCount,
                  winner: payload.winner,
                }
              : prev
          );

          if (payload.bid) {
            setBids((prev) => [payload.bid, ...prev]);
          }

          // Update suggested bid input
          const nextMin = payload.currentBid + (auction?.minimumIncrement || 500);
          setBidAmount(nextMin.toString());

          showToast(`⚡ New highest bid: ${formatINR(payload.currentBid)}`, 'info');
        }
      };

      const handleAuctionEnded = (payload) => {
        if (payload.auctionId === id) {
          setAuction((prev) =>
            prev ? { ...prev, status: 'ended', winner: payload.winner } : prev
          );
          showToast('Auction has concluded!', 'info');
        }
      };

      if (socket) {
        socket.on('bid_update', handleBidUpdate);
        socket.on('auction_ended', handleAuctionEnded);
      }

      return () => {
        leaveAuction(id);
        if (socket) {
          socket.off('bid_update', handleBidUpdate);
          socket.off('auction_ended', handleAuctionEnded);
        }
      };
    }
  }, [id, socket, auction?.minimumIncrement]);

  // Watchlist Toggle
  const handleWatchlistToggle = async () => {
    if (!user) {
      showToast('Please log in to add to your watchlist', 'info');
      return;
    }
    try {
      const res = await api.post(`/auctions/${id}/watchlist`);
      setIsWatchlisted(res.data.isWatchlisted);
      showToast(res.data.message, 'success');
    } catch (err) {
      showToast('Failed to update watchlist', 'error');
    }
  };

  // Quick increment helper
  const handleAddIncrement = (inc) => {
    const current = Number(bidAmount) || (auction?.currentBid || 0);
    setBidAmount((current + inc).toString());
  };

  // Place Bid Handler
  const handlePlaceBid = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('You must log in to place bids', 'warning');
      return;
    }

    const numBid = Number(bidAmount);
    const minRequired =
      auction.bidCount === 0
        ? auction.startingPrice
        : (auction.currentBid || auction.startingPrice) + auction.minimumIncrement;

    if (numBid < minRequired) {
      showToast(`Bid must be at least ${formatINR(minRequired)}`, 'error');
      return;
    }

    try {
      setIsSubmittingBid(true);
      const res = await api.post(`/auctions/${id}/bid`, { amount: numBid });
      showToast(res.data.message || 'Bid placed successfully!', 'success');

      // Update state locally (socket broadcast will also sync)
      setAuction((prev) => ({
        ...prev,
        currentBid: numBid,
        bidCount: res.data.bidCount,
      }));
      setBids((prev) => [res.data.bid, ...prev]);

      // Set next suggested bid
      const nextMin = numBid + auction.minimumIncrement;
      setBidAmount(nextMin.toString());
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place bid', 'error');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading auction details..." />;
  }

  if (!auction) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Auction Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">The auction item you are looking for does not exist.</p>
        <Link to="/auctions" className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl">
          Back to Auctions
        </Link>
      </div>
    );
  }

  const isEnded = auction.status === 'ended' || new Date(auction.endTime) <= new Date();
  const minRequiredBid =
    auction.bidCount === 0
      ? auction.startingPrice
      : (auction.currentBid || auction.startingPrice) + auction.minimumIncrement;

  const isSeller = user && auction.seller && user._id === (auction.seller._id || auction.seller);
  const isWinning = user && auction.winner && user._id === (auction.winner._id || auction.winner);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
        <span>/</span>
        <Link to="/auctions" className="hover:text-slate-900 dark:hover:text-white">Auctions</Link>
        <span>/</span>
        <span className="text-amber-600 dark:text-amber-400 truncate max-w-sm">{auction.title}</span>
      </div>

      {/* Main Grid: Gallery & Bidding Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <img
              src={auction.images?.[activeImageIndex] || auction.images?.[0]}
              alt={auction.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Category Badge on Image */}
            <div className="absolute top-4 left-4">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/40 shadow-lg">
                {auction.category?.name || 'Luxury Lot'}
              </span>
            </div>

            {/* Watchlist Heart Toggle */}
            <button
              type="button"
              onClick={handleWatchlistToggle}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md border transition-all ${
                isWatchlisted
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'bg-slate-950/80 border-slate-700 text-slate-300 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWatchlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Gallery Thumbnails */}
          {auction.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {auction.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-amber-500 shadow-lg shadow-amber-500/20 scale-105'
                      : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Rules Tabs */}
          <div className="pt-4 space-y-6">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">Item Description</h3>
              <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {auction.description}
              </div>
            </div>

            {/* Auction Rules Accordion */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md">
              <button
                type="button"
                onClick={() => setRulesOpen(!rulesOpen)}
                className="w-full p-6 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Bidding Rules & Buyer Protection Guarantee
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${rulesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {rulesOpen && (
                <div className="p-6 pt-0 text-xs text-slate-600 dark:text-slate-400 space-y-2.5 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                  <p>• <strong>Strict Increments (INR):</strong> Every bid must exceed current highest bid by at least {formatINR(auction.minimumIncrement)}.</p>
                  <p>• <strong>Legally Binding:</strong> All bids placed on the ID Online Auction System constitute binding purchase offers.</p>
                  <p>• <strong>Escrow & Authenticity:</strong> Payments are held securely until physical inspection and certificate validation have concluded.</p>
                  <p>• <strong>Automated Resolution:</strong> When the countdown timer expires, the highest registered bidder is declared the winner.</p>
                </div>
              )}
            </div>

            {/* Seller Information Card (Requirement 10) */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={auction.seller?.profileImage}
                  name={auction.seller?.name || 'Seller'}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40"
                />
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {auction.seller?.name || 'Verified Consignor'}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {auction.seller?.rating || 4.9} rating
                    </span>
                    <span>•</span>
                    <span>{auction.seller?.auctionsCount || 1} lot(s) listed</span>
                    {auction.seller?.createdAt && (
                      <>
                        <span>•</span>
                        <span>Member since {new Date(auction.seller.createdAt).getFullYear()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
                ID Verified Consignor
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Bidding Console (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors">
            {/* Title & Metadata */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2">
                {auction.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Listed: {formatDate(auction.createdAt)}</span>
                <span>•</span>
                <span>Lot: {auction._id.substring(auction._id.length - 8).toUpperCase()}</span>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isEnded ? 'Auction Status' : 'Time Remaining'}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                  Ends {formatDateTime(auction.endTime)}
                </span>
              </div>
              <CountdownTimer
                endTime={auction.endTime}
                onExpire={() => setAuction((prev) => ({ ...prev, status: 'ended' }))}
              />
            </div>

            {/* Pricing Section in INR */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  {isEnded ? 'Final Winning Bid' : 'Current Highest Bid'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {auction.bidCount || 0} {auction.bidCount === 1 ? 'bid placed' : 'bids placed'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                  {formatINR(auction.currentBid || auction.startingPrice)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">INR</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Starting Bid: {formatINR(auction.startingPrice)}</span>
                <span>Min Increment: +{formatINR(auction.minimumIncrement)}</span>
              </div>
            </div>

            {/* Ended Status Banner */}
            {isEnded ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-base text-emerald-700 dark:text-emerald-300">Auction Has Concluded</h4>
                {auction.winner ? (
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Winner:{' '}
                    <strong className="text-amber-600 dark:text-amber-400">
                      {auction.winner.name || 'Collector'}
                    </strong>{' '}
                    with winning bid of <strong>{formatINR(auction.currentBid)}</strong>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This auction concluded without receiving any qualifying bids.
                  </p>
                )}
              </div>
            ) : (
              /* Active Bidding Form */
              <form onSubmit={handlePlaceBid} className="space-y-4">
                {isWinning && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    You are currently the highest bidder on this lot!
                  </div>
                )}

                {isSeller && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    You are the seller of this auction item (bidding disabled).
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                    Your Bid Amount (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={minRequiredBid}
                      step={auction.minimumIncrement}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      disabled={isSeller || isSubmittingBid}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3.5 text-lg font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder={minRequiredBid.toString()}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Minimum required: <strong className="font-mono">{formatINR(minRequiredBid)}</strong>
                  </p>
                </div>

                {/* Quick Add Increment Pills */}
                {!isSeller && (
                  <div className="flex gap-2">
                    {[auction.minimumIncrement, auction.minimumIncrement * 2, auction.minimumIncrement * 5].map(
                      (inc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddIncrement(inc)}
                          className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          +{formatINR(inc)}
                        </button>
                      )
                    )}
                  </div>
                )}

                {/* Submit Bid CTA */}
                {user ? (
                  <button
                    type="submit"
                    disabled={isSeller || isSubmittingBid}
                    className="w-full py-4 px-6 rounded-xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Gavel className="w-5 h-5" />
                    <span>{isSubmittingBid ? 'Submitting Bid...' : 'Place Bid Now'}</span>
                  </button>
                ) : (
                  <Link
                    to={`/login?redirect=/auctions/${auction._id}`}
                    className="w-full py-4 px-6 rounded-xl font-bold text-center text-slate-950 bg-amber-500 hover:bg-amber-400 block transition-colors shadow-lg"
                  >
                    Log In to Place Bid
                  </Link>
                )}
              </form>
            )}
          </div>

          {/* Bidding History Table */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-md transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Live Bidding Activity
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">{bids.length} records</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800/80">
              {bids.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                  No bids placed yet. Be the first to bid!
                </p>
              ) : (
                bids.map((b, idx) => {
                  const isHighest = idx === 0;
                  return (
                    <div
                      key={b._id || idx}
                      className={`pt-2.5 pb-1 flex items-center justify-between text-xs ${
                        isHighest ? 'text-amber-600 dark:text-amber-300 font-semibold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          src={b.bidder?.profileImage}
                          name={b.bidder?.name || 'Bidder'}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <span className="font-medium text-slate-900 dark:text-slate-200">
                            {b.bidder?.name || 'Verified Collector'}
                          </span>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400">
                          {formatINR(b.amount)}
                        </span>
                        {isHighest && (
                          <span className="block text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                            Highest Bid
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Auctions */}
      {auction.related && auction.related.length > 0 && (
        <section className="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Related Collectibles
            </h3>
            <Link
              to={`/auctions?category=${auction.category?._id}`}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View category</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {auction.related.map((rel) => (
              <AuctionCard key={rel._id} auction={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AuctionDetailsPage;
