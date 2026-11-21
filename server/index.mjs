import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractText, getDocumentProxy } from 'unpdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const PORT = Number(process.env.PORT || 3021);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT_DIR, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const SESSION_COOKIE = 'sapori_session';
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 giorni

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'direzione@serrastudio.it').trim().toLowerCase();
const ADMIN_NAME = (process.env.ADMIN_NAME || 'Direzione SerraStudio').trim();
const ADMIN_PASSWORD_HASH = (process.env.ADMIN_PASSWORD_HASH || '').trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();

const TRIAL_EMAIL = (process.env.TRIAL_EMAIL || 'demo@serrastudio.it').trim().toLowerCase();
const TRIAL_NAME = (process.env.TRIAL_NAME || 'Account Prova (Demo 10%)').trim();
const TRIAL_DATA_RATIO = 0.1;
const TRIAL_ALIASES = new Set([
  TRIAL_EMAIL,
  'prova@serrastudio.it',
  'demo@ilsegretodeisapori.it',
  'demo',
  'prova',
]);

const defaultPaymentConfig = {
  paymentUrl: 'https://www.paypal.me/StudioSerra',
  iban: '',
  bankBeneficiary: 'Studio Serra',
  contactEmail: 'direzione@serrastudio.it',
  contactPhone: '',
  plansText:
    '• Abbonamento Mensile Chef & Ricerca: 49 €/mese\nAccesso completo e illimitato al Simulatore del Palato, Atlante Spezie e Analisi Ricette con Intelligenza Artificiale.\n\n• Abbonamento Annuale Laboratorio: 390 €/anno (Oltre il 30% di sconto)\nTutte le funzionalità incluse, aggiornamenti molecolari continui e supporto dedicato Studio Serra.',
  welcomeMessage:
    "Il tuo account è stato registrato con successo. Per abilitare l'accesso completo a Il Segreto dei Sapori (FlavorEngine), effettua il pagamento o inserisci un codice promo ed attendi l'accreditamento da parte di Studio Serra.",
  promoEnabled: true,
  promoCode: 'PROVA-SAPORI',
  promoDays: 30,
};

fs.mkdirSync(DATA_DIR, { recursive: true });

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) {
    return {
      sessionSecret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      users: [],
      databases: {},
      recipes: {},
      aiConfig: null,
      paymentConfig: { ...defaultPaymentConfig },
    };
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      sessionSecret:
        process.env.SESSION_SECRET ||
        parsed.sessionSecret ||
        crypto.randomBytes(32).toString('hex'),
      users: Array.isArray(parsed.users) ? parsed.users : [],
      databases: parsed.databases && typeof parsed.databases === 'object' ? parsed.databases : {},
      recipes: parsed.recipes && typeof parsed.recipes === 'object' ? parsed.recipes : {},
      aiConfig: parsed.aiConfig && typeof parsed.aiConfig === 'object' ? parsed.aiConfig : null,
      paymentConfig:
        parsed.paymentConfig && typeof parsed.paymentConfig === 'object'
          ? { ...defaultPaymentConfig, ...parsed.paymentConfig }
          : { ...defaultPaymentConfig },
    };
  } catch (err) {
    console.error('[store] Errore lettura store.json, inizializzazione nuovo store:', err);
    return {
      sessionSecret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      users: [],
      databases: {},
      recipes: {},
      aiConfig: null,
      paymentConfig: { ...defaultPaymentConfig },
    };
  }
}

let store = loadStore();

function saveStore() {
  const tmpPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tmpPath, STORE_PATH);
}

function seedAdminAccount() {
  const existing = store.users.find((u) => u.email.toLowerCase() === ADMIN_EMAIL);
  if (existing) {
    let changed = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      changed = true;
    }
    if (existing.status !== 'active') {
      existing.status = 'active';
      changed = true;
    }
    if (!existing.subscriptionPlan) {
      existing.subscriptionPlan = 'lifetime';
      changed = true;
    }
    if (ADMIN_PASSWORD_HASH && !existing.passwordHash) {
      existing.passwordHash = ADMIN_PASSWORD_HASH;
      changed = true;
    }
    if (changed) saveStore();
    return;
  }

  let passwordHash = ADMIN_PASSWORD_HASH;
  if (!passwordHash && ADMIN_PASSWORD) {
    passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
  }
  if (!passwordHash) {
    console.warn(
      '[auth] ATTENZIONE: né ADMIN_PASSWORD_HASH né ADMIN_PASSWORD impostati; account admin non creato.'
    );
    return;
  }

  store.users.push({
    id: crypto.randomUUID(),
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    company: 'Studio Serra',
    phone: '',
    role: 'admin',
    status: 'active',
    subscriptionPlan: 'lifetime',
    expiresAt: null,
    notes: 'Amministratore Principale di Sistema',
    passwordHash,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  });
  saveStore();
  console.log(`[auth] Account amministratore inizializzato: ${ADMIN_EMAIL}`);
}

