import {
  AROMA_KEYS,
  AromaVector,
  FlavorDatabase,
  Ingredient,
  MOUTHFEEL_KEYS,
  MouthfeelVector,
  PresetRecipe,
  RawIngredientInput,
  TASTE_KEYS,
  TasteVector,
  Technique,
} from '../types/flavor';
import { SPICEMASTER_INGREDIENTS } from './spicemasterIngredients';
import { ITALIAN_HISTORICAL_PRESETS } from './italianHistoricalRecipes';

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function normalizeTaste(partial?: Partial<TasteVector>): TasteVector {
  const vec = {} as TasteVector;
  for (const k of TASTE_KEYS) {
    vec[k] = clamp(Number(partial?.[k] ?? 0), 0, 10);
  }
  return vec;
}

export function normalizeMouthfeel(partial?: Partial<MouthfeelVector>): MouthfeelVector {
  const vec = {} as MouthfeelVector;
  for (const k of MOUTHFEEL_KEYS) {
    vec[k] = clamp(Number(partial?.[k] ?? 0), 0, 10);
  }
  return vec;
}

export function normalizeAromas(partial?: Partial<AromaVector>): AromaVector {
  const vec = {} as AromaVector;
  for (const k of AROMA_KEYS) {
    vec[k] = clamp(Number(partial?.[k] ?? 0), 0, 10);
  }
  return vec;
}

export function normalizeIngredient(raw: RawIngredientInput): Ingredient {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    composition: {
      water: clamp(Number(raw.composition?.water ?? 0), 0, 1),
      protein: clamp(Number(raw.composition?.protein ?? 0), 0, 1),
      carbs_sugars: clamp(Number(raw.composition?.carbs_sugars ?? 0), 0, 1),
      fat: clamp(Number(raw.composition?.fat ?? 0), 0, 1),
    },
    base_state: {
      volume: clamp(Math.round(Number(raw.base_state?.volume ?? 2)), 1, 5),
      temporal_peak: raw.base_state?.temporal_peak ?? 'mid',
      taste: normalizeTaste(raw.base_state?.taste),
      mouthfeel: normalizeMouthfeel(raw.base_state?.mouthfeel),
      aromas: normalizeAromas(raw.base_state?.aromas),
    },
  };
}

