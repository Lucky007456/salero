import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, Users, PieChart,
  Gauge, Activity, ArrowUpRight, ArrowDownRight, Minus,
  Trophy, Scale, DollarSign, Search
} from 'lucide-react';
import { formatINR, formatCompactINR, BANANA_VARIETIES, LABELS } from '../utils/format';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, ComposedChart, Cell, Legend
} from 'recharts';

function getVarietyLabel(value) {
  const v = BANANA_VARIETIES.find(b => b.value === value);
  return v ? `${v.label} / ${v.tamil}` : value;
}

// Custom Tooltips
const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-green-950/90 border border-green-800/50 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-green-300 font-bold mb-1">{data.date}</p>
        <p className="text-green-400 text-sm">Revenue: {formatINR(data.revenue)}</p>
        <p className="text-emerald-400/80 text-xs">Gross Wt: {data.grossWeight?.toFixed(2)} kg</p>
        <p className="text-green-500/80 text-xs">Bills: {data.count}</p>
      </div>
    );
  }
  return null;
};

const WeightTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const wastagePct = data.grossWeight > 0 ? ((data.wastage / data.grossWeight) * 100).toFixed(1) : 0;
    return (
      <div className="bg-green-950/90 border border-green-800/50 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-green-300 font-bold mb-1">{data.date}</p>
        <p className="text-green-400 text-sm">Gross Wt: {data.grossWeight.toFixed(2)} kg</p>
        <p className="text-emerald-400 text-sm">Net Wt: {data.kg.toFixed(2)} kg</p>
        <p className="text-red-400 text-sm mt-1 border-t border-green-800 pt-1">
          Wastage: {data.wastage.toFixed(2)} kg ({wastagePct}%)
        </p>
      </div>
    );
  }
  return null;
};

const MoMTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const rev = payload.find(p => p.dataKey === 'revenue')?.value || 0;
    const kg = payload.find(p => p.dataKey === 'kg')?.value || 0;
    return (
      <div className="bg-green-950/90 border border-green-800/50 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-green-300 font-bold mb-1">{label}</p>
        <p className="text-emerald-400 text-sm">Revenue: {formatINR(rev)}</p>
        <p className="text-green-500/80 text-sm">KG Sold: {kg.toFixed(0)} kg</p>
      </div>
    );
  }
  return null;
};

const RateTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-green-950/95 border border-green-700/50 p-2 rounded shadow-2xl z-50">
        <p className="text-green-400/80 text-[10px] mb-0.5">{data.date}</p>
        <p className="text-green-300 text-xs font-bold">₹{data.rate?.toFixed(1) || data.rate}</p>
      </div>
    );
  }
  return null;
};

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
    totalRevenue, revenueChange, totalKg, kgChange, avgRatePerKg, prevAvgRate,
    varietyBreakdown, merchantLeaderboard, paymentBreakdown, dailyTrend, 
    billCount, collectionEfficiency, bestSingleDay, monthOverMonth, rateTracker
  } = stats;

  const rateChange = prevAvgRate > 0 ? ((avgRatePerKg - prevAvgRate) / prevAvgRate) * 100 : null;

  const totalPaymentBills = (paymentBreakdown.paid?.count || 0) +
    (paymentBreakdown.partial?.count || 0) +
    (paymentBreakdown.pending?.count || 0);

  // Search state for merchant table
  const [merchantSearch, setMerchantSearch] = useState('');
  const filteredMerchants = merchantLeaderboard.filter(m => 
    m.name.toLowerCase().includes(merchantSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 fade-in pb-10">
      
      {/* SECTION 8: QUICK SUMMARY BANNER (Ticker) */}
      <div className="overflow-hidden bg-green-900/30 border-y border-green-800/40 py-2 relative group -mx-4 sm:mx-0 sm:rounded-lg">
        <div className="flex animate-scroll hover:pause whitespace-nowrap pt-1">
          <div className="flex shrink-0 gap-8 px-4 font-mono text-sm">
            <span className="flex gap-2">
              <span className="text-green-600/60">REV</span>
              <span className="text-green-300 font-bold">{formatCompactINR(totalRevenue)}</span>
              {revenueChange !== null && (
                <span className={revenueChange >= 0 ? "text-green-400" : "text-red-400"}>
                  {revenueChange >= 0 ? '▲' : '▼'}{Math.abs(revenueChange).toFixed(1)}%
                </span>
              )}
            </span>
            <span className="flex gap-2 border-l border-green-800/40 pl-8">
              <span className="text-green-600/60">VOL</span>
              <span className="text-green-300 font-bold">{totalKg.toFixed(0)}KG</span>
              {kgChange !== null && (
                <span className={kgChange >= 0 ? "text-green-400" : "text-red-400"}>
                  {kgChange >= 0 ? '▲' : '▼'}{Math.abs(kgChange).toFixed(1)}%
                </span>
              )}
            </span>
            <span className="flex gap-2 border-l border-green-800/40 pl-8">
              <span className="text-green-600/60">RATE</span>
              <span className="text-green-300 font-bold">₹{avgRatePerKg.toFixed(1)}</span>
              {rateChange !== null && (
                <span className={rateChange >= 0 ? "text-green-400" : "text-red-400"}>
                  {rateChange >= 0 ? '▲' : '▼'}{Math.abs(rateChange).toFixed(1)}%
                </span>
              )}
            </span>
            <span className="flex gap-2 border-l border-green-800/40 pl-8">
              <span className="text-green-600/60">PENDING</span>
              <span className="text-red-400 font-bold">{formatCompactINR(paymentBreakdown.pending.amount + paymentBreakdown.partial.amount)}</span>
            </span>
            {varietyBreakdown.length > 0 && (
              <span className="flex gap-2 border-l border-green-800/40 pl-8">
                <span className="text-green-600/60">TOP VAR</span>
                <span className="text-emerald-400 font-bold">{BANANA_VARIETIES.find(b => b.value === varietyBreakdown[0].variety)?.label}</span>
              </span>
            )}
            <span className="flex gap-2 border-l border-green-800/40 pl-8">
              <span className="text-green-600/60">COLLECTED</span>
              <span className={`font-bold ${collectionEfficiency > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                {collectionEfficiency.toFixed(1)}%
              </span>
            </span>
          </div>
          {/* Duplicate for infinite loop */}
          <div className="flex shrink-0 gap-8 px-8 font-mono text-sm">
            <span className="flex gap-2">
              <span className="text-green-600/60">REV</span>
              <span className="text-green-300 font-bold">{formatCompactINR(totalRevenue)}</span>
              {revenueChange !== null && (
                <span className={revenueChange >= 0 ? "text-green-400" : "text-red-400"}>
                  {revenueChange >= 0 ? '▲' : '▼'}{Math.abs(revenueChange).toFixed(1)}%
                </span>
              )}
            </span>
            <span className="flex gap-2 border-l border-green-800/40 pl-8">
              <span className="text-green-600/60">VOL</span>
              <span className="text-green-300 font-bold">{totalKg.toFixed(0)}KG</span>
            </span>
            <span className="flex gap-2 border-l border-green-800/40 pl-8">
              <span className="text-green-600/60">PENDING</span>
              <span className="text-red-400 font-bold">{formatCompactINR(paymentBreakdown.pending.amount)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* EXISTING: Revenue + Avg Rate Row */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="glass-card p-4 sm:p-5">
          <p className="text-[10px] sm:text-xs text-green-500/50 uppercase tracking-wider mb-1">{LABELS.monthlyRevenue.en} / {LABELS.monthlyRevenue.ta}</p>
          <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
            {formatINR(totalRevenue)}
          </p>
          {revenueChange !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              revenueChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {revenueChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{Math.abs(revenueChange).toFixed(1)}%</span>
              <span className="text-green-600/30 font-normal">{LABELS.vsLastMonth.ta}</span>
            </div>
          )}
        </div>

        <div className="glass-card p-4 sm:p-5">
          <p className="text-[10px] sm:text-xs text-green-500/50 uppercase tracking-wider mb-1">{LABELS.avgRate.en} / {LABELS.avgRate.ta}</p>
          <p className="text-xl sm:text-3xl font-bold text-green-300">
            {formatINR(avgRatePerKg)}
          </p>
          {rateChange !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              rateChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {rateChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{Math.abs(rateChange).toFixed(1)}%</span>
              <span className="text-green-600/30 font-normal">{LABELS.vsLastMonth.ta}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: DAILY REVENUE TREND CHART */}
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-emerald-400" />
          <p className="text-xs font-bold text-green-400/80 uppercase tracking-wide">
            {LABELS.dailyTrend.en} / நாள்வாரி வருவாய்
          </p>
        </div>
        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => val ? val.split('-')[2] : ''} 
                stroke="#065f46" 
                tick={{fill: '#10b981', fontSize: 10}}
                tickMargin={10}
              />
              <YAxis 
                tickFormatter={(val) => `₹${val/1000}k`} 
                stroke="#065f46"
                tick={{fill: '#10b981', fontSize: 10}}
              />
              <RechartsTooltip content={<RevenueTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRev)" 
                activeDot={{ r: 6, fill: "#34d399", stroke: "#064e3b", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 2: DAILY WEIGHT CHART */}
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Scale size={16} className="text-emerald-400" />
          <p className="text-xs font-bold text-green-400/80 uppercase tracking-wide">
            {LABELS.dailyWeightLog?.en || 'Daily Weight Chart'} / {LABELS.dailyWeightLog?.ta || 'நாள்வாரி எடை விவரம்'}
          </p>
        </div>
        <div className="h-56 sm:h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => val ? val.split('-')[2] : ''} 
                stroke="#065f46" 
                tick={{fill: '#10b981', fontSize: 10}}
              />
              <YAxis 
                tickFormatter={(val) => `${val}kg`} 
                stroke="#065f46"
                tick={{fill: '#10b981', fontSize: 10}}
              />
              <RechartsTooltip content={<WeightTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', color: '#10b981' }} />
              <Bar dataKey="kg" name="Net Weight" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="wastage" name="Wastage" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Wastage Summary */}
        <div className="mt-4 pt-3 border-t border-green-800/40 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-green-600/60">Total Wastage:</span>
            <span className="text-red-400 font-bold">{dailyTrend.reduce((s,d) => s + d.wastage, 0).toFixed(1)} kg</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600/60">Avg / Bill:</span>
            <span className="text-yellow-400 font-bold">
              {billCount > 0 ? (dailyTrend.reduce((s,d) => s + d.wastage, 0) / billCount).toFixed(1) : 0} kg
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: MONTH OVER MONTH COMPARISON */}
      {monthOverMonth.length > 1 && (
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-emerald-400" />
            <p className="text-xs font-bold text-green-400/80 uppercase tracking-wide">
              {LABELS.monthOverMonth?.en || 'Month Over Month'} / மாத ஒப்பீடு
            </p>
          </div>
          <div className="h-64 sm:h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthOverMonth} margin={{ top: 10, right: -10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" stroke="#065f46" tick={{fill: '#10b981', fontSize: 10}} />
                <YAxis yAxisId="left" tickFormatter={(val) => `₹${val/1000}k`} stroke="#065f46" tick={{fill: '#10b981', fontSize: 10}} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val}kg`} stroke="#065f46" tick={{fill: '#10b981', fontSize: 10}} />
                <RechartsTooltip content={<MoMTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px', color: '#10b981' }} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="kg" name="Total KG" stroke="#fbbf24" strokeWidth={3} dot={{r:4, fill:"#10b981"}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SECTION 6: FINANCIAL HEALTH PANEL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-4 flex flex-col justify-between">
          <p className="text-[10px] text-green-500/50 uppercase tracking-widest mb-2">Collection Effic.</p>
          <div className="flex items-end justify-between">
            <p className={`text-2xl font-bold ${
              collectionEfficiency > 80 ? 'text-green-400' :
              collectionEfficiency > 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {collectionEfficiency.toFixed(1)}%
            </p>
            <PieChart size={24} className="text-green-800/40 mb-1" />
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col justify-between">
          <p className="text-[10px] text-green-500/50 uppercase tracking-widest mb-2">Avg KG / Bill</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-emerald-300">
              {billCount ? (totalKg / billCount).toFixed(1) : 0} <span className="text-sm font-normal text-green-600/40">kg</span>
            </p>
            <Scale size={24} className="text-green-800/40 mb-1" />
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col justify-between">
          <p className="text-[10px] text-green-500/50 uppercase tracking-widest mb-2">Avg Rev / Bill</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
              {formatCompactINR(billCount ? (totalRevenue / billCount) : 0)}
            </p>
            <DollarSign size={24} className="text-green-800/40 mb-1" />
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col justify-between bg-green-900/10 border-emerald-500/20">
          <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-2">Best Single Day</p>
          <div className="flex flex-col">
            <p className="text-lg font-bold text-yellow-400">{formatINR(bestSingleDay.revenue)}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Trophy size={10} className="text-yellow-400/80" />
              <p className="text-xs text-green-400/60 font-mono">{bestSingleDay.date || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: VARIETY DEEP DIVE TABLE */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-green-800/40 flex items-center gap-2">
          <PieChart size={16} className="text-emerald-400" />
          <p className="text-xs font-bold text-green-400/80 uppercase tracking-wide">
            {LABELS.varietyDeepDive?.en || 'Variety Details'} / ரக விவர அட்டவணை
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-green-950/40 border-b border-green-800/30 text-xs text-green-500/50 uppercase">
              <tr>
                <th className="p-3 font-medium">Variety</th>
                <th className="p-3 font-medium text-right">KG Sold</th>
                <th className="p-3 font-medium text-right">Avg Rate</th>
                <th className="p-3 font-medium text-right">Revenue</th>
                <th className="p-3 font-medium w-24">Share</th>
                <th className="p-3 font-medium text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-800/10">
              {varietyBreakdown.map((v, i) => (
                <tr key={v.variety} className={`hover:bg-green-900/10 transition-colors ${i === 0 ? 'bg-gradient-to-r from-emerald-900/10 to-transparent' : ''}`}>
                  <td className="p-3">
                    <span className={`font-semibold ${i === 0 ? 'text-emerald-300' : 'text-green-300'}`}>
                      {getVarietyLabel(v.variety)}
                    </span>
                  </td>
                  <td className="p-3 text-right text-green-400/80">{v.kg.toFixed(0)}</td>
                  <td className="p-3 text-right text-green-400">₹{v.avgRate.toFixed(1)}</td>
                  <td className="p-3 text-right text-green-200 font-bold">{formatCompactINR(v.revenue)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-green-500/60 w-8">{v.revenueShare.toFixed(0)}%</span>
                      <div className="h-1.5 flex-1 bg-green-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${v.revenueShare}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    {v.trend !== null ? (
                      <span className={`text-[11px] font-bold ${v.trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {v.trend >= 0 ? '+' : ''}{v.trend.toFixed(1)}%
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {varietyBreakdown.length === 0 && (
                <tr><td colSpan="6" className="text-center p-6 text-green-600/40 text-xs">No variety data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 7: RATE TRACKER (Sparklines) */}
      {rateTracker.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 ml-1">
            <TrendingUp size={16} className="text-emerald-400" />
            <p className="text-xs font-bold text-green-400/80 uppercase tracking-wide">
              {LABELS.rateTracker?.en || 'Rate Tracker'} / விலை கண்காணிப்பு
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {rateTracker.map(rt => {
              const [minLabel, maxLabel] = [Math.floor(rt.lowestRate), Math.ceil(rt.highestRate)];
              return (
                <div key={rt.variety} className="glass-card p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-green-300 truncate w-24" title={getVarietyLabel(rt.variety)}>
                      {BANANA_VARIETIES.find(b => b.value === rt.variety)?.label || rt.variety}
                    </p>
                    <p className={`text-sm font-bold ${rt.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{rt.currentRate.toFixed(1)}
                    </p>
                  </div>
                  <div className="h-10 w-full mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rt.data}>
                        <YAxis domain={['auto', 'auto']} hide />
                        <RechartsTooltip 
                          cursor={{ stroke: '#065f46', strokeWidth: 1, strokeDasharray: '3 3' }} 
                          content={<RateTooltip />} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rate" 
                          stroke={rt.trend === 'up' ? '#34d399' : '#f87171'} 
                          strokeWidth={2} 
                          dot={false}
                          activeDot={{ r: 4, fill: '#10b981', stroke: '#064e3b', strokeWidth: 1 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between text-[10px] text-green-600/50">
                    <span>L: ₹{rt.lowestRate.toFixed(0)}</span>
                    <span>H: ₹{rt.highestRate.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 5: MERCHANT INSIGHTS TABLE */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-green-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-emerald-400" />
            <p className="text-xs font-bold text-green-400/80 uppercase tracking-wide">
              {LABELS.merchantInsights?.en || 'Merchant Insights'} / வணிகர் விவரங்கள்
            </p>
          </div>
          <div className="relative w-full sm:w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600/50" />
            <input 
              type="text" 
              placeholder="Search merchant..." 
              value={merchantSearch}
              onChange={e => setMerchantSearch(e.target.value)}
              className="w-full bg-green-950/30 border border-green-800/50 rounded-lg py-1.5 pl-8 pr-3 text-xs text-green-200 placeholder-green-700 focus:outline-none focus:border-green-600/60 transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-green-950/40 border-b border-green-800/30 text-[11px] text-green-500/50 uppercase">
              <tr>
                <th className="p-3 font-medium">Rank</th>
                <th className="p-3 font-medium">Merchant Name</th>
                <th className="p-3 font-medium text-right">Bills</th>
                <th className="p-3 font-medium text-right">Total Vol</th>
                <th className="p-3 font-medium text-right">Revenue</th>
                <th className="p-3 font-medium text-right hidden lg:table-cell">Avg Order</th>
                <th className="p-3 font-medium text-center">% Paid</th>
                <th className="p-3 font-medium text-right hidden sm:table-cell">Idle Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-800/10">
              {filteredMerchants.map((m, i) => (
                <tr key={m.name} className="hover:bg-green-900/10 transition-colors">
                  <td className="p-3 text-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]' :
                      i === 1 ? 'bg-gray-400/20 text-gray-300' :
                      i === 2 ? 'bg-amber-700/20 text-amber-500' :
                      'bg-transparent text-green-700/60'
                    }`}>
                      {i + 1}
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-green-300 whitespace-nowrap">{m.name}</td>
                  <td className="p-3 text-right text-green-500/60">{m.billCount}</td>
                  <td className="p-3 text-right text-green-400/80">{m.kg.toFixed(0)} kg</td>
                  <td className="p-3 text-right text-emerald-300 font-bold">{formatCompactINR(m.revenue)}</td>
                  <td className="p-3 text-right text-green-400/60 hidden lg:table-cell">{formatCompactINR(m.avgOrderSize)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      m.paymentReliability === 100 ? 'bg-green-500/20 text-green-400' :
                      m.paymentReliability > 50 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {m.paymentReliability.toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3 text-right hidden sm:table-cell">
                    <span className={`font-mono text-xs ${m.daysSinceLastSale > 30 ? 'text-red-400' : 'text-green-500/50'}`}>
                      {m.daysSinceLastSale}d
                    </span>
                  </td>
                </tr>
              ))}
              {filteredMerchants.length === 0 && (
                <tr><td colSpan="8" className="text-center p-6 text-green-600/40 text-xs">No merchants found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXISTING: Payment Status Breakdown */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gauge size={14} className="text-emerald-400/70" />
          <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wide">{LABELS.paymentBreakdown.en}</p>
        </div>
        
        {totalPaymentBills > 0 && (
          <div className="h-3 rounded-full bg-green-900/40 overflow-hidden flex mb-3">
            {paymentBreakdown.paid.count > 0 && (
              <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(paymentBreakdown.paid.count / totalPaymentBills) * 100}%` }}/>
            )}
            {paymentBreakdown.partial.count > 0 && (
              <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${(paymentBreakdown.partial.count / totalPaymentBills) * 100}%` }}/>
            )}
            {paymentBreakdown.pending.count > 0 && (
              <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(paymentBreakdown.pending.count / totalPaymentBills) * 100}%` }}/>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-green-500/10">
            <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-green-400">{paymentBreakdown.paid.count}</p>
            <p className="text-[10px] text-green-500/50">Paid</p>
            <p className="text-[10px] text-green-400/80 font-medium">{formatCompactINR(paymentBreakdown.paid.amount)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-500/10">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-yellow-400">{paymentBreakdown.partial.count}</p>
            <p className="text-[10px] text-yellow-500/50">Partial</p>
            <p className="text-[10px] text-yellow-400/80 font-medium">{formatCompactINR(paymentBreakdown.partial.amount)}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10">
            <div className="w-2 h-2 rounded-full bg-red-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-red-400">{paymentBreakdown.pending.count}</p>
            <p className="text-[10px] text-red-500/50">Pending</p>
            <p className="text-[10px] text-red-400/80 font-medium">{formatCompactINR(paymentBreakdown.pending.amount)}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
