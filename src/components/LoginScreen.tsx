import React, { useState } from 'react';
import { Beaker, Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import { AuthUser } from '../types/auth';

interface LoginScreenProps {
  onSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Accesso non riuscito.');
        return;
      }
      if (data.user) {
        onSuccess(data.user);
      }
    } catch {
      setError('Errore di connessione al server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-4 py-12 text-[#f4efe6]">
      {/* Glow ambientale */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-orange-600/10 blur-[120px]" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12151a]/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-orange-600/10 text-amber-300 shadow-[0_0_32px_rgba(217,155,67,0.22)]">
            <Beaker className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-wide text-[#f6f1e7]">
            Il Segreto dei Sapori
          </h1>
          <p className="mt-1 text-xs text-stone-400">
            FlavorEngine &bull; Laboratorio Computazionale del Gusto
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-stone-300">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@dominio.it"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-stone-100 placeholder-stone-500 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.06]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-stone-300">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-10 text-sm text-stone-100 placeholder-stone-500 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.06]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-stone-200"
                tabIndex={-1}
                aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/90 to-orange-500/90 px-4 py-2.5 text-sm font-semibold text-[#0b0d10] shadow-[0_0_24px_rgba(217,155,67,0.2)] transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? 'Accesso in corso...' : 'Accedi al Laboratorio'}</span>
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-stone-500">
          Accesso riservato agli account autorizzati.
        </p>
      </div>
    </div>
  );
};
