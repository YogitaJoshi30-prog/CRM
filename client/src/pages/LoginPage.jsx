import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Shield, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('admin@drisu-demo.local');
  const [password, setPassword] = useState('Demo@123456');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'CLIENT') {
        navigate('/client/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSwitch = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@123456');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 shadow-xl shadow-brand-500/30 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">DRISU</h2>
        <p className="mt-1 text-sm font-semibold text-brand-400">COMPLIANCE OPERATIONS PORTAL</p>
        <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto">
          An End-to-End Client, Case, Document and Compliance Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center transition disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          {/* 1-Click Demo Accounts Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3 text-center">
              ⚡ 1-Click Quick Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSwitch('admin@drisu-demo.local')}
                className={`p-2 rounded-lg border text-left text-xs transition ${
                  email === 'admin@drisu-demo.local' ? 'bg-brand-500/20 border-brand-500 text-white' : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center text-brand-300">
                  <Shield className="w-3 h-3 mr-1" /> Admin
                </div>
                <div className="text-[10px] text-slate-500 truncate">admin@drisu-demo.local</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSwitch('manager@drisu-demo.local')}
                className={`p-2 rounded-lg border text-left text-xs transition ${
                  email === 'manager@drisu-demo.local' ? 'bg-brand-500/20 border-brand-500 text-white' : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center text-purple-300">
                  <Shield className="w-3 h-3 mr-1" /> Manager
                </div>
                <div className="text-[10px] text-slate-500 truncate">manager@drisu-demo.local</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSwitch('staff1@drisu-demo.local')}
                className={`p-2 rounded-lg border text-left text-xs transition ${
                  email === 'staff1@drisu-demo.local' ? 'bg-brand-500/20 border-brand-500 text-white' : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center text-blue-300">
                  <Shield className="w-3 h-3 mr-1" /> Staff
                </div>
                <div className="text-[10px] text-slate-500 truncate">staff1@drisu-demo.local</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSwitch('client1@drisu-demo.local')}
                className={`p-2 rounded-lg border text-left text-xs transition ${
                  email === 'client1@drisu-demo.local' ? 'bg-teal-500/20 border-teal-500 text-white' : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold flex items-center text-teal-300">
                  <Shield className="w-3 h-3 mr-1" /> Client Portal
                </div>
                <div className="text-[10px] text-slate-500 truncate">client1@drisu-demo.local</div>
              </button>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 text-center">
              Default password: <span className="font-mono text-slate-300">Demo@123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
