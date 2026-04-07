import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react';
import { getDeletedBills, restoreBill, hardDeleteBill } from '../services/billService';
import { formatINR, BANANA_VARIETIES } from '../utils/format';

export default function RecycleBin() {
  const [deletedBills, setDeletedBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDeletedBills();
      setDeletedBills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestore = async (bill) => {
    if (!window.confirm(`Restore Bill ${bill.billId}?`)) return;
    setActionLoading(true);
    await restoreBill(bill._docId);
    await loadData();
    setActionLoading(false);
  };

  const handleHardDelete = async (bill) => {
    if (!window.confirm(`PERMANENTLY get rid of Bill ${bill.billId}? This cannot be undone.`)) return;
    setActionLoading(true);
    await hardDeleteBill(bill._docId);
    await loadData();
    setActionLoading(false);
  };

  const handleEmptyTrash = async () => {
    if (deletedBills.length === 0) return;
    if (!window.confirm(`Are you absolutely sure you want to permanently delete ALL ${deletedBills.length} bills in the trash?`)) return;
    
    setActionLoading(true);
    for (const b of deletedBills) {
      await hardDeleteBill(b._docId);
    }
    await loadData();
    setActionLoading(false);
  };

  const getVarietyLabel = (value) => {
    const v = BANANA_VARIETIES.find(b => b.value === value);
    return v ? `${v.label} / ${v.tamil}` : value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={32} className="text-red-500/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-up pb-4 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-400 flex items-center gap-2">
            <Trash2 size={24} /> Recycle Bin
          </h2>
          <p className="text-xs text-red-500/50 mt-1">குப்பைத் தொட்டி</p>
        </div>
        
        {deletedBills.length > 0 && (
          <button 
            onClick={handleEmptyTrash} 
            disabled={actionLoading}
            className="btn-danger flex items-center gap-2 !py-2 !px-4"
          >
            <AlertTriangle size={16} />
            Empty Trash
          </button>
        )}
      </div>

      {deletedBills.length === 0 ? (
        <div className="p-12 text-center glass-card border-red-900/30">
          <Trash2 size={48} className="mx-auto mb-3 text-red-800/40" />
          <p className="text-red-500/60 text-lg font-medium">Recycle Bin is Empty</p>
          <p className="text-red-500/40 text-sm mt-1">No deleted bills found.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden border-red-900/30 bg-red-950/10">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-red-900/30 bg-red-950/30">
                  <th className="text-left p-4 text-xs font-semibold text-red-400/60 uppercase">Bill ID</th>
                  <th className="text-left p-4 text-xs font-semibold text-red-400/60 uppercase">Deleted On</th>
                  <th className="text-left p-4 text-xs font-semibold text-red-400/60 uppercase">Merchant</th>
                  <th className="text-right p-4 text-xs font-semibold text-red-400/60 uppercase">Amount</th>
                  <th className="text-center p-4 text-xs font-semibold text-red-400/60 uppercase w-48">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900/20">
                {deletedBills.map((bill) => (
                  <tr key={bill._docId} className="hover:bg-red-950/30 transition-colors">
                    <td className="p-4 text-red-300 font-mono text-sm">{bill.billId}</td>
                    <td className="p-4 text-red-400/70 text-sm">
                      {new Date(bill.deletedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-red-300 text-sm">
                      {bill.merchantName || 'Unknown'} <br/>
                      <span className="text-[10px] text-red-500/50">{getVarietyLabel(bill.bananaVariety)}</span>
                    </td>
                    <td className="p-4 text-red-300 text-right font-medium">{formatINR(bill.totalAmount)}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleRestore(bill)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-xs font-bold flex items-center gap-1"
                          title="Restore Bill"
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                        <button 
                          onClick={() => handleHardDelete(bill)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg text-red-500/50 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          title="Permanently Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-red-900/30">
            {deletedBills.map((bill) => (
              <div key={bill._docId} className="p-4 hover:bg-red-950/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 font-mono text-sm">{bill.billId}</span>
                  <span className="text-red-300 font-bold">{formatINR(bill.totalAmount)}</span>
                </div>
                <div className="mb-4">
                  <p className="text-red-300 text-sm">{bill.merchantName || 'Unknown'}</p>
                  <p className="text-[10px] text-red-500/60 mb-1">{getVarietyLabel(bill.bananaVariety)}</p>
                  <p className="text-red-500/50 text-xs">
                    Deleted on: {new Date(bill.deletedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 border-t border-red-900/30 pt-3 mt-2">
                  <button 
                    onClick={() => handleRestore(bill)}
                    disabled={actionLoading}
                    className="flex-1 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} /> Restore
                  </button>
                  <button 
                    onClick={() => handleHardDelete(bill)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
