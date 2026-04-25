import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    cartTotal, 
    removeFromCart, 
    updateQuantity 
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#030f05] border-l border-green-900/30 shadow-2xl z-50 flex flex-col slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-900/30 bg-green-950/20">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-green-400" size={20} />
            <h2 className="text-lg font-bold text-green-100">Your Cart</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Your cart is empty.</p>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shop');
                }}
                className="px-6 py-2 rounded-xl border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors mt-2"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={`${item.id}-${item.purchaseType}`} className="flex gap-4 p-3 rounded-2xl border border-green-900/30 bg-white/[0.02]">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center text-3xl">
                  {item.emoji || '🍌'}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-green-100">{item.name}</h3>
                      <p className="text-xs text-green-500/60 uppercase mt-0.5 font-medium tracking-wide">
                        {item.purchaseType === 'kg' ? 'By Kilogram' : 'By Thar (Bunch)'}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id, item.purchaseType)}
                      className="p-1.5 rounded-lg text-red-400/60 hover:bg-red-400/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1 border border-white/5">
                      <button 
                        onClick={() => updateQuantity(item.id, item.purchaseType, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center text-green-100">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.purchaseType, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-green-300">
                      ₹{(item.purchaseType === 'kg' ? item.pricePerKg : item.pricePerThar) * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-green-900/30 bg-green-950/40">
            <div className="flex justify-between items-center mb-4">
              <span className="text-green-100/70">Total ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} items)</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                ₹{cartTotal}
              </span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl font-bold bg-green-500 hover:bg-green-400 text-[#020a04] shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all transform active:scale-95"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
