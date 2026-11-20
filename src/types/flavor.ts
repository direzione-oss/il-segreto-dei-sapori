export type TasteKey = 'sweet' | 'sour' | 'salty' | 'bitter' | 'umami';

export type MouthfeelKey =
  | 'pungency'
  | 'astringency'
  | 'richness'
  | 'crunchiness'
  | 'juiciness'
  | 'creaminess';

export type AromaKey =
  | 'sulfurous'
  | 'green_herbaceous'
  | 'citrus_terpenic'
  | 'floral'
  | 'fruity_ester'
  | 'roasted_pyrazine'
  | 'caramel_sweet'
  | 'lactic_buttery'
  | 'umami_funky'
  | 'earthy_mineral'
  | 'spicy_phenolic'
  | 'marine_iodine';

export type TemporalPeak = 'attack' | 'mid' | 'finish';
export type TemporalShift = TemporalPeak | 'keep';

export type IngredientCategory =
  | 'protein_meat'
  | 'protein_fish'
  | 'vegetable'
  | 'fruit'
  | 'dairy'
  | 'fat'
  | 'acid'
  | 'herb_spice'
  | 'umami_condiment';

export type TechniqueType = 'raw' | 'dry_heat' | 'moist_heat' | 'marinade' | 'fat_infusion';

export type Dosage = 'garnish' | 'secondary' | 'main';

export type TasteVector = Record<TasteKey, number>;
export type MouthfeelVector = Record<MouthfeelKey, number>;
export type AromaVector = Record<AromaKey, number>;

export interface ChemicalComposition {
  water: number;
  protein: number;
  carbs_sugars: number;
  fat: number;
}

export interface SensoryState {
  volume: number; // 1..5
  temporal_peak: TemporalPeak;
  taste: TasteVector;
  mouthfeel: MouthfeelVector;
  aromas: AromaVector;
}

export interface RawSensoryStateInput {
  volume: number;
  temporal_peak: TemporalPeak;
  taste?: Partial<TasteVector>;
  mouthfeel?: Partial<MouthfeelVector>;
  aromas?: Partial<AromaVector>;
}

export interface RawIngredientInput {
  id: string;
  name: string;
  category: IngredientCategory;
  composition: ChemicalComposition;
  base_state: RawSensoryStateInput;
}

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  composition: ChemicalComposition;
  base_state: SensoryState;
}

export interface TechniquePreconditions {
  min_protein?: number;
  min_carbs_sugars?: number;
  min_fat?: number;
}

export interface TechniqueDeltas {
  volume_shift?: number;
  temporal_shift?: TemporalShift;
  taste_add?: Partial<TasteVector>;
  mouthfeel_add?: Partial<MouthfeelVector>;
  aroma_multipliers?: Partial<AromaVector>;
  aroma_add?: Partial<AromaVector>;
}

export interface Technique {
  id: string;
  name: string;
  type: TechniqueType;
  preconditions: TechniquePreconditions;
  deltas: TechniqueDeltas;
}

export interface DishItem {
  instanceId: string;
  ingredientId: string;
  techniqueId: string;
  dosage: Dosage;
}

export interface PreconditionWarning {
  rule: 'min_protein' | 'min_carbs_sugars' | 'min_fat';
  required: number;
  actual: number;
  message: string;
}

export interface SensoryDeltaItem {
  key: string;
  label: string;
  group: 'taste' | 'mouthfeel' | 'aroma';
  rawVal: number;
  transformedVal: number;
  delta: number;
  percentChange: number | null;
}

export interface TransformedDishItem {
  item: DishItem;
  ingredient: Ingredient;
  technique: Technique;
  weight: number;
  doseMultiplier: number;
  preconditionWarnings: PreconditionWarning[];
  preconditionsMet: boolean;
  transformedState: SensoryState;
  significantDeltas: SensoryDeltaItem[];
}

export interface PerceivedProfile {
  taste: TasteVector;
  mouthfeel: MouthfeelVector;
  perceived_bitter: number;
  perceived_heaviness: number;
  perceived_savory: number;
  perceived_sour: number;
  perceived_pungency: number;
  persistence_score: number;
  max_crunch: number;
}

export interface MolecularBridge {
  id: string;
  itemAId: string;
  itemBId: string;
  nameA: string;
  nameB: string;
  techniqueA: string;
  techniqueB: string;
  similarity: number; // 0..100
  sharedAromas: {
    key: AromaKey;
    label: string;
    valA: number;
    valB: number;
  }[];
}