const RAW_SEED_INGREDIENTS: RawIngredientInput[] = [
  {
    id: 'ing_beef_chuck',
    name: 'Manzo (Taglio reale / arrosto)',
    category: 'protein_meat',
    composition: { water: 0.65, protein: 0.2, carbs_sugars: 0.01, fat: 0.14 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 1.0, salty: 1.0, umami: 3.5 },
      mouthfeel: { richness: 4.0, juiciness: 5.0, creaminess: 2.0 },
      aromas: { lactic_buttery: 2.5, earthy_mineral: 2.0 },
    },
  },
  {
    id: 'ing_salmon',
    name: 'Salmone fresco',
    category: 'protein_fish',
    composition: { water: 0.64, protein: 0.2, carbs_sugars: 0.0, fat: 0.15 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { sweet: 1.5, salty: 1.5, umami: 4.0 },
      mouthfeel: { richness: 6.5, juiciness: 5.5, creaminess: 6.0 },
      aromas: { marine_iodine: 5.5, green_herbaceous: 2.0, lactic_buttery: 2.5 },
    },
  },
  {
    id: 'ing_onion_yellow',
    name: 'Cipolla dorata',
    category: 'vegetable',
    composition: { water: 0.89, protein: 0.01, carbs_sugars: 0.09, fat: 0.0 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sweet: 2.5, sour: 1.0, bitter: 1.5, umami: 1.5 },
      mouthfeel: { pungency: 8.0, crunchiness: 7.0, juiciness: 5.5 },
      aromas: { sulfurous: 8.5, green_herbaceous: 3.0 },
    },
  },
  {
    id: 'ing_garlic',
    name: 'Aglio fresco',
    category: 'herb_spice',
    composition: { water: 0.59, protein: 0.06, carbs_sugars: 0.33, fat: 0.005 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { sweet: 2.0, bitter: 2.0, umami: 2.5 },
      mouthfeel: { pungency: 9.5, crunchiness: 5.0 },
      aromas: { sulfurous: 9.5, spicy_phenolic: 2.0 },
    },
  },
  {
    id: 'ing_cauliflower',
    name: 'Cavolfiore',
    category: 'vegetable',
    composition: { water: 0.92, protein: 0.02, carbs_sugars: 0.05, fat: 0.0 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 2.0, bitter: 2.5, umami: 1.5 },
      mouthfeel: { crunchiness: 7.5, astringency: 1.5, juiciness: 3.0 },
      aromas: { sulfurous: 4.5, green_herbaceous: 3.5, earthy_mineral: 2.0 },
    },
  },
  {
    id: 'ing_potato',
    name: 'Patata a pasta gialla',
    category: 'vegetable',
    composition: { water: 0.79, protein: 0.02, carbs_sugars: 0.18, fat: 0.0 },
    base_state: {
      volume: 1,
      temporal_peak: 'mid',
      taste: { sweet: 1.5, bitter: 1.0, umami: 1.0 },
      mouthfeel: { crunchiness: 6.5, astringency: 2.5 },
      aromas: { earthy_mineral: 5.0, green_herbaceous: 1.5 },
    },
  },
  {
    id: 'ing_mushroom_porcini',
    name: 'Funghi Porcini / Cremini',
    category: 'vegetable',
    composition: { water: 0.9, protein: 0.03, carbs_sugars: 0.04, fat: 0.005 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { sweet: 1.5, umami: 6.5, bitter: 1.0 },
      mouthfeel: { juiciness: 4.5, creaminess: 3.0 },
      aromas: { earthy_mineral: 8.5, umami_funky: 6.0, roasted_pyrazine: 1.5 },
    },
  },
  {
    id: 'ing_apple_granny',
    name: 'Mela Granny Smith',
    category: 'fruit',
    composition: { water: 0.86, protein: 0.0, carbs_sugars: 0.13, fat: 0.0 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sweet: 4.5, sour: 7.0, bitter: 1.0 },
      mouthfeel: { crunchiness: 8.5, juiciness: 8.0, astringency: 2.5 },
      aromas: { fruity_ester: 7.5, green_herbaceous: 5.5, floral: 2.0 },
    },
  },
  {
    id: 'ing_butter',
    name: 'Burro vaccino',
    category: 'dairy',
    composition: { water: 0.16, protein: 0.01, carbs_sugars: 0.01, fat: 0.82 },
    base_state: {
      volume: 2,
      temporal_peak: 'finish',
      taste: { sweet: 2.0, salty: 0.5, umami: 1.0 },
      mouthfeel: { richness: 9.0, creaminess: 8.5 },
      aromas: { lactic_buttery: 8.5, fruity_ester: 1.5 },
    },
  },
  {
    id: 'ing_parmigiano',
    name: 'Parmigiano Reggiano 24 mesi',
    category: 'dairy',
    composition: { water: 0.3, protein: 0.33, carbs_sugars: 0.0, fat: 0.29 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { salty: 6.5, umami: 9.5, sweet: 1.5, sour: 1.5 },
      mouthfeel: { richness: 7.0, crunchiness: 3.5, creaminess: 4.0 },
      aromas: { umami_funky: 8.5, lactic_buttery: 6.0, fruity_ester: 3.5, roasted_pyrazine: 2.5 },
    },
  },
  {
    id: 'ing_evoo',
    name: "Olio Extravergine d'Oliva (Fruttato Intenso)",
    category: 'fat',
    composition: { water: 0.0, protein: 0.0, carbs_sugars: 0.0, fat: 1.0 },
    base_state: {
      volume: 3,
      temporal_peak: 'finish',
      taste: { bitter: 4.5 },
      mouthfeel: { richness: 8.5, pungency: 4.5, astringency: 2.0 },
      aromas: { green_herbaceous: 8.0, fruity_ester: 3.5, citrus_terpenic: 1.5 },
    },
  },
  {
    id: 'ing_lemon',
    name: 'Limone (Succo e Scorza)',
    category: 'acid',
    composition: { water: 0.89, protein: 0.01, carbs_sugars: 0.09, fat: 0.0 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { sour: 9.5, sweet: 1.5, bitter: 2.0 },
      mouthfeel: { juiciness: 9.0, astringency: 3.0 },
      aromas: { citrus_terpenic: 9.5, floral: 3.5, green_herbaceous: 2.0 },
    },
  },
  {
    id: 'ing_apple_vinegar',
    name: 'Aceto di Mele non filtrato',
    category: 'acid',
    composition: { water: 0.94, protein: 0.0, carbs_sugars: 0.01, fat: 0.0 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sour: 8.5, sweet: 2.0, bitter: 0.5 },
      mouthfeel: { astringency: 3.5, juiciness: 7.0 },
      aromas: { fruity_ester: 7.0, caramel_sweet: 2.0, umami_funky: 2.5 },
    },
  },
  {
    id: 'ing_rosemary',
    name: 'Rosmarino fresco',
    category: 'herb_spice',
    composition: { water: 0.68, protein: 0.03, carbs_sugars: 0.2, fat: 0.06 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { bitter: 4.0 },
      mouthfeel: { astringency: 3.5, pungency: 2.5, crunchiness: 3.0 },
      aromas: { citrus_terpenic: 8.5, green_herbaceous: 6.5, spicy_phenolic: 4.0, earthy_mineral: 2.5 },
    },
  },
  {
    id: 'ing_sea_salt',
    name: 'Sale Marino Integrale (Fiocchi)',
    category: 'umami_condiment',
    composition: { water: 0.02, protein: 0.0, carbs_sugars: 0.0, fat: 0.0 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { salty: 10.0 },
      mouthfeel: { crunchiness: 6.0, juiciness: 2.0 },
      aromas: { marine_iodine: 1.5, earthy_mineral: 2.0 },
    },
  },
  {
    id: 'ing_tomato_sanmarzano',
    name: 'Pomodoro San Marzano maturo',
    category: 'vegetable',
    composition: { water: 0.94, protein: 0.01, carbs_sugars: 0.04, fat: 0.002 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sweet: 3.5, sour: 5.5, salty: 0.5, bitter: 0.5, umami: 5.5 },
      mouthfeel: { juiciness: 9.0, crunchiness: 2.0, astringency: 1.5, creaminess: 2.0 },
      aromas: { green_herbaceous: 6.5, fruity_ester: 6.0, floral: 2.0, earthy_mineral: 1.5 },
    },
  },
  {
    id: 'ing_anchovy_salted',
    name: "Acciuga del Cantabrico sott'olio",
    category: 'protein_fish',
    composition: { water: 0.5, protein: 0.29, carbs_sugars: 0.0, fat: 0.13 },
    base_state: {
      volume: 5,
      temporal_peak: 'mid',
      taste: { salty: 9.0, umami: 9.5, bitter: 1.0 },
      mouthfeel: { richness: 6.5, creaminess: 5.0, juiciness: 3.0 },
      aromas: { umami_funky: 8.5, marine_iodine: 7.5, roasted_pyrazine: 1.5 },
    },
  },
  {
    id: 'ing_pork_guanciale',
    name: 'Guanciale stagionato',
    category: 'protein_meat',
    composition: { water: 0.22, protein: 0.09, carbs_sugars: 0.0, fat: 0.68 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { salty: 6.5, umami: 6.0, sweet: 1.5 },
      mouthfeel: { richness: 9.5, creaminess: 5.5, pungency: 2.5 },
      aromas: { umami_funky: 6.5, lactic_buttery: 4.5, spicy_phenolic: 4.0 },
    },
  },
  {
    id: 'ing_octopus',
    name: 'Polpo verace',
    category: 'protein_fish',
    composition: { water: 0.8, protein: 0.15, carbs_sugars: 0.02, fat: 0.01 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 2.5, salty: 2.5, umami: 4.5 },
      mouthfeel: { juiciness: 5.0, crunchiness: 4.0, richness: 2.0 },
      aromas: { marine_iodine: 6.5, earthy_mineral: 2.5 },
    },
  },
  {
    id: 'ing_eggplant',
    name: 'Melanzana viola',
    category: 'vegetable',
    composition: { water: 0.92, protein: 0.01, carbs_sugars: 0.06, fat: 0.002 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { bitter: 4.5, sweet: 1.5, umami: 1.5 },
      mouthfeel: { astringency: 4.5, crunchiness: 3.0, creaminess: 2.0 },
      aromas: { green_herbaceous: 4.5, earthy_mineral: 3.5, fruity_ester: 1.5 },
    },
  },
  {
    id: 'ing_fennel',
    name: 'Finocchio fresco',
    category: 'vegetable',
    composition: { water: 0.9, protein: 0.01, carbs_sugars: 0.07, fat: 0.002 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sweet: 4.0, bitter: 1.0 },
      mouthfeel: { crunchiness: 8.5, juiciness: 7.5, astringency: 1.0 },
      aromas: { spicy_phenolic: 6.5, green_herbaceous: 5.5, citrus_terpenic: 3.5, floral: 2.5 },
    },
  },
  {
    id: 'ing_capers',
    name: 'Capperi di Pantelleria dissalati',
    category: 'umami_condiment',
    composition: { water: 0.83, protein: 0.02, carbs_sugars: 0.05, fat: 0.01 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { salty: 6.5, sour: 4.0, bitter: 3.5, umami: 3.0 },
      mouthfeel: { pungency: 3.5, astringency: 3.0, juiciness: 4.0 },
      aromas: { floral: 6.0, green_herbaceous: 5.5, sulfurous: 3.5, citrus_terpenic: 3.0 },
    },
  },
  {
    id: 'ing_pecorino',
    name: 'Pecorino Romano DOP',
    category: 'dairy',
    composition: { water: 0.32, protein: 0.32, carbs_sugars: 0.0, fat: 0.31 },
    base_state: {
      volume: 5,
      temporal_peak: 'finish',
      taste: { salty: 8.5, umami: 8.5, sour: 2.0, bitter: 1.0 },
      mouthfeel: { richness: 7.5, pungency: 4.5, astringency: 2.0, crunchiness: 2.5 },
      aromas: { umami_funky: 9.0, lactic_buttery: 5.5, earthy_mineral: 3.0 },
    },
  },
  {
    id: 'ing_ricotta_sheep',
    name: 'Ricotta di pecora fresca',
    category: 'dairy',
    composition: { water: 0.72, protein: 0.09, carbs_sugars: 0.04, fat: 0.14 },
    base_state: {
      volume: 1,
      temporal_peak: 'mid',
      taste: { sweet: 3.5, salty: 1.0, umami: 1.5, sour: 1.0 },
      mouthfeel: { creaminess: 9.0, richness: 6.5, juiciness: 4.5 },
      aromas: { lactic_buttery: 8.0, floral: 1.5, green_herbaceous: 1.0 },
    },
  },
  {
    id: 'ing_hazelnut',
    name: 'Nocciola Piemonte IGP (Cruda)',
    category: 'fat',
    composition: { water: 0.05, protein: 0.15, carbs_sugars: 0.17, fat: 0.61 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 3.0, bitter: 1.5, umami: 1.0 },
      mouthfeel: { crunchiness: 8.5, richness: 7.0, astringency: 2.5, creaminess: 3.0 },
      aromas: { lactic_buttery: 4.0, earthy_mineral: 3.5, roasted_pyrazine: 2.0, green_herbaceous: 2.5 },
    },
  },
  {
    id: 'ing_basil',
    name: 'Basilico Genovese fresco',
    category: 'herb_spice',
    composition: { water: 0.92, protein: 0.03, carbs_sugars: 0.02, fat: 0.006 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sweet: 1.5, bitter: 1.5 },
      mouthfeel: { juiciness: 3.0, astringency: 1.0 },
      aromas: { floral: 7.5, green_herbaceous: 8.0, spicy_phenolic: 5.5, citrus_terpenic: 3.5 },
    },
  },
  {
    id: 'ing_sage',
    name: 'Salvia fresca',
    category: 'herb_spice',
    composition: { water: 0.8, protein: 0.03, carbs_sugars: 0.12, fat: 0.02 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { bitter: 4.0 },
      mouthfeel: { astringency: 4.5, pungency: 2.0 },
      aromas: { citrus_terpenic: 7.5, green_herbaceous: 7.0, earthy_mineral: 4.0, floral: 2.5 },
    },
  },
  {
    id: 'ing_chili_peperoncino',
    name: 'Peperoncino rosso fresco',
    category: 'herb_spice',
    composition: { water: 0.88, protein: 0.02, carbs_sugars: 0.09, fat: 0.004 },
    base_state: {
      volume: 5,
      temporal_peak: 'finish',
      taste: { sweet: 2.0, bitter: 1.5 },
      mouthfeel: { pungency: 9.5, crunchiness: 4.5, juiciness: 3.5 },
      aromas: { green_herbaceous: 5.0, fruity_ester: 4.5, spicy_phenolic: 3.0 },
    },
  },
  {
    id: 'ing_black_pepper',
    name: 'Pepe nero Tellicherry in grani',
    category: 'herb_spice',
    composition: { water: 0.12, protein: 0.1, carbs_sugars: 0.64, fat: 0.03 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { bitter: 2.5 },
      mouthfeel: { pungency: 8.0, crunchiness: 5.0, astringency: 2.0 },
      aromas: { citrus_terpenic: 8.0, spicy_phenolic: 6.5, earthy_mineral: 4.5, floral: 2.5 },
    },
  },
  {
    id: 'ing_ginger',
    name: 'Zenzero fresco (Rizoma)',
    category: 'herb_spice',
    composition: { water: 0.79, protein: 0.02, carbs_sugars: 0.18, fat: 0.008 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sweet: 1.5, sour: 1.0, bitter: 2.0 },
      mouthfeel: { pungency: 8.0, juiciness: 6.5, crunchiness: 5.5, astringency: 2.0 },
      aromas: { citrus_terpenic: 9.0, spicy_phenolic: 5.5, floral: 3.0, earthy_mineral: 2.5 },
    },
  },
  {
    id: 'ing_cinnamon',
    name: 'Cannella di Ceylon',
    category: 'herb_spice',
    composition: { water: 0.11, protein: 0.04, carbs_sugars: 0.8, fat: 0.01 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { sweet: 3.5, bitter: 2.0 },
      mouthfeel: { astringency: 4.0, pungency: 3.0 },
      aromas: { spicy_phenolic: 9.5, citrus_terpenic: 4.0, floral: 3.5, caramel_sweet: 3.0 },
    },
  },
  {
    id: 'ing_cumin',
    name: 'Cumino in semi',
    category: 'herb_spice',
    composition: { water: 0.08, protein: 0.18, carbs_sugars: 0.44, fat: 0.22 },
    base_state: {
      volume: 5,
      temporal_peak: 'mid',
      taste: { bitter: 3.5, umami: 1.0 },
      mouthfeel: { pungency: 3.0, astringency: 2.5, crunchiness: 3.5 },
      aromas: { earthy_mineral: 8.0, citrus_terpenic: 7.0, spicy_phenolic: 6.5, umami_funky: 3.5 },
    },
  },
  {
    id: 'ing_saffron',
    name: 'Zafferano in pistilli',
    category: 'herb_spice',
    composition: { water: 0.12, protein: 0.11, carbs_sugars: 0.65, fat: 0.06 },
    base_state: {
      volume: 5,
      temporal_peak: 'finish',
      taste: { bitter: 5.5, sweet: 1.5 },
      mouthfeel: { astringency: 2.5 },
      aromas: { floral: 7.0, earthy_mineral: 6.5, marine_iodine: 4.5, spicy_phenolic: 5.0, caramel_sweet: 3.0 },
    },
  },
  {
    id: 'ing_soy_sauce',
    name: 'Salsa di Soia a fermentazione naturale',
    category: 'umami_condiment',
    composition: { water: 0.68, protein: 0.08, carbs_sugars: 0.06, fat: 0.0 },
    base_state: {
      volume: 5,
      temporal_peak: 'mid',
      taste: { salty: 9.0, umami: 9.5, sweet: 2.0, sour: 2.5, bitter: 1.5 },
      mouthfeel: { juiciness: 7.0, richness: 3.0 },
      aromas: { umami_funky: 8.5, caramel_sweet: 5.5, roasted_pyrazine: 5.0, spicy_phenolic: 3.5, fruity_ester: 2.5 },
    },
  },
  {
    id: 'ing_miso_white',
    name: 'Shiro Miso (Miso bianco dolce)',
    category: 'umami_condiment',
    composition: { water: 0.45, protein: 0.1, carbs_sugars: 0.36, fat: 0.04 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { salty: 6.5, umami: 8.0, sweet: 5.5, sour: 1.5 },
      mouthfeel: { creaminess: 7.5, richness: 5.5 },
      aromas: { umami_funky: 6.5, caramel_sweet: 5.5, fruity_ester: 4.0, lactic_buttery: 3.5 },
    },
  },
  {
    id: 'ing_balsamic_aged',
    name: 'Aceto Balsamico Tradizionale invecchiato',
    category: 'acid',
    composition: { water: 0.25, protein: 0.01, carbs_sugars: 0.7, fat: 0.0 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { sweet: 7.5, sour: 7.5, umami: 3.5, bitter: 1.5 },
      mouthfeel: { richness: 7.0, creaminess: 6.5, astringency: 3.0 },
      aromas: { caramel_sweet: 8.0, fruity_ester: 7.5, spicy_phenolic: 6.0, umami_funky: 3.5 },
    },
  },
  {
    id: 'ing_red_wine_dry',
    name: 'Vino Rosso secco strutturato',
    category: 'acid',
    composition: { water: 0.86, protein: 0.001, carbs_sugars: 0.02, fat: 0.0 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { sour: 6.5, bitter: 3.5, sweet: 1.0 },
      mouthfeel: { astringency: 8.0, juiciness: 8.0, pungency: 2.5 },
      aromas: { fruity_ester: 7.5, spicy_phenolic: 5.5, floral: 3.5, earthy_mineral: 3.0 },
    },
  },
  {
    id: 'ing_dark_chocolate_85',
    name: 'Cioccolato Fondente 85%',
    category: 'fat',
    composition: { water: 0.01, protein: 0.1, carbs_sugars: 0.2, fat: 0.52 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { bitter: 7.5, sweet: 2.5, sour: 2.0, umami: 1.0 },
      mouthfeel: { richness: 8.0, astringency: 6.5, creaminess: 6.0, crunchiness: 5.0 },
      aromas: { roasted_pyrazine: 9.0, earthy_mineral: 5.0, fruity_ester: 3.5, caramel_sweet: 3.0, spicy_phenolic: 2.5 },
    },
  },
  {
    id: 'ing_coffee_espresso',
    name: 'Caffè Arabica tostato (Riduzione/Polvere)',
    category: 'herb_spice',
    composition: { water: 0.03, protein: 0.13, carbs_sugars: 0.4, fat: 0.15 },
    base_state: {
      volume: 5,
      temporal_peak: 'finish',
      taste: { bitter: 8.5, sour: 3.5, sweet: 1.0, umami: 1.5 },
      mouthfeel: { astringency: 5.5, richness: 3.0 },
      aromas: { roasted_pyrazine: 9.5, caramel_sweet: 4.5, spicy_phenolic: 5.0, earthy_mineral: 4.0, fruity_ester: 2.5 },
    },
  },
  {
    id: 'ing_honey_chestnut',
    name: 'Miele di Castagno',
    category: 'umami_condiment',
    composition: { water: 0.17, protein: 0.005, carbs_sugars: 0.82, fat: 0.0 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { sweet: 8.0, bitter: 4.5, salty: 0.5 },
      mouthfeel: { richness: 6.5, creaminess: 7.5, astringency: 3.0 },
      aromas: { floral: 5.5, caramel_sweet: 6.0, earthy_mineral: 5.5, spicy_phenolic: 4.5, umami_funky: 2.0 },
    },
  },
  {
    id: 'ing_duck_breast',
    name: "Petto d'Anatra (Magret con pelle)",
    category: 'protein_meat',
    composition: { water: 0.54, protein: 0.19, carbs_sugars: 0.0, fat: 0.26 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { sweet: 1.5, salty: 1.0, bitter: 1.0, umami: 5.0 },
      mouthfeel: { richness: 8.0, juiciness: 6.0, creaminess: 3.5 },
      aromas: { earthy_mineral: 5.0, umami_funky: 4.0, lactic_buttery: 3.0, fruity_ester: 1.5 },
    },
  },
  {
    id: 'ing_pork_belly',
    name: 'Pancetta fresca / Pancia di Maiale',
    category: 'protein_meat',
    composition: { water: 0.37, protein: 0.1, carbs_sugars: 0.0, fat: 0.52 },
    base_state: {
      volume: 3,
      temporal_peak: 'finish',
      taste: { sweet: 2.5, salty: 1.0, umami: 3.5 },
      mouthfeel: { richness: 9.0, creaminess: 6.5, juiciness: 5.0 },
      aromas: { lactic_buttery: 5.0, fruity_ester: 2.0, umami_funky: 2.5 },
    },
  },
  {
    id: 'ing_lamb_rack',
    name: 'Carré di Agnello',
    category: 'protein_meat',
    composition: { water: 0.58, protein: 0.2, carbs_sugars: 0.0, fat: 0.21 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { sweet: 1.5, salty: 1.5, umami: 4.5 },
      mouthfeel: { richness: 7.5, juiciness: 5.5, creaminess: 3.5 },
      aromas: { umami_funky: 7.0, green_herbaceous: 3.5, lactic_buttery: 4.5, earthy_mineral: 3.0 },
    },
  },
  {
    id: 'ing_chicken_thigh',
    name: 'Sovracoscia di Pollo ruspante (con pelle)',
    category: 'protein_meat',
    composition: { water: 0.66, protein: 0.18, carbs_sugars: 0.0, fat: 0.15 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 1.5, salty: 1.0, umami: 3.5 },
      mouthfeel: { richness: 5.0, juiciness: 6.5, creaminess: 3.5 },
      aromas: { lactic_buttery: 3.5, sulfurous: 2.0 },
    },
  },
  {
    id: 'ing_red_prawn',
    name: 'Gambero Rosso di Mazara',
    category: 'protein_fish',
    composition: { water: 0.76, protein: 0.2, carbs_sugars: 0.01, fat: 0.02 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sweet: 6.5, salty: 3.0, umami: 6.5 },
      mouthfeel: { creaminess: 7.5, juiciness: 6.5, richness: 4.5 },
      aromas: { marine_iodine: 7.5, floral: 2.5, caramel_sweet: 2.5, lactic_buttery: 3.0 },
    },
  },
  {
    id: 'ing_scallop',
    name: 'Capasanta (Noce)',
    category: 'protein_fish',
    composition: { water: 0.78, protein: 0.17, carbs_sugars: 0.03, fat: 0.01 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 5.5, salty: 2.0, umami: 5.0 },
      mouthfeel: { creaminess: 7.0, juiciness: 6.0, richness: 3.0 },
      aromas: { marine_iodine: 4.5, lactic_buttery: 3.5, caramel_sweet: 2.0 },
    },
  },
  {
    id: 'ing_cod_baccala',
    name: 'Baccalà dissalato (Filetto alto)',
    category: 'protein_fish',
    composition: { water: 0.75, protein: 0.21, carbs_sugars: 0.0, fat: 0.01 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { salty: 5.5, umami: 6.0, sweet: 1.0 },
      mouthfeel: { juiciness: 5.5, creaminess: 5.0, richness: 3.5 },
      aromas: { marine_iodine: 5.5, umami_funky: 4.5, lactic_buttery: 2.0 },
    },
  },
  {
    id: 'ing_egg_yolk',
    name: "Tuorlo d'Uovo di gallina",
    category: 'dairy',
    composition: { water: 0.52, protein: 0.16, carbs_sugars: 0.03, fat: 0.27 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 2.0, salty: 1.0, umami: 4.0 },
      mouthfeel: { richness: 9.0, creaminess: 9.5 },
      aromas: { sulfurous: 3.5, lactic_buttery: 5.5, earthy_mineral: 2.0 },
    },
  },
  {
    id: 'ing_rice_carnaroli',
    name: 'Riso Carnaroli',
    category: 'vegetable',
    composition: { water: 0.12, protein: 0.07, carbs_sugars: 0.79, fat: 0.01 },
    base_state: {
      volume: 1,
      temporal_peak: 'mid',
      taste: { sweet: 2.5, umami: 1.0 },
      mouthfeel: { crunchiness: 9.0, creaminess: 1.0 },
      aromas: { floral: 2.0, lactic_buttery: 2.0, earthy_mineral: 2.5 },
    },
  },
  {
    id: 'ing_pasta_semolina',
    name: 'Pasta di Semola di Grano Duro (Cotta al dente)',
    category: 'vegetable',
    composition: { water: 0.62, protein: 0.05, carbs_sugars: 0.31, fat: 0.01 },
    base_state: {
      volume: 1,
      temporal_peak: 'mid',
      taste: { sweet: 2.5, salty: 2.0, umami: 1.5 },
      mouthfeel: { crunchiness: 3.5, creaminess: 4.5, richness: 2.0 },
      aromas: { roasted_pyrazine: 2.5, lactic_buttery: 2.0, caramel_sweet: 1.5 },
    },
  },
  {
    id: 'ing_pumpkin_delica',
    name: 'Zucca Delica / Mantovana',
    category: 'vegetable',
    composition: { water: 0.82, protein: 0.02, carbs_sugars: 0.15, fat: 0.005 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 6.5, umami: 1.5, bitter: 0.5 },
      mouthfeel: { crunchiness: 6.0, creaminess: 4.0 },
      aromas: { caramel_sweet: 4.5, earthy_mineral: 3.5, floral: 2.0, roasted_pyrazine: 2.0 },
    },
  },
  {
    id: 'ing_asparagus_green',
    name: 'Asparago verde',
    category: 'vegetable',
    composition: { water: 0.93, protein: 0.02, carbs_sugars: 0.04, fat: 0.002 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { bitter: 3.5, sweet: 2.5, umami: 3.0 },
      mouthfeel: { crunchiness: 7.5, juiciness: 5.5, astringency: 2.5 },
      aromas: { green_herbaceous: 8.0, sulfurous: 5.5, earthy_mineral: 3.5, roasted_pyrazine: 2.0 },
    },
  },
  {
    id: 'ing_radicchio_treviso',
    name: 'Radicchio Rosso di Treviso IGP',
    category: 'vegetable',
    composition: { water: 0.94, protein: 0.01, carbs_sugars: 0.04, fat: 0.002 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { bitter: 8.0, sweet: 1.5, sour: 1.0 },
      mouthfeel: { crunchiness: 8.0, astringency: 5.0, juiciness: 5.0 },
      aromas: { green_herbaceous: 5.5, earthy_mineral: 4.0, floral: 2.0 },
    },
  },
  {
    id: 'ing_artichoke',
    name: 'Carciofo spinoso (Cuore)',
    category: 'vegetable',
    composition: { water: 0.85, protein: 0.03, carbs_sugars: 0.1, fat: 0.002 },
    base_state: {
      volume: 3,
      temporal_peak: 'finish',
      taste: { bitter: 6.0, sweet: 3.0, umami: 2.5 },
      mouthfeel: { astringency: 7.5, crunchiness: 6.5 },
      aromas: { green_herbaceous: 6.5, earthy_mineral: 5.5, floral: 2.5 },
    },
  },
  {
    id: 'ing_beetroot',
    name: 'Barbabietola rossa',
    category: 'vegetable',
    composition: { water: 0.88, protein: 0.02, carbs_sugars: 0.1, fat: 0.002 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { sweet: 6.5, bitter: 1.5, umami: 1.5 },
      mouthfeel: { crunchiness: 7.5, juiciness: 6.0, astringency: 2.0 },
      aromas: { earthy_mineral: 9.5, fruity_ester: 2.5, caramel_sweet: 2.0 },
    },
  },
  {
    id: 'ing_celery',
    name: 'Sedano verde croccante',
    category: 'vegetable',
    composition: { water: 0.95, protein: 0.01, carbs_sugars: 0.03, fat: 0.002 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { salty: 2.5, bitter: 3.0, sweet: 1.5, umami: 2.0 },
      mouthfeel: { crunchiness: 9.0, juiciness: 8.0, astringency: 1.5 },
      aromas: { green_herbaceous: 7.5, spicy_phenolic: 5.0, citrus_terpenic: 4.0, earthy_mineral: 3.0 },
    },
  },
  {
    id: 'ing_burrata',
    name: 'Burrata Pugliese / Stracciatella',
    category: 'dairy',
    composition: { water: 0.62, protein: 0.11, carbs_sugars: 0.02, fat: 0.24 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 4.0, salty: 2.0, sour: 1.5, umami: 2.0 },
      mouthfeel: { creaminess: 9.5, richness: 8.5, juiciness: 7.0 },
      aromas: { lactic_buttery: 9.0, floral: 2.0, green_herbaceous: 1.5 },
    },
  },
  {
    id: 'ing_gorgonzola_piccante',
    name: 'Gorgonzola DOP Piccante (Erborinato)',
    category: 'dairy',
    composition: { water: 0.42, protein: 0.2, carbs_sugars: 0.01, fat: 0.33 },
    base_state: {
      volume: 5,
      temporal_peak: 'finish',
      taste: { salty: 7.0, umami: 8.5, bitter: 3.5, sweet: 1.5 },
      mouthfeel: { richness: 8.5, creaminess: 7.0, pungency: 6.0 },
      aromas: { umami_funky: 9.5, lactic_buttery: 6.0, fruity_ester: 4.5, earthy_mineral: 4.5 },
    },
  },
  {
    id: 'ing_orange_tarocco',
    name: 'Arancia Tarocco (Succo e Scorza)',
    category: 'fruit',
    composition: { water: 0.87, protein: 0.01, carbs_sugars: 0.12, fat: 0.002 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sweet: 6.5, sour: 5.5, bitter: 2.0 },
      mouthfeel: { juiciness: 9.0, astringency: 1.5 },
      aromas: { citrus_terpenic: 9.0, floral: 5.5, fruity_ester: 6.5 },
    },
  },
  {
    id: 'ing_raspberry',
    name: 'Lampone fresco',
    category: 'fruit',
    composition: { water: 0.86, protein: 0.01, carbs_sugars: 0.12, fat: 0.006 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sour: 7.5, sweet: 4.5, bitter: 1.0 },
      mouthfeel: { juiciness: 7.5, astringency: 3.0, crunchiness: 2.5 },
      aromas: { fruity_ester: 8.5, floral: 7.5, citrus_terpenic: 3.5, green_herbaceous: 2.0 },
    },
  },
  {
    id: 'ing_pear_williams',
    name: 'Pera Williams matura',
    category: 'fruit',
    composition: { water: 0.84, protein: 0.004, carbs_sugars: 0.15, fat: 0.001 },
    base_state: {
      volume: 2,
      temporal_peak: 'attack',
      taste: { sweet: 7.0, sour: 2.0 },
      mouthfeel: { juiciness: 8.5, creaminess: 5.0, crunchiness: 3.5, astringency: 1.5 },
      aromas: { fruity_ester: 9.0, floral: 4.5, spicy_phenolic: 1.5 },
    },
  },
  {
    id: 'ing_coconut_milk',
    name: 'Latte di Cocco (18% grassi)',
    category: 'fat',
    composition: { water: 0.73, protein: 0.02, carbs_sugars: 0.06, fat: 0.18 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { sweet: 4.5, umami: 1.0 },
      mouthfeel: { richness: 8.0, creaminess: 8.5 },
      aromas: { lactic_buttery: 7.5, caramel_sweet: 4.5, floral: 3.0, fruity_ester: 3.0 },
    },
  },
  {
    id: 'ing_walnut',
    name: 'Noce di Sorrento (Gheriglio)',
    category: 'fat',
    composition: { water: 0.04, protein: 0.15, carbs_sugars: 0.14, fat: 0.65 },
    base_state: {
      volume: 3,
      temporal_peak: 'finish',
      taste: { bitter: 4.5, sweet: 2.0, umami: 1.5 },
      mouthfeel: { crunchiness: 7.5, richness: 7.5, astringency: 6.0 },
      aromas: { earthy_mineral: 5.0, roasted_pyrazine: 3.5, spicy_phenolic: 3.5, lactic_buttery: 3.0 },
    },
  },
  {
    id: 'ing_mint',
    name: 'Menta Piperita fresca',
    category: 'herb_spice',
    composition: { water: 0.86, protein: 0.03, carbs_sugars: 0.08, fat: 0.007 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sweet: 1.5, bitter: 2.0 },
      mouthfeel: { pungency: 5.5, astringency: 2.0 },
      aromas: { green_herbaceous: 8.5, citrus_terpenic: 7.5, floral: 3.5 },
    },
  },
  {
    id: 'ing_thyme',
    name: 'Timo limone / volgare fresco',
    category: 'herb_spice',
    composition: { water: 0.65, protein: 0.05, carbs_sugars: 0.24, fat: 0.017 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { bitter: 3.0 },
      mouthfeel: { astringency: 2.5, pungency: 2.0 },
      aromas: { spicy_phenolic: 7.5, citrus_terpenic: 7.0, earthy_mineral: 5.0, green_herbaceous: 5.5 },
    },
  },
  {
    id: 'ing_vanilla_bourbon',
    name: 'Vaniglia Bourbon (Bacche)',
    category: 'herb_spice',
    composition: { water: 0.25, protein: 0.04, carbs_sugars: 0.55, fat: 0.08 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { sweet: 3.5, bitter: 2.0 },
      mouthfeel: { richness: 3.5, creaminess: 3.0 },
      aromas: { spicy_phenolic: 9.0, caramel_sweet: 8.0, floral: 5.5, lactic_buttery: 4.0, fruity_ester: 3.0 },
    },
  },
  {
    id: 'ing_mustard_dijon',
    name: 'Senape di Digione forte',
    category: 'umami_condiment',
    composition: { water: 0.66, protein: 0.07, carbs_sugars: 0.06, fat: 0.11 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { sour: 6.5, salty: 6.0, bitter: 3.5, umami: 2.0 },
      mouthfeel: { pungency: 8.5, creaminess: 6.5, richness: 4.0, astringency: 2.5 },
      aromas: { sulfurous: 7.5, citrus_terpenic: 3.0, spicy_phenolic: 3.5 },
    },
  },
  {
    id: 'ing_colatura_alici',
    name: 'Colatura di Alici di Cetara DOP',
    category: 'umami_condiment',
    composition: { water: 0.65, protein: 0.14, carbs_sugars: 0.0, fat: 0.01 },
    base_state: {
      volume: 5,
      temporal_peak: 'mid',
      taste: { salty: 9.5, umami: 10.0, bitter: 1.0 },
      mouthfeel: { richness: 4.0, juiciness: 6.0 },
      aromas: { umami_funky: 9.5, marine_iodine: 8.0, caramel_sweet: 2.0, roasted_pyrazine: 2.0 },
    },
  },
  {
    id: 'ing_black_truffle',
    name: 'Tartufo Nero Pregiato (Norcia)',
    category: 'umami_condiment',
    composition: { water: 0.76, protein: 0.08, carbs_sugars: 0.13, fat: 0.005 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { umami: 7.0, sweet: 1.5, bitter: 1.5 },
      mouthfeel: { crunchiness: 3.5, richness: 3.0 },
      aromas: { sulfurous: 8.5, earthy_mineral: 9.5, umami_funky: 7.5, roasted_pyrazine: 3.5, floral: 2.0 },
    },
  },
  {
    id: 'ing_white_wine_dry',
    name: 'Vino Bianco secco minerale',
    category: 'acid',
    composition: { water: 0.87, protein: 0.001, carbs_sugars: 0.01, fat: 0.0 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sour: 7.5, sweet: 1.0, bitter: 1.5, salty: 1.0 },
      mouthfeel: { juiciness: 8.5, astringency: 2.5 },
      aromas: { fruity_ester: 7.0, citrus_terpenic: 5.5, floral: 5.0, earthy_mineral: 3.5 },
    },
  },
  // ==========================================
  // LATTICINI & FORMAGGI (Estensione completa)
  // ==========================================
  {
    id: 'ing_whole_milk',
    name: 'Latte intero fresco',
    category: 'dairy',
    composition: { water: 0.87, protein: 0.033, carbs_sugars: 0.048, fat: 0.036 },
    base_state: {
      volume: 1,
      temporal_peak: 'mid',
      taste: { sweet: 2.5, salty: 0.5, umami: 0.5 },
      mouthfeel: { creaminess: 4.5, richness: 3.0, juiciness: 7.5 },
      aromas: { lactic_buttery: 5.5, caramel_sweet: 1.0 },
    },
  },
  {
    id: 'ing_heavy_cream',
    name: 'Panna fresca liquida (35% grassi)',
    category: 'dairy',
    composition: { water: 0.58, protein: 0.021, carbs_sugars: 0.028, fat: 0.35 },
    base_state: {
      volume: 2,
      temporal_peak: 'finish',
      taste: { sweet: 3.0, salty: 0.5, umami: 0.5 },
      mouthfeel: { richness: 8.5, creaminess: 9.0, juiciness: 4.0 },
      aromas: { lactic_buttery: 8.0, caramel_sweet: 1.5, floral: 1.0 },
    },
  },
  {
    id: 'ing_mozzarella_bufala',
    name: 'Mozzarella di Bufala Campana DOP',
    category: 'dairy',
    composition: { water: 0.56, protein: 0.16, carbs_sugars: 0.01, fat: 0.24 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 2.5, sour: 1.5, salty: 2.5, umami: 2.0 },
      mouthfeel: { richness: 6.5, creaminess: 7.5, juiciness: 7.5 },
      aromas: { lactic_buttery: 7.5, green_herbaceous: 1.5, umami_funky: 1.5 },
    },
  },
  {
    id: 'ing_mascarpone',
    name: 'Mascarpone artigianale',
    category: 'dairy',
    composition: { water: 0.45, protein: 0.05, carbs_sugars: 0.03, fat: 0.45 },
    base_state: {
      volume: 2,
      temporal_peak: 'finish',
      taste: { sweet: 3.5, sour: 1.0, salty: 0.5 },
      mouthfeel: { richness: 9.5, creaminess: 10.0 },
      aromas: { lactic_buttery: 8.5, caramel_sweet: 2.0, fruity_ester: 1.0 },
    },
  },
  {
    id: 'ing_greek_yogurt',
    name: 'Yogurt greco intero colato (10%)',
    category: 'dairy',
    composition: { water: 0.77, protein: 0.09, carbs_sugars: 0.04, fat: 0.1 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sour: 6.0, sweet: 2.0, salty: 1.0 },
      mouthfeel: { creaminess: 8.0, richness: 5.0, astringency: 1.5, juiciness: 4.5 },
      aromas: { lactic_buttery: 7.0, citrus_terpenic: 2.0, fruity_ester: 2.0 },
    },
  },
  {
    id: 'ing_creme_fraiche',
    name: 'Crème fraîche / Panna acida',
    category: 'dairy',
    composition: { water: 0.6, protein: 0.025, carbs_sugars: 0.03, fat: 0.34 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { sour: 4.5, sweet: 2.5, salty: 0.5, umami: 1.0 },
      mouthfeel: { richness: 8.5, creaminess: 9.0 },
      aromas: { lactic_buttery: 8.5, fruity_ester: 2.0, umami_funky: 1.5 },
    },
  },
  {
    id: 'ing_taleggio',
    name: 'Taleggio DOP (Crosta lavata)',
    category: 'dairy',
    composition: { water: 0.48, protein: 0.19, carbs_sugars: 0.01, fat: 0.27 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { salty: 4.5, umami: 6.5, sweet: 2.0, sour: 2.0, bitter: 1.0 },
      mouthfeel: { richness: 8.0, creaminess: 8.5 },
      aromas: { umami_funky: 8.0, lactic_buttery: 7.5, earthy_mineral: 4.0, sulfurous: 3.0 },
    },
  },
  {
    id: 'ing_fontina',
    name: "Fontina Val d'Aosta DOP",
    category: 'dairy',
    composition: { water: 0.42, protein: 0.25, carbs_sugars: 0.01, fat: 0.29 },
    base_state: {
      volume: 3,
      temporal_peak: 'finish',
      taste: { sweet: 3.0, salty: 4.0, umami: 5.5, sour: 1.0 },
      mouthfeel: { richness: 8.0, creaminess: 7.5 },
      aromas: { lactic_buttery: 8.0, green_herbaceous: 3.0, roasted_pyrazine: 2.5, umami_funky: 4.0 },
    },
  },
  {
    id: 'ing_goat_cheese',
    name: 'Formaggio di Capra fresco (Chèvre)',
    category: 'dairy',
    composition: { water: 0.58, protein: 0.18, carbs_sugars: 0.01, fat: 0.21 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sour: 5.5, salty: 3.5, sweet: 1.5, umami: 3.0 },
      mouthfeel: { creaminess: 7.5, richness: 6.0, astringency: 1.5 },
      aromas: { lactic_buttery: 7.0, umami_funky: 6.5, green_herbaceous: 3.0, citrus_terpenic: 2.0 },
    },
  },
  {
    id: 'ing_smoked_provola',
    name: 'Provola / Scamorza Affumicata',
    category: 'dairy',
    composition: { water: 0.45, protein: 0.25, carbs_sugars: 0.01, fat: 0.26 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { salty: 4.5, umami: 5.0, sweet: 2.0, bitter: 1.5 },
      mouthfeel: { richness: 7.0, creaminess: 6.0 },
      aromas: { spicy_phenolic: 8.0, lactic_buttery: 6.5, roasted_pyrazine: 4.5, caramel_sweet: 2.0 },
    },
  },
  {
    id: 'ing_gruyere_comte',
    name: 'Gruyère / Comté stagionato 18 mesi',
    category: 'dairy',
    composition: { water: 0.34, protein: 0.29, carbs_sugars: 0.0, fat: 0.33 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { sweet: 3.0, salty: 5.0, umami: 8.0, sour: 1.0 },
      mouthfeel: { richness: 8.0, creaminess: 6.5, crunchiness: 2.0 },
      aromas: { lactic_buttery: 7.5, roasted_pyrazine: 5.5, umami_funky: 6.5, fruity_ester: 3.5, caramel_sweet: 3.0 },
    },
  },
  {
    id: 'ing_feta',
    name: 'Feta Greca DOP (Pecora e Capra)',
    category: 'dairy',
    composition: { water: 0.55, protein: 0.14, carbs_sugars: 0.04, fat: 0.21 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { salty: 7.5, sour: 5.5, umami: 4.5, sweet: 1.0 },
      mouthfeel: { richness: 5.5, creaminess: 5.0, crunchiness: 2.5, astringency: 1.5 },
      aromas: { lactic_buttery: 6.0, umami_funky: 6.0, green_herbaceous: 2.0 },
    },
  },
  {
    id: 'ing_ricotta_salata',
    name: 'Ricotta Salata stagionata',
    category: 'dairy',
    composition: { water: 0.42, protein: 0.22, carbs_sugars: 0.03, fat: 0.25 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { salty: 7.5, umami: 5.5, sweet: 1.5, sour: 1.5 },
      mouthfeel: { richness: 5.5, crunchiness: 3.0, astringency: 1.5 },
      aromas: { lactic_buttery: 6.5, umami_funky: 5.0, roasted_pyrazine: 1.5 },
    },
  },
  {
    id: 'ing_buttermilk',
    name: 'Latticello / Kefir fermentato',
    category: 'dairy',
    composition: { water: 0.9, protein: 0.033, carbs_sugars: 0.048, fat: 0.01 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sour: 6.5, sweet: 2.0, salty: 1.0 },
      mouthfeel: { juiciness: 7.5, creaminess: 4.0, astringency: 1.5 },
      aromas: { lactic_buttery: 6.5, fruity_ester: 2.5, citrus_terpenic: 2.0 },
    },
  },
  {
    id: 'ing_whole_egg',
    name: 'Uovo intero biologico (Albume + Tuorlo)',
    category: 'dairy',
    composition: { water: 0.76, protein: 0.13, carbs_sugars: 0.01, fat: 0.1 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { umami: 3.0, salty: 1.0, sweet: 1.0 },
      mouthfeel: { creaminess: 6.5, richness: 5.5, juiciness: 4.5 },
      aromas: { sulfurous: 3.0, lactic_buttery: 4.5 },
    },
  },
  // ==========================================
  // CARNI & SALUMI (Estensione)
  // ==========================================
  {
    id: 'ing_veal',
    name: 'Vitello (Fesa / Scamone magro)',
    category: 'protein_meat',
    composition: { water: 0.74, protein: 0.21, carbs_sugars: 0.0, fat: 0.03 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 1.5, salty: 1.0, umami: 3.0 },
      mouthfeel: { juiciness: 5.0, creaminess: 3.0, richness: 2.5 },
      aromas: { lactic_buttery: 3.5, earthy_mineral: 1.5 },
    },
  },
  {
    id: 'ing_pork_loin',
    name: 'Maiale (Filetto / Arista)',
    category: 'protein_meat',
    composition: { water: 0.72, protein: 0.22, carbs_sugars: 0.0, fat: 0.05 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 2.0, salty: 1.0, umami: 3.5 },
      mouthfeel: { juiciness: 4.5, richness: 3.5, creaminess: 2.0 },
      aromas: { lactic_buttery: 3.0, roasted_pyrazine: 1.5 },
    },
  },
  {
    id: 'ing_prosciutto_crudo',
    name: 'Prosciutto Crudo di Parma 24 mesi',
    category: 'protein_meat',
    composition: { water: 0.48, protein: 0.27, carbs_sugars: 0.0, fat: 0.18 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { salty: 7.0, umami: 8.5, sweet: 2.5 },
      mouthfeel: { richness: 7.0, creaminess: 5.5 },
      aromas: { umami_funky: 7.5, lactic_buttery: 4.5, roasted_pyrazine: 3.0, fruity_ester: 2.0 },
    },
  },
  {
    id: 'ing_calf_liver',
    name: 'Fegato di vitello fresco',
    category: 'protein_meat',
    composition: { water: 0.71, protein: 0.2, carbs_sugars: 0.04, fat: 0.04 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { sweet: 2.5, bitter: 3.0, umami: 6.0, salty: 1.0 },
      mouthfeel: { creaminess: 6.5, richness: 5.5, astringency: 2.5 },
      aromas: { earthy_mineral: 8.0, umami_funky: 5.0, lactic_buttery: 2.0 },
    },
  },
  {
    id: 'ing_rabbit',
    name: 'Coniglio (Sella / Coscia)',
    category: 'protein_meat',
    composition: { water: 0.71, protein: 0.21, carbs_sugars: 0.0, fat: 0.06 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 2.0, umami: 3.5, salty: 1.0 },
      mouthfeel: { juiciness: 4.5, richness: 3.0, creaminess: 2.5 },
      aromas: { green_herbaceous: 2.5, earthy_mineral: 2.5, lactic_buttery: 2.0 },
    },
  },
  // ==========================================
  // PESCE, MOLLUSCHI & CROSTACEI (Estensione)
  // ==========================================
  {
    id: 'ing_sea_bass',
    name: 'Branzino / Orata (Filetto fresco)',
    category: 'protein_fish',
    composition: { water: 0.78, protein: 0.19, carbs_sugars: 0.0, fat: 0.025 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 2.0, salty: 1.5, umami: 3.5 },
      mouthfeel: { juiciness: 6.0, creaminess: 4.0, richness: 2.5 },
      aromas: { marine_iodine: 4.5, green_herbaceous: 2.0, lactic_buttery: 2.0 },
    },
  },
  {
    id: 'ing_bluefin_tuna',
    name: 'Tonno Rosso fresco (Filetto / Ventresca)',
    category: 'protein_fish',
    composition: { water: 0.68, protein: 0.24, carbs_sugars: 0.0, fat: 0.07 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { umami: 7.0, salty: 2.0, sweet: 1.5, sour: 1.5 },
      mouthfeel: { richness: 6.0, juiciness: 5.5, creaminess: 5.5 },
      aromas: { marine_iodine: 6.0, earthy_mineral: 4.5, umami_funky: 3.5 },
    },
  },
  {
    id: 'ing_mackerel',
    name: 'Sgombro fresco (Pesce azzurro)',
    category: 'protein_fish',
    composition: { water: 0.64, protein: 0.19, carbs_sugars: 0.0, fat: 0.14 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { umami: 6.0, salty: 2.5, sweet: 1.0, sour: 1.0 },
      mouthfeel: { richness: 7.5, juiciness: 5.5, creaminess: 5.0 },
      aromas: { marine_iodine: 8.0, earthy_mineral: 3.5, umami_funky: 4.0 },
    },
  },
  {
    id: 'ing_squid',
    name: 'Calamaro / Seppia fresca',
    category: 'protein_fish',
    composition: { water: 0.79, protein: 0.16, carbs_sugars: 0.03, fat: 0.015 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 3.0, salty: 2.0, umami: 4.0 },
      mouthfeel: { crunchiness: 5.0, juiciness: 5.5, creaminess: 3.0 },
      aromas: { marine_iodine: 6.0, lactic_buttery: 1.5 },
    },
  },
  {
    id: 'ing_clams',
    name: 'Vongole Veraci / Cozze',
    category: 'protein_fish',
    composition: { water: 0.81, protein: 0.13, carbs_sugars: 0.03, fat: 0.015 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { salty: 6.0, umami: 7.5, sweet: 2.5 },
      mouthfeel: { juiciness: 8.0, crunchiness: 3.0, creaminess: 3.5 },
      aromas: { marine_iodine: 9.0, earthy_mineral: 4.0, green_herbaceous: 1.5 },
    },
  },
  {
    id: 'ing_bottarga',
    name: 'Bottarga di Muggine (Sardegna)',
    category: 'protein_fish',
    composition: { water: 0.3, protein: 0.38, carbs_sugars: 0.01, fat: 0.25 },
    base_state: {
      volume: 5,
      temporal_peak: 'finish',
      taste: { salty: 8.5, umami: 9.5, bitter: 2.0, sweet: 1.0 },
      mouthfeel: { richness: 7.5, creaminess: 4.5, astringency: 2.0 },
      aromas: { marine_iodine: 9.5, umami_funky: 8.5, lactic_buttery: 3.0, roasted_pyrazine: 2.0 },
    },
  },
  // ==========================================
  // ORTAGGI, LEGUMI & CEREALI (Estensione)
  // ==========================================
  {
    id: 'ing_carrot',
    name: 'Carota dolce',
    category: 'vegetable',
    composition: { water: 0.88, protein: 0.01, carbs_sugars: 0.1, fat: 0.002 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 5.5, bitter: 1.0, umami: 1.0 },
      mouthfeel: { crunchiness: 8.0, juiciness: 6.0 },
      aromas: { earthy_mineral: 4.5, green_herbaceous: 3.5, citrus_terpenic: 2.5, floral: 1.5 },
    },
  },
  {
    id: 'ing_zucchini',
    name: 'Zucchina verde chiara',
    category: 'vegetable',
    composition: { water: 0.94, protein: 0.012, carbs_sugars: 0.035, fat: 0.002 },
    base_state: {
      volume: 1,
      temporal_peak: 'attack',
      taste: { sweet: 2.5, bitter: 1.0, umami: 1.0 },
      mouthfeel: { juiciness: 7.5, crunchiness: 5.0 },
      aromas: { green_herbaceous: 6.0, floral: 2.0 },
    },
  },
  {
    id: 'ing_red_bell_pepper',
    name: 'Peperone rosso dolce',
    category: 'vegetable',
    composition: { water: 0.92, protein: 0.01, carbs_sugars: 0.06, fat: 0.003 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sweet: 5.5, sour: 1.5, bitter: 1.5, umami: 1.5 },
      mouthfeel: { crunchiness: 7.5, juiciness: 7.5 },
      aromas: { green_herbaceous: 6.5, fruity_ester: 5.0, floral: 2.0 },
    },
  },
  {
    id: 'ing_spinach',
    name: 'Spinacino fresco',
    category: 'vegetable',
    composition: { water: 0.91, protein: 0.029, carbs_sugars: 0.036, fat: 0.004 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { bitter: 2.5, sweet: 1.5, umami: 2.0, salty: 1.0 },
      mouthfeel: { astringency: 4.0, juiciness: 5.0, crunchiness: 3.5 },
      aromas: { green_herbaceous: 7.5, earthy_mineral: 5.5 },
    },
  },
  {
    id: 'ing_broccoli',
    name: 'Broccolo / Cime di rapa',
    category: 'vegetable',
    composition: { water: 0.89, protein: 0.028, carbs_sugars: 0.065, fat: 0.004 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { bitter: 4.5, sweet: 2.0, umami: 2.0 },
      mouthfeel: { crunchiness: 7.0, astringency: 3.0, juiciness: 4.0 },
      aromas: { sulfurous: 6.0, green_herbaceous: 6.5, earthy_mineral: 3.0 },
    },
  },
  {
    id: 'ing_leek',
    name: 'Porro (Parte bianca e verde tenera)',
    category: 'vegetable',
    composition: { water: 0.83, protein: 0.015, carbs_sugars: 0.14, fat: 0.003 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { sweet: 4.0, bitter: 1.0, umami: 2.0 },
      mouthfeel: { crunchiness: 6.0, juiciness: 5.5, pungency: 3.5 },
      aromas: { sulfurous: 6.0, green_herbaceous: 5.5, floral: 1.5 },
    },
  },
  {
    id: 'ing_shallot',
    name: 'Scalogno di Romagna',
    category: 'vegetable',
    composition: { water: 0.8, protein: 0.025, carbs_sugars: 0.17, fat: 0.001 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sweet: 4.0, bitter: 1.0, umami: 2.5, sour: 0.5 },
      mouthfeel: { pungency: 6.5, crunchiness: 6.5, juiciness: 5.0 },
      aromas: { sulfurous: 8.0, floral: 2.5, green_herbaceous: 2.5 },
    },
  },
  {
    id: 'ing_chickpeas',
    name: 'Ceci cotti (Lessati)',
    category: 'vegetable',
    composition: { water: 0.6, protein: 0.09, carbs_sugars: 0.27, fat: 0.026 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 2.5, umami: 2.5, bitter: 1.0 },
      mouthfeel: { creaminess: 6.0, richness: 3.5, astringency: 1.5 },
      aromas: { earthy_mineral: 5.5, roasted_pyrazine: 2.5, lactic_buttery: 2.0 },
    },
  },
  {
    id: 'ing_lentils',
    name: 'Lenticchie di Castelluccio / Beluga (Cotte)',
    category: 'vegetable',
    composition: { water: 0.7, protein: 0.09, carbs_sugars: 0.2, fat: 0.004 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { umami: 3.0, sweet: 1.5, bitter: 1.5 },
      mouthfeel: { creaminess: 4.5, astringency: 2.5, crunchiness: 2.5 },
      aromas: { earthy_mineral: 7.5, spicy_phenolic: 2.0, green_herbaceous: 1.5 },
    },
  },
  {
    id: 'ing_cannellini_beans',
    name: 'Fagioli Cannellini (Cotti)',
    category: 'vegetable',
    composition: { water: 0.67, protein: 0.08, carbs_sugars: 0.23, fat: 0.005 },
    base_state: {
      volume: 1,
      temporal_peak: 'mid',
      taste: { sweet: 2.0, umami: 2.0 },
      mouthfeel: { creaminess: 7.5, richness: 3.0 },
      aromas: { earthy_mineral: 4.5, lactic_buttery: 2.5 },
    },
  },
  {
    id: 'ing_green_peas',
    name: 'Piselli freschi dolci',
    category: 'vegetable',
    composition: { water: 0.79, protein: 0.054, carbs_sugars: 0.14, fat: 0.004 },
    base_state: {
      volume: 2,
      temporal_peak: 'attack',
      taste: { sweet: 5.5, umami: 2.5, bitter: 0.5 },
      mouthfeel: { juiciness: 6.0, crunchiness: 5.0, creaminess: 3.5 },
      aromas: { green_herbaceous: 7.5, floral: 2.5, fruity_ester: 1.5 },
    },
  },
  {
    id: 'ing_sourdough_bread',
    name: 'Pane a lievitazione naturale (Crosta e Mollica)',
    category: 'vegetable',
    composition: { water: 0.36, protein: 0.09, carbs_sugars: 0.52, fat: 0.015 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { sweet: 2.0, sour: 3.0, salty: 2.0, umami: 2.5, bitter: 1.0 },
      mouthfeel: { crunchiness: 7.0, creaminess: 3.5 },
      aromas: { roasted_pyrazine: 7.5, caramel_sweet: 4.5, lactic_buttery: 3.5, umami_funky: 3.0 },
    },
  },
  {
    id: 'ing_polenta_corn',
    name: 'Polenta di Mais (Farina bramata cotta)',
    category: 'vegetable',
    composition: { water: 0.76, protein: 0.02, carbs_sugars: 0.2, fat: 0.01 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 3.5, umami: 1.0 },
      mouthfeel: { creaminess: 7.5, richness: 3.0 },
      aromas: { caramel_sweet: 4.0, roasted_pyrazine: 3.5, earthy_mineral: 3.0, lactic_buttery: 2.0 },
    },
  },
  // ==========================================
  // FRUTTA (Estensione)
  // ==========================================
  {
    id: 'ing_strawberry',
    name: 'Fragola matura',
    category: 'fruit',
    composition: { water: 0.91, protein: 0.007, carbs_sugars: 0.077, fat: 0.003 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sweet: 6.5, sour: 4.5 },
      mouthfeel: { juiciness: 8.5, creaminess: 2.5, astringency: 1.0 },
      aromas: { fruity_ester: 9.0, caramel_sweet: 4.5, floral: 4.0, green_herbaceous: 2.5 },
    },
  },
  {
    id: 'ing_fig',
    name: 'Fico nero fresco maturo',
    category: 'fruit',
    composition: { water: 0.79, protein: 0.008, carbs_sugars: 0.19, fat: 0.003 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { sweet: 8.0, sour: 1.5, bitter: 0.5 },
      mouthfeel: { juiciness: 7.0, creaminess: 6.5, crunchiness: 2.5 },
      aromas: { fruity_ester: 7.5, caramel_sweet: 5.5, green_herbaceous: 4.0, floral: 3.5 },
    },
  },
  {
    id: 'ing_peach',
    name: 'Pesca / Albicocca matura',
    category: 'fruit',
    composition: { water: 0.88, protein: 0.009, carbs_sugars: 0.1, fat: 0.003 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sweet: 7.0, sour: 3.5 },
      mouthfeel: { juiciness: 9.0, creaminess: 4.0 },
      aromas: { fruity_ester: 8.5, floral: 5.5, lactic_buttery: 3.0, caramel_sweet: 2.0 },
    },
  },
  {
    id: 'ing_mango',
    name: 'Mango maturo',
    category: 'fruit',
    composition: { water: 0.83, protein: 0.008, carbs_sugars: 0.15, fat: 0.004 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sweet: 7.5, sour: 3.0 },
      mouthfeel: { juiciness: 8.5, creaminess: 6.5 },
      aromas: { fruity_ester: 9.0, citrus_terpenic: 5.5, floral: 4.5, green_herbaceous: 2.0 },
    },
  },
  {
    id: 'ing_avocado',
    name: 'Avocado Hass maturo',
    category: 'fruit',
    composition: { water: 0.73, protein: 0.02, carbs_sugars: 0.085, fat: 0.15 },
    base_state: {
      volume: 2,
      temporal_peak: 'finish',
      taste: { sweet: 1.5, umami: 1.5, bitter: 1.0 },
      mouthfeel: { creaminess: 9.5, richness: 8.5 },
      aromas: { green_herbaceous: 5.5, lactic_buttery: 4.5, earthy_mineral: 2.0 },
    },
  },
  {
    id: 'ing_pomegranate',
    name: 'Melograno (Chicchi freschi)',
    category: 'fruit',
    composition: { water: 0.78, protein: 0.017, carbs_sugars: 0.19, fat: 0.012 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sour: 6.5, sweet: 5.5, bitter: 1.5 },
      mouthfeel: { crunchiness: 7.5, juiciness: 8.0, astringency: 5.0 },
      aromas: { fruity_ester: 7.5, floral: 3.0, earthy_mineral: 1.5 },
    },
  },
  {
    id: 'ing_raisin',
    name: 'Uvetta sultanina passa',
    category: 'fruit',
    composition: { water: 0.15, protein: 0.03, carbs_sugars: 0.79, fat: 0.005 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { sweet: 9.0, sour: 2.5 },
      mouthfeel: { richness: 4.5, juiciness: 3.0, astringency: 2.0 },
      aromas: { caramel_sweet: 7.5, fruity_ester: 7.5, floral: 3.0, spicy_phenolic: 2.0 },
    },
  },
  // ==========================================
  // GRASSI, OLI & FRUTTA SECCA (Estensione)
  // ==========================================
  {
    id: 'ing_pistachio',
    name: 'Pistacchio verde di Bronte DOP',
    category: 'fat',
    composition: { water: 0.04, protein: 0.2, carbs_sugars: 0.27, fat: 0.45 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { sweet: 3.5, umami: 2.0, bitter: 1.0 },
      mouthfeel: { crunchiness: 8.0, richness: 7.5, creaminess: 4.5 },
      aromas: { green_herbaceous: 6.5, roasted_pyrazine: 4.5, lactic_buttery: 4.5, floral: 2.5 },
    },
  },
  {
    id: 'ing_almond',
    name: 'Mandorla di Noto pelata',
    category: 'fat',
    composition: { water: 0.04, protein: 0.21, carbs_sugars: 0.22, fat: 0.5 },
    base_state: {
      volume: 2,
      temporal_peak: 'mid',
      taste: { sweet: 3.0, bitter: 1.5, umami: 1.5 },
      mouthfeel: { crunchiness: 8.5, richness: 7.5, creaminess: 4.0 },
      aromas: { floral: 4.5, lactic_buttery: 4.0, roasted_pyrazine: 3.5, fruity_ester: 3.0 },
    },
  },
  {
    id: 'ing_pine_nut',
    name: 'Pinoli mediterranei',
    category: 'fat',
    composition: { water: 0.02, protein: 0.14, carbs_sugars: 0.13, fat: 0.68 },
    base_state: {
      volume: 3,
      temporal_peak: 'finish',
      taste: { sweet: 3.0, bitter: 1.0, umami: 1.5 },
      mouthfeel: { richness: 8.5, creaminess: 6.5, crunchiness: 5.5 },
      aromas: { citrus_terpenic: 5.5, lactic_buttery: 5.5, green_herbaceous: 3.5, roasted_pyrazine: 2.5 },
    },
  },
  {
    id: 'ing_toasted_sesame_oil',
    name: 'Olio di Sesamo Tostato',
    category: 'fat',
    composition: { water: 0.0, protein: 0.0, carbs_sugars: 0.0, fat: 1.0 },
    base_state: {
      volume: 5,
      temporal_peak: 'finish',
      taste: { bitter: 2.0, sweet: 1.5, umami: 2.0 },
      mouthfeel: { richness: 9.0, creaminess: 4.0 },
      aromas: { roasted_pyrazine: 9.5, spicy_phenolic: 4.5, caramel_sweet: 3.5, earthy_mineral: 3.5 },
    },
  },
  {
    id: 'ing_duck_fat',
    name: "Grasso d'Anatra / Strutto affinato",
    category: 'fat',
    composition: { water: 0.0, protein: 0.0, carbs_sugars: 0.0, fat: 1.0 },
    base_state: {
      volume: 3,
      temporal_peak: 'finish',
      taste: { umami: 2.5, sweet: 1.0, salty: 0.5 },
      mouthfeel: { richness: 10.0, creaminess: 7.5 },
      aromas: { roasted_pyrazine: 5.0, lactic_buttery: 5.5, umami_funky: 3.5 },
    },
  },
  {
    id: 'ing_tahini',
    name: 'Tahina (Crema di sesamo)',
    category: 'fat',
    composition: { water: 0.03, protein: 0.17, carbs_sugars: 0.21, fat: 0.54 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { bitter: 4.0, umami: 3.0, sweet: 1.5 },
      mouthfeel: { richness: 8.5, creaminess: 8.0, astringency: 3.0 },
      aromas: { roasted_pyrazine: 7.5, earthy_mineral: 6.0, spicy_phenolic: 2.0 },
    },
  },
  // ==========================================
  // ACIDI & AGRUMI (Estensione)
  // ==========================================
  {
    id: 'ing_lime',
    name: 'Lime fresco (Succo e Scorza)',
    category: 'acid',
    composition: { water: 0.88, protein: 0.007, carbs_sugars: 0.1, fat: 0.002 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { sour: 9.5, bitter: 2.0, sweet: 1.0 },
      mouthfeel: { juiciness: 9.0, astringency: 3.0 },
      aromas: { citrus_terpenic: 9.5, green_herbaceous: 5.0, floral: 4.0 },
    },
  },
  {
    id: 'ing_yuzu',
    name: 'Yuzu / Bergamotto (Succo e Scorza)',
    category: 'acid',
    composition: { water: 0.88, protein: 0.005, carbs_sugars: 0.09, fat: 0.002 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { sour: 9.0, bitter: 3.0, sweet: 1.5 },
      mouthfeel: { juiciness: 8.5, astringency: 3.5 },
      aromas: { citrus_terpenic: 9.5, floral: 8.0, green_herbaceous: 4.0, spicy_phenolic: 2.0 },
    },
  },
  {
    id: 'ing_sherry_vinegar',
    name: 'Aceto di Sherry (Jerez Reserva)',
    category: 'acid',
    composition: { water: 0.92, protein: 0.0, carbs_sugars: 0.02, fat: 0.0 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sour: 8.5, sweet: 2.5, umami: 2.5, bitter: 1.0 },
      mouthfeel: { juiciness: 8.0, astringency: 3.5, pungency: 3.0 },
      aromas: { caramel_sweet: 5.5, roasted_pyrazine: 4.5, fruity_ester: 5.0, spicy_phenolic: 3.5 },
    },
  },
  {
    id: 'ing_rice_vinegar',
    name: 'Aceto di Riso delicato',
    category: 'acid',
    composition: { water: 0.94, protein: 0.0, carbs_sugars: 0.02, fat: 0.0 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sour: 7.0, sweet: 2.5, umami: 1.5 },
      mouthfeel: { juiciness: 8.5, astringency: 1.5 },
      aromas: { fruity_ester: 4.0, floral: 3.0, caramel_sweet: 1.5 },
    },
  },
  {
    id: 'ing_grapefruit',
    name: 'Pompelmo Rosa (Succo e Polpa)',
    category: 'acid',
    composition: { water: 0.9, protein: 0.008, carbs_sugars: 0.085, fat: 0.001 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { sour: 7.0, bitter: 5.5, sweet: 3.5 },
      mouthfeel: { juiciness: 9.0, astringency: 3.5 },
      aromas: { citrus_terpenic: 8.5, sulfurous: 3.5, floral: 4.0, fruity_ester: 5.0 },
    },
  },
  // ==========================================
  // ERBE & SPEZIE (Estensione)
  // ==========================================
  {
    id: 'ing_parsley',
    name: 'Prezzemolo riccio / piatto fresco',
    category: 'herb_spice',
    composition: { water: 0.88, protein: 0.03, carbs_sugars: 0.06, fat: 0.008 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { bitter: 2.0, sweet: 1.0, umami: 1.0 },
      mouthfeel: { astringency: 2.0, crunchiness: 2.0 },
      aromas: { green_herbaceous: 9.0, citrus_terpenic: 3.5, earthy_mineral: 2.5 },
    },
  },
  {
    id: 'ing_oregano',
    name: 'Origano secco di montagna',
    category: 'herb_spice',
    composition: { water: 0.1, protein: 0.09, carbs_sugars: 0.69, fat: 0.04 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { bitter: 3.0, umami: 1.5 },
      mouthfeel: { pungency: 2.5, astringency: 3.0 },
      aromas: { spicy_phenolic: 8.5, green_herbaceous: 7.0, earthy_mineral: 3.5, citrus_terpenic: 2.0 },
    },
  },
  {
    id: 'ing_cilantro',
    name: 'Coriandolo fresco (Foglie)',
    category: 'herb_spice',
    composition: { water: 0.92, protein: 0.02, carbs_sugars: 0.04, fat: 0.005 },
    base_state: {
      volume: 4,
      temporal_peak: 'attack',
      taste: { bitter: 1.5, sour: 1.0 },
      mouthfeel: { juiciness: 3.0, astringency: 1.5 },
      aromas: { green_herbaceous: 8.5, citrus_terpenic: 7.5, floral: 3.5, spicy_phenolic: 2.0 },
    },
  },
  {
    id: 'ing_chives',
    name: 'Erba Cipollina fresca',
    category: 'herb_spice',
    composition: { water: 0.9, protein: 0.03, carbs_sugars: 0.04, fat: 0.007 },
    base_state: {
      volume: 3,
      temporal_peak: 'attack',
      taste: { sweet: 1.5, umami: 1.5, bitter: 1.0 },
      mouthfeel: { pungency: 3.5, crunchiness: 3.0 },
      aromas: { sulfurous: 6.5, green_herbaceous: 7.5 },
    },
  },
  {
    id: 'ing_bay_leaf',
    name: 'Alloro (Foglie)',
    category: 'herb_spice',
    composition: { water: 0.05, protein: 0.08, carbs_sugars: 0.75, fat: 0.08 },
    base_state: {
      volume: 3,
      temporal_peak: 'finish',
      taste: { bitter: 2.5 },
      mouthfeel: { astringency: 3.0 },
      aromas: { green_herbaceous: 6.5, spicy_phenolic: 6.0, floral: 4.5, citrus_terpenic: 3.0 },
    },
  },
  {
    id: 'ing_cardamom',
    name: 'Cardamomo verde (Semi)',
    category: 'herb_spice',
    composition: { water: 0.08, protein: 0.11, carbs_sugars: 0.68, fat: 0.07 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { sweet: 2.0, bitter: 1.5 },
      mouthfeel: { pungency: 3.5, astringency: 2.0 },
      aromas: { floral: 8.5, citrus_terpenic: 8.0, spicy_phenolic: 6.0, green_herbaceous: 4.5 },
    },
  },
  {
    id: 'ing_nutmeg',
    name: 'Noce Moscata grattugiata',
    category: 'herb_spice',
    composition: { water: 0.06, protein: 0.06, carbs_sugars: 0.49, fat: 0.36 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { sweet: 2.0, bitter: 2.5 },
      mouthfeel: { pungency: 3.5, richness: 2.5, astringency: 2.0 },
      aromas: { spicy_phenolic: 8.5, earthy_mineral: 4.5, floral: 3.5, caramel_sweet: 3.0 },
    },
  },
  {
    id: 'ing_smoked_paprika',
    name: 'Paprika Affumicata (Pimentón de la Vera)',
    category: 'herb_spice',
    composition: { water: 0.11, protein: 0.14, carbs_sugars: 0.54, fat: 0.13 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { sweet: 3.0, bitter: 2.0, umami: 2.5 },
      mouthfeel: { pungency: 3.5, astringency: 2.0 },
      aromas: { spicy_phenolic: 9.0, roasted_pyrazine: 6.0, fruity_ester: 4.0, earthy_mineral: 3.5 },
    },
  },
  {
    id: 'ing_turmeric',
    name: 'Curcuma fresca / polvere',
    category: 'herb_spice',
    composition: { water: 0.12, protein: 0.08, carbs_sugars: 0.65, fat: 0.1 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { bitter: 4.0, sweet: 1.0 },
      mouthfeel: { pungency: 3.0, astringency: 3.5 },
      aromas: { earthy_mineral: 8.5, spicy_phenolic: 5.5, citrus_terpenic: 4.0, floral: 2.0 },
    },
  },
  {
    id: 'ing_star_anise',
    name: 'Anice Stellato / Semi di Finocchio',
    category: 'herb_spice',
    composition: { water: 0.09, protein: 0.15, carbs_sugars: 0.5, fat: 0.15 },
    base_state: {
      volume: 5,
      temporal_peak: 'finish',
      taste: { sweet: 4.0, bitter: 2.0 },
      mouthfeel: { pungency: 3.0, astringency: 2.0 },
      aromas: { spicy_phenolic: 8.5, floral: 6.5, green_herbaceous: 5.0, caramel_sweet: 3.5 },
    },
  },
  {
    id: 'ing_sichuan_pepper',
    name: 'Pepe di Sichuan',
    category: 'herb_spice',
    composition: { water: 0.1, protein: 0.1, carbs_sugars: 0.65, fat: 0.04 },
    base_state: {
      volume: 5,
      temporal_peak: 'attack',
      taste: { bitter: 2.0, sour: 1.5 },
      mouthfeel: { pungency: 8.5, astringency: 3.0 },
      aromas: { citrus_terpenic: 9.0, floral: 6.5, spicy_phenolic: 6.5, green_herbaceous: 3.0 },
    },
  },
  // ==========================================
  // SALE, CONDIMENTI & DOLCIFICANTI (Estensione)
  // ==========================================
  {
    id: 'ing_brown_sugar',
    name: 'Zucchero di Canna integrale (Muscovado)',
    category: 'umami_condiment',
    composition: { water: 0.02, protein: 0.0, carbs_sugars: 0.97, fat: 0.0 },
    base_state: {
      volume: 3,
      temporal_peak: 'mid',
      taste: { sweet: 10.0, bitter: 1.5 },
      mouthfeel: { richness: 3.5 },
      aromas: { caramel_sweet: 9.0, spicy_phenolic: 2.5, roasted_pyrazine: 2.0 },
    },
  },
  {
    id: 'ing_maple_syrup',
    name: "Sciroppo d'Acero puro (Grado scuro)",
    category: 'umami_condiment',
    composition: { water: 0.32, protein: 0.0, carbs_sugars: 0.67, fat: 0.0 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { sweet: 9.0, bitter: 1.0, umami: 1.0 },
      mouthfeel: { richness: 5.5, creaminess: 4.0 },
      aromas: { caramel_sweet: 9.5, spicy_phenolic: 4.0, roasted_pyrazine: 3.5, floral: 2.0 },
    },
  },
  {
    id: 'ing_tomato_paste',
    name: 'Triplo Concentrato di Pomodoro',
    category: 'umami_condiment',
    composition: { water: 0.65, protein: 0.05, carbs_sugars: 0.24, fat: 0.005 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { umami: 8.5, sweet: 5.0, sour: 5.5, salty: 2.0 },
      mouthfeel: { richness: 5.0, creaminess: 5.5, astringency: 2.0 },
      aromas: { caramel_sweet: 5.5, fruity_ester: 5.0, umami_funky: 5.0, earthy_mineral: 3.5 },
    },
  },
  {
    id: 'ing_taggiasca_olives',
    name: 'Olive Taggiasche in salamoia',
    category: 'umami_condiment',
    composition: { water: 0.72, protein: 0.01, carbs_sugars: 0.04, fat: 0.2 },
    base_state: {
      volume: 4,
      temporal_peak: 'mid',
      taste: { salty: 6.5, bitter: 3.5, sour: 3.0, umami: 4.5 },
      mouthfeel: { richness: 7.0, juiciness: 5.5, astringency: 2.5 },
      aromas: { umami_funky: 6.5, fruity_ester: 5.5, green_herbaceous: 3.5, earthy_mineral: 3.0 },
    },
  },
  {
    id: 'ing_sundried_tomato',
    name: "Pomodori Secchi sott'olio",
    category: 'umami_condiment',
    composition: { water: 0.35, protein: 0.08, carbs_sugars: 0.35, fat: 0.14 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { umami: 8.5, sweet: 6.0, sour: 4.5, salty: 4.5 },
      mouthfeel: { richness: 6.5, crunchiness: 2.5 },
      aromas: { caramel_sweet: 6.5, umami_funky: 6.0, fruity_ester: 5.0, earthy_mineral: 3.0 },
    },
  },
  {
    id: 'ing_fish_sauce',
    name: 'Salsa di Pesce (Nuoc Mam / Nam Pla)',
    category: 'umami_condiment',
    composition: { water: 0.68, protein: 0.1, carbs_sugars: 0.03, fat: 0.0 },
    base_state: {
      volume: 5,
      temporal_peak: 'mid',
      taste: { salty: 9.5, umami: 10.0, sweet: 1.5 },
      mouthfeel: { juiciness: 6.0, richness: 3.5 },
      aromas: { umami_funky: 9.5, marine_iodine: 8.5, caramel_sweet: 2.5 },
    },
  },
  {
    id: 'ing_nutritional_yeast',
    name: 'Lievito Alimentare in scaglie',
    category: 'umami_condiment',
    composition: { water: 0.05, protein: 0.5, carbs_sugars: 0.36, fat: 0.05 },
    base_state: {
      volume: 4,
      temporal_peak: 'finish',
      taste: { umami: 9.0, salty: 2.5, sweet: 1.5, bitter: 1.0 },
      mouthfeel: { richness: 4.0, creaminess: 3.5 },
      aromas: { umami_funky: 8.0, roasted_pyrazine: 5.0, lactic_buttery: 4.5, earthy_mineral: 3.0 },
    },
  },
];

