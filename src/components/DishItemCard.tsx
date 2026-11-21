import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Scale,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  AROMA_KEYS,
  AROMA_META,
  CATEGORY_META,
  DishPhase,
  DOSAGE_META,
  Dosage,
  Technique,
  TEMPORAL_META,
  TransformedDishItem,
} from '../types/flavor';

interface DishItemCardProps {
  transformed: TransformedDishItem;
  techniques: Technique[];
  phases?: DishPhase[];
  onChangeTechnique: (instanceId: string, techniqueId: string) => void;
  onChangeDosage: (instanceId: string, dosage: Dosage) => void;
  onChangePhase?: (instanceId: string, phaseId: string) => void;
  onChangeQuantity?: (instanceId: string, quantity: number, unit: string) => void;
  onSplitToPhase?: (instanceId: string, targetPhaseId: string) => void;
  onRemove: (instanceId: string) => void;
}

const DOSAGES: Dosage[] = ['garnish', 'secondary', 'main'];
const UNITS = ['g', 'ml', 'pz', 'cucchiai', 'q.b.'];

export const DishItemCard: React.FC<DishItemCardProps> = ({
  transformed,
  techniques,
  phases,
  onChangeTechnique,
  onChangeDosage,
  onChangePhase,
  onChangeQuantity,
  onSplitToPhase,
  onRemove,
}) => {
  const [showCompare, setShowCompare] = useState(false);

  const { item, ingredient, technique, transformedState, preconditionWarnings, significantDeltas } =
    transformed;
  const catMeta = CATEGORY_META[ingredient.category];
  const comp = ingredient.composition;

  // Top 3 aromi attivi nello stato trasformato
  const topAromas = [...AROMA_KEYS]
    .map((k) => ({ key: k, val: transformedState.aromas[k] }))
    .filter((a) => a.val >= 2.0)
    .sort((a, b) => b.val - a.val)
    .slice(0, 3);

  const isTransformed = technique.id !== 'tech_raw';

  return (
    <div className="animate-fade-in rounded-xl border border-white/10 bg-[#13171d] p-4 shadow-lg transition-all hover:border-white/15">
      {/* Top Row: Name, Category, Volume, Remove */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-[#f6f1e7]">{ingredient.name}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${catMeta.colorClass}`}
            >
              {catMeta.label}
            </span>
          </div>

          {/* Composizione chimica + Volume + Picco temporale */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-code text-[10px] text-stone-400">
            <span title="Acqua / Proteine / Carboidrati-Zuccheri / Grassi">
              H₂O {Math.round(comp.water * 100)}% · P {Math.round(comp.protein * 100)}% · C{' '}
              {Math.round(comp.carbs_sugars * 100)}% · G {Math.round(comp.fat * 100)}%
            </span>
            <span className="inline-flex items-center gap-1 text-amber-300/90">
              <Scale className="h-3 w-3" />
              Vol {transformedState.volume}/5 (peso {transformed.weight.toFixed(1)})
            </span>
            <span className="inline-flex items-center gap-1 text-sky-300/90">
              <Clock className="h-3 w-3" />
              {TEMPORAL_META[transformedState.temporal_peak].label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.instanceId)}
          className="rounded-lg p-1.5 text-stone-500 transition hover:bg-rose-500/15 hover:text-rose-300"
          title="Rimuovi ingrediente"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Controls: Technique & Dosage */}
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-12">
        {/* Technique Dropdown */}
        <div className="sm:col-span-7">
          <label className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-stone-400">
            <Flame className="h-3 w-3 text-amber-400" />
            Tecnica applicata
          </label>
          <select
            value={item.techniqueId}
            onChange={(e) => onChangeTechnique(item.instanceId, e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0d1015] px-2.5 py-2 text-xs text-stone-100 outline-none transition focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30"
          >
            {techniques.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#13171d] text-stone-100">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dosage Segmented Selector */}
        <div className="sm:col-span-5">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-stone-400">
            Dosaggio
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-[#0d1015] p-0.5">
            {DOSAGES.map((d) => {
              const active = item.dosage === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onChangeDosage(item.instanceId, d)}
                  className={`rounded-md px-1.5 py-1.5 text-center transition ${
                    active
                      ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40'
                      : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                  }`}
                  title={`${DOSAGE_META[d].label} (${DOSAGE_META[d].short})`}
                >
                  <div className="truncate text-[10px] font-medium leading-tight">
                    {DOSAGE_META[d].label.slice(0, 6)}.
                  </div>
                  <div className="font-code text-[9px] opacity-80">{DOSAGE_META[d].short}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quantità nella Fase + Spostamento / Ripartizione tra Fasi */}
      {(onChangeQuantity || (phases && phases.length > 0)) && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#0b0d11] px-2.5 py-1.5 text-[11px]">
          {onChangeQuantity && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-stone-400">Quota:</span>
              <input
                type="number"
                min="0.1"
                step="any"
                disabled={(item.unit || 'g') === 'q.b.'}
                value={(item.unit || 'g') === 'q.b.' ? 1 : item.quantity ?? 100}
                onChange={(e) =>
                  onChangeQuantity(
                    item.instanceId,
                    Math.max(0.1, parseFloat(e.target.value) || 0),
                    item.unit || 'g'
                  )
                }
                className="w-16 rounded border border-white/10 bg-[#13171d] px-1.5 py-0.5 font-code text-xs text-amber-200 outline-none focus:border-amber-400/50 disabled:opacity-40"
              />
              <select
                value={item.unit || 'g'}
                onChange={(e) =>
                  onChangeQuantity(item.instanceId, item.quantity ?? 100, e.target.value)
                }
                className="rounded border border-white/10 bg-[#13171d] px-1.5 py-0.5 text-[11px] text-stone-300 outline-none focus:border-amber-400/50"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          )}

          {phases && phases.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {onChangePhase && (
                <select
                  value={item.phaseId || phases[0].id}
                  onChange={(e) => onChangePhase(item.instanceId, e.target.value)}
                  className="rounded border border-white/10 bg-[#13171d] px-2 py-0.5 text-[11px] text-stone-200 outline-none focus:border-amber-400/50"
                  title="Sposta questo ingrediente in un'altra fase"
                >
                  {phases.map((p) => (
                    <option key={p.id} value={p.id}>
                      In Fase {p.order}: {p.title}
                    </option>
                  ))}
                </select>
              )}

              {onSplitToPhase && phases.length > 1 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onSplitToPhase(item.instanceId, e.target.value);
                    }
                  }}
                  className="rounded border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200 outline-none hover:bg-amber-500/20"
                  title="Ripartisci una quota di questo ingrediente anche in un'altra fase (es. 50g in Fase 1 e 30g in Fase 3)"
                >
                  <option value="">+ Ripartisci in altra fase...</option>
                  {phases
                    .filter((p) => p.id !== (item.phaseId || phases[0].id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        ➔ Ripartisci quota in Fase {p.order} ({p.title})
                      </option>
                    ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chemical Precondition Warning Badge */}
      {preconditionWarnings.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="space-y-1">
              <div className="font-semibold text-amber-300">
                Avviso Chimico — Precondizione non soddisfatta
              </div>
              {preconditionWarnings.map((w) => (
                <p key={w.rule} className="text-[11px] leading-relaxed text-amber-100/90">
                  {w.message}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Aroma Badges + Compare Toggle */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {topAromas.length > 0 ? (
            topAromas.map((a) => {
              const meta = AROMA_META[a.key];
              return (
                <span
                  key={a.key}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${meta.bgClass} ${meta.textClass}`}
                >
                  {meta.short}
                  <span className="font-code opacity-85">{a.val.toFixed(1)}</span>
                </span>
              );
            })
          ) : (
            <span className="text-[11px] italic text-stone-500">Profilo aromatico neutro</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowCompare((s) => !s)}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
            showCompare
              ? 'bg-amber-500/15 text-amber-200'
              : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
          }`}
        >
          <SlidersHorizontal className="h-3 w-3" />
          <span>Confronta Crudo vs Trasformato</span>
          {showCompare ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Expandable Raw vs Transformed Comparison */}
      {showCompare && (
        <div className="mt-2.5 rounded-lg border border-white/[0.08] bg-[#0c0f14] p-3">
          {!isTransformed || significantDeltas.length === 0 ? (
            <p className="text-xs text-stone-400">
              Ingrediente allo stato naturale (nessuna trasformazione chimico-fisica applicata).
              Seleziona una tecnica di cottura o marinatura per osservare i delta molecolari.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-stone-400">
                <span>Variazioni principali ({technique.name.split(' (')[0]})</span>
                <span className="font-code">Crudo → Trasf.</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {significantDeltas.slice(0, 8).map((d) => {
                  const isPos = d.delta > 0;
                  return (
                    <div
                      key={`${d.group}_${d.key}`}
                      className="rounded-md border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-stone-200">{d.label}</span>
                        <span
                          className={`font-code text-[10px] font-semibold ${
                            isPos ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {d.delta.toFixed(1)}
                          {d.percentChange !== null && Math.abs(d.percentChange) >= 15
                            ? ` (${isPos ? '+' : ''}${d.percentChange}%)`
                            : ''}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isPos ? 'bg-emerald-400/80' : 'bg-rose-400/80'
                            }`}
                            style={{ width: `${Math.min(100, d.transformedVal * 10)}%` }}
                          />
                        </div>
                        <span className="inline-flex items-center gap-0.5 font-code text-[9px] text-stone-400">
                          {d.rawVal.toFixed(1)}
                          <ArrowRight className="h-2.5 w-2.5" />
                          <strong className="text-stone-200">{d.transformedVal.toFixed(1)}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
