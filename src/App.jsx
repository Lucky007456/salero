import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import NewSaleBill from './components/NewSaleBill';
import Dashboard from './components/Dashboard';
import BillHistory from './components/BillHistory';
import SalesStatisticsView from './components/SalesStatisticsView';
import BillDetail from './components/BillDetail';
import Profile from './components/Profile';
import RecycleBin from './components/RecycleBin';
import { TermsView, PrivacyView, RefundView } from './components/LegalPages';
import './index.css';
import { auth, isFirebaseConfigured } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBill, setSelectedBill] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (['terms', 'privacy', 'refund'].includes(page)) {
      setCurrentPage(page);
    }

    // Check authentication state
    const localAuth = localStorage.getItem('isLoggedIn');
    if (localAuth === 'true') {
      setIsLoggedIn(true);
      setAuthChecking(false);
    } else if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsLoggedIn(true);
        }
        setAuthChecking(false);
      });
      return () => unsubscribe();
    } else {
      setAuthChecking(false);
    }
  }, []);

  // Check for auto-backup
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkAndTriggerBackup = async () => {
      const currentMonth = new Date().toISOString().substring(0, 7); // e.g., "2026-04"
      const lastBackupMonth = localStorage.getItem('last_auto_backup_month');

      if (lastBackupMonth !== currentMonth) {
        // Prevent duplicate firing by recording immediately
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
      // Remove listeners immediately after the first interaction fires
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
      window.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
    };

    // The backup needs user-gesture to prevent popup blocking, wait for first click.
    window.addEventListener('click', handleFirstInteraction, { capture: true, once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
      window.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger nav hotkeys if typing in an input
      if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') {
        if (e.key === 'Escape') e.target.blur();
        return;
      }

      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'n': // Ctrl + N -> New Sale
            e.preventDefault();
            handleNavigate('new-sale');
            break;
          case 'h': // Ctrl + H -> History
            e.preventDefault();
            handleNavigate('history');
            break;
          case 's': // Ctrl + S -> Sales Stats
            e.preventDefault();
            handleNavigate('sales-stats');
            break;
          case 'd': // Ctrl + D -> Dashboard
            e.preventDefault();
            handleNavigate('dashboard');
            break;
          default:
            break;
        }
      } else if (e.key === 'Escape') {
        if (currentPage === 'bill-detail') {
          handleBackFromDetail();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page) => {
    if (['terms', 'privacy', 'refund'].includes(page)) {
      window.history.pushState({}, '', `?page=${page}`);
      setCurrentPage(page);
      return;
    }
    // Clear URL params if navigating back to main app
    if (window.location.search) {
      window.history.pushState({}, '', window.location.pathname);
    }
    setCurrentPage(page);
    setSelectedBill(null);
    if (page === 'dashboard' || page === 'history' || page === 'sales-stats') {
      setRefreshKey(k => k + 1);
    }
  };

  const handleBillSaved = (bill, action) => {
    if (action === 'view') {
      setCurrentPage('dashboard');
      setRefreshKey(k => k + 1);
    }
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setCurrentPage('bill-detail');
  };

  const handleBackFromDetail = () => {
    setSelectedBill(null);
    setCurrentPage('dashboard');
    setRefreshKey(k => k + 1);
  };

  const handleBillUpdated = () => {
    setRefreshKey(k => k + 1);
    handleBackFromDetail();
  };

  const isPublicPage = ['terms', 'privacy', 'refund'].includes(currentPage);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#030f05] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn && !isPublicPage) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'new-sale':
        return <NewSaleBill onBillSaved={handleBillSaved} />;
      case 'bill-detail':
        return selectedBill ? (
          <BillDetail 
            bill={selectedBill} 
            onBack={handleBackFromDetail} 
            onUpdate={handleBillUpdated}
          />
        ) : (
          <Dashboard key={refreshKey} onViewBill={handleViewBill} />
        );
      case 'history':
        return <BillHistory key={refreshKey} onViewBill={handleViewBill} />;
      case 'sales-stats':
        return <SalesStatisticsView key={refreshKey} />;
      case 'recycle-bin':
        return <RecycleBin key={refreshKey} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsView onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyView onNavigate={handleNavigate} />;
      case 'refund':
        return <RefundView onNavigate={handleNavigate} />;
      case 'dashboard':
      default:
        return <Dashboard key={refreshKey} onViewBill={handleViewBill} onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}

export default App;
