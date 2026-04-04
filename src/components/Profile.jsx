import React, { useState, useEffect } from 'react';
import { Save, User, Settings, Globe, LogOut, MapPin, Phone, Building, Mail, Hash } from 'lucide-react';
import { getPreferences, savePreferences } from '../services/preferenceService';
import { auth, isFirebaseConfigured } from '../firebase';
import { signOut } from 'firebase/auth';
import { BANANA_VARIETIES } from '../utils/format';

export default function Profile({ onNavigate }) {
  const [prefs, setPrefs] = useState({
    language: 'en',
    defaultRate: '',
    defaultVariety: '',
    defaultWastage: '',
    traderName: '',
    traderPhone: '',
    traderEmail: '',
    traderAddress: '',
    whatsappGreeting: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const userEmail = auth?.currentUser?.email || 'admin@salero.com';

  useEffect(() => {
    const loadPrefs = async () => {
      const data = await getPreferences();
      setPrefs(data);
      setLoading(false);
    };
    loadPrefs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await savePreferences(prefs);
    setSaving(false);
    setMessage('Preferences saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    window.location.reload(); // Reload handles kicking out nicely via App state
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-green-500/60 animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 slide-up pb-8">
      {/* Header Profile Card */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-glow shrink-0">
          <User size={32} className="text-white" />
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-2xl font-bold text-green-200">Admin Profile</h2>
          <p className="text-green-500/60 font-mono mt-1">{userEmail}</p>
        </div>
        <button onClick={handleLogout} className="btn-danger !text-sm flex items-center gap-2 shrink-0">
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="glass-card p-6 space-y-6 relative">
        <div className="flex items-center gap-2 mb-2 border-b border-green-800/30 pb-3">
          <Settings size={20} className="text-green-400" />
          <h3 className="text-lg font-semibold text-green-300">App Preferences</h3>
        </div>

        <div className="space-y-4">
          {/* Language config */}
          <div>
            <label className="label-text flex items-center gap-1.5">
              <Globe size={14} /> UI Language
              <span className="label-tamil ml-1">மொழி</span>
            </label>
            <select
              value={prefs.language}
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
              className="select-field"
            >
              <option value="en">English (Default)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
            <p className="text-xs text-green-600/50 mt-1">
              Currently mostly uses bilingual text. Future updates will isolate language selectively based on this.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Rate */}
            <div>
              <label className="label-text">
                Default Rate per KG (₹)
              </label>
              <input
                type="number"
                value={prefs.defaultRate}
                onChange={(e) => setPrefs({ ...prefs, defaultRate: e.target.value })}
                placeholder="e.g. 15.50"
                className="input-field"
                step="0.01"
              />
            </div>

            {/* Default Variety */}
            <div>
              <label className="label-text">
                Default Banana Variety
              </label>
              <select
                value={prefs.defaultVariety}
                onChange={(e) => setPrefs({ ...prefs, defaultVariety: e.target.value })}
                className="select-field"
              >
                <option value="">None (Select manually)</option>
                {BANANA_VARIETIES.map(v => (
                  <option key={v.value} value={v.value}>{v.label} - {v.tamil}</option>
                ))}
              </select>
            </div>
            
            {/* Default Wastage */}
            <div>
              <label className="label-text flex items-center gap-1.5">
                <Hash size={14} /> Default Wastage (kg)
              </label>
              <input
                type="number"
                value={prefs.defaultWastage}
                onChange={(e) => setPrefs({ ...prefs, defaultWastage: e.target.value })}
                placeholder="e.g. 0.5"
                className="input-field"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-green-800/20">
            <Building size={18} className="text-green-400/70" />
            <h4 className="text-sm font-semibold text-green-400/80">Business / Trader Details</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Building size={14} /> Business/Trader Name
                </label>
                <input
                  type="text"
                  value={prefs.traderName}
                  onChange={(e) => setPrefs({ ...prefs, traderName: e.target.value })}
                  placeholder="e.g. ALPHOVINS..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text flex items-center gap-1.5">
                  <Phone size={14} /> Contact Phone
                </label>
                <input
                  type="tel"
                  value={prefs.traderPhone}
                  onChange={(e) => setPrefs({ ...prefs, traderPhone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-text flex items-center gap-1.5">
                  <Mail size={14} /> Business Email
                </label>
                <input
                  type="email"
                  value={prefs.traderEmail}
                  onChange={(e) => setPrefs({ ...prefs, traderEmail: e.target.value })}
                  placeholder="e.g. mail@alphovins.com"
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-text flex items-center gap-1.5">
                  <MapPin size={14} /> Business Address
                </label>
                <input
                  type="text"
                  value={prefs.traderAddress}
                  onChange={(e) => setPrefs({ ...prefs, traderAddress: e.target.value })}
                  placeholder="e.g. 123, Main Street..."
                  className="input-field"
                />
              </div>
          </div>

          {/* WhatsApp Custom Greeting */}
          <div>
            <label className="label-text">
              WhatsApp Default Greeting
              <span className="label-tamil">வாட்ஸ்அப் செய்தி</span>
            </label>
            <textarea
              value={prefs.whatsappGreeting}
              onChange={(e) => setPrefs({ ...prefs, whatsappGreeting: e.target.value })}
              placeholder="e.g. Thanks for doing business with ALPHOVINS!"
              className="input-field min-h-[80px] py-3"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-green-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-emerald-400 h-5">
            {message}
          </p>
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
