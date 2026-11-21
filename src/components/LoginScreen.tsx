import React, { useState } from 'react';
import { Beaker, Eye, EyeOff, Lock, LogIn, Mail, Sparkles } from 'lucide-react';
import { AuthUser } from '../types/auth';

interface LoginScreenProps {
  onSuccess: (user: AuthUser) => void;
}

const TRIAL_EMAILS = new Set([
  'demo@serrastudio.it',
  'prova@serrastudio.it',
  'demo@ilsegretodeisapori.it',
  'demo',
  'prova',
]);

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);

  const isTrialEmail = TRIAL_EMAILS.has(email.trim().toLowerCase());

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

  const handleTrialLogin = async () => {
    setError(null);
    setTrialLoading(true);
    try {
      const res = await fetch('/api/auth/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Impossibile avviare la sessione di prova.');
        return;
      }
      if (data.user) {
        onSuccess(data.user);
      }
    } catch {
      setError('Errore di connessione al server.');
    } finally {
      setTrialLoading(false);
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
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="login-password" className="block text-xs font-medium text-stone-300">
                Password
              </label>
              {isTrialEmail && (
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                  Non richiesta per account di prova
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required={!isTrialEmail}
                disabled={isTrialEmail}
                value={isTrialEmail ? '' : password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isTrialEmail ? 'Accesso senza password attivo' : '••••••••'}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-10 text-sm text-stone-100 placeholder-stone-500 outline-none transition focus:border-amber-400/60 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
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
            disabled={loading || trialLoading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/90 to-orange-500/90 px-4 py-2.5 text-sm font-semibold text-[#0b0d10] shadow-[0_0_24px_rgba(217,155,67,0.2)] transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? 'Accesso in corso...' : 'Accedi al Laboratorio'}</span>
          </button>
        </form>

        {/* Divisore & Accesso DEMO */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">oppure</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          disabled={loading || trialLoading}
          onClick={handleTrialLogin}
          className="group relative flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-gradient-to-b from-amber-500/15 via-amber-500/10 to-orange-500/10 px-4 py-3.5 text-center shadow-lg transition-all duration-200 hover:border-amber-400/70 hover:bg-amber-500/20 hover:shadow-[0_0_24px_rgba(217,155,67,0.25)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 transition-transform group-hover:scale-110" />
            <span className="text-sm font-semibold tracking-wide text-amber-200">
              {trialLoading ? 'Accesso DEMO in corso...' : 'Accedi alla Versione DEMO'}
            </span>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Demo 10%
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            Accesso immediato senza credenziali &bull; Catalogo demo e simulatore attivi
          </span>
        </button>

        <p className="mt-5 text-center text-[11px] text-stone-500">
          Accesso completo riservato agli account autorizzati.
        </p>
      </div>
    </div>
  );
};
