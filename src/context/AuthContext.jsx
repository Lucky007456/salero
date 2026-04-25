import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'customer' | null
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@salero.com';

  useEffect(() => {
    // If Firebase isn't configured, check localStorage for a mock admin session
    if (!isFirebaseConfigured) {
      const localAuth = localStorage.getItem('isLoggedIn');
      if (localAuth === 'true') {
        setCurrentUser({ email: ADMIN_EMAIL, uid: 'local-admin' });
        setRole('admin');
      } else {
        const localCustomerAuth = localStorage.getItem('isCustomerLoggedIn');
        if (localCustomerAuth === 'true') {
          setCurrentUser({ email: 'customer@demo.com', uid: 'local-customer' });
          setRole('customer');
        } else {
          setCurrentUser(null);
          setRole(null);
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Determine role based on email
        if (user.email === ADMIN_EMAIL) {
          setRole('admin');
        } else {
          setRole('customer');
        }
      } else {
        setCurrentUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [ADMIN_EMAIL]);

  const login = async (email, password) => {
    if (!isFirebaseConfigured) {
      // Only use local bypass when Firebase is truly not set up
      if (email === ADMIN_EMAIL) {
        localStorage.setItem('isLoggedIn', 'true');
        setCurrentUser({ email: ADMIN_EMAIL, uid: 'local-admin' });
        setRole('admin');
      } else {
        localStorage.setItem('isCustomerLoggedIn', 'true');
        setCurrentUser({ email, uid: 'local-customer' });
        setRole('customer');
      }
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // Only auto-create if the admin account truly doesn't exist yet
      if (email === ADMIN_EMAIL && err.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          return;
        } catch (createErr) {
          throw createErr;
        }
      }
      // For wrong password, give a clear message
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again or reset your password in Firebase Console.');
      }
      throw err;
    }
  };

  const register = async (email, password) => {
    if (!isFirebaseConfigured) {
      localStorage.setItem('isCustomerLoggedIn', 'true');
      setCurrentUser({ email, uid: 'local-customer' });
      setRole('customer');
      return { user: { uid: 'local-customer', email } };
    }
    return await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isCustomerLoggedIn');
      setCurrentUser(null);
      setRole(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      role,
      loading,
      login,
      register,
      logout,
      isAdmin: role === 'admin',
      isCustomer: role === 'customer'
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
