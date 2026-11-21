import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  Check,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Gift,
  Landmark,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { AuthUser, PaymentConfig } from '../types/auth';

interface ActivationScreenProps {
  user: AuthUser;
  paymentConfig: PaymentConfig;
  onRefreshStatus: () => Promise<void>;
  onLogout: () => void;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({
  user,
  paymentConfig,
  onRefreshStatus,
  onLogout,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const isExpired = Boolean(
    user.expiresAt && new Date(user.expiresAt + 'T23:59:59') < new Date()
  );
  const isSuspended = user.status === 'suspended';

  let badgeText = 'In Attesa di Accreditamento';
  let badgeColor = 'border-amber-400/40 bg-amber-500/10 text-amber-300';
  let titleText = `Benvenuto, ${user.name}! Il tuo profilo è in attesa di abilitazione`;
  let descText =
    paymentConfig.welcomeMessage ||
    "Il tuo account è registrato. Per accedere a FlavorEngine e a tutto il laboratorio computazionale del gusto, completa il pagamento o inserisci un codice invito.";

  if (isSuspended) {
    badgeText = 'Account Sospeso';
    badgeColor = 'border-rose-400/40 bg-rose-500/10 text-rose-300';
    titleText = 'Il tuo profilo è momentaneamente sospeso';
    descText =
      'Contatta Studio Serra per verificare lo stato della tua utenza o riattivare il servizio.';
  } else if (isExpired) {
    badgeText = `Abbonamento Terminato (${user.expiresAt})`;
    badgeColor = 'border-rose-400/40 bg-rose-500/10 text-rose-300';
    titleText = 'Il tuo periodo di abbonamento è terminato';
    descText =
      'Rinnova il tuo piano per continuare a utilizzare il simulatore del palato e l’analisi computazionale senza interruzioni.';
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshStatus();
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError(null);
    setPromoSuccess(null);
    try {
      const res = await fetch('/api/auth/redeem-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ promoCode: promoCode.trim().toUpperCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Codice Promo non valido.');
      }
      setPromoSuccess(data.message || 'Codice Promo attivato con successo!');
      await onRefreshStatus();
    } catch (err: any) {
      setPromoError(err?.message || 'Errore durante la verifica del codice.');
    } finally {
      setPromoLoading(false);
    }
  };

  const copyIban = () => {
    if (!paymentConfig.iban) return;
    navigator.clipboard.writeText(paymentConfig.iban.replace(/\s+/g, ''));
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2200);
  };

  const mailSubject = `Conferma Pagamento / Accreditamento Segreto dei Sapori - ${user.name}`;
  const mailBody = `Buongiorno Studio Serra,

ho registrato il mio account su Il Segreto dei Sapori:
- Nome Chef / Utente: ${user.name}
- Ristorante / Attività: ${user.company || 'N/D'}
- Email: ${user.email}
- Telefono: ${user.phone || 'N/D'}

Ho provveduto ad effettuare il pagamento. Richiedo l'accreditamento e l'attivazione dell'accesso completo al laboratorio computazionale.

Cordiali saluti,
${user.name}
Tel: ${user.phone || ''}`;

