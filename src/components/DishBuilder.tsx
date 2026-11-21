import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Layers,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Thermometer,
  Trash2,
  UtensilsCrossed,
  Workflow,
} from 'lucide-react';
import {
  CATEGORY_META,
  DishPhase,
  Dosage,
  Ingredient,
  IngredientCategory,
  Technique,
  TransformedDishItem,
} from '../types/flavor';
import { DishItemCard } from './DishItemCard';

interface DishBuilderProps {
  ingredients: Ingredient[];
  techniques: Technique[];
  phases: DishPhase[];
  activeTargetPhaseId: string;
  onSelectTargetPhase: (phaseId: string) => void;
  onAddPhase: () => void;
  onUpdatePhase: (phaseId: string, patch: Partial<DishPhase>) => void;
  onMovePhase: (fromIndex: number, toIndex: number) => void;
  onRemovePhase: (phaseId: string) => void;
  onTogglePhaseSemilavorato: (targetPhaseId: string, sourcePhaseId: string) => void;
  onApplyPhaseTechniqueToAll: (phaseId: string, techniqueId: string) => void;
  transformedItems: TransformedDishItem[];
  onAddIngredient: (
    ingredientId: string,
    techniqueId?: string,
    dosage?: Dosage,
    phaseId?: string
  ) => void;
  onChangeTechnique: (instanceId: string, techniqueId: string) => void;
  onChangeDosage: (instanceId: string, dosage: Dosage) => void;
  onChangeItemPhase: (instanceId: string, phaseId: string) => void;
  onChangeItemQuantity: (instanceId: string, quantity: number, unit: string) => void;
  onSplitItemToPhase: (instanceId: string, targetPhaseId: string) => void;
  onRemoveItem: (instanceId: string) => void;
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

export const DishBuilder: React.FC<DishBuilderProps> = ({
  ingredients,
  techniques,
  phases,
  activeTargetPhaseId,
  onSelectTargetPhase,
  onAddPhase,
  onUpdatePhase,
  onMovePhase,
  onRemovePhase,
  onTogglePhaseSemilavorato,
  onApplyPhaseTechniqueToAll,
  transformedItems,
  onAddIngredient,
  onChangeTechnique,
  onChangeDosage,
  onChangeItemPhase,
  onChangeItemQuantity,
  onSplitItemToPhase,
  onRemoveItem,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all');
  const [collapsedPhaseIds, setCollapsedPhaseIds] = useState<Set<string>>(new Set());

  const filteredIngredients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ingredients.filter((ing) => {
      const catOk = selectedCategory === 'all' || ing.category === selectedCategory;
      const searchOk =
        !q ||
        ing.name.toLowerCase().includes(q) ||
        CATEGORY_META[ing.category].label.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [ingredients, search, selectedCategory]);

  // Mappa per sapere in quali fasi è già presente ciascun ingrediente
  const ingredientPhasesMap = useMemo(() => {
    const map = new Map<string, number[]>();
    const phaseOrderById = new Map(phases.map((p) => [p.id, p.order]));
    for (const t of transformedItems) {
      const pOrder = phaseOrderById.get(t.item.phaseId || '') || 1;
      const list = map.get(t.ingredient.id) || [];
      if (!list.includes(pOrder)) list.push(pOrder);
      map.set(t.ingredient.id, list.sort((a, b) => a - b));
    }
    return map;
  }, [transformedItems, phases]);

  const activeTargetPhase = useMemo(
    () => phases.find((p) => p.id === activeTargetPhaseId) ?? phases[0],
    [phases, activeTargetPhaseId]
  );

  // Riepilogo globale degli ingredienti grezzi aggregati su tutte le fasi
  const globalAggregatedIngredients = useMemo(() => {
    const phaseOrderById = new Map(phases.map((p) => [p.id, p.order]));
    const map = new Map<
      string,
      {
        ingredientId: string;
        name: string;
        unit: string;
        totalQuantity: number;
        usages: { phaseOrder: number; quantity: number; unit: string }[];
      }
    >();

    for (const t of transformedItems) {
      const unit = t.item.unit || 'g';
      const qty = t.item.quantity ?? (t.item.dosage === 'main' ? 150 : t.item.dosage === 'secondary' ? 70 : 15);
      const pOrder = phaseOrderById.get(t.item.phaseId || '') || 1;
      const existing = map.get(t.ingredient.id);
      if (existing) {
        if (unit !== 'q.b.' && existing.unit === unit) {
          existing.totalQuantity = Math.round((existing.totalQuantity + qty) * 100) / 100;
        }
        existing.usages.push({ phaseOrder: pOrder, quantity: qty, unit });
      } else {
        map.set(t.ingredient.id, {
          ingredientId: t.ingredient.id,
          name: t.ingredient.name,
          unit,
          totalQuantity: qty,
          usages: [{ phaseOrder: pOrder, quantity: qty, unit }],
        });
      }
    }

    return Array.from(map.values());
  }, [transformedItems, phases]);

  const toggleCollapsePhase = (phaseId: string) => {
    setCollapsedPhaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  return (
    <section className="flex flex-col gap-5">
      {/* 1. DISPENSA & SELETTORE RAPIDO CON SCELTA DELLA FASE DI DESTINAZIONE */}
      <div className="rounded-2xl border border-white/10 bg-[#11141a]/90 p-4 shadow-xl">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold tracking-wide text-[#f6f1e7]">
              Dispensa &amp; Inserimento per Fase
            </h2>
          </div>
          <span className="font-code text-[11px] text-stone-400">
            {filteredIngredients.length} disponibili
          </span>
        </div>

        {/* Barra selezione Fase attiva in cui inserire gli ingredienti cliccati */}
        <div className="mb-3 rounded-xl border border-amber-400/25 bg-[#0b0d11] p-2.5">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            <span>Seleziona la Fase in cui inserire gli ingredienti dalla dispensa:</span>
            <button
              type="button"
              onClick={onAddPhase}
              className="inline-flex items-center gap-1 rounded border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200 hover:bg-amber-500/25"
            >
              <Plus className="h-2.5 w-2.5" />
              <span>Nuova Fase</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {phases.map((p) => {
              const isSelected = activeTargetPhase?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectTargetPhase(p.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/25 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'border-white/10 bg-white/[0.03] text-stone-400 hover:border-white/20 hover:text-stone-200'
                  }`}
                >
                  <span className="font-code text-[10px] font-bold text-amber-300">
                    F{p.order}
                  </span>
                  <span className="max-w-[140px] truncate">{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cerca ingrediente da aggiungere a Fase ${activeTargetPhase?.order || 1} (${activeTargetPhase?.title || ''})...`}
            className="w-full rounded-lg border border-white/10 bg-[#0b0d11] py-2 pl-9 pr-3 text-xs text-stone-100 placeholder-stone-500 outline-none transition focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/25"
          />
        </div>

        {/* Category Filter Pills */}
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

        {/* Ingredient Grid */}
        <div className="mt-3 grid max-h-48 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
          {filteredIngredients.map((ing) => {
            const usedInPhases = ingredientPhasesMap.get(ing.id) || [];
            const inDish = usedInPhases.length > 0;
            const catMeta = CATEGORY_META[ing.category];
            return (
              <button
                key={ing.id}
                type="button"
                onClick={() =>
                  onAddIngredient(
                    ing.id,
                    activeTargetPhase?.defaultTechniqueId || 'tech_raw',
                    undefined,
                    activeTargetPhase?.id
                  )
                }
                className={`group flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                  inDish
                    ? 'border-amber-400/30 bg-amber-500/[0.07] hover:border-amber-400/50'
                    : 'border-white/[0.07] bg-[#0c0f14] hover:border-amber-400/35 hover:bg-white/[0.04]'
                }`}
                title={`Aggiungi ${ing.name} alla Fase ${activeTargetPhase?.order || 1}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-medium text-stone-100 group-hover:text-amber-100">
                      {ing.name}
                    </span>
                    {inDish && (
                      <span className="shrink-0 rounded bg-amber-500/20 px-1.5 py-0.5 font-code text-[9px] font-semibold text-amber-200">
                        {usedInPhases.map((o) => `F${o}`).join('+')}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-stone-500">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${catMeta.colorClass.split(' ')[0]}`}
                    />
                    <span>{catMeta.label}</span>
                    <span>·</span>
                    <span className="font-code">Vol {ing.base_state.volume}</span>
                  </div>
                </div>
                <span className="flex h-6 shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-1.5 text-[10px] font-code text-stone-400 transition group-hover:border-amber-400/40 group-hover:bg-amber-500/20 group-hover:text-amber-200">
                  <Plus className="h-3 w-3" />
                  <span>F{activeTargetPhase?.order || 1}</span>
                </span>
              </button>
            );
          })}
          {filteredIngredients.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-stone-500">
              Nessun ingrediente trovato per «{search}».
            </div>
          )}
        </div>
      </div>

      {/* 2. PROCEDURA DI COMPOSIZIONE DEL PIATTO IN FASI SEQUENZIALI -> PIATTO FINALE */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-amber-400" />
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-[#f6f1e7]">
                Procedura di Composizione del Piatto ({phases.length}{' '}
                {phases.length === 1 ? 'Fase' : 'Fasi'} ➔ Piatto Finale)
              </h2>
              <p className="text-[11px] text-stone-400">
                Ogni fase genera un semilavorato che si concatena nelle fasi successive fino al
                piatto finito.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddPhase}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/25"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Aggiungi Fase</span>
          </button>
        </div>

        {/* Barra visuale del Flusso: Fase 1 -> Semilavorato -> Fase 2 -> ... -> Piatto Finale */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#0d1016] px-3 py-2.5 text-[11px]">
          {phases.map((p, idx) => {
            const count = transformedItems.filter(
              (t) => (t.item.phaseId || phases[0]?.id) === p.id
            ).length;
            const isTarget = activeTargetPhase?.id === p.id;
            return (
              <React.Fragment key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelectTargetPhase(p.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 transition ${
                    isTarget
                      ? 'border-amber-400/50 bg-amber-500/20 text-amber-100'
                      : 'border-white/10 bg-white/[0.03] text-stone-300 hover:border-white/20'
                  }`}
                >
                  <span className="font-code text-[10px] font-bold text-amber-300">
                    Fase {p.order}
                  </span>
                  <span className="max-w-[110px] truncate font-medium">{p.title}</span>
                  <span className="rounded bg-white/10 px-1 py-0.2 font-code text-[9px] text-stone-300">
                    {count}
                  </span>
                </button>
                <span className="font-code text-xs text-amber-400">➔</span>
                {idx < phases.length - 1 && (
                  <>
                    <span className="rounded border border-purple-400/30 bg-purple-500/10 px-1.5 py-0.5 text-[10px] text-purple-200">
                      [{p.outputName}]
                    </span>
                    <span className="font-code text-xs text-purple-400">➔</span>
                  </>
                )}
              </React.Fragment>
            );
          })}
          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 font-semibold text-emerald-200">
            <UtensilsCrossed className="h-3 w-3 text-emerald-300" />
            <span>Piatto Finale</span>
          </span>
        </div>

        {/* Elenco Card delle Fasi di Composizione */}
        <div className="space-y-4">
          {phases.map((phase, idx) => {
            const phaseItems = transformedItems.filter(
              (t) => (t.item.phaseId || phases[0]?.id) === phase.id
            );
            const previousPhases = phases.slice(0, idx);
            const isCollapsed = collapsedPhaseIds.has(phase.id);
            const isTarget = activeTargetPhase?.id === phase.id;
            const defaultTech = techniques.find((t) => t.id === phase.defaultTechniqueId);

            // Verifica se il semilavorato di questa fase è usato in fasi successive
            const usedInLaterPhases = phases
              .slice(idx + 1)
              .filter((later) => later.usesPreviousPhaseIds.includes(phase.id));

            return (
              <div key={phase.id} className="space-y-2">
                <div
                  className={`rounded-2xl border transition ${
                    isTarget
                      ? 'border-amber-400/45 bg-[#12161f] shadow-[0_0_24px_rgba(245,158,11,0.08)]'
                      : 'border-white/10 bg-[#11141a]/95'
                  }`}
                >
                  {/* Header della Fase */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-3">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectTargetPhase(phase.id)}
                        className={`shrink-0 rounded-lg border px-2.5 py-1 font-code text-xs font-bold transition ${
                          isTarget
                            ? 'border-amber-400 bg-amber-500 text-stone-950'
                            : 'border-amber-400/35 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
                        }`}
                        title="Clicca per impostare questa fase come destinazione della dispensa"
                      >
                        FASE {phase.order}
                      </button>

                      <input
                        type="text"
                        value={phase.title}
                        onChange={(e) => onUpdatePhase(phase.id, { title: e.target.value })}
                        placeholder={`Nome Fase ${phase.order}...`}
                        className="min-w-[140px] flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-[#f6f1e7] outline-none transition hover:border-white/10 focus:border-amber-400/50 focus:bg-[#0b0d11]"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-code text-[10px] text-stone-300">
                        {phaseItems.length} ingr.
                      </span>

                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => onMovePhase(idx, idx - 1)}
                        className="rounded p-1 text-stone-400 hover:bg-white/10 hover:text-stone-100 disabled:opacity-25"
                        title="Sposta fase in su"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === phases.length - 1}
                        onClick={() => onMovePhase(idx, idx + 1)}
                        className="rounded p-1 text-stone-400 hover:bg-white/10 hover:text-stone-100 disabled:opacity-25"
                        title="Sposta fase in giù"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCollapsePhase(phase.id)}
                        className="rounded p-1 text-stone-400 hover:bg-white/10 hover:text-stone-100"
                        title={isCollapsed ? 'Espandi fase' : 'Comprimi fase'}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </button>
                      {phases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemovePhase(phase.id)}
                          className="rounded p-1 text-stone-500 hover:bg-rose-500/15 hover:text-rose-300"
                          title="Elimina questa fase"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="space-y-3.5 p-4">
                      {/* Controlli Fase: Tecnica guida, Output Semilavorato, Tempo e Temperatura */}
                      <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-white/[0.06] bg-[#0b0d11] p-3 sm:grid-cols-12">
                        <div className="sm:col-span-7">
                          <div className="mb-1 flex items-center justify-between">
                            <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                              <Flame className="h-3 w-3 text-amber-400" />
                              <span>Tecnica di Cucina della Fase {phase.order}</span>
                            </label>
                            {phaseItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  onApplyPhaseTechniqueToAll(phase.id, phase.defaultTechniqueId)
                                }
                                className="text-[10px] font-medium text-amber-300 hover:underline"
                                title="Applica questa tecnica a tutti gli ingredienti presenti in questa fase"
                              >
                                Applica a tutta la fase
                              </button>
                            )}
                          </div>
                          <select
                            value={phase.defaultTechniqueId}
                            onChange={(e) => {
                              onUpdatePhase(phase.id, { defaultTechniqueId: e.target.value });
                              if (phaseItems.length === 1) {
                                onChangeTechnique(phaseItems[0].item.instanceId, e.target.value);
                              }
                            }}
                            className="w-full rounded-lg border border-white/10 bg-[#13171d] px-2.5 py-1.5 text-xs text-stone-100 outline-none focus:border-amber-400/50"
                          >
                            {techniques.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-5">
                          <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            <PackageCheck className="h-3 w-3 text-purple-400" />
                            <span>Output (Semilavorato Prodotto)</span>
                          </label>
                          <input
                            type="text"
                            value={phase.outputName}
                            onChange={(e) =>
                              onUpdatePhase(phase.id, { outputName: e.target.value })
                            }
                            placeholder={`Semilavorato Fase ${phase.order}`}
                            className="w-full rounded-lg border border-purple-400/30 bg-[#13171d] px-2.5 py-1.5 text-xs text-purple-100 outline-none focus:border-purple-400/60"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:col-span-12">
                          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#13171d] px-2.5 py-1">
                            <Clock className="h-3.5 w-3.5 text-stone-400" />
                            <span className="text-[10px] uppercase text-stone-400">Tempo:</span>
                            <input
                              type="number"
                              min="0"
                              value={phase.timeMinutes ?? ''}
                              onChange={(e) =>
                                onUpdatePhase(phase.id, {
                                  timeMinutes: e.target.value ? parseInt(e.target.value, 10) : null,
                                })
                              }
                              placeholder="min"
                              className="w-16 bg-transparent font-code text-xs text-stone-100 outline-none"
                            />
                            <span className="text-[10px] text-stone-500">min</span>
                          </div>

                          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#13171d] px-2.5 py-1">
                            <Thermometer className="h-3.5 w-3.5 text-stone-400" />
                            <span className="text-[10px] uppercase text-stone-400">Temp:</span>
                            <input
                              type="number"
                              step="any"
                              value={phase.temperatureCelsius ?? ''}
                              onChange={(e) =>
                                onUpdatePhase(phase.id, {
                                  temperatureCelsius: e.target.value
                                    ? parseFloat(e.target.value)
                                    : null,
                                })
                              }
                              placeholder="°C"
                              className="w-16 bg-transparent font-code text-xs text-stone-100 outline-none"
                            />
                            <span className="text-[10px] text-stone-500">°C</span>
                          </div>
                        </div>
                      </div>

                      {/* Semilavorati in Ingresso dalle Fasi Precedenti */}
                      {previousPhases.length > 0 && (
                        <div className="rounded-xl border border-purple-400/25 bg-purple-500/[0.06] p-2.5">
                          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-200">
                            <Layers className="h-3.5 w-3.5 text-purple-300" />
                            <span>
                              Semilavorati delle fasi precedenti che entrano nella Fase{' '}
                              {phase.order}:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {previousPhases.map((prevP) => {
                              const isLinked = phase.usesPreviousPhaseIds.includes(prevP.id);
                              return (
                                <button
                                  key={prevP.id}
                                  type="button"
                                  onClick={() => onTogglePhaseSemilavorato(phase.id, prevP.id)}
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                                    isLinked
                                      ? 'border-purple-400/60 bg-purple-500/25 text-purple-100 shadow-sm'
                                      : 'border-white/10 bg-[#0b0d11] text-stone-400 hover:border-purple-400/35 hover:text-purple-200'
                                  }`}
                                  title={
                                    isLinked
                                      ? `Il semilavorato "${prevP.outputName}" entra in questa fase e subisce la tecnica "${defaultTech?.name || ''}". Clicca per scollegare.`
                                      : `Clicca per utilizzare il semilavorato "${prevP.outputName}" dentro questa fase`
                                  }
                                >
                                  {isLinked ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-300" />
                                  ) : (
                                    <Plus className="h-3.5 w-3.5 text-stone-500" />
                                  )}
                                  <span>
                                    [Output Fase {prevP.order}: {prevP.outputName}]
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Ingredienti assegnati a questa Fase */}
                      {phaseItems.length === 0 ? (
                        <div
                          onClick={() => onSelectTargetPhase(phase.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') onSelectTargetPhase(phase.id);
                          }}
                          className="cursor-pointer rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center transition hover:border-amber-400/40 hover:bg-amber-500/[0.04]"
                        >
                          <p className="text-xs font-medium text-stone-300">
                            Nessun ingrediente grezzo inserito direttamente nella Fase {phase.order}
                          </p>
                          <p className="mt-0.5 text-[11px] text-stone-500">
                            {phase.usesPreviousPhaseIds.length > 0
                              ? `Questa fase lavora i semilavorati collegati con "${defaultTech?.name.split(' (')[0] || ''}". Clicca un ingrediente nella Dispensa sopra per aggiungerlo qui.`
                              : `Clicca qui e seleziona gli ingredienti dalla Dispensa in alto per inserirli nella Fase ${phase.order}.`}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {phaseItems.map((t) => (
                            <DishItemCard
                              key={t.item.instanceId}
                              transformed={t}
                              techniques={techniques}
                              phases={phases}
                              onChangeTechnique={onChangeTechnique}
                              onChangeDosage={onChangeDosage}
                              onChangePhase={onChangeItemPhase}
                              onChangeQuantity={onChangeItemQuantity}
                              onSplitToPhase={onSplitItemToPhase}
                              onRemove={onRemoveItem}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Connettore grafico tra una Fase e la successiva */}
                {idx < phases.length - 1 && (
                  <div className="flex items-center justify-center gap-2 py-0.5 text-[11px] text-purple-300/90">
                    <div className="h-3 w-0.5 bg-purple-400/40" />
                    <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-0.5 font-medium">
                      ⬇ Output <strong>[{phase.outputName}]</strong>{' '}
                      {usedInLaterPhases.length > 0
                        ? `confluisce in ${usedInLaterPhases.map((u) => `Fase ${u.order}`).join(', ')}`
                        : 'disponibile per le fasi successive'}
                    </span>
                    <div className="h-3 w-0.5 bg-purple-400/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 3. RIEPILOGO GLOBALE INGREDIENTI PER IL PIATTO FINALE (Magazzino / Lista Spesa) */}
        {globalAggregatedIngredients.length > 0 && (
          <div className="rounded-2xl border border-emerald-500/25 bg-[#0e1318] p-4 shadow-lg">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                  Riepilogo Globale Ingredienti ➔ Piatto Finale ({globalAggregatedIngredients.length})
                </h3>
              </div>
              <span className="font-code text-[10px] text-stone-400">
                Somma quote di tutte le fasi
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {globalAggregatedIngredients.map((agg) => (
                <div
                  key={agg.ingredientId}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-stone-200">{agg.name}</div>
                    {agg.usages.length > 1 && (
                      <div className="text-[10px] text-amber-300/90">
                        Ripartito:{' '}
                        {agg.usages
                          .map((u) => `F${u.phaseOrder}: ${u.unit === 'q.b.' ? 'q.b.' : `${u.quantity}${u.unit}`}`)
                          .join(' + ')}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 rounded bg-emerald-500/15 px-2 py-0.5 font-code text-[11px] font-semibold text-emerald-200">
                    {agg.unit === 'q.b.' ? 'q.b.' : `${agg.totalQuantity} ${agg.unit}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
