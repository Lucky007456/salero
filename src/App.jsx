import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import Shop from './pages/public/Shop';
import Checkout from './pages/public/Checkout';
import Contact from './pages/public/Contact';
import CustomerLogin from './pages/public/CustomerLogin';
import CustomerRegister from './pages/public/CustomerRegister';
import CustomerAccount from './pages/public/CustomerAccount';

// Admin Components
import Dashboard from './components/Dashboard';
import NewSaleBill from './components/NewSaleBill';
import Profile from './components/Profile';
import BillDetailWrapper from './components/BillDetailWrapper';
import OnlineOrders from './components/admin/OnlineOrders';
import Inquiries from './components/admin/Inquiries';
import ProductManager from './components/admin/ProductManager';
import BillHistory from './components/BillHistory';
import SalesStatisticsView from './components/SalesStatisticsView';
import RecycleBin from './components/RecycleBin';
import Login from './components/Login';
import { TermsView, PrivacyView, RefundView } from './components/LegalPages';

// Optional: Fallback loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#030f05] flex items-center justify-center">
    <div className="w-12 h-12 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin"></div>
  </div>
);

// Protected Route Wrapper for Admin
const AdminProtectedRoute = ({ isAdmin, loading, children }) => {
  if (loading) return <LoadingScreen />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
};

// Protected Route Wrapper for Customers
const CustomerProtectedRoute = ({ isCustomer, loading, children }) => {
  if (loading) return <LoadingScreen />;
  if (!isCustomer) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const { isAdmin, isCustomer, loading } = useAuth();

  // Check for auto-backup
  useEffect(() => {
    if (!isAdmin) return;

    const checkAndTriggerBackup = async () => {
      const currentMonth = new Date().toISOString().substring(0, 7);
      const lastBackupMonth = localStorage.getItem('last_auto_backup_month');

      if (lastBackupMonth !== currentMonth) {
        localStorage.setItem('last_auto_backup_month', currentMonth);
        try {
          const { downloadDatabaseBackup } = await import('./services/backupService.js');
          await downloadDatabaseBackup();
        } catch (e) {
          console.error("Auto backup failed to initialize", e);
        }
      }
    };

    const handleFirstInteraction = () => {
      checkAndTriggerBackup();
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
      window.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
    };

    window.addEventListener('click', handleFirstInteraction, { capture: true, once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
      window.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
    };
  }, [isAdmin]);

  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Customer Auth Pages */}
        <Route path="/login" element={
          isCustomer ? <Navigate to="/account" replace /> : <CustomerLogin />
        } />
        <Route path="/register" element={
          isCustomer ? <Navigate to="/account" replace /> : <CustomerRegister />
        } />
        
        {/* Customer Dashboard */}
        <Route path="/account" element={
          <CustomerProtectedRoute isCustomer={isCustomer} loading={loading}>
            <CustomerAccount />
          </CustomerProtectedRoute>
        } />
        
        {/* Legal Pages */}
        <Route path="/terms" element={<TermsView />} />
        <Route path="/privacy" element={<PrivacyView />} />
        <Route path="/refund" element={<RefundView />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={
        isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Login />
      } />

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={
        <AdminProtectedRoute isAdmin={isAdmin} loading={loading}>
          <AdminLayout />
        </AdminProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="new-sale" element={<NewSaleBill />} />
        <Route path="history" element={<BillHistory />} />
        <Route path="online-orders" element={<OnlineOrders />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="bill/:id" element={<BillDetailWrapper />} />
        <Route path="sales-stats" element={<SalesStatisticsView />} />
        <Route path="recycle-bin" element={<RecycleBin />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={
        <div className="min-h-screen bg-[#030f05] flex items-center justify-center text-green-300 text-2xl font-bold">
          404 - Page Not Found
        </div>
      } />
    </Routes>
  );
}

export default App;
