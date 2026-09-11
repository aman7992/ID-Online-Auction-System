import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, ShieldCheck, Zap, Lock, Award, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      {/* Guarantees bar */}
      <div className="border-b border-slate-800/80 py-8 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                Real-Time Bidding
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Instant WebSocket bid execution</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                Buyer Protection
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Verified authenticity & escrow</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                Secure Transactions
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">End-to-end encrypted security</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                Curated Luxury
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Expert authenticated items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Bio */}
        <div className="md:col-span-1 space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold">
              <Gavel className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-white font-sans">
              ID <span className="text-amber-400">AUCTION</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            The next-generation live online auction platform connecting passionate collectors with rare timepieces, historic exotics, fine art, and premier collectibles.
          </p>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ID Online Auction System. All rights reserved.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-4">
            Auctions
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/auctions?status=active" className="hover:text-amber-400 transition-colors">
                Live Auctions
              </Link>
            </li>
            <li>
              <Link to="/auctions?status=endingSoon" className="hover:text-amber-400 transition-colors">
                Ending Soon
              </Link>
            </li>
            <li>
              <Link to="/auctions?sort=highestPrice" className="hover:text-amber-400 transition-colors">
                Featured Collectibles
              </Link>
            </li>
            <li>
              <Link to="/auctions?status=ended" className="hover:text-amber-400 transition-colors">
                Closed Auctions & Results
              </Link>
            </li>
          </ul>
        </div>

        {/* Platform Info */}
        <div>
          <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-4">
            Platform
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/about" className="hover:text-amber-400 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/about#how-it-works" className="hover:text-amber-400 transition-colors">
                How Bidding Works
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-amber-400 transition-colors">
                Help & Contact Support
              </Link>
            </li>
            <li>
              <Link to="/user/dashboard" className="hover:text-amber-400 transition-colors">
                Member Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-4">
            Popular Categories
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/auctions" className="hover:text-amber-400 transition-colors">
                Luxury Watches & Jewelry
              </Link>
            </li>
            <li>
              <Link to="/auctions" className="hover:text-amber-400 transition-colors">
                Classic & Exotic Vehicles
              </Link>
            </li>
            <li>
              <Link to="/auctions" className="hover:text-amber-400 transition-colors">
                Rare Collectibles & Art
              </Link>
            </li>
            <li>
              <Link to="/auctions" className="hover:text-amber-400 transition-colors">
                High-End Electronics
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