function seedTrialAccount() {
  const existing = store.users.find(
    (u) => u.email.toLowerCase() === TRIAL_EMAIL || u.role === 'trial'
  );
  if (existing) {
    let changed = false;
    if (existing.role !== 'trial') {
      existing.role = 'trial';
      changed = true;
    }
    if (existing.isTrial !== true) {
      existing.isTrial = true;
      changed = true;
    }
    if (existing.status !== 'active') {
      existing.status = 'active';
      changed = true;
    }
    if (existing.subscriptionPlan !== 'trial') {
      existing.subscriptionPlan = 'trial';
      changed = true;
    }
    if (existing.dataQuotaRatio !== TRIAL_DATA_RATIO) {
      existing.dataQuotaRatio = TRIAL_DATA_RATIO;
      changed = true;
    }
    if (existing.passwordHash !== null) {
      existing.passwordHash = null;
      changed = true;
    }
    if (changed) saveStore();
    return existing;
  }

  const trialUser = {
    id: crypto.randomUUID(),
    email: TRIAL_EMAIL,
    name: TRIAL_NAME,
    company: 'Laboratorio Demo',
    phone: '',
    role: 'trial',
    status: 'active',
    subscriptionPlan: 'trial',
    expiresAt: null,
    isTrial: true,
    dataQuotaRatio: TRIAL_DATA_RATIO,
    passwordHash: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };
  store.users.push(trialUser);
  saveStore();
  console.log(`[auth] Account di prova senza password inizializzato: ${TRIAL_EMAIL} (10% dati)`);
  return trialUser;
}

seedAdminAccount();
seedTrialAccount();
saveStore();

// Firma e verifica token sessione (HMAC-SHA256, stateless)
function signSession(payload) {
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', store.sessionSecret)
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', store.sessionSecret)
    .update(data)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.uid || !payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function publicUser(user) {
  const isTrial = user.role === 'trial' || Boolean(user.isTrial);
  const isAdmin = user.role === 'admin';
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company || '',
    phone: user.phone || '',
    role: isTrial ? 'trial' : user.role,
    status: isAdmin ? 'active' : user.status || (isTrial ? 'active' : 'pending'),
    expiresAt: user.expiresAt || null,
    subscriptionPlan: user.subscriptionPlan || (isTrial ? 'trial' : isAdmin ? 'lifetime' : 'monthly'),
    notes: user.notes || '',
    isTrial,
    dataQuotaRatio: isTrial ? Number(user.dataQuotaRatio || TRIAL_DATA_RATIO) : 1,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || null,
    redeemedPromos: Array.isArray(user.redeemedPromos) ? user.redeemedPromos : [],
  };
}

function sanitizePaymentConfigForClient(cfg) {
  const c = cfg || store.paymentConfig || defaultPaymentConfig;
  return {
    paymentUrl: c.paymentUrl || '',
    iban: c.iban || '',
    bankBeneficiary: c.bankBeneficiary || 'Studio Serra',
    contactEmail: c.contactEmail || 'direzione@serrastudio.it',
    contactPhone: c.contactPhone || '',
    plansText: c.plansText || defaultPaymentConfig.plansText,
    welcomeMessage: c.welcomeMessage || defaultPaymentConfig.welcomeMessage,
    promoEnabled: c.promoEnabled !== false,
    promoCode: c.promoCode || 'PROVA-SAPORI',
    promoDays: Number(c.promoDays || 30),
  };
}

function isSecureRequest(req) {
  return req.secure || req.headers['x-forwarded-proto'] === 'https';
}

function setSessionCookie(req, res, user) {
  const token = signSession({
    uid: user.id,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE_MS,
  });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest(req),
    maxAge: SESSION_MAX_AGE_MS,
    path: '/',
  });
}

// Rate limit semplice anti-bruteforce su login
const loginAttempts = new Map();
const MAX_ATTEMPTS = 8;
const LOCK_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(key) {
  const entry = loginAttempts.get(key);
  if (!entry) return { blocked: false };
  if (Date.now() > entry.resetAt) {
    loginAttempts.delete(key);
    return { blocked: false };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    const waitMin = Math.ceil((entry.resetAt - Date.now()) / 60000);
    return { blocked: true, waitMin };
  }
  return { blocked: false };
}

function recordFailedAttempt(key) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOCK_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearAttempts(key) {
  loginAttempts.delete(key);
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '25mb' }));
app.use(cookieParser());

function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  const session = verifySession(token);
  if (!session) {
    return res.status(401).json({ error: 'Non autenticato' });
  }
  const user = store.users.find((u) => u.id === session.uid);
  if (!user) {
    return res.status(401).json({ error: 'Sessione non valida' });
  }
  req.user = user;
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accesso riservato agli amministratori' });
  }
  return next();
}

// --- HEALTH ---
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'il-segreto-dei-sapori', users: store.users.length });
});

// --- PAYMENT CONFIG & ACCREDITATION ---
app.get('/api/payment-config', (_req, res) => {
  res.json({ paymentConfig: sanitizePaymentConfigForClient(store.paymentConfig) });
});

