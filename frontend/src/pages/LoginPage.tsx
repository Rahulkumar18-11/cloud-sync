import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Cloud, Lock, Mail, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success('Welcome back to CloudSync!', 'Successfully authenticated.');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error('Authentication Failed', err.message || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoUser = (userType: 'USER' | 'ADMIN') => {
    if (userType === 'ADMIN') {
      setEmail('admin@cloudsync.io');
      setPassword('AdminSecret123!');
    } else {
      setEmail('user@cloudsync.io');
      setPassword('UserPassword123!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white/95 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/60 space-y-6">
        {/* Brand Title Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/30 text-white">
            <Cloud className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Sign in to CloudSync
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Secure multi-cloud file management platform
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-700 hover:to-sky-600 rounded-xl shadow-md shadow-brand-500/20 transition-all"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Fill Controls */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 space-y-2">
          <span className="block text-[11px] font-semibold text-center text-gray-400 uppercase tracking-wider">
            Quick Demo Login Fill
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoUser('USER')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-brand-500" /> Demo User
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('ADMIN')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 rounded-xl transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Demo Admin
            </button>
          </div>
        </div>

        {/* Footer Registration Redirect */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
          Don't have a CloudSync account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
