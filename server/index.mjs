import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

fs.mkdirSync(DATA_DIR, { recursive: true });

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) {
    return {
      sessionSecret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      users: [],
      databases: {},
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
    };
  } catch (err) {
    console.error('[store] Errore lettura store.json, inizializzazione nuovo store:', err);
    return {
      sessionSecret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      users: [],
      databases: {},
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
    role: 'admin',
    passwordHash,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  });
  saveStore();
  console.log(`[auth] Account amministratore inizializzato: ${ADMIN_EMAIL}`);
}

seedAdminAccount();
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
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || null,
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
app.use(express.json({ limit: '5mb' }));
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

// --- AUTH ---
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Inserisci email e password.' });
  }

  const rateKey = `${req.ip}:${email}`;
  const rl = checkRateLimit(rateKey);
  if (rl.blocked) {
    return res
      .status(429)
      .json({ error: `Troppi tentativi falliti. Riprova tra ${rl.waitMin} min.` });
  }

  const user = store.users.find((u) => u.email.toLowerCase() === email);
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

  return res.json({ user: publicUser(user) });
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

// --- GESTIONE ACCOUNT (ADMIN) ---
app.get('/api/admin/users', requireAuth, requireAdmin, (_req, res) => {
  res.json({ users: store.users.map(publicUser) });
});

app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const name = String(req.body?.name || '').trim();
  const password = String(req.body?.password || '');
  const role = req.body?.role === 'admin' ? 'admin' : 'user';

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Inserisci un indirizzo email valido.' });
  }
  if (!name) {
    return res.status(400).json({ error: 'Inserisci il nome utente.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri.' });
  }
  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    return res.status(409).json({ error: 'Esiste già un account con questa email.' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    email,
    name,
    role,
    passwordHash: await bcrypt.hash(password, 12),
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };
  store.users.push(newUser);
  saveStore();

  return res.status(201).json({ user: publicUser(newUser) });
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
  const db = store.databases[req.user.id] || null;
  res.json({ database: db });
});

app.put('/api/database', requireAuth, (req, res) => {
  const db = req.body?.database;
  if (!db || !Array.isArray(db.ingredients) || !Array.isArray(db.techniques)) {
    return res.status(400).json({ error: 'Formato database non valido.' });
  }
  store.databases[req.user.id] = db;
  saveStore();
  res.json({ ok: true });
});

app.delete('/api/database', requireAuth, (req, res) => {
  delete store.databases[req.user.id];
  saveStore();
  res.json({ ok: true });
});

// --- FRONTEND STATICO (PRODUZIONE) ---
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, HOST, () => {
  console.log(`[server] Il Segreto dei Sapori attivo su http://${HOST}:${PORT}`);
});
