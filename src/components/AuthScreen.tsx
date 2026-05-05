import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Vote, Mail, Lock, LogIn } from 'lucide-react';
import { signInWithGoogle, auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface Props {
  onLogin?: () => void;
}

export default function AuthScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin?.();
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found') {
        setError('Google Sign-In is not enabled in your Firebase Console. Please go to Authentication > Sign-in method and enable Google.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain Unauthorized. Action: Add "${window.location.hostname}" to "Authorized domains" in your Firebase Auth Console Settings.`);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onLogin?.();
    } catch (err: any) {
      if (err.code === 'auth/network-request-failed') {
        setError('Network Error: This usually happens when third-party cookies are blocked or the connection is unstable. Please ensure your browser allows popups and check your internet connection.');
      } else if (err.code === 'auth/configuration-not-found') {
        setError('Firebase Auth is not fully configured. 1) Enable Google Sign-In in Firebase Console. 2) Add this site\'s domain to "Authorized domains" in Auth Settings.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain Unauthorized. Action: Add "${window.location.hostname}" to your Firebase Auth "Authorized domains" list.`);
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
        console.error('Firebase Auth Error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gov-bg p-6 font-sans text-gov-slate">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-gov-navy/10 bg-white shadow-2xl"
      >
        <div className="bg-gov-navy p-10 text-center text-white">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gov-gold text-gov-navy shadow-lg font-bold">
            <Vote size={32} />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Access VoterMetric</h1>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">Iligan City Information System</p>
        </div>

        <form onSubmit={handleEmailAuth} className="p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100">
              <p className="font-bold uppercase tracking-widest text-[9px] mb-1">Security Alert</p>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="group relative">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gov-navy/30 group-focus-within:text-gov-navy transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg py-3 pl-11 pr-4 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy/40 focus:ring-4 focus:ring-gov-navy/5 placeholder:text-gov-navy/20"
                  placeholder="name@email.com"
                  required
                />
              </div>
            </div>

            <div className="group relative">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gov-navy/30 group-focus-within:text-gov-navy transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg py-3 pl-11 pr-4 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy/40 focus:ring-4 focus:ring-gov-navy/5 placeholder:text-gov-navy/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-gov-navy py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-900 shadow-md active:scale-[0.98] disabled:opacity-40"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
            <LogIn size={16} />
          </button>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-gov-navy/10"></div>
            <span className="font-mono text-[9px] uppercase tracking-tighter text-gov-navy/20 font-black">Secure Authentication</span>
            <div className="h-[1px] flex-1 bg-gov-navy/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-gov-navy/10 bg-white py-3 text-xs font-bold text-gov-navy hover:bg-gov-bg transition-all active:scale-[0.98] disabled:opacity-40 shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" className="h-4 w-4" alt="Google" />
            Continue with Google
          </button>

          <div className="mt-8 text-center border-t border-gov-navy/5 pt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black uppercase tracking-widest text-gov-navy/40 hover:text-gov-navy transition-colors"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
