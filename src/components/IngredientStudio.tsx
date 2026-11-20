import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChefHat,
  Copy,
  FlaskConical,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
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
import {
  clamp,
  normalizeAromas,
  normalizeIngredient,
  normalizeMouthfeel,
  normalizeTaste,
  SEED_DATABASE,
} from '../data/seedData';
import {
  AROMA_KEYS,
  AROMA_META,
  AromaKey,
  CATEGORY_META,
  Ingredient,
  IngredientCategory,
  MOUTHFEEL_KEYS,
  MOUTHFEEL_META,
  MouthfeelKey,
  TASTE_KEYS,
  TASTE_META,
  TasteKey,
  TEMPORAL_META,
  TemporalPeak,
} from '../types/flavor';

interface IngredientStudioProps {
  ingredients: Ingredient[];
  onSaveIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (ingredientId: string) => void;
  onAddToDish: (ingredientId: string) => void;
}

const CATEGORIES: Array<IngredientCategory | 'all'> = [
  'all',
  'protein_meat',
  'protein_fish',
  'vegetable',
  'fruit',
  'dairy',
  'fat',
  'acid',
  'herb_spice',
  'umami_condiment',
];

const SEED_BY_ID = new Map(SEED_DATABASE.ingredients.map((i) => [i.id, i]));

function cloneIngredient(ing: Ingredient): Ingredient {
  return {
    id: ing.id,
    name: ing.name,
    category: ing.category,
    composition: { ...ing.composition },
    base_state: {
      volume: ing.base_state.volume,
      temporal_peak: ing.base_state.temporal_peak,
      taste: { ...ing.base_state.taste },
      mouthfeel: { ...ing.base_state.mouthfeel },
      aromas: { ...ing.base_state.aromas },
    },
  };
}

function createBlankDraft(): Ingredient {
  return {
    id: '',
    name: '',
    category: 'vegetable',
    composition: { water: 0.7, protein: 0.05, carbs_sugars: 0.1, fat: 0.05 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: normalizeTaste({}),
      mouthfeel: normalizeMouthfeel({}),
      aromas: normalizeAromas({}),
    },
  };
}

