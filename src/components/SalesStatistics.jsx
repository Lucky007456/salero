import React, { useMemo } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, Users, PieChart,
  Gauge, Activity, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { formatINR, formatCompactINR, BANANA_VARIETIES, LABELS } from '../utils/format';

// Color palette for variety bars
const VARIETY_COLORS = [
  'from-green-400 to-emerald-500',
  'from-emerald-400 to-teal-500',
  'from-teal-400 to-cyan-500',
  'from-cyan-400 to-sky-500',
  'from-lime-400 to-green-500',
  'from-yellow-400 to-amber-500',
  'from-amber-400 to-orange-500',
];

const VARIETY_BG = [
  'bg-green-400',
  'bg-emerald-400',
  'bg-teal-400',
  'bg-cyan-400',
  'bg-lime-400',
  'bg-yellow-400',
  'bg-amber-400',
];

function getVarietyLabel(value) {
  const v = BANANA_VARIETIES.find(b => b.value === value);
  return v ? v.label : value;
}

export default function SalesStatistics({ stats, monthLabel }) {
  if (!stats || stats.billCount === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <BarChart3 size={40} className="mx-auto mb-3 text-green-800/40" />
        <p className="text-green-500/40 text-sm">No sales data for this period</p>
        <p className="text-green-600/30 text-xs mt-1">விற்பனை தரவு இல்லை</p>
      </div>
    );
  }

  const {
    totalRevenue, revenueChange, totalKg, avgRatePerKg, prevAvgRate,
    varietyBreakdown, merchantLeaderboard, paymentBreakdown, dailyTrend, billCount
  } = stats;

  const maxVarietyKg = Math.max(...varietyBreakdown.map(v => v.kg), 1);
  const maxMerchantRevenue = Math.max(...merchantLeaderboard.map(m => m.revenue), 1);
  const maxDailyRevenue = Math.max(...dailyTrend.map(d => d.revenue), 1);

  const totalPaymentBills = (paymentBreakdown.paid?.count || 0) +
    (paymentBreakdown.partial?.count || 0) +
    (paymentBreakdown.pending?.count || 0);

  const rateChange = prevAvgRate > 0 ? ((avgRatePerKg - prevAvgRate) / prevAvgRate) * 100 : null;

  return (
    <div className="space-y-4 fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center">
          <BarChart3 size={16} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-green-200">{LABELS.salesStats.en}</h3>
          <p className="text-[10px] text-green-600/40">{LABELS.salesStats.ta} · {monthLabel}</p>
        </div>
      </div>

      {/* Revenue + Avg Rate Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Revenue Card */}
        <div className="glass-card p-4">
          <p className="text-[10px] text-green-500/50 uppercase tracking-wider mb-1">{LABELS.monthlyRevenue.en}</p>
          <p className="text-lg font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
            {formatCompactINR(totalRevenue)}
          </p>
          {revenueChange !== null && (
            <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-medium ${
              revenueChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {revenueChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{Math.abs(revenueChange).toFixed(1)}%</span>
              <span className="text-green-600/30 font-normal">{LABELS.vsLastMonth.en}</span>
            </div>
          )}
        </div>

        {/* Avg Rate Card */}
        <div className="glass-card p-4">
          <p className="text-[10px] text-green-500/50 uppercase tracking-wider mb-1">{LABELS.avgRate.en}</p>
          <p className="text-lg font-bold text-green-300">
            {formatINR(avgRatePerKg)}
          </p>
          {rateChange !== null && (
            <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-medium ${
              rateChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {rateChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{Math.abs(rateChange).toFixed(1)}%</span>
              <span className="text-green-600/30 font-normal">{LABELS.vsLastMonth.en}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Varieties */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <PieChart size={14} className="text-emerald-400/70" />
          <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wide">{LABELS.topVarieties.en}</p>
        </div>
        <div className="space-y-2.5">
          {varietyBreakdown.map((v, i) => (
            <div key={v.variety}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-green-300/80 font-medium">{getVarietyLabel(v.variety)}</span>
                <span className="text-xs text-green-400/60">{v.kg.toFixed(0)} kg · {formatCompactINR(v.revenue)}</span>
              </div>
              <div className="h-2 rounded-full bg-green-900/40 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${VARIETY_COLORS[i % VARIETY_COLORS.length]} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.max((v.kg / maxVarietyKg) * 100, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Merchants */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-emerald-400/70" />
          <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wide">{LABELS.topMerchants.en}</p>
        </div>
        <div className="space-y-2.5">
          {merchantLeaderboard.map((m, i) => (
            <div key={m.name} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                i === 1 ? 'bg-gray-400/20 text-gray-300' :
                i === 2 ? 'bg-amber-700/20 text-amber-500' :
                'bg-green-900/30 text-green-500/50'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-green-200 font-medium truncate">{m.name}</span>
                  <span className="text-xs text-green-400/60 shrink-0 ml-2">{formatCompactINR(m.revenue)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-green-900/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${Math.max((m.revenue / maxMerchantRevenue) * 100, 4)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {merchantLeaderboard.length === 0 && (
            <p className="text-xs text-green-600/30 text-center py-2">No merchants</p>
          )}
        </div>
      </div>

      {/* Payment Status Breakdown */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gauge size={14} className="text-emerald-400/70" />
          <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wide">{LABELS.paymentBreakdown.en}</p>
        </div>
        
        {/* Segmented Bar */}
        {totalPaymentBills > 0 && (
          <div className="h-3 rounded-full bg-green-900/40 overflow-hidden flex mb-3">
            {paymentBreakdown.paid.count > 0 && (
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${(paymentBreakdown.paid.count / totalPaymentBills) * 100}%` }}
              />
            )}
            {paymentBreakdown.partial.count > 0 && (
              <div
                className="h-full bg-yellow-500 transition-all duration-500"
                style={{ width: `${(paymentBreakdown.partial.count / totalPaymentBills) * 100}%` }}
              />
            )}
            {paymentBreakdown.pending.count > 0 && (
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${(paymentBreakdown.pending.count / totalPaymentBills) * 100}%` }}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-green-500/10">
            <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-green-400">{paymentBreakdown.paid.count}</p>
            <p className="text-[10px] text-green-500/50">Paid</p>
            <p className="text-[10px] text-green-400/40 font-medium">{formatCompactINR(paymentBreakdown.paid.amount)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-500/10">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-yellow-400">{paymentBreakdown.partial.count}</p>
            <p className="text-[10px] text-yellow-500/50">Partial</p>
            <p className="text-[10px] text-yellow-400/40 font-medium">{formatCompactINR(paymentBreakdown.partial.amount)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10">
            <div className="w-2 h-2 rounded-full bg-red-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-red-400">{paymentBreakdown.pending.count}</p>
            <p className="text-[10px] text-red-500/50">Pending</p>
            <p className="text-[10px] text-red-400/40 font-medium">{formatCompactINR(paymentBreakdown.pending.amount)}</p>
          </div>
        </div>
      </div>

      {/* Daily Revenue Trend */}
      {dailyTrend.length > 1 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-emerald-400/70" />
            <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wide">{LABELS.dailyTrend.en}</p>
          </div>
          <div className="flex items-end gap-[3px] h-20">
            {dailyTrend.map((d, i) => {
              const heightPct = Math.max((d.revenue / maxDailyRevenue) * 100, 4);
              const dayNum = d.date ? new Date(d.date).getDate() : i + 1;
              return (
                <div key={d.date || i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-sm bg-gradient-to-t from-green-600 to-emerald-400 transition-all duration-300 hover:from-green-500 hover:to-emerald-300 cursor-pointer min-w-[4px]"
                    style={{ height: `${heightPct}%` }}
                    title={`${d.date}: ${formatINR(d.revenue)}`}
                  />
                  {/* Show day label for every 5th bar or if few bars */}
                  {(dailyTrend.length <= 10 || i % 5 === 0 || i === dailyTrend.length - 1) && (
                    <span className="text-[8px] text-green-600/40">{dayNum}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-green-500/50 uppercase">Total Bills</p>
          <p className="text-lg font-bold text-green-300">{billCount}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-green-500/50 uppercase">Total Kg</p>
          <p className="text-lg font-bold text-green-300">{totalKg.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
}
