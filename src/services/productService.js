import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

const PRODUCTS_COLLECTION = 'products';

const DEFAULT_PRODUCTS = [
  { id: 'nendran', name: 'Nendran', tamil: 'நேந்திரன்', pricePerKg: 65, pricePerThar: 450, desc: 'Premium quality cooking and eating bananas.', available: true },
  { id: 'robusta', name: 'Robusta', tamil: 'ரொபஸ்டா', pricePerKg: 35, pricePerThar: 300, desc: 'Sweet, commonly consumed dessert bananas.', available: true },
  { id: 'red-banana', name: 'Red Banana', tamil: 'செவ்வாழை', pricePerKg: 80, pricePerThar: 600, desc: 'Rich in antioxidants and exceptionally sweet.', available: true },
  { id: 'poovan', name: 'Poovan', tamil: 'பூவன்', pricePerKg: 40, pricePerThar: 350, desc: 'Small, tangy-sweet bananas perfect for daily use.', available: true },
  { id: 'g9', name: 'G9 (Grand Naine)', tamil: 'ஜி9', pricePerKg: 30, pricePerThar: 250, desc: 'High-yield commercial variety, excellent taste.', available: true },
  { id: 'rasthali', name: 'Rasthali', tamil: 'ரஸ்தாளி', pricePerKg: 50, pricePerThar: 400, desc: 'Premium dessert banana with a unique flavor.', available: true },
];

// Get all products
export const getProducts = async () => {
  if (isFirebaseConfigured) {
    try {
      const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      if (snapshot.empty) {
        // Seed default products on first run
        await seedDefaultProducts();
        return DEFAULT_PRODUCTS.map(p => ({ ...p, available: true }));
      }
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Error fetching products:', err);
      return DEFAULT_PRODUCTS;
    }
  }

  const saved = localStorage.getItem('alphovins_products');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('alphovins_products', JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
};

// Get only available products (for the public shop)
export const getAvailableProducts = async () => {
  const all = await getProducts();
  return all.filter(p => p.available !== false);
};

// Add a new product
export const addProduct = async (productData) => {
  const data = { ...productData, available: true, createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString() };

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), data);
      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Error adding product:', err);
      return { success: false, error: err.message };
    }
  }

  const products = JSON.parse(localStorage.getItem('alphovins_products') || '[]');
  const newId = 'local_' + Date.now();
  products.push({ ...data, id: newId });
  localStorage.setItem('alphovins_products', JSON.stringify(products));
  return { success: true, id: newId };
};

// Update a product
export const updateProduct = async (productId, updates) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), updates);
      return true;
    } catch (err) {
      console.error('Error updating product:', err);
      return false;
    }
  }

  const products = JSON.parse(localStorage.getItem('alphovins_products') || '[]');
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updates };
    localStorage.setItem('alphovins_products', JSON.stringify(products));
    return true;
  }
  return false;
};

// Delete a product
export const deleteProduct = async (productId) => {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      return false;
    }
  }

  let products = JSON.parse(localStorage.getItem('alphovins_products') || '[]');
  products = products.filter(p => p.id !== productId);
  localStorage.setItem('alphovins_products', JSON.stringify(products));
  return true;
};

// Seed defaults into Firestore
const seedDefaultProducts = async () => {
  if (!isFirebaseConfigured) return;
  try {
    for (const product of DEFAULT_PRODUCTS) {
      const { id, ...data } = product;
      await addDoc(collection(db, PRODUCTS_COLLECTION), { ...data, available: true });
    }
  } catch (err) {
    console.error('Error seeding products:', err);
  }
};
