import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

const PREF_STORAGE_KEY = 'banana_admin_preferences';
const PREF_DOC_ID = 'global_preferences';

const DEFAULT_PREFERENCES = {
  language: 'en', // 'en' or 'ta'
  defaultRate: '',
  defaultVariety: '',
  whatsappGreeting: '',
};

// ---- LOCAL STORAGE FALLBACK ----
function getLocalPreferences() {
  const data = localStorage.getItem(PREF_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_PREFERENCES;
    }
  }
  return DEFAULT_PREFERENCES;
}

function saveLocalPreferences(prefs) {
  localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(prefs));
}

// ---- API ----

export async function getPreferences() {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'preferences', PREF_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...DEFAULT_PREFERENCES, ...docSnap.data() };
      }
      return DEFAULT_PREFERENCES;
    } catch (err) {
      console.error('Firebase fetching preferences failed, using local:', err);
    }
  }
  return getLocalPreferences();
}

export async function savePreferences(prefs) {
  const finalPrefs = { ...DEFAULT_PREFERENCES, ...prefs };
  
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'preferences', PREF_DOC_ID);
      await setDoc(docRef, finalPrefs, { merge: true });
    } catch (err) {
      console.error('Firebase saving preferences failed, using local:', err);
    }
  }
  saveLocalPreferences(finalPrefs); // Always save locally as well for immediate fetch
  return finalPrefs;
}
