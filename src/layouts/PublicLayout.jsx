import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Store, ShoppingCart, MessageSquare, Menu, X, Info, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import CartDrawer from '../components/public/CartDrawer';
import WhatsAppWidget from '../components/public/WhatsAppWidget';
import { Globe } from 'lucide-react';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();
  const { isCustomer, logout } = useAuth();
  const { currency, setCurrency, currencies } = useCurrency();

  const navItems = [
    { id: '/', label: 'Home', icon: Store },
    { id: '/shop', label: 'Shop', icon: ShoppingCart },
    { id: '/blog', label: 'Insights', icon: Info },
    { id: '/contact', label: 'Contact', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#020a04] flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-[#020a04]/80 backdrop-blur-xl border-b border-green-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-3 cursor-pointer group">
              <img src="/logo.png" alt="Alphovins Global Agro Exports" className="h-10 w-10 rounded-full object-cover border-2 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)] group-hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-shadow" />
              <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">Alphovins</span>
            </NavLink>

            <nav className="hidden md:flex items-center gap-2">
              {navItems.map(item => (
                <NavLink
                  key={item.id}
                  to={item.id}
                  className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200 ${
                    isActive
                      ? 'bg-green-500 text-[#020a04] shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <NavLink
                to={isCustomer ? "/account" : "/login"}
                className={({ isActive }) => `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200 border ${
                  isActive
                    ? 'bg-white/10 text-white border-white/20'
                    : 'text-green-400 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50'
                }`}
              >
                <User size={16} />
                <span>{isCustomer ? "My Account" : "Sign In"}</span>
              </NavLink>
            </nav>

            <div className="flex items-center gap-3">
              {/* Currency Selector */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                <Globe size={14} className="text-green-500/60" />
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-white cursor-pointer"
                >
                  {Object.entries(currencies).map(([code, details]) => (
                    <option key={code} value={code} className="bg-[#020a04]">{details.label}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl text-green-400 hover:bg-white/5 transition-colors group"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    {cartCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-green-400 hover:bg-white/5 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-green-900/30 bg-[#020a04]/95 backdrop-blur-xl fade-in">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map(item => (
                <NavLink
                  key={item.id}
                  to={item.id}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                    transition-all duration-200 ${
                    isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              <NavLink
                to={isCustomer ? "/account" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                  transition-all duration-200 border mt-2 ${
                  isActive
                    ? 'bg-white/10 text-white border-white/20'
                    : 'text-green-400 border-green-500/30 hover:bg-green-500/10'
                }`}
              >
                <User size={20} />
                <span className="font-medium">{isCustomer ? "My Account" : "Sign In / Register"}</span>
              </NavLink>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <CartDrawer />
      <WhatsAppWidget />

      <footer className="w-full bg-[#010602] border-t border-green-900/30 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Alphovins" className="h-12 w-12 rounded-full object-cover border-2 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]" />
                <span className="font-bold text-lg text-white">Alphovins</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                ALPHOVINS GLOBAL AGRO EXPORTS — Premium bananas delivered fresh from farms to your doorstep.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <NavLink to="/shop" className="hover:text-green-400 transition-colors w-fit">Shop</NavLink>
                <NavLink to="/contact" className="hover:text-green-400 transition-colors w-fit">Contact Us</NavLink>
                <NavLink to="/admin/login" className="hover:text-green-400 transition-colors w-fit">Admin Portal</NavLink>
                <NavLink to="/terms" className="hover:text-green-400 transition-colors w-fit">Terms & Conditions</NavLink>
                <NavLink to="/privacy" className="hover:text-green-400 transition-colors w-fit">Privacy Policy</NavLink>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact Info</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <p>Email: business.alphovins@gmail.com</p>
                <p>Phone: +91 89250 11054</p>
                <p>Location: Tamil Nadu, India</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-green-900/30 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ALPHOVINS GLOBAL AGRO EXPORTS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
