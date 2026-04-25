import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

const INQUIRIES_COLLECTION = 'inquiries';

export const submitInquiry = async (inquiryData) => {
  const dataToSave = {
    ...inquiryData,
    status: 'new', // new, read, replied
    createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, INQUIRIES_COLLECTION), dataToSave);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding inquiry: ", error);
      return { success: false, error: error.message };
    }
  } else {
    // Fallback to local storage for demo
    const existing = JSON.parse(localStorage.getItem('salero_inquiries') || '[]');
    const newId = 'local_inq_' + Date.now();
    existing.push({ ...dataToSave, id: newId });
    localStorage.setItem('salero_inquiries', JSON.stringify(existing));
    return { success: true, id: newId };
  }
};

export const getInquiries = async () => {
  if (isFirebaseConfigured) {
    try {
      const { getDocs, query, orderBy } = await import('firebase/firestore');
      const q = query(collection(db, INQUIRIES_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      return [];
    }
  }
  
  const existing = JSON.parse(localStorage.getItem('salero_inquiries') || '[]');
  return existing.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateInquiryStatus = async (inquiryId, newStatus) => {
  if (isFirebaseConfigured) {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, INQUIRIES_COLLECTION, inquiryId), { status: newStatus });
      return true;
    } catch (err) {
      console.error('Error updating inquiry:', err);
      return false;
    }
  }
  
  const existing = JSON.parse(localStorage.getItem('salero_inquiries') || '[]');
  const index = existing.findIndex(i => i.id === inquiryId);
  if (index !== -1) {
    existing[index].status = newStatus;
    localStorage.setItem('salero_inquiries', JSON.stringify(existing));
    return true;
  }
  return false;
};
