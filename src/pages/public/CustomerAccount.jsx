import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCustomerProfile, saveCustomerProfile } from '../../services/customerService';
import { getCustomerOrders } from '../../services/paymentService';
import { User, MapPin, Package, Clock, CheckCircle, Truck, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerAccount() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profile, setProfile] = useState({ name: '', phone: '', address: '', city: '', pincode: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser?.uid) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    const [profileData, ordersData] = await Promise.all([
      getCustomerProfile(currentUser.uid),
      getCustomerOrders(currentUser.uid)
    ]);
    
    if (profileData) {
      setProfile(prev => ({ ...prev, ...profileData }));
    }
    setOrders(ordersData);
    setLoading(false);
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const success = await saveCustomerProfile(currentUser.uid, profile);
    if (success) {
      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Failed to save profile. Try again.');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing': return <Clock size={16} className="text-yellow-400" />;
      case 'Shipped': return <Truck size={16} className="text-blue-400" />;
      case 'Delivered': return <CheckCircle size={16} className="text-emerald-400" />;
      default: return <Package size={16} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={48} className="text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
          <p className="text-gray-400">{currentUser.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'profile' 
                ? 'bg-green-500 text-[#020a04] font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <User size={20} /> Profile Details
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'orders' 
                ? 'bg-green-500 text-[#020a04] font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Package size={20} /> Order History
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="bg-[#030f05] rounded-3xl border border-green-900/30 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="text-green-400" /> Delivery Information
              </h2>

              {message && (
                <div className={`p-4 rounded-xl mb-6 text-sm ${message.includes('success') ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/20 text-red-400 border border-red-500/30'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                    <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="input-field w-full" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} className="input-field w-full" placeholder="+91 9876543210" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Delivery Address</label>
                    <textarea name="address" value={profile.address} onChange={handleProfileChange} className="input-field w-full min-h-[100px] py-3" placeholder="123 Street Name, Area..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                    <input type="text" name="city" value={profile.city} onChange={handleProfileChange} className="input-field w-full" placeholder="Chennai" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Pincode</label>
                    <input type="text" name="pincode" value={profile.pincode} onChange={handleProfileChange} className="input-field w-full" placeholder="600001" />
                  </div>
                </div>

                <div className="pt-4 border-t border-green-900/30 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-8 py-3 rounded-xl font-bold bg-green-500 hover:bg-green-400 text-[#020a04] transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-[#030f05] rounded-3xl border border-green-900/30 p-12 text-center">
                  <Package size={48} className="mx-auto text-green-900/50 mb-4" />
                  <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/shop')} className="btn-primary">Start Shopping</button>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-[#030f05] rounded-2xl border border-green-900/30 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 pb-4 border-b border-green-900/30">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white text-lg">Order #{order.id.slice(-6).toUpperCase()}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 bg-white/5 border border-white/10 text-gray-300`}>
                            {getStatusIcon(order.orderStatus)} {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{(order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)).toLocaleString()}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-400">Total Amount</p>
                        <p className="font-bold text-green-400 text-xl">₹{order.totalAmount}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {order.cartItems?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-300">{item.name} <span className="text-gray-500">x {item.quantity} {item.purchaseType}</span></span>
                          <span className="text-gray-300 font-medium">₹{(item.purchaseType === 'kg' ? item.pricePerKg : item.pricePerThar) * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
