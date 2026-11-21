import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  Link2,
  PlusCircle,
  Sparkles,
  Waves,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AROMA_KEYS,
  AROMA_META,
  DishSimulationResult,
  DOSAGE_META,
  Dosage,
  MOUTHFEEL_KEYS,
  MOUTHFEEL_META,
  TASTE_KEYS,
  TASTE_META,
} from '../types/flavor';
import { FlavorSolid3D } from './FlavorSolid3D';

interface PalateSimulatorProps {
  simulation: DishSimulationResult;
  onApplySuggestion: (ingredientId: string, techniqueId: string, dosage: Dosage) => void;
}

type ActiveTab = 'taste' | 'aromas' | 'temporal';

function getScoreColor(score: number): { stroke: string; text: string; label: string } {
  if (score >= 82) return { stroke: '#34d399', text: 'text-emerald-300', label: 'Eccellente' };
  if (score >= 66) return { stroke: '#f59e0b', text: 'text-amber-300', label: 'Equilibrato' };
  if (score >= 48) return { stroke: '#fb923c', text: 'text-orange-300', label: 'Migliorabile' };
  return { stroke: '#f43f5e', text: 'text-rose-300', label: 'Squilibrato' };
}

export const PalateSimulator: React.FC<PalateSimulatorProps> = ({
  simulation,
  onApplySuggestion,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('taste');

  const hasItems = simulation.items.length > 0;
  const scoreMeta = getScoreColor(simulation.balanceScore);

  // SVG Ring params
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - simulation.balanceScore / 100);

  // Data for Taste Radar
  const tasteRadarData = TASTE_KEYS.map((k) => ({
    axis: TASTE_META[k].short,
    grezzo: simulation.rawTaste[k],
    percepito: simulation.perceived.taste[k],
  }));

  // Data for Mouthfeel Radar
  const mouthfeelRadarData = MOUTHFEEL_KEYS.map((k) => ({
    axis: MOUTHFEEL_META[k].short,
    grezzo: simulation.rawMouthfeel[k],
    percepito: simulation.perceived.mouthfeel[k],
  }));

  // Data for Aromas sorted by intensity
  const aromaBars = [...AROMA_KEYS]
    .map((k) => ({
      key: k,
      ...AROMA_META[k],
      value: simulation.rawAromas[k],
    }))
    .sort((a, b) => b.value - a.value);

  // Data for Temporal AreaChart
  const temporalChartData = simulation.temporalCurve.map((p) => ({
    name: `${p.label} (${p.window})`,
    short: p.label,
    intensita: p.intensity,
  }));

  return (
    <section className="flex flex-col gap-5">
      {/* Top Score & Narrative Card */}
      <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Score Gauge */}
          <div className="flex shrink-0 items-center gap-4">
            <div className="relative h-24 w-24">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="7"
                />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  fill="none"
                  stroke={hasItems ? scoreMeta.stroke : 'rgba(255,255,255,0.12)'}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={hasItems ? dashOffset : circumference}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-code text-2xl font-bold text-[#f6f1e7]">
                  {hasItems ? simulation.balanceScore : '—'}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-stone-400">/ 100</span>
              </div>
            </div>

            <div className="sm:hidden">
              <div className="text-[11px] uppercase tracking-wider text-stone-400">
                Indice di Armonia
              </div>
              <div className={`text-lg font-semibold ${hasItems ? scoreMeta.text : 'text-stone-500'}`}>
                {hasItems ? scoreMeta.label : 'In attesa'}
              </div>
            </div>
          </div>

          {/* Narrative & Subscores */}
          <div className="min-w-0 flex-1">
            <div className="hidden items-center justify-between sm:flex">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Simulazione al Palato
                </span>
                {hasItems && (
                  <span
                    className={`rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium ${scoreMeta.text}`}
                  >
                    {scoreMeta.label}
                  </span>
                )}
              </div>
              <span className="font-code text-[11px] text-stone-500">
                Motore Psico-Sensoriale Live
              </span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-stone-200">{simulation.narrative}</p>

            {/* 4 Harmony Breakdown Micro-bars */}
            {hasItems && (
              <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  { label: 'Equilibrio Gusto', val: simulation.harmonyBreakdown.tasteBalance },
                  { label: 'Contrasto Texture', val: simulation.harmonyBreakdown.textureContrast },
                  { label: 'Ponti Aromatici', val: simulation.harmonyBreakdown.aromaticCoherence },
                  { label: 'Flusso Temporale', val: simulation.harmonyBreakdown.temporalFlow },
                ].map((sub) => (
                  <div key={sub.label} className="rounded-lg border border-white/[0.06] bg-[#0b0d11] p-2">
                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span className="truncate">{sub.label}</span>
                      <span className="font-code font-semibold text-stone-200">{sub.val}</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-amber-400/80 transition-all duration-500"
                        style={{ width: `${sub.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Psycho-Sensory KPI Strip */}
        {hasItems && (
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/[0.07] pt-4 sm:grid-cols-4">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-stone-400">
                Pesantezza Percepita
              </div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span
                  className={`font-code text-base font-semibold ${
                    simulation.perceived.perceived_heaviness > 5.5
                      ? 'text-rose-400'
                      : 'text-amber-200'
                  }`}
                >
                  {simulation.perceived.perceived_heaviness.toFixed(1)}
                </span>
                <span className="font-code text-[10px] text-stone-500">
                  (grezza {simulation.rawMouthfeel.richness.toFixed(1)})
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-stone-400">
                Sapidità Sinergica
              </div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span
                  className={`font-code text-base font-semibold ${
                    simulation.perceived.perceived_savory < 2.5
                      ? 'text-amber-400'
                      : 'text-sky-300'
                  }`}
                >
                  {simulation.perceived.perceived_savory.toFixed(1)}
                </span>
                <span className="font-code text-[10px] text-stone-500">
                  (sale {simulation.rawTaste.salty.toFixed(1)})
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-stone-400">
                Picco Croccantezza
              </div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-code text-base font-semibold text-orange-300">
                  {simulation.perceived.max_crunch.toFixed(1)}
                </span>
                <span className="font-code text-[10px] text-stone-500">/ 10.0 max</span>
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-stone-400">
                Persistenza Finale
              </div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-code text-base font-semibold text-emerald-300">
                  {simulation.perceived.persistence_score.toFixed(1)}
                </span>
                <span className="font-code text-[10px] text-stone-500">/ 10.0</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Analytics Tabs Card */}
      <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl">
        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-3.5">
          {[
            { id: 'taste' as const, label: 'Gusto & Mouthfeel', icon: Activity },
            { id: 'aromas' as const, label: 'Ponti Molecolari & Aromi', icon: Link2 },
            { id: 'temporal' as const, label: 'Curva Temporale del Boccone', icon: Waves },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                  active
                    ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40'
                    : 'bg-white/[0.03] text-stone-400 hover:bg-white/[0.06] hover:text-stone-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {!hasItems ? (
          <div className="py-16 text-center text-xs text-stone-500">
            Nessun dato da visualizzare. Aggiungi ingredienti per attivare i grafici sensoriali.
          </div>
        ) : (
          <div className="mt-5">
            {/* TAB 1: GUSTO & MOUTHFEEL */}
            {activeTab === 'taste' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {/* Taste Radar */}
                  <div className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                        Gusti Primari (Grezzi vs Percepiti)
                      </h3>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="inline-flex items-center gap-1 text-stone-400">
                          <span className="h-2 w-2 rounded-full bg-stone-500" /> Chimico
                        </span>
                        <span className="inline-flex items-center gap-1 text-amber-300">
                          <span className="h-2 w-2 rounded-full bg-amber-400" /> Percepito
                        </span>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={tasteRadarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis
                            dataKey="axis"
                            tick={{ fill: '#d6d3d1', fontSize: 11 }}
                          />
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

                  {/* Mouthfeel Radar */}
                  <div className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                        Profilo Tattile & Mouthfeel
                      </h3>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="inline-flex items-center gap-1 text-stone-400">
                          <span className="h-2 w-2 rounded-full bg-stone-500" /> Grezzo
                        </span>
                        <span className="inline-flex items-center gap-1 text-sky-300">
                          <span className="h-2 w-2 rounded-full bg-sky-400" /> Al Palato
                        </span>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={mouthfeelRadarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis
                            dataKey="axis"
                            tick={{ fill: '#d6d3d1', fontSize: 11 }}
                          />
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
                <FlavorSolid3D
                  simulation={simulation}
                  recipeName="Profilo Sensoriale del Piatto"
                />

                {/* Psycho-sensory Modulation Formulas Summary */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="text-[10px] font-medium uppercase text-stone-400">
                      Sale → Amaro
                    </div>
                    <div className="mt-1 font-code text-xs text-stone-200">
                      {simulation.rawTaste.bitter.toFixed(1)} →{' '}
                      <strong className="text-purple-300">
                        {simulation.perceived.perceived_bitter.toFixed(1)}
                      </strong>
                    </div>
                    <p className="mt-0.5 text-[10px] text-stone-500">Soppressione dell’amarezza</p>
                  </div>

                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="text-[10px] font-medium uppercase text-stone-400">
                      Acido/Astring. → Grassi
                    </div>
                    <div className="mt-1 font-code text-xs text-stone-200">
                      {simulation.rawMouthfeel.richness.toFixed(1)} →{' '}
                      <strong className="text-amber-300">
                        {simulation.perceived.perceived_heaviness.toFixed(1)}
                      </strong>
                    </div>
                    <p className="mt-0.5 text-[10px] text-stone-500">Taglio della pesantezza</p>
                  </div>

                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="text-[10px] font-medium uppercase text-stone-400">
                      Sinergia Umami + Sale
                    </div>
                    <div className="mt-1 font-code text-xs text-stone-200">
                      {simulation.rawTaste.salty.toFixed(1)} →{' '}
                      <strong className="text-sky-300">
                        {simulation.perceived.perceived_savory.toFixed(1)}
                      </strong>
                    </div>
                    <p className="mt-0.5 text-[10px] text-stone-500">Amplificazione sapida</p>
                  </div>

                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="text-[10px] font-medium uppercase text-stone-400">
                      Dolce → Acido / Piccante
                    </div>
                    <div className="mt-1 font-code text-xs text-stone-200">
                      Acido{' '}
                      <strong className="text-lime-300">
                        {simulation.perceived.perceived_sour.toFixed(1)}
                      </strong>{' '}
                      · Pung.{' '}
                      <strong className="text-rose-300">
                        {simulation.perceived.perceived_pungency.toFixed(1)}
                      </strong>
                    </div>
                    <p className="mt-0.5 text-[10px] text-stone-500">Attenuazione percettiva</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PONTI MOLECOLARI & AROMI */}
            {activeTab === 'aromas' && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                {/* 12 Aromatic Families Spectrum */}
                <div className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-4 xl:col-span-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                      Spettro delle 12 Famiglie Aromatiche
                    </h3>
                    <span className="font-code text-[10px] text-stone-500">Scala 0.0 – 10.0</span>
                  </div>
                  <div className="space-y-2.5">
                    {aromaBars.map((a) => (
                      <div key={a.key} className="group">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: a.color }}
                            />
                            <span className="font-medium text-stone-200">{a.label}</span>
                            <span className="hidden text-[10px] text-stone-500 sm:inline">
                              ({a.molecules})
                            </span>
                          </div>
                          <span className="font-code text-[11px] font-semibold text-stone-300">
                            {a.value.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, a.value * 10)}%`,
                              backgroundColor: a.color,
                              opacity: a.value >= 1.0 ? 0.85 : 0.25,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Molecular Bridges */}
                <div className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-4 xl:col-span-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                      Ponti Molecolari tra Coppie (Cosine Similarity)
                    </h3>
                    <span className="font-code text-[10px] text-stone-500">
                      {simulation.molecularBridges.length} coppie
                    </span>
                  </div>

                  {simulation.molecularBridges.length === 0 ? (
                    <p className="py-10 text-center text-xs text-stone-500">
                      Aggiungi almeno 2 ingredienti per calcolare i ponti molecolari condivisi.
                    </p>
                  ) : (
                    <div className="max-h-[410px] space-y-2.5 overflow-y-auto pr-1">
                      {simulation.molecularBridges.map((bridge) => {
                        const isStrong = bridge.similarity >= 55;
                        const isMedium = bridge.similarity >= 30 && bridge.similarity < 55;
                        return (
                          <div
                            key={bridge.id}
                            className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-stone-100">
                                  {bridge.nameA.split(' (')[0]}{' '}
                                  <span className="text-amber-400">↔</span>{' '}
                                  {bridge.nameB.split(' (')[0]}
                                </div>
                                <div className="mt-0.5 text-[10px] text-stone-500">
                                  {bridge.techniqueA.split(' (')[0]} ·{' '}
                                  {bridge.techniqueB.split(' (')[0]}
                                </div>
                              </div>
                              <span
                                className={`shrink-0 rounded-full border px-2 py-0.5 font-code text-xs font-semibold ${
                                  isStrong
                                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                                    : isMedium
                                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                                      : 'border-white/10 bg-white/5 text-stone-400'
                                }`}
                              >
                                {bridge.similarity}%
                              </span>
                            </div>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isStrong
                                    ? 'bg-emerald-400'
                                    : isMedium
                                      ? 'bg-amber-400'
                                      : 'bg-stone-500'
                                }`}
                                style={{ width: `${bridge.similarity}%` }}
                              />
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {bridge.sharedAromas.length > 0 ? (
                                bridge.sharedAromas.map((sa) => {
                                  const meta = AROMA_META[sa.key];
                                  return (
                                    <span
                                      key={sa.key}
                                      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${meta.bgClass} ${meta.textClass}`}
                                    >
                                      {sa.label}
                                      <span className="font-code opacity-80">
                                        ({sa.valA.toFixed(1)} / {sa.valB.toFixed(1)})
                                      </span>
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-[10px] italic text-stone-500">
                                  Contrasto aromatico (nessuna famiglia condivisa ≥ 2.0)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CURVA TEMPORALE DEL BOCCONE */}
            {activeTab === 'temporal' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                      Evoluzione Sensoriale del Boccone nel Tempo
                    </h3>
                    <span className="font-code text-[10px] text-stone-500">
                      Attacco ➔ Centro Bocca ➔ Finale
                    </span>
                  </div>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={temporalChartData}
                        margin={{ top: 12, right: 24, left: -16, bottom: 4 }}
                      >
                        <defs>
                          <linearGradient id="temporalFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#d6d3d1', fontSize: 11 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                          domain={[0, 10]}
                          tick={{ fill: '#78716c', fontSize: 10 }}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#13171d',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '10px',
                            fontSize: '12px',
                            color: '#f4efe6',
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)} / 10`, 'Intensità']}
                        />
                        <Area
                          type="monotone"
                          dataKey="intensita"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#temporalFill)"
                          dot={{ r: 5, fill: '#fbbf24', stroke: '#0c0f14', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3 Phase Cards */}
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

                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="font-code text-xl font-bold text-[#f6f1e7]">
                          {phase.intensity.toFixed(1)}
                        </span>
                        <span className="font-code text-[10px] text-stone-500">/ 10.0</span>
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

                      {phase.activeIngredients.length > 0 && (
                        <div className="mt-2.5 border-t border-white/[0.06] pt-2 text-[10px] text-stone-400">
                          <span className="text-stone-500">Picco ingredienti: </span>
                          {phase.activeIngredients.map((n) => n.split(' (')[0]).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Box: Diagnosi dello Chef & Correttivi */}
      <div className="rounded-2xl border border-white/10 bg-[#11141a]/95 p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold tracking-wide text-[#f6f1e7]">
              Diagnosi dello Chef & Correttivi Intelligenti
            </h2>
          </div>
          <span className="font-code text-[10px] uppercase tracking-wider text-stone-500">
            Cosa manca al piatto?
          </span>
        </div>

        {!hasItems ? (
          <p className="text-xs text-stone-500">
            Componi un piatto per ricevere l’analisi critica su equilibri, texture e abbinamenti
            correttivi calcolati dall’algoritmo.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Diagnostics Column */}
            <div className="space-y-2.5 lg:col-span-6">
              <div className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                Analisi Critica del Profilo
              </div>
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
                const iconColor =
                  diag.severity === 'warning'
                    ? 'text-amber-400'
                    : diag.severity === 'success'
                      ? 'text-emerald-400'
                      : 'text-sky-400';

                return (
                  <div key={diag.id} className={`rounded-xl border p-3 text-xs ${style}`}>
                    <div className="flex items-start gap-2.5">
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                      <div>
                        <div className="font-semibold">{diag.title}</div>
                        <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                          {diag.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Suggestions Column */}
            <div className="space-y-2.5 lg:col-span-6">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-400">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Top 2 Correttivi Consigliati dall’Algoritmo</span>
              </div>

              {simulation.suggestions.length === 0 ? (
                <p className="rounded-xl border border-white/[0.07] bg-[#0c0f14] p-4 text-xs text-stone-500">
                  Tutti gli ingredienti disponibili sono già presenti nel piatto.
                </p>
              ) : (
                simulation.suggestions.map((sug) => (
                  <div
                    key={`${sug.ingredient.id}_${sug.technique.id}`}
                    className="rounded-xl border border-white/10 bg-[#0c0f14] p-3.5 transition hover:border-amber-400/35"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-[#f6f1e7]">
                          {sug.ingredient.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-stone-400">
                          {sug.technique.name.split(' (')[0]} ·{' '}
                          <span className="text-amber-300/90">
                            {DOSAGE_META[sug.dosage].label} ({DOSAGE_META[sug.dosage].short})
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {sug.scoreGain !== 0 && (
                          <span
                            className={`rounded-full px-2 py-0.5 font-code text-[10px] font-semibold ${
                              sug.scoreGain > 0
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-white/10 text-stone-300'
                            }`}
                          >
                            {sug.scoreGain > 0 ? '+' : ''}
                            {sug.scoreGain} pt → {sug.projectedScore}
                          </span>
                        )}
                        {sug.newBridgesCount > 0 && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-code text-[10px] text-amber-300">
                            +{sug.newBridgesCount} pont{sug.newBridgesCount === 1 ? 'e' : 'i'}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] leading-relaxed text-stone-300">{sug.reason}</p>

                    <button
                      type="button"
                      onClick={() =>
                        onApplySuggestion(sug.ingredient.id, sug.technique.id, sug.dosage)
                      }
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-500/25"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Aggiungi al piatto</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
