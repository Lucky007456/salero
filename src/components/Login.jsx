import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);

    try {
      await login(email, password);
      // Clear any stale local bypass flags
      localStorage.removeItem('isLoggedIn');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030f05] flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-green-500/30 
                        mx-auto mb-4 shadow-[0_0_25px_rgba(34,197,94,0.3)]">
            <img src="/logo.png" alt="Alphovins" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 
                       bg-clip-text text-transparent">
            ALPHOVINS GLOBAL AGRO EXPORTS
          </h1>
          <p className="text-green-500/60 mt-1 text-sm">
            Banana Cultivation Billing System
          </p>
          <p className="text-green-600/40 text-xs mt-0.5">
            வாழை சாகுபடி பில்லிங் அமைப்பு
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-green-200 mb-6 text-center">
            Admin Login
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-700/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@salero.com"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-600/50 hover:text-green-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loadingLocal} className="btn-primary w-full mt-6">
              <LogIn size={20} />
              {loadingLocal ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-green-500/60 text-sm">
              Authorized personnel only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
