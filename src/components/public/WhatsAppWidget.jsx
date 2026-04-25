import React, { useState } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';

const QUICK_QUESTIONS = [
  "Do you ship to my country?",
  "What is the bulk price for Cavendish?",
  "How can I request a sample?",
  "Track my shipment status",
  "Partner with Alphovins"
];

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  
  const phoneNumber = "918925011054"; // Provided in footer: +91 89250 11054

  const handleSend = (text) => {
    const finalMsg = text || message;
    if (!finalMsg.trim()) return;
    
    const encodedMsg = encodeURIComponent(finalMsg);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMsg}`, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] bg-[#030f05] border border-green-500/30 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <User className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Alphovins Support</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></div>
                    <span className="text-green-100 text-[10px] font-medium uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-green-50 text-sm leading-relaxed">
              Hi there! 👋 How can we help you today with our agro-exports?
            </p>
          </div>

          {/* Quick Questions */}
          <div className="p-4 bg-green-950/20 max-h-[300px] overflow-y-auto">
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-3 px-2">Common Inquiries</p>
            <div className="space-y-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-3 rounded-2xl bg-white/5 border border-white/5 text-sm text-gray-300 hover:bg-green-500/10 hover:border-green-500/20 hover:text-green-400 transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5 bg-[#030f05]">
            <div className="relative">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-green-500/50 transition-colors"
              />
              <button 
                onClick={() => handleSend()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-green-500 text-[#020a04] flex items-center justify-center hover:bg-green-400 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(34,197,94,0.3)] transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-green-500'
        }`}
      >
        {isOpen ? (
          <X className="text-white" size={32} />
        ) : (
          <MessageCircle className="text-white fill-white/20" size={32} />
        )}
        
        {/* Pulse Effect */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></span>
        )}
      </button>
    </div>
  );
}
