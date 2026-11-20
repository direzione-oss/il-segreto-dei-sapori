import { clamp } from '../data/seedData';
import {
  AROMA_KEYS,
  AROMA_META,
  AromaKey,
  AromaVector,
  CorrectiveSuggestion,
  DiagnosticAlert,
  DishItem,
  DishSimulationResult,
  DOSAGE_META,
  Dosage,
  FlavorDatabase,
  Ingredient,
  MolecularBridge,
  MOUTHFEEL_KEYS,
  MOUTHFEEL_META,
  MouthfeelVector,
  PerceivedProfile,
  PreconditionWarning,
  SensoryDeltaItem,
  SensoryState,
  TASTE_KEYS,
  TASTE_META,
  TasteVector,
  Technique,
  TEMPORAL_META,
  TemporalPhaseResult,
  TransformedDishItem,
} from '../types/flavor';

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Step 1: Verifica Precondizioni Chimiche della Tecnica
 */
export function checkPreconditions(
  ingredient: Ingredient,
  technique: Technique
): PreconditionWarning[] {
  const warnings: PreconditionWarning[] = [];
  const { min_protein, min_carbs_sugars, min_fat } = technique.preconditions || {};

  if (min_protein !== undefined && ingredient.composition.protein < min_protein) {
    warnings.push({
      rule: 'min_protein',
      required: min_protein,
      actual: ingredient.composition.protein,
      message: `Proteine insufficienti (${(ingredient.composition.protein * 100).toFixed(1)}% vs ${(min_protein * 100).toFixed(1)}% richiesti): la reazione di Maillard richiede amminoacidi liberi. Bonus pirazine, caramello e umami ridotti del 75%.`,
    });
  }

  if (min_carbs_sugars !== undefined && ingredient.composition.carbs_sugars < min_carbs_sugars) {
    warnings.push({
      rule: 'min_carbs_sugars',
      required: min_carbs_sugars,
      actual: ingredient.composition.carbs_sugars,
      message: `Zuccheri riducenti insufficienti (${(ingredient.composition.carbs_sugars * 100).toFixed(1)}% vs ${(min_carbs_sugars * 100).toFixed(1)}% richiesti): impossibile innescare una caramellizzazione piena. Bonus caramello, pirazine e umami ridotti del 75%.`,
    });
  }

  if (min_fat !== undefined && ingredient.composition.fat < min_fat) {
    warnings.push({
      rule: 'min_fat',
      required: min_fat,
      actual: ingredient.composition.fat,
      message: `Frazione lipidica insufficiente (${(ingredient.composition.fat * 100).toFixed(1)}% vs ${(min_fat * 100).toFixed(1)}% richiesti): senza grassi non avviene estrazione/nocciolatura lipidica. Bonus pirazine, caramello e umami ridotti del 75%.`,
    });
  }

  return warnings;
}

/**
 * Step 2: Calcolo dello Stato Ingrediente Trasformato
 */
