import React, { useMemo, useState } from 'react';
import { ChefHat, Plus, Search, UtensilsCrossed } from 'lucide-react';
import {
  CATEGORY_META,
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
  transformedItems: TransformedDishItem[];
  onAddIngredient: (ingredientId: string, techniqueId?: string, dosage?: Dosage) => void;
  onChangeTechnique: (instanceId: string, techniqueId: string) => void;
  onChangeDosage: (instanceId: string, dosage: Dosage) => void;
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
  transformedItems,
  onAddIngredient,
  onChangeTechnique,
  onChangeDosage,
  onRemoveItem,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all');

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

  const activeIngredientIds = useMemo(
    () => new Set(transformedItems.map((t) => t.ingredient.id)),
    [transformedItems]
  );

  return (
    <section className="flex flex-col gap-5">
      {/* Ingredient Quick Picker */}
      <div className="rounded-2xl border border-white/10 bg-[#11141a]/90 p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold tracking-wide text-[#f6f1e7]">
              Dispensa & Selettore Rapido
            </h2>
          </div>
          <span className="font-code text-[11px] text-stone-400">
            {filteredIngredients.length} disponibili
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca ingrediente (es. Manzo, Limone, Cavolfiore, Burro...)"
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
            const inDish = activeIngredientIds.has(ing.id);
            const catMeta = CATEGORY_META[ing.category];
            return (
              <button
                key={ing.id}
                type="button"
                onClick={() => onAddIngredient(ing.id)}
                className={`group flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                  inDish
                    ? 'border-amber-400/30 bg-amber-500/[0.07] hover:border-amber-400/50'
                    : 'border-white/[0.07] bg-[#0c0f14] hover:border-amber-400/35 hover:bg-white/[0.04]'
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-stone-100 group-hover:text-amber-100">
                    {ing.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-stone-500">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${catMeta.colorClass.split(' ')[0]}`} />
                    <span>{catMeta.label}</span>
                    <span>·</span>
                    <span className="font-code">Vol {ing.base_state.volume}</span>
                  </div>
                </div>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-stone-400 transition group-hover:border-amber-400/40 group-hover:bg-amber-500/20 group-hover:text-amber-200">
                  <Plus className="h-3.5 w-3.5" />
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

      {/* Composizione del Piatto */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold tracking-wide text-[#f6f1e7]">
              Composizione del Piatto & Tecniche
            </h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-code text-[11px] text-stone-300">
            {transformedItems.length} {transformedItems.length === 1 ? 'elemento' : 'elementi'}
          </span>
        </div>

        {transformedItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
            <UtensilsCrossed className="mx-auto h-8 w-8 text-stone-600" />
            <p className="mt-3 text-sm font-medium text-stone-300">Il piatto è ancora vuoto</p>
            <p className="mt-1 text-xs text-stone-500">
              Seleziona ingredienti dalla dispensa qui sopra oppure carica una delle 3 ricette test
              nell’intestazione.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transformedItems.map((t) => (
              <DishItemCard
                key={t.item.instanceId}
                transformed={t}
                techniques={techniques}
                onChangeTechnique={onChangeTechnique}
                onChangeDosage={onChangeDosage}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
