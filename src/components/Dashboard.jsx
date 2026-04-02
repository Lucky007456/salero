import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Weight, AlertCircle, FileText, Search, Filter, Calendar,
  ChevronDown, Eye, Download, RefreshCw
} from 'lucide-react';
import { getAllBills, getDashboardSummary, getAvailableMonths, getBillsByMonth, getSalesStatistics } from '../services/billService';
import { downloadBillPDF } from '../services/pdfService';
import { 
  formatINR, formatDate, formatMonthYear, getMonthKey,
  BANANA_VARIETIES, PAYMENT_STATUSES, LABELS 
} from '../utils/format';
import SalesStatistics from './SalesStatistics';

export default function Dashboard({ onViewBill }) {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Month selector
  const [selectedMonth, setSelectedMonth] = useState(null); // null = all months

  // Filters
  const [searchMerchant, setSearchMerchant] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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

  // Available months derived from bills
  const availableMonths = useMemo(() => getAvailableMonths(bills), [bills]);

  // Bills filtered by selected month
  const monthBills = useMemo(() => getBillsByMonth(bills, selectedMonth), [bills, selectedMonth]);

  // Previous month bills for comparison
  const prevMonthBills = useMemo(() => {
    if (!selectedMonth) return [];
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx < 0 || idx >= availableMonths.length - 1) return [];
    return getBillsByMonth(bills, availableMonths[idx + 1]);
  }, [bills, selectedMonth, availableMonths]);

  // Sales statistics for selected month
  const salesStats = useMemo(() => {
    if (monthBills.length === 0) return null;
    return getSalesStatistics(monthBills, prevMonthBills);
  }, [monthBills, prevMonthBills]);

  // Monthly summary metrics
  const monthSummary = useMemo(() => {
    const totalRevenue = monthBills.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalKg = monthBills.reduce((s, b) => s + (b.netWeight || 0), 0);
    const avgRate = totalKg > 0 ? totalRevenue / totalKg : 0;
    return { count: monthBills.length, totalRevenue, totalKg, avgRate };
  }, [monthBills]);

  // Filter bills further by search/status/date within the selected month
  const filteredBills = useMemo(() => {
    return monthBills.filter(bill => {
      if (searchMerchant && !bill.merchantName?.toLowerCase().includes(searchMerchant.toLowerCase())) {
        return false;
      }
      if (filterStatus && bill.paymentStatus !== filterStatus) {
        return false;
      }
      if (dateFrom && bill.saleDate < dateFrom) {
        return false;
      }
      if (dateTo && bill.saleDate > dateTo) {
        return false;
      }
      return true;
    });
  }, [monthBills, searchMerchant, filterStatus, dateFrom, dateTo]);

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

  const currentMonthLabel = selectedMonth ? formatMonthYear(selectedMonth) : LABELS.allMonths.en;

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
    <div className="space-y-6 slide-up pb-4">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <span className="text-xs text-green-500/50 uppercase">{LABELS.totalSales.en}</span>
          </div>
          <p className="text-xs text-green-600/30 mb-1">{LABELS.totalSales.ta}</p>
          <p className="summary-value text-xl sm:text-2xl">
            {formatINR(summary?.totalSalesThisMonth || 0)}
          </p>
          <p className="text-[10px] text-green-600/40 mt-1">This month</p>
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
          <p className="text-[10px] text-green-600/40 mt-1">This month</p>
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

      {/* ============ MONTH SELECTOR ============ */}
      {availableMonths.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-green-400/60" />
            <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wide">
              {LABELS.monthlySummary.en} / {LABELS.monthlySummary.ta}
            </p>
          </div>
          <div className="month-scroll">
            <button
              onClick={() => setSelectedMonth(null)}
              className={`month-pill ${!selectedMonth ? 'month-pill-active' : 'month-pill-inactive'}`}
            >
              {LABELS.allMonths.en}
            </button>
            {availableMonths.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`month-pill ${selectedMonth === m ? 'month-pill-active' : 'month-pill-inactive'}`}
              >
                {formatMonthYear(m)}
              </button>
            ))}
          </div>

          {/* Monthly Summary Banner */}
          {selectedMonth && (
            <div className="mt-3 p-3 rounded-xl bg-green-900/30 border border-green-700/20 fade-in">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-green-500/50 text-xs">Bills: </span>
                  <span className="text-green-300 font-bold">{monthSummary.count}</span>
                </div>
                <div>
                  <span className="text-green-500/50 text-xs">Revenue: </span>
                  <span className="text-green-300 font-bold">{formatINR(monthSummary.totalRevenue)}</span>
                </div>
                <div>
                  <span className="text-green-500/50 text-xs">Weight: </span>
                  <span className="text-green-300 font-bold">{monthSummary.totalKg.toFixed(0)} kg</span>
                </div>
                <div>
                  <span className="text-green-500/50 text-xs">Avg Rate: </span>
                  <span className="text-green-300 font-bold">{formatINR(monthSummary.avgRate)}/kg</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ TWO-COLUMN LAYOUT: BILLING + STATISTICS ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

        {/* LEFT COLUMN: Billing History */}
        <div className="space-y-4 min-w-0">
          {/* Filters */}
          <div className="glass-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600/50" />
                <input
                  type="text"
                  value={searchMerchant}
                  onChange={(e) => setSearchMerchant(e.target.value)}
                  placeholder={`${LABELS.filterByMerchant.en}...`}
                  className="input-field pl-11 !py-2.5 !min-h-[40px]"
                  id="search-merchant"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary !py-2.5 !px-3 !min-h-[40px] ${showFilters ? '!border-green-500/40' : ''}`}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 fade-in">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select-field !py-2.5 !min-h-[40px] text-sm"
                    id="filter-status"
                  >
                    <option value="">All Statuses</option>
                    {PAYMENT_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600/50 pointer-events-none" />
                </div>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input-field !py-2.5 !min-h-[40px] text-sm"
                  placeholder="From date"
                  id="date-from"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input-field !py-2.5 !min-h-[40px] text-sm"
                  placeholder="To date"
                  id="date-to"
                />
              </div>
            )}
          </div>

          {/* Bills List */}
          <div className="glass-card overflow-hidden">
            {/* Section title */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide">
                {selectedMonth ? `${formatMonthYear(selectedMonth)} Bills` : 'All Bills'}
              </h3>
              <span className="text-xs text-green-600/40">
                {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'}
              </span>
            </div>

            {filteredBills.length === 0 ? (
              <div className="p-12 text-center">
                <FileText size={48} className="mx-auto mb-3 text-green-800/40" />
                <p className="text-green-500/40 text-lg">No bills found</p>
                <p className="text-green-600/30 text-sm mt-1">
                  {bills.length === 0 ? 'Create your first sale bill to get started!' : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-green-800/30">
                        <th className="text-left p-4 text-xs font-semibold text-green-500/50 uppercase">{LABELS.billId.en}</th>
                        <th className="text-left p-4 text-xs font-semibold text-green-500/50 uppercase">Merchant</th>
                        <th className="text-left p-4 text-xs font-semibold text-green-500/50 uppercase">Date</th>
                        <th className="text-left p-4 text-xs font-semibold text-green-500/50 uppercase">Variety</th>
                        <th className="text-right p-4 text-xs font-semibold text-green-500/50 uppercase">Net Wt</th>
                        <th className="text-right p-4 text-xs font-semibold text-green-500/50 uppercase">Amount</th>
                        <th className="text-center p-4 text-xs font-semibold text-green-500/50 uppercase">Status</th>
                        <th className="text-center p-4 text-xs font-semibold text-green-500/50 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBills.map((bill, i) => (
                        <tr 
                          key={bill._docId || i}
                          className="border-b border-green-800/10 hover:bg-green-900/20 transition-colors cursor-pointer"
                          onClick={() => onViewBill(bill)}
                        >
                          <td className="p-4 text-green-300 font-mono text-sm">{bill.billId}</td>
                          <td className="p-4 text-green-200 font-medium">{bill.merchantName}</td>
                          <td className="p-4 text-green-400/60 text-sm">{formatDate(bill.saleDate)}</td>
                          <td className="p-4 text-green-400/60 text-sm">{getVarietyLabel(bill.bananaVariety)}</td>
                          <td className="p-4 text-green-200 text-right font-medium">{(bill.netWeight || 0).toFixed(1)} kg</td>
                          <td className="p-4 text-green-200 text-right font-bold">{formatINR(bill.totalAmount)}</td>
                          <td className="p-4 text-center">
                            <span className={getStatusClass(bill.paymentStatus)}>
                              {bill.paymentStatus?.charAt(0).toUpperCase() + bill.paymentStatus?.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => onViewBill(bill)}
                                className="p-2 rounded-lg hover:bg-green-800/30 text-green-500/50 hover:text-green-400 transition-colors"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => downloadBillPDF(bill)}
                                className="p-2 rounded-lg hover:bg-green-800/30 text-green-500/50 hover:text-green-400 transition-colors"
                                title="Download PDF"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-green-800/20">
                  {filteredBills.map((bill, i) => (
                    <div
                      key={bill._docId || i}
                      className="p-4 hover:bg-green-900/20 transition-colors active:bg-green-900/30"
                      onClick={() => onViewBill(bill)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-mono text-sm">{bill.billId}</span>
                        <span className={getStatusClass(bill.paymentStatus)}>
                          {bill.paymentStatus?.charAt(0).toUpperCase() + bill.paymentStatus?.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-200 font-medium">{bill.merchantName}</p>
                          <p className="text-green-500/40 text-xs mt-0.5">
                            {formatDate(bill.saleDate)} · {getVarietyLabel(bill.bananaVariety)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-200 font-bold">{formatINR(bill.totalAmount)}</p>
                          <p className="text-green-500/40 text-xs">{(bill.netWeight || 0).toFixed(1)} kg</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Results count */}
          {filteredBills.length > 0 && (
            <p className="text-center text-xs text-green-600/40">
              Showing {filteredBills.length} of {monthBills.length} bills
              {selectedMonth ? ` in ${formatMonthYear(selectedMonth)}` : ''}
            </p>
          )}
        </div>

        {/* RIGHT COLUMN: Sales Statistics */}
        <div className="min-w-0">
          <SalesStatistics 
            stats={salesStats} 
            monthLabel={currentMonthLabel}
          />
        </div>
      </div>
    </div>
  );
}
