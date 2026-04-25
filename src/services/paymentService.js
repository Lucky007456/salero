import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

const ORDERS_COLLECTION = 'online_orders';

// Helper function to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Function to initialize real Razorpay checkout
export const initializePayment = async (amount, customerDetails, cartItems, uid, onSuccess, onError) => {
  
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      onError("Razorpay SDK failed to load. Check your internet connection.");
      return;
    }

    // 1. Create order on backend
    // We use a relative path so it automatically works on Vercel (serverless functions)
    // Locally, Vite's proxy will route it to the Express server.
    const response = await fetch(`/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        amount: Math.round(amount * 100), // convert to paise
        currency: 'INR'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order');
    }

    const { order_id, amount: orderAmount, currency } = await response.json();

    // 2. Open Razorpay Checkout Modal
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderAmount,
      currency: currency,
      name: "ALPHOVINS GLOBAL AGRO EXPORTS",
      description: "Premium Agro Exports Payment",
      image: "/logo.png",
      order_id: order_id,
      handler: async function (response) {
        // 3. Verify payment on backend
        try {
          const verifyResponse = await fetch(`/api/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            // Payment verified, record the order
            const orderData = {
              uid: uid || null,
              customerDetails,
              cartItems,
              totalAmount: amount,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              paymentStatus: 'paid',
              orderStatus: 'Processing',
              createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
            };

            if (isFirebaseConfigured) {
              await addDoc(collection(db, ORDERS_COLLECTION), orderData);
            } else {
              const existing = JSON.parse(localStorage.getItem('salero_online_orders') || '[]');
              existing.push({ ...orderData, id: 'local_' + Date.now(), createdAt: new Date().toISOString() });
              localStorage.setItem('salero_online_orders', JSON.stringify(existing));
            }

            onSuccess(response.razorpay_payment_id);
          } else {
            onError("Payment verification failed: " + verifyData.message);
          }
        } catch (err) {
          console.error("Verification error:", err);
          onError("An error occurred during payment verification.");
        }
      },
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone,
      },
      theme: {
        color: "#22c55e", // green-500
      },
      modal: {
        ondismiss: function() {
          console.log("Payment modal closed by user");
        }
      }
    };

    const rzp1 = new window.Razorpay(options);
    
    rzp1.on('payment.failed', function (response) {
      onError("Payment failed: " + response.error.description);
    });

    rzp1.open();
  } catch (error) {
    console.error("Payment initiation error:", error);
    onError(error.message || "Failed to initiate payment.");
  }
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
