import { useEffect, useMemo, useRef, useState } from 'react';
import { AccountModal } from './components/AccountModal';
import { DatabaseModal } from './components/DatabaseModal';
import { DishBuilder } from './components/DishBuilder';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { PalateSimulator } from './components/PalateSimulator';
import { normalizeIngredient, PRESET_RECIPES, SEED_DATABASE } from './data/seedData';
import { simulateDish } from './engine/flavorEngine';
import { AuthUser } from './types/auth';
import { DishItem, Dosage, FlavorDatabase, Ingredient, PresetRecipe, Technique } from './types/flavor';

function buildPresetDish(preset: PresetRecipe): DishItem[] {
  return preset.items.map((it, idx) => ({
    ...it,
    instanceId: `${preset.id}_${idx}_${Date.now()}`,
  }));
}

export function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const [database, setDatabase] = useState<FlavorDatabase>(SEED_DATABASE);
  const [dbLoadedForUser, setDbLoadedForUser] = useState(false);
  const skipNextSaveRef = useRef(true);

  const [activePresetId, setActivePresetId] = useState<string | null>(PRESET_RECIPES[0].id);
  const [dishItems, setDishItems] = useState<DishItem[]>(() => buildPresetDish(PRESET_RECIPES[0]));
  const [isDbOpen, setIsDbOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Controlla sessione attiva all'avvio
  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setCurrentUser(data?.user ?? null);
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

    let active = true;
    fetch('/api/database', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        const parsed = data?.database;
        if (Array.isArray(parsed?.ingredients) && Array.isArray(parsed?.techniques)) {
          // Unisce eventuali nuovi ingredienti/tecniche aggiunti al seed senza sovrascrivere quelli dell'utente
          const mergedIngs = new Map(SEED_DATABASE.ingredients.map((i) => [i.id, i]));
          for (const raw of parsed.ingredients) {
            if (raw?.id) mergedIngs.set(raw.id, normalizeIngredient(raw));
          }
          const mergedTechs = new Map(SEED_DATABASE.techniques.map((t) => [t.id, t]));
          for (const t of parsed.techniques) {
            if (t?.id) mergedTechs.set(t.id, t);
          }
          skipNextSaveRef.current = true;
          setDatabase({
            ingredients: Array.from(mergedIngs.values()),
            techniques: Array.from(mergedTechs.values()),
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
    if (!currentUser || !dbLoadedForUser) return;
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
  }, [database, currentUser, dbLoadedForUser]);

  const simulation = useMemo(() => simulateDish(dishItems, database), [dishItems, database]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setIsAccountOpen(false);
    setIsDbOpen(false);
    setCurrentUser(null);
  };

  const handleLoadPreset = (preset: PresetRecipe) => {
    setActivePresetId(preset.id);
    setDishItems(buildPresetDish(preset));
  };

  const handleClearDish = () => {
    setActivePresetId(null);
    setDishItems([]);
  };

  const handleAddIngredient = (
    ingredientId: string,
    techniqueId = 'tech_raw',
    dosage?: Dosage
  ) => {
    const ing = database.ingredients.find((i) => i.id === ingredientId);
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

    setActivePresetId(null);
    setDishItems((prev) => [
      ...prev,
      {
        instanceId: `item_${ingredientId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ingredientId,
        techniqueId,
        dosage: defaultDosage,
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

  const handleRemoveItem = (instanceId: string) => {
    setActivePresetId(null);
    setDishItems((prev) => prev.filter((it) => it.instanceId !== instanceId));
  };

  const handleAddCustomIngredient = (ing: Ingredient) => {
    setDatabase((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ing],
    }));
  };

  const handleAddCustomTechnique = (tech: Technique) => {
    setDatabase((prev) => ({
      ...prev,
      techniques: [...prev.techniques, tech],
    }));
  };

  const handleImportDatabase = (db: FlavorDatabase) => {
    setDatabase(db);
  };

  const handleResetDatabase = () => {
    fetch('/api/database', { method: 'DELETE', credentials: 'include' }).catch(() => {});
    skipNextSaveRef.current = true;
    setDatabase(SEED_DATABASE);
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d10] text-sm text-stone-400">
        Verifica sessione...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0d10] text-[#f4efe6] lg:h-screen lg:overflow-hidden">
      <div className="shrink-0">
        <Header
          presets={PRESET_RECIPES}
          activePresetId={activePresetId}
          onLoadPreset={handleLoadPreset}
          onClearDish={handleClearDish}
          onOpenDatabase={() => setIsDbOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onLogout={handleLogout}
          currentUser={currentUser}
          dishCount={dishItems.length}
          ingredientCount={database.ingredients.length}
          techniqueCount={database.techniques.length}
        />
      </div>

      <main className="mx-auto w-full max-w-[1520px] flex-1 px-4 py-5 sm:px-6 lg:min-h-0 lg:overflow-hidden lg:py-0">
        <div className="grid grid-cols-1 gap-6 lg:h-full lg:grid-cols-12 lg:gap-0">
          {/* Colonna Sinistra: Costruttore del Piatto (scroll indipendente) */}
          <div className="lg:col-span-5 lg:h-full lg:overflow-y-auto lg:border-r lg:border-white/[0.06] lg:py-5 lg:pr-5">
            <DishBuilder
              ingredients={database.ingredients}
              techniques={database.techniques}
              transformedItems={simulation.items}
              onAddIngredient={handleAddIngredient}
              onChangeTechnique={handleChangeTechnique}
              onChangeDosage={handleChangeDosage}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          {/* Colonna Destra: Simulatore del Risultato al Palato (scroll indipendente) */}
          <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto lg:py-5 lg:pl-5">
            <PalateSimulator
              simulation={simulation}
              onApplySuggestion={handleAddIngredient}
            />
          </div>
        </div>
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