export function transformIngredient(
  item: DishItem,
  ingredient: Ingredient,
  technique: Technique
): TransformedDishItem {
  const warnings = checkPreconditions(ingredient, technique);
  const preconditionsMet = warnings.length === 0;
  const penaltyFactor = preconditionsMet ? 1.0 : 0.25; // Riduzione del 75% sui bonus positivi mirati

  const base = ingredient.base_state;
  const deltas = technique.deltas || {};

  // 1. Aromi
  const aromas = {} as AromaVector;
  for (const k of AROMA_KEYS) {
    const mult = deltas.aroma_multipliers?.[k] ?? 1.0;
    let add = deltas.aroma_add?.[k] ?? 0;
    if (!preconditionsMet && (k === 'roasted_pyrazine' || k === 'caramel_sweet') && add > 0) {
      add = add * penaltyFactor;
    }
    aromas[k] = round1(clamp(base.aromas[k] * mult + add, 0, 10));
  }

  // 2. Gusti
  const taste = {} as TasteVector;
  for (const k of TASTE_KEYS) {
    let add = deltas.taste_add?.[k] ?? 0;
    if (!preconditionsMet && k === 'umami' && add > 0) {
      add = add * penaltyFactor;
    }
    taste[k] = round1(clamp(base.taste[k] + add, 0, 10));
  }

  // 3. Mouthfeel
  const mouthfeel = {} as MouthfeelVector;
  for (const k of MOUTHFEEL_KEYS) {
    const add = deltas.mouthfeel_add?.[k] ?? 0;
    mouthfeel[k] = round1(clamp(base.mouthfeel[k] + add, 0, 10));
  }

  // 4. Volume & Picco Temporale
  const volume = clamp(base.volume + (deltas.volume_shift ?? 0), 1, 5);
  const temporal_peak =
    !deltas.temporal_shift || deltas.temporal_shift === 'keep'
      ? base.temporal_peak
      : deltas.temporal_shift;

  const transformedState: SensoryState = {
    volume,
    temporal_peak,
    taste,
    mouthfeel,
    aromas,
  };

  // Calcola i delta significativi per il confronto Crudo vs Trasformato
  const significantDeltas: SensoryDeltaItem[] = [];

  for (const k of AROMA_KEYS) {
    const diff = round1(transformedState.aromas[k] - base.aromas[k]);
    if (Math.abs(diff) >= 0.4) {
      significantDeltas.push({
        key: k,
        label: AROMA_META[k].short,
        group: 'aroma',
        rawVal: base.aromas[k],
        transformedVal: transformedState.aromas[k],
        delta: diff,
        percentChange: base.aromas[k] > 0.2 ? Math.round((diff / base.aromas[k]) * 100) : null,
      });
    }
  }

  for (const k of TASTE_KEYS) {
    const diff = round1(transformedState.taste[k] - base.taste[k]);
    if (Math.abs(diff) >= 0.4) {
      significantDeltas.push({
        key: k,
        label: TASTE_META[k].short,
        group: 'taste',
        rawVal: base.taste[k],
        transformedVal: transformedState.taste[k],
        delta: diff,
        percentChange: base.taste[k] > 0.2 ? Math.round((diff / base.taste[k]) * 100) : null,
      });
    }
  }

  for (const k of MOUTHFEEL_KEYS) {
    const diff = round1(transformedState.mouthfeel[k] - base.mouthfeel[k]);
    if (Math.abs(diff) >= 0.4) {
      significantDeltas.push({
        key: k,
        label: MOUTHFEEL_META[k].short,
        group: 'mouthfeel',
        rawVal: base.mouthfeel[k],
        transformedVal: transformedState.mouthfeel[k],
        delta: diff,
        percentChange: base.mouthfeel[k] > 0.2 ? Math.round((diff / base.mouthfeel[k]) * 100) : null,
      });
    }
  }

  significantDeltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const doseMultiplier = DOSAGE_META[item.dosage].multiplier;
  const weight = round1(volume * doseMultiplier);

  return {
    item,
    ingredient,
    technique,
    weight,
    doseMultiplier,
    preconditionWarnings: warnings,
    preconditionsMet,
    transformedState,
    significantDeltas,
  };
}

/**
 * Step 3: Aggregazione Ponderata del Piatto
 */
function aggregateDishVectors(items: TransformedDishItem[]): {
  rawTaste: TasteVector;
  rawMouthfeel: MouthfeelVector;
  rawAromas: AromaVector;
  maxCrunch: number;
} {
  const totalWeight = items.reduce((sum, it) => sum + it.weight, 0) || 1;

  const rawTaste = {} as TasteVector;
  for (const k of TASTE_KEYS) {
    const weightedSum = items.reduce((sum, it) => sum + it.transformedState.taste[k] * it.weight, 0);
    const sharedCount = items.filter((it) => it.transformedState.taste[k] >= 0.5).length;
    const saturationBoost = sharedCount >= 2 ? 1.1 : 1.0;
    rawTaste[k] = round1(clamp((weightedSum / totalWeight) * saturationBoost, 0, 10));
  }

  const rawMouthfeel = {} as MouthfeelVector;
  for (const k of MOUTHFEEL_KEYS) {
    const weightedSum = items.reduce(
      (sum, it) => sum + it.transformedState.mouthfeel[k] * it.weight,
      0
    );
    const sharedCount = items.filter((it) => it.transformedState.mouthfeel[k] >= 0.5).length;
    const saturationBoost = sharedCount >= 2 ? 1.1 : 1.0;
    rawMouthfeel[k] = round1(clamp((weightedSum / totalWeight) * saturationBoost, 0, 10));
  }

  const maxCrunch = round1(
    items.reduce((max, it) => Math.max(max, it.transformedState.mouthfeel.crunchiness), 0)
  );

  const rawAromas = {} as AromaVector;
  for (const k of AROMA_KEYS) {
    const weightedSum = items.reduce(
      (sum, it) => sum + it.transformedState.aromas[k] * it.weight,
      0
    );
    const sharedCount = items.filter((it) => it.transformedState.aromas[k] >= 1.5).length;
    const saturationBoost = sharedCount >= 2 ? 1.1 : 1.0;
    rawAromas[k] = round1(clamp((weightedSum / totalWeight) * saturationBoost, 0, 10));
  }

  return { rawTaste, rawMouthfeel, rawAromas, maxCrunch };
}

