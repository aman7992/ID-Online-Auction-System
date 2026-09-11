import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, IndianRupee, Award, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatINR } from '../../utils/formatters';

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating executive platform reports..." />;
  }

  const kpis = data?.kpis || {};
  const categoryStats = data?.categoryStats || [];

  const totalLots = (kpis.activeAuctions || 0) + (kpis.completedAuctions || 0);
  const successRate = totalLots > 0 ? Math.round(((kpis.completedAuctions || 0) / totalLots) * 100) : 100;
  const avgLotValue = totalLots > 0 ? Math.round((kpis.totalAuctionValue || 0) / totalLots) : 0;

  const handleExportCSV = () => {
    // Generate CSV string from categoryStats
    const headers = ['Category', 'Lots Count', 'Total Bids', 'Gross Volume (₹ INR)\n'];
    const rows = categoryStats.map((c) => `"${c.name}",${c.count},${c.totalBids || 0},${c.totalValue || 0}\n`);
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + rows.join('');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `id_auction_performance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            Performance & Financial Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audited financial breakdown, catalog clearance rate, and category revenue
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Gross Market Value
          </span>
          <span className="text-3xl font-mono font-bold text-amber-400 block">
            {formatINR(kpis.totalAuctionValue || 0)}
          </span>
          <p className="text-[11px] text-slate-500">
            Total value of all listed active and settled auction lots
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Clearance Success Rate
          </span>
          <span className="text-3xl font-mono font-bold text-emerald-400 block">
            {successRate}%
          </span>
          <p className="text-[11px] text-slate-500">
            Percentage of catalog lots concluded with verified winning bids
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Average Lot Price
          </span>
          <span className="text-3xl font-mono font-bold text-white block">
            {formatINR(avgLotValue)}
          </span>
          <p className="text-[11px] text-slate-500">
            Mean hammer valuation across luxury and collectibles segments
          </p>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Performance by Category</h3>
          <span className="text-xs text-slate-400">{categoryStats.length} active categories</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-700">
              <tr>
                <th className="py-4 px-6">Category Name</th>
                <th className="py-4 px-6">Active/Closed Lots</th>
                <th className="py-4 px-6">Total Bids Placed</th>
                <th className="py-4 px-6">Gross Transaction Volume</th>
                <th className="py-4 px-6">Avg Bid per Lot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {categoryStats.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-200">
                    {cat.name}
                  </td>
                  <td className="py-4 px-6 font-semibold text-white">
                    {cat.count}
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {cat.totalBids || 0}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-amber-400">
                    {formatINR(cat.totalValue || 0)}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {cat.count > 0 ? Math.round((cat.totalBids || 0) / cat.count) : 0} bids / lot
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
