import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  getDocs, getDoc, query, orderBy, where, limit,
  Timestamp, serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { generateBillId, getMonthKey } from '../utils/format';

const BILLS_COLLECTION = 'bills';
const COUNTERS_COLLECTION = 'counters';

// ---- LOCAL STORAGE FALLBACK (when Firebase is not configured) ----

function getLocalBills() {
  const data = localStorage.getItem('banana_bills');
  return data ? JSON.parse(data) : [];
}

function saveLocalBills(bills) {
  localStorage.setItem('banana_bills', JSON.stringify(bills));
}

function getLocalCounter() {
  const count = localStorage.getItem('banana_bill_counter');
  return count ? parseInt(count, 10) : 0;
}

function setLocalCounter(val) {
  localStorage.setItem('banana_bill_counter', String(val));
}

// ---- BILL CRUD OPERATIONS ----

// Get next Bill ID
async function getNextBillId() {
  if (isFirebaseConfigured) {
    try {
      const counterRef = doc(db, COUNTERS_COLLECTION, 'billCounter');
      const counterSnap = await getDoc(counterRef);
      
      let nextSeq = 1;
      if (counterSnap.exists()) {
        nextSeq = (counterSnap.data().current || 0) + 1;
        await updateDoc(counterRef, { current: nextSeq });
      } else {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(counterRef, { current: 1 });
      }
      return generateBillId(nextSeq);
    } catch (err) {
      console.error('Firebase counter error, falling back to local:', err);
    }
  }
  
  // Local fallback
  const next = getLocalCounter() + 1;
  setLocalCounter(next);
  return generateBillId(next);
}

// Save a new bill
export async function saveBill(billData) {
  const billId = await getNextBillId();
  
  const bill = {
    ...billData,
    billId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, BILLS_COLLECTION), bill);
      return { ...bill, _docId: docRef.id };
    } catch (err) {
      console.error('Firebase save error, falling back to local:', err);
    }
  }
  
  // Local fallback
  const localId = 'local_' + Date.now();
  bill._docId = localId;
  const bills = getLocalBills();
  bills.push(bill);
  saveLocalBills(bills);
  return bill;
}

// Get all bills
export async function getAllBills() {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, BILLS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), _docId: doc.id }));
    } catch (err) {
      console.error('Firebase fetch error, falling back to local:', err);
    }
  }
  
  // Local fallback
  return getLocalBills().sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

// Get a single bill by docId
export async function getBillById(docId) {
  if (isFirebaseConfigured) {
    try {
      const docSnap = await getDoc(doc(db, BILLS_COLLECTION, docId));
      if (docSnap.exists()) {
        return { ...docSnap.data(), _docId: docSnap.id };
      }
      return null;
    } catch (err) {
      console.error('Firebase get error, falling back to local:', err);
    }
  }
  
  // Local fallback
  const bills = getLocalBills();
  return bills.find(b => b._docId === docId) || null;
}

// Update a bill
export async function updateBill(docId, updates) {
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, BILLS_COLLECTION, docId), updatedData);
      return true;
    } catch (err) {
      console.error('Firebase update error, falling back to local:', err);
    }
  }
  
  // Local fallback
  const bills = getLocalBills();
  const idx = bills.findIndex(b => b._docId === docId);
  if (idx !== -1) {
    bills[idx] = { ...bills[idx], ...updatedData };
    saveLocalBills(bills);
    return true;
  }
  return false;
}

// Delete a bill
export async function deleteBill(docId) {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, BILLS_COLLECTION, docId));
      return true;
    } catch (err) {
      console.error('Firebase delete error, falling back to local:', err);
    }
  }
  
  // Local fallback
  const bills = getLocalBills();
  const filtered = bills.filter(b => b._docId !== docId);
  saveLocalBills(filtered);
  return true;
}