/**
 * Step 4: Interazioni Psico-Sensoriali al Palato (Percezione Reale vs Chimica)
 */
function computePerceivedProfile(
  rawTaste: TasteVector,
  rawMouthfeel: MouthfeelVector,
  maxCrunch: number
): PerceivedProfile {
  const perceived_bitter = round1(clamp(rawTaste.bitter - rawTaste.salty * 0.35, 0, 10));
  const perceived_heaviness = round1(
    clamp(rawMouthfeel.richness - rawTaste.sour * 0.45 - rawMouthfeel.astringency * 0.25, 0, 10)
  );
  const perceived_savory = round1(
    clamp(
      rawTaste.salty + rawTaste.umami * 0.3 + Math.min(rawTaste.salty, rawTaste.umami) * 0.25,
      0,
      10
    )
  );
  const perceived_sour = round1(clamp(rawTaste.sour - rawTaste.sweet * 0.2, 0, 10));
  const perceived_pungency = round1(
    clamp(rawMouthfeel.pungency - rawTaste.sweet * 0.15 - rawMouthfeel.richness * 0.2, 0, 10)
  );
  const persistence_score = round1(clamp(rawMouthfeel.richness * 0.55 + rawTaste.umami * 0.45, 0, 10));

  const taste: TasteVector = {
    sweet: rawTaste.sweet,
    sour: perceived_sour,
    salty: perceived_savory,
    bitter: perceived_bitter,
    umami: rawTaste.umami,
  };

  const mouthfeel: MouthfeelVector = {
    pungency: perceived_pungency,
    astringency: rawMouthfeel.astringency,
    richness: perceived_heaviness,
    crunchiness: round1(Math.max(rawMouthfeel.crunchiness, maxCrunch * 0.75)),
    juiciness: rawMouthfeel.juiciness,
    creaminess: rawMouthfeel.creaminess,
  };

  return {
    taste,
    mouthfeel,
    perceived_bitter,
    perceived_heaviness,
    perceived_savory,
    perceived_sour,
    perceived_pungency,
    persistence_score,
    max_crunch: maxCrunch,
  };
}

/**
 * Step 5.1: Ponti Molecolari (Cosine Similarity su 12 dimensioni aromatiche)
 */
function computeMolecularBridges(items: TransformedDishItem[]): MolecularBridge[] {
  const bridges: MolecularBridge[] = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const A = items[i];
      const B = items[j];
      const vecA = A.transformedState.aromas;
      const vecB = B.transformedState.aromas;

      let dot = 0;
      let magA = 0;
      let magB = 0;
      const shared: { key: AromaKey; label: string; valA: number; valB: number; score: number }[] = [];

      for (const k of AROMA_KEYS) {
        const va = vecA[k];
        const vb = vecB[k];
        dot += va * vb;
        magA += va * va;
        magB += vb * vb;

        if (va >= 2.0 && vb >= 2.0) {
          shared.push({
            key: k,
            label: AROMA_META[k].short,
            valA: va,
            valB: vb,
            score: Math.min(va, vb) + (va + vb) * 0.25,
          });
        }
      }

      const similarity =
        magA > 0 && magB > 0 ? Math.round((dot / (Math.sqrt(magA) * Math.sqrt(magB))) * 100) : 0;

      shared.sort((x, y) => y.score - x.score);

      bridges.push({
        id: `${A.item.instanceId}__${B.item.instanceId}`,
        itemAId: A.item.instanceId,
        itemBId: B.item.instanceId,
        nameA: A.ingredient.name,
        nameB: B.ingredient.name,
        techniqueA: A.technique.name,
        techniqueB: B.technique.name,
        similarity,
        sharedAromas: shared.slice(0, 2).map(({ key, label, valA, valB }) => ({
          key,
          label,
          valA,
          valB,
        })),
      });
    }
  }

  bridges.sort((a, b) => b.similarity - a.similarity);
  return bridges;
}

