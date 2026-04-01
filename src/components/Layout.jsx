import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, PlusCircle, FileText, LogIn, LogOut, Menu, X, Banana 
} from 'lucide-react';
import { auth, isFirebaseConfigured } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { LABELS } from '../utils/format';

export default function Layout({ children, currentPage, onNavigate }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = onAuthStateChanged(auth, (u) => setUser(u));
      return unsub;
    }
  }, []);

  const navItems = [
    { id: 'dashboard', label: LABELS.dashboard.en, tamil: LABELS.dashboard.ta, icon: LayoutDashboard },
    { id: 'new-sale', label: LABELS.newSale.en, tamil: LABELS.newSale.ta, icon: PlusCircle },
    { id: 'history', label: LABELS.billHistory.en, tamil: LABELS.billHistory.ta, icon: FileText },
  ];

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-[#030f05] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-green-950/80 backdrop-blur-xl border-b border-green-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 
                            flex items-center justify-center shadow-glow">
                <span className="text-xl">🍌</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-green-300 to-emerald-400 
                             bg-clip-text text-transparent leading-tight">
                  SLAero Operation
                </h1>
                <p className="text-[10px] text-green-500/60 -mt-0.5">Banana Billing System</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-green-600/20 text-green-300 border border-green-600/30'
                      : 'text-green-400/60 hover:text-green-300 hover:bg-green-900/30'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user && (
                <span className="hidden sm:block text-xs text-green-500/50">
                  {user.email}
                </span>
              )}
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-green-400 hover:bg-green-900/30 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-green-800/30 bg-green-950/95 backdrop-blur-xl fade-in">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                    transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-green-600/20 text-green-300 border border-green-600/30'
                      : 'text-green-400/60 hover:text-green-300 hover:bg-green-900/30'
                  }`}
                >
                  <item.icon size={20} />
                  <div>
                    <span className="block font-medium">{item.label}</span>
                    <span className="block text-xs text-green-600/50">{item.tamil}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Bottom Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 
                      bg-green-950/90 backdrop-blur-xl border-t border-green-800/30 
                      safe-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl
                transition-all duration-200 min-w-[64px] ${
                currentPage === item.id
                  ? 'text-green-400'
                  : 'text-green-600/50'
              }`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-20" />
    </div>
  );
}
