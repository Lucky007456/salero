import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const currencies = {
  INR: { symbol: '₹', rate: 1, label: 'INR (₹)' },
  USD: { symbol: '$', rate: 0.012, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.011, label: 'EUR (€)' },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('app_currency');
    return saved && currencies[saved] ? saved : 'INR';
  });

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  const formatPrice = (price) => {
    const { symbol, rate } = currencies[currency];
    const converted = (price * rate).toFixed(currency === 'INR' ? 2 : 2);
    return `${symbol}${converted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencies }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
