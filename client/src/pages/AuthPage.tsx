import React, { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Clapperboard, LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' }> = ({ mode }) => {
  const isSignup = mode === 'signup';
  const { user, loading, login, signup } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const destination = (location.state as { from?: string } | null)?.from ?? '/';

  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Checking your session…</div>;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    if (isSignup && !name.trim()) return setError('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return setError('Enter a valid email address.');
    if (password.length < 10) return setError('Password must be at least 10 characters.');
    if (password.length > 128) return setError('Password must be 128 characters or fewer.');
    setSubmitting(true);
    try {
      if (isSignup) await signup(name.trim(), cleanEmail, password);
      else await login(cleanEmail, password);
      navigate(destination, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not sign in. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white"><Clapperboard className="h-5 w-5" /></div>
          <div><p className="text-sm font-bold text-slate-900">AffiliateOps Studio</p><p className="text-xs text-slate-500">AI Affiliate Video Engine</p></div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm text-slate-500">{isSignup ? 'Sign up to continue to your video workspace.' : 'Log in to continue to your video workspace.'}</p>
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          {isSignup && <label className="block text-sm font-medium text-slate-700">Name<input autoComplete="name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" /></label>}
          <label className="block text-sm font-medium text-slate-700">Email<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" /></label>
          <label className="block text-sm font-medium text-slate-700">Password<input type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} required minLength={10} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" /><span className="mt-1 block text-xs font-normal text-slate-500">At least 10 characters.</span></label>
          {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
          <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}{submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">{isSignup ? 'Already have an account?' : 'New to AffiliateOps?'}{' '}
          <Link className="font-semibold text-teal-700 hover:text-teal-800" to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create an account'}</Link>
        </p>
      </section>
    </main>
  );
};
