import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Database,
  Download,
  Flame,
  Plus,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { clamp, normalizeIngredient } from '../data/seedData';
import {
  AROMA_KEYS,
  AROMA_META,
  AromaKey,
  CATEGORY_META,
  FlavorDatabase,
  Ingredient,
  IngredientCategory,
  MOUTHFEEL_KEYS,
  MOUTHFEEL_META,
  MouthfeelKey,
  RawIngredientInput,
  TASTE_KEYS,
  TASTE_META,
  TasteKey,
  Technique,
  TechniqueType,
  TemporalPeak,
  TemporalShift,
} from '../types/flavor';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FlavorDatabase;
  onAddIngredient: (ing: Ingredient) => void;
  onAddTechnique: (tech: Technique) => void;
  onImportDatabase: (db: FlavorDatabase) => void;
  onResetDatabase: () => void;
}

type ModalTab = 'json' | 'add_ingredient' | 'add_technique';

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  database,
  onAddIngredient,
  onAddTechnique,
  onImportDatabase,
  onResetDatabase,
}) => {
  const [tab, setTab] = useState<ModalTab>('json');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Form state: New Ingredient
  const [ingName, setIngName] = useState('');
  const [ingCategory, setIngCategory] = useState<IngredientCategory>('vegetable');
  const [ingVolume, setIngVolume] = useState(3);
  const [ingPeak, setIngPeak] = useState<TemporalPeak>('mid');
  const [ingComp, setIngComp] = useState({ water: 0.75, protein: 0.05, carbs_sugars: 0.1, fat: 0.05 });
  const [ingTaste, setIngTaste] = useState<Partial<Record<TasteKey, number>>>({ sweet: 2, umami: 2 });
  const [ingMouthfeel, setIngMouthfeel] = useState<Partial<Record<MouthfeelKey, number>>>({
    juiciness: 4,
    crunchiness: 3,
  });
  const [ingAromas, setIngAromas] = useState<Partial<Record<AromaKey, number>>>({
    green_herbaceous: 3,
  });

  // Form state: New Technique
  const [techName, setTechName] = useState('');
  const [techType, setTechType] = useState<TechniqueType>('dry_heat');
  const [techVolShift, setTechVolShift] = useState(1);
  const [techTempShift, setTechTempShift] = useState<TemporalShift>('mid');
  const [techMinProt, setTechMinProt] = useState('');
  const [techMinCarbs, setTechMinCarbs] = useState('');
  const [techMinFat, setTechMinFat] = useState('');
  const [techTasteAdd, setTechTasteAdd] = useState<Partial<Record<TasteKey, number>>>({ umami: 2 });
  const [techAromaAdd, setTechAromaAdd] = useState<Partial<Record<AromaKey, number>>>({
    roasted_pyrazine: 4,
  });

  if (!isOpen) return null;

  const jsonString = JSON.stringify(database, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flavorengine-database.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const incomingIngs: RawIngredientInput[] = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.ingredients)
            ? parsed.ingredients
            : [];
        const incomingTechs: Technique[] = Array.isArray(parsed.techniques)
          ? parsed.techniques
          : [];

        if (incomingIngs.length === 0 && incomingTechs.length === 0) {
          setImportError('Il file JSON non contiene array "ingredients" o "techniques" validi.');
          return;
        }

        // Merge by id (existing overwritten if same id, new ones appended)
        const ingMap = new Map(database.ingredients.map((i) => [i.id, i]));
        for (const raw of incomingIngs) {
          if (raw?.id && raw?.name) {
            ingMap.set(raw.id, normalizeIngredient(raw));
          }
        }

        const techMap = new Map(database.techniques.map((t) => [t.id, t]));
        for (const t of incomingTechs) {
          if (t?.id && t?.name) {
            techMap.set(t.id, t);
          }
        }

        onImportDatabase({
          ingredients: Array.from(ingMap.values()),
          techniques: Array.from(techMap.values()),
        });
        setImportSuccess(
          `Importati ${incomingIngs.length} ingredienti e ${incomingTechs.length} tecniche nel database.`
        );
      } catch (err) {
        setImportError(`Errore nel parsing JSON: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingName.trim()) return;
    const id = `ing_custom_${Date.now()}`;
    const newIng = normalizeIngredient({
      id,
      name: ingName.trim(),
      category: ingCategory,
      composition: ingComp,
      base_state: {
        volume: clamp(ingVolume, 1, 5),
        temporal_peak: ingPeak,
        taste: ingTaste,
        mouthfeel: ingMouthfeel,
        aromas: ingAromas,
      },
    });
    onAddIngredient(newIng);
    setIngName('');
    setImportSuccess(`Ingrediente «${newIng.name}» aggiunto e salvato in localStorage.`);
    setTab('json');
  };

  const handleCreateTechnique = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techName.trim()) return;
    const id = `tech_custom_${Date.now()}`;
    const newTech: Technique = {
      id,
      name: techName.trim(),
      type: techType,
      preconditions: {
        ...(techMinProt !== '' ? { min_protein: Number(techMinProt) } : {}),
        ...(techMinCarbs !== '' ? { min_carbs_sugars: Number(techMinCarbs) } : {}),
        ...(techMinFat !== '' ? { min_fat: Number(techMinFat) } : {}),
      },
      deltas: {
        volume_shift: techVolShift,
        temporal_shift: techTempShift,
        taste_add: techTasteAdd,
        mouthfeel_add: {},
        aroma_multipliers: {},
        aroma_add: techAromaAdd,
      },
    };
    onAddTechnique(newTech);
    setTechName('');
    setImportSuccess(`Tecnica «${newTech.name}» aggiunta e salvata in localStorage.`);
    setTab('json');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#12151c] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-base font-semibold text-[#f6f1e7]">
                Gestione Database Sensoriale
              </h2>
              <p className="text-xs text-stone-400">
                {database.ingredients.length} ingredienti &bull; {database.techniques.length} tecniche
                (persistenza automatica in localStorage)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0d1015] px-5 py-2.5">
          <div className="flex gap-1.5">
            {[
              { id: 'json' as const, label: 'Ispeziona / Importa JSON', icon: Code2 },
              { id: 'add_ingredient' as const, label: '+ Nuovo Ingrediente', icon: Plus },
              { id: 'add_technique' as const, label: '+ Nuova Tecnica', icon: Flame },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    tab === t.id
                      ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40'
                      : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onResetDatabase();
              setImportSuccess('Database ripristinato ai dati di fabbrica.');
              setImportError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Ripristina dati di fabbrica</span>
          </button>
        </div>

        {/* Feedback Banner */}
        {(importError || importSuccess) && (
          <div
            className={`mx-5 mt-3 rounded-lg border px-3 py-2 text-xs ${
              importError
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            {importError || importSuccess}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'json' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-stone-400">
                  Puoi esportare il database attuale o importare un file JSON con nuovi ingredienti e
                  tecniche (verranno uniti automaticamente per <code className="text-amber-300">id</code>).
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-500/25">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Importa JSON</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-stone-200 transition hover:bg-white/10"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Esporta</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-stone-200 transition hover:bg-white/10"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? 'Copiato!' : 'Copia JSON'}</span>
                  </button>
                </div>
              </div>

              <pre className="max-h-[420px] overflow-auto rounded-xl border border-white/10 bg-[#090b0f] p-4 font-code text-[11px] leading-relaxed text-stone-300">
                {jsonString}
              </pre>
            </div>
          )}

          {tab === 'add_ingredient' && (
            <form onSubmit={handleCreateIngredient} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-300">
                    Nome Ingrediente *
                  </label>
                  <input
                    required
                    value={ingName}
                    onChange={(e) => setIngName(e.target.value)}
                    placeholder="es. Pomodoro San Marzano"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-300">Categoria</label>
                  <select
                    value={ingCategory}
                    onChange={(e) => setIngCategory(e.target.value as IngredientCategory)}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/50"
                  >
                    {(Object.keys(CATEGORY_META) as IngredientCategory[]).map((cat) => (
                      <option key={cat} value={cat} className="bg-[#12151c]">
                        {CATEGORY_META[cat].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-300">
                    Volume Percettivo (1–5): <strong className="text-amber-300">{ingVolume}</strong>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={ingVolume}
                    onChange={(e) => setIngVolume(Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-300">
                    Picco Temporale Base
                  </label>
                  <select
                    value={ingPeak}
                    onChange={(e) => setIngPeak(e.target.value as TemporalPeak)}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/50"
                  >
                    <option value="attack">Attacco (0–2s)</option>
                    <option value="mid">Centro Bocca (3–8s)</option>
                    <option value="finish">Finale (8+s)</option>
                  </select>
                </div>
              </div>

              {/* Composizione Chimica */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Composizione Chimica (0.0 – 1.0)
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      ['water', 'Acqua'],
                      ['protein', 'Proteine'],
                      ['carbs_sugars', 'Zuccheri/Carb'],
                      ['fat', 'Grassi'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label className="mb-1 block text-[11px] text-stone-400">{label}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={ingComp[key]}
                        onChange={(e) =>
                          setIngComp((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-2.5 py-1.5 font-code text-xs text-stone-100 outline-none focus:border-amber-400/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gusti Primari */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Gusti Primari (0 – 10)
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {TASTE_KEYS.map((k) => (
                    <div key={k}>
                      <label className="mb-1 block text-[11px] text-stone-400">
                        {TASTE_META[k].label}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={ingTaste[k] ?? 0}
                        onChange={(e) =>
                          setIngTaste((prev) => ({ ...prev, [k]: Number(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-2.5 py-1.5 font-code text-xs text-stone-100 outline-none focus:border-amber-400/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mouthfeel */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Mouthfeel & Consistenza (0 – 10)
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {MOUTHFEEL_KEYS.map((k) => (
                    <div key={k}>
                      <label className="mb-1 block text-[11px] text-stone-400">
                        {MOUTHFEEL_META[k].label}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={ingMouthfeel[k] ?? 0}
                        onChange={(e) =>
                          setIngMouthfeel((prev) => ({ ...prev, [k]: Number(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-2.5 py-1.5 font-code text-xs text-stone-100 outline-none focus:border-amber-400/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Aromi */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Famiglie Aromatiche Molecolari (0 – 10)
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {AROMA_KEYS.map((k) => (
                    <div key={k}>
                      <label className="mb-1 block text-[11px] text-stone-400">
                        {AROMA_META[k].short}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={ingAromas[k] ?? 0}
                        onChange={(e) =>
                          setIngAromas((prev) => ({ ...prev, [k]: Number(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-2.5 py-1.5 font-code text-xs text-stone-100 outline-none focus:border-amber-400/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-stone-950 transition hover:bg-amber-400"
                >
                  <Plus className="h-4 w-4" />
                  Salva Ingrediente nel Database
                </button>
              </div>
            </form>
          )}

          {tab === 'add_technique' && (
            <form onSubmit={handleCreateTechnique} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-300">
                    Nome Tecnica *
                  </label>
                  <input
                    required
                    value={techName}
                    onChange={(e) => setTechName(e.target.value)}
                    placeholder="es. Fermentazione lattica (7 giorni)"
                    className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-300">Tipologia</label>
                  <select
                    value={techType}
                    onChange={(e) => setTechType(e.target.value as TechniqueType)}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/50"
                  >
                    <option value="dry_heat">Calore secco (Dry Heat)</option>
                    <option value="moist_heat">Calore umido (Moist Heat)</option>
                    <option value="marinade">Marinatura / Fermentazione</option>
                    <option value="fat_infusion">Infusione lipidica</option>
                    <option value="raw">A crudo</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-300">
                    Shift Volume (-2 a +2)
                  </label>
                  <input
                    type="number"
                    min={-2}
                    max={2}
                    value={techVolShift}
                    onChange={(e) => setTechVolShift(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-3 py-2 font-code text-xs text-stone-100 outline-none focus:border-amber-400/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-300">
                    Shift Picco Temporale
                  </label>
                  <select
                    value={techTempShift}
                    onChange={(e) => setTechTempShift(e.target.value as TemporalShift)}
                    className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400/50"
                  >
                    <option value="keep">Mantieni originale</option>
                    <option value="attack">Sposta su Attacco</option>
                    <option value="mid">Sposta su Centro Bocca</option>
                    <option value="finish">Sposta su Finale</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Precondizioni Chimiche Opzionali (0.0 – 1.0)
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] text-stone-400">Min Proteine</label>
                    <input
                      type="number"
                      step="0.005"
                      min="0"
                      max="1"
                      placeholder="es. 0.015"
                      value={techMinProt}
                      onChange={(e) => setTechMinProt(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-2.5 py-1.5 font-code text-xs text-stone-100 outline-none focus:border-amber-400/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-stone-400">
                      Min Carboidrati / Zuccheri
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="es. 0.04"
                      value={techMinCarbs}
                      onChange={(e) => setTechMinCarbs(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-2.5 py-1.5 font-code text-xs text-stone-100 outline-none focus:border-amber-400/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-stone-400">Min Grassi</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="es. 0.05"
                      value={techMinFat}
                      onChange={(e) => setTechMinFat(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-2.5 py-1.5 font-code text-xs text-stone-100 outline-none focus:border-amber-400/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Delta Gusti (somma algebrica, -10 a +10)
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {TASTE_KEYS.map((k) => (
                    <div key={k}>
                      <label className="mb-1 block text-[11px] text-stone-400">
                        {TASTE_META[k].label}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="-10"
                        max="10"
                        value={techTasteAdd[k] ?? 0}
                        onChange={(e) =>
                          setTechTasteAdd((prev) => ({ ...prev, [k]: Number(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-2.5 py-1.5 font-code text-xs text-stone-100 outline-none focus:border-amber-400/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Delta Aromi (aggiunta diretta, 0 a +10)
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {AROMA_KEYS.map((k) => (
                    <div key={k}>
                      <label className="mb-1 block text-[11px] text-stone-400">
                        {AROMA_META[k].short}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={techAromaAdd[k] ?? 0}
                        onChange={(e) =>
                          setTechAromaAdd((prev) => ({ ...prev, [k]: Number(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-2.5 py-1.5 font-code text-xs text-stone-100 outline-none focus:border-amber-400/50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-stone-950 transition hover:bg-amber-400"
                >
                  <Plus className="h-4 w-4" />
                  Salva Tecnica nel Database
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
