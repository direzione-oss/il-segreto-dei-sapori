import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Copy,
  Cpu,
  FileText,
  FileUp,
  FolderHeart,
  Info,
  KeyRound,
  Link2,
  Loader2,
  Paperclip,
  Plus,
  PlusCircle,
  Printer,
  Save,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Wand2,
  X,
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
  buildSavedCharacteristics,
  ExtractedRecipeItem,
  normalizeAiRecipeResponse,
  openPrintableReport,
  parseRecipeLocally,
  RecipeAnalysisResult,
  SAMPLE_RECIPES,
  SavedRecipe,
} from '../engine/recipeParser';
import { AuthUser } from '../types/auth';
import { FlavorSolid3D } from './FlavorSolid3D';
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

  // Allegato PDF ricetta
  const [attachedPdf, setAttachedPdf] = useState<{
    fileName: string;
    pages: number;
    sizeBytes: number;
    base64: string;
  } | null>(null);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // Ricettario personale: ricette salvate con caratteristiche trovate
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [savedSearchQuery, setSavedSearchQuery] = useState('');

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

    fetch('/api/recipes', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.recipes)) {
          setSavedRecipes(data.recipes);
        }
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
    setAttachedPdf(null);
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

  const runRecipeAnalysis = async (
    titleToUse: string,
    textToUse: string,
    pdfAttachment: typeof attachedPdf = attachedPdf
  ) => {
    const text = textToUse.trim();
    if (!text && !pdfAttachment?.base64) {
      setErrorMsg('Incolla o scrivi il testo della ricetta oppure allega un file PDF.');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    setSavedCustomIds(new Set());

    try {
      // Se l'utente ha scelto Locale o non c'è alcuna chiave IA configurata, eseguiamo subito il motore locale
      if (engineMode === 'local' || !hasAiAvailable) {
        const localRes = parseRecipeLocally(titleToUse, text, database);
        if (pdfAttachment) {
          localRes.sourcePdfName = pdfAttachment.fileName;
          localRes.sourcePdfPages = pdfAttachment.pages;
        }
        if (engineMode === 'auto' && !hasAiAvailable) {
          localRes.fallbackNotice = pdfAttachment
            ? `PDF "${pdfAttachment.fileName}" (${pdfAttachment.pages} pag.) letto e analizzato con il Motore Locale.`
            : 'Analisi eseguita con il Motore Locale (nessuna chiave IA configurata: puoi attivarla da "Impostazioni IA").';
        }
        setAnalysis(localRes);
        return;
      }

      // Altrimenti proviamo l'analisi IA via backend (con eventuale PDF allegato)
      const resp = await fetch('/api/recipe/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipeTitle: titleToUse.trim(),
          recipeText: text,
          ...(pdfAttachment
            ? {
                pdfBase64: pdfAttachment.base64,
                pdfFileName: pdfAttachment.fileName,
              }
            : {}),
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
          titleToUse,
          database,
          data.provider,
          data.model
        );
        if (pdfAttachment) {
          normalized.sourcePdfName = pdfAttachment.fileName;
          normalized.sourcePdfPages = pdfAttachment.pages;
        }
        if (normalized.items.length > 0) {
          setAnalysis(normalized);
          return;
        }
      }

      // Fallback automatico al motore locale se l'IA risponde con errore o lista vuota
      const errData = await resp.json().catch(() => null);
      const localFallback = parseRecipeLocally(titleToUse, text, database);
      if (pdfAttachment) {
        localFallback.sourcePdfName = pdfAttachment.fileName;
        localFallback.sourcePdfPages = pdfAttachment.pages;
      }
      localFallback.fallbackNotice = `IA non disponibile (${errData?.error || 'errore temporaneo'}): report generato automaticamente con il Motore Locale.`;
      setAnalysis(localFallback);
    } catch {
      const localFallback = parseRecipeLocally(titleToUse, text, database);
      if (pdfAttachment) {
        localFallback.sourcePdfName = pdfAttachment.fileName;
        localFallback.sourcePdfPages = pdfAttachment.pages;
      }
      localFallback.fallbackNotice =
        'Errore di connessione al servizio IA: report generato con il Motore Locale.';
      setAnalysis(localFallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    void runRecipeAnalysis(recipeTitle, recipeText, attachedPdf);
  };

  const handleAttachPdfFile = async (file: File) => {
    if (!file) return;
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMsg('Seleziona un file in formato PDF (.pdf).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Il file PDF supera la dimensione massima consentita (15 MB).');
      return;
    }

    setErrorMsg(null);
    setIsReadingPdf(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const commaIdx = result.indexOf(',');
          resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
        };
        reader.onerror = () => reject(new Error('Errore lettura file PDF.'));
        reader.readAsDataURL(file);
      });

      const resp = await fetch('/api/recipe/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          pdfBase64: base64,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setErrorMsg(data?.error || 'Impossibile estrarre il testo dal PDF.');
        return;
      }

      const extractedText = String(data.text || '').trim();
      const suggestedTitle = String(
        data.suggestedTitle || file.name.replace(/\.pdf$/i, '')
      ).trim();
      const pages = Number(data.pages || 1);

      const nextPdf = {
        fileName: file.name,
        pages,
        sizeBytes: file.size,
        base64,
      };
      setAttachedPdf(nextPdf);
      setRecipeTitle(suggestedTitle);
      setRecipeText(
        extractedText ||
          `[Documento PDF allegato: ${file.name} (${pages} pag.) — Nessun testo selezionabile trovato; utilizza l'analisi IA Gemini per lettura ottica del PDF]`
      );

      // Avvia automaticamente la comprensione e l'analisi degli ingredienti dal PDF
      await runRecipeAnalysis(suggestedTitle, extractedText, nextPdf);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Errore durante la lettura del file PDF.'
      );
    } finally {
      setIsReadingPdf(false);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
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

  const handleSaveRecipe = async (saveAsNew = false) => {
    if (!analysis || analysis.items.length === 0) return;
    setIsSavingRecipe(true);
    setSaveFeedback(null);
    try {
      const characteristics = buildSavedCharacteristics(simulation);
      const payload = {
        id: saveAsNew ? undefined : activeSavedId || undefined,
        title: (recipeTitle.trim() || analysis.title || 'Ricetta Salvata').trim(),
        servings: analysis.servings,
        recipeText,
        summary: analysis.summary,
        chefNotes: analysis.chefNotes,
        userNotes: userNotes.trim(),
        engine: analysis.engine,
        provider: analysis.provider || null,
        model: analysis.model || null,
        sourcePdfName: analysis.sourcePdfName || null,
        sourcePdfPages: analysis.sourcePdfPages || null,
        items: analysis.items,
        characteristics,
      };

      const resp = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipe: payload }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setSaveFeedback({
          type: 'err',
          text: data?.error || 'Impossibile salvare la ricetta.',
        });
        return;
      }

      if (Array.isArray(data.recipes)) {
        setSavedRecipes(data.recipes);
      }
      if (data.recipe?.id) {
        setActiveSavedId(data.recipe.id);
      }
      setSaveFeedback({
        type: 'ok',
        text:
          !saveAsNew && activeSavedId
            ? 'Ricetta e caratteristiche aggiornate nel Ricettario!'
            : 'Ricetta salvata nel tuo Ricettario con tutte le caratteristiche trovate!',
      });
      setTimeout(() => setSaveFeedback(null), 4000);
    } catch {
      setSaveFeedback({ type: 'err', text: 'Errore di rete durante il salvataggio.' });
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const handleLoadSavedRecipe = (saved: SavedRecipe) => {
    setAttachedPdf(
      saved.sourcePdfName
        ? {
            fileName: saved.sourcePdfName,
            pages: saved.sourcePdfPages || 1,
            sizeBytes: 0,
            base64: '',
          }
        : null
    );
    setActiveSavedId(saved.id);
    setRecipeTitle(saved.title);
    setRecipeText(saved.recipeText || '');
    setUserNotes(saved.userNotes || '');
    setSaveFeedback(null);
    setErrorMsg(null);
    setAnalysis({
      title: saved.title,
      servings: saved.servings,
      summary: saved.summary,
      chefNotes: saved.chefNotes || [],
      engine: saved.engine || 'local',
      provider: saved.provider || null,
      model: saved.model || null,
      sourcePdfName: saved.sourcePdfName || null,
      sourcePdfPages: saved.sourcePdfPages || null,
      items: saved.items || [],
      unmatched: [],
      analyzedAt: saved.updatedAt || saved.createdAt,
    });
  };

  const handleDeleteSavedRecipe = async (saved: SavedRecipe) => {
    if (!window.confirm(`Eliminare la ricetta salvata "${saved.title}" dal tuo Ricettario?`)) {
      return;
    }
    try {
      const resp = await fetch(`/api/recipes/${encodeURIComponent(saved.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && Array.isArray(data.recipes)) {
        setSavedRecipes(data.recipes);
        if (activeSavedId === saved.id) {
          setActiveSavedId(null);
        }
      }
    } catch {
      // Ignora errore temporaneo
    }
  };

  const filteredSavedRecipes = useMemo(() => {
    const q = savedSearchQuery.trim().toLowerCase();
    if (!q) return savedRecipes;
    return savedRecipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.summary && r.summary.toLowerCase().includes(q)) ||
        (r.userNotes && r.userNotes.toLowerCase().includes(q)) ||
        r.items.some((it) => it.matchedName.toLowerCase().includes(q))
    );
  }, [savedRecipes, savedSearchQuery]);

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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <h2 className="text-sm font-semibold tracking-wide text-[#f6f1e7]">
                    Incolla, Scrivi o Allega un PDF con la Ricetta
                  </h2>
                </div>
                <p className="mt-1 text-xs text-stone-400">
                  Estrazione automatica di ingredienti, grammature, tecniche di cottura e report
                  completo dei sapori.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isReadingPdf || isAnalyzing}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-400/45 bg-amber-500/15 px-3 py-1.5 text-[11px] font-semibold text-amber-200 transition hover:bg-amber-500/25 disabled:opacity-40"
                  title="Seleziona un file PDF con la ricetta dal tuo computer"
                >
                  <FileUp className="h-3.5 w-3.5 text-amber-300" />
                  <span>Allega PDF</span>
                </button>
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
            </div>

            {/* Box Allega File PDF Ricetta (in cima, Click o Drag & Drop) */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                  📄 Carica Documento PDF Ricetta
                </span>
                {attachedPdf && (
                  <button
                    type="button"
                    onClick={() => setAttachedPdf(null)}
                    className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-rose-300"
                  >
                    <X className="h-3 w-3" />
                    <span>Rimuovi PDF</span>
                  </button>
                )}
              </div>

              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleAttachPdfFile(file);
                }}
              />

              {attachedPdf ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3.5 py-2.5 text-xs">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Paperclip className="h-4 w-4 shrink-0 text-amber-400" />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-amber-100">
                        {attachedPdf.fileName}
                      </div>
                      <div className="text-[11px] text-amber-200/80">
                        {attachedPdf.pages} {attachedPdf.pages === 1 ? 'pagina' : 'pagine'} &bull;{' '}
                        {Math.max(1, Math.round(attachedPdf.sizeBytes / 1024))} KB &bull; Ricetta
                        estratta e pronta
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={isReadingPdf || isAnalyzing}
                    className="shrink-0 rounded-lg border border-amber-400/35 bg-[#0b0d11] px-2.5 py-1 text-[11px] font-medium text-amber-200 transition hover:bg-amber-500/20 disabled:opacity-40"
                  >
                    Cambia PDF
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingPdf(true);
                  }}
                  onDragLeave={() => setIsDraggingPdf(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingPdf(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) void handleAttachPdfFile(file);
                  }}
                  onClick={() => {
                    if (!isReadingPdf && !isAnalyzing) pdfInputRef.current?.click();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      pdfInputRef.current?.click();
                    }
                  }}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-dashed px-3.5 py-3.5 transition ${
                    isDraggingPdf
                      ? 'border-amber-400 bg-amber-500/15'
                      : 'border-amber-400/35 bg-amber-500/[0.04] hover:border-amber-400/65 hover:bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-500/15 text-amber-300">
                      {isReadingPdf ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <FileUp className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-amber-100">
                        {isReadingPdf
                          ? 'Lettura e comprensione del PDF in corso...'
                          : 'Clicca qui o trascina un file PDF con la ricetta'}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Il programma legge il PDF, comprende la ricetta e analizza gli ingredienti
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg border border-amber-400/40 bg-amber-500/20 px-3 py-1.5 text-[11px] font-semibold text-amber-100">
                    Sfoglia PDF
                  </span>
                </div>
              )}
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
                {(recipeText || attachedPdf) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedPdf(null);
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

          {/* CARD: Il Mio Ricettario Salvato (con Caratteristiche Trovate) */}
          <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderHeart className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-semibold tracking-wide text-[#f6f1e7]">
                  Le Mie Ricette Salvate
                </h2>
              </div>
              <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 font-code text-[11px] font-semibold text-amber-200">
                {savedRecipes.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-400">
              Archivio personale delle tue ricette con ingredienti, tecniche e caratteristiche
              sensoriali calcolate.
            </p>

            {savedRecipes.length > 2 && (
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={savedSearchQuery}
                  onChange={(e) => setSavedSearchQuery(e.target.value)}
                  placeholder="Cerca tra le tue ricette salvate..."
                  className="w-full rounded-xl border border-white/10 bg-[#0b0d11] py-2 pl-9 pr-3 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-400/50"
                />
              </div>
            )}

            {savedRecipes.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-[#0c0f14] p-4 text-center text-xs text-stone-500">
                Nessuna ricetta salvata. Analizza una ricetta (da testo o da PDF) e clicca su{' '}
                <strong className="text-amber-300">“Salva Ricetta”</strong> nel report per
                archiviarla con tutte le caratteristiche trovate.
              </div>
            ) : filteredSavedRecipes.length === 0 ? (
              <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#0c0f14] p-4 text-center text-xs text-stone-500">
                Nessuna ricetta salvata corrisponde alla ricerca.
              </div>
            ) : (
              <div className="mt-3 max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
                {filteredSavedRecipes.map((saved) => {
                  const isCurrent = activeSavedId === saved.id;
                  const char = saved.characteristics;
                  const scoreCol = getScoreColor(char?.balanceScore ?? 0);

                  // Top 2 gusti percepiti
                  const topTastes = char?.perceivedTaste
                    ? [...TASTE_KEYS]
                        .map((k) => ({
                          key: k,
                          label: TASTE_META[k].short,
                          val: char.perceivedTaste[k] ?? 0,
                        }))
                        .filter((t) => t.val >= 1.5)
                        .sort((a, b) => b.val - a.val)
                        .slice(0, 2)
                    : [];

                  return (
                    <div
                      key={saved.id}
                      className={`rounded-xl border p-3.5 transition ${
                        isCurrent
                          ? 'border-amber-400/50 bg-amber-500/[0.09]'
                          : 'border-white/[0.08] bg-[#0c0f14] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate text-xs font-semibold text-stone-100">
                              {saved.title}
                            </span>
                            {saved.sourcePdfName && (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300">
                                <Paperclip className="h-2.5 w-2.5" />
                                PDF
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-[10px] text-stone-500">
                            {saved.items.length} ingr. &bull;{' '}
                            {new Date(saved.updatedAt || saved.createdAt).toLocaleDateString(
                              'it-IT'
                            )}
                          </div>
                        </div>

                        {char && (
                          <div className="shrink-0 text-right">
                            <span
                              className={`rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 font-code text-xs font-bold ${scoreCol.text}`}
                            >
                              {char.balanceScore}/100
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Caratteristiche Sensoriali Trovate */}
                      {char && (
                        <div className="mt-2.5 space-y-2 border-t border-white/[0.06] pt-2">
                          <div className="grid grid-cols-4 gap-1 text-center font-code text-[10px]">
                            <div className="rounded bg-white/[0.03] px-1.5 py-1">
                              <span className="block text-[9px] text-stone-500">Gusto</span>
                              <span className="font-semibold text-stone-200">
                                {char.harmonyBreakdown.tasteBalance}
                              </span>
                            </div>
                            <div className="rounded bg-white/[0.03] px-1.5 py-1">
                              <span className="block text-[9px] text-stone-500">Texture</span>
                              <span className="font-semibold text-stone-200">
                                {char.harmonyBreakdown.textureContrast}
                              </span>
                            </div>
                            <div className="rounded bg-white/[0.03] px-1.5 py-1">
                              <span className="block text-[9px] text-stone-500">Aromi</span>
                              <span className="font-semibold text-stone-200">
                                {char.harmonyBreakdown.aromaticCoherence}
                              </span>
                            </div>
                            <div className="rounded bg-white/[0.03] px-1.5 py-1">
                              <span className="block text-[9px] text-stone-500">Flusso</span>
                              <span className="font-semibold text-stone-200">
                                {char.harmonyBreakdown.temporalFlow}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {topTastes.map((t) => (
                              <span
                                key={t.key}
                                className="rounded border border-amber-400/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-200"
                              >
                                {t.label} {t.val.toFixed(1)}
                              </span>
                            ))}
                            {char.topAromas?.slice(0, 2).map((a) => (
                              <span
                                key={a.key}
                                className="rounded border border-sky-400/25 bg-sky-500/10 px-1.5 py-0.5 text-[10px] text-sky-200"
                              >
                                {a.label} {a.value.toFixed(1)}
                              </span>
                            ))}
                            {char.topBridges?.[0] && (
                              <span className="rounded border border-emerald-400/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-200">
                                Ponte: {char.topBridges[0].nameA} ↔ {char.topBridges[0].nameB} (
                                {char.topBridges[0].similarity}%)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {saved.userNotes && (
                        <p className="mt-2 line-clamp-2 rounded-lg bg-white/[0.02] px-2.5 py-1.5 text-[11px] italic text-stone-400">
                          “{saved.userNotes}”
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleLoadSavedRecipe(saved)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-200 ring-1 ring-amber-400/35 transition hover:bg-amber-500/30"
                        >
                          <Bookmark className="h-3 w-3" />
                          <span>{isCurrent ? 'Aperta nel Report' : 'Apri Report'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const dishItems: DishItem[] = (saved.items || []).map((it) => ({
                                instanceId: it.id,
                                ingredientId: it.ingredientId,
                                techniqueId: it.techniqueId,
                                dosage: it.dosage,
                              }));
                              const customs = (saved.items || [])
                                .map((it) => it.customIngredient)
                                .filter((ci): ci is Ingredient => Boolean(ci));
                              onLoadIntoSimulator(dishItems, customs);
                            }}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-stone-300 transition hover:border-amber-400/40 hover:text-amber-200"
                            title="Carica direttamente nel Simulatore Piatto"
                          >
                            Simulatore
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSavedRecipe(saved)}
                            className="rounded-lg p-1 text-stone-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                            title="Elimina ricetta salvata"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#11141a]/95 px-4 py-3.5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
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
                  {analysis.sourcePdfName && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-200">
                      <Paperclip className="h-3 w-3 text-amber-400" />
                      <span className="max-w-[180px] truncate">{analysis.sourcePdfName}</span>
                      {analysis.sourcePdfPages ? <span>({analysis.sourcePdfPages}p)</span> : null}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isSavingRecipe || analysis.items.length === 0}
                    onClick={() => handleSaveRecipe(false)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-40"
                    title="Salva la ricetta con gli ingredienti e tutte le caratteristiche sensoriali trovate"
                  >
                    {isSavingRecipe ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span>{activeSavedId ? 'Aggiorna Salvata' : 'Salva Ricetta'}</span>
                  </button>

                  {activeSavedId && (
                    <button
                      type="button"
                      disabled={isSavingRecipe || analysis.items.length === 0}
                      onClick={() => handleSaveRecipe(true)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-stone-200 transition hover:border-emerald-400/40 hover:text-emerald-200 disabled:opacity-40"
                      title="Salva come nuova copia nel Ricettario"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Salva Copia</span>
                    </button>
                  )}

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

              {/* Barra Note Personali per il salvataggio */}
              <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-2.5 sm:flex-row sm:items-center">
                <span className="shrink-0 text-[11px] font-medium text-stone-400">
                  Note personali ricetta:
                </span>
                <input
                  type="text"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Aggiungi una nota personale da salvare insieme alle caratteristiche della ricetta..."
                  className="flex-1 rounded-lg border border-white/10 bg-[#0b0d11] px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 outline-none focus:border-amber-400/50"
                />
              </div>

              {saveFeedback && (
                <div
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                    saveFeedback.type === 'ok'
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                      : 'border-rose-500/35 bg-rose-500/10 text-rose-200'
                  }`}
                >
                  {saveFeedback.type === 'ok' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{saveFeedback.text}</span>
                </div>
              )}
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

                  {/* Solido 3D della Ricetta: Cristallo Sensoriale Ruotabile */}
                  <div className="mt-5">
                    <FlavorSolid3D
                      simulation={simulation}
                      recipeName={analysis.title || 'Ricetta Analizzata'}
                    />
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
