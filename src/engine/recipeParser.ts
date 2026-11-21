import { ITALIAN_HISTORICAL_SAMPLES } from '../data/italianHistoricalRecipes';
import { normalizeIngredient } from '../data/seedData';
import {
  AROMA_KEYS,
  AROMA_META,
  DishSimulationResult,
  DOSAGE_META,
  Dosage,
  FlavorDatabase,
  Ingredient,
  IngredientCategory,
  MOUTHFEEL_KEYS,
  MOUTHFEEL_META,
  TASTE_KEYS,
  TASTE_META,
} from '../types/flavor';

export interface ExtractedRecipeItem {
  id: string;
  originalText: string;
  quantityText: string;
  ingredientId: string;
  matchedName: string;
  techniqueId: string;
  dosage: Dosage;
  reason: string;
  source: 'database' | 'ai_estimated';
  customIngredient?: Ingredient;
}

export interface RecipeAnalysisResult {
  title: string;
  servings: string | null;
  summary: string;
  chefNotes: string[];
  engine: 'ai' | 'local';
  provider?: string | null;
  model?: string | null;
  fallbackNotice?: string | null;
  sourcePdfName?: string | null;
  sourcePdfPages?: number | null;
  items: ExtractedRecipeItem[];
  unmatched: string[];
  analyzedAt: string;
}

export interface SavedRecipeCharacteristics {
  balanceScore: number;
  harmonyBreakdown: {
    tasteBalance: number;
    textureContrast: number;
    aromaticCoherence: number;
    temporalFlow: number;
  };
  narrative: string;
  rawTaste: DishSimulationResult['rawTaste'];
  perceivedTaste: DishSimulationResult['perceived']['taste'];
  rawMouthfeel: DishSimulationResult['rawMouthfeel'];
  perceivedMouthfeel: DishSimulationResult['perceived']['mouthfeel'];
  topAromas: { key: string; label: string; value: number }[];
  topBridges: {
    nameA: string;
    nameB: string;
    similarity: number;
    sharedAromas: string[];
  }[];
  temporalCurve: {
    phase: string;
    label: string;
    window: string;
    intensity: number;
    drivers: string[];
  }[];
  diagnostics: {
    severity: 'warning' | 'info' | 'success';
    title: string;
    message: string;
  }[];
}

export interface SavedRecipe {
  id: string;
  title: string;
  servings: string | null;
  recipeText: string;
  summary: string;
  chefNotes: string[];
  userNotes: string;
  engine: 'ai' | 'local';
  provider?: string | null;
  model?: string | null;
  sourcePdfName?: string | null;
  sourcePdfPages?: number | null;
  items: ExtractedRecipeItem[];
  characteristics: SavedRecipeCharacteristics | null;
  createdAt: string;
  updatedAt: string;
}

