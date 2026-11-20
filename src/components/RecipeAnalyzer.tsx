import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Copy,
  Cpu,
  FileText,
  Info,
  KeyRound,
  Link2,
  Loader2,
  Plus,
  PlusCircle,
  Printer,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
} from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { simulateDish } from '../engine/flavorEngine';
import {
  buildMarkdownReport,
  ExtractedRecipeItem,
  normalizeAiRecipeResponse,
  openPrintableReport,
  parseRecipeLocally,
  RecipeAnalysisResult,
  SAMPLE_RECIPES,
} from '../engine/recipeParser';
import { AuthUser } from '../types/auth';
import {
  AROMA_KEYS,
  AROMA_META,
  DishItem,
  DOSAGE_META,
  Dosage,
  FlavorDatabase,
  Ingredient,
  MOUTHFEEL_KEYS,
  MOUTHFEEL_META,
  TASTE_KEYS,
  TASTE_META,
} from '../types/flavor';

interface RecipeAnalyzerProps {
  database: FlavorDatabase;
  currentUser: AuthUser;
  onSaveIngredient: (ing: Ingredient) => void;
  onLoadIntoSimulator: (items: DishItem[], customIngredients: Ingredient[]) => void;
}

interface AiStatusInfo {
  configured: boolean;
  provider: string | null;
  model: string | null;
  source: string | null;
}

function getScoreColor(score: number): { stroke: string; text: string; label: string } {
  if (score >= 82) return { stroke: '#34d399', text: 'text-emerald-300', label: 'Eccellente' };
  if (score >= 66) return { stroke: '#f59e0b', text: 'text-amber-300', label: 'Equilibrato' };
  if (score >= 48) return { stroke: '#fb923c', text: 'text-orange-300', label: 'Migliorabile' };
  return { stroke: '#f43f5e', text: 'text-rose-300', label: 'Squilibrato' };
}