function ingredientsEqual(a: Ingredient, b: Ingredient): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function getTopAromas(ing: Ingredient, limit = 3): Array<{ key: AromaKey; value: number }> {
  return AROMA_KEYS.map((key) => ({ key, value: ing.base_state.aromas[key] ?? 0 }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export const IngredientStudio: React.FC<IngredientStudioProps> = ({
  ingredients,
  onSaveIngredient,
  onDeleteIngredient,
  onAddToDish,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all');

  const [selectedId, setSelectedId] = useState<string | null>(() => ingredients[0]?.id ?? null);
  const [isCreating, setIsCreating] = useState<boolean>(ingredients.length === 0);
  const [draft, setDraft] = useState<Ingredient>(() =>
    ingredients[0] ? cloneIngredient(ingredients[0]) : createBlankDraft()
  );

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [addedToDishFeedback, setAddedToDishFeedback] = useState(false);

  const selectedIngredient = useMemo(
    () => (selectedId ? ingredients.find((i) => i.id === selectedId) ?? null : null),
    [ingredients, selectedId]
  );

  // Se l'ingrediente selezionato viene rimosso esternamente (es. reset DB), seleziona il primo disponibile
  useEffect(() => {
    if (isCreating) return;
    if (selectedId && !ingredients.some((i) => i.id === selectedId)) {
      const next = ingredients[0] ?? null;
      if (next) {
        setSelectedId(next.id);
        setDraft(cloneIngredient(next));
      } else {
        setSelectedId(null);
        setIsCreating(true);
        setDraft(createBlankDraft());
      }
    }
  }, [ingredients, selectedId, isCreating]);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    window.setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const filteredIngredients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ingredients.filter((ing) => {
      const catOk = selectedCategory === 'all' || ing.category === selectedCategory;
      if (!catOk) return false;
      if (!q) return true;
      if (ing.name.toLowerCase().includes(q)) return true;
      if (CATEGORY_META[ing.category].label.toLowerCase().includes(q)) return true;
      // Ricerca anche per nota aromatica attiva
      return AROMA_KEYS.some(
        (k) =>
          (ing.base_state.aromas[k] ?? 0) > 0 &&
          (AROMA_META[k].label.toLowerCase().includes(q) ||
            AROMA_META[k].short.toLowerCase().includes(q) ||
            AROMA_META[k].molecules.toLowerCase().includes(q))
      );
    });
  }, [ingredients, search, selectedCategory]);

  const isDirty = useMemo(() => {
    if (isCreating) return true;
    if (!selectedIngredient) return false;
    return !ingredientsEqual(draft, selectedIngredient);
  }, [draft, selectedIngredient, isCreating]);

  const seedOriginal = selectedId ? SEED_BY_ID.get(selectedId) ?? null : null;
  const isModifiedFromSeed = Boolean(
    seedOriginal && selectedIngredient && !ingredientsEqual(selectedIngredient, seedOriginal)
  );
  const isCustomIngredient = Boolean(selectedId && !seedOriginal);

  const handleSelectIngredient = (ing: Ingredient) => {
    setIsCreating(false);
    setSelectedId(ing.id);
    setDraft(cloneIngredient(ing));
    setConfirmDelete(false);
    setNameError(null);
  };

  const handleStartNew = () => {
    setIsCreating(true);
    setSelectedId(null);
    setDraft(createBlankDraft());
    setConfirmDelete(false);
    setNameError(null);
  };

  const handleSave = () => {
    const trimmedName = draft.name.trim();
    if (!trimmedName) {
      setNameError('Inserisci un nome per l’ingrediente prima di salvare.');
      return;
    }
    setNameError(null);

    const id =
      isCreating || !draft.id
        ? `ing_custom_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`
        : draft.id;

    const normalized = normalizeIngredient({
      ...draft,
      id,
      name: trimmedName,
    });

    onSaveIngredient(normalized);
    setIsCreating(false);
    setSelectedId(normalized.id);
    setDraft(cloneIngredient(normalized));
    setConfirmDelete(false);
    showToast(
      isCreating
        ? `Ingrediente «${normalized.name}» creato e salvato.`
        : `Modifiche a «${normalized.name}» salvate.`
    );
  };

  const handleDuplicate = () => {
    const baseName = (draft.name.trim() || 'Nuovo Ingrediente').replace(/\s*\(Copia(?:\s*\d+)?\)$/i, '');
    let copyName = `${baseName} (Copia)`;
    let counter = 2;
    const existingNames = new Set(ingredients.map((i) => i.name.toLowerCase()));
    while (existingNames.has(copyName.toLowerCase())) {
      copyName = `${baseName} (Copia ${counter})`;
      counter += 1;
    }

    const newId = `ing_custom_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const duplicated = normalizeIngredient({
      ...draft,
      id: newId,
      name: copyName,
    });

    onSaveIngredient(duplicated);
    setIsCreating(false);
    setSelectedId(duplicated.id);
    setDraft(cloneIngredient(duplicated));
    setConfirmDelete(false);
    setNameError(null);
    showToast(`Creata copia «${duplicated.name}».`);
  };

  const handleDeleteConfirmed = () => {
    if (!selectedId) return;
    const deletedName = selectedIngredient?.name || 'Ingrediente';
    const currentIdx = ingredients.findIndex((i) => i.id === selectedId);
    const remaining = ingredients.filter((i) => i.id !== selectedId);

    onDeleteIngredient(selectedId);
    setConfirmDelete(false);

    if (remaining.length > 0) {
      const next = remaining[Math.min(currentIdx, remaining.length - 1)];
      setIsCreating(false);
      setSelectedId(next.id);
      setDraft(cloneIngredient(next));
    } else {
      setIsCreating(true);
      setSelectedId(null);
      setDraft(createBlankDraft());
    }
    showToast(`Ingrediente «${deletedName}» eliminato.`);
  };

  const handleRestoreSeed = () => {
    if (!seedOriginal) return;
    const restored = cloneIngredient(seedOriginal);
    onSaveIngredient(restored);
    setDraft(cloneIngredient(restored));
    setConfirmDelete(false);
    showToast(`Valori originali di «${restored.name}» ripristinati.`);
  };

  const handleDiscardChanges = () => {
    if (isCreating) {
      if (ingredients[0]) {
        handleSelectIngredient(ingredients[0]);
      } else {
        setDraft(createBlankDraft());
      }
      return;
    }
    if (selectedIngredient) {
      setDraft(cloneIngredient(selectedIngredient));
      setNameError(null);
    }
  };

  const handleAddCurrentToDish = () => {
    if (!selectedId || isCreating) return;
    onAddToDish(selectedId);
    setAddedToDishFeedback(true);
    window.setTimeout(() => setAddedToDishFeedback(false), 1600);
  };

  // Helpers di aggiornamento bozza
  const updateAroma = (key: AromaKey, val: number) => {
    const nextVal = clamp(Number.isNaN(val) ? 0 : val, 0, 10);
    setDraft((prev) => ({
      ...prev,
      base_state: {
        ...prev.base_state,
        aromas: { ...prev.base_state.aromas, [key]: nextVal },
      },
    }));
  };

  const updateTaste = (key: TasteKey, val: number) => {
    const nextVal = clamp(Number.isNaN(val) ? 0 : val, 0, 10);
    setDraft((prev) => ({
      ...prev,
      base_state: {
        ...prev.base_state,
        taste: { ...prev.base_state.taste, [key]: nextVal },
      },
    }));
  };

  const updateMouthfeel = (key: MouthfeelKey, val: number) => {
    const nextVal = clamp(Number.isNaN(val) ? 0 : val, 0, 10);
    setDraft((prev) => ({
      ...prev,
      base_state: {
        ...prev.base_state,
        mouthfeel: { ...prev.base_state.mouthfeel, [key]: nextVal },
      },
    }));
  };

  const updateComposition = (key: keyof Ingredient['composition'], val: number) => {
    const nextVal = clamp(Number.isNaN(val) ? 0 : val, 0, 1);
    setDraft((prev) => ({
      ...prev,
      composition: { ...prev.composition, [key]: Number(nextVal.toFixed(3)) },
    }));
  };

  // Dati grafici live dal draft
  const aromaRadarData = useMemo(
    () =>
      AROMA_KEYS.map((k) => ({
        axis: AROMA_META[k].short,
        fullLabel: AROMA_META[k].label,
        valore: draft.base_state.aromas[k] ?? 0,
      })),
    [draft.base_state.aromas]
  );

  const tasteRadarData = useMemo(
    () =>
      TASTE_KEYS.map((k) => ({
        axis: TASTE_META[k].short,
        fullLabel: TASTE_META[k].label,
        valore: draft.base_state.taste[k] ?? 0,
      })),
    [draft.base_state.taste]
  );

  const activeAromasSorted = useMemo(
    () =>
      AROMA_KEYS.map((k) => ({ key: k, value: draft.base_state.aromas[k] ?? 0 }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value),
    [draft.base_state.aromas]
  );

  const compositionTotalPct = Math.round(
    (draft.composition.water +
      draft.composition.protein +
      draft.composition.carbs_sugars +
      draft.composition.fat) *
      100
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:h-full lg:grid-cols-12 lg:gap-0">
      {/* COLONNA SINISTRA: Catalogo Ingredienti */}
      <aside className="flex flex-col lg:col-span-4 lg:h-full lg:overflow-hidden lg:border-r lg:border-white/[0.06] lg:py-5 lg:pr-5">
        <div className="flex flex-col rounded-2xl border border-white/10 bg-[#11141a]/90 p-4 shadow-xl lg:h-full lg:overflow-hidden">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold tracking-wide text-[#f6f1e7]">
                Atlante Ingredienti
              </h2>
              <span className="rounded-full bg-white/10 px-2 py-0.5 font-code text-[10px] text-stone-300">
                {filteredIngredients.length}/{ingredients.length}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartNew}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-2.5 py-1.5 text-xs font-semibold text-stone-950 transition hover:bg-amber-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nuovo</span>
            </button>
          </div>

          {/* Ricerca */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per nome, categoria o aroma (es. Pirazine)..."
              className="w-full rounded-lg border border-white/10 bg-[#0b0d11] py-2 pl-9 pr-8 text-xs text-stone-100 placeholder-stone-500 outline-none transition focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/25"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtri categoria */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const label = cat === 'all' ? 'Tutti' : CATEGORY_META[cat].label;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition ${
                    active
                      ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                      : 'border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-stone-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Elenco Ingredienti */}
          <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto pr-1 max-h-[420px] lg:max-h-none">
            {filteredIngredients.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-stone-500">
                Nessun ingrediente trovato con questi filtri.
              </div>
            ) : (
              filteredIngredients.map((ing) => {
                const isSelected = !isCreating && selectedId === ing.id;
                const catMeta = CATEGORY_META[ing.category];
                const topAromas = getTopAromas(ing, 3);
                const seedOrig = SEED_BY_ID.get(ing.id);
                const isCustom = !seedOrig;
                const isEdited = Boolean(seedOrig && !ingredientsEqual(ing, seedOrig));

                return (
                  <button
                    key={ing.id}
                    type="button"
                    onClick={() => handleSelectIngredient(ing)}
                    className={`w-full rounded-xl border p-2.5 text-left transition ${
                      isSelected
                        ? 'border-amber-400/60 bg-amber-500/12 shadow-[0_0_18px_rgba(217,155,67,0.12)]'
                        : 'border-white/[0.07] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-semibold text-stone-100">
                            {ing.name}
                          </span>
                          {isCustom && (
                            <span className="shrink-0 rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-sky-300">
                              Custom
                            </span>
                          )}
                          {isEdited && (
                            <span className="shrink-0 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300">
                              Modificato
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`inline-block rounded border px-1.5 py-0.2 text-[10px] ${catMeta.colorClass}`}
                          >
                            {catMeta.label}
                          </span>
                          <span className="font-code text-[10px] text-stone-500">
                            Vol {ing.base_state.volume}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    {topAromas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {topAromas.map(({ key, value }) => (
                          <span
                            key={key}
                            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] ${AROMA_META[key].bgClass} ${AROMA_META[key].textClass}`}
                          >
                            <span>{AROMA_META[key].short}</span>
                            <strong className="font-code">{value.toFixed(1)}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* COLONNA DESTRA: Scheda Aromatica & Editor Completo */}
      <section className="lg:col-span-8 lg:h-full lg:overflow-y-auto lg:py-5 lg:pl-5">
        <div className="space-y-5 pb-6">
          {/* Toolbar Azioni */}
          <div className="sticky top-0 z-10 rounded-2xl border border-white/10 bg-[#11141a]/95 p-4 shadow-xl backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-display text-xl font-semibold text-[#f6f1e7]">
                    {isCreating
                      ? draft.name.trim() || 'Nuovo Ingrediente da Zero'
                      : draft.name.trim() || 'Senza nome'}
                  </h2>
                  {isCreating ? (
                    <span className="rounded-full border border-sky-400/40 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                      Creazione
                    </span>
                  ) : isDirty ? (
                    <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                      Modifiche non salvate
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      Salvato
                    </span>
                  )}
                  {isCustomIngredient && !isCreating && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-stone-400">
                      Personalizzato
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-stone-400">
                  Modifica direttamente i valori aromatici, i gusti primari, il mouthfeel e la composizione chimica.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!isCreating && selectedId && (
                  <button
                    type="button"
                    onClick={handleAddCurrentToDish}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-stone-200 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-200"
                    title="Aggiungi questo ingrediente al piatto nel simulatore"
                  >
                    {addedToDishFeedback ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Aggiunto!</span>
                      </>
                    ) : (
                      <>
                        <ChefHat className="h-3.5 w-3.5 text-amber-400" />
                        <span>Usa nel piatto</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-stone-200 transition hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-sky-200"
                  title="Duplica questo ingrediente per crearne una variante"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Duplica</span>
                </button>

                {isModifiedFromSeed && !isCreating && (
                  <button
                    type="button"
                    onClick={handleRestoreSeed}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-stone-300 transition hover:border-amber-400/40 hover:text-amber-200"
                    title="Ripristina i valori originali di fabbrica per questo ingrediente"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Originale</span>
                  </button>
                )}

                {isDirty && !isCreating && (
                  <button
                    type="button"
                    onClick={handleDiscardChanges}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-stone-400 transition hover:bg-white/10 hover:text-stone-200"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Annulla</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty && !isCreating}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    isDirty || isCreating
                      ? 'bg-amber-500 text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.28)] hover:bg-amber-400'
                      : 'cursor-not-allowed border border-white/10 bg-white/5 text-stone-500'
                  }`}
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isCreating ? 'Crea e Salva' : 'Salva Modifiche'}</span>
                </button>

                {!isCreating && selectedId && (
                  confirmDelete ? (
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 px-2 py-1">
                      <span className="text-[11px] font-medium text-rose-200">Eliminare?</span>
                      <button
                        type="button"
                        onClick={handleDeleteConfirmed}
                        className="rounded bg-rose-500 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-rose-400"
                      >
                        Sì, elimina
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="rounded px-1.5 py-1 text-[11px] text-stone-300 hover:bg-white/10"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/10 px-2.5 py-2 text-xs font-medium text-rose-300 transition hover:border-rose-500/50 hover:bg-rose-500/20"
                      title="Elimina questo ingrediente dal database"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                )}
              </div>
            </div>

            {statusMessage && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>{statusMessage}</span>
              </div>
            )}

            {nameError && (
              <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {nameError}
              </div>
            )}
          </div>

          {/* ANTEPRIMA VISIVA: Radar Aromatico & Gusti + Impronta Molecolare */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            {/* Radar 12 Aromi */}
            <div className="rounded-2xl border border-white/10 bg-[#11141a]/90 p-4 shadow-xl xl:col-span-7">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                    Impronta Aromatica (12 Famiglie)
                  </h3>
                </div>
                <span className="font-code text-[11px] text-stone-500">
                  {activeAromasSorted.length}/12 attivi
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={aromaRadarData} outerRadius="74%">
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: '#a8a29e', fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 10]}
                      tick={{ fill: '#57534e', fontSize: 9 }}
                      tickCount={6}
                    />
                    <Radar
                      name="Intensità"
                      dataKey="valore"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.28}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#12151c',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: '#f4efe6',
                      }}
                      formatter={(value: number) => [`${Number(value).toFixed(1)} / 10`, 'Intensità']}
                      labelFormatter={(_label, payload) =>
                        payload?.[0]?.payload?.fullLabel || ''
                      }
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Pillole aromi attivi */}
              <div className="mt-2 border-t border-white/[0.06] pt-3">
                {activeAromasSorted.length === 0 ? (
                  <p className="text-xs text-stone-500">
                    Nessun aroma impostato. Regola gli slider nella sezione qui sotto per definire il profilo aromatico.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {activeAromasSorted.map(({ key, value }) => (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] ${AROMA_META[key].bgClass} ${AROMA_META[key].textClass}`}
                        title={AROMA_META[key].molecules}
                      >
                        <span className="font-medium">{AROMA_META[key].label}</span>
                        <span className="font-code font-bold">{value.toFixed(1)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Radar 5 Gusti Primari */}
            <div className="rounded-2xl border border-white/10 bg-[#11141a]/90 p-4 shadow-xl xl:col-span-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                  Profilo Gustativo Base
                </h3>
                <span className="font-code text-[11px] text-stone-500">
                  Vol {draft.base_state.volume}/5 &bull; {TEMPORAL_META[draft.base_state.temporal_peak].label}
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={tasteRadarData} outerRadius="72%">
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: '#d6d3d1', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 10]}
                      tick={{ fill: '#57534e', fontSize: 9 }}
                      tickCount={6}
                    />
                    <Radar
                      name="Gusto"
                      dataKey="valore"
                      stroke="#38bdf8"
                      fill="#38bdf8"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#12151c',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: '#f4efe6',
                      }}
                      formatter={(value: number) => [`${Number(value).toFixed(1)} / 10`, 'Intensità']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 grid grid-cols-5 gap-1.5 border-t border-white/[0.06] pt-3 text-center">
                {TASTE_KEYS.map((k) => (
                  <div key={k} className="rounded-lg bg-white/[0.03] px-1 py-1.5">
                    <div className="text-[10px] text-stone-400">{TASTE_META[k].short}</div>
                    <div
                      className="font-code text-xs font-semibold"
                      style={{ color: TASTE_META[k].color }}
                    >
                      {(draft.base_state.taste[k] ?? 0).toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 1: Anagrafica & Dinamica */}
          <div className="rounded-2xl border border-white/10 bg-[#11141a]/90 p-5 shadow-xl">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
              1. Anagrafica &amp; Dinamica Percettiva
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-300">
                  Nome Ingrediente *
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => {
                    setDraft((prev) => ({ ...prev, name: e.target.value }));
                    if (nameError) setNameError(null);
                  }}
                  placeholder="es. Pomodoro San Marzano DOP"
                  className="w-full rounded-lg border border-white/10 bg-[#0b0d11] px-3 py-2 text-xs text-stone-100 outline-none transition focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/25"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-300">Categoria</label>
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      category: e.target.value as IngredientCategory,
                    }))
                  }
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
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-300">Volume Percettivo (1–5)</span>
                  <span className="font-code font-semibold text-amber-300">
                    {draft.base_state.volume} / 5
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          base_state: { ...prev.base_state, volume: v },
                        }))
                      }
                      className={`rounded-lg border py-1.5 font-code text-xs font-semibold transition ${
                        draft.base_state.volume === v
                          ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                          : 'border-white/10 bg-[#0b0d11] text-stone-400 hover:border-white/25 hover:text-stone-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-stone-300">
                  Picco Temporale Base
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['attack', 'mid', 'finish'] as TemporalPeak[]).map((peak) => (
                    <button
                      key={peak}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          base_state: { ...prev.base_state, temporal_peak: peak },
                        }))
                      }
                      className={`rounded-lg border px-2 py-1.5 text-center transition ${
                        draft.base_state.temporal_peak === peak
                          ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                          : 'border-white/10 bg-[#0b0d11] text-stone-400 hover:border-white/25 hover:text-stone-200'
                      }`}
                    >
                      <div className="text-[11px] font-medium">{TEMPORAL_META[peak].label}</div>
                      <div className="font-code text-[9px] opacity-75">
                        {TEMPORAL_META[peak].window}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Famiglie Aromatiche Molecolari (12 aromi) */}
          <div className="rounded-2xl border border-white/10 bg-[#11141a]/90 p-5 shadow-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  2. Gusti Aromatici Molecolari (0 – 10)
                </h3>
                <p className="mt-0.5 text-[11px] text-stone-400">
                  Regola direttamente l’intensità di ciascuna delle 12 famiglie aromatiche volatili.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    base_state: { ...prev.base_state, aromas: normalizeAromas({}) },
                  }))
                }
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-stone-400 transition hover:border-white/25 hover:text-stone-200"
              >
                Azzera aromi
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {AROMA_KEYS.map((key) => {
                const meta = AROMA_META[key];
                const val = draft.base_state.aromas[key] ?? 0;
                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-3 transition ${
                      val > 0
                        ? 'border-white/15 bg-white/[0.035]'
                        : 'border-white/[0.06] bg-[#0b0d11]/70'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          <span className="truncate text-xs font-semibold text-stone-100">
                            {meta.label}
                          </span>
                        </div>
                        <div className="mt-0.5 pl-3.5 text-[10px] text-stone-500">
                          {meta.molecules}
                        </div>
                      </div>

                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={val}
                        onChange={(e) => updateAroma(key, Number(e.target.value))}
                        className="w-16 shrink-0 rounded-md border border-white/10 bg-[#0b0d11] px-2 py-1 text-right font-code text-xs font-semibold text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={val}
                      onChange={(e) => updateAroma(key, Number(e.target.value))}
                      style={{ accentColor: meta.color }}
                      className="h-1.5 w-full cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 3: Gusti Primari (5) */}
          <div className="rounded-2xl border border-white/10 bg-[#11141a]/90 p-5 shadow-xl">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
              3. Gusti Primari (0 – 10)
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TASTE_KEYS.map((key) => {
                const meta = TASTE_META[key];
                const val = draft.base_state.taste[key] ?? 0;
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-white/[0.08] bg-[#0b0d11]/70 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="text-xs font-medium text-stone-200">{meta.label}</span>
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={val}
                        onChange={(e) => updateTaste(key, Number(e.target.value))}
                        className="w-16 rounded-md border border-white/10 bg-[#11141a] px-2 py-1 text-right font-code text-xs font-semibold text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={val}
                      onChange={(e) => updateTaste(key, Number(e.target.value))}
                      style={{ accentColor: meta.color }}
                      className="h-1.5 w-full cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 4: Mouthfeel & Consistenza (6) */}
          <div className="rounded-2xl border border-white/10 bg-[#11141a]/90 p-5 shadow-xl">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
              4. Mouthfeel &amp; Consistenza (0 – 10)
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MOUTHFEEL_KEYS.map((key) => {
                const meta = MOUTHFEEL_META[key];
                const val = draft.base_state.mouthfeel[key] ?? 0;
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-white/[0.08] bg-[#0b0d11]/70 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="truncate text-xs font-medium text-stone-200">
                          {meta.label}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={val}
                        onChange={(e) => updateMouthfeel(key, Number(e.target.value))}
                        className="w-16 rounded-md border border-white/10 bg-[#11141a] px-2 py-1 text-right font-code text-xs font-semibold text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={val}
                      onChange={(e) => updateMouthfeel(key, Number(e.target.value))}
                      style={{ accentColor: meta.color }}
                      className="h-1.5 w-full cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 5: Composizione Chimica */}
          <div className="rounded-2xl border border-white/10 bg-[#11141a]/90 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  5. Composizione Chimica (0.00 – 1.00)
                </h3>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  Determina le reazioni chimiche di cottura (es. Maillard, caramellizzazione, infusione lipidica).
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 font-code text-[11px] ${
                  compositionTotalPct > 105
                    ? 'bg-rose-500/15 text-rose-300'
                    : 'bg-white/5 text-stone-400'
                }`}
              >
                Totale: {compositionTotalPct}%
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ['water', 'Acqua', '#38bdf8'],
                  ['protein', 'Proteine', '#f43f5e'],
                  ['carbs_sugars', 'Zuccheri / Carb', '#f59e0b'],
                  ['fat', 'Grassi', '#facc15'],
                ] as const
              ).map(([key, label, color]) => {
                const val = draft.composition[key];
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-white/[0.08] bg-[#0b0d11]/70 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-stone-200">{label}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={val}
                        onChange={(e) => updateComposition(key, Number(e.target.value))}
                        className="w-16 rounded-md border border-white/10 bg-[#11141a] px-2 py-1 text-right font-code text-xs font-semibold text-stone-100 outline-none focus:border-amber-400/60"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={val}
                      onChange={(e) => updateComposition(key, Number(e.target.value))}
                      style={{ accentColor: color }}
                      className="h-1.5 w-full cursor-pointer"
                    />
                    <div className="mt-1 text-right font-code text-[10px] text-stone-500">
                      {Math.round(val * 100)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