/**
 * Step 5.2: Curva Temporale del Boccone (3 fasi)
 */
function computeTemporalCurve(
  items: TransformedDishItem[],
  rawTaste: TasteVector,
  rawMouthfeel: MouthfeelVector,
  rawAromas: AromaVector,
  perceived: PerceivedProfile
): TemporalPhaseResult[] {
  const totalWeight = items.reduce((s, it) => s + it.weight, 0) || 1;

  const phaseWeightRatio = (peak: 'attack' | 'mid' | 'finish') =>
    items
      .filter((it) => it.transformedState.temporal_peak === peak)
      .reduce((s, it) => s + it.weight, 0) / totalWeight;

  // Attacco (0-2s)
  const attackShare = phaseWeightRatio('attack');
  const volatileAromas = Math.max(
    rawAromas.citrus_terpenic,
    rawAromas.fruity_ester,
    rawAromas.green_herbaceous
  );
  const attackIntensity = round1(
    clamp(
      attackShare * 3.5 +
        perceived.perceived_sour * 0.35 +
        rawTaste.sweet * 0.15 +
        volatileAromas * 0.28 +
        perceived.max_crunch * 0.22,
      0,
      10
    )
  );

  const attackDrivers: string[] = [];
  if (perceived.perceived_sour >= 2.2) attackDrivers.push('Spinta acida');
  if (perceived.max_crunch >= 4.5) attackDrivers.push('Impatto croccante');
  if (rawAromas.citrus_terpenic >= 2.5) attackDrivers.push('Terpeni agrumati');
  if (rawAromas.fruity_ester >= 2.5) attackDrivers.push('Esteri fruttati');
  if (rawAromas.green_herbaceous >= 2.5) attackDrivers.push('Note erbacee');
  if (rawTaste.sweet >= 3.0) attackDrivers.push('Dolcezza immediata');
  if (attackDrivers.length === 0) attackDrivers.push('Ingresso morbido');

  // Centro Bocca (3-8s)
  const midShare = phaseWeightRatio('mid');
  const maillardAromas = Math.max(rawAromas.roasted_pyrazine, rawAromas.caramel_sweet);
  const midIntensity = round1(
    clamp(
      midShare * 3.5 +
        perceived.perceived_savory * 0.35 +
        maillardAromas * 0.28 +
        rawMouthfeel.creaminess * 0.15 +
        rawMouthfeel.juiciness * 0.15,
      0,
      10
    )
  );

  const midDrivers: string[] = [];
  if (perceived.perceived_savory >= 3.0) midDrivers.push('Struttura sapido-umami');
  if (rawAromas.roasted_pyrazine >= 2.5) midDrivers.push('Pirazine di Maillard');
  if (rawAromas.caramel_sweet >= 2.5) midDrivers.push('Note caramellate');
  if (rawMouthfeel.creaminess >= 3.5) midDrivers.push('Avvolgenza cremosa');
  if (rawMouthfeel.juiciness >= 4.0) midDrivers.push('Succosità');
  if (midDrivers.length === 0) midDrivers.push('Corpo leggero');

  // Finale e Persistenza (8+s)
  const finishShare = phaseWeightRatio('finish');
  const finishAromas = Math.max(
    rawAromas.spicy_phenolic,
    rawAromas.lactic_buttery,
    rawAromas.umami_funky
  );
  const finishIntensity = round1(
    clamp(
      finishShare * 3.0 +
        perceived.persistence_score * 0.45 +
        perceived.perceived_bitter * 0.15 +
        perceived.perceived_pungency * 0.15 +
        finishAromas * 0.25,
      0,
      10
    )
  );

  const finishDrivers: string[] = [];
  if (perceived.persistence_score >= 3.5) finishDrivers.push('Lunga persistenza');
  if (rawAromas.lactic_buttery >= 2.5) finishDrivers.push('Coda burrosa/lattica');
  if (rawAromas.spicy_phenolic >= 2.5) finishDrivers.push('Scia affumicata/fenolica');
  if (rawAromas.umami_funky >= 2.5) finishDrivers.push('Eco umami stagionato');
  if (perceived.perceived_bitter >= 2.0) finishDrivers.push('Chiusura amaricante');
  if (perceived.perceived_pungency >= 2.5) finishDrivers.push('Calore pungente');
  if (finishDrivers.length === 0) finishDrivers.push('Finale pulito e breve');

  return [
    {
      phase: 'attack',
      label: TEMPORAL_META.attack.label,
      window: TEMPORAL_META.attack.window,
      intensity: attackIntensity,
      drivers: attackDrivers.slice(0, 3),
      activeIngredients: items
        .filter((it) => it.transformedState.temporal_peak === 'attack')
        .map((it) => it.ingredient.name),
    },
    {
      phase: 'mid',
      label: TEMPORAL_META.mid.label,
      window: TEMPORAL_META.mid.window,
      intensity: midIntensity,
      drivers: midDrivers.slice(0, 3),
      activeIngredients: items
        .filter((it) => it.transformedState.temporal_peak === 'mid')
        .map((it) => it.ingredient.name),
    },
    {
      phase: 'finish',
      label: TEMPORAL_META.finish.label,
      window: TEMPORAL_META.finish.window,
      intensity: finishIntensity,
      drivers: finishDrivers.slice(0, 3),
      activeIngredients: items
        .filter((it) => it.transformedState.temporal_peak === 'finish')
        .map((it) => it.ingredient.name),
    },
  ];
}

