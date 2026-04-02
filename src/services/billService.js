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

// Get comprehensive sales statistics for a set of bills
export function getSalesStatistics(monthBills, prevMonthBills = []) {
  // Revenue
  const totalRevenue = monthBills.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const prevRevenue = prevMonthBills.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : null;

  // Total kg
  const totalKg = monthBills.reduce((s, b) => s + (b.netWeight || 0), 0);
  const prevKg = prevMonthBills.reduce((s, b) => s + (b.netWeight || 0), 0);

  // Avg rate per kg
  const avgRatePerKg = totalKg > 0 ? totalRevenue / totalKg : 0;
  const prevAvgRate = prevKg > 0 ? prevRevenue / prevKg : 0;

  // Variety breakdown
  const varietyMap = {};
  monthBills.forEach(b => {
    const v = b.bananaVariety || 'unknown';
    if (!varietyMap[v]) varietyMap[v] = { variety: v, kg: 0, revenue: 0, count: 0 };
    varietyMap[v].kg += (b.netWeight || 0);
    varietyMap[v].revenue += (b.totalAmount || 0);
    varietyMap[v].count += 1;
  });
  const varietyBreakdown = Object.values(varietyMap).sort((a, b) => b.kg - a.kg);

  // Merchant leaderboard
  const merchantMap = {};
  monthBills.forEach(b => {
    const name = b.merchantName || 'Unknown';
    if (!merchantMap[name]) merchantMap[name] = { name, revenue: 0, kg: 0, billCount: 0 };
    merchantMap[name].revenue += (b.totalAmount || 0);
    merchantMap[name].kg += (b.netWeight || 0);
    merchantMap[name].billCount += 1;
  });
  const merchantLeaderboard = Object.values(merchantMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Payment breakdown
  const paymentBreakdown = { paid: { count: 0, amount: 0 }, partial: { count: 0, amount: 0 }, pending: { count: 0, amount: 0 } };
  monthBills.forEach(b => {
    const status = b.paymentStatus || 'pending';
    if (paymentBreakdown[status]) {
      paymentBreakdown[status].count += 1;
      paymentBreakdown[status].amount += (b.totalAmount || 0);
    }
  });

  // Daily trend
  const dailyMap = {};
  monthBills.forEach(b => {
    const day = b.saleDate || '';
    if (!dailyMap[day]) dailyMap[day] = { date: day, revenue: 0, kg: 0, count: 0 };
    dailyMap[day].revenue += (b.totalAmount || 0);
    dailyMap[day].kg += (b.netWeight || 0);
    dailyMap[day].count += 1;
  });
  const dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue,
    prevRevenue,
    revenueChange,
    totalKg,
    prevKg,
    avgRatePerKg,
    prevAvgRate,
    billCount: monthBills.length,
    varietyBreakdown,
    merchantLeaderboard,
    paymentBreakdown,
    dailyTrend,
  };
}