export interface TemporalPhaseResult {
  phase: TemporalPeak;
  label: string;
  window: string;
  intensity: number; // 0..10
  drivers: string[];
  activeIngredients: string[];
}

export interface DiagnosticAlert {
  id: string;
  severity: 'warning' | 'info' | 'success';
  title: string;
  message: string;
}

export interface CorrectiveSuggestion {
  ingredient: Ingredient;
  technique: Technique;
  dosage: Dosage;
  projectedScore: number;
  scoreGain: number;
  newBridgesCount: number;
  reason: string;
}

export interface DishSimulationResult {
  items: TransformedDishItem[];
  rawTaste: TasteVector;
  rawMouthfeel: MouthfeelVector;
  rawAromas: AromaVector;
  perceived: PerceivedProfile;
  molecularBridges: MolecularBridge[];
  temporalCurve: TemporalPhaseResult[];
  balanceScore: number; // 0..100
  harmonyBreakdown: {
    tasteBalance: number;
    textureContrast: number;
    aromaticCoherence: number;
    temporalFlow: number;
  };
  narrative: string;
  diagnostics: DiagnosticAlert[];
  suggestions: CorrectiveSuggestion[];
}

export interface PresetRecipe {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  items: Omit<DishItem, 'instanceId'>[];
}

export interface FlavorDatabase {
  ingredients: Ingredient[];
  techniques: Technique[];
}

// ==========================================
// TASSONOMIA E METADATI IN ITALIANO
// ==========================================

export const TASTE_KEYS: TasteKey[] = ['sweet', 'sour', 'salty', 'bitter', 'umami'];

export const MOUTHFEEL_KEYS: MouthfeelKey[] = [
  'pungency',
  'astringency',
  'richness',
  'crunchiness',
  'juiciness',
  'creaminess',
];

export const AROMA_KEYS: AromaKey[] = [
  'sulfurous',
  'green_herbaceous',
  'citrus_terpenic',
  'floral',
  'fruity_ester',
  'roasted_pyrazine',
  'caramel_sweet',
  'lactic_buttery',
  'umami_funky',
  'earthy_mineral',
  'spicy_phenolic',
  'marine_iodine',
];

export const TASTE_META: Record<TasteKey, { label: string; short: string; color: string }> = {
  sweet: { label: 'Dolcezza', short: 'Dolce', color: '#f59e0b' },
  sour: { label: 'Acidità', short: 'Acido', color: '#84cc16' },
  salty: { label: 'Sapidità', short: 'Sapido', color: '#38bdf8' },
  bitter: { label: 'Amarezza', short: 'Amaro', color: '#a855f7' },
  umami: { label: 'Umami', short: 'Umami', color: '#f43f5e' },
};

export const MOUTHFEEL_META: Record<MouthfeelKey, { label: string; short: string; color: string }> = {
  pungency: { label: 'Piccantezza / Pungenza', short: 'Pungenza', color: '#ef4444' },
  astringency: { label: 'Astringenza', short: 'Astringenza', color: '#c084fc' },
  richness: { label: 'Grassezza / Avvolgenza', short: 'Grassezza', color: '#fbbf24' },
  crunchiness: { label: 'Croccantezza', short: 'Croccante', color: '#fb923c' },
  juiciness: { label: 'Succosità', short: 'Succosità', color: '#22d3ee' },
  creaminess: { label: 'Morbidezza / Cremosità', short: 'Cremosità', color: '#fde68a' },
};

export const AROMA_META: Record<
  AromaKey,
  { label: string; short: string; molecules: string; color: string; bgClass: string; textClass: string }
