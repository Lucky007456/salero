import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Truck } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[#020a04] z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="text-center lg:text-left slide-in-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Fresh Harvest Available Now
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
                Premium Bananas <br />
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 bg-clip-text text-transparent">
                  Direct to You.
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Experience the finest quality bananas cultivated with care. Order online by the kilogram or by the bunch (thar) for your family or business needs.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <NavLink 
                  to="/shop" 
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-green-500 hover:bg-green-400 text-[#020a04] shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center gap-2 group"
                >
                  Shop Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </NavLink>
                <NavLink 
                  to="/contact" 
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all flex items-center justify-center"
                >
                  Bulk Inquiries
                </NavLink>
              </div>
            </div>

            {/* Visual/Image Area */}
            <div className="relative slide-in-right hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-[-20px] bg-green-500/15 rounded-full blur-[60px]"></div>
                <div className="w-[400px] h-[400px] rounded-full overflow-hidden border-4 border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.25)] relative">
                  <img 
                    src="/logo.png" 
                    alt="ALPHOVINS GLOBAL AGRO EXPORTS" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#010602] py-24 border-y border-green-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 slide-up">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Alphovins?</h2>
            <p className="text-gray-400">We control the entire process from farm to table, ensuring you get the freshest produce possible.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#030f05] p-8 rounded-3xl border border-green-900/30 hover:border-green-500/30 transition-colors slide-up" style={{ animationDelay: '100ms' }}>
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 mb-6">
                <Leaf size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Farm Fresh</h3>
              <p className="text-gray-400 leading-relaxed">Harvested at the perfect time and delivered directly to maintain optimal freshness and nutritional value.</p>
            </div>
            
            <div className="bg-[#030f05] p-8 rounded-3xl border border-green-900/30 hover:border-green-500/30 transition-colors slide-up" style={{ animationDelay: '200ms' }}>
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Premium Quality</h3>
              <p className="text-gray-400 leading-relaxed">Strict quality control ensures only the best bananas make it to your order. We guarantee satisfaction.</p>
            </div>

            <div className="bg-[#030f05] p-8 rounded-3xl border border-green-900/30 hover:border-green-500/30 transition-colors slide-up" style={{ animationDelay: '300ms' }}>
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 mb-6">
                <Truck size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Fast Delivery</h3>
              <p className="text-gray-400 leading-relaxed">Carefully packaged and quickly shipped to your doorstep, preserving the perfect condition of the fruit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