export const SEED_TECHNIQUES: Technique[] = [
  {
    id: 'tech_raw',
    name: 'A crudo / Nessuna cottura',
    type: 'raw',
    preconditions: {},
    deltas: {
      volume_shift: 0,
      temporal_shift: 'keep',
      taste_add: {},
      mouthfeel_add: {},
      aroma_multipliers: {},
      aroma_add: {},
    },
  },
  {
    id: 'tech_maillard_sear',
    name: 'Rosolatura / Arrostitura intensa (Reazione di Maillard)',
    type: 'dry_heat',
    preconditions: { min_protein: 0.015 },
    deltas: {
      volume_shift: 1,
      temporal_shift: 'mid',
      taste_add: { umami: 3.5, sweet: 1.5, bitter: 1.0 },
      mouthfeel_add: { crunchiness: 4.5, juiciness: -1.5, pungency: -3.0 },
      aroma_multipliers: { sulfurous: 0.35, green_herbaceous: 0.3, marine_iodine: 0.7 },
      aroma_add: { roasted_pyrazine: 7.5, caramel_sweet: 3.0, umami_funky: 2.0 },
    },
  },
  {
    id: 'tech_caramelize_braise',
    name: 'Stufatura lenta / Caramellizzazione dolce',
    type: 'dry_heat',
    preconditions: { min_carbs_sugars: 0.04 },
    deltas: {
      volume_shift: 1,
      temporal_shift: 'mid',
      taste_add: { sweet: 4.5, umami: 2.0, sour: -1.5, bitter: 0.5 },
      mouthfeel_add: { creaminess: 6.0, crunchiness: -6.5, pungency: -6.5, richness: 1.5 },
      aroma_multipliers: { sulfurous: 0.2, green_herbaceous: 0.15, citrus_terpenic: 0.4 },
      aroma_add: { caramel_sweet: 7.5, roasted_pyrazine: 2.5, fruity_ester: 1.5 },
    },
  },
  {
    id: 'tech_steam_poach',
    name: 'Cottura delicata a vapore / Poché',
    type: 'moist_heat',
    preconditions: {},
    deltas: {
      volume_shift: -1,
      temporal_shift: 'keep',
      taste_add: { sweet: 0.5, bitter: -1.0 },
      mouthfeel_add: { creaminess: 4.5, juiciness: 1.5, crunchiness: -5.0, pungency: -4.0 },
      aroma_multipliers: { sulfurous: 1.2, green_herbaceous: 0.6, citrus_terpenic: 0.5 },
      aroma_add: {},
    },
  },
  {
    id: 'tech_acid_marinade',
    name: 'Marinatura acida a freddo (Ceviche / Agrumi / Aceto)',
    type: 'marinade',
    preconditions: {},
    deltas: {
      volume_shift: 1,
      temporal_shift: 'attack',
      taste_add: { sour: 4.5, salty: 1.5 },
      mouthfeel_add: { juiciness: 1.5, richness: -2.0, pungency: -2.5, crunchiness: -1.0 },
      aroma_multipliers: { marine_iodine: 0.5, sulfurous: 0.4 },
      aroma_add: { citrus_terpenic: 3.5, fruity_ester: 2.0 },
    },
  },
  {
    id: 'tech_brown_butter_infusion',
    name: 'Nocciolatura / Infusione lipidica a caldo',
    type: 'fat_infusion',
    preconditions: { min_fat: 0.05 },
    deltas: {
      volume_shift: 2,
      temporal_shift: 'finish',
      taste_add: { sweet: 1.5, umami: 1.5, bitter: 0.5 },
      mouthfeel_add: { richness: 1.5, creaminess: -1.0 },
      aroma_multipliers: { lactic_buttery: 0.6, green_herbaceous: 0.3, citrus_terpenic: 1.3 },
      aroma_add: { caramel_sweet: 6.5, roasted_pyrazine: 6.0 },
    },
  },
  {
    id: 'tech_light_smoke',
    name: 'Affumicatura a caldo (Legni dolci)',
    type: 'dry_heat',
    preconditions: {},
    deltas: {
      volume_shift: 2,
      temporal_shift: 'finish',
      taste_add: { umami: 2.0, bitter: 1.5, sweet: 1.0 },
      mouthfeel_add: { juiciness: -1.0, richness: 1.0 },
      aroma_multipliers: { green_herbaceous: 0.4, floral: 0.3 },
      aroma_add: { spicy_phenolic: 8.0, roasted_pyrazine: 4.0, caramel_sweet: 2.0 },
    },
  },
  {
    id: 'tech_deep_fry',
    name: 'Frittura a immersione (180°C)',
    type: 'dry_heat',
    preconditions: { min_carbs_sugars: 0.02 },
    deltas: {
      volume_shift: 1,
      temporal_shift: 'attack',
      taste_add: { umami: 2.0, sweet: 1.0, bitter: 0.5 },
      mouthfeel_add: { crunchiness: 8.0, richness: 5.0, juiciness: -2.0, pungency: -3.5 },
      aroma_multipliers: { green_herbaceous: 0.4, sulfurous: 0.35 },
      aroma_add: { roasted_pyrazine: 6.5, lactic_buttery: 2.0, caramel_sweet: 2.0 },
    },
  },
  {
    id: 'tech_lacto_ferment',
    name: 'Latto-fermentazione controllata (2% sale)',
    type: 'marinade',
    preconditions: { min_carbs_sugars: 0.03 },
    deltas: {
      volume_shift: 2,
      temporal_shift: 'attack',
      taste_add: { sour: 6.0, salty: 4.0, umami: 3.5, sweet: -2.5 },
      mouthfeel_add: { juiciness: 2.0, pungency: -2.0, crunchiness: -1.0 },
      aroma_multipliers: { green_herbaceous: 0.5 },
      aroma_add: { umami_funky: 6.5, fruity_ester: 4.5, lactic_buttery: 2.5 },
    },
  },
  {
    id: 'tech_wine_reduction',
    name: 'Deglassatura e Riduzione densa',
    type: 'moist_heat',
    preconditions: {},
    deltas: {
      volume_shift: 2,
      temporal_shift: 'finish',
      taste_add: { sweet: 3.0, sour: 2.0, umami: 2.5, bitter: 0.5 },
      mouthfeel_add: { richness: 4.0, creaminess: 3.5, juiciness: -3.0, astringency: -1.5 },
      aroma_multipliers: { fruity_ester: 1.3, spicy_phenolic: 1.2 },
      aroma_add: { caramel_sweet: 5.0, umami_funky: 2.0 },
    },
  },
  {
    id: 'tech_emulsion_mantecatura',
    name: 'Mantecatura / Emulsione acqua-grasso',
    type: 'fat_infusion',
    preconditions: { min_fat: 0.08 },
    deltas: {
      volume_shift: 0,
      temporal_shift: 'mid',
      taste_add: { sweet: 0.5, umami: 1.0, sour: -1.0, bitter: -1.0 },
      mouthfeel_add: { creaminess: 5.5, richness: 2.5, astringency: -2.5, pungency: -1.5 },
      aroma_multipliers: { lactic_buttery: 1.25, green_herbaceous: 1.15 },
      aroma_add: {},
    },
  },
  {
    id: 'tech_dry_toast_spices',
    name: 'Tostatura a secco (Spezie e Frutta secca)',
    type: 'dry_heat',
    preconditions: {},
    deltas: {
      volume_shift: 2,
      temporal_shift: 'mid',
      taste_add: { bitter: 1.0, sweet: 1.0, umami: 1.0 },
      mouthfeel_add: { crunchiness: 3.0, astringency: -1.5 },
      aroma_multipliers: { citrus_terpenic: 1.4, spicy_phenolic: 1.5, green_herbaceous: 0.3 },
      aroma_add: { roasted_pyrazine: 8.0, caramel_sweet: 3.0 },
    },
  },
  {
    id: 'tech_sous_vide',
    name: 'Sous-vide / Bassa Temperatura (CBT 54-65°C)',
    type: 'moist_heat',
    preconditions: {},
    deltas: {
      volume_shift: 0,
      temporal_shift: 'mid',
      taste_add: { umami: 1.5, sweet: 1.0 },
      mouthfeel_add: { juiciness: 3.5, creaminess: 3.5, crunchiness: -3.5, astringency: -1.5 },
      aroma_multipliers: { citrus_terpenic: 1.2, floral: 1.15, sulfurous: 0.85 },
      aroma_add: { lactic_buttery: 1.5 },
    },
  },
  {
    id: 'tech_charcoal_grill',
    name: 'Grigliatura su Brace viva (Yakitori / Carbone)',
    type: 'dry_heat',
    preconditions: { min_protein: 0.01 },
    deltas: {
      volume_shift: 2,
      temporal_shift: 'finish',
      taste_add: { umami: 3.5, bitter: 2.5, sweet: 1.0 },
      mouthfeel_add: { crunchiness: 5.0, juiciness: -1.5, astringency: 1.5, pungency: -2.5 },
      aroma_multipliers: { green_herbaceous: 0.25, sulfurous: 0.3 },
      aroma_add: { roasted_pyrazine: 8.5, spicy_phenolic: 6.5, caramel_sweet: 2.5 },
    },
  },
  {
    id: 'tech_dry_cure',
    name: 'Salagione / Marinatura a secco (Gravlax / Dry Brining)',
    type: 'marinade',
    preconditions: { min_protein: 0.08 },
    deltas: {
      volume_shift: 1,
      temporal_shift: 'mid',
      taste_add: { salty: 5.0, umami: 3.5, sweet: 1.5 },
      mouthfeel_add: { creaminess: 3.0, richness: 2.0, juiciness: -2.5 },
      aroma_multipliers: { marine_iodine: 0.75, umami_funky: 1.4 },
      aroma_add: { umami_funky: 3.0 },
    },
  },
  {
    id: 'tech_confit_fat',
    name: 'Cottura Confit in grasso a bassa temperatura (85°C)',
    type: 'fat_infusion',
    preconditions: {},
    deltas: {
      volume_shift: 0,
      temporal_shift: 'finish',
      taste_add: { sweet: 2.5, umami: 2.0, bitter: -1.5 },
      mouthfeel_add: { richness: 5.5, creaminess: 6.5, pungency: -7.5, crunchiness: -6.0, astringency: -2.5 },
      aroma_multipliers: { sulfurous: 0.15, green_herbaceous: 0.3, spicy_phenolic: 1.3 },
      aroma_add: { lactic_buttery: 3.5, caramel_sweet: 3.5 },
    },
  },
  {
    id: 'tech_risottatura',
    name: 'Tostatura e Risottatura (Gelatinizzazione amidi)',
    type: 'moist_heat',
    preconditions: { min_carbs_sugars: 0.15 },
    deltas: {
      volume_shift: 1,
      temporal_shift: 'mid',
      taste_add: { sweet: 1.5, umami: 1.5, salty: 1.5 },
      mouthfeel_add: { creaminess: 7.5, richness: 3.5, crunchiness: -6.5, juiciness: 3.0 },
      aroma_multipliers: { lactic_buttery: 1.3 },
      aroma_add: { roasted_pyrazine: 3.0, caramel_sweet: 1.5 },
    },
  },
  {
    id: 'tech_cryo_granita',
    name: 'Abbattimento sottozero / Granita gastronomica (-14°C)',
    type: 'marinade',
    preconditions: {},
    deltas: {
      volume_shift: -1,
      temporal_shift: 'attack',
      taste_add: { sweet: -2.5, umami: -1.5, salty: -1.0, sour: 0.5 },
      mouthfeel_add: { crunchiness: 5.5, richness: -4.0, creaminess: -2.0 },
      aroma_multipliers: { roasted_pyrazine: 0.4, umami_funky: 0.4, citrus_terpenic: 0.85, fruity_ester: 0.85 },
      aroma_add: {},
    },
  },
];

