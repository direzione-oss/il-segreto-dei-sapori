import { useEffect, useMemo, useRef, useState } from 'react';
import { AccountModal } from './components/AccountModal';
import { ActivationScreen } from './components/ActivationScreen';
import { DatabaseModal } from './components/DatabaseModal';
import { DishBuilder } from './components/DishBuilder';
import { AppView, Header } from './components/Header';
import { IngredientStudio } from './components/IngredientStudio';
import { LoginScreen } from './components/LoginScreen';
import { PalateSimulator } from './components/PalateSimulator';
import { RecipeAnalyzer } from './components/RecipeAnalyzer';
import { getTrialDataset, normalizeIngredient, PRESET_RECIPES, SEED_DATABASE } from './data/seedData';
import { simulateDish } from './engine/flavorEngine';
import { AuthUser, PaymentConfig } from './types/auth';
import {
  DishItem,
  DishPhase,
  Dosage,
  FlavorDatabase,
  Ingredient,
  PresetRecipe,
  Technique,
} from './types/flavor';

const SEED_INGREDIENT_IDS = new Set(SEED_DATABASE.ingredients.map((i) => i.id));

function buildPresetDishAndPhases(preset: PresetRecipe): {
  items: DishItem[];
  phases: DishPhase[];
} {
  const ts = Date.now();
  const mainRaw = preset.items.filter((it) => it.dosage === 'main');
  const secRaw = preset.items.filter((it) => it.dosage === 'secondary');
  const garRaw = preset.items.filter((it) => it.dosage === 'garnish');

  const phases: DishPhase[] = [];
  const items: DishItem[] = [];

  const p1Id = `${preset.id}_phase_1`;
  const p1Tech = mainRaw[0]?.techniqueId || preset.items[0]?.techniqueId || 'tech_raw';
  phases.push({
    id: p1Id,
    order: 1,
    title: 'Preparazione Base & Protagonista',
    defaultTechniqueId: p1Tech,
    outputName: 'Semilavorato Fase 1',
    usesPreviousPhaseIds: [],
    timeMinutes: p1Tech === 'tech_raw' ? 5 : 12,
    temperatureCelsius: p1Tech === 'tech_raw' ? null : 180,
  });

  for (const [idx, it] of (mainRaw.length > 0 ? mainRaw : preset.items.slice(0, 1)).entries()) {
    items.push({
      ...it,
      instanceId: `${preset.id}_m_${idx}_${ts}`,
      phaseId: p1Id,
      quantity: 160,
      unit: 'g',
    });
  }

  let lastPhaseId = p1Id;

  if (secRaw.length > 0) {
    const p2Id = `${preset.id}_phase_2`;
    const p2Tech = secRaw[0]?.techniqueId || 'tech_emulsion_mantecatura';
    phases.push({
      id: p2Id,
      order: phases.length + 1,
      title: 'Cottura Comprimari & Legame',
      defaultTechniqueId: p2Tech,
      outputName: 'Semilavorato Fase 2',
      usesPreviousPhaseIds: [lastPhaseId],
      timeMinutes: 10,
      temperatureCelsius: p2Tech === 'tech_raw' ? null : 110,
    });
    for (const [idx, it] of secRaw.entries()) {
      items.push({
        ...it,
        instanceId: `${preset.id}_s_${idx}_${ts}`,
        phaseId: p2Id,
        quantity: 80,
        unit: 'g',
      });
    }
    lastPhaseId = p2Id;
  }

  if (garRaw.length > 0) {
    const p3Id = `${preset.id}_phase_3`;
    const p3Tech = garRaw[0]?.techniqueId || 'tech_raw';
    phases.push({
      id: p3Id,
      order: phases.length + 1,
      title: 'Finitura, Condimento & Impiattamento',
      defaultTechniqueId: p3Tech,
      outputName: 'Piatto Finito',
      usesPreviousPhaseIds: [lastPhaseId],
      timeMinutes: 3,
      temperatureCelsius: null,
    });
    for (const [idx, it] of garRaw.entries()) {
      items.push({
        ...it,
        instanceId: `${preset.id}_g_${idx}_${ts}`,
        phaseId: p3Id,
        quantity: 15,
        unit: 'g',
      });
    }
  }

  return { items, phases };
}