// --- AUTH ---
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({
    user: publicUser(req.user),
    paymentConfig: sanitizePaymentConfigForClient(store.paymentConfig),
  });
});

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const company = String(req.body?.company || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const phone = String(req.body?.phone || '').trim();
  const password = String(req.body?.password || '');
  const promoCode = String(req.body?.promoCode || '').trim().toUpperCase();

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, Email e Password sono obbligatori.' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Inserisci un indirizzo email valido.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri.' });
  }

  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    return res.status(400).json({ error: 'Questa email è già registrata. Effettua il login.' });
  }

  let status = 'pending';
  let expiresAt = null;
  let subscriptionPlan = 'monthly';
  const redeemedPromos = [];
  let notes = '';

  const cfg = store.paymentConfig || defaultPaymentConfig;
  const validPromo = String(cfg.promoCode || '').trim().toUpperCase();

  if (promoCode) {
    if (!cfg.promoEnabled || !validPromo || promoCode !== validPromo) {
      return res.status(400).json({ error: 'Il Codice Promo inserito non è valido o è scaduto.' });
    }
    status = 'active';
    const days = Number(cfg.promoDays || 30);
    const exp = new Date();
    exp.setDate(exp.getDate() + days);
    expiresAt = exp.toISOString().slice(0, 10);
    subscriptionPlan = 'promo';
    redeemedPromos.push(validPromo);
    notes = `Attivato con codice promo: ${validPromo} (+${days} gg)`;
  }

  const newUser = {
    id: crypto.randomUUID(),
    email,
    name,
    company,
    phone,
    role: 'user',
    status,
    expiresAt,
    subscriptionPlan,
    notes,
    redeemedPromos,
    isTrial: false,
    dataQuotaRatio: 1,
    passwordHash: await bcrypt.hash(password, 12),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  store.users.push(newUser);
  saveStore();

  setSessionCookie(req, res, newUser);
  return res.json({
    user: publicUser(newUser),
    paymentConfig: sanitizePaymentConfigForClient(store.paymentConfig),
  });
});

app.post('/api/auth/redeem-promo', requireAuth, (req, res) => {
  const inputPromo = String(req.body?.promoCode || '').trim().toUpperCase();
  const cfg = store.paymentConfig || defaultPaymentConfig;
  const validPromo = String(cfg.promoCode || '').trim().toUpperCase();

  if (!inputPromo || !cfg.promoEnabled || !validPromo || inputPromo !== validPromo) {
    return res.status(400).json({ error: 'Codice Promo non valido o non più attivo.' });
  }

  if (!Array.isArray(req.user.redeemedPromos)) {
    req.user.redeemedPromos = [];
  }
  if (req.user.redeemedPromos.includes(validPromo)) {
    return res.status(400).json({ error: 'Hai già riscattato questo Codice Promo sul tuo account.' });
  }

  if (req.user.status === 'suspended') {
    return res.status(403).json({ error: 'Il tuo account è sospeso. Contatta Studio Serra.' });
  }

  const days = Number(cfg.promoDays || 30);
  const baseDate =
    req.user.expiresAt && new Date(req.user.expiresAt + 'T23:59:59') > new Date()
      ? new Date(req.user.expiresAt + 'T23:59:59')
      : new Date();
  baseDate.setDate(baseDate.getDate() + days);

  req.user.status = 'active';
  req.user.expiresAt = baseDate.toISOString().slice(0, 10);
  req.user.subscriptionPlan = 'promo';
  req.user.redeemedPromos.push(validPromo);
  req.user.notes = (req.user.notes ? req.user.notes + ' | ' : '') + `Promo: ${validPromo} (+${days}gg)`;

  saveStore();
  return res.json({
    user: publicUser(req.user),
    message: `Codice Promo attivato con successo! Accesso esteso di ${days} giorni.`,
  });
});

app.post('/api/auth/trial', (req, res) => {
  const trialUser = seedTrialAccount();
  trialUser.lastLoginAt = new Date().toISOString();
  saveStore();
  setSessionCookie(req, res, trialUser);
  return res.json({
    user: publicUser(trialUser),
    paymentConfig: sanitizePaymentConfigForClient(store.paymentConfig),
  });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email) {
    return res.status(400).json({ error: 'Inserisci l’indirizzo email.' });
  }

  // Accesso senza password per l'account di prova
  const matchedUser = store.users.find((u) => u.email.toLowerCase() === email);
  if (TRIAL_ALIASES.has(email) || (matchedUser && (matchedUser.role === 'trial' || matchedUser.isTrial))) {
    const trialUser = matchedUser || seedTrialAccount();
    trialUser.lastLoginAt = new Date().toISOString();
    saveStore();
    setSessionCookie(req, res, trialUser);
    return res.json({
      user: publicUser(trialUser),
      paymentConfig: sanitizePaymentConfigForClient(store.paymentConfig),
    });
  }

  if (!password) {
    return res.status(400).json({ error: 'Inserisci email e password.' });
  }

  const rateKey = `${req.ip}:${email}`;
  const rl = checkRateLimit(rateKey);
  if (rl.blocked) {
    return res
      .status(429)
      .json({ error: `Troppi tentativi falliti. Riprova tra ${rl.waitMin} min.` });
  }

  const user = matchedUser;
  if (!user || !user.passwordHash) {
    recordFailedAttempt(rateKey);
    return res.status(401).json({ error: 'Credenziali non valide.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    recordFailedAttempt(rateKey);
    return res.status(401).json({ error: 'Credenziali non valide.' });
  }

  clearAttempts(rateKey);
  user.lastLoginAt = new Date().toISOString();
  saveStore();
  setSessionCookie(req, res, user);

  return res.json({
    user: publicUser(user),
    paymentConfig: sanitizePaymentConfigForClient(store.paymentConfig),
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest(req),
    path: '/',
  });
  res.json({ ok: true });
});

app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  if (req.user.role === 'trial' || req.user.isTrial) {
    return res.status(403).json({ error: "L'account di prova non utilizza password." });
  }

  const currentPassword = String(req.body?.currentPassword || '');
  const newPassword = String(req.body?.newPassword || '');

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Compila tutti i campi.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'La nuova password deve avere almeno 6 caratteri.' });
  }

  const valid = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: 'La password attuale non è corretta.' });
  }

  req.user.passwordHash = await bcrypt.hash(newPassword, 12);
  saveStore();
  return res.json({ ok: true });
});

