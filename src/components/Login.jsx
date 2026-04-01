import React, { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { auth, isFirebaseConfigured } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFirebaseConfigured) {
      // Skip auth if Firebase not configured — go straight to app
      onLogin();
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onLogin();
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
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 
                        flex items-center justify-center mx-auto mb-4 shadow-glow-lg animate-pulse-glow">
            <span className="text-4xl">🍌</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 
                       bg-clip-text text-transparent">
            SLAero Operation
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
            {isSignUp ? 'Create Account' : 'Welcome Back'}
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
                  placeholder="your@email.com"
                  className="input-field pl-11"
                  required={isFirebaseConfigured}
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
                  required={isFirebaseConfigured}
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

            <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
              <LogIn size={20} />
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-green-500/60 hover:text-green-400 text-sm transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-green-800/30">
            <p className="text-xs text-green-500/40 text-center mb-3">
              Skip login and use local storage
            </p>
            <button onClick={handleSkip} className="btn-secondary w-full">
              Continue without login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
