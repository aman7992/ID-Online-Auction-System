import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Gavel,
  CheckCircle2,
  TrendingUp,
  IndianRupee,
  PlusCircle,
  FolderTree,
  Trophy,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserAvatar from '../../components/common/UserAvatar';
import { formatINR } from '../../utils/formatters';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating platform analytics..." />;
  }

  const kpis = data?.kpis || {};
  const timelineData = data?.timelineData || [];
  const categoryStats = data?.categoryStats || [];
  const recentAuctions = data?.recentAuctions || [];
  const recentBids = data?.recentBids || [];
  const recentUsers = data?.recentUsers || [];

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            System Executive Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time auction performance, gross volume, and user activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/auctions/add"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Auction</span>
          </Link>
          <Link
            to="/admin/categories"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-white block">
            {kpis.totalUsers || 0}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            Registered collectors
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Auctions</span>
            <Gavel className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 block">
            {kpis.activeAuctions || 0}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            Live bidding active
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-white block">
            {kpis.completedAuctions || 0}
          </span>
          <span className="text-[11px] text-emerald-400 font-medium block">
            Auctions settled
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bids</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-white block">
            {kpis.totalBids || 0}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            Submitted offers
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-amber-500/10 to-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Value</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300 block">
            {formatINR(kpis.totalAuctionValue || 0)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium block">
            Cumulative hammer total
          </span>
        </div>
      </div>

      {/* Interactive Charts: Timeline Area Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bidding Volume Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white">Live Bidding Activity</h3>
              <p className="text-[11px] text-slate-400">Daily bid placement volume</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Past 7 Days
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bids"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#bidGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Value BarChart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-white">Volume by Category</h3>
              <p className="text-[11px] text-slate-400">Gross value distribution (₹)</p>
            </div>
            <FolderTree className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(v) => v.split(' ')[0]}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [formatINR(value), 'Total Value']}
                />
                <Bar dataKey="totalValue" radius={[6, 6, 0, 0]}>
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables: Recent Auctions & Live Bids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Auctions Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Gavel className="w-4 h-4 text-amber-400" />
              Recent Auction Lots
            </h3>
            <Link to="/admin/auctions" className="text-xs font-semibold text-amber-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Current Bid</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentAuctions.map((auc) => (
                  <tr key={auc._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pr-2">
                      <Link
                        to={`/auctions/${auc._id}`}
                        className="font-semibold text-slate-200 hover:text-amber-400 line-clamp-1"
                      >
                        {auc.title}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-400">{auc.category?.name}</td>
                    <td className="py-3 font-mono font-bold text-amber-400">
                      {formatINR(auc.currentBid || 0)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          auc.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-700/60 text-slate-400'
                        }`}
                      >
                        {auc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Bids Feed (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Live Bids Log
            </h3>
            <Link to="/admin/bids" className="text-xs font-semibold text-amber-400 hover:underline">
              Audit Table
            </Link>
          </div>

          <div className="space-y-3">
            {recentBids.map((b) => (
              <div
                key={b._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar
                    user={b.bidder}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-slate-200 block truncate">
                      {b.bidder?.name || 'Collector'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {b.auction?.title}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <span className="font-mono font-bold text-xs text-amber-400 block">
                    {formatINR(b.amount || 0)}
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
