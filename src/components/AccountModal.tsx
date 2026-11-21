import React, { useEffect, useState } from 'react';
import { KeyRound, Shield, Trash2, UserPlus, Users, X } from 'lucide-react';
import { AuthUser, UserRole } from '../types/auth';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, currentUser }) => {
  const isAdmin = currentUser.role === 'admin';
  const isTrial = currentUser.role === 'trial' || Boolean(currentUser.isTrial);
  const [tab, setTab] = useState<'profile' | 'users'>('profile');

  // Cambio password personale
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // Gestione utenti (admin)
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [adminMsg, setAdminMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');

  const fetchUsers = async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin && tab === 'users') {
      fetchUsers();
    }
  }, [isOpen, isAdmin, tab]);

  if (!isOpen) return null;

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
          email: newUserEmail.trim(),
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAdminMsg({ type: 'err', text: data.error || 'Impossibile creare utente.' });
        return;
      }
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      setAdminMsg({ type: 'ok', text: `Account creato per ${data.user.email}.` });
      fetchUsers();
    } catch {
      setAdminMsg({ type: 'err', text: 'Errore di rete.' });
    }
  };

  const handleDeleteUser = async (u: AuthUser) => {
    if (!window.confirm(`Eliminare definitivamente l'account ${u.email}?`)) return;
    setAdminMsg(null);
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAdminMsg({ type: 'err', text: data.error || 'Errore eliminazione.' });
      return;
    }
    setAdminMsg({ type: 'ok', text: `Account ${u.email} eliminato.` });
    fetchUsers();
  };

  const handleResetUserPassword = async (u: AuthUser) => {
    const pw = window.prompt(`Nuova password per ${u.email} (minimo 6 caratteri):`);
    if (!pw) return;
    setAdminMsg(null);
    const res = await fetch(`/api/admin/users/${u.id}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAdminMsg({ type: 'err', text: data.error || 'Errore reset password.' });
      return;
    }
    setAdminMsg({ type: 'ok', text: `Password aggiornata per ${u.email}.` });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#12151a] text-[#f4efe6] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#f6f1e7]">
              Gestione Account
            </h2>
            <p className="text-xs text-stone-400">
              {currentUser.name} &bull; {currentUser.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 bg-white/[0.02] px-6 py-2">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              tab === 'profile'
                ? 'bg-amber-500/20 text-amber-200'
                : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Password &amp; Profilo</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setTab('users')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                tab === 'users'
                  ? 'bg-amber-500/20 text-amber-200'
                  : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Utenti</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[68vh] overflow-y-auto p-6">
          {tab === 'profile' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-stone-300">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Ruolo account</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 font-medium text-amber-200">
                    {isAdmin && <Shield className="h-3 w-3" />}
                    {isAdmin
                      ? 'Amministratore'
                      : isTrial
                        ? 'Account di Prova (10% Dati • Senza Password)'
                        : 'Utente'}
                  </span>
                </div>
              </div>

              {isTrial ? (
                <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.07] p-4 text-xs leading-relaxed text-amber-100">
                  <div className="font-semibold text-amber-300">
                    Modalità Prova Attiva (10% del Catalogo)
                  </div>
                  <p className="mt-1 text-stone-300">
                    Stai utilizzando l’account dimostrativo senza password (
                    <span className="font-code text-amber-200">{currentUser.email}</span>). Hai
                    accesso completo al simulatore, all’analisi ricette e all’atlante su un
                    campione pari al <strong>10% dei dati totali</strong> del programma.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <h3 className="text-sm font-medium text-stone-200">Cambia password</h3>

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
                      <label className="mb-1 block text-xs text-stone-400">
                        Conferma nuova password
                      </label>
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
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        pwMsg.type === 'ok'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
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

          {tab === 'users' && isAdmin && (
            <div className="space-y-6">
              {adminMsg && (
                <div
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    adminMsg.type === 'ok'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                  }`}
                >
                  {adminMsg.text}
                </div>
              )}

              <form
                onSubmit={handleCreateUser}
                className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Nuovo Account</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    placeholder="Nome e cognome"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                  />
                  <input
                    type="password"
                    required={newUserRole !== 'trial'}
                    disabled={newUserRole === 'trial'}
                    minLength={newUserRole === 'trial' ? undefined : 6}
                    placeholder={
                      newUserRole === 'trial'
                        ? 'Senza password (account di prova)'
                        : 'Password (min. 6 caratteri)'
                    }
                    value={newUserRole === 'trial' ? '' : newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60 disabled:opacity-50"
                  />
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/60"
                  >
                    <option value="user">Utente standard (100%)</option>
                    <option value="trial">Account di prova senza PW (10%)</option>
                    <option value="admin">Amministratore</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-[#0b0d10] transition hover:bg-amber-400"
                >
                  Crea account
                </button>
              </form>

              <div className="space-y-2">
                <div className="text-xs font-medium text-stone-400">
                  Account attivi ({users.length})
                </div>
                {usersLoading ? (
                  <div className="py-4 text-center text-xs text-stone-500">Caricamento...</div>
                ) : (
                  users.map((u) => (
                    <div
                      key={u.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-stone-100">
                          <span>{u.name}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              u.role === 'admin'
                                ? 'bg-amber-500/15 text-amber-300'
                                : u.role === 'trial'
                                  ? 'bg-sky-500/15 text-sky-300'
                                  : 'bg-white/10 text-stone-300'
                            }`}
                          >
                            {u.role === 'admin'
                              ? 'Admin'
                              : u.role === 'trial'
                                ? 'Prova 10% (No PW)'
                                : 'Utente'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-400">{u.email}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {u.role !== 'trial' && (
                          <button
                            type="button"
                            onClick={() => handleResetUserPassword(u)}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-stone-300 transition hover:border-amber-400/40 hover:text-amber-200"
                          >
                            Reset PW
                          </button>
                        )}
                        {u.id !== currentUser.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-stone-400 transition hover:border-rose-500/40 hover:text-rose-300"
                            title="Elimina account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
