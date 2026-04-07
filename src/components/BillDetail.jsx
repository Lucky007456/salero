import React, { useState } from 'react';
import { 
  ArrowLeft, Download, Edit3, Save, X, Trash2, CheckCircle2
} from 'lucide-react';
import { 
  formatINR, formatDate, BANANA_VARIETIES, PAYMENT_STATUSES, LABELS 
} from '../utils/format';
import { updateBill, deleteBill } from '../services/billService';
import { downloadBillPDF } from '../services/pdfService';
import WhatsAppShareButton from './WhatsAppShareButton';

export default function BillDetail({ bill, onBack, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const variety = BANANA_VARIETIES.find(v => v.value === bill.bananaVariety);
  const varietyLabel = variety 
    ? `${variety.label} (${variety.tamil})` 
    : bill.customVariety || bill.bananaVariety;

  const startEdit = () => {
    setEditData({
      paymentStatus: bill.paymentStatus,
      amountPaid: bill.amountPaid || '',
      ratePerKg: bill.ratePerKg,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditData(null);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const updates = {
        paymentStatus: editData.paymentStatus,
        amountPaid: editData.paymentStatus === 'partial' ? Number(editData.amountPaid) : 
                    editData.paymentStatus === 'paid' ? bill.totalAmount : 0,
      };

      if (editData.ratePerKg !== bill.ratePerKg) {
        updates.ratePerKg = Number(editData.ratePerKg);
        updates.totalAmount = bill.netWeight * Number(editData.ratePerKg);
      }

      await updateBill(bill._docId, updates);
      setEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBill(bill._docId);
      onBack();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'partial': return 'status-partial';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 slide-up pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Bills</span>
        </button>
        <div className="flex items-center gap-2">
          {!editing ? (
            <>
              <button onClick={startEdit} className="btn-secondary !py-2 !px-3 !min-h-[36px] !text-sm">
                <Edit3 size={15} />
                Edit
              </button>
              <button 
                onClick={() => downloadBillPDF(bill)} 
                className="btn-primary !py-2 !px-3 !min-h-[36px] !text-sm"
              >
                <Download size={15} />
                {LABELS.exportPDF.en}
              </button>
            </>
          ) : (
            <>
              <button onClick={cancelEdit} className="btn-secondary !py-2 !px-3 !min-h-[36px] !text-sm">
                <X size={15} />
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={saving} className="btn-primary !py-2 !px-3 !min-h-[36px] !text-sm">
                <Save size={15} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bill ID & Status Header */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-green-500/50 uppercase tracking-wide">{LABELS.billId.en} / {LABELS.billId.ta}</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-300 font-mono">{bill.billId}</p>
          </div>
          <div className="flex items-center gap-3">
            {editing ? (
              <div className="flex gap-2">
                {PAYMENT_STATUSES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setEditData({ ...editData, paymentStatus: s.value })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                      ${editData?.paymentStatus === s.value 
                        ? getStatusClass(s.value)
                        : 'bg-green-900/20 text-green-600/40 border-green-800/20'
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ) : (
              <span className={`${getStatusClass(bill.paymentStatus)} text-base px-4 py-2`}>
                {bill.paymentStatus?.charAt(0).toUpperCase() + bill.paymentStatus?.slice(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="glass-card p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide mb-4">
          Bill Information
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-green-500/50">Merchant / வணிகர்</p>
            <p className="text-green-200 font-medium mt-0.5">{bill.merchantName}</p>
          </div>
          <div>
            <p className="text-xs text-green-500/50">Date / தேதி</p>
            <p className="text-green-200 font-medium mt-0.5">{formatDate(bill.saleDate)}</p>
          </div>
          <div>
            <p className="text-xs text-green-500/50">Variety / ரகம்</p>
            <p className="text-green-200 font-medium mt-0.5">{varietyLabel}</p>
          </div>
        </div>
      </div>

      {/* Weight Table */}
      <div className="glass-card p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide mb-4">
          Weight Details / எடை விவரங்கள்
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-green-800/30">
                <th className="text-left p-3 text-xs font-semibold text-green-500/50">S.No</th>
                <th className="text-center p-3 text-xs font-semibold text-green-500/50">Quantity (Thars)</th>
                <th className="text-right p-3 text-xs font-semibold text-green-500/50">Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {(bill.weightEntries || []).map((entry, i) => (
                <tr key={i} className="border-b border-green-800/10">
                  <td className="p-3 text-green-400/60">{i + 1}</td>
                  <td className="p-3 text-center text-green-200">{entry.quantity}</td>
                  <td className="p-3 text-right text-green-200 font-medium">{Number(entry.weight).toFixed(2)} kg</td>
                </tr>
              ))}
              <tr className="bg-green-900/20">
                <td className="p-3 font-bold text-green-300">Total</td>
                <td className="p-3 text-center font-bold text-green-300">{bill.totalQuantity}</td>
                <td className="p-3 text-right font-bold text-green-300">{(bill.grossWeight || 0).toFixed(2)} kg</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculation Summary */}
      <div className="glass-card p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide mb-4">
          Calculation Summary / கணக்கீட்டு சுருக்கம்
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2">
            <span className="text-green-400/60">{LABELS.grossWeight.en}</span>
            <span className="text-green-200 font-medium">{(bill.grossWeight || 0).toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-green-400/60">{LABELS.wastage.en}</span>
            <span className="text-red-400/80 font-medium">− {(bill.wastage || 0).toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between py-2 border-t border-green-800/30">
            <span className="text-green-300 font-medium">{LABELS.netWeight.en}</span>
            <span className="text-green-200 font-bold">{(bill.netWeight || 0).toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-green-400/60">{LABELS.ratePerKg.en}</span>
            {editing ? (
              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                value={editData?.ratePerKg || ''}
                onChange={(e) => setEditData({ ...editData, ratePerKg: e.target.value })}
                className="input-field w-32 !py-1.5 !min-h-[32px] text-right text-sm"
              />
            ) : (
              <span className="text-green-200 font-medium">{formatINR(bill.ratePerKg)}</span>
            )}
          </div>
          <div className="flex justify-between py-3 border-t border-green-600/30">
            <span className="text-green-300 font-semibold text-lg">{LABELS.totalAmount.en}</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
              {formatINR(editing && editData?.ratePerKg !== bill.ratePerKg 
                ? bill.netWeight * Number(editData.ratePerKg || 0)
                : bill.totalAmount)}
            </span>
          </div>

          {/* Partial payment details */}
          {(bill.paymentStatus === 'partial' || (editing && editData?.paymentStatus === 'partial')) && (
            <div className="pt-2 space-y-2 border-t border-green-800/30 fade-in">
              <div className="flex justify-between py-2">
                <span className="text-green-400/60">{LABELS.amountPaid.en}</span>
                {editing && editData?.paymentStatus === 'partial' ? (
                  <input
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    value={editData?.amountPaid || ''}
                    onChange={(e) => setEditData({ ...editData, amountPaid: e.target.value })}
                    className="input-field w-32 !py-1.5 !min-h-[32px] text-right text-sm"
                  />
                ) : (
                  <span className="text-green-400 font-medium">{formatINR(bill.amountPaid)}</span>
                )}
              </div>
              <div className="flex justify-between py-2">
                <span className="text-yellow-400/60">{LABELS.balanceDue.en}</span>
                <span className="text-yellow-400 font-bold">
                  {formatINR(
                    (editing && editData?.ratePerKg !== bill.ratePerKg
                      ? bill.netWeight * Number(editData.ratePerKg || 0)
                      : bill.totalAmount
                    ) - (editing ? Number(editData?.amountPaid || 0) : (bill.amountPaid || 0))
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Section */}
      <div className="mt-4">
        <WhatsAppShareButton bill={bill} variant="pill" />
      </div>

      {/* Delete */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-400/60">Danger Zone</p>
            <p className="text-xs text-green-600/30">This action cannot be undone</p>
          </div>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary !py-2 !px-3 !min-h-[36px] !text-sm">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger !text-sm flex items-center gap-1.5">
                <Trash2 size={14} />
                Confirm Delete
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="btn-danger !text-sm flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              Delete Bill
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
