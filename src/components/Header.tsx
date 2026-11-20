import React from 'react';
import {
  Beaker,
  Database,
  FlaskConical,
  LogOut,
  RotateCcw,
  Shield,
  Sparkles,
  Trash2,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { PresetRecipe } from '../types/flavor';

export type AppView = 'simulator' | 'ingredients';

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
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0d10]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-[1520px] px-4 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
          <div className="flex items-center gap-2">
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

        {/* Preset Strip (solo nella vista Simulatore) */}
        {activeView === 'simulator' && (
        <div className="mt-2.5 flex items-center gap-2 overflow-x-auto border-t border-white/[0.06] pt-2.5 pb-1">
          <div className="mr-1 flex shrink-0 items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Ricette Test ({presets.length}):</span>
          </div>

          {presets.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onLoadPreset(preset)}
                className={`group inline-flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-all ${
                  isActive
                    ? 'border-amber-400/50 bg-amber-500/15 text-amber-100 shadow-[0_0_16px_rgba(217,155,67,0.14)]'
                    : 'border-white/10 bg-white/[0.03] text-stone-300 hover:border-amber-400/30 hover:bg-white/[0.06] hover:text-stone-100'
                }`}
                title={`${preset.name} — ${preset.description}`}
              >
                <span className="whitespace-nowrap font-medium">{preset.name}</span>
              </button>
            );
          })}

          {activePresetId && (
            <button
              type="button"
              onClick={() => {
                const p = presets.find((x) => x.id === activePresetId);
                if (p) onLoadPreset(p);
              }}
              className="ml-auto inline-flex shrink-0 items-center gap-1 pl-2 text-[11px] text-stone-400 transition hover:text-amber-300"
              title="Ricarica i valori originali del preset"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden md:inline">Ripristina</span>
            </button>
          )}
        </div>
        )}
      </div>
    </header>
  );
};