  return (
    <div className="relative min-h-screen bg-[#0b0d10] px-4 py-8 text-[#f4efe6]">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-orange-600/10 blur-[130px]" />

      <div className="relative mx-auto max-w-4xl space-y-6">
        {/* Main Status Header Card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#12151a]/95 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-wide shadow-sm">
            {isSuspended ? (
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            ) : isExpired ? (
              <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            )}
            <span className={badgeColor.split(' ')[2]}>{badgeText}</span>
          </div>

          <h1 className="font-display text-2xl font-semibold tracking-wide text-[#f6f1e7] sm:text-3xl">
            {titleText}
          </h1>

          <p className="mx-auto mt-2.5 max-w-2xl text-xs leading-relaxed text-stone-300 sm:text-sm">
            {descText}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-400">
            <span>
              Account: <strong className="text-stone-200">{user.email}</strong>
            </span>
            {user.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-stone-500" />
                <span>{user.company}</span>
              </span>
            )}
            {user.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-stone-500" />
                <span>{user.phone}</span>
              </span>
            )}
          </div>
        </div>

        {/* Promo Code Box */}
        {paymentConfig.promoEnabled && !isSuspended && (
          <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-orange-500/10 p-6 shadow-lg backdrop-blur-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <Gift className="h-4 w-4 text-amber-400" />
                  <span>Hai un Codice Promo o Invito Gratuito?</span>
                </h2>
                <p className="mt-1 text-xs text-stone-300">
                  Inserisci il codice fornito da Studio Serra per sbloccare immediatamente il tuo
                  accesso senza attendere l'accreditamento manuale.
                </p>
              </div>

              <form onSubmit={handleRedeemPromo} className="flex items-center gap-2 sm:self-start md:self-center">
                <input
                  type="text"
                  autoComplete="off"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="CODICE PROMO"
                  className="w-40 rounded-xl border border-amber-400/40 bg-black/40 px-3.5 py-2 font-code text-xs font-bold tracking-wider text-amber-200 uppercase placeholder-stone-500 outline-none transition focus:border-amber-400 focus:bg-black/60"
                />
                <button
                  type="submit"
                  disabled={promoLoading || !promoCode.trim()}
                  className="rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-semibold text-[#0b0d10] shadow-[0_0_15px_rgba(217,155,67,0.2)] transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {promoLoading ? 'Verifica...' : 'Attiva Ora'}
                </button>
              </form>
            </div>

            {promoError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{promoError}</span>
              </div>
            )}
            {promoSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
                <Check className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{promoSuccess}</span>
              </div>
            )}
          </div>
        )}

        {/* Piani e Pacchetti */}
        {paymentConfig.plansText && (
          <div className="rounded-2xl border border-white/10 bg-[#12151a]/90 p-6 shadow-xl backdrop-blur-md">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Piani di Abbonamento & Accesso Laboratorio</span>
            </h2>
            <div className="font-sans text-xs whitespace-pre-line leading-relaxed text-stone-300 sm:text-sm">
              {paymentConfig.plansText}
            </div>
          </div>
        )}

        {/* Modalità di Pagamento: PayPal QR Code + Bonifico Bancario IBAN */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Opzione 1: PayPal QR Code */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#12151a]/90 p-6 shadow-xl backdrop-blur-md">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100">
                    1. Pagamento Rapido PayPal
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Inquadra il QR Code con lo smartphone o clicca per pagare online
                  </p>
                </div>
              </div>

              <div className="my-4 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white p-4 shadow-inner">
                <img
                  src="/paypal-qr.png"
                  alt="QR Code PayPal Studio Serra"
                  className="h-44 w-44 object-contain"
                />
                <span className="mt-2 text-[11px] font-bold text-slate-800">
                  Scansiona per pagare con PayPal
                </span>
              </div>
            </div>

            {paymentConfig.paymentUrl && (
              <a
                href={paymentConfig.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/40 bg-sky-600/90 py-2.5 px-4 text-xs font-semibold text-white shadow-[0_0_15px_rgba(2,132,199,0.25)] transition hover:bg-sky-500"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Apri Pagamento Online PayPal</span>
              </a>
            )}
          </div>

          {/* Opzione 2: Bonifico Bancario / Studio Serra */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#12151a]/90 p-6 shadow-xl backdrop-blur-md">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-400">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100">
                    2. Bonifico Bancario / Studio Serra
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Coordinate bancarie per bonifico istantaneo o ordinario
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 text-xs text-stone-300">
                <div>
                  <span className="text-[11px] text-stone-400">Intestatario:</span>
                  <div className="font-semibold text-stone-100">
                    {paymentConfig.bankBeneficiary || 'Studio Serra'}
                  </div>
                </div>

                {paymentConfig.iban ? (
                  <div>
                    <span className="text-[11px] text-stone-400">IBAN:</span>
                    <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                      <span className="font-code text-xs font-semibold tracking-wide text-emerald-300 break-all">
                        {paymentConfig.iban}
                      </span>
                      <button
                        type="button"
                        onClick={copyIban}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                      >
                        {copiedIban ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedIban ? 'Copiato' : 'Copia'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] italic text-stone-400">
                    Coordinate IBAN disponibili via email o telefono cliccando qui sotto.
                  </p>
                )}

                <div>
                  <span className="text-[11px] text-stone-400">Causale consigliata:</span>
                  <div className="font-code text-[11px] text-amber-200/90 break-all">
                    Abbonamento Segreto Sapori - {user.email}
                  </div>
                </div>

                {paymentConfig.contactPhone && (
                  <div>
                    <span className="text-[11px] text-stone-400">Telefono / WhatsApp:</span>
                    <div className="font-medium text-stone-200">{paymentConfig.contactPhone}</div>
                  </div>
                )}
              </div>
            </div>

            <a
              href={`mailto:${paymentConfig.contactEmail || 'direzione@serrastudio.it'}?subject=${encodeURIComponent(
                mailSubject
              )}&body=${encodeURIComponent(mailBody)}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-600/90 py-2.5 px-4 text-xs font-semibold text-white shadow-[0_0_15px_rgba(16,185,129,0.25)] transition hover:bg-emerald-500"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Invia Notifica Pagamento allo Studio</span>
            </a>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#12151a]/90 p-4 shadow-xl backdrop-blur-md sm:flex-row">
          <div className="text-center text-xs text-stone-400 sm:text-left">
            Stato account: <strong className="text-amber-200">{badgeText}</strong>. Appena
            l’amministratore convalida l’accreditamento, clicca per accedere.
          </div>

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-stone-300 transition hover:bg-white/[0.08] hover:text-stone-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Esci</span>
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-xs font-semibold text-[#0b0d10] shadow-[0_0_15px_rgba(217,155,67,0.2)] transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Verifica Stato Accreditamento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
