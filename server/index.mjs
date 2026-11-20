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

fs.mkdirSync(DATA_DIR, { recursive: true });

function loadStore() {
  if (!fs.existsSync(STORE_PATH)) {
    return {
      sessionSecret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      users: [],
      databases: {},
      aiConfig: null,
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
      aiConfig: parsed.aiConfig && typeof parsed.aiConfig === 'object' ? parsed.aiConfig : null,
    };
  } catch (err) {
    console.error('[store] Errore lettura store.json, inizializzazione nuovo store:', err);
    return {
      sessionSecret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      users: [],
      databases: {},
      aiConfig: null,
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
    role: 'trial',
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
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: isTrial ? 'trial' : user.role,
    isTrial,
    dataQuotaRatio: isTrial ? Number(user.dataQuotaRatio || TRIAL_DATA_RATIO) : 1,
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

app.post('/api/auth/trial', (req, res) => {
  const trialUser = seedTrialAccount();
  trialUser.lastLoginAt = new Date().toISOString();
  saveStore();
  setSessionCookie(req, res, trialUser);
  return res.json({ user: publicUser(trialUser) });
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
    return res.json({ user: publicUser(trialUser) });
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

// --- GESTIONE ACCOUNT (ADMIN) ---
app.get('/api/admin/users', requireAuth, requireAdmin, (_req, res) => {
  res.json({ users: store.users.map(publicUser) });
});

app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const name = String(req.body?.name || '').trim();
  const password = String(req.body?.password || '');
  const role =
    req.body?.role === 'admin' ? 'admin' : req.body?.role === 'trial' ? 'trial' : 'user';
  const isTrial = role === 'trial';

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
    role,
    isTrial,
    dataQuotaRatio: isTrial ? TRIAL_DATA_RATIO : 1,
    passwordHash: isTrial ? null : await bcrypt.hash(password, 12),
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

async function callGeminiRecipeAnalysis(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

app.post('/api/recipe/analyze', requireAuth, async (req, res) => {
  const recipeText = String(req.body?.recipeText || '').trim();
  const recipeTitle = String(req.body?.recipeTitle || '').trim();
  const ingredientsCatalog = Array.isArray(req.body?.ingredientsCatalog)
    ? req.body.ingredientsCatalog
    : [];
  const techniquesCatalog = Array.isArray(req.body?.techniquesCatalog)
    ? req.body.techniquesCatalog
    : [];
  const overrideProvider = req.body?.provider;
  const overrideApiKey = req.body?.apiKey;

  if (!recipeText || recipeText.length < 6) {
    return res.status(400).json({ error: 'Inserisci o incolla il testo della ricetta.' });
  }
  if (recipeText.length > 20000) {
    return res.status(400).json({ error: 'Il testo della ricetta supera il limite massimo (20.000 caratteri).' });
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
      recipeText,
      ingredientsCatalog,
      techniquesCatalog
    );
    const parsed =
      aiCfg.provider === 'openai'
        ? await callOpenAiRecipeAnalysis(aiCfg.apiKey, aiCfg.model, prompt)
        : await callGeminiRecipeAnalysis(aiCfg.apiKey, aiCfg.model, prompt);

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