export function buildSavedCharacteristics(
  simulation: DishSimulationResult
): SavedRecipeCharacteristics {
  const topAromas = [...AROMA_KEYS]
    .map((k) => ({
      key: k,
      label: AROMA_META[k].short,
      value: simulation.rawAromas[k],
    }))
    .filter((a) => a.value >= 1.0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const topBridges = simulation.molecularBridges.slice(0, 4).map((b) => ({
    nameA: b.nameA.split(' (')[0],
    nameB: b.nameB.split(' (')[0],
    similarity: b.similarity,
    sharedAromas: b.sharedAromas.map((s) => s.label),
  }));

  return {
    balanceScore: simulation.balanceScore,
    harmonyBreakdown: { ...simulation.harmonyBreakdown },
    narrative: simulation.narrative,
    rawTaste: { ...simulation.rawTaste },
    perceivedTaste: { ...simulation.perceived.taste },
    rawMouthfeel: { ...simulation.rawMouthfeel },
    perceivedMouthfeel: { ...simulation.perceived.mouthfeel },
    topAromas,
    topBridges,
    temporalCurve: simulation.temporalCurve.map((t) => ({
      phase: t.phase,
      label: t.label,
      window: t.window,
      intensity: t.intensity,
      drivers: [...t.drivers],
    })),
    diagnostics: simulation.diagnostics.map((d) => ({
      severity: d.severity,
      title: d.title,
      message: d.message,
    })),
  };
}

export interface RecipeSample {
  id: string;
  label: string;
  title: string;
  text: string;
}

export const SAMPLE_RECIPES: RecipeSample[] = [
  ...ITALIAN_HISTORICAL_SAMPLES,
  {
    id: 'sample_risotto_funghi',
    label: 'Risotto Porcini & Rosmarino',
    title: 'Risotto ai Funghi Porcini, Burro Nocciola e Limone',
    text: `Ingredienti (per 4 persone):
- 320 g di riso Carnaroli
- 250 g di funghi porcini freschi
- 1 cipolla dorata
- 60 g di burro vaccino
- 50 g di parmigiano reggiano 24 mesi
- 1 spicchio d'aglio
- 1 rametto di rosmarino fresco
- Scorza di 1 limone
- 2 cucchiai di olio extravergine d'oliva
- Sale fino q.b.

Procedimento:
Stufa lentamente la cipolla tritata. Rosola i funghi porcini a fiamma alta con aglio e rosmarino per sviluppare la reazione di Maillard.
Tosta e risotta il riso Carnaroli aggiungendo brodo caldo poco alla volta.
A fine cottura manteca con parmigiano e burro nocciola profumato, completando a crudo con scorza di limone.`,
  },
  {
    id: 'sample_salmone_miso',
    label: 'Salmone Glassato Miso & Lime',
    title: 'Salmone Scottato, Glassa al Miso, Avocado e Lime',
    text: `Ingredienti (per 2 persone):
- 300 g di salmone fresco
- 2 cucchiai di miso bianco dolce
- 1 cucchiaio di salsa di soia
- 1 cucchiaio di miele
- 1 avocado maturo
- Succo e scorza di 1 lime
- 10 g di zenzero fresco grattugiato
- Olio di sesamo tostato q.b.
- Peperoncino rosso fresco a crudo

Procedimento:
Emulsiona miso, soia e miele. Scotta il salmone in padella ad alta temperatura fino a ottenere una crosticina caramellata.
Servi su fettine di avocado al naturale con succo di lime, zenzero fresco, olio di sesamo e peperoncino.`,
  },
];

function stripAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function tokenize(str: string): string[] {
  return stripAccents(str)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

// Sinonimi culinari italiani -> parole chiave del catalogo FlavorEngine
const ITALIAN_SYNONYMS: { patterns: RegExp[]; targetKeywords: string[] }[] = [
  { patterns: [/\b(spaghetti|rigatoni|penne|fusilli|linguine|bucatini|mezze maniche|tagliatelle|pasta)\b/i], targetKeywords: ['pasta', 'semola'] },
  { patterns: [/\b(riso|carnaroli|arborio|vialone)\b/i], targetKeywords: ['riso', 'carnaroli'] },
  { patterns: [/\b(olio evo|olio extravergine|olio d'?oliva|olio di oliva)\b/i], targetKeywords: ['olio', 'extravergine', 'evo'] },
  { patterns: [/\b(tuorlo|tuorli|uovo|uova)\b/i], targetKeywords: ['tuorlo', 'uovo'] },
  { patterns: [/\b(parmigiano|grana)\b/i], targetKeywords: ['parmigiano'] },
  { patterns: [/\b(pecorino)\b/i], targetKeywords: ['pecorino'] },
  { patterns: [/\b(guanciale)\b/i], targetKeywords: ['guanciale'] },
  { patterns: [/\b(pancetta|lardo)\b/i], targetKeywords: ['pancetta', 'guanciale', 'maiale'] },
  { patterns: [/\b(sale|sale fino|sale grosso|sale marino|fior di sale)\b/i], targetKeywords: ['sale marino'] },
  { patterns: [/\b(pepe nero|pepe in grani|pepe macinato|\bpepe\b)\b/i], targetKeywords: ['pepe nero'] },
  { patterns: [/\b(peperoncino|chili)\b/i], targetKeywords: ['peperoncino'] },
  { patterns: [/\b(pomodoro|pomodori|pomodorini|passata|pelati|san marzano)\b/i], targetKeywords: ['pomodoro'] },
  { patterns: [/\b(cipolla|cipolle|scalogno)\b/i], targetKeywords: ['cipolla'] },
  { patterns: [/\b(aglio|spicchio d'?aglio)\b/i], targetKeywords: ['aglio'] },
  { patterns: [/\b(burro)\b/i], targetKeywords: ['burro'] },
  { patterns: [/\b(limone|limoni)\b/i], targetKeywords: ['limone'] },
  { patterns: [/\b(lime)\b/i], targetKeywords: ['lime'] },
  { patterns: [/\b(arancia|arance)\b/i], targetKeywords: ['arancia'] },
  { patterns: [/\b(funghi|porcini|champignon|cremini)\b/i], targetKeywords: ['funghi', 'porcini'] },
  { patterns: [/\b(manzo|vitello|bistecca|filetto di manzo|taglio reale)\b/i], targetKeywords: ['manzo'] },
  { patterns: [/\b(pollo|coscia di pollo|petto di pollo)\b/i], targetKeywords: ['pollo'] },
  { patterns: [/\b(anatra|magret)\b/i], targetKeywords: ['anatra'] },
  { patterns: [/\b(agnello|abbacchio)\b/i], targetKeywords: ['agnello'] },
  { patterns: [/\b(salmone)\b/i], targetKeywords: ['salmone'] },
  { patterns: [/\b(tonno)\b/i], targetKeywords: ['tonno'] },
  { patterns: [/\b(polpo|polipo)\b/i], targetKeywords: ['polpo'] },
  { patterns: [/\b(gamberi|gambero|mazzancolle)\b/i], targetKeywords: ['gambero'] },
  { patterns: [/\b(vongole)\b/i], targetKeywords: ['vongole'] },
  { patterns: [/\b(capasanta|capesante)\b/i], targetKeywords: ['capasanta'] },
  { patterns: [/\b(baccala|merluzzo)\b/i], targetKeywords: ['baccala', 'merluzzo'] },
  { patterns: [/\b(acciughe|alici)\b/i], targetKeywords: ['acciuga', 'alici'] },
  { patterns: [/\b(patata|patate)\b/i], targetKeywords: ['patata'] },
  { patterns: [/\b(zucca)\b/i], targetKeywords: ['zucca'] },
  { patterns: [/\b(melanzana|melanzane)\b/i], targetKeywords: ['melanzana'] },
  { patterns: [/\b(carciofo|carciofi)\b/i], targetKeywords: ['carciofo'] },
  { patterns: [/\b(asparago|asparagi)\b/i], targetKeywords: ['asparagi'] },
  { patterns: [/\b(cavolfiore)\b/i], targetKeywords: ['cavolfiore'] },
  { patterns: [/\b(radicchio)\b/i], targetKeywords: ['radicchio'] },
  { patterns: [/\b(sedano)\b/i], targetKeywords: ['sedano'] },
  { patterns: [/\b(finocchio|finocchi)\b/i], targetKeywords: ['finocchio'] },
  { patterns: [/\b(barbabietola|rapa rossa)\b/i], targetKeywords: ['barbabietola'] },
  { patterns: [/\b(avocado)\b/i], targetKeywords: ['avocado'] },
  { patterns: [/\b(ceci)\b/i], targetKeywords: ['ceci'] },
  { patterns: [/\b(mela|mele)\b/i], targetKeywords: ['mela'] },
  { patterns: [/\b(pera|pere)\b/i], targetKeywords: ['pera'] },
  { patterns: [/\b(mango)\b/i], targetKeywords: ['mango'] },
  { patterns: [/\b(lampone|lamponi)\b/i], targetKeywords: ['lampone'] },
  { patterns: [/\b(burrata|stracciatella)\b/i], targetKeywords: ['burrata'] },
  { patterns: [/\b(ricotta)\b/i], targetKeywords: ['ricotta'] },
  { patterns: [/\b(gorgonzola)\b/i], targetKeywords: ['gorgonzola'] },
  { patterns: [/\b(caprino)\b/i], targetKeywords: ['caprino'] },
  { patterns: [/\b(latte di cocco)\b/i], targetKeywords: ['cocco'] },
  { patterns: [/\b(cioccolato fondente|cioccolato)\b/i], targetKeywords: ['cioccolato'] },
  { patterns: [/\b(caffe|espresso)\b/i], targetKeywords: ['caffe'] },
  { patterns: [/\b(miele)\b/i], targetKeywords: ['miele'] },
  { patterns: [/\b(salsa di soia|soia)\b/i], targetKeywords: ['salsa di soia'] },
  { patterns: [/\b(miso)\b/i], targetKeywords: ['miso'] },
  { patterns: [/\b(aceto balsamico|balsamico)\b/i], targetKeywords: ['aceto balsamico'] },
  { patterns: [/\b(aceto di mele|aceto)\b/i], targetKeywords: ['aceto di mele'] },
  { patterns: [/\b(vino rosso)\b/i], targetKeywords: ['vino rosso'] },
  { patterns: [/\b(nocciole|nocciola)\b/i], targetKeywords: ['nocciola'] },
  { patterns: [/\b(noci|noce)\b/i], targetKeywords: ['noce'] },
  { patterns: [/\b(olio di sesamo|sesamo)\b/i], targetKeywords: ['sesamo'] },
  { patterns: [/\b(basilico)\b/i], targetKeywords: ['basilico'] },
  { patterns: [/\b(rosmarino)\b/i], targetKeywords: ['rosmarino'] },
  { patterns: [/\b(salvia)\b/i], targetKeywords: ['salvia'] },
  { patterns: [/\b(menta)\b/i], targetKeywords: ['menta'] },
  { patterns: [/\b(prezzemolo)\b/i], targetKeywords: ['prezzemolo'] },
  { patterns: [/\b(coriandolo)\b/i], targetKeywords: ['coriandolo'] },
  { patterns: [/\b(zenzero)\b/i], targetKeywords: ['zenzero'] },
  { patterns: [/\b(curcuma)\b/i], targetKeywords: ['curcuma'] },
  { patterns: [/\b(zafferano)\b/i], targetKeywords: ['zafferano'] },
  { patterns: [/\b(cannella)\b/i], targetKeywords: ['cannella'] },
  { patterns: [/\b(cumino)\b/i], targetKeywords: ['cumino'] },
  { patterns: [/\b(cardamomo)\b/i], targetKeywords: ['cardamomo'] },
  { patterns: [/\b(tartufo)\b/i], targetKeywords: ['tartufo'] },
  { patterns: [/\b(capperi)\b/i], targetKeywords: ['capperi'] },
  { patterns: [/\b(bottarga)\b/i], targetKeywords: ['bottarga'] },
  { patterns: [/\b(colatura)\b/i], targetKeywords: ['colatura'] },
];

const TECHNIQUE_RULES: { techId: string; label: string; regex: RegExp }[] = [
  { techId: 'tech_risottatura', label: 'Risottatura', regex: /\b(risott\w*|tosta\w*\s+il\s+riso|brodo\s+caldo)\b/i },
  { techId: 'tech_carpione_escabeche', label: 'Carpione / Scapece', regex: /\b(carpione|scapece|escabeche)\b/i },
  { techId: 'tech_agrodolce', label: 'Agrodolce / Saor', regex: /\b(agrodolce|in\s+saor|\bsaor\b)\b/i },
  { techId: 'tech_salt_crust_bake', label: 'Crosta di sale / Argilla', regex: /\b(crosta\s+di\s+sale|in\s+argilla)\b/i },
  { techId: 'tech_cartoccio_papillote', label: 'Al Cartoccio / Papillote', regex: /\b(cartoccio|papillote)\b/i },
  { techId: 'tech_bain_marie_custard', label: 'Bagnomaria', regex: /\b(bagnomaria)\b/i },
  { techId: 'tech_pressure_cook', label: 'Pentola a pressione', regex: /\b(pentola\s+a\s+pressione|a\s+pressione)\b/i },
  { techId: 'tech_wood_oven_bake', label: 'Forno a legna', regex: /\b(forno\s+a\s+legna)\b/i },
  { techId: 'tech_gratin_broil', label: 'Gratinatura / Salamandra', regex: /\b(gratin\w*|salamandra|au\s+gratin)\b/i },
  { techId: 'tech_wok_stir_fry', label: 'Salto al Wok', regex: /\b(wok|stir[\s-]?fry)\b/i },
  { techId: 'tech_tempura_batter_fry', label: 'Frittura in pastella / Tempura / Panatura', regex: /\b(tempura|pastella|impanat\w*|panatura|cotoletta|dorat\w*\s+e\s+fritt\w*)\b/i },
  { techId: 'tech_flambe', label: 'Flambatura', regex: /\b(flamb[eé]\w*|flambar\w*)\b/i },
  { techId: 'tech_blackening_char', label: 'Bruciatura / Cannello / Charring', regex: /\b(cannello|bruciacchi\w*|carbonizz\w*|charr\w*)\b/i },
  { techId: 'tech_dehydration_chips', label: 'Essiccazione / Disidratazione', regex: /\b(essiccat\w*|disidrat\w*|essiccatore|chips)\b/i },
  { techId: 'tech_siphon_espuma', label: 'Spuma al sifone / Aria', regex: /\b(sifone|spuma|espuma|aria\s+di|lecitina)\b/i },
  { techId: 'tech_gelification_spherification', label: 'Gelificazione / Sferificazione', regex: /\b(sferific\w*|agar[\s-]?agar|alginato|gelificat\w*|gelatina\s+di|colla\s+di\s+pesce)\b/i },
  { techId: 'tech_koji_enzymatic', label: 'Maturazione Koji', regex: /\b(koji|shio[\s-]?koji)\b/i },
  { techId: 'tech_dry_aging_frollatura', label: 'Frollatura / Dry Aging', regex: /\b(frollat\w*|dry[\s-]?ag\w*)\b/i },
  { techId: 'tech_cold_smoke', label: 'Affumicatura a freddo', regex: /\b(affumic\w*\s+a\s+freddo)\b/i },
  { techId: 'tech_light_smoke', label: 'Affumicatura a caldo', regex: /\b(affumic\w*|fume|smoke)\b/i },
  { techId: 'tech_quick_pickle', label: 'Sottaceto / Pickling', regex: /\b(sottaceto|pickl\w*|giardiniera)\b/i },
  { techId: 'tech_wet_brining', label: 'Salamoia liquida', regex: /\b(salamoia|wet\s+brin\w*)\b/i },
  { techId: 'tech_dry_cure', label: 'Salagione a secco', regex: /\b(salagion\w*|gravlax|dry\s+brin\w*|marinat\w*\s+a\s+secco)\b/i },
  { techId: 'tech_maceration_syrup', label: 'Macerazione', regex: /\b(macerat\w*|macerazion\w*|sciroppo)\b/i },
  { techId: 'tech_lacto_ferment', label: 'Latto-fermentazione', regex: /\b(ferment\w*|lattoferment\w*)\b/i },
  { techId: 'tech_cryo_granita', label: 'Granita / Sottozero', regex: /\b(granita|sorbetto|sottozero|congel\w*|abbatt\w*)\b/i },
  { techId: 'tech_acid_marinade', label: 'Marinatura acida', regex: /\b(marin\w*|ceviche|carpaccio\s+marinato)\b/i },
  { techId: 'tech_charcoal_grill', label: 'Brace / Griglia', regex: /\b(brace|grigli\w*|bbq|barbecue|carbone|yakitori)\b/i },
  { techId: 'tech_brown_butter_infusion', label: 'Burro nocciola / Infusione a caldo', regex: /\b(burro\s+nocciola|nocciolat\w*|infusion\w*\s+a\s+caldo)\b/i },
  { techId: 'tech_cold_infusion_oil', label: 'Infusione a freddo in olio', regex: /\b(olio\s+aromatizz\w*|infusion\w*\s+a\s+freddo|in\s+infusione\s+nell'?olio)\b/i },
  { techId: 'tech_confit_fat', label: 'Confit', regex: /\b(confit)\b/i },
  { techId: 'tech_sous_vide', label: 'Sous-vide / CBT', regex: /\b(sous[\s-]?vide|bassa\s+temperatura|\bcbt\b|sottovuoto)\b/i },
  { techId: 'tech_deep_fry', label: 'Frittura a immersione', regex: /\b(frigg\w*|fritt\w*|olio\s+bollente)\b/i },
  { techId: 'tech_caramel_glaze_lacquer', label: 'Glassatura / Laccatura', regex: /\b(glassat\w*|glassar\w*|laccat\w*|laccar\w*|teriyaki)\b/i },
  { techId: 'tech_wine_reduction', label: 'Deglassatura / Riduzione', regex: /\b(riduzion\w*|ridurr\w*|ridott\w*|deglass\w*|sfum\w*)\b/i },
  { techId: 'tech_cold_emulsion_mayo', label: 'Emulsione a freddo', regex: /\b(maionese|aioli|citronette|vinaigrette|emulsion\w*\s+a\s+freddo)\b/i },
  { techId: 'tech_veloute_puree', label: 'Vellutata / Purè / Crema frullata', regex: /\b(vellutata|pur[eè]|frull\w*|crema\s+liscia|passat\w*)\b/i },
  { techId: 'tech_emulsion_mantecatura', label: 'Mantecatura / Emulsione', regex: /\b(mantec\w*|emulsion\w*|crema\s+di)\b/i },
  { techId: 'tech_pan_saute_soffritto', label: 'Soffritto aromatico', regex: /\b(soffrigg\w*|soffritto|battuto|imbiondir\w*|rosola\w*\s+dolcemente)\b/i },
  { techId: 'tech_long_braise_stracotto', label: 'Brasatura / Stracotto lento', regex: /\b(brasat\w*|brasar\w*|stracotto|rag[uù]|peposo|genovese|cuocere\s+lentamente\s+per\s+\d+\s*or)\b/i },
  { techId: 'tech_stew_guazzetto', label: 'Umido / Guazzetto / Acqua pazza', regex: /\b(in\s+umido|guazzetto|acqua\s+pazza|cacciucco|zuppa)\b/i },
  { techId: 'tech_broth_extraction', label: 'Brodo / Fondo / Dashi', regex: /\b(brodo|sobbolli\w*|dashi|fondo\s+bruno|fumetto)\b/i },
  { techId: 'tech_dry_toast_spices', label: 'Tostatura a secco', regex: /\b(tostat\w*|tostare)\b/i },
  { techId: 'tech_caramelize_braise', label: 'Stufatura / Caramellizzazione', regex: /\b(stuf\w*|caramell\w*|appass\w*)\b/i },
  { techId: 'tech_oven_roast', label: 'Arrostitura al Forno', regex: /\b(in\s+forno|al\s+forno|inforn\w*|forno\s+statico|forno\s+ventilato)\b/i },
  { techId: 'tech_maillard_sear', label: 'Rosolatura / Maillard', regex: /\b(rosol\w*|scott\w*|arrost\w*|padella\s+a\s+fuoco\s+vivo|croccant\w*|maillard|dorat\w*|saltat\w*)\b/i },
  { techId: 'tech_blanch_shock', label: 'Sbollentatura / Blanching', regex: /\b(sbollent\w*|acqua\s+e\s+ghiaccio|blanch\w*)\b/i },
  { techId: 'tech_steam_poach', label: 'Vapore / Poché', regex: /\b(vapore|poch[eé]|in\s+camicia)\b/i },
  { techId: 'tech_boiling_water', label: 'Bollitura / Lessatura', regex: /\b(bollit\w*|less\w*|al\s+dente|acqua\s+salata|acqua\s+bollente)\b/i },
];

const STOP_LINES_REGEX =
  /^(ingredienti|procedimento|preparazione|metodo|istruzioni|note|per\s+\d+\s+persone|dosi|tempo|difficolta|step\s*\d+)\b[:\s]*$/i;

function extractQuantityInfo(line: string): { quantityText: string; gramsEstimate: number | null; cleaned: string } {
  const cleanedLine = line.replace(/^[\s\-•*·\d.)]+/, '').trim();

  // Pattern tipo "320 g di spaghetti", "2 cucchiai di olio", "q.b."
  const qtyRegex =
    /^(\d+(?:[.,]\d+)?\s*(?:kg|g|gr|grammi|ml|cl|l|litri|cucchiai[oa]?|cucchiain[oi]?|spicch[io]|ramett[oi]|fogli[ae]|pizzic[hi]+|fett[ae]|tazz[ae]|bicchier[ei]|mezzo|mezza)?)\s*(?:di\s+)?/i;
  const match = cleanedLine.match(qtyRegex);

  let quantityText = '';
  let gramsEstimate: number | null = null;
  let rest = cleanedLine;

  if (match && match[1] && /\d/.test(match[1])) {
    quantityText = match[1].trim();
    rest = cleanedLine.slice(match[0].length).trim();

    const numMatch = quantityText.match(/(\d+(?:[.,]\d+)?)/);
    const num = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : 0;
    const unit = stripAccents(quantityText);
    if (/\bkg\b/.test(unit)) gramsEstimate = num * 1000;
    else if (/\b(g|gr|grammi|ml)\b/.test(unit)) gramsEstimate = num;
    else if (/\bcl\b/.test(unit)) gramsEstimate = num * 10;
    else if (/\b(l|litri)\b/.test(unit)) gramsEstimate = num * 1000;
    else if (/cucchiain/.test(unit)) gramsEstimate = num * 5;
    else if (/cucchiai/.test(unit)) gramsEstimate = num * 15;
    else if (/spicch|ramett|pizzic|fogli/.test(unit)) gramsEstimate = num * 4;
    else if (/bicchier|tazz/.test(unit)) gramsEstimate = num * 180;
    else gramsEstimate = num * 45; // es. "5 tuorli", "1 cipolla"
  } else if (/\bq\.?\s*b\.?\b/i.test(cleanedLine)) {
    quantityText = 'q.b.';
    gramsEstimate = 5;
    rest = cleanedLine.replace(/\bq\.?\s*b\.?\b/gi, '').trim();
  }

  return { quantityText: quantityText || 'q.b.', gramsEstimate, cleaned: rest || cleanedLine };
}

function findBestDatabaseIngredient(text: string, ingredients: Ingredient[]): Ingredient | null {
  const norm = stripAccents(text);
  if (norm.length < 2) return null;

  // 1. Controlla sinonimi italiani mirati
  for (const syn of ITALIAN_SYNONYMS) {
    if (syn.patterns.some((p) => p.test(norm))) {
      const candidate = ingredients.find((ing) => {
        const ingNorm = stripAccents(ing.name);
        return syn.targetKeywords.every((kw) => ingNorm.includes(kw));
      });
      if (candidate) return candidate;

      const partialCandidate = ingredients.find((ing) => {
        const ingNorm = stripAccents(ing.name);
        return syn.targetKeywords.some((kw) => ingNorm.includes(kw));
      });
      if (partialCandidate) return partialCandidate;
    }
  }

  // 2. Match testuale / tokenizzato su tutto il catalogo
  const lineTokens = tokenize(norm);
  let bestIng: Ingredient | null = null;
  let bestScore = 0;

  for (const ing of ingredients) {
    const ingBase = stripAccents(ing.name.split('(')[0].trim());
    const ingFull = stripAccents(ing.name);
    if (ingBase.length >= 3 && norm.includes(ingBase)) {
      const score = 100 + ingBase.length;
      if (score > bestScore) {
        bestScore = score;
        bestIng = ing;
      }
      continue;
    }

    const ingTokens = tokenize(ingFull);
    if (ingTokens.length === 0) continue;

    let overlap = 0;
    for (const it of ingTokens) {
      if (it.length < 3) continue;
      const stem = it.slice(0, Math.max(4, it.length - 1));
      if (lineTokens.some((lt) => lt === it || (lt.length >= 4 && lt.startsWith(stem)))) {
        overlap += it.length >= 5 ? 2 : 1;
      }
    }

    if (overlap >= 2) {
      const score = (overlap / ingTokens.length) * 60 + overlap * 8;
      if (score > bestScore) {
        bestScore = score;
        bestIng = ing;
      }
    }
  }

  return bestScore >= 24 ? bestIng : null;
}

function inferTechniqueForIngredient(
  ingredient: Ingredient,
  originalLine: string,
  procedureSentences: string[],
  validTechIds: Set<string>
): { techniqueId: string; reason: string } {
  const ingMainWord = stripAccents(ingredient.name.split('(')[0].split(' ')[0]);

  // Cerca prima nella riga stessa dell'ingrediente
  for (const rule of TECHNIQUE_RULES) {
    if (validTechIds.has(rule.techId) && rule.regex.test(originalLine)) {
      return { techniqueId: rule.techId, reason: `Rilevato nella riga (${rule.label})` };
    }
  }

  // Poi cerca nelle frasi del procedimento che nominano questo ingrediente
  const matchingSentences = procedureSentences.filter((s) => {
    const ns = stripAccents(s);
    if (ingMainWord.length >= 4 && ns.includes(ingMainWord.slice(0, ingMainWord.length - 1))) {
      return true;
    }
    return false;
  });

  const searchContext = matchingSentences.join(' ');
  if (searchContext) {
    if (/\b(a\s+crudo|al\s+naturale|a\s+fine\s+cottura|completando)\b/i.test(searchContext)) {
      return { techniqueId: 'tech_raw', reason: 'Aggiunto a crudo / finitura' };
    }
    for (const rule of TECHNIQUE_RULES) {
      if (validTechIds.has(rule.techId) && rule.regex.test(searchContext)) {
        return { techniqueId: rule.techId, reason: `Dedotto dal procedimento (${rule.label})` };
      }
    }
  }

  // Default sensato per categoria
  if (
    ingredient.category === 'acid' ||
    ingredient.category === 'umami_condiment' ||
    ingredient.category === 'herb_spice'
  ) {
    return { techniqueId: 'tech_raw', reason: 'Condimento / aroma a crudo' };
  }

  return { techniqueId: 'tech_raw', reason: 'Base a crudo (modificabile)' };
}

function inferDosage(
  ingredient: Ingredient,
  gramsEstimate: number | null,
  maxGrams: number,
  index: number
): Dosage {
  if (
    ingredient.category === 'acid' ||
    ingredient.category === 'umami_condiment' ||
    ingredient.category === 'herb_spice'
  ) {
    return 'garnish';
  }

  if (gramsEstimate !== null && maxGrams > 0) {
    const ratio = gramsEstimate / maxGrams;
    if (ratio >= 0.55) return 'main';
    if (ratio >= 0.16) return 'secondary';
    return 'garnish';
  }

  if (ingredient.category === 'fat') return 'garnish';
  if (index === 0) return 'main';
  return 'secondary';
}

export function parseRecipeLocally(
  recipeTitle: string,
  recipeText: string,
  database: FlavorDatabase
): RecipeAnalysisResult {
  const lines = recipeText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Separa sezione ingredienti da procedimento se presente
  const procIdx = lines.findIndex((l) =>
    /^(procedimento|preparazione|metodo|istruzioni)\b/i.test(stripAccents(l))
  );
  const ingredientLines = procIdx > 0 ? lines.slice(0, procIdx) : lines;
  const procedureText = procIdx > 0 ? lines.slice(procIdx + 1).join(' ') : recipeText;
  const procedureSentences = procedureText.split(/[.!?;]+/).map((s) => s.trim()).filter(Boolean);

  // Deduzione titolo e porzioni
  let title = recipeTitle.trim();
  let servings: string | null = null;
  const servMatch = recipeText.match(/per\s+(\d+(?:\s*[-–]\s*\d+)?\s*(?:persone|porzioni|commensali))/i);
  if (servMatch) servings = servMatch[1];

  if (!title && lines.length > 0) {
    const first = lines[0];
    if (
      first.length <= 70 &&
      !/^[-•*\d]/.test(first) &&
      !/^(ingredienti|procedimento|preparazione)/i.test(first)
    ) {
      title = first.replace(/[:\-]+$/, '').trim();
    } else {
      title = 'Ricetta Analizzata';
    }
  }

  const validTechIds = new Set(database.techniques.map((t) => t.id));
  const rawMatches: {
    originalText: string;
    quantityText: string;
    gramsEstimate: number | null;
    ingredient: Ingredient;
  }[] = [];
  const seenIngIds = new Set<string>();
  const unmatched: string[] = [];

  for (const line of ingredientLines) {
    if (STOP_LINES_REGEX.test(stripAccents(line))) continue;
    if (/^ingredienti\b/i.test(stripAccents(line))) continue;
    if (line === title) continue;

    // Se la riga è molto lunga e sembra una frase narrativa di procedimento, saltala se abbiamo già trovato righe elenco
    const looksLikeBullet = /^[-•*·\d]/.test(line) || /\b(g|gr|ml|kg|cucchiai|spicchi|q\.?b\.?)\b/i.test(line);
    if (!looksLikeBullet && line.length > 90 && procIdx === -1) {
      continue;
    }

    const { quantityText, gramsEstimate, cleaned } = extractQuantityInfo(line);
    const matched = findBestDatabaseIngredient(cleaned, database.ingredients);

    if (matched) {
      if (!seenIngIds.has(matched.id)) {
        seenIngIds.add(matched.id);
        rawMatches.push({
          originalText: cleaned,
          quantityText,
          gramsEstimate,
          ingredient: matched,
        });
      }
    } else if (looksLikeBullet && cleaned.length >= 3 && cleaned.length <= 70) {
      unmatched.push(cleaned);
    }
  }

  // Se l'utente ha incollato o allegato un PDF con paragrafi discorsivi o colonne unite, scansiona anche il resto del testo
  if (rawMatches.length < 2) {
    const chunks = recipeText.split(/[,.;\n]+/).map((c) => c.trim()).filter(Boolean);
    for (const chunk of chunks) {
      const { quantityText, gramsEstimate, cleaned } = extractQuantityInfo(chunk);
      const matched = findBestDatabaseIngredient(cleaned, database.ingredients);
      if (matched && !seenIngIds.has(matched.id)) {
        seenIngIds.add(matched.id);
        rawMatches.push({
          originalText: cleaned.slice(0, 65),
          quantityText,
          gramsEstimate,
          ingredient: matched,
        });
      }
    }
  }

  const maxGrams = rawMatches.reduce((m, r) => Math.max(m, r.gramsEstimate ?? 0), 0);

  const items: ExtractedRecipeItem[] = rawMatches.map((m, idx) => {
    const { techniqueId, reason } = inferTechniqueForIngredient(
      m.ingredient,
      m.originalText,
      procedureSentences,
      validTechIds
    );
    const dosage = inferDosage(m.ingredient, m.gramsEstimate, maxGrams, idx);
    return {
      id: `rec_${m.ingredient.id}_${idx}_${Date.now()}`,
      originalText: m.originalText,
      quantityText: m.quantityText,
      ingredientId: m.ingredient.id,
      matchedName: m.ingredient.name,
      techniqueId,
      dosage,
      reason,
      source: 'database',
    };
  });

  // Assicuriamoci che ci sia almeno un 'main' se ci sono ingredienti
  if (items.length > 0 && !items.some((i) => i.dosage === 'main')) {
    items[0].dosage = 'main';
  }

  // Comprensione automatica della ricetta (Struttura, Protagonisti, Tecniche, Tempi e Temperature)
  const techMap = new Map(database.techniques.map((t) => [t.id, t.name]));
  const mainItems = items.filter((i) => i.dosage === 'main').map((i) => i.matchedName.split(' (')[0]);
  const activeTechniques = Array.from(
    new Set(
      items
        .filter((i) => i.techniqueId !== 'tech_raw')
        .map((i) => techMap.get(i.techniqueId)?.split(' (')[0] || i.techniqueId)
    )
  );
  const timeMatches = recipeText.match(/\b\d+\s*(?:minuti|min|ore|ora|secondi)\b/gi) || [];
  const tempMatches = recipeText.match(/\b\d{2,3}\s*°\s*C?\b/gi) || [];

  const summary =
    items.length > 0
      ? `Ricetta compresa e strutturata attorno a ${mainItems.join(' e ') || items[0].matchedName} (${items.length} ingredienti rilevati)${
          activeTechniques.length > 0
            ? `, con trasformazioni termiche/chimiche basate su ${activeTechniques.slice(0, 3).join(', ').toLowerCase()}`
            : ' con lavorazione prevalentemente a crudo'
        }.`
      : 'Nessun ingrediente del database riconosciuto automaticamente. Prova a elencare gli ingredienti uno per riga oppure attiva l’analisi IA.';

  const chefNotes: string[] = [];
  if (items.length > 0) {
    if (activeTechniques.length > 0) {
      chefNotes.push(
        `Comprensione procedimento: individuate ${activeTechniques.length} tecniche di trasformazione (${activeTechniques.join(', ')}) applicate agli ingredienti estratti.`
      );
    } else {
      chefNotes.push(
        'Comprensione procedimento: nessuna cottura intensa rilevata nel testo; puoi personalizzare le tecniche di cottura di ogni ingrediente direttamente nella tabella.'
      );
    }
    if (timeMatches.length > 0 || tempMatches.length > 0) {
      const params = [...tempMatches.slice(0, 2), ...timeMatches.slice(0, 2)].join(', ');
      chefNotes.push(
        `Parametri tecnici rilevati nel documento: ${params}.`
      );
    }
    const categories = new Set(rawMatches.map((r) => r.ingredient.category));
    if (!categories.has('acid') && (categories.has('fat') || categories.has('dairy') || categories.has('protein_meat'))) {
      chefNotes.push(
        'Consiglio di bilanciamento: la ricetta presenta componenti lipidiche/proteiche senza un acido dichiarato; valuta una finitura agrumata o acida per pulire il palato.'
      );
    } else if (items.length >= 3) {
      chefNotes.push(
        `Architettura ricetta: ${items.filter((i) => i.dosage === 'main').length} protagonista, ${items.filter((i) => i.dosage === 'secondary').length} comprimari e ${items.filter((i) => i.dosage === 'garnish').length} condimenti/finiture.`
      );
    }
  }

  return {
    title: title || 'Ricetta Analizzata',
    servings,
    summary,
    chefNotes,
    engine: 'local',
    items,
    unmatched: unmatched.slice(0, 10),
    analyzedAt: new Date().toISOString(),
  };
}

const VALID_CATEGORIES = new Set<IngredientCategory>([
  'protein_meat',
  'protein_fish',
  'vegetable',
  'fruit',
  'dairy',
  'fat',
  'acid',
  'herb_spice',
  'umami_condiment',
]);

export function normalizeAiRecipeResponse(
  raw: Record<string, unknown>,
  fallbackTitle: string,
  database: FlavorDatabase,
  provider?: string | null,
  model?: string | null
): RecipeAnalysisResult {
  const ingMap = new Map(database.ingredients.map((i) => [i.id, i]));
  const techSet = new Set(database.techniques.map((t) => t.id));

  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items: ExtractedRecipeItem[] = [];

  rawItems.forEach((entry: unknown, idx: number) => {
    if (!entry || typeof entry !== 'object') return;
    const obj = entry as Record<string, unknown>;
    const originalText = String(obj.originalText || obj.matchedName || '').trim();
    if (!originalText) return;

    const quantityText = String(obj.quantityText || 'q.b.').trim();
    const rawTech = String(obj.techniqueId || 'tech_raw');
    const techniqueId = techSet.has(rawTech) ? rawTech : 'tech_raw';
    const rawDosage = String(obj.dosage || 'secondary');
    const dosage: Dosage =
      rawDosage === 'main' || rawDosage === 'secondary' || rawDosage === 'garnish'
        ? rawDosage
        : 'secondary';
    const reason = String(obj.reason || 'Analisi IA').trim();

    const rawIngId = typeof obj.ingredientId === 'string' ? obj.ingredientId : null;
    if (rawIngId && ingMap.has(rawIngId)) {
      const dbIng = ingMap.get(rawIngId)!;
      items.push({
        id: `ai_${dbIng.id}_${idx}_${Date.now()}`,
        originalText,
        quantityText,
        ingredientId: dbIng.id,
        matchedName: dbIng.name,
        techniqueId,
        dosage,
        reason,
        source: 'database',
      });
      return;
    }

    // Se l'IA ha generato un profilo custom per un ingrediente non in database
    if (obj.customIngredient && typeof obj.customIngredient === 'object') {
      const ci = obj.customIngredient as Record<string, unknown>;
      const cat = VALID_CATEGORIES.has(ci.category as IngredientCategory)
        ? (ci.category as IngredientCategory)
        : 'vegetable';
      const customId = `ing_ai_${stripAccents(originalText)
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 28)}_${idx}`;

      const normalizedCustom = normalizeIngredient({
        id: customId,
        name: String(obj.matchedName || originalText).trim(),
        category: cat,
        composition: (ci.composition as Ingredient['composition']) || {
          water: 0.7,
          protein: 0.05,
          carbs_sugars: 0.1,
          fat: 0.05,
        },
        base_state: (ci.base_state as Ingredient['base_state']) || {
          volume: 3,
          temporal_peak: 'mid',
          taste: { sweet: 1, sour: 0, salty: 0, bitter: 0, umami: 1 },
          mouthfeel: {
            pungency: 0,
            astringency: 0,
            richness: 1,
            crunchiness: 1,
            juiciness: 3,
            creaminess: 1,
          },
          aromas: {
            sulfurous: 0,
            green_herbaceous: 1,
            citrus_terpenic: 0,
            floral: 0,
            fruity_ester: 0,
            roasted_pyrazine: 0,
            caramel_sweet: 0,
            lactic_buttery: 0,
            umami_funky: 0,
            earthy_mineral: 1,
            spicy_phenolic: 0,
            marine_iodine: 0,
          },
        },
      });

      items.push({
        id: `ai_custom_${idx}_${Date.now()}`,
        originalText,
        quantityText,
        ingredientId: normalizedCustom.id,
        matchedName: normalizedCustom.name,
        techniqueId,
        dosage,
        reason,
        source: 'ai_estimated',
        customIngredient: normalizedCustom,
      });
    }
  });

  const chefNotes = Array.isArray(raw.chefNotes)
    ? raw.chefNotes.map((n) => String(n).trim()).filter(Boolean).slice(0, 5)
    : [];

  const unmatched = Array.isArray(raw.unmatched)
    ? raw.unmatched.map((u) => String(u).trim()).filter(Boolean)
    : [];

  return {
    title: String(raw.title || fallbackTitle || 'Ricetta Analizzata').trim(),
    servings: raw.servings ? String(raw.servings).trim() : null,
    summary: String(raw.summary || '').trim(),
    chefNotes,
    engine: 'ai',
    provider: provider || null,
    model: model || null,
    items,
    unmatched,
    analyzedAt: new Date().toISOString(),
  };
}

export function buildMarkdownReport(
  analysis: RecipeAnalysisResult,
  simulation: DishSimulationResult
): string {
  const lines: string[] = [];
  lines.push(`# Report Sensoriale: ${analysis.title}`);
  if (analysis.servings) lines.push(`**Porzioni:** ${analysis.servings}`);
  lines.push(
    `**Motore:** ${analysis.engine === 'ai' ? `IA (${analysis.provider?.toUpperCase() || 'AI'}) + FlavorEngine` : 'Parser Locale + FlavorEngine'}`
  );
  lines.push(`**Indice di Armonia:** ${simulation.balanceScore} / 100`);
  lines.push('');

  if (analysis.summary) {
    lines.push(`> ${analysis.summary}`);
    lines.push('');
  }

  lines.push('## 1. Ingredienti e Tecniche Rilevate');
  lines.push('| Ingrediente | Quantità | Tecnica di Cottura | Ruolo | Origine |');
  lines.push('|---|---|---|---|---|');
  for (const item of analysis.items) {
    const simItem = simulation.items.find((s) => s.item.instanceId === item.id);
    const techName = simItem ? simItem.technique.name : item.techniqueId;
    lines.push(
      `| ${item.matchedName} | ${item.quantityText} | ${techName} | ${DOSAGE_META[item.dosage].label} | ${item.source === 'ai_estimated' ? 'Stimato da IA' : 'Database'} |`
    );
  }
  lines.push('');

  lines.push('## 2. Sintesi al Palato');
  lines.push(simulation.narrative);
  lines.push('');
  lines.push(
    `- **Equilibrio Gusto:** ${simulation.harmonyBreakdown.tasteBalance}/100`
  );
  lines.push(
    `- **Contrasto Texture:** ${simulation.harmonyBreakdown.textureContrast}/100`
  );
  lines.push(
    `- **Ponti Aromatici:** ${simulation.harmonyBreakdown.aromaticCoherence}/100`
  );
  lines.push(
    `- **Flusso Temporale:** ${simulation.harmonyBreakdown.temporalFlow}/100`
  );
  lines.push('');

  lines.push('## 3. Profilo dei Sapori Primari (0–10)');
  for (const k of TASTE_KEYS) {
    lines.push(
      `- **${TASTE_META[k].label}:** Percepito ${simulation.perceived.taste[k].toFixed(1)} (Grezzo ${simulation.rawTaste[k].toFixed(1)})`
    );
  }
  lines.push('');

  lines.push('## 4. Profilo Tattile & Mouthfeel (0–10)');
  for (const k of MOUTHFEEL_KEYS) {
    lines.push(
      `- **${MOUTHFEEL_META[k].label}:** ${simulation.perceived.mouthfeel[k].toFixed(1)}`
    );
  }
  lines.push('');

  const topAromas = [...AROMA_KEYS]
    .map((k) => ({ key: k, val: simulation.rawAromas[k] }))
    .filter((a) => a.val >= 1.5)
    .sort((a, b) => b.val - a.val);

  if (topAromas.length > 0) {
    lines.push('## 5. Famiglie Aromatiche Dominanti');
    for (const a of topAromas) {
      lines.push(`- **${AROMA_META[a.key].label}** (${AROMA_META[a.key].molecules}): ${a.val.toFixed(1)}/10`);
    }
    lines.push('');
  }

  if (simulation.molecularBridges.length > 0) {
    lines.push('## 6. Ponti Molecolari Principali');
    for (const b of simulation.molecularBridges.slice(0, 5)) {
      const shared = b.sharedAromas.map((s) => s.label).join(', ') || 'Contrasto';
      lines.push(`- **${b.nameA} ↔ ${b.nameB}:** ${b.similarity}% (${shared})`);
    }
    lines.push('');
  }

  lines.push('## 7. Curva Temporale del Boccone');
  for (const p of simulation.temporalCurve) {
    lines.push(`- **${p.label} (${p.window}):** ${p.intensity.toFixed(1)}/10 — ${p.drivers.join(', ')}`);
  }
  lines.push('');

  if (simulation.diagnostics.length > 0) {
    lines.push('## 8. Diagnosi dello Chef');
    for (const d of simulation.diagnostics) {
      lines.push(`- **${d.title}:** ${d.message}`);
    }
    lines.push('');
  }

  if (analysis.chefNotes.length > 0) {
    lines.push('## 9. Note Gastronomiche IA');
    for (const n of analysis.chefNotes) {
      lines.push(`- ${n}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function openPrintableReport(
  analysis: RecipeAnalysisResult,
  simulation: DishSimulationResult
): void {
  const win = window.open('', '_blank', 'width=960,height=840');
  if (!win) return;

  const topAromas = [...AROMA_KEYS]
    .map((k) => ({ key: k, val: simulation.rawAromas[k] }))
    .filter((a) => a.val >= 1.0)
    .sort((a, b) => b.val - a.val)
    .slice(0, 8);

  const html = `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>Report Sensoriale - ${escapeHtml(analysis.title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1c1917;
      background: #ffffff;
      margin: 0;
      padding: 32px;
      line-height: 1.5;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #d97706;
      padding-bottom: 16px;
      margin-bottom: 22px;
    }
    h1 { margin: 0 0 4px; font-size: 24px; color: #111827; }
    .meta { font-size: 12px; color: #57534e; }
    .score-box {
      text-align: center;
      border: 2px solid #d97706;
      border-radius: 12px;
      padding: 10px 18px;
      background: #fffbeb;
    }
    .score-val { font-size: 26px; font-weight: 800; color: #b45309; line-height: 1; }
    .score-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c; margin-top: 4px; }
    h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #92400e;
      border-bottom: 1px solid #e7e5e4;
      padding-bottom: 4px;
      margin: 22px 0 10px;
    }
    .narrative {
      background: #fafaf9;
      border-left: 3px solid #d97706;
      padding: 10px 14px;
      margin: 12px 0;
      color: #292524;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border-bottom: 1px solid #e7e5e4; padding: 7px 8px; text-align: left; font-size: 12px; }
    th { background: #f5f5f4; font-weight: 600; color: #44403c; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
    .card { border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px; background: #fafaf9; }
    .bar-row { margin-bottom: 6px; }
    .bar-head { display: flex; justify-content: space-between; font-size: 12px; }
    .bar-bg { height: 7px; background: #e7e5e4; border-radius: 999px; overflow: hidden; margin-top: 3px; }
    .bar-fill { height: 100%; background: #d97706; border-radius: 999px; }
    ul { margin: 6px 0; padding-left: 18px; }
    li { margin-bottom: 4px; }
    @media print {
      body { padding: 16px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${escapeHtml(analysis.title)}</h1>
      <div class="meta">
        FlavorEngine &bull; Report Sensoriale Ricetta
        ${analysis.servings ? ` &bull; ${escapeHtml(analysis.servings)}` : ''}
        &bull; ${new Date(analysis.analyzedAt).toLocaleString('it-IT')}
      </div>
    </div>
    <div class="score-box">
      <div class="score-val">${simulation.balanceScore}/100</div>
      <div class="score-lbl">Indice Armonia</div>
    </div>
  </div>

  <div class="narrative">${escapeHtml(simulation.narrative)}</div>

  <div class="grid4">
    <div class="card"><strong>Equilibrio Gusto</strong><br/>${simulation.harmonyBreakdown.tasteBalance}/100</div>
    <div class="card"><strong>Contrasto Texture</strong><br/>${simulation.harmonyBreakdown.textureContrast}/100</div>
    <div class="card"><strong>Ponti Aromatici</strong><br/>${simulation.harmonyBreakdown.aromaticCoherence}/100</div>
    <div class="card"><strong>Flusso Temporale</strong><br/>${simulation.harmonyBreakdown.temporalFlow}/100</div>
  </div>

  <h2>Ingredienti e Tecniche di Cottura</h2>
  <table>
    <thead>
      <tr><th>Ingrediente</th><th>Quantità</th><th>Tecnica</th><th>Ruolo</th></tr>
    </thead>
    <tbody>
      ${analysis.items
        .map((it) => {
          const simIt = simulation.items.find((s) => s.item.instanceId === it.id);
          return `<tr>
            <td><strong>${escapeHtml(it.matchedName)}</strong></td>
            <td>${escapeHtml(it.quantityText)}</td>
            <td>${escapeHtml(simIt ? simIt.technique.name : it.techniqueId)}</td>
            <td>${escapeHtml(DOSAGE_META[it.dosage].label)}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>

  <div class="grid2">
    <div>
      <h2>Sapori Primari (Percepito / Grezzo)</h2>
      ${TASTE_KEYS.map(
        (k) => `<div class="bar-row">
          <div class="bar-head"><span>${escapeHtml(TASTE_META[k].label)}</span><strong>${simulation.perceived.taste[k].toFixed(1)} / 10</strong></div>
          <div class="bar-bg"><div class="bar-fill" style="width:${Math.min(100, simulation.perceived.taste[k] * 10)}%"></div></div>
        </div>`
      ).join('')}
    </div>
    <div>
      <h2>Profilo Tattile &amp; Mouthfeel</h2>
      ${MOUTHFEEL_KEYS.map(
        (k) => `<div class="bar-row">
          <div class="bar-head"><span>${escapeHtml(MOUTHFEEL_META[k].label)}</span><strong>${simulation.perceived.mouthfeel[k].toFixed(1)} / 10</strong></div>
          <div class="bar-bg"><div class="bar-fill" style="width:${Math.min(100, simulation.perceived.mouthfeel[k] * 10)}%;background:#0284c7"></div></div>
        </div>`
      ).join('')}
    </div>
  </div>

  <h2>Spettro Aromatico Dominante</h2>
  <div class="grid2">
    ${topAromas
      .map(
        (a) => `<div class="bar-row">
          <div class="bar-head"><span>${escapeHtml(AROMA_META[a.key].label)}</span><strong>${a.val.toFixed(1)}</strong></div>
          <div class="bar-bg"><div class="bar-fill" style="width:${Math.min(100, a.val * 10)}%;background:${AROMA_META[a.key].color}"></div></div>
        </div>`
      )
      .join('')}
  </div>

  <h2>Curva Temporale del Boccone</h2>
  <div class="grid3">
    ${simulation.temporalCurve
      .map(
        (p) => `<div class="card">
          <strong>${escapeHtml(p.label)} (${escapeHtml(p.window)})</strong>
          <div style="font-size:18px;font-weight:700;color:#b45309;margin:4px 0">${p.intensity.toFixed(1)} / 10</div>
          <div style="font-size:11px;color:#57534e">${escapeHtml(p.drivers.join(' • '))}</div>
        </div>`
      )
      .join('')}
  </div>

  ${
    simulation.diagnostics.length > 0
      ? `<h2>Diagnosi dello Chef</h2>
      <ul>${simulation.diagnostics
        .map((d) => `<li><strong>${escapeHtml(d.title)}:</strong> ${escapeHtml(d.message)}</li>`)
        .join('')}</ul>`
      : ''
  }

  ${
    analysis.chefNotes.length > 0
      ? `<h2>Note Gastronomiche IA</h2>
      <ul>${analysis.chefNotes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>`
      : ''
  }

  <script>window.onload = () => { setTimeout(() => window.print(), 250); };</script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}