export function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    paymentUrl: 'https://www.paypal.me/StudioSerra',
    iban: '',
    bankBeneficiary: 'Studio Serra',
    contactEmail: 'direzione@serrastudio.it',
    contactPhone: '',
    plansText: '',
    welcomeMessage: '',
    promoEnabled: true,
    promoCode: 'PROVA-SAPORI',
    promoDays: 30,
  });
  const [pendingSubscriberCount, setPendingSubscriberCount] = useState<number>(0);

  const isUserAllowed = (u: AuthUser | null): boolean => {
    if (!u) return false;
    if (u.role === 'admin' || u.role === 'trial' || u.isTrial) return true;
    if (u.status !== 'active') return false;
    if (u.expiresAt && new Date(u.expiresAt + 'T23:59:59') < new Date()) return false;
    return true;
  };

  const isTrialUser = currentUser?.role === 'trial' || Boolean(currentUser?.isTrial);
  const trialInfo = useMemo(
    () => getTrialDataset(currentUser?.dataQuotaRatio || 0.1),
    [currentUser?.dataQuotaRatio]
  );
  const availablePresets = isTrialUser ? trialInfo.presets : PRESET_RECIPES;

  const [database, setDatabase] = useState<FlavorDatabase>(SEED_DATABASE);
  const [dbLoadedForUser, setDbLoadedForUser] = useState(false);
  const skipNextSaveRef = useRef(true);

  const initialPresetSetup = useMemo(() => buildPresetDishAndPhases(PRESET_RECIPES[0]), []);
  const [activeView, setActiveView] = useState<AppView>('simulator');
  const [activePresetId, setActivePresetId] = useState<string | null>(PRESET_RECIPES[0].id);
  const [dishPhases, setDishPhases] = useState<DishPhase[]>(initialPresetSetup.phases);
  const [activeTargetPhaseId, setActiveTargetPhaseId] = useState<string>(
    initialPresetSetup.phases[0]?.id || 'phase_1'
  );
  const [dishItems, setDishItems] = useState<DishItem[]>(initialPresetSetup.items);
  const [isDbOpen, setIsDbOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const refreshProfile = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setCurrentUser(data.user);
        if (data.paymentConfig) setPaymentConfig(data.paymentConfig);
      }
      const ovRes = await fetch('/api/admin/overview', { credentials: 'include' });
      if (ovRes.ok) {
        const ovData = await ovRes.json();
        const pCount = (ovData.users || []).filter(
          (u: AuthUser) => u.status === 'pending' && u.role !== 'admin'
        ).length;
        setPendingSubscriberCount(pCount);
      }
    } catch {
      // Ignora errori temporanei
    }
  };

  // Controlla sessione attiva all'avvio
  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setCurrentUser(data?.user ?? null);
        if (data?.paymentConfig) setPaymentConfig(data.paymentConfig);

        if (data?.user?.role === 'admin') {
          fetch('/api/admin/overview', { credentials: 'include' })
            .then((r) => (r.ok ? r.json() : null))
            .then((ov) => {
              if (active && ov?.users) {
                setPendingSubscriberCount(
                  ov.users.filter((u: AuthUser) => u.status === 'pending' && u.role !== 'admin')
                    .length
                );
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (active) setCurrentUser(null);
      })
      .finally(() => {
        if (active) setAuthChecked(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Carica il database personalizzato dell'utente dal server dopo il login
  useEffect(() => {
    if (!currentUser) {
      setDbLoadedForUser(false);
      setDatabase(SEED_DATABASE);
      skipNextSaveRef.current = true;
      return;
    }

    if (currentUser.role === 'trial' || currentUser.isTrial) {
      const subset = getTrialDataset(currentUser.dataQuotaRatio || 0.1);
      skipNextSaveRef.current = true;
      setDatabase(subset.database);
      setActivePresetId(subset.presets[0]?.id ?? null);
      if (subset.presets[0]) {
        const setup = buildPresetDishAndPhases(subset.presets[0]);
        setDishPhases(setup.phases);
        setActiveTargetPhaseId(setup.phases[0]?.id || 'phase_1');
        setDishItems(setup.items);
      }
      setDbLoadedForUser(true);
      return;
    }

    let active = true;
    fetch('/api/database', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        const parsed = data?.database;
        if (Array.isArray(parsed?.ingredients) && Array.isArray(parsed?.techniques)) {
          const deletedSet = new Set<string>(
            Array.isArray(parsed.deletedIngredientIds) ? parsed.deletedIngredientIds : []
          );
          // Unisce eventuali nuovi ingredienti/tecniche aggiunti al seed senza ripristinare quelli eliminati dall'utente
          const mergedIngs = new Map(
            SEED_DATABASE.ingredients
              .filter((i) => !deletedSet.has(i.id))
              .map((i) => [i.id, i])
          );
          for (const raw of parsed.ingredients) {
            if (raw?.id && !deletedSet.has(raw.id)) {
              mergedIngs.set(raw.id, normalizeIngredient(raw));
            }
          }
          const mergedTechs = new Map(SEED_DATABASE.techniques.map((t) => [t.id, t]));
          for (const t of parsed.techniques) {
            if (t?.id) mergedTechs.set(t.id, t);
          }
          skipNextSaveRef.current = true;
          setDatabase({
            ingredients: Array.from(mergedIngs.values()),
            techniques: Array.from(mergedTechs.values()),
            deletedIngredientIds: Array.from(deletedSet),
          });
        } else {
          skipNextSaveRef.current = true;
          setDatabase(SEED_DATABASE);
        }
        setDbLoadedForUser(true);
      })
      .catch(() => {
        if (active) {
          skipNextSaveRef.current = true;
          setDatabase(SEED_DATABASE);
          setDbLoadedForUser(true);
        }
      });

    return () => {
      active = false;
    };
  }, [currentUser]);

  // Salva le modifiche del database sul server (per utente)
  useEffect(() => {
    if (!currentUser || !dbLoadedForUser || isTrialUser) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    fetch('/api/database', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ database }),
    }).catch(() => {
      // Ignora errori temporanei di rete
    });
  }, [database, currentUser, dbLoadedForUser, isTrialUser]);

  const simulation = useMemo(() => simulateDish(dishItems, database), [dishItems, database]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setIsAccountOpen(false);
    setIsDbOpen(false);
    setCurrentUser(null);
  };

  const handleLoadPreset = (preset: PresetRecipe) => {
    setActivePresetId(preset.id);
    const setup = buildPresetDishAndPhases(preset);
    setDishPhases(setup.phases);
    setActiveTargetPhaseId(setup.phases[0]?.id || 'phase_1');
    setDishItems(setup.items);
  };

  const handleClearDish = () => {
    setActivePresetId(null);
    const p1Id = `phase_1_${Date.now().toString(36)}`;
    const defaultPhases: DishPhase[] = [
      {
        id: p1Id,
        order: 1,
        title: 'Fase 1 - Preparazione generale',
        defaultTechniqueId: 'tech_raw',
        outputName: 'Semilavorato Fase 1',
        usesPreviousPhaseIds: [],
      },
    ];
    setDishPhases(defaultPhases);
    setActiveTargetPhaseId(p1Id);
    setDishItems([]);
  };

  const handleAddDishPhase = () => {
    setActivePresetId(null);
    setDishPhases((prev) => {
      const nextOrder = prev.length + 1;
      const newId = `phase_${nextOrder}_${Date.now().toString(36)}`;
      const prevPhase = prev.length > 0 ? prev[prev.length - 1] : null;
      const newPhase: DishPhase = {
        id: newId,
        order: nextOrder,
        title:
          nextOrder === 2
            ? 'Cottura & Trasformazione'
            : nextOrder === 3
              ? 'Mantecatura / Finitura'
              : `Fase ${nextOrder} di Lavorazione`,
        defaultTechniqueId: 'tech_raw',
        outputName: `Semilavorato Fase ${nextOrder}`,
        usesPreviousPhaseIds: prevPhase ? [prevPhase.id] : [],
      };
      setActiveTargetPhaseId(newId);
      return [...prev, newPhase];
    });
  };

  const handleUpdateDishPhase = (phaseId: string, patch: Partial<DishPhase>) => {
    setDishPhases((prev) => prev.map((p) => (p.id === phaseId ? { ...p, ...patch } : p)));
  };

  const handleMoveDishPhase = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= dishPhases.length || fromIdx === toIdx) return;
    const candidate = [...dishPhases];
    const [moved] = candidate.splice(fromIdx, 1);
    candidate.splice(toIdx, 0, moved);
    const reordered = candidate.map((p, i) => ({ ...p, order: i + 1 }));
    const orderById = new Map(reordered.map((p) => [p.id, p.order]));

    for (const p of reordered) {
      for (const depId of p.usesPreviousPhaseIds) {
        const depOrder = orderById.get(depId);
        if (depOrder && depOrder >= p.order) {
          window.alert(
            `Impossibile spostare la fase: "${p.title}" utilizza come input il semilavorato di una fase che finirebbe dopo di essa. Scollega prima il semilavorato.`
          );
          return;
        }
      }
    }
    setDishPhases(reordered);
  };

  const handleRemoveDishPhase = (phaseId: string) => {
    if (dishPhases.length <= 1) return;
    const target = dishPhases.find((p) => p.id === phaseId);
    const dependents = dishPhases.filter((p) => p.usesPreviousPhaseIds.includes(phaseId));
    if (dependents.length > 0 && target) {
      const ok = window.confirm(
        `Il semilavorato "${target.outputName}" della Fase ${target.order} è utilizzato in: ${dependents.map((d) => `Fase ${d.order}`).join(', ')}.\n\nEliminando questa fase gli ingredienti verranno spostati nella prima fase disponibile. Continuare?`
      );
      if (!ok) return;
    }

    const remaining = dishPhases
      .filter((p) => p.id !== phaseId)
      .map((p, idx) => ({
        ...p,
        order: idx + 1,
        usesPreviousPhaseIds: p.usesPreviousPhaseIds.filter((id) => id !== phaseId),
      }));
    const fallbackPhaseId = remaining[0].id;
    setDishPhases(remaining);
    if (activeTargetPhaseId === phaseId) {
      setActiveTargetPhaseId(fallbackPhaseId);
    }
    setDishItems((prev) =>
      prev.map((it) => (it.phaseId === phaseId ? { ...it, phaseId: fallbackPhaseId } : it))
    );
  };

  const handleTogglePhaseSemilavorato = (targetPhaseId: string, sourcePhaseId: string) => {
    setDishPhases((prev) =>
      prev.map((p) => {
        if (p.id !== targetPhaseId) return p;
        const exists = p.usesPreviousPhaseIds.includes(sourcePhaseId);
        return {
          ...p,
          usesPreviousPhaseIds: exists
            ? p.usesPreviousPhaseIds.filter((id) => id !== sourcePhaseId)
            : [...p.usesPreviousPhaseIds, sourcePhaseId],
        };
      })
    );
  };

  const handleApplyPhaseTechniqueToAll = (phaseId: string, techniqueId: string) => {
    setDishItems((prev) =>
      prev.map((it) =>
        (it.phaseId || dishPhases[0]?.id) === phaseId ? { ...it, techniqueId } : it
      )
    );
  };

  const handleAddIngredient = (
    ingredientId: string,
    techniqueId?: string,
    dosage?: Dosage,
    phaseId?: string
  ) => {
    const ing = database.ingredients.find((i) => i.id === ingredientId);
    const targetPhase =
      dishPhases.find((p) => p.id === (phaseId || activeTargetPhaseId)) ?? dishPhases[0];
    const resolvedTech = techniqueId || targetPhase?.defaultTechniqueId || 'tech_raw';

    const defaultDosage: Dosage =
      dosage ??
      (ing &&
      (ing.category === 'acid' ||
        ing.category === 'umami_condiment' ||
        ing.category === 'herb_spice' ||
        ing.category === 'fat')
        ? 'garnish'
        : dishItems.length === 0
          ? 'main'
          : 'secondary');

    const defaultQty =
      defaultDosage === 'main' ? 150 : defaultDosage === 'secondary' ? 75 : 15;

    setActivePresetId(null);
    setDishItems((prev) => [
      ...prev,
      {
        instanceId: `item_${ingredientId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ingredientId,
        techniqueId: resolvedTech,
        dosage: defaultDosage,
        phaseId: targetPhase?.id,
        quantity: defaultQty,
        unit: 'g',
      },
    ]);
  };

  const handleChangeTechnique = (instanceId: string, techniqueId: string) => {
    setDishItems((prev) =>
      prev.map((it) => (it.instanceId === instanceId ? { ...it, techniqueId } : it))
    );
  };

  const handleChangeDosage = (instanceId: string, dosage: Dosage) => {
    setDishItems((prev) =>
      prev.map((it) => (it.instanceId === instanceId ? { ...it, dosage } : it))
    );
  };

  const handleChangeItemPhase = (instanceId: string, phaseId: string) => {
    setDishItems((prev) =>
      prev.map((it) => (it.instanceId === instanceId ? { ...it, phaseId } : it))
    );
  };

  const handleChangeItemQuantity = (instanceId: string, quantity: number, unit: string) => {
    setDishItems((prev) =>
      prev.map((it) => (it.instanceId === instanceId ? { ...it, quantity, unit } : it))
    );
  };

  const handleSplitItemToPhase = (instanceId: string, targetPhaseId: string) => {
    const source = dishItems.find((it) => it.instanceId === instanceId);
    const targetPhase = dishPhases.find((p) => p.id === targetPhaseId);
    if (!source || !targetPhase) return;

    const totalQty = source.quantity ?? 80;
    const firstPart = Math.max(1, Math.round(totalQty * 0.6));
    const secondPart = Math.max(1, totalQty - firstPart);

    setActivePresetId(null);
    setDishItems((prev) => [
      ...prev.map((it) =>
        it.instanceId === instanceId ? { ...it, quantity: firstPart, unit: it.unit || 'g' } : it
      ),
      {
        instanceId: `split_${source.ingredientId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        ingredientId: source.ingredientId,
        techniqueId: targetPhase.defaultTechniqueId || source.techniqueId,
        dosage: source.dosage === 'main' ? 'secondary' : source.dosage,
        phaseId: targetPhaseId,
        quantity: secondPart,
        unit: source.unit || 'g',
      },
    ]);
  };

  const handleRemoveItem = (instanceId: string) => {
    setActivePresetId(null);
    setDishItems((prev) => prev.filter((it) => it.instanceId !== instanceId));
  };

  const handleAddCustomIngredient = (ing: Ingredient) => {
    if (isTrialUser && database.ingredients.length >= trialInfo.maxIngredients) {
      window.alert(
        `Account di prova: hai raggiunto il limite del 10% dei dati utilizzabili (${trialInfo.maxIngredients} ingredienti su ${trialInfo.totalIngredients}).`
      );
      return;
    }
    setDatabase((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ing],
      deletedIngredientIds: (prev.deletedIngredientIds ?? []).filter((id) => id !== ing.id),
    }));
  };

  const handleSaveIngredient = (ing: Ingredient) => {
    setDatabase((prev) => {
      const exists = prev.ingredients.some((i) => i.id === ing.id);
      if (!exists && isTrialUser && prev.ingredients.length >= trialInfo.maxIngredients) {
        window.alert(
          `Account di prova: limite del 10% dei dati raggiunto (${trialInfo.maxIngredients} ingredienti su ${trialInfo.totalIngredients}).`
        );
        return prev;
      }
      const nextIngredients = exists
        ? prev.ingredients.map((i) => (i.id === ing.id ? ing : i))
        : [...prev.ingredients, ing];
      const nextDeleted = (prev.deletedIngredientIds ?? []).filter((id) => id !== ing.id);
      return {
        ...prev,
        ingredients: nextIngredients,
        deletedIngredientIds: nextDeleted,
      };
    });
  };

  const handleDeleteIngredient = (ingredientId: string) => {
    setDatabase((prev) => {
      const nextDeleted = new Set(prev.deletedIngredientIds ?? []);
      if (SEED_INGREDIENT_IDS.has(ingredientId)) {
        nextDeleted.add(ingredientId);
      }
      return {
        ...prev,
        ingredients: prev.ingredients.filter((i) => i.id !== ingredientId),
        deletedIngredientIds: Array.from(nextDeleted),
      };
    });
    setDishItems((prev) => prev.filter((item) => item.ingredientId !== ingredientId));
  };

  const handleAddCustomTechnique = (tech: Technique) => {
    setDatabase((prev) => ({
      ...prev,
      techniques: [...prev.techniques, tech],
    }));
  };

  const handleImportDatabase = (db: FlavorDatabase) => {
    if (isTrialUser) {
      setDatabase({
        ...db,
        ingredients: db.ingredients.slice(0, trialInfo.maxIngredients),
      });
      return;
    }
    setDatabase(db);
  };

  const handleResetDatabase = () => {
    if (isTrialUser) {
      skipNextSaveRef.current = true;
      setDatabase(trialInfo.database);
      return;
    }
    fetch('/api/database', { method: 'DELETE', credentials: 'include' }).catch(() => {});
    skipNextSaveRef.current = true;
    setDatabase(SEED_DATABASE);
  };

  const handleLoadRecipeIntoSimulator = (items: DishItem[], customIngredients: Ingredient[]) => {
    if (customIngredients.length > 0 && !isTrialUser) {
      setDatabase((prev) => {
        const existingIds = new Set(prev.ingredients.map((i) => i.id));
        const toAdd = customIngredients.filter((ci) => !existingIds.has(ci.id));
        if (toAdd.length === 0) return prev;
        return {
          ...prev,
          ingredients: [...prev.ingredients, ...toAdd],
        };
      });
    }
    setActivePresetId(null);
    const setup = buildPresetDishAndPhases({
      id: `from_recipe_${Date.now()}`,
      name: 'Ricetta Analizzata',
      subtitle: '',
      description: '',
      items: items.map(({ ingredientId, techniqueId, dosage }) => ({
        ingredientId,
        techniqueId,
        dosage,
      })),
    });
    setDishPhases(setup.phases);
    setActiveTargetPhaseId(setup.phases[0]?.id || 'phase_1');
    setDishItems(setup.items);
    setActiveView('simulator');
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d10] text-sm text-stone-400">
        Verifica sessione...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        onSuccess={(user) => {
          setCurrentUser(user);
          refreshProfile();
        }}
      />
    );
  }

  // Se l'account non è abilitato (pending, abbonamento scaduto o sospeso):
  if (!isUserAllowed(currentUser)) {
    return (
      <ActivationScreen
        user={currentUser}
        paymentConfig={paymentConfig}
        onRefreshStatus={refreshProfile}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0d10] text-[#f4efe6] lg:h-screen lg:overflow-hidden">
      <div className="shrink-0">
        <Header
          activeView={activeView}
          onChangeView={setActiveView}
          presets={availablePresets}
          activePresetId={activePresetId}
          onLoadPreset={handleLoadPreset}
          onClearDish={handleClearDish}
          onOpenDatabase={() => setIsDbOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onLogout={handleLogout}
          currentUser={currentUser}
          dishCount={dishItems.length}
          ingredientCount={database.ingredients.length}
          totalIngredientCount={trialInfo.totalIngredients}
          techniqueCount={database.techniques.length}
          pendingSubscriberCount={pendingSubscriberCount}
        />
        {isTrialUser && (
          <div className="border-b border-amber-400/20 bg-amber-500/[0.08] px-4 py-1.5 text-center text-[11px] text-amber-200">
            <strong>Account di Prova senza password</strong> ({currentUser.email}) &bull; Attivo il{' '}
            <strong>10% dei dati utilizzabili</strong>: {database.ingredients.length} su{' '}
            {trialInfo.totalIngredients} ingredienti e {availablePresets.length} su{' '}
            {trialInfo.totalPresets} ricette test.
          </div>
        )}
      </div>

      <main className="mx-auto w-full max-w-[1520px] flex-1 px-4 py-5 sm:px-6 lg:min-h-0 lg:overflow-hidden lg:py-0">
        {activeView === 'ingredients' ? (
          <IngredientStudio
            ingredients={database.ingredients}
            onSaveIngredient={handleSaveIngredient}
            onDeleteIngredient={handleDeleteIngredient}
            onAddToDish={(ingredientId) => handleAddIngredient(ingredientId)}
          />
        ) : activeView === 'recipe' ? (
          <RecipeAnalyzer
            database={database}
            currentUser={currentUser}
            onSaveIngredient={handleSaveIngredient}
            onLoadIntoSimulator={handleLoadRecipeIntoSimulator}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:h-full lg:grid-cols-12 lg:gap-0">
            {/* Colonna Sinistra: Costruttore del Piatto per Fasi (scroll indipendente) */}
            <div className="lg:col-span-5 lg:h-full lg:overflow-y-auto lg:border-r lg:border-white/[0.06] lg:py-5 lg:pr-5">
              <DishBuilder
                ingredients={database.ingredients}
                techniques={database.techniques}
                phases={dishPhases}
                activeTargetPhaseId={activeTargetPhaseId}
                onSelectTargetPhase={setActiveTargetPhaseId}
                onAddPhase={handleAddDishPhase}
                onUpdatePhase={handleUpdateDishPhase}
                onMovePhase={handleMoveDishPhase}
                onRemovePhase={handleRemoveDishPhase}
                onTogglePhaseSemilavorato={handleTogglePhaseSemilavorato}
                onApplyPhaseTechniqueToAll={handleApplyPhaseTechniqueToAll}
                transformedItems={simulation.items}
                onAddIngredient={handleAddIngredient}
                onChangeTechnique={handleChangeTechnique}
                onChangeDosage={handleChangeDosage}
                onChangeItemPhase={handleChangeItemPhase}
                onChangeItemQuantity={handleChangeItemQuantity}
                onSplitItemToPhase={handleSplitItemToPhase}
                onRemoveItem={handleRemoveItem}
              />
            </div>

            {/* Colonna Destra: Simulatore del Risultato al Palato (scroll indipendente) */}
            <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto lg:py-5 lg:pl-5">
              <PalateSimulator
                simulation={simulation}
                phases={dishPhases}
                techniques={database.techniques}
                onApplySuggestion={handleAddIngredient}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-white/[0.06] py-2.5 text-center text-[11px] text-stone-500">
        FlavorEngine &bull; Modello computazionale ispirato a{' '}
        <span className="text-stone-400">
          The Flavor Bible, Chartier, McGee, López-Alt, Nosrat &amp; Mouritsen
        </span>
      </footer>

      <DatabaseModal
        isOpen={isDbOpen}
        onClose={() => setIsDbOpen(false)}
        database={database}
        onAddIngredient={handleAddCustomIngredient}
        onAddTechnique={handleAddCustomTechnique}
        onImportDatabase={handleImportDatabase}
        onResetDatabase={handleResetDatabase}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;
