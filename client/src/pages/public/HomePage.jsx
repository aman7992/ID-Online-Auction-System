import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Trophy,
  Users,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import AuctionCard from '../../components/common/AuctionCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HomePage = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [endingSoonAuctions, setEndingSoonAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featRes, endingRes, catRes] = await Promise.all([
          api.get('/auctions?featured=true&status=active&limit=4'),
          api.get('/auctions?status=endingSoon&limit=4'),
          api.get('/categories'),
        ]);

        setFeaturedAuctions(featRes.data.auctions || []);
        setEndingSoonAuctions(endingRes.data.auctions || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6 animate-pulse-subtle">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Next-Gen Real-Time Bidding Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Acquire Extraordinary{' '}
              <span className="gold-gradient-text">Treasures & Rarities</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Step into the premier online auction room for vintage Rolex timepieces, legendary collector vehicles, museum-grade art, and holy-grail collectibles with live WebSocket bidding.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auctions"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Explore Live Auctions</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5 text-amber-400" />
                <span>Create Free Account</span>
              </Link>
            </div>

            {/* Metrics Ticker */}
            <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <span className="block text-2xl sm:text-3xl font-bold font-mono text-white">
                  ₹35 Cr+
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">
                  Auction Volume (INR)
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold font-mono text-amber-400">
                  99.9%
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">
                  Authenticity Pass
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold font-mono text-white">
                  15,000+
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">
                  Verified Bidders
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                  &lt; 50ms
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1 block">
                  Bid Latency
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED AUCTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Hand-Picked Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured Live Auctions
            </h2>
          </div>
          <Link
            to="/auctions?featured=true"
            className="text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
          >
            <span>View all featured</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : featuredAuctions.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No featured auctions currently live.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAuctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}
      </section>

      {/* 3. ENDING SOON AUCTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-800/60 to-slate-800/40 border border-amber-500/20 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Closing Soon - Act Fast</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Final Bidding Countdown
              </h2>
            </div>
            <Link
              to="/auctions?status=endingSoon"
              className="text-sm font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 group"
            >
              <span>View all ending soon</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : endingSoonAuctions.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No auctions ending in the next 24 hours.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {endingSoonAuctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-2">
            Curated Collectibles
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Explore by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/auctions?category=${cat._id}`}
              className="group relative rounded-2xl overflow-hidden aspect-square border border-slate-800 hover:border-amber-500/60 transition-all shadow-md hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-end p-4 text-center bg-slate-900"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {cat.auctionCount || 0} items
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 md:p-12">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-2">
              Seamless Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How ID Online Auction Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-lg mb-4">
                01
              </div>
              <h3 className="font-bold text-slate-100 text-base mb-2">Create Account</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Register in seconds, verify your identity, and set up your personalized bidding profile.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-lg mb-4">
                02
              </div>
              <h3 className="font-bold text-slate-100 text-base mb-2">Discover Rarities</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse thoroughly authenticated luxury items, view hi-res galleries, and monitor prices.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-lg mb-4">
                03
              </div>
              <h3 className="font-bold text-slate-100 text-base mb-2">Bid in Real-Time</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Place competitive bids with instantaneous WebSocket feedback and automatic outbid alerts.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-lg mb-4">
                04
              </div>
              <h3 className="font-bold text-slate-100 text-base mb-2">Win & Collect</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When the countdown concludes, highest bidder is declared the winner with secured fulfillment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-8 sm:p-14 text-slate-950 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-amber-500/20">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Ready to Win Your Dream Piece?
            </h2>
            <p className="text-sm sm:text-base font-medium text-slate-900/80 leading-relaxed">
              Join thousands of discerning collectors today. Register now and begin placing real-time bids on vetted luxury items.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm text-center transition-colors shadow-lg"
            >
              Sign Up to Bid
            </Link>
            <Link
              to="/auctions"
              className="px-6 py-3.5 rounded-xl bg-white/90 hover:bg-white text-slate-950 font-bold text-sm text-center transition-colors shadow-lg"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
