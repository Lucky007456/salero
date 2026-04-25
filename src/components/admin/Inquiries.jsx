import React, { useState, useEffect } from 'react';
import { getInquiries, updateInquiryStatus } from '../../services/inquiryService';
import { MessageSquare, Search, Mail, Phone, Clock, CheckCircle } from 'lucide-react';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadInquiries = async () => {
    setLoading(true);
    const data = await getInquiries();
    setInquiries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const success = await updateInquiryStatus(id, newStatus);
    if (success) {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    }
  };

  const filteredInquiries = inquiries.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'read': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'replied': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="space-y-6 slide-up pb-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-200 flex items-center gap-2">
            <MessageSquare className="text-green-400" /> Customer Inquiries
          </h2>
          <p className="text-xs text-green-500/50">Manage contact form submissions</p>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600/50" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search inquiries..."
          className="input-field pl-11 !py-3 !text-base shadow-lg"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin"></div>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="p-12 text-center glass-card">
          <MessageSquare size={48} className="mx-auto mb-3 text-green-800/40" />
          <p className="text-green-500/40 text-lg">No inquiries found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInquiries.map(inquiry => (
            <div key={inquiry.id} className="glass-card p-5 border border-green-800/30 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-green-100 text-lg mb-1">{inquiry.subject}</h3>
                  <p className="text-xs text-green-500/60 flex items-center gap-1">
                    <Clock size={12} /> {new Date(inquiry.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status}
                </span>
              </div>

              <div className="bg-green-950/30 p-4 rounded-xl border border-green-900/30 mb-4 flex-1">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{inquiry.message}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 flex justify-center text-green-500/50"><Mail size={14} /></span>
                  {inquiry.name} ({inquiry.email})
                </div>
                {inquiry.phone && (
                  <div className="flex items-center gap-2">
                    <span className="w-6 flex justify-center text-green-500/50"><Phone size={14} /></span>
                    {inquiry.phone}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-green-800/30 flex items-center justify-between">
                <span className="text-xs font-semibold text-green-500/50 uppercase">Update Status:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusChange(inquiry.id, 'read')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${inquiry.status === 'read' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
                  >
                    Mark Read
                  </button>
                  <button 
                    onClick={() => handleStatusChange(inquiry.id, 'replied')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${inquiry.status === 'replied' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                  >
                    <CheckCircle size={14} /> Replied
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
