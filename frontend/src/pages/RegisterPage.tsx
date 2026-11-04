import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Cloud, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 8) return;

    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      toast.success('Account created', 'Your CloudSync account is ready.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = (error as any)?.response?.data?.detail || (error as Error).message;
      toast.error('Registration failed', message || 'Could not create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 p-4 font-sans">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl dark:bg-gray-800/90">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-lg"><Cloud className="h-8 w-8" /></div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Start storing and sharing files with CloudSync.</p>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Full name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input id="name" type="text" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input id="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting || password.length < 8} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-brand-700 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Creating account...' : 'Create account'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
