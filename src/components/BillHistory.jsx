import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Search, Folder, Calendar, ChevronRight, Eye, Download, RefreshCw,
  TrendingUp, Scale, Clock, Receipt, ArrowLeft
} from 'lucide-react';
import { getAllBills } from '../services/billService';
import { downloadBillPDF } from '../services/pdfService';
import { 
  formatINR, formatDate,
  BANANA_VARIETIES, PAYMENT_STATUSES, LABELS 
} from '../utils/format';
import WhatsAppShareButton from './WhatsAppShareButton';

export default function BillHistory({ onViewBill }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchMerchant, setSearchMerchant] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const allBills = await getAllBills();
      setBills(allBills);
    } catch (err) {
      console.error('Error loading bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute primary view merchant folders
  const merchantFolders = useMemo(() => {
    const map = {};
    bills.forEach(b => {
      const name = b.merchantName || 'Unknown';
      if (!map[name]) {
        map[name] = {
          name,
          totalSales: 0,
          totalBills: 0,
          latestSaleDate: b.saleDate
        };
      }
      map[name].totalSales += (b.totalAmount || 0);
      map[name].totalBills += 1;
      if (b.saleDate > map[name].latestSaleDate) {
        map[name].latestSaleDate = b.saleDate;
      }
    });

    // Filter by search
    let grouped = Object.values(map);
    if (searchMerchant) {
      grouped = grouped.filter(m => m.name.toLowerCase().includes(searchMerchant.toLowerCase()));
    }

    // Sort by latest sale date
    return grouped.sort((a, b) => b.latestSaleDate.localeCompare(a.latestSaleDate));
  }, [bills, searchMerchant]);

  // Compute selected merchant details
  const merchantDashboardContext = useMemo(() => {
    if (!selectedMerchant) return null;

    const merchantBills = bills.filter(b => b.merchantName === selectedMerchant);
    
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentYearPrefix = `${now.getFullYear()}`;

    const kpi = {
      allTime: { sales: 0, kg: 0, pending: 0, count: 0 },
      monthly: { sales: 0, kg: 0, pending: 0 },
      yearly: { sales: 0, kg: 0, pending: 0 }
    };

    merchantBills.forEach(b => {
      const dateStr = b.saleDate || '';
      const amount = b.totalAmount || 0;
      const weight = b.netWeight || 0;
      let billPending = 0;
      
      if (b.paymentStatus === 'pending') {
        billPending = amount;
      } else if (b.paymentStatus === 'partial') {
        billPending = amount - (b.amountPaid || 0);
      }

      // All Time
      kpi.allTime.sales += amount;
      kpi.allTime.kg += weight;
      kpi.allTime.pending += billPending;
      kpi.allTime.count += 1;

      // Monthly
      if (dateStr.startsWith(currentMonthPrefix)) {
        kpi.monthly.sales += amount;
        kpi.monthly.kg += weight;
        kpi.monthly.pending += billPending;
      }

      // Yearly
      if (dateStr.startsWith(currentYearPrefix)) {
        kpi.yearly.sales += amount;
        kpi.yearly.kg += weight;
        kpi.yearly.pending += billPending;
      }
    });

    return {
      bills: merchantBills,
      kpi
    };
  }, [bills, selectedMerchant]);

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
          <p className="text-green-400/60">Loading bills...</p>
        </div>
      </div>
    );
  }

  // ---- MERCHANT DASHBOARD VIEW ----
  if (selectedMerchant && merchantDashboardContext) {
    const { kpi, bills: mBills } = merchantDashboardContext;
    
    return (
      <div className="space-y-6 slide-up pb-4 max-w-5xl mx-auto w-full">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedMerchant(null)} 
            className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors bg-green-900/20 px-3 py-1.5 rounded-xl border border-green-800/30"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Folders</span>
          </button>
          <div className="text-right">
            <h2 className="text-xl sm:text-2xl font-bold text-green-200">{selectedMerchant}</h2>
            <p className="text-xs text-green-500/50">Merchant Dashboard</p>
          </div>
        </div>

        {/* KPI Dashboard Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Main All time KPIs */}
          <div className="glass-card p-4 col-span-2 md:col-span-1 border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-400" />
              <p className="text-xs font-semibold text-green-400/70 uppercase">Total Sales</p>
            </div>
            <p className="text-2xl font-bold text-green-300">{formatINR(kpi.allTime.sales)}</p>
            <p className="text-xs text-green-500/40 mt-1">All Time Revenue</p>
          </div>

          <div className="glass-card p-4 border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Scale size={16} className="text-emerald-400" />
              <p className="text-xs font-semibold text-emerald-400/70 uppercase">Total Kg Sold</p>
            </div>
            <p className="text-2xl font-bold text-emerald-300">{kpi.allTime.kg.toFixed(1)} kg</p>
            <p className="text-xs text-emerald-500/40 mt-1">All Time Volume</p>
          </div>

          <div className="glass-card p-4 border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-yellow-400" />
              <p className="text-xs font-semibold text-yellow-400/70 uppercase">Pending Payments</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{formatINR(kpi.allTime.pending)}</p>
            <p className="text-xs text-yellow-500/40 mt-1">Uncollected Dues</p>
          </div>

          <div className="glass-card p-4 border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={16} className="text-blue-400" />
              <p className="text-xs font-semibold text-blue-400/70 uppercase">Total Bills</p>
            </div>
            <p className="text-2xl font-bold text-blue-300">{kpi.allTime.count}</p>
            <p className="text-xs text-blue-500/40 mt-1">Bills Raised</p>
          </div>
        </div>

        {/* Time-Bounded Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide mb-4">
              Monthly Performance / நடப்பு மாதம்
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-green-800/30 pb-2">
                <span className="text-green-400/60">Sales This Month</span>
                <span className="text-green-200 font-bold">{formatINR(kpi.monthly.sales)}</span>
              </div>
              <div className="flex justify-between border-b border-green-800/30 pb-2">
                <span className="text-green-400/60">Volume This Month</span>
                <span className="text-green-200 font-medium">{kpi.monthly.kg.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-yellow-400/60">Pending From This Month</span>
                <span className="text-yellow-400 font-bold">{formatINR(kpi.monthly.pending)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide mb-4">
              Yearly Performance / நடப்பு ஆண்டு
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-green-800/30 pb-2">
                <span className="text-green-400/60">Sales This Year</span>
                <span className="text-green-200 font-bold">{formatINR(kpi.yearly.sales)}</span>
              </div>
              <div className="flex justify-between border-b border-green-800/30 pb-2">
                <span className="text-green-400/60">Volume This Year</span>
                <span className="text-green-200 font-medium">{kpi.yearly.kg.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-yellow-400/60">Pending From This Year</span>
                <span className="text-yellow-400 font-bold">{formatINR(kpi.yearly.pending)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill List */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide">
              Associated Bills / தொடர்புடைய பில்கள்
            </h3>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-800/30">
                  <th className="text-left p-4 text-xs font-semibold text-green-500/50 uppercase">Bill ID</th>
                  <th className="text-left p-4 text-xs font-semibold text-green-500/50 uppercase">Date</th>
                  <th className="text-left p-4 text-xs font-semibold text-green-500/50 uppercase">Variety</th>
                  <th className="text-right p-4 text-xs font-semibold text-green-500/50 uppercase">Net Wt</th>
                  <th className="text-right p-4 text-xs font-semibold text-green-500/50 uppercase">Amount</th>
                  <th className="text-center p-4 text-xs font-semibold text-green-500/50 uppercase">Status</th>
                  <th className="text-center p-4 text-xs font-semibold text-green-500/50 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mBills.map((bill, i) => (
                  <tr 
                    key={bill._docId || i}
                    className="border-b border-green-800/10 hover:bg-green-900/20 transition-colors cursor-pointer"
                    onClick={() => onViewBill(bill)}
                  >
                    <td className="p-4 text-green-300 font-mono text-sm">{bill.billId}</td>
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
                        <WhatsAppShareButton bill={bill} variant="icon" className="!w-8 !h-8" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-green-800/20">
            {mBills.map((bill, i) => (
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
                    <p className="text-green-500/40 text-xs mt-0.5">
                      {formatDate(bill.saleDate)} · {getVarietyLabel(bill.bananaVariety)}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-green-200 font-bold">{formatINR(bill.totalAmount)}</p>
                    <p className="text-green-500/40 text-xs mb-2">{(bill.netWeight || 0).toFixed(1)} kg</p>
                    <WhatsAppShareButton bill={bill} variant="icon" className="!w-8 !h-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- PRIMARY FOLDERS VIEW ----
  return (
    <div className="space-y-6 slide-up pb-4 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-200">
            Merchant Folders
          </h2>
          <p className="text-xs text-green-500/50">வணிகர் வாரியாக பில்கள்</p>
        </div>
        <button onClick={loadData} className="btn-secondary !py-2 !px-3 !min-h-[36px]">
           <RefreshCw size={16} />
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600/50" />
        <input
          type="text"
          value={searchMerchant}
          onChange={(e) => setSearchMerchant(e.target.value)}
          placeholder="Search merchants..."
          className="input-field pl-11 !py-3 !text-base shadow-lg"
        />
      </div>

      {merchantFolders.length === 0 ? (
        <div className="p-12 text-center glass-card">
          <Folder size={48} className="mx-auto mb-3 text-green-800/40" />
          <p className="text-green-500/40 text-lg">No merchants found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
          {merchantFolders.map((mf, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedMerchant(mf.name)}
              className="glass-card p-5 hover:bg-green-900/20 active:bg-green-900/30 transition-all cursor-pointer border border-green-800/30 hover:border-green-500/50 hover:shadow-glow group"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
                  <Folder size={24} fill="currentColor" className="opacity-80" />
                </div>
                <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center group-hover:bg-green-800/50 transition-colors">
                  <ChevronRight size={18} className="text-green-600/50 group-hover:text-green-300 transition-colors" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-green-200 mb-1 truncate">{mf.name}</h3>
              
              <div className="flex items-center justify-between mt-5 text-sm border-t border-green-800/30 pt-3">
                <div>
                  <p className="text-green-500/50 text-[10px] uppercase font-semibold tracking-wide">Total Bills</p>
                  <p className="text-green-300 font-medium">{mf.totalBills}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-500/50 text-[10px] uppercase font-semibold tracking-wide">Total Sales</p>
                  <p className="text-green-300 font-bold">{formatINR(mf.totalSales)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
