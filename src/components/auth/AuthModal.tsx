import React, { useState } from 'react';
import { UserProfile, Role, WhiteLabelConfig } from '../../types';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  whiteLabel: WhiteLabelConfig;
  onAuthenticate: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  whiteLabel,
  onAuthenticate
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('tanvirislam2607@gmail.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Tanvir Islam');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = (role: Role, name: string, em: string) => {
    onAuthenticate({
      id: `usr_${role}_${Date.now()}`,
      email: em,
      full_name: `${name} (${role.toUpperCase()})`,
      role,
      preferred_language: 'en',
      created_at: new Date().toISOString()
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (mode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (data.user) {
            onAuthenticate({
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || 'Merchant Owner',
              role: 'owner',
              preferred_language: (data.user.user_metadata?.preferred_language as any) || 'en',
              created_at: data.user.created_at
            });
            onClose();
            return;
          }
        } else if (mode === 'register') {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, preferred_language: 'en' } }
          });
          if (error) throw error;
          if (data.user) {
            onAuthenticate({
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName,
              role: 'owner',
              preferred_language: 'en',
              created_at: data.user.created_at
            });
            onClose();
            return;
          }
        }
      } else {
        // Local interactive authentication
        onAuthenticate({
          id: `usr_local_${Date.now()}`,
          email,
          full_name: mode === 'register' ? fullName : (email.includes('admin') ? 'Store Admin' : 'Tanvir Islam (Merchant)'),
          role: 'owner',
          preferred_language: 'en',
          created_at: new Date().toISOString()
        });
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {mode === 'login' ? `Sign In to ${whiteLabel.app_name}` : mode === 'register' ? 'Register New Merchant Account' : 'Reset Password'}
            </span>
            <p className="text-[11px] text-slate-500">
              Supabase Auth & Session Verification
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Quick Sandbox Login Buttons */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl space-y-2">
            <div className="font-semibold text-indigo-950 dark:text-indigo-200 text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Instant Quick-Login (Evaluation & Review Mode)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('owner', 'Tanvir Islam', 'tanvirislam2607@gmail.com')}
                className="py-1.5 px-2 font-semibold text-[11px] bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded shadow-2xs border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 cursor-pointer"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Sabbir Ahmed', 'sabbir.ops@gadgethubbd.com')}
                className="py-1.5 px-2 font-semibold text-[11px] bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded shadow-2xs border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff', 'Nusrat Jahan', 'nusrat.support@gadgethubbd.com')}
                className="py-1.5 px-2 font-semibold text-[11px] bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded shadow-2xs border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 cursor-pointer"
              >
                Staff
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-lg text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tanvir Islam"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Workspace' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          {/* Toggle login/register */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-slate-500">
            {mode === 'login' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