/**
 * Step 5.3: Calcolo Score di Equilibrio & Diagnosi dello Chef
 */
function computeScoreAndDiagnostics(
  items: TransformedDishItem[],
  _rawTaste: TasteVector,
  rawMouthfeel: MouthfeelVector,
  rawAromas: AromaVector,
  perceived: PerceivedProfile,
  bridges: MolecularBridge[],
  temporalCurve: TemporalPhaseResult[]
): {
  balanceScore: number;
  harmonyBreakdown: DishSimulationResult['harmonyBreakdown'];
  diagnostics: DiagnosticAlert[];
} {
  if (items.length === 0) {
    return {
      balanceScore: 0,
      harmonyBreakdown: {
        tasteBalance: 0,
        textureContrast: 0,
        aromaticCoherence: 0,
        temporalFlow: 0,
      },
      diagnostics: [],
    };
  }

  const diagnostics: DiagnosticAlert[] = [];

  // 1. Taste Balance (0..100)
  let tasteScore = 88;
  if (perceived.perceived_heaviness > 5.5) {
    tasteScore -= Math.min(35, (perceived.perceived_heaviness - 5.0) * 10);
    diagnostics.push({
      id: 'diag_heaviness',
      severity: 'warning',
      title: 'Rischio stucchevolezza (Grassezza non tagliata)',
      message:
        'Piatto ricco ma a rischio stucchevolezza al terzo boccone: serve una spinta acida o agrumata per sgrassare il palato.',
    });
  }

  if (perceived.perceived_savory < 2.5) {
    tasteScore -= Math.min(30, (2.5 - perceived.perceived_savory) * 14);
    diagnostics.push({
      id: 'diag_low_savory',
      severity: 'warning',
      title: 'Struttura sapida debole',
      message:
        'Struttura sapida debole: gli aromi volatili rischiano di risultare piatti senza una base di sale o umami.',
    });
  }

  if (perceived.perceived_savory > 8.5) {
    tasteScore -= (perceived.perceived_savory - 8.5) * 10;
    diagnostics.push({
      id: 'diag_high_savory',
      severity: 'info',
      title: 'Sapidità molto intensa',
      message:
        'La sinergia tra sale e umami è ai massimi livelli: bilancia con una componente dolce, acquosa o amidacea per arrotondare il gusto.',
    });
  }

  if (rawAromas.sulfurous > 5.0 && perceived.perceived_pungency > 5.5) {
    tasteScore -= 24;
    diagnostics.push({
      id: 'diag_sulfurous_pungent',
      severity: 'warning',
      title: 'Dominanza solforosa e pungente',
      message:
        'Dominanza solforosa e pungente aggressiva: valuta una stufatura/caramellizzazione o una marinatura acida per addolcire il profilo.',
    });
  }

  if (perceived.perceived_bitter > 5.5) {
    tasteScore -= (perceived.perceived_bitter - 5.5) * 8;
    diagnostics.push({
      id: 'diag_bitter',
      severity: 'info',
      title: 'Amarezza marcata',
      message:
        'Le note amare emergono in modo deciso: un pizzico di sale o un elemento grasso/dolce aiuta a sopprimerle al palato.',
    });
  }

  // Bonus per presenza di acidità bilanciata quando c'è ricchezza
  if (rawMouthfeel.richness >= 3.5 && perceived.perceived_sour >= 1.5 && perceived.perceived_heaviness <= 4.8) {
    tasteScore += 8;
  }

  tasteScore = Math.round(clamp(tasteScore, 10, 100));

  // 2. Texture Contrast (0..100)
  let textureScore = 78;
  if (perceived.max_crunch < 3.0 && rawMouthfeel.creaminess > 5.5) {
    textureScore -= 36;
    diagnostics.push({
      id: 'diag_monotone_texture',
      severity: 'warning',
      title: 'Texture monotona (Eccesso di morbidezza)',
      message:
        'Texture monotona (troppo morbida/cremosa): aggiungi un elemento croccante o una rosolatura ad alta temperatura per creare contrasto meccanico.',
    });
  } else if (perceived.max_crunch >= 4.0 && (rawMouthfeel.creaminess >= 2.5 || rawMouthfeel.juiciness >= 3.5)) {
    textureScore += 18;
  } else if (perceived.max_crunch >= 3.5) {
    textureScore += 10;
  }

  if (rawMouthfeel.juiciness < 2.0 && rawMouthfeel.richness < 2.5) {
    textureScore -= 15;
    diagnostics.push({
      id: 'diag_dry',
      severity: 'info',
      title: 'Profilo asciutto',
      message:
        'Succosità e avvolgenza lipidica sono basse: un filo d’olio EVO, un grasso o un ingrediente succoso migliorerà la scorrevolezza del boccone.',
    });
  }
  textureScore = Math.round(clamp(textureScore, 15, 100));

  // 3. Aromatic Coherence (0..100)
  let aromaticScore = 65;
  if (bridges.length > 0) {
    const strongBridges = bridges.filter((b) => b.similarity >= 40 && b.sharedAromas.length > 0);
    const avgTopSim =
      bridges.slice(0, Math.min(3, bridges.length)).reduce((s, b) => s + b.similarity, 0) /
      Math.min(3, bridges.length);
    aromaticScore = Math.round(clamp(45 + avgTopSim * 0.5 + strongBridges.length * 7, 25, 100));
  } else {
    aromaticScore = 55;
  }

  // Penalità lieve se ci sono avvisi chimici di precondizioni non soddisfatte
  const failedPreconditions = items.filter((it) => !it.preconditionsMet).length;
  if (failedPreconditions > 0) {
    aromaticScore = Math.max(20, aromaticScore - failedPreconditions * 10);
  }

  // 4. Temporal Flow (0..100)
  const [att, mid, fin] = temporalCurve;
  const activePhases = [att.intensity, mid.intensity, fin.intensity].filter((v) => v >= 2.5).length;
  const temporalBalancePenalty =
    Math.max(0, Math.abs(att.intensity - mid.intensity) - 4.5) * 4 +
    Math.max(0, Math.abs(mid.intensity - fin.intensity) - 4.5) * 4;
  const temporalFlow = Math.round(
    clamp(42 + activePhases * 18 - temporalBalancePenalty + (perceived.persistence_score >= 3.0 ? 6 : 0), 20, 100)
  );

  const balanceScore = Math.round(
    clamp(
      tasteScore * 0.36 + textureScore * 0.24 + aromaticScore * 0.22 + temporalFlow * 0.18,
      0,
      100
    )
  );

  // Aggiungi feedback positivo se non ci sono warning critici e lo score è alto
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;
  if (warningCount === 0 && items.length >= 2) {
    diagnostics.push({
      id: 'diag_balanced',
      severity: 'success',
      title: 'Architettura sensoriale equilibrata',
      message:
        'Le tensioni tra grassezza, acidità, sapidità e contrasto meccanico risultano ben calibrate al palato.',
    });
  }

  return {
    balanceScore,
    harmonyBreakdown: {
      tasteBalance: tasteScore,
      textureContrast: textureScore,
      aromaticCoherence: aromaticScore,
      temporalFlow,
    },
    diagnostics,
  };
}