export const RecipeAnalyzer: React.FC<RecipeAnalyzerProps> = ({
  database,
  currentUser,
  onSaveIngredient,
  onLoadIntoSimulator,
}) => {
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [engineMode, setEngineMode] = useState<'auto' | 'local'>('auto');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<RecipeAnalysisResult | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);
  const [savedCustomIds, setSavedCustomIds] = useState<Set<string>>(new Set());
  const [quickAddIngId, setQuickAddIngId] = useState('');

  // Stato IA lato server + configurazione opzionale
  const [aiStatus, setAiStatus] = useState<AiStatusInfo>({
    configured: false,
    provider: null,
    model: null,
    source: null,
  });
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [aiProviderInput, setAiProviderInput] = useState<'gemini' | 'openai'>('gemini');
  const [aiKeyInput, setAiKeyInput] = useState('');
  const [sessionApiKey, setSessionApiKey] = useState('');
  const [sessionProvider, setSessionProvider] = useState<'gemini' | 'openai'>('gemini');
  const [savingAiCfg, setSavingAiCfg] = useState(false);
  const [aiCfgFeedback, setAiCfgFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/ai/status', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) setAiStatus(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Database effettivo per la simulazione del report (include eventuali ingredienti stimati dall'IA)
  const effectiveDatabase = useMemo<FlavorDatabase>(() => {
    if (!analysis) return database;
    const existingIds = new Set(database.ingredients.map((i) => i.id));
    const extras = analysis.items
      .map((it) => it.customIngredient)
      .filter((ci): ci is Ingredient => Boolean(ci && !existingIds.has(ci.id)));
    if (extras.length === 0) return database;
    return {
      ...database,
      ingredients: [...database.ingredients, ...extras],
    };
  }, [database, analysis]);

  const dishItemsForReport = useMemo<DishItem[]>(() => {
    if (!analysis) return [];
    return analysis.items.map((it) => ({
      instanceId: it.id,
      ingredientId: it.ingredientId,
      techniqueId: it.techniqueId,
      dosage: it.dosage,
    }));
  }, [analysis]);

  const simulation = useMemo(
    () => simulateDish(dishItemsForReport, effectiveDatabase),
    [dishItemsForReport, effectiveDatabase]
  );

  const hasAiAvailable = aiStatus.configured || Boolean(sessionApiKey.trim());

  const handleLoadSample = (sample: (typeof SAMPLE_RECIPES)[number]) => {
    setRecipeTitle(sample.title);
    setRecipeText(sample.text);
    setErrorMsg(null);
  };

  const handleSaveServerAiConfig = async (clear = false) => {
    setSavingAiCfg(true);
    setAiCfgFeedback(null);
    try {
      const resp = await fetch('/api/admin/ai-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider: aiProviderInput,
          apiKey: clear ? '' : aiKeyInput.trim(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setAiCfgFeedback(data?.error || 'Errore durante il salvataggio.');
      } else {
        setAiStatus({
          configured: Boolean(data.configured),
          provider: data.provider || null,
          model: data.model || null,
          source: data.configured ? 'store' : null,
        });
        setAiKeyInput('');
        setAiCfgFeedback(
          clear
            ? 'Chiave IA rimossa dal server.'
            : `Chiave ${aiProviderInput.toUpperCase()} salvata sul server per tutti gli utenti.`
        );
      }
    } catch {
      setAiCfgFeedback('Errore di rete durante il salvataggio.');
    } finally {
      setSavingAiCfg(false);
    }
  };

  const handleAnalyze = async () => {
    const text = recipeText.trim();
    if (!text) {
      setErrorMsg('Incolla o scrivi prima il testo della ricetta.');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    setSavedCustomIds(new Set());

    try {
      // Se l'utente ha scelto Locale o non c'è alcuna chiave IA configurata, eseguiamo subito il motore locale
      if (engineMode === 'local' || !hasAiAvailable) {
        const localRes = parseRecipeLocally(recipeTitle, text, database);
        if (engineMode === 'auto' && !hasAiAvailable) {
          localRes.fallbackNotice =
            'Analisi eseguita con il Motore Locale (nessuna chiave IA configurata: puoi attivarla da "Impostazioni IA").';
        }
        setAnalysis(localRes);
        return;
      }

      // Altrimenti proviamo l'analisi IA via backend
      const resp = await fetch('/api/recipe/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipeTitle: recipeTitle.trim(),
          recipeText: text,
          ingredientsCatalog: database.ingredients.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
          })),
          techniquesCatalog: database.techniques.map((t) => ({
            id: t.id,
            name: t.name,
          })),
          ...(sessionApiKey.trim()
            ? { provider: sessionProvider, apiKey: sessionApiKey.trim() }
            : {}),
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const normalized = normalizeAiRecipeResponse(
          data.result || {},
          recipeTitle,
          database,
          data.provider,
          data.model
        );
        if (normalized.items.length > 0) {
          setAnalysis(normalized);
          return;
        }
      }

      // Fallback automatico al motore locale se l'IA risponde con errore o lista vuota
      const errData = await resp.json().catch(() => null);
      const localFallback = parseRecipeLocally(recipeTitle, text, database);
      localFallback.fallbackNotice = `IA non disponibile (${errData?.error || 'errore temporaneo'}): report generato automaticamente con il Motore Locale.`;
      setAnalysis(localFallback);
    } catch {
      const localFallback = parseRecipeLocally(recipeTitle, text, database);
      localFallback.fallbackNotice =
        'Errore di connessione al servizio IA: report generato con il Motore Locale.';
      setAnalysis(localFallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateItem = (
    itemId: string,
    patch: Partial<Pick<ExtractedRecipeItem, 'techniqueId' | 'dosage'>>
  ) => {
    setAnalysis((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
          }
        : prev
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setAnalysis((prev) =>
      prev ? { ...prev, items: prev.items.filter((it) => it.id !== itemId) } : prev
    );
  };

  const handleAddIngredientToReport = (
    ingredientId: string,
    techniqueId = 'tech_raw',
    dosage: Dosage = 'garnish',
    reason = 'Aggiunto manualmente al report'
  ) => {
    const ing = database.ingredients.find((i) => i.id === ingredientId);
    if (!ing) return;
    setAnalysis((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id: `manual_${ing.id}_${Date.now()}`,
            originalText: ing.name,
            quantityText: 'q.b.',
            ingredientId: ing.id,
            matchedName: ing.name,
            techniqueId,
            dosage,
            reason,
            source: 'database',
          },
        ],
      };
    });
  };

  const handleSaveCustomToAtlas = (item: ExtractedRecipeItem) => {
    if (!item.customIngredient) return;
    onSaveIngredient(item.customIngredient);
    setSavedCustomIds((prev) => new Set(prev).add(item.id));
  };

  const handleCopyMarkdown = async () => {
    if (!analysis) return;
    const md = buildMarkdownReport(analysis, simulation);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      // Fallback silenzioso
    }
  };

  const handleSendToSimulator = () => {
    if (!analysis || analysis.items.length === 0) return;
    const customs = analysis.items
      .map((it) => it.customIngredient)
      .filter((ci): ci is Ingredient => Boolean(ci));
    onLoadIntoSimulator(dishItemsForReport, customs);
  };

  const sortedIngredients = useMemo(
    () => [...database.ingredients].sort((a, b) => a.name.localeCompare(b.name, 'it')),
    [database.ingredients]
  );

  // Dati grafici Radar per il Report
  const tasteRadarData = TASTE_KEYS.map((k) => ({
    axis: TASTE_META[k].short,
    grezzo: simulation.rawTaste[k],
    percepito: simulation.perceived.taste[k],
  }));

  const mouthfeelRadarData = MOUTHFEEL_KEYS.map((k) => ({
    axis: MOUTHFEEL_META[k].short,
    grezzo: simulation.rawMouthfeel[k],
    percepito: simulation.perceived.mouthfeel[k],
  }));

  const aromaBars = [...AROMA_KEYS]
    .map((k) => ({
      key: k,
      ...AROMA_META[k],
      value: simulation.rawAromas[k],
    }))
    .filter((a) => a.value >= 0.5)
    .sort((a, b) => b.value - a.value);

  const scoreMeta = getScoreColor(simulation.balanceScore);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - simulation.balanceScore / 100);

  return (
    <div className="grid grid-cols-1 gap-6 lg:h-full lg:grid-cols-12 lg:gap-0">
      {/* COLONNA SINISTRA: Input Ricetta & Controlli */}
      <div className="lg:col-span-5 lg:h-full lg:overflow-y-auto lg:border-r lg:border-white/[0.06] lg:py-5 lg:pr-5">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <h2 className="text-sm font-semibold tracking-wide text-[#f6f1e7]">
                    Incolla o Scrivi una Ricetta
                  </h2>
                </div>
                <p className="mt-1 text-xs text-stone-400">
                  Estrazione automatica di ingredienti, grammature, tecniche di cottura e report
                  completo dei sapori.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiConfig((v) => !v)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${
                  showAiConfig || hasAiAvailable
                    ? 'border-amber-400/35 bg-amber-500/10 text-amber-200'
                    : 'border-white/10 bg-white/[0.03] text-stone-400 hover:text-stone-200'
                }`}
                title="Impostazioni motore IA"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>{hasAiAvailable ? 'IA Attiva' : 'Configura IA'}</span>
              </button>
            </div>

            {/* Pannello Configurazione IA opzionale */}
            {showAiConfig && (
              <div className="mt-4 rounded-xl border border-amber-400/25 bg-[#0c0f14] p-3.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                    <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                    <span>Motore IA (Gemini o OpenAI)</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      aiStatus.configured
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : sessionApiKey
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-white/10 text-stone-400'
                    }`}
                  >
                    {aiStatus.configured
                      ? `Server: ${aiStatus.provider?.toUpperCase()} (${aiStatus.model})`
                      : sessionApiKey
                        ? `Sessione: ${sessionProvider.toUpperCase()}`
                        : 'Solo Motore Locale'}
                  </span>
                </div>

                <p className="mt-1.5 text-[11px] leading-relaxed text-stone-400">
                  Senza chiave API il programma usa il{' '}
                  <strong className="text-stone-200">Motore Locale</strong> (istantaneo). Con una
                  chiave <strong className="text-stone-200">Gemini</strong> o{' '}
                  <strong className="text-stone-200">OpenAI</strong> l’IA riconosce anche
                  ingredienti non presenti nel database, stima il loro profilo chimico-sensoriale e
                  genera note gastronomiche personalizzate.
                </p>

                {currentUser.role === 'admin' ? (
                  <div className="mt-3 space-y-2.5">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <select
                        value={aiProviderInput}
                        onChange={(e) =>
                          setAiProviderInput(e.target.value === 'openai' ? 'openai' : 'gemini')
                        }
                        className="rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-100 outline-none focus:border-amber-400/50"
                      >
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI (GPT-4o mini)</option>
                      </select>
                      <input
                        type="password"
                        value={aiKeyInput}
                        onChange={(e) => setAiKeyInput(e.target.value)}
                        placeholder={
                          aiProviderInput === 'gemini'
                            ? 'Incolla GEMINI_API_KEY...'
                            : 'Incolla OPENAI_API_KEY (sk-...)'
                        }
                        className="rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-400/50 sm:col-span-2"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={savingAiCfg || !aiKeyInput.trim()}
                        onClick={() => handleSaveServerAiConfig(false)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-[11px] font-medium text-amber-200 ring-1 ring-amber-400/40 transition hover:bg-amber-500/30 disabled:opacity-40"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Salva sul server</span>
                      </button>
                      {aiStatus.configured && aiStatus.source === 'store' && (
                        <button
                          type="button"
                          disabled={savingAiCfg}
                          onClick={() => handleSaveServerAiConfig(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] text-rose-300 hover:bg-rose-500/20"
                        >
                          Rimuovi chiave
                        </button>
                      )}
                    </div>
                    {aiCfgFeedback && (
                      <div className="text-[11px] text-amber-300">{aiCfgFeedback}</div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <div className="text-[11px] text-stone-400">
                      Chiave temporanea (usata solo per questa sessione, non viene salvata):
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <select
                        value={sessionProvider}
                        onChange={(e) =>
                          setSessionProvider(e.target.value === 'openai' ? 'openai' : 'gemini')
                        }
                        className="rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-100 outline-none focus:border-amber-400/50"
                      >
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI</option>
                      </select>
                      <input
                        type="password"
                        value={sessionApiKey}
                        onChange={(e) => setSessionApiKey(e.target.value)}
                        placeholder="Chiave API opzionale..."
                        className="rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-400/50 sm:col-span-2"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ricette di esempio + 30 Ricette Storiche Italiane */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                  Ricette Storiche Italiane &amp; Esempi ({SAMPLE_RECIPES.length})
                </span>
              </div>
              <div className="mb-2">
                <select
                  aria-label="Seleziona una ricetta storica italiana"
                  defaultValue=""
                  onChange={(e) => {
                    const found = SAMPLE_RECIPES.find((s) => s.id === e.target.value);
                    if (found) handleLoadSample(found);
                  }}
                  className="w-full rounded-xl border border-amber-400/30 bg-[#0d1016] px-3 py-2 text-xs font-medium text-amber-100 outline-none transition focus:border-amber-400/60"
                >
                  <option value="" disabled>
                    📖 Scegli una delle 30 Ricette Storiche della Tradizione Italiana...
                  </option>
                  {SAMPLE_RECIPES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} — {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_RECIPES.slice(0, 6).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleLoadSample(s)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-stone-300 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-200"
                  >
                    <BookOpen className="h-3 w-3 text-amber-400" />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Titolo opzionale */}
            <div className="mt-4">
              <label
                htmlFor="recipe-title-input"
                className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-stone-400"
              >
                Titolo Ricetta (opzionale)
              </label>
              <input
                id="recipe-title-input"
                type="text"
                value={recipeTitle}
                onChange={(e) => setRecipeTitle(e.target.value)}
                placeholder="Es. Spaghetti alla Carbonara, Risotto ai Porcini..."
                className="w-full rounded-xl border border-white/10 bg-[#0b0d11] px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 outline-none transition focus:border-amber-400/50"
              />
            </div>

            {/* Area testo ricetta */}
            <div className="mt-3.5">
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="recipe-text-input"
                  className="text-[11px] font-medium uppercase tracking-wider text-stone-400"
                >
                  Testo della Ricetta (Ingredienti + Procedimento)
                </label>
                {recipeText && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecipeTitle('');
                      setRecipeText('');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-stone-500 hover:text-rose-300"
                  >
                    Pulisci
                  </button>
                )}
              </div>
              <textarea
                id="recipe-text-input"
                rows={12}
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
                placeholder={`Incolla qui la ricetta completa, ad esempio:\n\nIngredienti:\n- 320 g di spaghetti\n- 150 g di guanciale\n- 4 tuorli d'uovo\n- 80 g di pecorino romano\n- Pepe nero q.b.\n\nProcedimento:\nRosola il guanciale fino a renderlo croccante, tosta il pepe e manteca la pasta...`}
                className="w-full resize-y rounded-xl border border-white/10 bg-[#0b0d11] p-3.5 text-xs leading-relaxed text-stone-100 placeholder-stone-500 outline-none transition focus:border-amber-400/50"
              />
            </div>

            {/* Selettore Motore */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0b0d11] p-1">
                <button
                  type="button"
                  onClick={() => setEngineMode('auto')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                    engineMode === 'auto'
                      ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/35'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Auto {hasAiAvailable ? '(IA)' : '(Locale)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEngineMode('local')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                    engineMode === 'local'
                      ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/35'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Cpu className="h-3 w-3" />
                  <span>Solo Locale</span>
                </button>
              </div>

              <span className="font-code text-[10px] text-stone-500">
                {recipeText.length} caratteri
              </span>
            </div>

            {errorMsg && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Pulsante Analizza */}
            <button
              type="button"
              disabled={isAnalyzing || !recipeText.trim()}
              onClick={handleAnalyze}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-xs font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analisi ingredienti e sapori in corso...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Analizza Ricetta e Genera Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* COLONNA DESTRA: Report Sensoriale Completo */}
      <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto lg:py-5 lg:pl-5">
        {!analysis ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#11141a]/60 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-amber-300">
              <ChefHat className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold text-[#f6f1e7]">
              Report Sensoriale della Ricetta
            </h3>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-stone-400">
              Incolla o scrivi una ricetta nella colonna sinistra (oppure scegli un esempio rapido)
              per estrarre automaticamente gli ingredienti, dedurre le tecniche di cottura e
              generare il report completo di gusti, mouthfeel, aromi e ponti molecolari.
            </p>
            <div className="mt-6 grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Estrazione',
                  desc: 'Riconosce ingredienti, quantità e tecniche dal testo',
                },
                {
                  step: '02',
                  title: 'Calcolo Sapori',
                  desc: 'Simula chimica di cottura e percezione reale al palato',
                },
                {
                  step: '03',
                  title: 'Report & Export',
                  desc: 'Stampa PDF, copia Markdown o apri nel Simulatore',
                },
              ].map((card) => (
                <div
                  key={card.step}
                  className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-3 text-left"
                >
                  <div className="font-code text-[10px] font-semibold text-amber-400">
                    STEP {card.step}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-stone-200">{card.title}</div>
                  <div className="mt-0.5 text-[11px] text-stone-500">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Barra Azioni Report */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#11141a]/95 px-4 py-3 shadow-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                    analysis.engine === 'ai'
                      ? 'border-amber-400/40 bg-amber-500/15 text-amber-200'
                      : 'border-sky-400/35 bg-sky-500/10 text-sky-200'
                  }`}
                >
                  {analysis.engine === 'ai' ? (
                    <Sparkles className="h-3 w-3" />
                  ) : (
                    <Cpu className="h-3 w-3" />
                  )}
                  <span>
                    {analysis.engine === 'ai'
                      ? `IA (${analysis.provider?.toUpperCase() || 'AI'}) + FlavorEngine`
                      : 'Motore Locale + FlavorEngine'}
                  </span>
                </span>
                <span className="font-code text-[11px] text-stone-500">
                  {analysis.items.length} ingredienti
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-stone-200 transition hover:border-amber-400/40 hover:text-amber-200"
                >
                  {copiedMd ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-stone-400" />
                  )}
                  <span>{copiedMd ? 'Copiato!' : 'Copia MD'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPrintableReport(analysis, simulation)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-stone-200 transition hover:border-amber-400/40 hover:text-amber-200"
                >
                  <Printer className="h-3.5 w-3.5 text-amber-400" />
                  <span>Stampa / PDF</span>
                </button>

                <button
                  type="button"
                  disabled={analysis.items.length === 0}
                  onClick={handleSendToSimulator}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/40 transition hover:bg-amber-500/30 disabled:opacity-40"
                >
                  <span>Apri nel Simulatore</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {analysis.fallbackNotice && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] px-3.5 py-2.5 text-xs text-amber-200">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>{analysis.fallbackNotice}</span>
              </div>
            )}

            {/* Header Report + Gauge Armonia */}
            <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-24 w-24 shrink-0">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 92 92">
                    <circle
                      cx="46"
                      cy="46"
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="7"
                    />
                    <circle
                      cx="46"
                      cy="46"
                      r={radius}
                      fill="none"
                      stroke={analysis.items.length > 0 ? scoreMeta.stroke : 'rgba(255,255,255,0.12)'}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={analysis.items.length > 0 ? dashOffset : circumference}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-code text-2xl font-bold text-[#f6f1e7]">
                      {analysis.items.length > 0 ? simulation.balanceScore : '—'}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-stone-400">
                      / 100
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl font-semibold text-[#f6f1e7]">
                      {analysis.title}
                    </h2>
                    {analysis.servings && (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-stone-300">
                        {analysis.servings}
                      </span>
                    )}
                    {analysis.items.length > 0 && (
                      <span
                        className={`rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium ${scoreMeta.text}`}
                      >
                        {scoreMeta.label}
                      </span>
                    )}
                  </div>

                  {analysis.summary && (
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-400">
                      {analysis.summary}
                    </p>
                  )}

                  {analysis.items.length > 0 && (
                    <p className="mt-2 text-sm leading-relaxed text-stone-200">
                      {simulation.narrative}
                    </p>
                  )}

                  {analysis.items.length > 0 && (
                    <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { label: 'Equilibrio Gusto', val: simulation.harmonyBreakdown.tasteBalance },
                        {
                          label: 'Contrasto Texture',
                          val: simulation.harmonyBreakdown.textureContrast,
                        },
                        {
                          label: 'Ponti Aromatici',
                          val: simulation.harmonyBreakdown.aromaticCoherence,
                        },
                        { label: 'Flusso Temporale', val: simulation.harmonyBreakdown.temporalFlow },
                      ].map((sub) => (
                        <div
                          key={sub.label}
                          className="rounded-lg border border-white/[0.06] bg-[#0b0d11] p-2"
                        >
                          <div className="flex items-center justify-between text-[10px] text-stone-400">
                            <span className="truncate">{sub.label}</span>
                            <span className="font-code font-semibold text-stone-200">
                              {sub.val}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-amber-400/80"
                              style={{ width: `${sub.val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabella Ingredienti Estratti (modificabili in tempo reale) */}
            <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
                    Ingredienti &amp; Tecniche Rilevate (Modificabili Live)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Modifica tecnica di cottura o ruolo per aggiornare istantaneamente il report.
                  </p>
                </div>

                {/* Aggiunta rapida ingrediente */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={quickAddIngId}
                    onChange={(e) => setQuickAddIngId(e.target.value)}
                    className="max-w-[200px] rounded-lg border border-white/10 bg-[#0b0d11] px-2.5 py-1.5 text-[11px] text-stone-200 outline-none focus:border-amber-400/50"
                  >
                    <option value="">+ Aggiungi ingrediente...</option>
                    {sortedIngredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!quickAddIngId}
                    onClick={() => {
                      if (quickAddIngId) {
                        handleAddIngredientToReport(quickAddIngId);
                        setQuickAddIngId('');
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-lg bg-amber-500/20 p-1.5 text-amber-300 ring-1 ring-amber-400/35 hover:bg-amber-500/30 disabled:opacity-35"
                    title="Aggiungi ingrediente al report"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {analysis.items.length === 0 ? (
                <div className="rounded-xl border border-white/[0.06] bg-[#0b0d11] p-6 text-center text-xs text-stone-500">
                  Nessun ingrediente estratto. Aggiungili dal menu sopra o riformula la ricetta
                  elencando gli ingredienti uno per riga.
                </div>
              ) : (
                <div className="space-y-2">
                  {analysis.items.map((item) => {
                    const isSavedCustom = savedCustomIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold text-stone-100">
                                {item.matchedName}
                              </span>
                              <span className="rounded bg-white/10 px-1.5 py-0.5 font-code text-[10px] text-amber-200">
                                {item.quantityText}
                              </span>
                              {item.source === 'ai_estimated' && (
                                <span className="rounded border border-amber-400/30 bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300">
                                  Stimato da IA
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 text-[11px] text-stone-500">
                              {item.originalText !== item.matchedName && (
                                <span>Da ricetta: “{item.originalText}” · </span>
                              )}
                              <span>{item.reason}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.source === 'ai_estimated' && item.customIngredient && (
                              <button
                                type="button"
                                disabled={isSavedCustom}
                                onClick={() => handleSaveCustomToAtlas(item)}
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                                title="Salva questo ingrediente nel tuo Atlante"
                              >
                                <Save className="h-3 w-3" />
                                <span>{isSavedCustom ? 'Salvato' : 'Salva in Atlante'}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="rounded-md p-1 text-stone-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                              title="Rimuovi dal report"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-12">
                          <select
                            value={item.techniqueId}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { techniqueId: e.target.value })
                            }
                            className="rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-[11px] text-stone-200 outline-none focus:border-amber-400/50 sm:col-span-8"
                          >
                            {database.techniques.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>

                          <select
                            value={item.dosage}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { dosage: e.target.value as Dosage })
                            }
                            className="rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-[11px] text-stone-200 outline-none focus:border-amber-400/50 sm:col-span-4"
                          >
                            {(['main', 'secondary', 'garnish'] as Dosage[]).map((d) => (
                              <option key={d} value={d}>
                                {DOSAGE_META[d].label} ({DOSAGE_META[d].short})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {analysis.unmatched.length > 0 && (
                <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300">
                    Voci non abbinate nel database:{' '}
                  </span>
                  {analysis.unmatched.join(', ')}
                </div>
              )}
            </div>

            {/* Grafici Sapori & Mouthfeel */}
            {analysis.items.length > 0 && (
              <>
                <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-200">
                    Profilo dei Sapori Primari &amp; Mouthfeel
                  </h3>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-300">
                          Gusti Primari (Grezzi vs Percepiti)
                        </span>
                      </div>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={tasteRadarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="axis" tick={{ fill: '#d6d3d1', fontSize: 11 }} />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 10]}
                              tick={{ fill: '#78716c', fontSize: 9 }}
                              axisLine={false}
                            />
                            <Radar
                              name="Chimico grezzo"
                              dataKey="grezzo"
                              stroke="#78716c"
                              fill="#78716c"
                              fillOpacity={0.18}
                              strokeDasharray="4 3"
                            />
                            <Radar
                              name="Percepito reale"
                              dataKey="percepito"
                              stroke="#f59e0b"
                              fill="#f59e0b"
                              fillOpacity={0.32}
                              strokeWidth={2}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#13171d',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '10px',
                                fontSize: '12px',
                                color: '#f4efe6',
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-300">
                          Profilo Tattile &amp; Mouthfeel
                        </span>
                      </div>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={mouthfeelRadarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="axis" tick={{ fill: '#d6d3d1', fontSize: 11 }} />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 10]}
                              tick={{ fill: '#78716c', fontSize: 9 }}
                              axisLine={false}
                            />
                            <Radar
                              name="Grezzo"
                              dataKey="grezzo"
                              stroke="#78716c"
                              fill="#78716c"
                              fillOpacity={0.18}
                              strokeDasharray="4 3"
                            />
                            <Radar
                              name="Percepito"
                              dataKey="percepito"
                              stroke="#38bdf8"
                              fill="#38bdf8"
                              fillOpacity={0.28}
                              strokeWidth={2}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#13171d',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '10px',
                                fontSize: '12px',
                                color: '#f4efe6',
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Valori numerici gusti */}
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {TASTE_KEYS.map((k) => (
                      <div
                        key={k}
                        className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-stone-400">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: TASTE_META[k].color }}
                          />
                          <span>{TASTE_META[k].short}</span>
                        </div>
                        <div className="mt-0.5 flex items-baseline gap-1.5">
                          <span className="font-code text-base font-semibold text-stone-100">
                            {simulation.perceived.taste[k].toFixed(1)}
                          </span>
                          <span className="font-code text-[10px] text-stone-500">
                            ({simulation.rawTaste[k].toFixed(1)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spettro Aromatico & Ponti Molecolari */}
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                  <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl xl:col-span-6">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-200">
                      Spettro Aromatico Dominante
                    </h3>
                    <div className="space-y-2.5">
                      {aromaBars.slice(0, 8).map((a) => (
                        <div key={a.key}>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: a.color }}
                              />
                              <span className="font-medium text-stone-200">{a.label}</span>
                            </div>
                            <span className="font-code text-[11px] font-semibold text-stone-300">
                              {a.value.toFixed(1)}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, a.value * 10)}%`,
                                backgroundColor: a.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl xl:col-span-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-200">
                        <Link2 className="h-3.5 w-3.5 text-amber-400" />
                        <span>Ponti Molecolari Chiave</span>
                      </h3>
                      <span className="font-code text-[10px] text-stone-500">
                        Top {Math.min(5, simulation.molecularBridges.length)}
                      </span>
                    </div>

                    {simulation.molecularBridges.length === 0 ? (
                      <p className="text-xs text-stone-500">
                        Servono almeno 2 ingredienti per calcolare i ponti molecolari.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {simulation.molecularBridges.slice(0, 5).map((bridge) => (
                          <div
                            key={bridge.id}
                            className="rounded-lg border border-white/[0.07] bg-[#0c0f14] p-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="truncate text-xs font-semibold text-stone-100">
                                {bridge.nameA.split(' (')[0]}{' '}
                                <span className="text-amber-400">↔</span>{' '}
                                {bridge.nameB.split(' (')[0]}
                              </div>
                              <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 font-code text-[11px] font-semibold text-amber-200">
                                {bridge.similarity}%
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {bridge.sharedAromas.length > 0 ? (
                                bridge.sharedAromas.map((sa) => (
                                  <span
                                    key={sa.key}
                                    className={`rounded border px-1.5 py-0.5 text-[10px] ${AROMA_META[sa.key].bgClass} ${AROMA_META[sa.key].textClass}`}
                                  >
                                    {sa.label}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] italic text-stone-500">
                                  Contrasto aromatico
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Curva Temporale del Boccone */}
                <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-200">
                    Evoluzione Temporale del Boccone
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {simulation.temporalCurve.map((phase) => (
                      <div
                        key={phase.phase}
                        className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200">
                            <Clock className="h-3.5 w-3.5 text-amber-400" />
                            {phase.label}
                          </span>
                          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-code text-[10px] text-stone-300">
                            {phase.window}
                          </span>
                        </div>
                        <div className="mt-2 font-code text-xl font-bold text-[#f6f1e7]">
                          {phase.intensity.toFixed(1)}{' '}
                          <span className="text-[10px] font-normal text-stone-500">/ 10</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {phase.drivers.map((d) => (
                            <span
                              key={d}
                              className="rounded-md border border-amber-400/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note IA + Diagnosi dello Chef & Correttivi */}
                <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl">
                  <div className="mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
                      Diagnosi dello Chef, Note IA &amp; Correttivi
                    </h3>
                  </div>

                  {analysis.chefNotes.length > 0 && (
                    <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-500/[0.07] p-3.5">
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Osservazioni Gastronomiche IA</span>
                      </div>
                      <ul className="list-disc space-y-1 pl-4 text-xs text-amber-100/90">
                        {analysis.chefNotes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="space-y-2 lg:col-span-6">
                      {simulation.diagnostics.map((diag) => {
                        const style =
                          diag.severity === 'warning'
                            ? 'border-amber-500/35 bg-amber-500/[0.08] text-amber-100'
                            : diag.severity === 'success'
                              ? 'border-emerald-500/35 bg-emerald-500/[0.08] text-emerald-100'
                              : 'border-sky-500/30 bg-sky-500/[0.07] text-sky-100';
                        const Icon =
                          diag.severity === 'warning'
                            ? AlertCircle
                            : diag.severity === 'success'
                              ? CheckCircle2
                              : Info;
                        return (
                          <div key={diag.id} className={`rounded-xl border p-3 text-xs ${style}`}>
                            <div className="flex items-start gap-2">
                              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                              <div>
                                <div className="font-semibold">{diag.title}</div>
                                <p className="mt-0.5 text-[11px] opacity-90">{diag.message}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2 lg:col-span-6">
                      {simulation.suggestions.slice(0, 2).map((sug) => (
                        <div
                          key={`${sug.ingredient.id}_${sug.technique.id}`}
                          className="rounded-xl border border-white/[0.08] bg-[#0c0f14] p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-semibold text-stone-100">
                                {sug.ingredient.name}
                              </div>
                              <div className="text-[10px] text-stone-400">
                                {sug.technique.name} · {DOSAGE_META[sug.dosage].label}
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 font-code text-[10px] font-semibold text-emerald-300">
                              +{sug.scoreGain} pt
                            </span>
                          </div>
                          <p className="mt-1.5 text-[11px] text-stone-400">{sug.reason}</p>
                          <button
                            type="button"
                            onClick={() =>
                              handleAddIngredientToReport(
                                sug.ingredient.id,
                                sug.technique.id,
                                sug.dosage,
                                'Correttivo suggerito'
                              )
                            }
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200 transition hover:bg-amber-500/20"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span>Aggiungi al report</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
