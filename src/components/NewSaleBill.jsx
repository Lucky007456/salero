import React, { useState, useMemo, useCallback } from 'react';
import { 
  Save, Plus, Trash2, Calculator, CheckCircle2, AlertCircle,
  ChevronDown, Package
} from 'lucide-react';
import { 
  BANANA_VARIETIES, PAYMENT_STATUSES, LABELS,
  formatINR, getTodayForInput, isPositiveNumber, isNonNegativeNumber 
} from '../utils/format';
import { saveBill } from '../services/billService';

const INITIAL_WEIGHT_ROW = { quantity: '', weight: '' };

export default function NewSaleBill({ onBillSaved, editBill = null }) {
  const [merchantName, setMerchantName] = useState(editBill?.merchantName || '');
  const [saleDate, setSaleDate] = useState(editBill?.saleDate || getTodayForInput());
  const [bananaVariety, setBananaVariety] = useState(editBill?.bananaVariety || '');
  const [customVariety, setCustomVariety] = useState(editBill?.customVariety || '');
  const [weightEntries, setWeightEntries] = useState(
    editBill?.weightEntries || [{ ...INITIAL_WEIGHT_ROW }]
  );
  const [wastage, setWastage] = useState(editBill?.wastage ?? '');
  const [ratePerKg, setRatePerKg] = useState(editBill?.ratePerKg ?? '');
  const [paymentStatus, setPaymentStatus] = useState(editBill?.paymentStatus || 'pending');
  const [amountPaid, setAmountPaid] = useState(editBill?.amountPaid ?? '');
  const [saving, setSaving] = useState(false);
  const [savedBill, setSavedBill] = useState(null);
  const [errors, setErrors] = useState({});

  // ---- CALCULATIONS ----
  const totalQuantity = useMemo(() => {
    return weightEntries.reduce((sum, e) => sum + (Number(e.quantity) || 0), 0);
  }, [weightEntries]);

  const grossWeight = useMemo(() => {
    return weightEntries.reduce((sum, e) => sum + (Number(e.weight) || 0), 0);
  }, [weightEntries]);

  const netWeight = useMemo(() => {
    const w = Number(wastage) || 0;
    return Math.max(0, grossWeight - w);
  }, [grossWeight, wastage]);

  const totalAmount = useMemo(() => {
    const rate = Number(ratePerKg) || 0;
    return netWeight * rate;
  }, [netWeight, ratePerKg]);

  const balanceDue = useMemo(() => {
    if (paymentStatus !== 'partial') return 0;
    return totalAmount - (Number(amountPaid) || 0);
  }, [totalAmount, amountPaid, paymentStatus]);

  // ---- WEIGHT ENTRY HANDLERS ----
  const addRow = useCallback(() => {
    setWeightEntries(prev => [...prev, { ...INITIAL_WEIGHT_ROW }]);
  }, []);

  const removeRow = useCallback((index) => {
    setWeightEntries(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateEntry = useCallback((index, field, value) => {
    setWeightEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const handleWeightKeyDown = useCallback((index, e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      
      // If it's the last row, add a new one (only if current has some data)
      if (index === weightEntries.length - 1) {
        if (weightEntries[index].quantity || weightEntries[index].weight) {
          addRow();
          // Focus the next row's quantity input after it renders
          setTimeout(() => {
            const nextInput = document.getElementById(`qty-${index + 1}`);
            if (nextInput) nextInput.focus();
          }, 50);
        }
      } else {
        // Not the last row, just jump to the next one
        const nextInput = document.getElementById(`qty-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  }, [weightEntries, addRow]);

  // ---- VALIDATION ----
  const validate = () => {
    const errs = {};
    
    if (!merchantName.trim()) errs.merchantName = 'Merchant name is required';
    if (!saleDate) errs.saleDate = 'Sale date is required';
    if (!bananaVariety) errs.bananaVariety = 'Select a banana variety';
    if (bananaVariety === 'custom' && !customVariety.trim()) errs.customVariety = 'Enter custom variety name';
    
    const hasValidEntry = weightEntries.some(e => 
      isPositiveNumber(e.quantity) && isPositiveNumber(e.weight)
    );
    if (!hasValidEntry) errs.weightEntries = 'Add at least one valid weight entry';
    
    weightEntries.forEach((e, i) => {
      if (e.quantity || e.weight) {
        if (!isPositiveNumber(e.quantity)) errs[`qty_${i}`] = 'Invalid';
        if (!isPositiveNumber(e.weight)) errs[`wt_${i}`] = 'Invalid';
      }
    });

    if (wastage !== '' && !isNonNegativeNumber(wastage)) {
      errs.wastage = 'Must be a non-negative number';
    }
    if (Number(wastage) > grossWeight) {
      errs.wastage = 'Wastage cannot exceed gross weight';
    }
    
    if (!isPositiveNumber(ratePerKg)) errs.ratePerKg = 'Rate must be greater than 0';
    
    if (paymentStatus === 'partial') {
      if (!isPositiveNumber(amountPaid)) errs.amountPaid = 'Enter amount paid';
      if (Number(amountPaid) > totalAmount) errs.amountPaid = 'Cannot exceed total amount';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ---- SAVE ----
  const handleSave = async () => {
    if (!validate()) return;
    
    setSaving(true);
    try {
      const billData = {
        merchantName: merchantName.trim(),
        saleDate,
        bananaVariety,
        customVariety: bananaVariety === 'custom' ? customVariety.trim() : '',
        weightEntries: weightEntries.filter(e => e.quantity && e.weight),
        totalQuantity,
        grossWeight,
        wastage: Number(wastage) || 0,
        netWeight,
        ratePerKg: Number(ratePerKg),
        totalAmount,
        paymentStatus,
        amountPaid: paymentStatus === 'partial' ? Number(amountPaid) : 
                    paymentStatus === 'paid' ? totalAmount : 0,
      };

      const result = await saveBill(billData);
      setSavedBill(result);
      if (onBillSaved) onBillSaved(result);
    } catch (err) {
      console.error('Error saving bill:', err);
      setErrors({ save: 'Failed to save bill. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleNewBill = () => {
    setMerchantName('');
    setSaleDate(getTodayForInput());
    setBananaVariety('');
    setCustomVariety('');
    setWeightEntries([{ ...INITIAL_WEIGHT_ROW }]);
    setWastage('');
    setRatePerKg('');
    setPaymentStatus('pending');
    setAmountPaid('');
    setSavedBill(null);
    setErrors({});
  };

  // ---- SUCCESS VIEW ----
  if (savedBill) {
    return (
      <div className="max-w-lg mx-auto slide-up">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-green-200 mb-2">Bill Saved!</h2>
          <p className="text-green-400/60 mb-1">பில் சேமிக்கப்பட்டது!</p>
          
          <div className="mt-6 p-4 rounded-xl bg-green-900/30 border border-green-700/20">
            <p className="text-sm text-green-400/60">Bill ID</p>
            <p className="text-2xl font-bold text-green-300 font-mono">{savedBill.billId}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-green-900/20">
              <p className="text-green-500/50">Merchant</p>
              <p className="text-green-200 font-medium">{savedBill.merchantName}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-900/20">
              <p className="text-green-500/50">Amount</p>
              <p className="text-green-200 font-medium">{formatINR(savedBill.totalAmount)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={handleNewBill} className="btn-primary flex-1">
              <Plus size={20} />
              New Bill
            </button>
            <button 
              onClick={() => onBillSaved && onBillSaved(savedBill, 'view')} 
              className="btn-secondary flex-1"
            >
              View in History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- FORM VIEW ----
  return (
    <div className="max-w-3xl mx-auto space-y-6 slide-up pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 
                      flex items-center justify-center">
          <Package size={22} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-200">
            {LABELS.newSale.en}
          </h2>
          <p className="text-xs text-green-500/50">{LABELS.newSale.ta}</p>
        </div>
      </div>

      {/* Save Error */}
      {errors.save && (
        <div className="p-3 rounded-xl bg-red-900/30 border border-red-700/30 text-red-300 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {errors.save}
        </div>
      )}

      {/* Basic Info */}
      <div className="glass-card p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">
              {LABELS.merchantName.en}
              <span className="label-tamil">{LABELS.merchantName.ta}</span>
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Enter merchant name"
              className={`input-field ${errors.merchantName ? 'border-red-500/50' : ''}`}
              id="merchant-name"
            />
            {errors.merchantName && <p className="text-red-400 text-xs mt-1">{errors.merchantName}</p>}
          </div>

          <div>
            <label className="label-text">
              {LABELS.saleDate.en}
              <span className="label-tamil">{LABELS.saleDate.ta}</span>
            </label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className={`input-field ${errors.saleDate ? 'border-red-500/50' : ''}`}
              id="sale-date"
            />
            {errors.saleDate && <p className="text-red-400 text-xs mt-1">{errors.saleDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">
              {LABELS.bananaVariety.en}
              <span className="label-tamil">{LABELS.bananaVariety.ta}</span>
            </label>
            <div className="relative">
              <select
                value={bananaVariety}
                onChange={(e) => setBananaVariety(e.target.value)}
                className={`select-field ${errors.bananaVariety ? 'border-red-500/50' : ''}`}
                id="banana-variety"
              >
                <option value="">Select variety...</option>
                {BANANA_VARIETIES.map(v => (
                  <option key={v.value} value={v.value}>
                    {v.label} — {v.tamil}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 
                text-green-600/50 pointer-events-none" />
            </div>
            {errors.bananaVariety && <p className="text-red-400 text-xs mt-1">{errors.bananaVariety}</p>}
          </div>

          {bananaVariety === 'custom' && (
            <div>
              <label className="label-text">Custom Variety Name</label>
              <input
                type="text"
                value={customVariety}
                onChange={(e) => setCustomVariety(e.target.value)}
                placeholder="Enter variety name"
                className={`input-field ${errors.customVariety ? 'border-red-500/50' : ''}`}
              />
              {errors.customVariety && <p className="text-red-400 text-xs mt-1">{errors.customVariety}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Weight Entry Table */}
      <div className="glass-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide">
            Weight Entry / எடை பதிவு
          </h3>
          <button onClick={addRow} className="btn-secondary !py-2 !px-4 !text-sm !min-h-[36px]">
            <Plus size={16} />
            {LABELS.addRow.en}
          </button>
        </div>

        {errors.weightEntries && (
          <p className="text-red-400 text-xs">{errors.weightEntries}</p>
        )}

        <div className="space-y-3">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] gap-3 px-1">
            <span className="text-xs font-medium text-green-500/50 uppercase">
              {LABELS.quantity.en}
            </span>
            <span className="text-xs font-medium text-green-500/50 uppercase">
              {LABELS.totalWeight.en}
            </span>
            <span className="w-10" />
          </div>

          {/* Rows */}
          {weightEntries.map((entry, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start fade-in">
              <div>
                <input
                  type="number"
                  value={entry.quantity}
                  onChange={(e) => updateEntry(index, 'quantity', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const nextInput = document.getElementById(`wt-${index}`);
                      if (nextInput) nextInput.focus();
                    }
                  }}
                  placeholder="Thars"
                  className={`input-field text-center ${errors[`qty_${index}`] ? 'border-red-500/50' : ''}`}
                  min="0"
                  step="1"
                  id={`qty-${index}`}
                />
                <span className="sm:hidden text-[10px] text-green-600/40 mt-0.5 block text-center">Thars</span>
              </div>
              <div>
                <input
                  type="number"
                  value={entry.weight}
                  onChange={(e) => updateEntry(index, 'weight', e.target.value)}
                  onKeyDown={(e) => handleWeightKeyDown(index, e)}
                  placeholder="kg"
                  className={`input-field text-center ${errors[`wt_${index}`] ? 'border-red-500/50' : ''}`}
                  min="0"
                  step="0.01"
                  id={`wt-${index}`}
                />
                <span className="sm:hidden text-[10px] text-green-600/40 mt-0.5 block text-center">kg</span>
              </div>
              <button
                onClick={() => removeRow(index)}
                disabled={weightEntries.length <= 1}
                className="p-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-900/20
                         transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                title="Remove row"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-green-800/30 grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-green-900/30">
            <p className="text-xs text-green-500/50 mb-0.5">Total Quantity / மொத்த எண்ணிக்கை</p>
            <p className="text-xl font-bold text-green-300">{totalQuantity} <span className="text-sm font-normal text-green-500/50">thars</span></p>
          </div>
          <div className="p-3 rounded-xl bg-green-900/30">
            <p className="text-xs text-green-500/50 mb-0.5">{LABELS.grossWeight.en} / {LABELS.grossWeight.ta}</p>
            <p className="text-xl font-bold text-green-300">{grossWeight.toFixed(2)} <span className="text-sm font-normal text-green-500/50">kg</span></p>
          </div>
        </div>
      </div>

      {/* Wastage, Rate & Calculation */}
      <div className="glass-card p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide">
          Calculation / கணக்கீடு
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">
              {LABELS.wastage.en}
              <span className="label-tamil">{LABELS.wastage.ta}</span>
            </label>
            <input
              type="number"
              value={wastage}
              onChange={(e) => setWastage(e.target.value)}
              placeholder="0.00"
              className={`input-field ${errors.wastage ? 'border-red-500/50' : ''}`}
              min="0"
              step="0.01"
              id="wastage"
            />
            {errors.wastage && <p className="text-red-400 text-xs mt-1">{errors.wastage}</p>}
          </div>

          <div>
            <label className="label-text">
              {LABELS.ratePerKg.en} (₹)
              <span className="label-tamil">{LABELS.ratePerKg.ta}</span>
            </label>
            <input
              type="number"
              value={ratePerKg}
              onChange={(e) => setRatePerKg(e.target.value)}
              placeholder="0.00"
              className={`input-field ${errors.ratePerKg ? 'border-red-500/50' : ''}`}
              min="0"
              step="0.01"
              id="rate-per-kg"
            />
            {errors.ratePerKg && <p className="text-red-400 text-xs mt-1">{errors.ratePerKg}</p>}
          </div>
        </div>

        {/* Auto-calculated fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-green-900/30 border border-green-700/20">
            <p className="text-xs text-green-500/50 mb-1">{LABELS.netWeight.en}</p>
            <p className="text-xs text-green-600/30 mb-1">{LABELS.netWeight.ta}</p>
            <p className="text-2xl font-bold text-green-300">
              {netWeight.toFixed(2)} <span className="text-sm font-normal text-green-500/50">kg</span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-green-900/30 border border-green-700/20">
            <p className="text-xs text-green-500/50 mb-1">{LABELS.ratePerKg.en}</p>
            <p className="text-xs text-green-600/30 mb-1">{LABELS.ratePerKg.ta}</p>
            <p className="text-2xl font-bold text-green-300">
              {formatINR(Number(ratePerKg) || 0)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-800/40 to-emerald-900/40 
                        border border-green-600/30 animate-pulse-glow">
            <p className="text-xs text-green-400/60 mb-1">{LABELS.totalAmount.en}</p>
            <p className="text-xs text-green-500/40 mb-1">{LABELS.totalAmount.ta}</p>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 
                        bg-clip-text text-transparent">
              {formatINR(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="glass-card p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide">
          {LABELS.paymentStatus.en} / {LABELS.paymentStatus.ta}
        </h3>

        <div className="flex flex-wrap gap-3">
          {PAYMENT_STATUSES.map(status => (
            <button
              key={status.value}
              onClick={() => setPaymentStatus(status.value)}
              className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 min-w-[100px]
                text-center border ${
                paymentStatus === status.value
                  ? status.value === 'paid'
                    ? 'bg-green-500/20 text-green-400 border-green-500/40 shadow-glow'
                    : status.value === 'partial'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                    : 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-green-900/20 text-green-500/40 border-green-800/20 hover:border-green-700/30'
              }`}
              id={`status-${status.value}`}
            >
              <span className="block text-sm">{status.label}</span>
              <span className="block text-[10px] opacity-60">{status.tamil}</span>
            </button>
          ))}
        </div>

        {paymentStatus === 'partial' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 fade-in">
            <div>
              <label className="label-text">
                {LABELS.amountPaid.en} (₹)
                <span className="label-tamil">{LABELS.amountPaid.ta}</span>
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
                className={`input-field ${errors.amountPaid ? 'border-red-500/50' : ''}`}
                min="0"
                step="0.01"
                id="amount-paid"
              />
              {errors.amountPaid && <p className="text-red-400 text-xs mt-1">{errors.amountPaid}</p>}
            </div>
            <div className="p-4 rounded-xl bg-yellow-900/20 border border-yellow-700/20">
              <p className="text-xs text-yellow-500/50 mb-1">{LABELS.balanceDue.en}</p>
              <p className="text-xs text-yellow-600/30 mb-1">{LABELS.balanceDue.ta}</p>
              <p className="text-2xl font-bold text-yellow-400">
                {formatINR(balanceDue)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bill Summary Panel */}
      <div className="glass-card p-5 sm:p-6 space-y-3 border-green-600/30">
        <h3 className="text-sm font-semibold text-green-400/70 uppercase tracking-wide flex items-center gap-2">
          <Calculator size={16} />
          Bill Summary / பில் சுருக்கம்
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1.5">
            <span className="text-green-400/60">Merchant</span>
            <span className="text-green-200 font-medium">{merchantName || '—'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-green-400/60">Variety</span>
            <span className="text-green-200 font-medium">
              {bananaVariety === 'custom' 
                ? customVariety || '—' 
                : BANANA_VARIETIES.find(v => v.value === bananaVariety)?.label || '—'}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-green-400/60">Total Quantity</span>
            <span className="text-green-200 font-medium">{totalQuantity} thars</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-green-400/60">Gross Weight</span>
            <span className="text-green-200 font-medium">{grossWeight.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-green-400/60">Wastage</span>
            <span className="text-red-400/80 font-medium">− {(Number(wastage) || 0).toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between py-1.5 border-t border-green-800/30">
            <span className="text-green-400/60">Net Weight</span>
            <span className="text-green-200 font-bold">{netWeight.toFixed(2)} kg</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-green-400/60">Rate per kg</span>
            <span className="text-green-200 font-medium">{formatINR(Number(ratePerKg) || 0)}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-green-600/30 mt-1">
            <span className="text-green-300 font-semibold text-base">Total Amount</span>
            <span className="text-green-200 font-bold text-lg">{formatINR(totalAmount)}</span>
          </div>
          {paymentStatus === 'partial' && (
            <>
              <div className="flex justify-between py-1.5">
                <span className="text-green-400/60">Amount Paid</span>
                <span className="text-green-400 font-medium">{formatINR(Number(amountPaid) || 0)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-yellow-400/60">Balance Due</span>
                <span className="text-yellow-400 font-bold">{formatINR(balanceDue)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={handleSave} 
        disabled={saving}
        className="btn-primary w-full !py-4 !text-lg"
        id="save-bill"
      >
        <Save size={22} />
        {saving ? 'Saving... / சேமிக்கிறது...' : `${LABELS.save.en} / ${LABELS.save.ta}`}
      </button>
    </div>
  );
}