/**
 * Genera la sintesi narrativa automatica dall'attacco al finale
 */
function buildNarrative(
  items: TransformedDishItem[],
  rawAromas: AromaVector,
  perceived: PerceivedProfile,
  bridges: MolecularBridge[],
  temporalCurve: TemporalPhaseResult[]
): string {
  if (items.length === 0) {
    return 'Aggiungi uno o più ingredienti nella colonna sinistra per simulare l’evoluzione sensoriale del piatto al palato.';
  }

  const [att, mid, fin] = temporalCurve;
  const topAromas = [...AROMA_KEYS]
    .map((k) => ({ key: k, val: rawAromas[k] }))
    .filter((a) => a.val >= 2.0)
    .sort((a, b) => b.val - a.val)
    .slice(0, 2);

  const attackDesc =
    att.intensity >= 5.5
      ? `L’attacco è brillante e immediato (${att.drivers.join(', ').toLowerCase()})`
      : att.intensity >= 3.0
        ? `L’ingresso al palato è misurato, guidato da ${att.drivers[0].toLowerCase()}`
        : `L’attacco è soffuso e privo di spigoli acidi o croccanti`;

  const midDesc =
    mid.intensity >= 5.5
      ? `nel centro bocca si apre un corpo pieno sostenuto da ${mid.drivers.slice(0, 2).join(' e ').toLowerCase()}`
      : `al centro bocca prevale una trama leggera (${mid.drivers[0].toLowerCase()})`;

  const finishDesc =
    perceived.persistence_score >= 4.5
      ? `il finale è lungo e avvolgente (${fin.drivers[0].toLowerCase()}, persistenza ${perceived.persistence_score.toFixed(1)}/10)`
      : `la chiusura è pulita e di media durata (persistenza ${perceived.persistence_score.toFixed(1)}/10)`;

  const aromaText =
    topAromas.length > 0
      ? ` Lo spettro olfattivo è dominato da ${topAromas.map((a) => AROMA_META[a.key].label.toLowerCase()).join(' e ')}.`
      : '';

  const bridgeText =
    bridges.length > 0 && bridges[0].sharedAromas.length > 0 && bridges[0].similarity >= 35
      ? ` Il ponte molecolare più forte (${bridges[0].similarity}%) lega ${bridges[0].nameA.split(' (')[0]} e ${bridges[0].nameB.split(' (')[0]} su ${bridges[0].sharedAromas.map((s) => s.label.toLowerCase()).join(' e ')}.`
      : '';

  return `${attackDesc}; ${midDesc}, mentre ${finishDesc}.${aromaText}${bridgeText}`;
}