// --- GESTIONE ACCOUNT & ABBONATI (ADMIN) ---
app.get('/api/admin/overview', requireAuth, requireAdmin, (_req, res) => {
  res.json({
    users: store.users.map(publicUser),
    paymentConfig: store.paymentConfig || defaultPaymentConfig,
  });
});

app.get('/api/admin/users', requireAuth, requireAdmin, (_req, res) => {
  res.json({ users: store.users.map(publicUser) });
});

app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const name = String(req.body?.name || '').trim();
  const company = String(req.body?.company || '').trim();
  const phone = String(req.body?.phone || '').trim();
  const password = String(req.body?.password || '');
  const role =
    req.body?.role === 'admin' ? 'admin' : req.body?.role === 'trial' ? 'trial' : 'user';
  const isTrial = role === 'trial';
  const status =
    req.body?.status && ['pending', 'active', 'suspended'].includes(req.body.status)
      ? req.body.status
      : isTrial
        ? 'active'
        : 'active';
  const expiresAt = req.body?.expiresAt ? String(req.body.expiresAt).slice(0, 10) : null;
  const subscriptionPlan = String(req.body?.subscriptionPlan || (isTrial ? 'trial' : 'monthly'));
  const notes = String(req.body?.notes || '');

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Inserisci un indirizzo email valido.' });
  }
  if (!name) {
    return res.status(400).json({ error: 'Inserisci il nome utente.' });
  }
  if (!isTrial && password.length < 6) {
    return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri.' });
  }
  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    return res.status(409).json({ error: 'Esiste già un account con questa email.' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    email,
    name,
    company,
    phone,
    role,
    status,
    expiresAt,
    subscriptionPlan,
    notes,
    redeemedPromos: [],
    isTrial,
    dataQuotaRatio: isTrial ? TRIAL_DATA_RATIO : 1,
    passwordHash: isTrial ? null : await bcrypt.hash(password, 12),
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };
  store.users.push(newUser);
  saveStore();

  return res.status(201).json({ user: publicUser(newUser), users: store.users.map(publicUser) });
});

app.post('/api/admin/users/:id/update', requireAuth, requireAdmin, async (req, res) => {
  const target = store.users.find((u) => u.id === req.params.id);
  if (!target) {
    return res.status(404).json({ error: 'Utente non trovato.' });
  }

  const {
    status,
    expiresAt,
    subscriptionPlan,
    notes,
    name,
    company,
    phone,
    role,
    newPassword,
  } = req.body || {};

  if (status && ['pending', 'active', 'suspended'].includes(status)) {
    target.status = status;
  }
  if (expiresAt !== undefined) {
    target.expiresAt = expiresAt ? String(expiresAt).slice(0, 10) : null;
  }
  if (subscriptionPlan !== undefined) {
    target.subscriptionPlan = String(subscriptionPlan);
  }
  if (notes !== undefined) target.notes = String(notes);
  if (name !== undefined && String(name).trim()) target.name = String(name).trim();
  if (company !== undefined) target.company = String(company).trim();
  if (phone !== undefined) target.phone = String(phone).trim();
  if (role && ['admin', 'user', 'trial'].includes(role)) {
    target.role = role;
    target.isTrial = role === 'trial';
  }
  if (newPassword && String(newPassword).trim().length >= 6) {
    target.passwordHash = await bcrypt.hash(String(newPassword).trim(), 12);
  }

  saveStore();
  return res.json({ user: publicUser(target), users: store.users.map(publicUser) });
});

app.post('/api/admin/payment-config', requireAuth, requireAdmin, (req, res) => {
  store.paymentConfig = {
    ...(store.paymentConfig || defaultPaymentConfig),
    ...req.body,
    promoCode: String(req.body?.promoCode || 'PROVA-SAPORI').trim().toUpperCase(),
    promoDays: Math.max(1, Number(req.body?.promoDays || 30)),
    promoEnabled: Boolean(req.body?.promoEnabled),
  };
  saveStore();
  return res.json({ paymentConfig: store.paymentConfig });
});

