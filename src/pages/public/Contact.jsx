import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Mail, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitInquiry } from '../../services/inquiryService';

export default function Contact() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bulk Order Inquiry',
    message: ''
  });
  
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get('subject');
    if (subjectParam) {
      setFormData(prev => ({ ...prev, subject: subjectParam }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    
    const result = await submitInquiry(formData);
    
    if (result.success) {
      setStatus({ loading: false, success: true, error: null });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Bulk Order Inquiry',
        message: ''
      });
    } else {
      setStatus({ loading: false, success: false, error: result.error });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16 slide-up">
        <h1 className="text-4xl md:text-5xl font-bold text-green-100 mb-6">
          Get in <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Touch</span>
        </h1>
        <p className="text-lg text-gray-400">
          Have questions about our varieties? Looking to place a bulk order? Send us a message and our team will get back to you promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Information */}
        <div className="space-y-8 slide-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-[#030f05] p-8 rounded-3xl border border-green-900/30">
            <h3 className="text-2xl font-bold text-white mb-8">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Our Location</h4>
                  <p className="text-gray-400 leading-relaxed">
                    ALPHOVINS Global Agro Exports<br />
                    123 Farm Road, Green Valley<br />
                    Tamil Nadu, India
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Phone Number</h4>
                  <p className="text-gray-400">+91 89250 11054</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Email Address</h4>
                  <p className="text-gray-400">business.alphovins@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 slide-up" style={{ animationDelay: '200ms' }}>
          <div className="bg-[#030f05] p-8 sm:p-10 rounded-3xl border border-green-900/30">
            {status.success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-gray-400 mb-8">Thank you for reaching out. We will get back to you shortly.</p>
                <button 
                  onClick={() => setStatus({ loading: false, success: false, error: null })}
                  className="btn-primary"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status.error && (
                  <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 flex items-center gap-2">
                    <AlertCircle size={20} /> {status.error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                    <input 
                      required 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="input-field w-full" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="input-field w-full" 
                      placeholder="john@example.com" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="input-field w-full" 
                      placeholder="+91 9876543210" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                    <select 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleChange} 
                      className="select-field w-full"
                    >
                      <option>Bulk Order Inquiry</option>
                      <option>Sample Request</option>
                      <option>General Support</option>
                      <option>Partnership</option>
                      <option>Other</option>
                      {formData.subject && !['Bulk Order Inquiry', 'Sample Request', 'General Support', 'Partnership', 'Other'].includes(formData.subject) && (
                        <option value={formData.subject}>{formData.subject}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                  <textarea 
                    required 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    className="input-field w-full min-h-[150px] py-4" 
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status.loading}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-green-500 hover:bg-green-400 text-[#020a04] shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status.loading ? 'Sending...' : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
