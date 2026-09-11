import React from 'react';
import { Gavel, ShieldCheck, Award, Zap, Users, Globe2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          The Premier Bidding Experience
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          About ID Online Auction System
        </h1>
        <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
          Founded on transparency, precision, and passion for exceptional collectibles, ID Auction connects discerning buyers and certified consignors in an instantaneous digital arena.
        </p>
      </div>

      {/* Grid of Platform Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Sub-Second Bid Sync</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Our WebSocket infrastructure ensures bid submissions and countdown intervals are synchronized across all connected devices in real time with zero reload latency.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Authenticity Guarantee</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Every item presented in our catalog undergoes comprehensive multi-point authentication and provenance verification by certified horologists, appraisers, and historians.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Protected Escrow Settlement</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Buyer funds are held in secure escrow until the physical asset has been safely received, inspected, and verified against catalog specifications.
          </p>
        </div>
      </div>

      {/* Story & Guarantee */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl space-y-4">
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Traditional auction houses charge up to 25% buyer premiums and operate on opaque physical floor protocols. ID Auction brings fair market access, real-time data transparency, and verified provenance straight to collectors worldwide.
          </p>
        </div>
        <Link
          to="/auctions"
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm whitespace-nowrap shadow-lg shadow-amber-500/20"
        >
          Explore the Catalog
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