app.patch('/api/admin/users/:id/password', requireAuth, requireAdmin, async (req, res) => {
  const newPassword = String(req.body?.password || '');
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri.' });
  }
  const target = store.users.find((u) => u.id === req.params.id);
  if (!target) {
    return res.status(404).json({ error: 'Utente non trovato.' });
  }
  target.passwordHash = await bcrypt.hash(newPassword, 12);
  saveStore();
  return res.json({ ok: true });
});

app.delete('/api/admin/users/:id', requireAuth, requireAdmin, (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Non puoi eliminare il tuo stesso account.' });
  }
  const idx = store.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Utente non trovato.' });
  }
  const [removed] = store.users.splice(idx, 1);
  delete store.databases[removed.id];
  saveStore();
  return res.json({ ok: true });
});

// --- DATABASE FLAVORENGINE PER UTENTE ---
app.get('/api/database', requireAuth, (req, res) => {
  if (req.user.role === 'trial' || req.user.isTrial) {
    return res.json({ database: null, isTrial: true, dataQuotaRatio: TRIAL_DATA_RATIO });
  }
  const db = store.databases[req.user.id] || null;
  res.json({ database: db });
});

app.put('/api/database', requireAuth, (req, res) => {
  if (req.user.role === 'trial' || req.user.isTrial) {
    return res
      .status(403)
      .json({ error: "L'account di prova è limitato al 10% dei dati e non salva modifiche permanenti." });
  }
  const db = req.body?.database;
  if (!db || !Array.isArray(db.ingredients) || !Array.isArray(db.techniques)) {
    return res.status(400).json({ error: 'Formato database non valido.' });
  }
  store.databases[req.user.id] = db;
  saveStore();
  res.json({ ok: true });
});

app.delete('/api/database', requireAuth, (req, res) => {
  if (req.user.role === 'trial' || req.user.isTrial) {
    return res.json({ ok: true });
  }
  delete store.databases[req.user.id];
  saveStore();
  res.json({ ok: true });
});

// --- RICETTARIO PERSONALE: SALVATAGGIO RICETTE CON CARATTERISTICHE ---
app.get('/api/recipes', requireAuth, (req, res) => {
  if (!store.recipes || typeof store.recipes !== 'object') {
    store.recipes = {};
  }
  const list = Array.isArray(store.recipes[req.user.id]) ? store.recipes[req.user.id] : [];
  res.json({ recipes: list });
});

app.post('/api/recipes', requireAuth, (req, res) => {
  if (!store.recipes || typeof store.recipes !== 'object') {
    store.recipes = {};
  }
  const userId = req.user.id;
  const isTrial = req.user.role === 'trial' || Boolean(req.user.isTrial);
  const currentList = Array.isArray(store.recipes[userId]) ? store.recipes[userId] : [];

  const payload = req.body?.recipe;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Dati ricetta non validi.' });
  }

  const title = String(payload.title || '').trim();
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!title) {
    return res.status(400).json({ error: 'Inserisci un titolo per salvare la ricetta.' });
  }
  if (items.length === 0) {
    return res.status(400).json({ error: 'La ricetta deve contenere almeno un ingrediente.' });
  }

  const existingIdx = payload.id
    ? currentList.findIndex((r) => r.id === String(payload.id))
    : -1;

  if (existingIdx === -1 && isTrial && currentList.length >= 5) {
    return res.status(403).json({
      error: "L'account di prova consente di salvare fino a 5 ricette dimostrative. Elimina una ricetta salvata o passa a un account completo.",
    });
  }

  const now = new Date().toISOString();
  const savedRecipe = {
    id: existingIdx >= 0 ? currentList[existingIdx].id : crypto.randomUUID(),
    title,
    servings: payload.servings ? String(payload.servings).trim() : null,
    recipeText: String(payload.recipeText || ''),
    summary: String(payload.summary || ''),
    chefNotes: Array.isArray(payload.chefNotes) ? payload.chefNotes.map(String) : [],
    userNotes: String(payload.userNotes || '').trim(),
    engine: payload.engine === 'ai' ? 'ai' : 'local',
    provider: payload.provider ? String(payload.provider) : null,
    model: payload.model ? String(payload.model) : null,
    sourcePdfName: payload.sourcePdfName ? String(payload.sourcePdfName) : null,
    sourcePdfPages: payload.sourcePdfPages ? Number(payload.sourcePdfPages) : null,
    items,
    fasi: Array.isArray(payload.fasi) ? payload.fasi : [],
    plannedIngredients: Array.isArray(payload.plannedIngredients) ? payload.plannedIngredients : [],
    characteristics:
      payload.characteristics && typeof payload.characteristics === 'object'
        ? payload.characteristics
        : null,
    createdAt: existingIdx >= 0 ? currentList[existingIdx].createdAt : now,
    updatedAt: now,
  };

  if (existingIdx >= 0) {
    currentList[existingIdx] = savedRecipe;
  } else {
    currentList.unshift(savedRecipe);
  }

  store.recipes[userId] = currentList;
  saveStore();
  return res.json({ ok: true, recipe: savedRecipe, recipes: currentList });
});