/**
 * Calcolo core senza suggerimenti (usato anche dal simulatore interno per i suggerimenti)
 */
function simulateCore(dishItems: DishItem[], db: FlavorDatabase) {
  const ingMap = new Map(db.ingredients.map((i) => [i.id, i]));
  const techMap = new Map(db.techniques.map((t) => [t.id, t]));
  const fallbackTech = db.techniques.find((t) => t.id === 'tech_raw') ?? db.techniques[0];

  const transformedItems: TransformedDishItem[] = [];
  for (const item of dishItems) {
    const ing = ingMap.get(item.ingredientId);
    if (!ing) continue;
    const tech = techMap.get(item.techniqueId) ?? fallbackTech;
    transformedItems.push(transformIngredient(item, ing, tech));
  }

  const { rawTaste, rawMouthfeel, rawAromas, maxCrunch } = aggregateDishVectors(transformedItems);
  const perceived = computePerceivedProfile(rawTaste, rawMouthfeel, maxCrunch);
  const molecularBridges = computeMolecularBridges(transformedItems);
  const temporalCurve = computeTemporalCurve(
    transformedItems,
    rawTaste,
    rawMouthfeel,
    rawAromas,
    perceived
  );
  const { balanceScore, harmonyBreakdown, diagnostics } = computeScoreAndDiagnostics(
    transformedItems,
    rawTaste,
    rawMouthfeel,
    rawAromas,
    perceived,
    molecularBridges,
    temporalCurve
  );
  const narrative = buildNarrative(
    transformedItems,
    rawAromas,
    perceived,
    molecularBridges,
    temporalCurve
  );

  return {
    items: transformedItems,
    rawTaste,
    rawMouthfeel,
    rawAromas,
    perceived,
    molecularBridges,
    temporalCurve,
    balanceScore,
    harmonyBreakdown,
    narrative,
    diagnostics,
  };
}

/**
 * Step 5.4: Suggeritore Automatico ("Cosa manca al piatto?")
 */
