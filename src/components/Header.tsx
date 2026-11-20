import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Beaker,
  Check,
  ChevronDown,
  Database,
  FileText,
  FlaskConical,
  LogOut,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Trash2,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { PresetRecipe } from '../types/flavor';

export type AppView = 'simulator' | 'recipe' | 'ingredients';

interface HeaderProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  presets: PresetRecipe[];
  activePresetId: string | null;
  onLoadPreset: (preset: PresetRecipe) => void;
  onClearDish: () => void;
  onOpenDatabase: () => void;
  onOpenAccount: () => void;
  onLogout: () => void;
  currentUser: AuthUser;
  dishCount: number;
  ingredientCount: number;
  techniqueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onChangeView,
  presets,
  activePresetId,
  onLoadPreset,
  onClearDish,
  onOpenDatabase,
  onOpenAccount,
  onLogout,
  currentUser,
  dishCount,
  ingredientCount,
  techniqueCount,
}) => {
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [presetQuery, setPresetQuery] = useState('');
  const presetDropdownRef = useRef<HTMLDivElement | null>(null);

  const activePreset = useMemo(
    () => presets.find((p) => p.id === activePresetId) ?? null,
    [presets, activePresetId]
  );

  const filteredPresets = useMemo(() => {
    const q = presetQuery.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [presets, presetQuery]);

  // Chiudi la tendina cliccando fuori o premendo Escape
  useEffect(() => {
    if (!isPresetMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(e.target as Node)) {
        setIsPresetMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPresetMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPresetMenuOpen]);

  // Chiudi tendina se si cambia sezione
  useEffect(() => {
    if (activeView !== 'simulator') {
      setIsPresetMenuOpen(false);
    }
  }, [activeView]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0d10]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-[1520px] px-4 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/20 to-orange-600/10 text-amber-300 shadow-[0_0_24px_rgba(217,155,67,0.18)]">
              <Beaker className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2.5">
                <h1 className="font-display text-2xl font-semibold tracking-wide text-[#f6f1e7]">
                  FlavorEngine
                </h1>
                <span className="hidden rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 font-code text-[10px] font-medium uppercase tracking-widest text-amber-300 sm:inline-block">
                  Lab v1.0
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Laboratorio Computazionale del Gusto &bull; Chimica di Cottura e Simulazione al Palato
              </p>
            </div>
          </div>

          {/* Main View Switcher */}
          <nav
            aria-label="Sezioni principali"
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
          >
            <button
              type="button"
              onClick={() => onChangeView('simulator')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeView === 'simulator'
                  ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40 shadow-[0_0_16px_rgba(217,155,67,0.14)]'
                  : 'text-stone-400 hover:bg-white/[0.04] hover:text-stone-200'
              }`}
            >
              <UtensilsCrossed className="h-3.5 w-3.5" />
              <span>Simulatore Piatto</span>
              {dishCount > 0 && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-code text-[10px]">
                  {dishCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onChangeView('recipe')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeView === 'recipe'
                  ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40 shadow-[0_0_16px_rgba(217,155,67,0.14)]'
                  : 'text-stone-400 hover:bg-white/[0.04] hover:text-stone-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Analisi Ricetta</span>
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-code text-[9px] uppercase text-amber-300">
                IA
              </span>
            </button>
            <button
              type="button"
              onClick={() => onChangeView('ingredients')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeView === 'ingredients'
                  ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40 shadow-[0_0_16px_rgba(217,155,67,0.14)]'
                  : 'text-stone-400 hover:bg-white/[0.04] hover:text-stone-200'
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Atlante Ingredienti</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-code text-[10px]">
                {ingredientCount}
              </span>
            </button>
          </nav>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tendina Ricette Test (solo nella vista Simulatore) */}
            {activeView === 'simulator' && (
              <div ref={presetDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsPresetMenuOpen((prev) => !prev)}
                  aria-expanded={isPresetMenuOpen}
                  aria-haspopup="listbox"
                  className={`inline-flex max-w-[230px] items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    isPresetMenuOpen || activePreset
                      ? 'border-amber-400/45 bg-amber-500/12 text-amber-100 hover:bg-amber-500/20'
                      : 'border-white/10 bg-white/[0.04] text-stone-200 hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-200'
                  }`}
                  title={activePreset ? `Ricetta attiva: ${activePreset.name}` : 'Seleziona una ricetta test'}
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span className="truncate">
                    {activePreset ? activePreset.name : `Ricette Test (${presets.length})`}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-stone-400 transition-transform ${
                      isPresetMenuOpen ? 'rotate-180 text-amber-300' : ''
                    }`}
                  />
                </button>

                {isPresetMenuOpen && (
                  <div className="absolute left-0 z-50 mt-2 w-[320px] max-w-[calc(100vw-2rem)] sm:w-[390px] overflow-hidden rounded-2xl border border-white/15 bg-[#12151c] shadow-2xl shadow-black/70 ring-1 ring-white/5">
                    <div className="border-b border-white/10 bg-[#0d1015] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Ricette Test ({presets.length})</span>
                        </div>
                        {activePreset && (
                          <button
                            type="button"
                            onClick={() => {
                              onLoadPreset(activePreset);
                              setIsPresetMenuOpen(false);
                            }}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-stone-400 transition hover:bg-white/5 hover:text-amber-300"
                            title="Ricarica i valori originali del preset attivo"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Ripristina</span>
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
                        <input
                          type="text"
                          value={presetQuery}
                          onChange={(e) => setPresetQuery(e.target.value)}
                          placeholder="Filtra ricette..."
                          className="w-full rounded-lg border border-white/10 bg-[#0b0d11] py-1.5 pl-8 pr-3 text-xs text-stone-100 placeholder-stone-500 outline-none focus:border-amber-400/50"
                        />
                      </div>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto p-1.5" role="listbox">
                      {filteredPresets.length === 0 ? (
                        <div className="p-4 text-center text-xs text-stone-500">
                          Nessuna ricetta trovata.
                        </div>
                      ) : (
                        filteredPresets.map((preset) => {
                          const isActive = activePresetId === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              onClick={() => {
                                onLoadPreset(preset);
                                setIsPresetMenuOpen(false);
                                setPresetQuery('');
                              }}
                              className={`mb-1 flex w-full items-start justify-between gap-2.5 rounded-xl border px-3 py-2.5 text-left transition last:mb-0 ${
                                isActive
                                  ? 'border-amber-400/50 bg-amber-500/15 text-amber-100'
                                  : 'border-transparent bg-transparent text-stone-200 hover:border-white/10 hover:bg-white/[0.04]'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-xs font-semibold">
                                    {preset.name}
                                  </span>
                                  <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 font-code text-[10px] text-stone-300">
                                    {preset.items.length} ingr.
                                  </span>
                                </div>
                                {preset.subtitle && (
                                  <div className="mt-0.5 text-[11px] font-medium text-amber-300/80">
                                    {preset.subtitle}
                                  </div>
                                )}
                                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-stone-400">
                                  {preset.description}
                                </p>
                              </div>

                              {isActive && (
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onOpenDatabase}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-stone-200 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-200"
            >
              <Database className="h-3.5 w-3.5 text-amber-400" />
              <span>Database</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-code text-[10px] text-stone-300">
                {ingredientCount}i · {techniqueCount}t
              </span>
            </button>

            {activeView === 'simulator' && dishCount > 0 && (
              <button
                type="button"
                onClick={onClearDish}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-stone-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                title="Svuota piatto corrente"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Svuota</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAccount}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-stone-200 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-200"
              title={`Account: ${currentUser.email}`}
            >
              {currentUser.role === 'admin' ? (
                <Shield className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <User className="h-3.5 w-3.5 text-stone-400" />
              )}
              <span className="hidden md:inline">{currentUser.name}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-xs font-medium text-stone-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
              title="Esci dall'account"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
