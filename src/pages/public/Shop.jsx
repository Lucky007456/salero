import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Check, PackageOpen } from 'lucide-react';
import { getAvailableProducts } from '../../services/productService';

export default function Shop() {
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await getAvailableProducts();
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const handleAddToCart = (product, type) => {
    addToCart(product, 1, type);
    
    // Show temporary success state
    const key = `${product.id}-${type}`;
    setAddedItems(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [key]: false }));
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16 slide-up">
        <h1 className="text-4xl md:text-5xl font-bold text-green-100 mb-6">
          Fresh From Our <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Farms</span>
        </h1>
        <p className="text-lg text-gray-400">
          Browse our selection of premium banana varieties. Available for purchase by the kilogram or by the entire bunch (thar).
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-green-950/20 rounded-3xl border border-green-900/30">
          <PackageOpen size={64} className="mx-auto text-green-500/30 mb-4" />
          <h2 className="text-2xl font-bold text-green-200 mb-2">No Products Available</h2>
          <p className="text-green-500/60">Check back later for fresh stock.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="group relative bg-[#030f05] rounded-3xl border border-green-900/30 overflow-hidden hover:border-green-500/50 transition-all duration-300 slide-up"
              style={{ animationDelay: `${(index % 6) * 100}ms` }}
            >
              {/* Image Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-green-900/40 to-emerald-900/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <span className="text-8xl filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">🍌</span>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-green-100">{product.name}</h3>
                    <p className="text-sm text-green-500/60 font-medium">{product.tamil}</p>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                  {product.desc}
                </p>

                <div className="space-y-3">
                  {/* Buy by KG */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Price per kg</p>
                      <p className="font-bold text-green-300 font-mono">₹{product.pricePerKg}</p>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product, 'kg')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        addedItems[`${product.id}-kg`] 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]'
                      }`}
                    >
                      {addedItems[`${product.id}-kg`] ? <Check size={16} /> : <ShoppingCart size={16} />}
                      {addedItems[`${product.id}-kg`] ? 'Added' : 'Add Kg'}
                    </button>
                  </div>

                  {/* Buy by Thar */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Price per Thar (Bunch)</p>
                      <p className="font-bold text-green-300 font-mono">₹{product.pricePerThar}</p>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product, 'thar')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        addedItems[`${product.id}-thar`] 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {addedItems[`${product.id}-thar`] ? <Check size={16} /> : <ShoppingCart size={16} />}
                      {addedItems[`${product.id}-thar`] ? 'Added' : 'Add Thar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
