// Format number in Indian currency format (₹1,25,000)
export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  
  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  
  // Indian number system: last 3 digits, then groups of 2
  const parts = absNum.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];
  
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intPart = formatted + ',' + last3;
  }
  
  const result = `₹${intPart}.${decPart}`;
  return isNegative ? `-${result}` : result;
}

// Format number in Indian format without currency symbol
export function formatIndianNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  const absNum = Math.abs(Number(num));
  const parts = absNum.toFixed(2).split('.');
  let intPart = parts[0];
  
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intPart = formatted + ',' + last3;
  }
  
  return `${intPart}.${parts[1]}`;
}

// Format date for display
export function formatDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Format date for input field
export function formatDateForInput(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

// Get today's date formatted for input
export function getTodayForInput() {
  return new Date().toISOString().split('T')[0];
}

// Banana varieties with Tamil names
export const BANANA_VARIETIES = [
  { value: 'nendran', label: 'Nendran', tamil: 'நேந்திரன்' },
  { value: 'robusta', label: 'Robusta', tamil: 'ரோபஸ்டா' },
  { value: 'red_banana', label: 'Red Banana', tamil: 'செவ்வாழை' },
  { value: 'poovan', label: 'Poovan', tamil: 'பூவன்' },
  { value: 'g9', label: 'G9 (Grand Naine)', tamil: 'ஜி9' },
  { value: 'rasthali', label: 'Rasthali', tamil: 'ரஸ்தாலி' },
  { value: 'custom', label: 'Other / மற்றவை', tamil: 'மற்றவை' },
];

// Payment status options
export const PAYMENT_STATUSES = [
  { value: 'paid', label: 'Paid', tamil: 'பணம் செலுத்தியது' },
  { value: 'partial', label: 'Partial', tamil: 'பகுதி பணம்' },
  { value: 'pending', label: 'Pending', tamil: 'நிலுவை' },
];

// Bilingual labels
export const LABELS = {
  newSale: { en: 'New Sale', ta: 'புதிய விற்பனை' },
  dashboard: { en: 'Dashboard', ta: 'டாஷ்போர்ட்' },
  billHistory: { en: 'Bill History', ta: 'பில் வரலாறு' },
  merchantName: { en: 'Merchant Name', ta: 'வணிகர் பெயர்' },
  saleDate: { en: 'Sale Date', ta: 'விற்பனை தேதி' },
  bananaVariety: { en: 'Banana Variety', ta: 'வாழை ரகம்' },
  quantity: { en: 'Quantity (Thars)', ta: 'எண்ணிக்கை (தார்)' },
  totalWeight: { en: 'Total Weight (kg)', ta: 'மொத்த எடை (கிலோ)' },
  grossWeight: { en: 'Gross Weight', ta: 'மொத்த எடை' },
  wastage: { en: 'Wastage (kg)', ta: 'சேதம் (கிலோ)' },
  netWeight: { en: 'Net Weight', ta: 'நிகர எடை' },
  ratePerKg: { en: 'Rate per kg', ta: 'கிலோவுக்கு விலை' },
  totalAmount: { en: 'Total Amount', ta: 'மொத்த தொகை' },
  paymentStatus: { en: 'Payment Status', ta: 'பணம் செலுத்தும் நிலை' },
  amountPaid: { en: 'Amount Paid', ta: 'செலுத்திய தொகை' },
  balanceDue: { en: 'Balance Due', ta: 'நிலுவை தொகை' },
  save: { en: 'Save Bill', ta: 'பில்லைச் சேமி' },
  addRow: { en: 'Add Row', ta: 'வரிசை சேர்' },
  removeRow: { en: 'Remove', ta: 'நீக்கு' },
  exportPDF: { en: 'Export PDF', ta: 'PDF ஏற்றுமதி' },
  totalSales: { en: 'Total Sales', ta: 'மொத்த விற்பனை' },
  totalKgSold: { en: 'Total Kg Sold', ta: 'மொத்த கிலோ விற்பனை' },
  pendingPayments: { en: 'Pending Payments', ta: 'நிலுவை பணம்' },
  billId: { en: 'Bill ID', ta: 'பில் எண்' },
  filterByMerchant: { en: 'Filter by Merchant', ta: 'வணிகர் மூலம் வடிகட்டு' },
  filterByStatus: { en: 'Filter by Status', ta: 'நிலை மூலம் வடிகட்டு' },
  dateRange: { en: 'Date Range', ta: 'தேதி வரம்பு' },
  monthlyRevenue: { en: 'Monthly Revenue', ta: 'மாத வருமானம்' },
  topVarieties: { en: 'Top Varieties', ta: 'முதன்மை ரகங்கள்' },
  topMerchants: { en: 'Top Merchants', ta: 'முதன்மை வணிகர்கள்' },
  paymentBreakdown: { en: 'Payment Breakdown', ta: 'பணம் பிரிப்பு' },
  avgRate: { en: 'Avg Rate/kg', ta: 'சராசரி விலை/கிலோ' },
  dailyTrend: { en: 'Daily Trend', ta: 'தினசரி போக்கு' },
  salesStats: { en: 'Sales Statistics', ta: 'விற்பனை புள்ளிவிவரங்கள்' },
  allMonths: { en: 'All Months', ta: 'அனைத்து மாதங்கள்' },
  monthlySummary: { en: 'Monthly Summary', ta: 'மாத சுருக்கம்' },
  vsLastMonth: { en: 'vs last month', ta: 'கடந்த மாதம் ஒப்பிடுகையில்' },
};

// Generate Bill ID
export function generateBillId(sequence) {
  const year = new Date().getFullYear();
  const seq = String(sequence).padStart(3, '0');
  return `BILL-${year}-${seq}`;
}

// Validate positive number
export function isPositiveNumber(val) {
  const num = Number(val);
  return !isNaN(num) && num > 0;
}

// Validate non-negative number
export function isNonNegativeNumber(val) {
  const num = Number(val);
  return !isNaN(num) && num >= 0;
}

// Get month key from date string: "2026-04-15" → "2026-04"
export function getMonthKey(dateStr) {
  if (!dateStr) return '';
  const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// Format month key for display: "2026-04" → "Apr 2026"
export function formatMonthYear(monthKey) {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

// Format compact number: 145000 → "1.45L"
export function formatCompactINR(amount) {
  if (!amount || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return formatINR(num);
}
