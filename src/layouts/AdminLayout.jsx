import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, FileText, BarChart3, Menu, X, User, Trash2
} from 'lucide-react';
import { auth, isFirebaseConfigured } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { LABELS } from '../utils/format';
import { ShoppingBag, MessageSquare, Package } from 'lucide-react';

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = onAuthStateChanged(auth, (u) => setUser(u));
      return unsub;
    }
  }, []);

  const navItems = [
    { id: '/admin/dashboard', label: LABELS.dashboard.en, tamil: LABELS.dashboard.ta, icon: LayoutDashboard },
    { id: '/admin/new-sale', label: LABELS.newSale.en, tamil: LABELS.newSale.ta, icon: PlusCircle },
    { id: '/admin/history', label: LABELS.billHistory.en, tamil: LABELS.billHistory.ta, icon: FileText },
    { id: '/admin/online-orders', label: 'E-Commerce', tamil: 'ஆன்லைன்', icon: ShoppingBag },
    { id: '/admin/products', label: 'Products', tamil: 'பொருட்கள்', icon: Package },
    { id: '/admin/inquiries', label: 'Inquiries', tamil: 'விசாரணை', icon: MessageSquare },
    { id: '/admin/sales-stats', label: LABELS.salesStats.en, tamil: LABELS.salesStats.ta, icon: BarChart3 },
    { id: '/admin/recycle-bin', label: 'Recycle Bin', tamil: 'குப்பை', icon: Trash2 },
  ];

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#030f05] flex flex-col">
      <header className="sticky top-0 z-50 bg-green-950/80 backdrop-blur-xl border-b border-green-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/admin/dashboard" className="flex items-center gap-3 cursor-pointer">
              <img src="/logo.png" alt="Alphovins" className="w-10 h-10 rounded-full object-cover border-2 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]" />
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-lg tracking-tight text-green-300">ADMIN DASHBOARD</span>
              </div>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <NavLink
                  key={item.id}
                  to={item.id}
                  className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200 ${
                    isActive
                      ? 'bg-green-600/20 text-green-300 border border-green-600/30'
                      : 'text-green-400/60 hover:text-green-300 hover:bg-green-900/30'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {user && (
                <NavLink 
                  to="/admin/profile"
                  className={({ isActive }) => `hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                    isActive 
                      ? 'bg-green-600/20 text-green-300 border-green-600/30' 
                      : 'border-transparent text-green-500/70 hover:bg-green-900/40 hover:text-green-300'
                  }`}
                >
                  <User size={16} />
                  <span className="text-xs font-medium">Profile</span>
                </NavLink>
              )}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-green-400 hover:bg-green-900/30 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-green-800/30 bg-green-950/95 backdrop-blur-xl fade-in">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map(item => (
                <NavLink
                  key={item.id}
                  to={item.id}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                    transition-all duration-200 ${
                    isActive
                      ? 'bg-green-600/20 text-green-300 border border-green-600/30'
                      : 'text-green-400/60 hover:text-green-300 hover:bg-green-900/30'
                  }`}
                >
                  <item.icon size={20} />
                  <div>
                    <span className="block font-medium">{item.label}</span>
                    <span className="block text-xs text-green-600/50">{item.tamil}</span>
                  </div>
                </NavLink>
              ))}
              
              {user && (
                 <NavLink
                  to="/admin/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left border-t border-green-800/20 mt-2
                    transition-all duration-200 ${
                    isActive
                      ? 'bg-green-600/20 text-green-300'
                      : 'text-green-400/60 hover:text-green-300 hover:bg-green-900/30'
                  }`}
                >
                  <User size={20} />
                  <div>
                    <span className="block font-medium">Admin Profile</span>
                    <span className="block text-xs text-green-600/50">சுயவிவரம்</span>
                  </div>
                </NavLink>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 
                      bg-green-950/90 backdrop-blur-xl border-t border-green-800/30 
                      safe-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <NavLink
              key={item.id}
              to={item.id}
              className={({ isActive }) => `flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl
                transition-all duration-200 min-w-[56px] ${
                isActive
                  ? 'text-green-400'
                  : 'text-green-600/50'
              }`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="md:hidden h-20" />
    </div>
  );
}