app.delete('/api/recipes/:id', requireAuth, (req, res) => {
  if (!store.recipes || typeof store.recipes !== 'object') {
    store.recipes = {};
  }
  const userId = req.user.id;
  const currentList = Array.isArray(store.recipes[userId]) ? store.recipes[userId] : [];
  const nextList = currentList.filter((r) => r.id !== req.params.id);
  store.recipes[userId] = nextList;
  saveStore();
  return res.json({ ok: true, recipes: nextList });
});

// --- ANALISI RICETTE CON IA (GEMINI / OPENAI) ---
function resolveAiSettings(overrideProvider, overrideApiKey) {
  const cleanOverrideKey = typeof overrideApiKey === 'string' ? overrideApiKey.trim() : '';
  if (cleanOverrideKey) {
    const provider =
      overrideProvider === 'openai' || cleanOverrideKey.startsWith('sk-') ? 'openai' : 'gemini';
    return {
      configured: true,
      provider,
      apiKey: cleanOverrideKey,
      model:
        provider === 'openai'
          ? process.env.OPENAI_MODEL || 'gpt-4o-mini'
          : process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      source: 'request',
    };
  }

  const envGemini = (process.env.GEMINI_API_KEY || '').trim();
  const envOpenAi = (process.env.OPENAI_API_KEY || '').trim();
  const envPref = (process.env.AI_PROVIDER || '').trim().toLowerCase();

  if (envPref === 'openai' && envOpenAi) {
    return {
      configured: true,
      provider: 'openai',
      apiKey: envOpenAi,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      source: 'env',
    };
  }
  if (envGemini) {
    return {
      configured: true,
      provider: 'gemini',
      apiKey: envGemini,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      source: 'env',
    };
  }
  if (envOpenAi) {
    return {
      configured: true,
      provider: 'openai',
      apiKey: envOpenAi,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      source: 'env',
    };
  }

  if (store.aiConfig && store.aiConfig.apiKey) {
    const provider = store.aiConfig.provider === 'openai' ? 'openai' : 'gemini';
    return {
      configured: true,
      provider,
      apiKey: store.aiConfig.apiKey,
      model:
        store.aiConfig.model ||
        (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash'),
      source: 'store',
    };
  }

  return {
    configured: false,
    provider: null,
    apiKey: '',
    model: null,
    source: null,
  };
}

function buildRecipeAiPrompt(recipeTitle, recipeText, ingredientsCatalog, techniquesCatalog) {
  const ingList = (Array.isArray(ingredientsCatalog) ? ingredientsCatalog : [])
    .slice(0, 350)
    .map((i) => `${i.id}: ${i.name} [${i.category}]`)
    .join('\n');

  const techList = (Array.isArray(techniquesCatalog) ? techniquesCatalog : [])
    .map((t) => `${t.id}: ${t.name}`)
    .join('\n');

  return `Sei uno chef chimico-gastronomico esperto di scienze sensoriali (FlavorEngine).
Analizza la ricetta fornita in italiano (o altra lingua) ed estrai TUTTI gli ingredienti reali, le loro quantità originali, la tecnica di cottura più fedele al procedimento e il dosaggio nel piatto.

CATALOGO INGREDIENTI DISPONIBILI (formato "id: Nome [categoria]"):
${ingList}

CATALOGO TECNICHE DI COTTURA DISPONIBILI (formato "id: Nome"):
${techList}

REGOLE RIGOROSE:
1. Per ogni ingrediente della ricetta, abbinalo al miglior "ingredientId" del catalogo sopra.
2. Se un ingrediente importante della ricetta NON è presente nel catalogo, imposta "ingredientId": null e compila "customIngredient" con un profilo chimico-sensoriale realistico:
   - category: uno tra "protein_meat", "protein_fish", "vegetable", "fruit", "dairy", "fat", "acid", "herb_spice", "umami_condiment"
   - composition: { water, protein, carbs_sugars, fat } valori tra 0 e 1 (somma <= 1)
   - base_state:
     - volume: intero 1..5 (potenza aromatica/gustativa)
     - temporal_peak: "attack" | "mid" | "finish"
     - taste: valori 0..10 per { sweet, sour, salty, bitter, umami }
     - mouthfeel: valori 0..10 per { pungency, astringency, richness, crunchiness, juiciness, creaminess }
     - aromas: valori 0..10 per { sulfurous, green_herbaceous, citrus_terpenic, floral, fruity_ester, roasted_pyrazine, caramel_sweet, lactic_buttery, umami_funky, earthy_mineral, spicy_phenolic, marine_iodine }
3. Scegli "techniqueId" SOLO tra gli ID del catalogo tecniche sopra (default "tech_raw" se usato a crudo o come condimento finale).
4. Scegli "dosage":
   - "main": ingrediente protagonista/base principale del piatto (1-2 ingredienti)
   - "secondary": comprimario strutturale (verdure principali, salse ricche, formaggi, grassi strutturali)
   - "garnish": condimenti, spezie, erbe, sale, olio a filo, agrumi, finiture
5. Rispondi ESCLUSIVAMENTE con un JSON valido (senza markdown, senza testo fuori dal JSON) con questa struttura esatta:
{
  "title": "Titolo della ricetta",
  "servings": "es. 4 porzioni o null",
  "summary": "Breve sintesi gastronomica della ricetta in 2 frasi (in italiano)",
  "chefNotes": [
    "Osservazione tecnica 1 su equilibri o chimica di cottura",
    "Osservazione tecnica 2 su eventuali criticità o punti di forza",
    "Consiglio pratico 3 per elevare il piatto"
  ],
  "items": [
    {
      "originalText": "testo originale ingrediente",
      "quantityText": "es. 320 g oppure q.b.",
      "ingredientId": "id_dal_catalogo_o_null",
      "matchedName": "Nome ingrediente leggibile",
      "techniqueId": "id_tecnica_dal_catalogo",
      "dosage": "main | secondary | garnish",
      "reason": "Breve motivo della tecnica/ruolo scelto (max 12 parole)",
      "customIngredient": null
    }
  ],
  "unmatched": []
}

TITOLO FORNITO: ${recipeTitle || '(deducilo dal testo)'}

TESTO RICETTA:
${recipeText}`;
}

function extractJsonFromText(text) {
  const trimmed = String(text || '').trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('Risposta IA non contiene un oggetto JSON valido.');
  }
  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
}

