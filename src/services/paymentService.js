import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

const ORDERS_COLLECTION = 'online_orders';

// Function to simulate initializing Razorpay checkout
export const initializePayment = async (amount, customerDetails, cartItems, uid, onSuccess, onError) => {
  // In a real application, you would:
  // 1. Call your backend to create a Razorpay Order ID.
  // 2. Load the Razorpay SDK script.
  // 3. Open the Razorpay checkout modal with the Order ID.
  
  // Since we don't have a backend here, we will simulate a successful payment delay.
  console.log('Initiating payment for:', amount);
  
  setTimeout(async () => {
    try {
      // Simulate success
      const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
      
      const orderData = {
        uid: uid || null,
        customerDetails,
        cartItems,
        totalAmount: amount,
        paymentId,
        paymentStatus: 'paid', // paid, failed
        orderStatus: 'Processing', // Processing, Shipped, Delivered
        createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
      };

      if (isFirebaseConfigured) {
        await addDoc(collection(db, ORDERS_COLLECTION), orderData);
      } else {
        // Fallback to local storage for demo
        const existing = JSON.parse(localStorage.getItem('salero_online_orders') || '[]');
        existing.push({ ...orderData, id: 'local_' + Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('salero_online_orders', JSON.stringify(existing));
      }

      onSuccess(paymentId);
    } catch (err) {
      console.error("Payment recording failed:", err);
      onError("Failed to record payment. Please contact support.");
    }
  }, 2000); // Simulate network delay
};

// Function to fetch online orders (for the Admin Dashboard)
export const getOnlineOrders = async () => {
  if (isFirebaseConfigured) {
    try {
      const { getDocs, query, orderBy } = await import('firebase/firestore');
      const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error fetching online orders:', err);
      return [];
    }
  }
  
  const existing = JSON.parse(localStorage.getItem('salero_online_orders') || '[]');
  return existing.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Function to fetch orders for a specific customer
export const getCustomerOrders = async (uid) => {
  if (isFirebaseConfigured) {
    try {
      const { getDocs, query, where } = await import('firebase/firestore');
      const q = query(
        collection(db, ORDERS_COLLECTION), 
        where('uid', '==', uid)
      );
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side to avoid needing a composite Firestore index
      return orders.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      return [];
    }
  }
  
  const existing = JSON.parse(localStorage.getItem('salero_online_orders') || '[]');
  return existing
    .filter(o => o.uid === uid)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus) => {
  if (isFirebaseConfigured) {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), { orderStatus: newStatus });
      return true;
    } catch (err) {
      console.error('Error updating order:', err);
      return false;
    }
  }
  
  const existing = JSON.parse(localStorage.getItem('salero_online_orders') || '[]');
  const index = existing.findIndex(o => o.id === orderId);
  if (index !== -1) {
    existing[index].orderStatus = newStatus;
    localStorage.setItem('salero_online_orders', JSON.stringify(existing));
    return true;
  }
  return false;
};