> = {
  sulfurous: {
    label: 'Solforoso / Alliaco',
    short: 'Solfuri',
    molecules: 'Tioli, Solfuri',
    color: '#a3e635',
    bgClass: 'bg-lime-500/15 border-lime-500/30',
    textClass: 'text-lime-300',
  },
  green_herbaceous: {
    label: 'Verde / Erbaceo',
    short: 'Erbaceo',
    molecules: 'Aldeidi C6',
    color: '#22c55e',
    bgClass: 'bg-emerald-500/15 border-emerald-500/30',
    textClass: 'text-emerald-300',
  },
  citrus_terpenic: {
    label: 'Agrumato / Terpenico',
    short: 'Agrumi',
    molecules: 'Limonene, Terpeni',
    color: '#facc15',
    bgClass: 'bg-yellow-500/15 border-yellow-500/30',
    textClass: 'text-yellow-300',
  },
  floral: {
    label: 'Floreale',
    short: 'Floreale',
    molecules: 'Linalolo, Geraniolo',
    color: '#f472b6',
    bgClass: 'bg-pink-500/15 border-pink-500/30',
    textClass: 'text-pink-300',
  },
  fruity_ester: {
    label: 'Fruttato / Estereo',
    short: 'Fruttato',
    molecules: 'Esteri fruttati',
    color: '#fb7185',
    bgClass: 'bg-rose-500/15 border-rose-500/30',
    textClass: 'text-rose-300',
  },
  roasted_pyrazine: {
    label: 'Tostato / Maillard',
    short: 'Pirazine',
    molecules: 'Pirazine, Tiazoli',
    color: '#d97706',
    bgClass: 'bg-amber-600/20 border-amber-500/35',
    textClass: 'text-amber-300',
  },
  caramel_sweet: {
    label: 'Caramello / Maltolo',
    short: 'Caramello',
    molecules: 'Maltolo, Furaneolo',
    color: '#f59e0b',
    bgClass: 'bg-orange-500/15 border-orange-500/30',
    textClass: 'text-orange-300',
  },
  lactic_buttery: {
    label: 'Lattico / Burroso',
    short: 'Burroso',
    molecules: 'Diacetile, Lattoni',
    color: '#fde047',
    bgClass: 'bg-amber-300/15 border-amber-300/30',
    textClass: 'text-amber-200',
  },
  umami_funky: {
    label: 'Fermentato / Stagionato',
    short: 'Umami Funky',
    molecules: 'Acidi grassi, Glutammato',
    color: '#e11d48',
    bgClass: 'bg-red-500/15 border-red-500/30',
    textClass: 'text-red-300',
  },
  earthy_mineral: {
    label: 'Terroso / Minerale',
    short: 'Terroso',
    molecules: 'Geosmina, Ottenolo',
    color: '#a8a29e',
    bgClass: 'bg-stone-500/20 border-stone-400/30',
    textClass: 'text-stone-300',
  },
  spicy_phenolic: {
    label: 'Speziato / Affumicato',
    short: 'Fenolico',
    molecules: 'Guaiacolo, Eugenolo',
    color: '#ea580c',
    bgClass: 'bg-orange-600/20 border-orange-500/35',
    textClass: 'text-orange-200',
  },
  marine_iodine: {
    label: 'Marino / Iodato',
    short: 'Marino',
    molecules: 'Bromofenoli, Trimethylamine',
    color: '#06b6d4',
    bgClass: 'bg-cyan-500/15 border-cyan-500/30',
    textClass: 'text-cyan-300',
  },
};

export const CATEGORY_META: Record<IngredientCategory, { label: string; colorClass: string }> = {
  protein_meat: { label: 'Carni', colorClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  protein_fish: { label: 'Pesce', colorClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  vegetable: { label: 'Ortaggi & Funghi', colorClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  fruit: { label: 'Frutta', colorClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  dairy: { label: 'Latticini', colorClass: 'bg-amber-300/15 text-amber-200 border-amber-300/30' },
  fat: { label: 'Grassi & Oli', colorClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
  acid: { label: 'Acidi & Agrumi', colorClass: 'bg-lime-500/15 text-lime-300 border-lime-500/30' },
  herb_spice: { label: 'Erbe & Spezie', colorClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  umami_condiment: { label: 'Sale & Condimenti', colorClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
};

export const DOSAGE_META: Record<Dosage, { label: string; short: string; multiplier: number }> = {
  garnish: { label: 'Condimento', short: '0.4x', multiplier: 0.4 },
  secondary: { label: 'Comprimario', short: '0.75x', multiplier: 0.75 },
  main: { label: 'Protagonista', short: '1.2x', multiplier: 1.2 },
};

export const TEMPORAL_META: Record<TemporalPeak, { label: string; window: string }> = {
  attack: { label: 'Attacco', window: '0–2s' },
  mid: { label: 'Centro Bocca', window: '3–8s' },
  finish: { label: 'Finale', window: '8+s' },
};