async function extractStructuredTextFromPdfBuffer(pdfBuffer, fileName = '') {
  const uint8 = new Uint8Array(pdfBuffer);
  let numPages = 1;
  const pageTexts = [];

  try {
    const doc = await getDocumentProxy(uint8);
    numPages = doc.numPages || 1;
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const lines = [];
      let currentLine = [];
      let lastY = null;

      for (const item of content.items || []) {
        if (!item || typeof item.str !== 'string') continue;
        const y = Array.isArray(item.transform) ? item.transform[5] : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 2.5) {
          const joined = currentLine.join(' ').replace(/\s+/g, ' ').trim();
          if (joined) lines.push(joined);
          currentLine = [];
        }
        if (item.str.trim()) {
          currentLine.push(item.str.trim());
        }
        if (item.hasEOL) {
          const joined = currentLine.join(' ').replace(/\s+/g, ' ').trim();
          if (joined) lines.push(joined);
          currentLine = [];
          lastY = null;
        } else if (y !== null) {
          lastY = y;
        }
      }
      if (currentLine.length > 0) {
        const joined = currentLine.join(' ').replace(/\s+/g, ' ').trim();
        if (joined) lines.push(joined);
      }
      if (lines.length > 0) {
        pageTexts.push(lines.join('\n'));
      }
    }
  } catch (err) {
    console.warn('[pdf] Fallback su extractText standard:', err?.message || err);
  }

  let fullText = pageTexts.join('\n\n').trim();
  if (!fullText) {
    const fallback = await extractText(uint8, { mergePages: true });
    fullText = String(fallback?.text || '').trim();
    if (fallback?.totalPages) numPages = fallback.totalPages;
  }

  // Deduce un titolo probabile dalla prima riga significativa o dal nome del file PDF
  const cleanFileName = String(fileName || '')
    .replace(/\.pdf$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  const firstLines = fullText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let suggestedTitle = cleanFileName;
  if (firstLines.length > 0) {
    const candidate = firstLines[0];
    if (
      candidate.length >= 3 &&
      candidate.length <= 75 &&
      !/^(ingredienti|procedimento|preparazione|scheda\s+tecnica)/i.test(candidate)
    ) {
      suggestedTitle = candidate.replace(/[:\-]+$/, '').trim();
    }
  }

  return {
    text: fullText,
    pages: numPages,
    suggestedTitle: suggestedTitle || 'Ricetta da PDF',
  };
}

async function callGeminiRecipeAnalysis(apiKey, model, prompt, pdfBase64 = '') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const parts = [];
  if (pdfBase64) {
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: pdfBase64,
      },
    });
  }
  parts.push({ text: prompt });

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Errore Gemini (${resp.status}): ${errText.slice(0, 220)}`);
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n') || '';
  if (!text) {
    throw new Error('Risposta vuota da Gemini.');
  }
  return extractJsonFromText(text);
}

async function callOpenAiRecipeAnalysis(apiKey, model, prompt) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Rispondi sempre e solo con un oggetto JSON valido conforme allo schema richiesto.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Errore OpenAI (${resp.status}): ${errText.slice(0, 220)}`);
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text) {
    throw new Error('Risposta vuota da OpenAI.');
  }
  return extractJsonFromText(text);
}

app.get('/api/ai/status', requireAuth, (_req, res) => {
  const cfg = resolveAiSettings();
  res.json({
    configured: cfg.configured,
    provider: cfg.provider,
    model: cfg.model,
    source: cfg.source,
  });
});