// Get dashboard summary for current month
export async function getDashboardSummary(bills = null) {
  if (!bills) {
    bills = await getAllBills();
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthBills = bills.filter(b => new Date(b.saleDate) >= startOfMonth);
  
  const totalSalesThisMonth = monthBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalKgSold = monthBills.reduce((sum, b) => sum + (b.netWeight || 0), 0);
  const pendingPayments = bills
    .filter(b => b.paymentStatus === 'pending' || b.paymentStatus === 'partial')
    .reduce((sum, b) => {
      if (b.paymentStatus === 'pending') return sum + (b.totalAmount || 0);
      if (b.paymentStatus === 'partial') return sum + ((b.totalAmount || 0) - (b.amountPaid || 0));
      return sum;
    }, 0);

  const totalBillsThisMonth = monthBills.length;
  
  return {
    totalSalesThisMonth,
    totalKgSold,
    pendingPayments,
    totalBillsThisMonth,
    totalBills: bills.length,
  };
}

// Get sorted list of months that have bills
export function getAvailableMonths(bills) {
  const monthSet = new Set();
  bills.forEach(b => {
    if (b.saleDate) monthSet.add(getMonthKey(b.saleDate));
  });
  return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
}

// Get bills filtered by month key ("YYYY-MM") or all if null
export function getBillsByMonth(bills, monthKey) {
  if (!monthKey) return bills;
  return bills.filter(b => getMonthKey(b.saleDate) === monthKey);
}

// Helper to get number of days in a given YYYY-MM
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// Get comprehensive sales statistics for a set of bills
export function getSalesStatistics(monthBills, allBills = [], selectedMonthKey = null) {
  const now = new Date();
  
  // 1. Calculate previous month bills dynamically from allBills if available
  let prevMonthBills = [];
  if (selectedMonthKey && allBills.length > 0) {
    const [y, m] = selectedMonthKey.split('-').map(Number);
    let prevM = m - 1;
    let prevY = y;
    if (prevM === 0) { prevM = 12; prevY = y - 1; }
    const prevKey = `${prevY}-${String(prevM).padStart(2, '0')}`;
    prevMonthBills = getBillsByMonth(allBills, prevKey);
  }

  // Revenue
  const totalRevenue = monthBills.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const prevRevenue = prevMonthBills.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : null;

  // Total kg
  const totalKg = monthBills.reduce((s, b) => s + (b.netWeight || 0), 0);
  const prevKg = prevMonthBills.reduce((s, b) => s + (b.netWeight || 0), 0);
  const kgChange = prevKg > 0 ? ((totalKg - prevKg) / prevKg) * 100 : null;

  // Avg rate per kg
  const avgRatePerKg = totalKg > 0 ? totalRevenue / totalKg : 0;
  const prevAvgRate = prevKg > 0 ? prevRevenue / prevKg : 0;

  // Payment breakdown & Collection Efficiency
  const paymentBreakdown = { paid: { count: 0, amount: 0 }, partial: { count: 0, amount: 0 }, pending: { count: 0, amount: 0 } };
  let totalCollected = 0;
  monthBills.forEach(b => {
    const status = b.paymentStatus || 'pending';
    if (paymentBreakdown[status]) {
      paymentBreakdown[status].count += 1;
      paymentBreakdown[status].amount += (b.totalAmount || 0);
    }
    if (status === 'paid') totalCollected += (b.totalAmount || 0);
    if (status === 'partial') totalCollected += (b.amountPaid || 0);
  });
  const collectionEfficiency = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

  // Variety breakdown (add prev month data for trend)
  const prevVarietyMap = {};
  prevMonthBills.forEach(b => {
    const v = b.bananaVariety || 'unknown';
    if (!prevVarietyMap[v]) prevVarietyMap[v] = { revenue: 0 };
    prevVarietyMap[v].revenue += (b.totalAmount || 0);
  });

  const varietyMap = {};
  monthBills.forEach(b => {
    const v = b.bananaVariety || 'unknown';
    if (!varietyMap[v]) varietyMap[v] = { variety: v, kg: 0, revenue: 0, count: 0, avgRate: 0 };
    varietyMap[v].kg += (b.netWeight || 0);
    varietyMap[v].revenue += (b.totalAmount || 0);
    varietyMap[v].count += 1;
  });
  
  const varietyBreakdown = Object.values(varietyMap).map(v => {
    v.avgRate = v.kg > 0 ? v.revenue / v.kg : 0;
    v.revenueShare = totalRevenue > 0 ? (v.revenue / totalRevenue) * 100 : 0;
    const prevRev = prevVarietyMap[v.variety]?.revenue || 0;
    v.trend = prevRev > 0 ? ((v.revenue - prevRev) / prevRev) * 100 : null;
    return v;
  }).sort((a, b) => b.revenue - a.revenue);

  // Merchant Insights (Full Table)
  const merchantMap = {};
  monthBills.forEach(b => {
    const name = b.merchantName || 'Unknown';
    if (!merchantMap[name]) merchantMap[name] = { 
      name, revenue: 0, kg: 0, billCount: 0, paidBills: 0, lastSaleDate: '' 
    };
    merchantMap[name].revenue += (b.totalAmount || 0);
    merchantMap[name].kg += (b.netWeight || 0);
    merchantMap[name].billCount += 1;
    if (b.paymentStatus === 'paid') merchantMap[name].paidBills += 1;
    
    if (!merchantMap[name].lastSaleDate || b.saleDate > merchantMap[name].lastSaleDate) {
      merchantMap[name].lastSaleDate = b.saleDate;
    }
  });

  const merchantLeaderboard = Object.values(merchantMap).map(m => {
    m.avgOrderSize = m.billCount > 0 ? m.revenue / m.billCount : 0;
    m.paymentReliability = m.billCount > 0 ? (m.paidBills / m.billCount) * 100 : 0;
    const lastDate = new Date(m.lastSaleDate);
    m.daysSinceLastSale = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    return m;
  }).sort((a, b) => b.revenue - a.revenue);

  // Daily trend with padding (Gross, Net, Wastage)
  const dailyMap = {};
  monthBills.forEach(b => {
    const day = b.saleDate || '';
    if (!dailyMap[day]) {
      dailyMap[day] = { date: day, revenue: 0, kg: 0, grossWeight: 0, wastage: 0, count: 0 };
    }
    dailyMap[day].revenue += (b.totalAmount || 0);
    dailyMap[day].kg += (b.netWeight || 0);
    dailyMap[day].grossWeight += (b.grossWeight || 0);
    dailyMap[day].wastage += (b.wastage || 0);
    dailyMap[day].count += 1;
  });

  let dailyTrend = [];
  if (selectedMonthKey) {
    const [y, m] = selectedMonthKey.split('-').map(Number);
    const daysInMonth = getDaysInMonth(y, m);
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      if (dailyMap[dStr]) {
        dailyTrend.push(dailyMap[dStr]);
      } else {
        dailyTrend.push({ date: dStr, revenue: 0, kg: 0, grossWeight: 0, wastage: 0, count: 0 });
      }
    }
  } else {
    dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Best Single Day (all bills historically unless just month preferred, let's use allBills)
  let bestSingleDay = { date: null, revenue: 0 };
  if (allBills.length > 0) {
    const allDailyMap = {};
    allBills.forEach(b => {
      const day = b.saleDate;
      if (!day) return;
      if (!allDailyMap[day]) allDailyMap[day] = 0;
      allDailyMap[day] += (b.totalAmount || 0);
    });
    Object.entries(allDailyMap).forEach(([date, rev]) => {
      if (rev > bestSingleDay.revenue) {
        bestSingleDay = { date, revenue: rev };
      }
    });
  }

  // Month Over Month Comparison (Last 6 Months from allBills)
  const monthOverMonth = [];
  if (allBills.length > 0) {
    const momMap = {};
    allBills.forEach(b => {
      const mk = getMonthKey(b.saleDate);
      if (!mk) return;
      if (!momMap[mk]) momMap[mk] = { monthKey: mk, revenue: 0, kg: 0 };
      momMap[mk].revenue += (b.totalAmount || 0);
      momMap[mk].kg += (b.netWeight || 0);
    });
    
    // Get last 6 active months or calendar months
    const available = Object.keys(momMap).sort().reverse().slice(0, 6).reverse();
    available.forEach(mk => {
      const [year, m] = mk.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const shortName = `${months[parseInt(m, 10) - 1]} '${year.slice(2)}`;
      monthOverMonth.push({
        name: shortName,
        monthKey: mk,
        revenue: momMap[mk].revenue,
        kg: momMap[mk].kg
      });
    });
  }

  // Rate Tracker (Sparklines per Variety)
  const rateTracker = [];
  if (allBills.length > 0) {
    const rateGroup = {};
    // sort chronological oldest to newest for sparkline
    const chronological = [...allBills].sort((a, b) => a.saleDate.localeCompare(b.saleDate));
    
    chronological.forEach(b => {
      if (!b.netWeight || !b.totalAmount) return;
      const v = b.bananaVariety || 'unknown';
      if (!rateGroup[v]) rateGroup[v] = [];
      const rate = b.totalAmount / b.netWeight;
      rateGroup[v].push({ rate, date: b.saleDate });
    });

    Object.entries(rateGroup).forEach(([v, rates]) => {
      if (rates.length === 0) return;
      // keep last 10
      const last10 = rates.slice(-10);
      const values = rates.map(r => r.rate);
      const high = Math.max(...values);
      const low = Math.min(...values);
      const currentRate = values[values.length - 1];
      const startRate = last10[0].rate;
      const trend = currentRate >= startRate ? 'up' : 'down';
      
      rateTracker.push({
        variety: v,
        currentRate,
        highestRate: high,
        lowestRate: low,
        trend,
        data: last10
      });
    });
    // Sort rate tracker by variety breakdown order
    rateTracker.sort((a, b) => {
      const aRev = varietyMap[a.variety]?.revenue || 0;
      const bRev = varietyMap[b.variety]?.revenue || 0;
      return bRev - aRev;
    });
  }

  return {
    totalRevenue,
    prevRevenue,
    revenueChange,
    totalKg,
    prevKg,
    kgChange,
    avgRatePerKg,
    prevAvgRate,
    billCount: monthBills.length,
    varietyBreakdown,
    merchantLeaderboard,
    paymentBreakdown,
    collectionEfficiency,
    dailyTrend,
    bestSingleDay,
    monthOverMonth,
    rateTracker
  };
}
