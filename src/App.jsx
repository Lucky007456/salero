import React, { useState } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import NewSaleBill from './components/NewSaleBill';
import Dashboard from './components/Dashboard';
import BillHistory from './components/BillHistory';
import SalesStatisticsView from './components/SalesStatisticsView';
import BillDetail from './components/BillDetail';
import Profile from './components/Profile';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBill, setSelectedBill] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page) => {
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

  if (!isLoggedIn) {
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
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
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