app.put('/api/admin/ai-config', requireAuth, requireAdmin, (req, res) => {
  const provider = req.body?.provider === 'openai' ? 'openai' : 'gemini';
  const apiKey = typeof req.body?.apiKey === 'string' ? req.body.apiKey.trim() : '';
  const model = typeof req.body?.model === 'string' ? req.body.model.trim() : '';

  if (!apiKey) {
    store.aiConfig = null;
    saveStore();
    return res.json({ ok: true, configured: false });
  }

  store.aiConfig = {
    provider,
    apiKey,
    model: model || (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-flash'),
    updatedAt: new Date().toISOString(),
  };
  saveStore();
  return res.json({
    ok: true,
    configured: true,
    provider: store.aiConfig.provider,
    model: store.aiConfig.model,
  });
});

function decodePdfBase64(rawBase64) {
  const str = String(rawBase64 || '').trim();
  if (!str) return null;
  const cleaned = str.replace(/^data:application\/pdf;base64,/i, '').trim();
  const buf = Buffer.from(cleaned, 'base64');
  if (buf.length < 8 || buf.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error('Il file caricato non è un documento PDF valido.');
  }
  return { buffer: buf, cleanBase64: cleaned };
}

app.post('/api/recipe/parse-pdf', requireAuth, async (req, res) => {
  try {
    const fileName = String(req.body?.fileName || 'ricetta.pdf').trim();
    const decoded = decodePdfBase64(req.body?.pdfBase64);
    if (!decoded) {
      return res.status(400).json({ error: 'Nessun file PDF fornito.' });
    }
    if (decoded.buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ error: 'Il file PDF supera la dimensione massima di 15 MB.' });
    }

    const extracted = await extractStructuredTextFromPdfBuffer(decoded.buffer, fileName);
    return res.json({
      ok: true,
      fileName,
      pages: extracted.pages,
      suggestedTitle: extracted.suggestedTitle,
      text: extracted.text,
    });
  } catch (err) {
    console.error('[pdf-parse] Errore lettura PDF:', err);
    return res.status(400).json({
      error: err instanceof Error ? err.message : 'Impossibile leggere il file PDF.',
    });
  }
});

app.post('/api/recipe/analyze', requireAuth, async (req, res) => {
  let recipeText = String(req.body?.recipeText || '').trim();
  let recipeTitle = String(req.body?.recipeTitle || '').trim();
  const pdfFileName = String(req.body?.pdfFileName || '').trim();
  const rawPdfBase64 = String(req.body?.pdfBase64 || '').trim();
  const ingredientsCatalog = Array.isArray(req.body?.ingredientsCatalog)
    ? req.body.ingredientsCatalog
    : [];
  const techniquesCatalog = Array.isArray(req.body?.techniquesCatalog)
    ? req.body.techniquesCatalog
    : [];
  const overrideProvider = req.body?.provider;
  const overrideApiKey = req.body?.apiKey;

  let cleanPdfBase64 = '';
  if (rawPdfBase64) {
    try {
      const decoded = decodePdfBase64(rawPdfBase64);
      if (decoded) {
        cleanPdfBase64 = decoded.cleanBase64;
        if (!recipeText) {
          const extracted = await extractStructuredTextFromPdfBuffer(decoded.buffer, pdfFileName);
          recipeText = extracted.text;
          if (!recipeTitle && extracted.suggestedTitle) {
            recipeTitle = extracted.suggestedTitle;
          }
        }
      }
    } catch (pdfErr) {
      return res.status(400).json({
        error: pdfErr instanceof Error ? pdfErr.message : 'File PDF non valido.',
      });
    }
  }

  if ((!recipeText || recipeText.length < 6) && !cleanPdfBase64) {
    return res.status(400).json({ error: 'Inserisci il testo della ricetta o allega un file PDF.' });
  }
  if (recipeText.length > 35000) {
    recipeText = recipeText.slice(0, 35000);
  }

  const aiCfg = resolveAiSettings(overrideProvider, overrideApiKey);
  if (!aiCfg.configured) {
    return res.status(503).json({
      code: 'AI_NOT_CONFIGURED',
      error: 'Nessuna chiave IA configurata sul server.',
    });
  }

  try {
    const prompt = buildRecipeAiPrompt(
      recipeTitle,
      recipeText || '(Leggi direttamente la ricetta dal documento PDF allegato)',
      ingredientsCatalog,
      techniquesCatalog
    );
    const parsed =
      aiCfg.provider === 'openai'
        ? await callOpenAiRecipeAnalysis(aiCfg.apiKey, aiCfg.model, prompt)
        : await callGeminiRecipeAnalysis(aiCfg.apiKey, aiCfg.model, prompt, cleanPdfBase64);

    return res.json({
      engine: 'ai',
      provider: aiCfg.provider,
      model: aiCfg.model,
      result: parsed,
    });
  } catch (err) {
    console.error('[recipe-ai] Errore analisi ricetta:', err);
    return res.status(502).json({
      code: 'AI_ERROR',
      error: err instanceof Error ? err.message : 'Errore durante la chiamata al servizio IA.',
    });
  }
});

// --- FRONTEND STATICO (PRODUZIONE) ---
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, HOST, () => {
  console.log(`[server] Il Segreto dei Sapori attivo su http://${HOST}:${PORT}`);
});
