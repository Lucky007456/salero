import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

const CUSTOMERS_COLLECTION = 'customers';

export const saveCustomerProfile = async (uid, profileData) => {
  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, CUSTOMERS_COLLECTION, uid), profileData, { merge: true });
      return true;
    } catch (err) {
      console.error('Error saving profile:', err);
      return false;
    }
  } else {
    // Fallback to local storage for demo
    const profiles = JSON.parse(localStorage.getItem('salero_customer_profiles') || '{}');
    profiles[uid] = { ...profiles[uid], ...profileData };
    localStorage.setItem('salero_customer_profiles', JSON.stringify(profiles));
    return true;
  }
};

export const getCustomerProfile = async (uid) => {
  if (isFirebaseConfigured) {
    try {
      const docSnap = await getDoc(doc(db, CUSTOMERS_COLLECTION, uid));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  } else {
    // Fallback
    const profiles = JSON.parse(localStorage.getItem('salero_customer_profiles') || '{}');
    return profiles[uid] || null;
  }
};
