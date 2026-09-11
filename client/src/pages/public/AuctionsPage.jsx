import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import AuctionCard from '../../components/common/AuctionCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const AuctionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state from URL query or defaults
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || 'all';
  const status = searchParams.get('status') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featured = searchParams.get('featured') || '';

  // Local state for price inputs
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [searchInput, setSearchInput] = useState(keyword);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch auctions when query params change
  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const queryObj = new URLSearchParams();
        if (keyword) queryObj.set('keyword', keyword);
        if (category && category !== 'all') queryObj.set('category', category);
        if (status && status !== 'all') queryObj.set('status', status);
        if (sort) queryObj.set('sort', sort);
        if (minPrice) queryObj.set('minPrice', minPrice);
        if (maxPrice) queryObj.set('maxPrice', maxPrice);
        if (featured) queryObj.set('featured', featured);
        queryObj.set('page', page);
        queryObj.set('limit', '8');

        const res = await api.get(`/auctions?${queryObj.toString()}`);
        setAuctions(res.data.auctions || []);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      } catch (err) {
        console.error('Failed to load auctions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [searchParams, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setPage(1);
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('keyword', searchInput);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMin) next.set('minPrice', localMin);
    else next.delete('minPrice');
    if (localMax) next.set('maxPrice', localMax);
    else next.delete('maxPrice');
    setPage(1);
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setLocalMin('');
    setLocalMax('');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    keyword ||
    (category && category !== 'all') ||
    (status && status !== 'all') ||
    minPrice ||
    maxPrice ||
    featured;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Browse Auctions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing {totalCount} {totalCount === 1 ? 'result' : 'results'} across all categories
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search auction items..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-md shadow-amber-500/20"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Content: Sidebar Filters + Auction Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            Filters & Sorting
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Sidebar Filter Panel */}
        <aside
          className={`space-y-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
              <Filter className="w-4 h-4 text-amber-400" />
              <span>Filter Auctions</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-amber-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Auction Status
            </label>
            <div className="flex flex-col space-y-1.5 text-xs font-medium">
              {[
                { id: 'all', label: 'All Statuses' },
                { id: 'active', label: 'Live Active' },
                { id: 'endingSoon', label: 'Ending Soon (<24h)' },
                { id: 'ended', label: 'Completed / Ended' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => updateParam('status', st.id)}
                  className={`text-left px-3 py-2 rounded-lg transition-colors ${
                    status === st.id
                      ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Categories
            </label>
            <div className="flex flex-col space-y-1.5 text-xs font-medium max-h-52 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam('category', 'all')}
                className={`text-left px-3 py-2 rounded-lg transition-colors ${
                  category === 'all'
                    ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateParam('category', cat._id)}
                  className={`text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                    category === cat._id
                      ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] text-slate-500 ml-1">
                    ({cat.auctionCount || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter (INR) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
              Price Range (₹ INR)
            </label>
            <form onSubmit={handlePriceApply} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-300 transition-colors"
              >
                Apply Price
              </button>
            </form>
          </div>
        </aside>

        {/* Right Content Area: Sort Bar + Cards Grid + Pagination */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              {keyword && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/60 text-xs text-slate-200">
                  Search: "{keyword}"
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-rose-400"
                    onClick={() => updateParam('keyword', '')}
                  />
                </span>
              )}
              {category !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-xs text-amber-300 border border-amber-500/30">
                  Category: {categories.find((c) => c._id === category)?.name || 'Selected'}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-white"
                    onClick={() => updateParam('category', 'all')}
                  />
                </span>
              )}
              {status !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/60 text-xs text-slate-200">
                  Status: {status}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-rose-400"
                    onClick={() => updateParam('status', 'all')}
                  />
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs text-slate-400 whitespace-nowrap">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="newest">Newest Listed</option>
                <option value="endingSoon">Ending Soonest</option>
                <option value="highestPrice">Highest Price</option>
                <option value="lowestPrice">Lowest Price</option>
                <option value="mostBids">Most Bids</option>
              </select>
            </div>
          </div>

          {/* Auction Cards Grid */}
          {loading ? (
            <LoadingSpinner message="Fetching auctions..." />
          ) : auctions.length === 0 ? (
            <EmptyState
              title="No auctions found"
              description="No auction items matched your current filter criteria. Try resetting your search or adjusting the price range."
              actionText="Clear All Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-10 h-10 rounded-lg text-xs font-bold transition-colors ${
                    page === num
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionsPage;