function computeCorrectiveSuggestions(
  dishItems: DishItem[],
  db: FlavorDatabase,
  baseResult: ReturnType<typeof simulateCore>
): CorrectiveSuggestion[] {
  if (dishItems.length === 0) return [];

  const existingIngIds = new Set(dishItems.map((d) => d.ingredientId));
  const rawTech = db.techniques.find((t) => t.id === 'tech_raw') ?? db.techniques[0];

  const baseStrongBridges = baseResult.molecularBridges.filter(
    (b) => b.similarity >= 40 && b.sharedAromas.length > 0
  ).length;

  const candidates: (CorrectiveSuggestion & { rankValue: number })[] = [];

  for (const ing of db.ingredients) {
    if (existingIngIds.has(ing.id)) continue;

    // Scegli tecniche sensate per questo ingrediente (a crudo + tecniche le cui precondizioni sono soddisfatte)
    const candidateTechs: Technique[] = [rawTech];
    for (const tech of db.techniques) {
      if (tech.id === rawTech.id) continue;
      if (checkPreconditions(ing, tech).length === 0) {
        // Evita marinature acide su ingredienti già puramente acidi o sale
        if (tech.id === 'tech_acid_marinade' && (ing.category === 'acid' || ing.category === 'umami_condiment')) {
          continue;
        }
        // Evita vapore su sale/olio/acidi
        if (
          tech.id === 'tech_steam_poach' &&
          (ing.category === 'acid' || ing.category === 'fat' || ing.category === 'umami_condiment')
        ) {
          continue;
        }
        candidateTechs.push(tech);
      }
    }

    const dosage: Dosage =
      ing.category === 'acid' || ing.category === 'umami_condiment' || ing.category === 'herb_spice' || ing.category === 'fat'
        ? 'garnish'
        : 'secondary';

    let bestForIngredient: (CorrectiveSuggestion & { rankValue: number }) | null = null;

    for (const tech of candidateTechs) {
      const testDish: DishItem[] = [
        ...dishItems,
        {
          instanceId: '__sim_candidate__',
          ingredientId: ing.id,
          techniqueId: tech.id,
          dosage,
        },
      ];

      const sim = simulateCore(testDish, db);
      const scoreGain = sim.balanceScore - baseResult.balanceScore;
      const newStrongBridges =
        sim.molecularBridges.filter((b) => b.similarity >= 40 && b.sharedAromas.length > 0).length -
        baseStrongBridges;

      // Calcola il rank combinando miglioramento equilibrio + nuovi ponti molecolari
      const rankValue = scoreGain * 1.4 + Math.max(0, newStrongBridges) * 4.5;

      if (!bestForIngredient || rankValue > bestForIngredient.rankValue) {
        // Costruisci una motivazione chiara in italiano
        const reasons: string[] = [];
        if (baseResult.perceived.perceived_heaviness > 5.5 && sim.perceived.perceived_heaviness < baseResult.perceived.perceived_heaviness - 0.8) {
          reasons.push('taglia la grassezza percepita con la sua acidità');
        }
        if (baseResult.perceived.perceived_savory < 2.5 && sim.perceived.perceived_savory > baseResult.perceived.perceived_savory + 0.8) {
          reasons.push('rinforza la struttura sapido-umami');
        }
        if (baseResult.perceived.max_crunch < 3.5 && sim.perceived.max_crunch >= 5.0) {
          reasons.push('introduce contrasto croccante al morso');
        }
        if (newStrongBridges > 0) {
          reasons.push(
            `crea ${newStrongBridges} nuov${newStrongBridges === 1 ? 'o ponte molecolare' : 'i ponti molecolari'}`
          );
        }
        if (reasons.length === 0) {
          if (scoreGain > 0) {
            reasons.push('migliora l’armonia complessiva e la curva temporale del piatto');
          } else {
            reasons.push('arricchisce la complessità aromatica del profilo');
          }
        }

        bestForIngredient = {
          ingredient: ing,
          technique: tech,
          dosage,
          projectedScore: sim.balanceScore,
          scoreGain,
          newBridgesCount: Math.max(0, newStrongBridges),
          reason: reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1) + (reasons[1] ? ` e ${reasons[1]}` : '') + '.',
          rankValue,
        };
      }
    }

    if (bestForIngredient) {
      candidates.push(bestForIngredient);
    }
  }

  candidates.sort((a, b) => b.rankValue - a.rankValue);

  return candidates.slice(0, 2).map(({ rankValue: _r, ...rest }) => rest);
}

/**
 * Entry point principale del motore FlavorEngine
 */
export function simulateDish(dishItems: DishItem[], db: FlavorDatabase): DishSimulationResult {
  const core = simulateCore(dishItems, db);
  const suggestions = computeCorrectiveSuggestions(dishItems, db, core);
  return {
    ...core,
    suggestions,
  };
}
