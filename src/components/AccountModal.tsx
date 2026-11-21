import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Edit2,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AuthUser, PaymentConfig, UserRole, UserStatus } from '../types/auth';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const isTrial = currentUser.role === 'trial' || Boolean(currentUser.isTrial);
  const [tab, setTab] = useState<'profile' | 'subscribers' | 'payments'>('profile');

  // Cambio password personale
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // Gestione Abbonati (Admin)
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'pending' | 'active' | 'expired'>('all');
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [adminMsg, setAdminMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Form Nuovo Abbonato
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserCompany, setNewUserCompany] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [newUserStatus, setNewUserStatus] = useState<UserStatus>('active');
  const [newUserExpiresAt, setNewUserExpiresAt] = useState('');
  const [newUserPlan, setNewUserPlan] = useState('monthly');
  const [newUserNotes, setNewUserNotes] = useState('');

  // Editing Abbonato
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');
  const [editNotes, setEditNotes] = useState('');
  const [editPlan, setEditPlan] = useState('');

  // Configurazione Pagamenti
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    paymentUrl: 'https://www.paypal.me/StudioSerra',
    iban: '',
    bankBeneficiary: 'Studio Serra',
    contactEmail: 'direzione@serrastudio.it',
    contactPhone: '',
    plansText: '',
    welcomeMessage: '',
    promoEnabled: true,
    promoCode: 'PROVA-SAPORI',
    promoDays: 30,
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchOverview = async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/overview', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        if (data.paymentConfig) setPaymentConfig(data.paymentConfig);
      }
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchOverview();
    }
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  const pendingCount = users.filter((u) => u.status === 'pending' && u.role !== 'admin').length;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'err', text: 'Le nuove password non coincidono.' });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwMsg({ type: 'err', text: data.error || 'Errore aggiornamento password.' });
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwMsg({ type: 'ok', text: 'Password aggiornata con successo.' });
    } catch {
      setPwMsg({ type: 'err', text: 'Errore di rete.' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMsg(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newUserName.trim(),
          company: newUserCompany.trim(),
          email: newUserEmail.trim(),
          phone: newUserPhone.trim(),
          password: newUserPassword,
          role: newUserRole,
          status: newUserStatus,
          expiresAt: newUserExpiresAt || null,
          subscriptionPlan: newUserPlan,
          notes: newUserNotes.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminMsg({ type: 'err', text: data.error || 'Errore creazione abbonato.' });
        return;
      }
      setUsers(data.users || []);
      setNewUserName('');
      setNewUserCompany('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserPassword('');
      setNewUserNotes('');
      setShowNewUser(false);
      setAdminMsg({ type: 'ok', text: 'Nuovo abbonato accreditato con successo!' });
    } catch {
      setAdminMsg({ type: 'err', text: 'Errore di rete.' });
    }
  };

  const handleUpdateSubscriber = async (userId: string, patch: Record<string, any>) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUsers(data.users || []);
        setEditingUserId(null);
        setAdminMsg({ type: 'ok', text: 'Abbonato aggiornato con successo.' });
      } else {
        setAdminMsg({ type: 'err', text: data.error || 'Errore durante l’aggiornamento.' });
      }
    } catch {
      setAdminMsg({ type: 'err', text: 'Errore di rete.' });
    }
  };

  const handleAccreditInstant = (u: AuthUser, daysToAdd = 30) => {
    const exp = new Date();
    exp.setDate(exp.getDate() + daysToAdd);
    handleUpdateSubscriber(u.id, {
      status: 'active',
      expiresAt: exp.toISOString().slice(0, 10),
      notes: (u.notes ? u.notes + ' | ' : '') + `Accreditato il ${new Date().toLocaleDateString('it-IT')}`,
    });
  };

  const handleExtendSubscription = (u: AuthUser, months: number) => {
    const base =
      u.expiresAt && new Date(u.expiresAt + 'T23:59:59') > new Date()
        ? new Date(u.expiresAt + 'T23:59:59')
        : new Date();
    base.setMonth(base.getMonth() + months);
    handleUpdateSubscriber(u.id, {
      status: 'active',
      expiresAt: base.toISOString().slice(0, 10),
    });
  };

  const handleDeleteUser = async (u: AuthUser) => {
    if (!window.confirm(`Sei sicuro di voler eliminare l'account di ${u.name} (${u.email})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((item) => item.id !== u.id));
        setAdminMsg({ type: 'ok', text: `Account di ${u.name} eliminato.` });
      }
    } catch {
      setAdminMsg({ type: 'err', text: 'Errore eliminazione utente.' });
    }
  };

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayment(true);
    setPaymentMsg(null);
    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(paymentConfig),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPaymentConfig(data.paymentConfig);
        setPaymentMsg({ type: 'ok', text: 'Coordinate e opzioni di pagamento salvate con successo!' });
      } else {
        setPaymentMsg({ type: 'err', text: data.error || 'Errore salvataggio opzioni.' });
      }
    } catch {
      setPaymentMsg({ type: 'err', text: 'Errore di rete.' });
    } finally {
      setSavingPayment(false);
    }
  };

  // Filtraggio utenti
  const filteredUsers = users.filter((u) => {
    if (u.role === 'admin') return true;
    const isExpired = Boolean(u.expiresAt && new Date(u.expiresAt + 'T23:59:59') < new Date());

    if (subscriberFilter === 'pending' && u.status !== 'pending') return false;
    if (subscriberFilter === 'active' && (u.status !== 'active' || isExpired)) return false;
    if (subscriberFilter === 'expired' && !isExpired && u.status !== 'suspended') return false;

    if (subscriberSearch.trim()) {
      const q = subscriberSearch.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchCompany = (u.company || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').includes(q);
      return matchName || matchEmail || matchCompany || matchPhone;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12151a] text-[#f4efe6] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f6f1e7]">
                {isAdmin ? 'Pannello Amministratore & Abbonati' : 'Account Personale'}
              </h2>
              <p className="text-xs text-stone-400">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-stone-200"
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#0e1115] px-6">
          <button
            onClick={() => setTab('profile')}
            className={`border-b-2 px-4 py-3 text-xs font-semibold transition ${
              tab === 'profile'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Profilo Personale
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setTab('subscribers')}
                className={`relative flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                  tab === 'subscribers'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Gestione Abbonati</span>
                {pendingCount > 0 && (
                  <span className="flex h-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-black animate-pulse">
                    {pendingCount} in attesa
                  </span>
                )}
              </button>

              <button
                onClick={() => setTab('payments')}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                  tab === 'payments'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Coordinate & Piani</span>
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: PROFILO PERSONALE */}
          {tab === 'profile' && (
            <div className="max-w-xl space-y-5">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-stone-300">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Ruolo account</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 font-medium text-amber-200">
                    {isAdmin && <Shield className="h-3 w-3" />}
                    {isAdmin
                      ? 'Amministratore di Sistema'
                      : isTrial
                        ? 'Account Demo (10% dati)'
                        : 'Abbonato'}
                  </span>
                </div>
                {currentUser.company && (
                  <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-stone-400">Attività / Ristorante</span>
                    <span className="text-stone-200 font-medium">{currentUser.company}</span>
                  </div>
                )}
                {currentUser.expiresAt && (
                  <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-stone-400">Scadenza Abbonamento</span>
                    <span className="text-amber-300 font-semibold">{currentUser.expiresAt}</span>
                  </div>
                )}
              </div>

              {isTrial ? (
                <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.07] p-4 text-xs leading-relaxed text-amber-100">
                  <div className="font-semibold text-amber-300">
                    Modalità DEMO Attiva (10% del Catalogo)
                  </div>
                  <p className="mt-1 text-stone-300">
                    Stai provando la versione dimostrativa gratuita senza password. Per sbloccare
                    tutto il catalogo e le ricette senza limiti, effettua l’accreditamento
                    richiedendo un abbonamento.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <h3 className="text-sm font-medium text-stone-200">Cambia password personale</h3>

                  <div>
                    <label className="mb-1 block text-xs text-stone-400">Password attuale</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-stone-100 outline-none focus:border-amber-400/60"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-stone-400">Nuova password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-stone-400">Conferma nuova password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>
                  </div>

                  {pwMsg && (
                    <div
                      className={`rounded-lg px-3 py-2 text-xs ${
                        pwMsg.type === 'ok'
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                      }`}
                    >
                      {pwMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-[#0b0d10] transition hover:bg-amber-400 disabled:opacity-60"
                  >
                    {pwLoading ? 'Salvataggio...' : 'Aggiorna password'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: GESTIONE ABBONATI & ACCREDITAMENTO (ADMIN) */}
          {tab === 'subscribers' && isAdmin && (
            <div className="space-y-6">
              {/* Statistiche & KPI in evidenza */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <span className="text-[11px] text-stone-400">Totale Utenti</span>
                  <div className="mt-1 font-display text-xl font-bold text-stone-100">
                    {users.length}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-400/30 bg-amber-500/[0.06] p-3.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold">
                    <Clock className="h-3 w-3" />
                    <span>In Attesa di Accredito</span>
                  </span>
                  <div className="mt-1 font-display text-xl font-bold text-amber-300">
                    {pendingCount}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/[0.06] p-3.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-300">
                    <UserCheck className="h-3 w-3" />
                    <span>Abbonati Attivi</span>
                  </span>
                  <div className="mt-1 font-display text-xl font-bold text-emerald-300">
                    {
                      users.filter(
                        (u) =>
                          u.status === 'active' &&
                          (!u.expiresAt || new Date(u.expiresAt + 'T23:59:59') >= new Date())
                      ).length
                    }
                  </div>
                </div>

                <div className="rounded-xl border border-rose-400/30 bg-rose-500/[0.06] p-3.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-rose-300">
                    <AlertCircle className="h-3 w-3" />
                    <span>Scaduti / Sospesi</span>
                  </span>
                  <div className="mt-1 font-display text-xl font-bold text-rose-300">
                    {
                      users.filter(
                        (u) =>
                          u.status === 'suspended' ||
                          (u.expiresAt && new Date(u.expiresAt + 'T23:59:59') < new Date())
                      ).length
                    }
                  </div>
                </div>
              </div>

              {adminMsg && (
                <div
                  className={`rounded-xl px-4 py-2.5 text-xs ${
                    adminMsg.type === 'ok'
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border border-rose-500/30 bg-rose-500/10 text-rose-200'
                  }`}
                >
                  {adminMsg.text}
                </div>
              )}

              {/* Barra Controlli: Ricerca, Filtri, Tasto Crea Abbonato */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
                    <input
                      type="text"
                      placeholder="Cerca chef, email, locale..."
                      value={subscriberSearch}
                      onChange={(e) => setSubscriberSearch(e.target.value)}
                      className="w-56 rounded-xl border border-white/10 bg-white/[0.04] py-1.5 pl-8 pr-3 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex rounded-xl border border-white/10 bg-white/[0.02] p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setSubscriberFilter('all')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        subscriberFilter === 'all'
                          ? 'bg-amber-500/20 text-amber-200'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Tutti ({users.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubscriberFilter('pending')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        subscriberFilter === 'pending'
                          ? 'bg-amber-500 text-black'
                          : 'text-amber-300 hover:bg-white/5'
                      }`}
                    >
                      In Attesa ({pendingCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubscriberFilter('active')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        subscriberFilter === 'active'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Attivi
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubscriberFilter('expired')}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        subscriberFilter === 'expired'
                          ? 'bg-rose-500/20 text-rose-200'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Scaduti
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchOverview}
                    disabled={usersLoading}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-stone-300 transition hover:bg-white/[0.08]"
                    title="Ricarica elenco"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNewUser((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1.5 text-xs font-semibold text-[#0b0d10] shadow-[0_0_15px_rgba(217,155,67,0.2)] transition hover:from-amber-400 hover:to-orange-400"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{showNewUser ? 'Annulla' : 'Nuovo Abbonato'}</span>
                  </button>
                </div>
              </div>

              {/* Form Nuovo Abbonato Espandibile */}
              {showNewUser && (
                <form
                  onSubmit={handleCreateUser}
                  className="rounded-2xl border border-amber-400/30 bg-amber-500/[0.04] p-5 shadow-lg backdrop-blur-md"
                >
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-300">
                    Accredita Nuovo Abbonato / Utente
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Nome e Cognome *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nome Chef o Utente"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Ristorante / Azienda</label>
                      <input
                        type="text"
                        placeholder="Es. Ristorante Belvedere"
                        value={newUserCompany}
                        onChange={(e) => setNewUserCompany(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="chef@email.it"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Telefono / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="+39 340 1234567"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Password iniziale *</label>
                      <input
                        type="text"
                        required
                        minLength={6}
                        placeholder="Min. 6 caratteri"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Ruolo Account</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                      >
                        <option value="user">Abbonato Standard</option>
                        <option value="trial">Account Demo (10% dati)</option>
                        <option value="admin">Amministratore</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Stato iniziale</label>
                      <select
                        value={newUserStatus}
                        onChange={(e) => setNewUserStatus(e.target.value as UserStatus)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                      >
                        <option value="active">Attivo / Accreditato</option>
                        <option value="pending">In Attesa di Pagamento</option>
                        <option value="suspended">Sospeso</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Data Scadenza Abbonamento</label>
                      <input
                        type="date"
                        value={newUserExpiresAt}
                        onChange={(e) => setNewUserExpiresAt(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Piano Abbonamento</label>
                      <select
                        value={newUserPlan}
                        onChange={(e) => setNewUserPlan(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                      >
                        <option value="monthly">Mensile Chef & Ricerca (49€)</option>
                        <option value="yearly">Annuale Laboratorio (390€)</option>
                        <option value="promo">Promo / Prova</option>
                        <option value="lifetime">Illimitato / Partner</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Note interne</label>
                      <input
                        type="text"
                        placeholder="Es. Bonifico ricevuto il 21/11"
                        value={newUserNotes}
                        onChange={(e) => setNewUserNotes(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewUser(false)}
                      className="rounded-lg border border-white/10 px-3.5 py-1.5 text-xs text-stone-300 hover:bg-white/5"
                    >
                      Chiudi
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
                    >
                      Salva & Accredita
                    </button>
                  </div>
                </form>
              )}

              {/* Elenco Abbonati */}
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center text-xs text-stone-400">
                    Nessun abbonato trovato con i filtri selezionati.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isUserExpired = Boolean(
                      u.expiresAt && new Date(u.expiresAt + 'T23:59:59') < new Date()
                    );
                    const isPendingUser = u.status === 'pending';
                    const isSuspendedUser = u.status === 'suspended';
                    const isEditing = editingUserId === u.id;

                    return (
                      <div
                        key={u.id}
                        className={`rounded-2xl border p-4 transition ${
                          isPendingUser
                            ? 'border-amber-400/50 bg-amber-500/[0.06] shadow-[0_0_20px_rgba(217,155,67,0.15)]'
                            : isUserExpired
                              ? 'border-rose-500/30 bg-rose-500/[0.03]'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          {/* Info Utente */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-stone-100">{u.name}</span>
                              {u.company && (
                                <span className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[11px] text-stone-300">
                                  <Building2 className="h-3 w-3 text-stone-400" />
                                  <span>{u.company}</span>
                                </span>
                              )}

                              {/* Status Badge */}
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  u.role === 'admin'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                    : isPendingUser
                                      ? 'bg-amber-400 text-black font-extrabold animate-pulse'
                                      : isSuspendedUser
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : isUserExpired
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                }`}
                              >
                                {u.role === 'admin'
                                  ? 'Amministratore'
                                  : isPendingUser
                                    ? 'In Attesa di Accredito'
                                    : isSuspendedUser
                                      ? 'Sospeso'
                                      : isUserExpired
                                        ? `Scaduto (${u.expiresAt})`
                                        : 'Attivo'}
                              </span>

                              {u.subscriptionPlan && (
                                <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.2 text-[10px] text-stone-400">
                                  {u.subscriptionPlan}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400">
                              <a
                                href={`mailto:${u.email}`}
                                className="inline-flex items-center gap-1 hover:text-amber-300"
                              >
                                <Mail className="h-3 w-3 text-stone-500" />
                                <span>{u.email}</span>
                              </a>

                              {u.phone && (
                                <a
                                  href={`tel:${u.phone}`}
                                  className="inline-flex items-center gap-1 hover:text-amber-300"
                                >
                                  <Phone className="h-3 w-3 text-stone-500" />
                                  <span>{u.phone}</span>
                                </a>
                              )}

                              {u.createdAt && (
                                <span className="text-[11px] text-stone-500">
                                  Iscritto il {new Date(u.createdAt).toLocaleDateString('it-IT')}
                                </span>
                              )}

                              {u.expiresAt && (
                                <span className="flex items-center gap-1 font-medium text-amber-200">
                                  <Calendar className="h-3 w-3 text-amber-400" />
                                  <span>Scadenza: {u.expiresAt}</span>
                                </span>
                              )}
                            </div>

                            {u.notes && (
                              <p className="text-[11px] italic text-stone-400">Note: {u.notes}</p>
                            )}
                          </div>

                          {/* Azioni Rapide Abbonato */}
                          {u.role !== 'admin' && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-2 lg:pt-0">
                              {/* Se in attesa: Tasto accredita rapido */}
                              {isPendingUser && (
                                <button
                                  type="button"
                                  onClick={() => handleAccreditInstant(u, 30)}
                                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black shadow-md transition hover:bg-emerald-400"
                                >
                                  <UserCheck className="h-3.5 w-3.5" />
                                  <span>Accredita Ora (+1 Mese)</span>
                                </button>
                              )}

                              {/* Estensioni rapide */}
                              <button
                                type="button"
                                onClick={() => handleExtendSubscription(u, 1)}
                                className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-stone-300 transition hover:border-amber-400/40 hover:text-amber-200"
                                title="Estendi abbonamento di 1 mese"
                              >
                                +1 Mese
                              </button>

                              <button
                                type="button"
                                onClick={() => handleExtendSubscription(u, 12)}
                                className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-stone-300 transition hover:border-amber-400/40 hover:text-amber-200"
                                title="Estendi abbonamento di 1 anno"
                              >
                                +1 Anno
                              </button>

                              {/* Sospendi / Riattiva */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateSubscriber(u.id, {
                                    status: u.status === 'suspended' ? 'active' : 'suspended',
                                  })
                                }
                                className={`rounded-lg border px-2 py-1 text-[11px] transition ${
                                  u.status === 'suspended'
                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                                }`}
                              >
                                {u.status === 'suspended' ? 'Riattiva' : 'Sospendi'}
                              </button>

                              {/* Modifica Scadenza / Dati */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (isEditing) {
                                    setEditingUserId(null);
                                  } else {
                                    setEditingUserId(u.id);
                                    setEditExpiresAt(u.expiresAt || '');
                                    setEditStatus(u.status);
                                    setEditNotes(u.notes || '');
                                    setEditPlan(u.subscriptionPlan || 'monthly');
                                  }
                                }}
                                className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-stone-400 transition hover:text-stone-200"
                                title="Modifica dettagli"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              {/* Elimina */}
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-400 transition hover:bg-rose-500/20"
                                title="Elimina account"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Pannello Inline di Modifica */}
                        {isEditing && (
                          <div className="mt-3.5 border-t border-white/10 pt-3">
                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
                              <div>
                                <label className="mb-1 block text-[10px] text-stone-400">Scadenza</label>
                                <input
                                  type="date"
                                  value={editExpiresAt}
                                  onChange={(e) => setEditExpiresAt(e.target.value)}
                                  className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-2.5 py-1 text-xs text-stone-100"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-[10px] text-stone-400">Stato</label>
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                                  className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-2.5 py-1 text-xs text-stone-100"
                                >
                                  <option value="active">Attivo</option>
                                  <option value="pending">In Attesa</option>
                                  <option value="suspended">Sospeso</option>
                                </select>
                              </div>

                              <div>
                                <label className="mb-1 block text-[10px] text-stone-400">Piano</label>
                                <input
                                  type="text"
                                  value={editPlan}
                                  onChange={(e) => setEditPlan(e.target.value)}
                                  className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-2.5 py-1 text-xs text-stone-100"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-[10px] text-stone-400">Note interne</label>
                                <input
                                  type="text"
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-2.5 py-1 text-xs text-stone-100"
                                />
                              </div>
                            </div>

                            <div className="mt-2.5 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingUserId(null)}
                                className="rounded-lg border border-white/10 px-3 py-1 text-xs text-stone-400 hover:text-stone-200"
                              >
                                Annulla
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateSubscriber(u.id, {
                                    expiresAt: editExpiresAt || null,
                                    status: editStatus,
                                    notes: editNotes,
                                    subscriptionPlan: editPlan,
                                  })
                                }
                                className="rounded-lg bg-amber-500 px-3.5 py-1 text-xs font-semibold text-black hover:bg-amber-400"
                              >
                                Salva Modifiche
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COORDINATE & PIANI PAGAMENTO (ADMIN) */}
          {tab === 'payments' && isAdmin && (
            <form onSubmit={handleSavePaymentConfig} className="max-w-2xl space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-stone-200">
                  Configurazione Metodi di Pagamento & Offerte
                </h3>
                <p className="text-xs text-stone-400">
                  Queste informazioni compaiono nella schermata di attivazione e accreditamento dei
                  clienti.
                </p>
              </div>

              {paymentMsg && (
                <div
                  className={`rounded-xl px-4 py-2.5 text-xs ${
                    paymentMsg.type === 'ok'
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border border-rose-500/30 bg-rose-500/10 text-rose-200'
                  }`}
                >
                  {paymentMsg.text}
                </div>
              )}

              <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-300">
                    Link Pagamento Rapido PayPal
                  </label>
                  <input
                    type="url"
                    value={paymentConfig.paymentUrl}
                    onChange={(e) =>
                      setPaymentConfig((prev) => ({ ...prev, paymentUrl: e.target.value }))
                    }
                    placeholder="https://www.paypal.me/StudioSerra"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400"
                  />
                  <p className="mt-1 text-[11px] text-stone-500">
                    Il QR Code viene servito automaticamente dalla cartella public (/paypal-qr.png).
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-300">
                      IBAN Bonifico Bancario
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.iban}
                      onChange={(e) =>
                        setPaymentConfig((prev) => ({ ...prev, iban: e.target.value }))
                      }
                      placeholder="IT60X0542811101000000123456"
                      className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 font-code text-xs text-stone-100 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-300">
                      Beneficiario Bonifico
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.bankBeneficiary}
                      onChange={(e) =>
                        setPaymentConfig((prev) => ({ ...prev, bankBeneficiary: e.target.value }))
                      }
                      placeholder="Studio Serra"
                      className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-300">
                      Email di Contatto / Notifiche
                    </label>
                    <input
                      type="email"
                      value={paymentConfig.contactEmail}
                      onChange={(e) =>
                        setPaymentConfig((prev) => ({ ...prev, contactEmail: e.target.value }))
                      }
                      placeholder="direzione@serrastudio.it"
                      className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-stone-300">
                      Telefono / Assistenza WhatsApp
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.contactPhone}
                      onChange={(e) =>
                        setPaymentConfig((prev) => ({ ...prev, contactPhone: e.target.value }))
                      }
                      placeholder="+39 340 1234567"
                      className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-300">
                    Testo Piani e Tariffe Abbonamento
                  </label>
                  <textarea
                    rows={4}
                    value={paymentConfig.plansText}
                    onChange={(e) =>
                      setPaymentConfig((prev) => ({ ...prev, plansText: e.target.value }))
                    }
                    placeholder="• Abbonamento Mensile: 49 €/mese..."
                    className="w-full rounded-lg border border-white/10 bg-[#0b0d10] p-3 text-xs text-stone-100 outline-none focus:border-amber-400"
                  />
                </div>

                {/* Codice Promo */}
                <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.04] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Codice Promo per Sblocco Diretto
                    </span>
                    <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentConfig.promoEnabled}
                        onChange={(e) =>
                          setPaymentConfig((prev) => ({ ...prev, promoEnabled: e.target.checked }))
                        }
                        className="rounded accent-amber-500"
                      />
                      <span className="text-stone-300">Abilita coupon promo</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">Codice Coupon</label>
                      <input
                        type="text"
                        value={paymentConfig.promoCode}
                        onChange={(e) =>
                          setPaymentConfig((prev) => ({
                            ...prev,
                            promoCode: e.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="PROVA-SAPORI"
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-1.5 font-code text-xs font-bold text-amber-200 uppercase outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] text-stone-400">
                        Giorni di Accesso Gratuiti
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={paymentConfig.promoDays || 30}
                        onChange={(e) =>
                          setPaymentConfig((prev) => ({
                            ...prev,
                            promoDays: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-1.5 text-xs text-stone-100 outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-[#0b0d10] shadow-[0_0_20px_rgba(217,155,67,0.2)] transition hover:bg-amber-400 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingPayment ? 'Salvataggio...' : 'Salva Coordinate & Piani'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