export const SEED_DATABASE: FlavorDatabase = {
  ingredients: [...RAW_SEED_INGREDIENTS, ...SPICEMASTER_INGREDIENTS].map(normalizeIngredient),
  techniques: SEED_TECHNIQUES,
};

export const PRESET_RECIPES: PresetRecipe[] = [
  ...ITALIAN_HISTORICAL_PRESETS,
  {
    id: 'preset_brasato',
    name: 'Brasato Manzo & Cipolla Caramellata',
    subtitle: 'Ponte Pirazine/Caramello • Test Acidità',
    description:
      'Mostra la convergenza molecolare tra Maillard e caramellizzazione e l’alert sulla grassezza risolvibile con Aceto di Mele.',
    items: [
      { ingredientId: 'ing_beef_chuck', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_onion_yellow', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_butter', techniqueId: 'tech_brown_butter_infusion', dosage: 'secondary' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_cavolfiore',
    name: 'Cavolfiore Arrostito, Burro Nocciola e Limone',
    subtitle: 'Abbattimento Solfuri • Equilibrio Maillard-Agrume',
    description:
      'La rosolatura ad alta temperatura abbatte i tioli del cavolfiore legandolo al burro nocciola, bilanciato dal limone.',
    items: [
      { ingredientId: 'ing_cauliflower', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_butter', techniqueId: 'tech_brown_butter_infusion', dosage: 'secondary' },
      { ingredientId: 'ing_lemon', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_ceviche',
    name: 'Ceviche di Salmone, Mela Granny Smith e Olio EVO',
    subtitle: 'Marinatura Acida • Contrasto Croccante',
    description:
      'Dimostra il taglio della grassezza del salmone tramite acidità e il contrasto meccanico croccante della mela verde.',
    items: [
      { ingredientId: 'ing_salmon', techniqueId: 'tech_acid_marinade', dosage: 'main' },
      { ingredientId: 'ing_apple_granny', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_polpo_zafferano',
    name: 'Polpo Arrostito, Patata al Vapore e Zafferano',
    subtitle: 'Ponte Iodato Mare-Zafferano • Contrasto Texture',
    description:
      'Mostra il ponte molecolare iodato e minerale tra polpo arrostito e pistilli di zafferano, sostenuto dalla morbidezza della patata al vapore.',
    items: [
      { ingredientId: 'ing_octopus', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_potato', techniqueId: 'tech_steam_poach', dosage: 'secondary' },
      { ingredientId: 'ing_saffron', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_gricia',
    name: 'Guanciale Croccante, Pecorino Mantecato e Pepe Tostato',
    subtitle: 'Studio Gricia / Cacio & Pepe • Sapidità & Lipidi',
    description:
      'Analisi della sinergia tra sapidità, umami, avvolgenza lipidica della mantecatura e pungenza terpenica del pepe Tellicherry tostato.',
    items: [
      { ingredientId: 'ing_pork_guanciale', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_pecorino', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_black_pepper', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_anatra_arancia_radicchio',
    name: "Petto d'Anatra Rosolato, Arancia Ridotta e Radicchio alla Brace",
    subtitle: 'Lipidi, Acidità Agrumata & Amaro Fumé',
    description:
      'Studio dell’equilibrio tra la ricchezza lipidica del magret rosolato, la spinta dolce-acida dell’arancia ridotta e l’amaro affumicato del radicchio alla brace.',
    items: [
      { ingredientId: 'ing_duck_breast', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_orange_tarocco', techniqueId: 'tech_wine_reduction', dosage: 'secondary' },
      { ingredientId: 'ing_radicchio_treviso', techniqueId: 'tech_charcoal_grill', dosage: 'secondary' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_uovo_asparagi_tartufo',
    name: 'Uovo Poché, Asparagi alla Brace e Tartufo Nero a Crudo',
    subtitle: 'Ponte Solforoso-Terroso (Dimetilsolfuro)',
    description:
      'Dimostrazione della convergenza molecolare sul dimetilsolfuro e geosmina tra tuorlo poché, asparagi grigliati e tartufo nero pregiato.',
    items: [
      { ingredientId: 'ing_egg_yolk', techniqueId: 'tech_steam_poach', dosage: 'main' },
      { ingredientId: 'ing_asparagus_green', techniqueId: 'tech_charcoal_grill', dosage: 'secondary' },
      { ingredientId: 'ing_black_truffle', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_gambero_burrata_granita',
    name: 'Gambero Rosso Crudo, Burrata e Granita di Sedano e Limone',
    subtitle: 'Contrasto Sottozero • Grassezza & Dolcezza Marina',
    description:
      'Dimostrazione del taglio termico e meccanico della granita a -14°C sulla cremosità della burrata e la dolcezza iodata del gambero rosso.',
    items: [
      { ingredientId: 'ing_red_prawn', techniqueId: 'tech_raw', dosage: 'main' },
      { ingredientId: 'ing_burrata', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_celery', techniqueId: 'tech_cryo_granita', dosage: 'secondary' },
      { ingredientId: 'ing_lemon', techniqueId: 'tech_cryo_granita', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_risotto_zucca_gorgonzola_nocciole',
    name: 'Risotto Zucca Arrostita, Gorgonzola Piccante e Nocciola Tostata',
    subtitle: 'Dolcezza Caramellata • Erborinato & Croccante',
    description:
      'Bilancia la dolcezza caramellata della zucca arrostita con la spinta sapida e fungina del gorgonzola mantecato, chiudendo con la croccantezza tostata della nocciola.',
    items: [
      { ingredientId: 'ing_rice_carnaroli', techniqueId: 'tech_risottatura', dosage: 'main' },
      { ingredientId: 'ing_pumpkin_delica', techniqueId: 'tech_maillard_sear', dosage: 'secondary' },
      { ingredientId: 'ing_gorgonzola_piccante', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_hazelnut', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
      { ingredientId: 'ing_sage', techniqueId: 'tech_brown_butter_infusion', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_capasanta_miso_yuzu',
    name: 'Capasanta Scottata, Burro Nocciola al Miso e Yuzu',
    subtitle: 'Maillard Marino • Sinergia Umami-Agrume',
    description:
      'La crosticina di Maillard sulla capasanta si lega ai lattoni del burro nocciola e all’umami dello Shiro Miso, alleggeriti in finale dall’acidità aromatica dello yuzu.',
    items: [
      { ingredientId: 'ing_scallop', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_butter', techniqueId: 'tech_brown_butter_infusion', dosage: 'secondary' },
      { ingredientId: 'ing_miso_white', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_yuzu', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_agnello_carciofi_menta',
    name: "Carré d'Agnello alla Brace, Carciofo Confit e Menta",
    subtitle: 'Fumé, Amaro Vegetale & Freschezza Terpenica',
    description:
      'Classico studio romano: la brace sviluppa note fenoliche sull’agnello, mentre il carciofo confit smussa l’astringenza e menta + limone puliscono il palato dai grassi.',
    items: [
      { ingredientId: 'ing_lamb_rack', techniqueId: 'tech_charcoal_grill', dosage: 'main' },
      { ingredientId: 'ing_artichoke', techniqueId: 'tech_confit_fat', dosage: 'secondary' },
      { ingredientId: 'ing_pecorino', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_mint', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_lemon', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_spaghetti_vongole_bottarga',
    name: 'Spaghetti Vongole Veraci, Bottarga di Muggine e Limone',
    subtitle: 'Esplosione Iodata • Emulsione Amido-Mare',
    description:
      'Sovrapposizione di umami marino tra vongole al vapore e bottarga di muggine, armonizzata dalla mantecatura degli amidi, aglio confit dolce e scorza di limone.',
    items: [
      { ingredientId: 'ing_pasta_semolina', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_clams', techniqueId: 'tech_steam_poach', dosage: 'secondary' },
      { ingredientId: 'ing_bottarga', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_garlic', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_lemon', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_parsley', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_melanzana_miso_sesamo',
    name: 'Melanzana alla Brace Glassata al Miso, Sesamo e Lime',
    subtitle: 'Nasu Dengaku • Umami Vegetale & Acidità',
    description:
      'La melanzana grigliata assorbe la glassatura caramellata di miso bianco e olio di sesamo tostato; lime e zenzero fresco aggiungono attacco agrumato e pungenza.',
    items: [
      { ingredientId: 'ing_eggplant', techniqueId: 'tech_charcoal_grill', dosage: 'main' },
      { ingredientId: 'ing_miso_white', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_toasted_sesame_oil', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_lime', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_ginger', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_tataki_tonno_avocado_sichuan',
    name: 'Tataki di Tonno Rosso, Avocado, Soia e Pepe di Sichuan',
    subtitle: 'Crudo-Scottato • Cremoso, Umami & Pungenza Agrumata',
    description:
      'Contrasto tra la rosolatura esterna del tonno rosso e la cremosità burrosa dell’avocado, collegati da salsa di soia, lime e note terpeniche vibranti del pepe di Sichuan.',
    items: [
      { ingredientId: 'ing_bluefin_tuna', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_avocado', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_soy_sauce', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_lime', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_sichuan_pepper', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_baccala_ceci_colatura',
    name: 'Baccalà CBT, Crema di Ceci, Rosmarino e Colatura di Alici',
    subtitle: 'Bassa Temperatura • Vellutato & Spinta Sapida',
    description:
      'La cottura sous-vide preserva la succosità del baccalà sulla crema emulsionata di ceci, mentre rosmarino confit e colatura di alici creano profondità aromatica mediterranea.',
    items: [
      { ingredientId: 'ing_cod_baccala', techniqueId: 'tech_sous_vide', dosage: 'main' },
      { ingredientId: 'ing_chickpeas', techniqueId: 'tech_emulsion_mantecatura', dosage: 'secondary' },
      { ingredientId: 'ing_rosemary', techniqueId: 'tech_confit_fat', dosage: 'garnish' },
      { ingredientId: 'ing_colatura_alici', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_evoo', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_barbabietola_caprino_lampone',
    name: 'Barbabietola Affumicata, Caprino Fresco, Lampone e Noci',
    subtitle: 'Ponte Geosmina-Frutto Rosso • Terra & Acidità',
    description:
      'L’affumicatura dolce esalta la geosmina della barbabietola in dialogo con l’acidità lattica del caprino, la freschezza del lampone, le noci tostate e il balsamico invecchiato.',
    items: [
      { ingredientId: 'ing_beetroot', techniqueId: 'tech_light_smoke', dosage: 'main' },
      { ingredientId: 'ing_goat_cheese', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_raspberry', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_walnut', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
      { ingredientId: 'ing_balsamic_aged', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_pollo_cocco_mango_curcuma',
    name: 'Pollo Croccante, Latte di Cocco, Mango, Curcuma e Lime',
    subtitle: 'Equilibrio Speziato • Lattoni, Dolcezza Esotica & Freschezza',
    description:
      'Pelle croccante di pollo rosolata immersa nei lattoni avvolgenti del latte di cocco stufato con curcuma tostata, rinfrescati da mango maturo, lime e coriandolo.',
    items: [
      { ingredientId: 'ing_chicken_thigh', techniqueId: 'tech_maillard_sear', dosage: 'main' },
      { ingredientId: 'ing_coconut_milk', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_mango', techniqueId: 'tech_raw', dosage: 'secondary' },
      { ingredientId: 'ing_turmeric', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
      { ingredientId: 'ing_lime', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_cilantro', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
  {
    id: 'preset_cioccolato_pera_caffe_cardamomo',
    name: 'Ganache Cioccolato 85%, Pera Caramellata, Caffè e Cardamomo',
    subtitle: 'Dessert Molecolare • Pirazine Tostate & Note Floreali',
    description:
      'Ponte diretto sulle pirazine tostate tra cioccolato fondente emulsionato e caffè espresso, bilanciato dalla dolcezza fruttata della pera caramellata, cardamomo tostato e fiocchi di sale.',
    items: [
      { ingredientId: 'ing_dark_chocolate_85', techniqueId: 'tech_emulsion_mantecatura', dosage: 'main' },
      { ingredientId: 'ing_pear_williams', techniqueId: 'tech_caramelize_braise', dosage: 'secondary' },
      { ingredientId: 'ing_coffee_espresso', techniqueId: 'tech_raw', dosage: 'garnish' },
      { ingredientId: 'ing_cardamom', techniqueId: 'tech_dry_toast_spices', dosage: 'garnish' },
      { ingredientId: 'ing_sea_salt', techniqueId: 'tech_raw', dosage: 'garnish' },
    ],
  },
];

/**
 * Restituisce il sottoinsieme ridotto (default 10%) di ingredienti e ricette test per l'Account di Prova
 */
export function getTrialDataset(ratio = 0.1): {
  database: FlavorDatabase;
  presets: PresetRecipe[];
  maxIngredients: number;
  totalIngredients: number;
  totalPresets: number;
} {
  const safeRatio = clamp(ratio, 0.05, 1);
  const totalIngredients = SEED_DATABASE.ingredients.length;
  const totalPresets = PRESET_RECIPES.length;

  const maxIngredients = Math.max(1, Math.round(totalIngredients * safeRatio));
  const maxPresets = Math.max(1, Math.round(totalPresets * safeRatio));

  const trialPresets = PRESET_RECIPES.slice(0, maxPresets);

  // Garantisce che gli ingredienti usati dalle ricette test del 10% (e dalla Carbonara d'esempio) siano inclusi nel 10%
  const priorityIds = new Set<string>();
  for (const preset of trialPresets) {
    for (const item of preset.items) {
      priorityIds.add(item.ingredientId);
    }
  }
  for (const id of [
    'ing_pasta_semolina',
    'ing_pork_guanciale',
    'ing_egg_yolk',
    'ing_pecorino',
    'ing_black_pepper',
    'ing_evoo',
    'ing_apple_vinegar',
  ]) {
    priorityIds.add(id);
  }

  const selected: Ingredient[] = [];
  const selectedIds = new Set<string>();

  for (const ing of SEED_DATABASE.ingredients) {
    if (priorityIds.has(ing.id) && selected.length < maxIngredients) {
      selected.push(ing);
      selectedIds.add(ing.id);
    }
  }

  for (const ing of SEED_DATABASE.ingredients) {
    if (selected.length >= maxIngredients) break;
    if (!selectedIds.has(ing.id)) {
      selected.push(ing);
      selectedIds.add(ing.id);
    }
  }

  return {
    database: {
      ingredients: selected,
      techniques: SEED_DATABASE.techniques,
    },
    presets: trialPresets,
    maxIngredients,
    totalIngredients,
    totalPresets,
  };
}
