import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  GripVertical,
  Layers,
  PackageCheck,
  Plus,
  RefreshCw,
  ShoppingBag,
  Thermometer,
  Trash2,
  Utensils,
  Workflow,
} from 'lucide-react';
import {
  computeIngredientAllocations,
  formatQuantityAndUnit,
  getDependentPhases,
  PhaseInput,
  PlannedRecipeIngredient,
  RecipePhase,
  validatePhaseOrdering,
} from '../engine/recipeParser';
import { Dosage, FlavorDatabase } from '../types/flavor';

interface RecipePhasesEditorProps {
  database: FlavorDatabase;
  fasi: RecipePhase[];
  plannedIngredients: PlannedRecipeIngredient[];
  onChange: (nextFasi: RecipePhase[], nextPlanned: PlannedRecipeIngredient[]) => void;
}

const UNIT_OPTIONS = ['g', 'ml', 'pz', 'cucchiai', 'cucchiaini', 'spicchi', 'fette', 'q.b.'];

export const RecipePhasesEditor: React.FC<RecipePhasesEditorProps> = ({
  database,
  fasi,
  plannedIngredients,
  onChange,
}) => {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dependencyAlert, setDependencyAlert] = useState<string | null>(null);

  // Stato form aggiunta nuovo ingrediente globale alla distinta ricetta
  const [newPlanIngId, setNewPlanIngId] = useState('');
  const [newPlanQty, setNewPlanQty] = useState<number>(100);
  const [newPlanUnit, setNewPlanUnit] = useState<string>('g');

  // Stato selettore input rapido per ciascuna fase (map phaseId -> form state)
  const [phaseIngSelect, setPhaseIngSelect] = useState<Record<string, string>>({});
  const [phaseIngQty, setPhaseIngQty] = useState<Record<string, string>>({});
  const [phaseIngUnit, setPhaseIngUnit] = useState<Record<string, string>>({});

  const sortedIngredients = useMemo(
    () => [...database.ingredients].sort((a, b) => a.name.localeCompare(b.name, 'it')),
    [database.ingredients]
  );

  const techMap = useMemo(
    () => new Map(database.techniques.map((t) => [t.id, t])),
    [database.techniques]
  );

  const allocations = useMemo(
    () => computeIngredientAllocations(fasi, plannedIngredients),
    [fasi, plannedIngredients]
  );

  const allocationByIngId = useMemo(
    () => new Map(allocations.map((a) => [a.ingredientId, a])),
    [allocations]
  );

  const orderingWarnings = useMemo(() => validatePhaseOrdering(fasi), [fasi]);

  const toggleCollapse = (phaseId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const normalizeOrders = (list: RecipePhase[]): RecipePhase[] =>
    list.map((f, idx) => ({
      ...f,
      ordine: idx + 1,
    }));

  // Aggiunge un ingrediente alla distinta globale della ricetta
  const handleAddPlannedIngredient = () => {
    if (!newPlanIngId) return;
    const ing = database.ingredients.find((i) => i.id === newPlanIngId);
    if (!ing) return;

    const qty = newPlanUnit === 'q.b.' ? 1 : Math.max(0.1, Number(newPlanQty) || 100);
    const existingIdx = plannedIngredients.findIndex((p) => p.ingredientId === ing.id);
    let nextPlanned: PlannedRecipeIngredient[];

    if (existingIdx >= 0) {
      nextPlanned = plannedIngredients.map((p, idx) =>
        idx === existingIdx
          ? {
              ...p,
              totalQuantity:
                p.unit === newPlanUnit && newPlanUnit !== 'q.b.'
                  ? Math.round((p.totalQuantity + qty) * 100) / 100
                  : qty,
              unit: newPlanUnit,
            }
          : p
      );
    } else {
      const defaultDosage: Dosage =
        ing.category === 'acid' ||
        ing.category === 'umami_condiment' ||
        ing.category === 'herb_spice'
          ? 'garnish'
          : plannedIngredients.length === 0
            ? 'main'
            : 'secondary';
      nextPlanned = [
        ...plannedIngredients,
        {
          ingredientId: ing.id,
          name: ing.name,
          totalQuantity: qty,
          unit: newPlanUnit,
          dosage: defaultDosage,
        },
      ];
    }

    onChange(fasi, nextPlanned);
    setNewPlanIngId('');
  };

  // Allinea automaticamente i totali previsti della ricetta alla somma effettiva delle fasi
  const handleSyncPlannedFromPhases = () => {
    const map = new Map<string, PlannedRecipeIngredient>();
    for (const p of plannedIngredients) {
      map.set(p.ingredientId, { ...p, totalQuantity: 0 });
    }
    for (const f of fasi) {
      for (const inp of f.inputs) {
        if (inp.tipo !== 'INGREDIENTE') continue;
        const existing = map.get(inp.riferimento_id);
        if (existing) {
          existing.totalQuantity =
            inp.unita_misura === 'q.b.'
              ? 1
              : Math.round((existing.totalQuantity + (Number(inp.quantita) || 0)) * 100) / 100;
          existing.unit = inp.unita_misura || existing.unit;
        } else {
          map.set(inp.riferimento_id, {
            ingredientId: inp.riferimento_id,
            name: inp.label,
            totalQuantity: inp.unita_misura === 'q.b.' ? 1 : Number(inp.quantita) || 1,
            unit: inp.unita_misura || 'g',
            dosage: inp.dosage || 'secondary',
          });
        }
      }
    }
    const synced = Array.from(map.values()).filter((p) => p.totalQuantity > 0);
    onChange(fasi, synced);
  };

  // Aggiunge una nuova fase in coda
  const handleAddPhase = () => {
    const nextOrder = fasi.length + 1;
    const newId = `phase_${nextOrder}_${Date.now().toString(36)}`;
    const prevPhase = fasi.length > 0 ? fasi[fasi.length - 1] : null;

    const initialInputs: PhaseInput[] = prevPhase
      ? [
          {
            id: `pin_semi_${newId}_${prevPhase.id}`,
            tipo: 'SEMILAVORATO',
            riferimento_id: prevPhase.id,
            label: prevPhase.output_nome || `Semilavorato Fase ${prevPhase.ordine}`,
            quantita: 1,
            unita_misura: 'lotto',
          },
        ]
      : [];

    const newPhase: RecipePhase = {
      id: newId,
      ordine: nextOrder,
      titolo: `Fase ${nextOrder} - Lavorazione`,
      tecnica_id: 'tech_raw',
      tempo_minuti: null,
      temperatura: null,
      attrezzatura: '',
      istruzioni: '',
      output_nome: `Semilavorato Fase ${nextOrder}`,
      inputs: initialInputs,
    };

    setDependencyAlert(null);
    onChange([...fasi, newPhase], plannedIngredients);
  };

  // Elimina una fase con controllo dipendenze semilavorati
  const handleRemovePhase = (phaseId: string) => {
    if (fasi.length <= 1) {
      setDependencyAlert('La ricetta deve contenere almeno una fase di lavorazione.');
      return;
    }
    const target = fasi.find((f) => f.id === phaseId);
    if (!target) return;

    const dependents = getDependentPhases(fasi, phaseId);
    if (dependents.length > 0) {
      const depNames = dependents.map((d) => `Fase ${d.ordine} ("${d.titolo}")`).join(', ');
      const ok = window.confirm(
        `ATTENZIONE: Il semilavorato "${target.output_nome}" generato dalla Fase ${target.ordine} è utilizzato come input in: ${depNames}.\n\nEliminando questa fase il semilavorato verrà rimosso anche dalle fasi dipendenti. Continuare?`
      );
      if (!ok) return;
    }

    const filtered = fasi
      .filter((f) => f.id !== phaseId)
      .map((f) => ({
        ...f,
        inputs: f.inputs.filter(
          (inp) => !(inp.tipo === 'SEMILAVORATO' && inp.riferimento_id === phaseId)
        ),
      }));

    setDependencyAlert(null);
    onChange(normalizeOrders(filtered), plannedIngredients);
  };

  // Riordina fasi (Frecce Su/Giù o Drag & Drop) con prevenzione dipendenze circolari/invertite
  const handleMovePhase = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= fasi.length || fromIdx === toIdx) return;

    const candidate = [...fasi];
    const [moved] = candidate.splice(fromIdx, 1);
    candidate.splice(toIdx, 0, moved);
    const reordered = normalizeOrders(candidate);

    // Verifica se il riordino viola le dipendenze dei semilavorati
    const orderById = new Map(reordered.map((f, i) => [f.id, i + 1]));
    const brokenDeps: string[] = [];

    for (const f of reordered) {
      const currOrder = orderById.get(f.id)!;
      for (const inp of f.inputs) {
        if (inp.tipo === 'SEMILAVORATO') {
          const srcOrder = orderById.get(inp.riferimento_id);
          if (srcOrder && srcOrder >= currOrder) {
            brokenDeps.push(
              `La fase "${f.titolo}" utilizza il semilavorato "${inp.label}" che dopo lo spostamento si troverebbe in una fase successiva (Fase ${srcOrder}).`
            );
          }
        }
      }
    }

    if (brokenDeps.length > 0) {
      setDependencyAlert(
        `Impossibile invertire l'ordine: ${brokenDeps[0]} Rimuovi prima il semilavorato dipendente se vuoi spostare questa fase.`
      );
      return;
    }

    setDependencyAlert(null);
    onChange(reordered, plannedIngredients);
  };

  const handleUpdatePhase = (phaseId: string, patch: Partial<RecipePhase>) => {
    const nextFasi = fasi.map((f) => {
      if (f.id === phaseId) {
        return { ...f, ...patch };
      }
      // Se è cambiato output_nome della fase sorgente, aggiorna l'etichetta nei semilavorati figli
      if (patch.output_nome !== undefined) {
        return {
          ...f,
          inputs: f.inputs.map((inp) =>
            inp.tipo === 'SEMILAVORATO' && inp.riferimento_id === phaseId
              ? { ...inp, label: patch.output_nome || inp.label }
              : inp
          ),
        };
      }
      return f;
    });
    onChange(nextFasi, plannedIngredients);
  };

  // Aggiunge un SEMILAVORATO di una fase precedente come input della fase corrente
  const handleAddSemilavoratoInput = (targetPhaseId: string, sourcePhase: RecipePhase) => {
    const target = fasi.find((f) => f.id === targetPhaseId);
    if (!target || sourcePhase.ordine >= target.ordine) return;

    const alreadyIn = target.inputs.some(
      (inp) => inp.tipo === 'SEMILAVORATO' && inp.riferimento_id === sourcePhase.id
    );
    if (alreadyIn) return;

    const newInp: PhaseInput = {
      id: `pin_semi_${targetPhaseId}_${sourcePhase.id}_${Date.now().toString(36)}`,
      tipo: 'SEMILAVORATO',
      riferimento_id: sourcePhase.id,
      label: sourcePhase.output_nome || `Semilavorato Fase ${sourcePhase.ordine}`,
      quantita: 1,
      unita_misura: 'lotto',
    };

    handleUpdatePhase(targetPhaseId, {
      inputs: [newInp, ...target.inputs],
    });
  };

  // Quando l'utente sceglie un ingrediente nel selettore di una fase, precompila con la quantità residua
  const handleSelectIngredientForPhase = (phaseId: string, ingredientId: string) => {
    setPhaseIngSelect((prev) => ({ ...prev, [phaseId]: ingredientId }));
    if (!ingredientId) return;

    const alloc = allocationByIngId.get(ingredientId);
    if (alloc) {
      const defaultQty = alloc.remaining > 0 ? alloc.remaining : alloc.plannedTotal || 50;
      setPhaseIngQty((prev) => ({ ...prev, [phaseId]: String(defaultQty) }));
      setPhaseIngUnit((prev) => ({ ...prev, [phaseId]: alloc.unit }));
    } else {
      const ing = database.ingredients.find((i) => i.id === ingredientId);
      const isCondiment =
        ing?.category === 'herb_spice' ||
        ing?.category === 'umami_condiment' ||
        ing?.category === 'acid';
      setPhaseIngQty((prev) => ({ ...prev, [phaseId]: isCondiment ? '10' : '100' }));
      setPhaseIngUnit((prev) => ({ ...prev, [phaseId]: 'g' }));
    }
  };

  // Aggiunge un ingrediente (o una sua quota parziale) a una fase
  const handleAddIngredientInputToPhase = (phaseId: string) => {
    const ingId = phaseIngSelect[phaseId];
    if (!ingId) return;
    const ing = database.ingredients.find((i) => i.id === ingId);
    const alloc = allocationByIngId.get(ingId);
    const name = ing?.name || alloc?.name || ingId;

    const unit = phaseIngUnit[phaseId] || alloc?.unit || 'g';
    const rawQty = parseFloat((phaseIngQty[phaseId] || '50').replace(',', '.'));
    const quantita = unit === 'q.b.' ? 1 : Math.max(0.1, Number.isFinite(rawQty) ? rawQty : 50);

    const target = fasi.find((f) => f.id === phaseId);
    if (!target) return;

    const existingInputIdx = target.inputs.findIndex(
      (inp) => inp.tipo === 'INGREDIENTE' && inp.riferimento_id === ingId
    );

    let nextInputs: PhaseInput[];
    if (existingInputIdx >= 0) {
      nextInputs = target.inputs.map((inp, idx) =>
        idx === existingInputIdx
          ? {
              ...inp,
              quantita:
                unit === 'q.b.'
                  ? 1
                  : Math.round(((Number(inp.quantita) || 0) + quantita) * 100) / 100,
              unita_misura: unit,
            }
          : inp
      );
    } else {
      nextInputs = [
        ...target.inputs,
        {
          id: `pin_ing_${phaseId}_${ingId}_${Date.now().toString(36)}`,
          tipo: 'INGREDIENTE',
          riferimento_id: ingId,
          label: name,
          quantita,
          unita_misura: unit,
        },
      ];
    }

    // Se l'ingrediente non era ancora nella distinta prevista, lo aggiunge automaticamente
    let nextPlanned = plannedIngredients;
    if (!plannedIngredients.some((p) => p.ingredientId === ingId)) {
      nextPlanned = [
        ...plannedIngredients,
        {
          ingredientId: ingId,
          name,
          totalQuantity: quantita,
          unit,
          dosage:
            ing &&
            (ing.category === 'acid' ||
              ing.category === 'umami_condiment' ||
              ing.category === 'herb_spice')
              ? 'garnish'
              : 'secondary',
        },
      ];
    }

    const nextFasi = fasi.map((f) => (f.id === phaseId ? { ...f, inputs: nextInputs } : f));
    onChange(nextFasi, nextPlanned);
    setPhaseIngSelect((prev) => ({ ...prev, [phaseId]: '' }));
  };

  const handleUpdatePhaseInput = (
    phaseId: string,
    inputId: string,
    patch: Partial<PhaseInput>
  ) => {
    const target = fasi.find((f) => f.id === phaseId);
    if (!target) return;
    handleUpdatePhase(phaseId, {
      inputs: target.inputs.map((inp) => (inp.id === inputId ? { ...inp, ...patch } : inp)),
    });
  };

  const handleRemovePhaseInput = (phaseId: string, inputId: string) => {
    const target = fasi.find((f) => f.id === phaseId);
    if (!target) return;
    handleUpdatePhase(phaseId, {
      inputs: target.inputs.filter((inp) => inp.id !== inputId),
    });
  };

  const handleRemovePlannedIngredient = (ingredientId: string) => {
    const nextPlanned = plannedIngredients.filter((p) => p.ingredientId !== ingredientId);
    const nextFasi = fasi.map((f) => ({
      ...f,
      inputs: f.inputs.filter(
        (inp) => !(inp.tipo === 'INGREDIENTE' && inp.riferimento_id === ingredientId)
      ),
    }));
    onChange(nextFasi, nextPlanned);
  };

  const hasAllocationMismatch = allocations.some((a) => a.status !== 'exact');

  return (
    <div className="space-y-4">
      {/* 1. RIEPILOGO GLOBALE INGREDIENTI & RIPARTIZIONE QUANTITÀ (Magazzino / Lista Spesa) */}
      <div className="rounded-xl border border-white/10 bg-[#0c0f14] p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-amber-400" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
                Riepilogo Globale Ingredienti &amp; Coerenza Quantità ({allocations.length})
              </h3>
              <p className="text-[11px] text-stone-400">
                Verifica le quantità ripartite tra le fasi (es. 50g burro in Fase 1 + 30g in Fase 3
                = 80g).
              </p>
            </div>
          </div>

          {hasAllocationMismatch && allocations.length > 0 && (
            <button
              type="button"
              onClick={handleSyncPlannedFromPhases}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/35 bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-200 transition hover:bg-amber-500/25"
              title="Ricalcola i totali della ricetta dalla somma effettiva delle quantità nelle fasi"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Allinea totali alla somma fasi</span>
            </button>
          )}
        </div>

        {/* Aggiunta rapida ingrediente alla distinta della ricetta */}
        <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-12">
          <select
            value={newPlanIngId}
            onChange={(e) => setNewPlanIngId(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-200 outline-none focus:border-amber-400/50 sm:col-span-6"
          >
            <option value="">+ Aggiungi ingrediente alla distinta ricetta...</option>
            {sortedIngredients.map((ing) => (
              <option key={ing.id} value={ing.id}>
                {ing.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0.1"
            step="any"
            disabled={newPlanUnit === 'q.b.'}
            value={newPlanUnit === 'q.b.' ? 1 : newPlanQty}
            onChange={(e) => setNewPlanQty(parseFloat(e.target.value) || 0)}
            placeholder="Qtà"
            className="rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-100 outline-none focus:border-amber-400/50 disabled:opacity-40 sm:col-span-2"
          />
          <select
            value={newPlanUnit}
            onChange={(e) => setNewPlanUnit(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#12161e] px-2 py-1.5 text-xs text-stone-200 outline-none focus:border-amber-400/50 sm:col-span-2"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!newPlanIngId}
            onClick={handleAddPlannedIngredient}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/35 hover:bg-amber-500/30 disabled:opacity-35 sm:col-span-2"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Aggiungi</span>
          </button>
        </div>

        {/* Tabella stato allocazione ingredienti */}
        {allocations.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-white/10 p-3 text-center text-xs text-stone-500">
            Nessun ingrediente in distinta. Aggiungi gli ingredienti qui sopra o direttamente
            dentro le singole Fasi di lavorazione.
          </div>
        ) : (
          <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {allocations.map((alloc) => {
              const isExact = alloc.status === 'exact';
              const isUnassigned = alloc.status === 'unassigned';
              return (
                <div
                  key={alloc.ingredientId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-stone-200">{alloc.name}</span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 font-code text-[10px] text-stone-300">
                        Tot: {formatQuantityAndUnit(alloc.plannedTotal, alloc.unit)}
                      </span>
                      {alloc.usages.length > 0 && (
                        <span className="text-[10px] text-stone-400">
                          (
                          {alloc.usages
                            .map((u) => `F${u.phaseOrder}: ${formatQuantityAndUnit(u.quantita, alloc.unit)}`)
                            .join(' + ')}
                          )
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExact ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>100% assegnato</span>
                      </span>
                    ) : isUnassigned ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                        <span>
                          Residuo: {formatQuantityAndUnit(alloc.remaining, alloc.unit)}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/35 bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-200">
                        <span>
                          Eccedenza: +{formatQuantityAndUnit(Math.abs(alloc.remaining), alloc.unit)}
                        </span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemovePlannedIngredient(alloc.ingredientId)}
                      className="rounded p-1 text-stone-500 hover:bg-rose-500/10 hover:text-rose-300"
                      title="Rimuovi ingrediente dall'intera ricetta"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Avvisi di dipendenza logica / riordino */}
      {(dependencyAlert || orderingWarnings.length > 0) && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="space-y-1">
              {dependencyAlert && <div className="font-medium">{dependencyAlert}</div>}
              {orderingWarnings.map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ELENCO DINAMICO CARD FASI DI LAVORAZIONE (Drag & Drop + Frecce Su/Giù) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              Fasi di Lavorazione ({fasi.length})
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddPhase}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/25"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuova Fase</span>
          </button>
        </div>

        {fasi.map((phase, idx) => {
          const isCollapsed = collapsedIds.has(phase.id);
          const tech = techMap.get(phase.tecnica_id);
          const previousPhases = fasi.slice(0, idx);
          const dependents = getDependentPhases(fasi, phase.id);
          const selectedIngId = phaseIngSelect[phase.id] || '';
          const selectedIngUnit = phaseIngUnit[phase.id] || 'g';

          return (
            <div
              key={phase.id}
              draggable
              onDragStart={() => setDraggedIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedIdx !== null && draggedIdx !== idx) {
                  handleMovePhase(draggedIdx, idx);
                }
                setDraggedIdx(null);
              }}
              className={`rounded-2xl border transition ${
                draggedIdx === idx
                  ? 'border-amber-400/60 bg-[#151922] opacity-80'
                  : 'border-white/10 bg-[#0d1016] hover:border-white/15'
              }`}
            >
              {/* Intestazione Card Fase */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-3.5 py-2.5">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className="cursor-grab text-stone-500 hover:text-stone-300"
                    title="Trascina per riordinare la fase"
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <span className="shrink-0 rounded-md border border-amber-400/35 bg-amber-500/15 px-2 py-0.5 font-code text-[11px] font-bold text-amber-200">
                    FASE {phase.ordine}
                  </span>
                  <input
                    type="text"
                    value={phase.titolo}
                    onChange={(e) => handleUpdatePhase(phase.id, { titolo: e.target.value })}
                    placeholder={`Titolo Fase ${phase.ordine}...`}
                    className="min-w-[140px] flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs font-semibold text-stone-100 outline-none transition hover:border-white/10 focus:border-amber-400/50 focus:bg-[#0b0d11]"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {/* Badge Output Semilavorato */}
                  <span
                    className="hidden items-center gap-1 rounded-full border border-purple-400/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-200 sm:inline-flex"
                    title={
                      dependents.length > 0
                        ? `Usato in: ${dependents.map((d) => `Fase ${d.ordine}`).join(', ')}`
                        : 'Output generato da questa fase'
                    }
                  >
                    <PackageCheck className="h-3 w-3 text-purple-300" />
                    <span className="max-w-[130px] truncate">{phase.output_nome}</span>
                  </span>

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMovePhase(idx, idx - 1)}
                    className="rounded p-1 text-stone-400 hover:bg-white/10 hover:text-stone-100 disabled:opacity-30"
                    title="Sposta fase in su"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === fasi.length - 1}
                    onClick={() => handleMovePhase(idx, idx + 1)}
                    className="rounded p-1 text-stone-400 hover:bg-white/10 hover:text-stone-100 disabled:opacity-30"
                    title="Sposta fase in giù"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCollapse(phase.id)}
                    className="rounded p-1 text-stone-400 hover:bg-white/10 hover:text-stone-100"
                    title={isCollapsed ? 'Espandi fase' : 'Comprimi fase'}
                  >
                    {isCollapsed ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePhase(phase.id)}
                    className="rounded p-1 text-stone-500 hover:bg-rose-500/10 hover:text-rose-300"
                    title="Elimina fase"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Sintesi quando la card è compressa */}
              {isCollapsed ? (
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 text-[11px] text-stone-400">
                  <span>
                    Tecnica: <strong className="text-amber-200">{tech?.name || phase.tecnica_id}</strong>
                  </span>
                  <span>
                    {phase.inputs.length} input &bull; Output:{' '}
                    <strong className="text-purple-200">[{phase.output_nome}]</strong>
                  </span>
                </div>
              ) : (
                <div className="space-y-3.5 p-3.5">
                  {/* Tecnica di cucina + Output Semilavorato */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                    <div className="sm:col-span-7">
                      <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        <Flame className="h-3 w-3 text-amber-400" />
                        <span>Tecnica di Cucina / Lavorazione</span>
                      </label>
                      <select
                        value={phase.tecnica_id}
                        onChange={(e) =>
                          handleUpdatePhase(phase.id, { tecnica_id: e.target.value })
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-100 outline-none focus:border-amber-400/50"
                      >
                        {database.techniques.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-5">
                      <label className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        <PackageCheck className="h-3 w-3 text-purple-400" />
                        <span>Nome Semilavorato Generato (Output)</span>
                      </label>
                      <input
                        type="text"
                        value={phase.output_nome}
                        onChange={(e) =>
                          handleUpdatePhase(phase.id, { output_nome: e.target.value })
                        }
                        placeholder={`Semilavorato Fase ${phase.ordine}`}
                        className="w-full rounded-lg border border-purple-400/25 bg-[#12161e] px-2.5 py-1.5 text-xs text-purple-100 placeholder-stone-500 outline-none focus:border-purple-400/60"
                      />
                    </div>
                  </div>

                  {/* Parametri Operativi Opzionali: Tempo, Temperatura, Attrezzatura */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-stone-400">
                        <Clock className="h-3 w-3 text-stone-400" />
                        <span>Tempo (min)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={phase.tempo_minuti ?? ''}
                        onChange={(e) =>
                          handleUpdatePhase(phase.id, {
                            tempo_minuti: e.target.value ? parseInt(e.target.value, 10) : null,
                          })
                        }
                        placeholder="Es. 15"
                        className="w-full rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-400/50"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-stone-400">
                        <Thermometer className="h-3 w-3 text-stone-400" />
                        <span>Temp. (°C)</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={phase.temperatura ?? ''}
                        onChange={(e) =>
                          handleUpdatePhase(phase.id, {
                            temperatura: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                        placeholder="Es. 180"
                        className="w-full rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-400/50"
                      />
                    </div>

                    <div>
                      <label className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-stone-400">
                        <Utensils className="h-3 w-3 text-stone-400" />
                        <span>Attrezzatura</span>
                      </label>
                      <input
                        type="text"
                        value={phase.attrezzatura ?? ''}
                        onChange={(e) =>
                          handleUpdatePhase(phase.id, { attrezzatura: e.target.value })
                        }
                        placeholder="Es. Padella, Forno..."
                        className="w-full rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-400/50"
                      />
                    </div>
                  </div>

                  {/* SELETTORE INPUT PER FASE: Semilavorati precedenti + Ingredienti con residuo */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#090b0f] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-300">
                        <Layers className="h-3.5 w-3.5 text-amber-400" />
                        <span>Input della Fase {phase.ordine} (Ingredienti &amp; Semilavorati)</span>
                      </span>
                      <span className="font-code text-[10px] text-stone-500">
                        {phase.inputs.length} elementi
                      </span>
                    </div>

                    {/* Badge cliccabili per inserire Semilavorati prodotti dalle fasi precedenti */}
                    {previousPhases.length > 0 && (
                      <div className="mb-2.5">
                        <div className="mb-1 text-[10px] text-stone-400">
                          Riutilizza un semilavorato generato dalle fasi precedenti:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {previousPhases.map((prevP) => {
                            const isUsed = phase.inputs.some(
                              (inp) =>
                                inp.tipo === 'SEMILAVORATO' && inp.riferimento_id === prevP.id
                            );
                            return (
                              <button
                                key={prevP.id}
                                type="button"
                                disabled={isUsed}
                                onClick={() => handleAddSemilavoratoInput(phase.id, prevP)}
                                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${
                                  isUsed
                                    ? 'border-purple-400/40 bg-purple-500/20 text-purple-200 opacity-60'
                                    : 'border-purple-400/35 bg-purple-500/10 text-purple-200 hover:bg-purple-500/25'
                                }`}
                              >
                                <Plus className="h-3 w-3" />
                                <span>
                                  [Output Fase {prevP.ordine}: {prevP.output_nome}]
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selettore rapido Ingrediente con indicazione della quantità residua */}
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-12">
                      <select
                        value={selectedIngId}
                        onChange={(e) => handleSelectIngredientForPhase(phase.id, e.target.value)}
                        className="rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-200 outline-none focus:border-amber-400/50 sm:col-span-6"
                      >
                        <option value="">+ Assegna ingrediente a Fase {phase.ordine}...</option>
                        {allocations.length > 0 && (
                          <optgroup label="Ingredienti della Ricetta (con quantità residua)">
                            {allocations.map((a) => (
                              <option key={`plan_${a.ingredientId}`} value={a.ingredientId}>
                                {a.name} —{' '}
                                {a.remaining > 0
                                  ? `residuo da assegnare: ${formatQuantityAndUnit(a.remaining, a.unit)}`
                                  : `già assegnato (${formatQuantityAndUnit(a.assignedTotal, a.unit)})`}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Tutti gli Ingredienti del Catalogo">
                          {sortedIngredients.map((ing) => (
                            <option key={`cat_${ing.id}`} value={ing.id}>
                              {ing.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>

                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        disabled={selectedIngUnit === 'q.b.'}
                        value={selectedIngUnit === 'q.b.' ? '1' : phaseIngQty[phase.id] ?? ''}
                        onChange={(e) =>
                          setPhaseIngQty((prev) => ({ ...prev, [phase.id]: e.target.value }))
                        }
                        placeholder="Qtà fase"
                        className="rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-100 outline-none focus:border-amber-400/50 disabled:opacity-40 sm:col-span-2"
                      />

                      <select
                        value={selectedIngUnit}
                        onChange={(e) =>
                          setPhaseIngUnit((prev) => ({ ...prev, [phase.id]: e.target.value }))
                        }
                        className="rounded-lg border border-white/10 bg-[#12161e] px-2 py-1.5 text-xs text-stone-200 outline-none focus:border-amber-400/50 sm:col-span-2"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={!selectedIngId}
                        onClick={() => handleAddIngredientInputToPhase(phase.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/35 hover:bg-amber-500/30 disabled:opacity-35 sm:col-span-2"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Inserisci</span>
                      </button>
                    </div>

                    {/* Lista Input assegnati alla Fase */}
                    {phase.inputs.length === 0 ? (
                      <div className="mt-2.5 rounded-lg border border-dashed border-white/10 p-2.5 text-center text-[11px] text-stone-500">
                        Nessun ingrediente o semilavorato ancora assegnato a questa fase.
                      </div>
                    ) : (
                      <div className="mt-2.5 space-y-1.5">
                        {phase.inputs.map((inp) => {
                          if (inp.tipo === 'SEMILAVORATO') {
                            const srcPhase = fasi.find((f) => f.id === inp.riferimento_id);
                            return (
                              <div
                                key={inp.id}
                                className="flex items-center justify-between gap-2 rounded-lg border border-purple-400/30 bg-purple-500/10 px-2.5 py-1.5 text-xs text-purple-100"
                              >
                                <div className="flex items-center gap-2">
                                  <PackageCheck className="h-3.5 w-3.5 shrink-0 text-purple-300" />
                                  <span className="font-semibold">
                                    [Output Fase {srcPhase?.ordine || '?'}: {inp.label}]
                                  </span>
                                  {srcPhase && (
                                    <span className="text-[10px] text-purple-200/80">
                                      (proveniente da “{srcPhase.titolo}”)
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhaseInput(phase.id, inp.id)}
                                  className="rounded p-1 text-purple-300 hover:bg-rose-500/20 hover:text-rose-200"
                                  title="Rimuovi semilavorato da questa fase"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={inp.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs"
                            >
                              <span className="min-w-[120px] flex-1 font-medium text-stone-200">
                                {inp.label}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0.1"
                                  step="any"
                                  disabled={inp.unita_misura === 'q.b.'}
                                  value={inp.unita_misura === 'q.b.' ? 1 : inp.quantita}
                                  onChange={(e) =>
                                    handleUpdatePhaseInput(phase.id, inp.id, {
                                      quantita: Math.max(0.1, parseFloat(e.target.value) || 0),
                                    })
                                  }
                                  className="w-20 rounded border border-white/10 bg-[#12161e] px-2 py-1 font-code text-xs text-amber-200 outline-none focus:border-amber-400/50 disabled:opacity-40"
                                />
                                <select
                                  value={inp.unita_misura || 'g'}
                                  onChange={(e) =>
                                    handleUpdatePhaseInput(phase.id, inp.id, {
                                      unita_misura: e.target.value,
                                    })
                                  }
                                  className="rounded border border-white/10 bg-[#12161e] px-1.5 py-1 text-[11px] text-stone-300 outline-none focus:border-amber-400/50"
                                >
                                  {UNIT_OPTIONS.map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhaseInput(phase.id, inp.id)}
                                  className="rounded p-1 text-stone-500 hover:bg-rose-500/10 hover:text-rose-300"
                                  title="Rimuovi ingrediente da questa fase"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Descrizione / Istruzioni specifiche per questa singola fase */}
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      Istruzioni operative Fase {phase.ordine}
                    </label>
                    <textarea
                      rows={2}
                      value={phase.istruzioni}
                      onChange={(e) =>
                        handleUpdatePhase(phase.id, { istruzioni: e.target.value })
                      }
                      placeholder={`Descrivi i passaggi operativi della Fase ${phase.ordine}...`}
                      className="w-full resize-y rounded-lg border border-white/10 bg-[#12161e] px-2.5 py-1.5 text-xs text-stone-200 placeholder-stone-500 outline-none focus:border-amber-400/50"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleAddPhase}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-400/35 bg-amber-500/[0.05] py-2.5 text-xs font-semibold text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-500/15"
        >
          <Plus className="h-4 w-4" />
          <span>Aggiungi Fase {fasi.length + 1} (Concatena Semilavorato)</span>
        </button>
      </div>
    </div>
  );
};
