import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Weight, AlertCircle, FileText, ChevronRight, Eye, RefreshCw
} from 'lucide-react';
import { getAllBills, getDashboardSummary, getAvailableMonths, getBillsByMonth } from '../services/billService';
import { 
  formatINR, formatDate, formatMonthYear,
  BANANA_VARIETIES, LABELS 
} from '../utils/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const allBills = await getAllBills();
      setBills(allBills);
      const sum = await getDashboardSummary(allBills);
      setSummary(sum);
    } catch (err) {
      console.error('Error loading bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Get most recent 5 bills
  const recentBills = useMemo(() => bills.slice(0, 5), [bills]);

  const getVarietyLabel = (value) => {
    const v = BANANA_VARIETIES.find(b => b.value === value);
    return v ? v.label : value;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'partial': return 'status-partial';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw size={32} className="text-green-500 animate-spin mx-auto mb-3" />
          <p className="text-green-400/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-up pb-4 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-200">
            {LABELS.dashboard.en}
          </h2>
          <p className="text-xs text-green-500/50">{LABELS.dashboard.ta}</p>
        </div>
        <button onClick={loadData} className="btn-secondary !py-2 !px-3 !min-h-[36px]">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <span className="text-xs text-green-500/50 uppercase">{LABELS.totalSales.en}</span>
          </div>
          <p className="text-xs text-green-600/30 mb-1">{LABELS.totalSales.ta}</p>
          <p className="summary-value text-xl sm:text-2xl">
            {formatINR(summary?.totalSales || 0)}
          </p>
          <p className="text-[10px] text-green-600/40 mt-1">
            {formatINR(summary?.totalSalesThisMonth || 0)} this month
          </p>
        </div>

        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Weight size={16} className="text-emerald-400" />
            </div>
            <span className="text-xs text-green-500/50 uppercase">{LABELS.totalKgSold.en}</span>
          </div>
          <p className="text-xs text-green-600/30 mb-1">{LABELS.totalKgSold.ta}</p>
          <p className="summary-value text-xl sm:text-2xl">
            {(summary?.totalKgSold || 0).toFixed(0)} kg
          </p>
          <p className="text-[10px] text-green-600/40 mt-1">
            {(summary?.totalKgSoldThisMonth || 0).toFixed(0)} kg this month
          </p>
        </div>

        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <AlertCircle size={16} className="text-yellow-400" />
            </div>
            <span className="text-xs text-green-500/50 uppercase">{LABELS.pendingPayments.en}</span>
          </div>
          <p className="text-xs text-green-600/30 mb-1">{LABELS.pendingPayments.ta}</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-400">
            {formatINR(summary?.pendingPayments || 0)}
          </p>
          <p className="text-[10px] text-yellow-600/40 mt-1">All time</p>
        </div>

        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileText size={16} className="text-blue-400" />
            </div>
            <span className="text-xs text-green-500/50 uppercase">Total Bills</span>
          </div>
          <p className="text-xs text-green-600/30 mb-1">மொத்த பில்கள்</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-400">
            {summary?.totalBills || 0}
          </p>
          <p className="text-[10px] text-green-600/40 mt-1">
            {summary?.totalBillsThisMonth || 0} this month
          </p>
        </div>
      </div>

      {/* Recent Bills preview */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-green-800/20">
          <div>
            <h3 className="text-sm font-semibold text-green-400/80 uppercase tracking-wide">
              Recent Bills
            </h3>
            <p className="text-[10px] text-green-500/40 mt-0.5">சமீபத்திய பில்கள்</p>
          </div>
          <button 
            onClick={() => navigate('/admin/history')}
            className="flex items-center gap-1 text-xs text-green-400/80 hover:text-green-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-green-800/30"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        {recentBills.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={40} className="mx-auto mb-3 text-green-800/30" />
            <p className="text-green-500/40 text-sm">No bills found yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-green-800/10">
            {recentBills.map((bill, i) => (
              <div
                key={bill._docId || i}
                className="p-4 flex items-center justify-between hover:bg-green-900/20 transition-colors cursor-pointer group"
                onClick={() => navigate(`/admin/bill/${bill._docId || bill.billId}`, { state: { bill } })}
              >
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex w-10 h-10 rounded-full bg-green-900/40 items-center justify-center border border-green-800/30">
                    <FileText size={16} className="text-green-500/60" />
                  </div>
                  <div>
                    <h4 className="text-green-200 font-medium text-sm sm:text-base">
                      {bill.merchantName}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-green-500/40 font-mono">{bill.billId}</span>
                      <span className="text-[10px] text-green-600/30">•</span>
                      <span className="text-xs text-green-500/40">{formatDate(bill.saleDate)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-green-200 font-bold text-sm sm:text-base">
                      {formatINR(bill.totalAmount)}
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <span className="text-[10px] text-green-500/40">{(bill.netWeight || 0).toFixed(1)} kg</span>
                      <span className={getStatusClass(bill.paymentStatus)}>
                        {bill.paymentStatus?.charAt(0).toUpperCase() + bill.paymentStatus?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye size={18} className="text-green-500/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
