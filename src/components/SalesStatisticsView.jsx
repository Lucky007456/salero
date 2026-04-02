import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { getAllBills, getAvailableMonths, getBillsByMonth, getSalesStatistics } from '../services/billService';
import { formatMonthYear, LABELS } from '../utils/format';
import SalesStatistics from './SalesStatistics';

export default function SalesStatisticsView() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState(null);

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

  const availableMonths = useMemo(() => getAvailableMonths(bills), [bills]);
  const monthBills = useMemo(() => getBillsByMonth(bills, selectedMonth), [bills, selectedMonth]);

  const prevMonthBills = useMemo(() => {
    if (!selectedMonth) return [];
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx < 0 || idx >= availableMonths.length - 1) return [];
    return getBillsByMonth(bills, availableMonths[idx + 1]);
  }, [bills, selectedMonth, availableMonths]);

  const salesStats = useMemo(() => {
    if (monthBills.length === 0) return null;
    return getSalesStatistics(monthBills, prevMonthBills);
  }, [monthBills, prevMonthBills]);

  const currentMonthLabel = selectedMonth ? formatMonthYear(selectedMonth) : LABELS.allMonths.en;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw size={32} className="text-green-500 animate-spin mx-auto mb-3" />
          <p className="text-green-400/60">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-up pb-4 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-200">
            {LABELS.salesStats.en}
          </h2>
          <p className="text-xs text-green-500/50">{LABELS.salesStats.ta}</p>
        </div>
        <button onClick={loadData} className="btn-secondary !py-2 !px-3 !min-h-[36px]">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* MONTH SELECTOR */}
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
        </div>
      )}

      {/* Statistics Panel */}
      <div className="pt-2">
        <SalesStatistics 
          stats={salesStats} 
          monthLabel={currentMonthLabel}
        />
      </div>
    </div>
  );
}
