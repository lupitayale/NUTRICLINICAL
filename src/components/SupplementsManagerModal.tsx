import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Check,
  Search,
  Filter,
  Dumbbell,
  Clock,
  Flame,
  Scale,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SupplementItem } from '../types/nutrition';
import {
  SPORTS_SUPPLEMENTS_CATALOG,
  CatalogSupplement,
  calculateSupplementsTotals,
} from '../utils/sportsSupplementsCatalog';

interface SupplementsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSupplements: SupplementItem[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  currentFoodTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onSaveSupplements: (
    updatedSupplements: SupplementItem[],
    shouldAutoSquareMenu: boolean
  ) => void;
}

export const SupplementsManagerModal: React.FC<SupplementsManagerModalProps> = ({
  isOpen,
  onClose,
  activeSupplements: initialSupplements,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  currentFoodTotals,
  onSaveSupplements,
}) => {
  const [supplementsList, setSupplementsList] = useState<SupplementItem[]>([
    ...initialSupplements,
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'active' | 'custom'>('catalog');

  useEffect(() => {
    if (isOpen) {
      setSupplementsList([...initialSupplements]);
    }
  }, [isOpen, initialSupplements]);

  // Custom supplement form state
  const [customName, setCustomName] = useState('');
  const [customServings, setCustomServings] = useState(1);
  const [customServingUnit, setCustomServingUnit] = useState('scoop (30g)');
  const [customCalories, setCustomCalories] = useState(120);
  const [customProtein, setCustomProtein] = useState(24);
  const [customCarbs, setCustomCarbs] = useState(2);
  const [customFat, setCustomFat] = useState(1);
  const [customTiming, setCustomTiming] = useState<SupplementItem['timing']>('post_entreno');
  const [customPurpose, setCustomPurpose] = useState('');

  if (!isOpen) return null;

  // Totals of selected supplements
  const suppTotals = calculateSupplementsTotals(supplementsList);

  // Targets left for food meals
  const foodTargetCalories = Math.max(500, targetCalories - suppTotals.calories);
  const foodTargetProtein = Math.max(20, targetProtein - suppTotals.protein);
  const foodTargetCarbs = Math.max(20, targetCarbs - suppTotals.carbs);
  const foodTargetFat = Math.max(10, targetFat - suppTotals.fat);

  // Combined totals (Food + Supplements)
  const combinedCalories = currentFoodTotals.calories + suppTotals.calories;
  const combinedProtein = Number((currentFoodTotals.protein + suppTotals.protein).toFixed(1));
  const combinedCarbs = Number((currentFoodTotals.carbs + suppTotals.carbs).toFixed(1));
  const combinedFat = Number((currentFoodTotals.fat + suppTotals.fat).toFixed(1));

  // Adequacy %
  const adequacyCalories = targetCalories > 0 ? Math.round((combinedCalories / targetCalories) * 100) : 100;
  const adequacyProtein = targetProtein > 0 ? Math.round((combinedProtein / targetProtein) * 100) : 100;
  const adequacyCarbs = targetCarbs > 0 ? Math.round((combinedCarbs / targetCarbs) * 100) : 100;
  const adequacyFat = targetFat > 0 ? Math.round((combinedFat / targetFat) * 100) : 100;

  // Filter catalog
  const filteredCatalog = SPORTS_SUPPLEMENTS_CATALOG.filter((item) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleAddFromCatalog = (catalogItem: CatalogSupplement) => {
    // Check if already in list
    const existingIndex = supplementsList.findIndex((s) => s.name === catalogItem.name);
    if (existingIndex >= 0) {
      // Increment servings
      const updated = [...supplementsList];
      const curServings = updated[existingIndex].servings || 1;
      updated[existingIndex] = {
        ...updated[existingIndex],
        servings: curServings + 1,
        dosage: `${curServings + 1} ${catalogItem.servingUnit}`,
      };
      setSupplementsList(updated);
    } else {
      const newItem: SupplementItem = {
        id: `supp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: catalogItem.name,
        dosage: `${catalogItem.defaultServings} ${catalogItem.servingUnit}`,
        form: catalogItem.form,
        frequency: 'Diaria en días de entrenamiento',
        timing: catalogItem.defaultTiming,
        duration: 'Según ciclo de planificación',
        purpose: catalogItem.purpose,
        calories: catalogItem.caloriesPerServing,
        protein: catalogItem.proteinPerServing,
        carbs: catalogItem.carbsPerServing,
        fat: catalogItem.fatPerServing,
        servings: catalogItem.defaultServings,
        servingUnit: catalogItem.servingUnit,
        category: catalogItem.category,
      };
      setSupplementsList([...supplementsList, newItem]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newItem: SupplementItem = {
      id: `supp-custom-${Date.now()}`,
      name: customName.trim(),
      dosage: `${customServings} ${customServingUnit.trim()}`,
      form: 'polvo',
      frequency: 'Diaria',
      timing: customTiming,
      duration: 'Plan activo',
      purpose: customPurpose.trim() || 'Aporte nutricional y deportivo específico',
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      servings: Number(customServings) || 1,
      servingUnit: customServingUnit.trim(),
      category: 'rendimiento',
    };

    setSupplementsList([...supplementsList, newItem]);
    setCustomName('');
    setCustomPurpose('');
    setActiveTab('active');
  };

  const handleRemoveSupplement = (id: string) => {
    setSupplementsList(supplementsList.filter((s) => s.id !== id));
  };

  const handleUpdateServings = (id: string, delta: number) => {
    setSupplementsList((prev) =>
      prev
        .map((s) => {
          if (s.id === id) {
            const current = s.servings || 1;
            const next = Math.max(0.5, Number((current + delta).toFixed(1)));
            return {
              ...s,
              servings: next,
              dosage: `${next} ${s.servingUnit || 'porción'}`,
            };
          }
          return s;
        })
        .filter((s) => (s.servings || 0) > 0)
    );
  };

  const handleUpdateTiming = (id: string, timing: SupplementItem['timing']) => {
    setSupplementsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, timing } : s))
    );
  };

  const timingLabels: Record<SupplementItem['timing'], string> = {
    post_entreno: 'Post-Entrenamiento (Inmediato)',
    pre_entreno: 'Pre-Entrenamiento (30-45 min antes)',
    con_alimentos: 'Con alimentos principales',
    en_ayunas: 'En ayunas al despertar',
    antes_dormir: 'Antes de dormir (30-45 min)',
    con_comida_grasa: 'Con comida grasa (liposoluble)',
    personalizado: 'Horario personalizado',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Gestión de Suplementos & Cuadre Automático
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/30 text-teal-300 border border-teal-500/40">
                  Nutrición Deportiva & Clínica
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Selecciona suplementos con sus macronutrientes exactos para sincronizarlos y cuadrar el menú al 100%.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Live Balance & Squaring Control Panel */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 shrink-0 space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Meta Total Prescrita */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                1. Requerimiento Meta
              </span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {targetCalories} <span className="text-xs font-semibold text-slate-500">kcal</span>
              </div>
              <div className="text-[11px] text-slate-600 mt-1 flex gap-2">
                <span>P: <b>{targetProtein}g</b></span>
                <span>C: <b>{targetCarbs}g</b></span>
                <span>G: <b>{targetFat}g</b></span>
              </div>
            </div>

            {/* Aporte de Suplementos */}
            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200">
              <span className="text-[10px] font-bold uppercase text-teal-800 flex items-center justify-between">
                <span>2. Suplementos ({supplementsList.length})</span>
                <span className="px-1.5 py-0.2 rounded bg-teal-200/70 text-teal-900 font-black">
                  +{suppTotals.calories} kcal
                </span>
              </span>
              <div className="text-base font-extrabold text-teal-950 mt-0.5">
                +{suppTotals.calories} <span className="text-xs font-semibold text-teal-700">kcal</span>
              </div>
              <div className="text-[11px] text-teal-800 mt-1 flex gap-2">
                <span className="text-blue-700">P: <b>+{suppTotals.protein}g</b></span>
                <span className="text-amber-700">C: <b>+{suppTotals.carbs}g</b></span>
                <span className="text-emerald-700">G: <b>+{suppTotals.fat}g</b></span>
              </div>
            </div>

            {/* Restante para Alimentos Sólidos */}
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200">
              <span className="text-[10px] font-bold uppercase text-indigo-800 block">
                3. Meta para Comidas (Alimentos)
              </span>
              <div className="text-base font-extrabold text-indigo-950 mt-0.5">
                {foodTargetCalories} <span className="text-xs font-semibold text-indigo-700">kcal</span>
              </div>
              <div className="text-[11px] text-indigo-800 mt-1 flex gap-2">
                <span>P: <b>{foodTargetProtein}g</b></span>
                <span>C: <b>{foodTargetCarbs}g</b></span>
                <span>G: <b>{foodTargetFat}g</b></span>
              </div>
            </div>

            {/* Total Consolidado y Adecuación */}
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center justify-between">
                <span>Adecuación Consolidada</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                    adequacyCalories >= 95 && adequacyCalories <= 105
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {adequacyCalories}%
                </span>
              </span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {combinedCalories} / {targetCalories} kcal
              </div>
              <div className="text-[11px] text-slate-600 mt-1 flex gap-2">
                <span className={adequacyProtein >= 95 && adequacyProtein <= 105 ? 'text-emerald-700 font-bold' : ''}>
                  P: {combinedProtein}g ({adequacyProtein}%)
                </span>
                <span className={adequacyCarbs >= 95 && adequacyCarbs <= 105 ? 'text-emerald-700 font-bold' : ''}>
                  C: {combinedCarbs}g ({adequacyCarbs}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Auto-Square Banner */}
          <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 block">
                  Cuadre Automático al 100% de los Requerimientos
                </span>
                <span className="text-slate-600 text-[11px]">
                  Al guardar, el sistema ajustará proporcionalmente los platillos de comida sólida para que la suma total (Alimentos + Suplementos) cuadre exactamente con la meta prescrita.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onSaveSupplements(supplementsList, true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Guardar y Cuadrar Menú</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs between Catalog, Active and Custom */}
        <div className="px-6 pt-4 border-b border-slate-200 flex items-center gap-4 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📚 Catálogo de Suplementos Más Usados ({SPORTS_SUPPLEMENTS_CATALOG.length})
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>✅ Suplementos en el Plan Activo</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-900 text-[10px]">
              {supplementsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'custom'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ➕ Agregar Suplemento Personalizado
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Search & Categories */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar creatina, whey, magnesio, ciclodextrina..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold no-scrollbar">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'proteinas', label: 'Proteínas' },
                    { id: 'rendimiento', label: 'Rendimiento' },
                    { id: 'carbohidratos', label: 'Carbohidratos' },
                    { id: 'micronutrientes', label: 'Micronutrientes' },
                    { id: 'hidratacion', label: 'Hidratación' },
                    { id: 'salud', label: 'Salud' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supplements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCatalog.map((item) => {
                  const isAdded = supplementsList.some((s) => s.name === item.name);
                  const addedItem = supplementsList.find((s) => s.name === item.name);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                        isAdded
                          ? 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${item.badgeColor}`}
                          >
                            {item.categoryLabel}
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.servingUnit}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                          {item.name}
                        </h4>

                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {item.purpose}
                        </p>
                      </div>

                      {/* Macros Bar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 font-bold">
                          <span className="text-slate-900">{item.caloriesPerServing} kcal</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-blue-600">{item.proteinPerServing}g Prot</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-amber-600">{item.carbsPerServing}g Carb</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-emerald-600">{item.fatPerServing}g Grasa</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddFromCatalog(item)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                            isAdded
                              ? 'bg-teal-600 hover:bg-teal-700 text-white'
                              : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{addedItem?.servings || 1} en Plan (+)</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Agregar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE SUPPLEMENTS IN THE PLAN */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {supplementsList.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No hay suplementos seleccionados</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Explora el catálogo o crea un suplemento personalizado para integrarlo y cuadrarlo automáticamente en el menú.
                  </p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition cursor-pointer"
                  >
                    Ir al Catálogo de Suplementos
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {supplementsList.map((supp) => {
                    const servings = supp.servings || 1;
                    const totalCal = Math.round((supp.calories || 0) * servings);
                    const totalProt = Number(((supp.protein || 0) * servings).toFixed(1));
                    const totalCarb = Number(((supp.carbs || 0) * servings).toFixed(1));
                    const totalFat = Number(((supp.fat || 0) * servings).toFixed(1));

                    return (
                      <div
                        key={supp.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-sm shrink-0">
                              ⚡
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                                {supp.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {supp.purpose}
                              </p>
                            </div>
                          </div>

                          {/* Servings Modifier */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs">
                              <button
                                type="button"
                                onClick={() => handleUpdateServings(supp.id, -0.5)}
                                className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg transition cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2 font-extrabold text-slate-900 min-w-[3rem] text-center">
                                {servings} {supp.servingUnit || 'dosis'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateServings(supp.id, 0.5)}
                                className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg transition cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveSupplement(supp.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                              title="Eliminar del plan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Timing and Macros Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              Momento de Toma:
                            </span>
                            <select
                              value={supp.timing}
                              onChange={(e) =>
                                handleUpdateTiming(supp.id, e.target.value as SupplementItem['timing'])
                              }
                              className="font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-teal-500 cursor-pointer"
                            >
                              <option value="post_entreno">Post-Entrenamiento</option>
                              <option value="pre_entreno">Pre-Entrenamiento</option>
                              <option value="con_alimentos">Con Alimentos</option>
                              <option value="en_ayunas">En Ayunas</option>
                              <option value="antes_dormir">Antes de Dormir</option>
                              <option value="con_comida_grasa">Con Grasa Saludable</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-end gap-3 font-bold">
                            <span className="text-slate-900">{totalCal} kcal</span>
                            <span className="text-blue-600">{totalProt}g Prot</span>
                            <span className="text-amber-600">{totalCarb}g Carb</span>
                            <span className="text-emerald-600">{totalFat}g Grasa</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM SUPPLEMENT FORM */}
          {activeTab === 'custom' && (
            <form
              onSubmit={handleAddCustom}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 max-w-2xl mx-auto text-xs"
            >
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Registrar Suplemento Personalizado
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Introduce el nombre y la tabla nutricional por porción para que el sistema lo cuadre al menú.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Nombre del Suplemento / Marca
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ej. Isopure Zero Carb, Proteína Falcon, etc."
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Número de Porciones
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={customServings}
                    onChange={(e) => setCustomServings(parseFloat(e.target.value) || 1)}
                    className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Unidad de Medida
                  </label>
                  <input
                    type="text"
                    required
                    value={customServingUnit}
                    onChange={(e) => setCustomServingUnit(e.target.value)}
                    placeholder="Ej. 1 scoop (30g), 2 cápsulas"
                    className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Macros inputs */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-4 gap-2">
                <div>
                  <label className="font-bold text-slate-700 uppercase block text-[10px] mb-1">
                    Calorías (kcal)
                  </label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(parseFloat(e.target.value) || 0)}
                    className="w-full font-bold border border-slate-300 rounded-lg p-2 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-blue-700 uppercase block text-[10px] mb-1">
                    Proteína (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(parseFloat(e.target.value) || 0)}
                    className="w-full font-bold border border-slate-300 rounded-lg p-2 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-700 uppercase block text-[10px] mb-1">
                    Carbos (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(parseFloat(e.target.value) || 0)}
                    className="w-full font-bold border border-slate-300 rounded-lg p-2 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-700 uppercase block text-[10px] mb-1">
                    Grasas (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={customFat}
                    onChange={(e) => setCustomFat(parseFloat(e.target.value) || 0)}
                    className="w-full font-bold border border-slate-300 rounded-lg p-2 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Momento de Ingesta Sugerido
                  </label>
                  <select
                    value={customTiming}
                    onChange={(e) => setCustomTiming(e.target.value as any)}
                    className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                  >
                    <option value="post_entreno">Post-Entrenamiento</option>
                    <option value="pre_entreno">Pre-Entrenamiento</option>
                    <option value="con_alimentos">Con Alimentos</option>
                    <option value="en_ayunas">En Ayunas</option>
                    <option value="antes_dormir">Antes de Dormir</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Objetivo / Justificación
                  </label>
                  <input
                    type="text"
                    value={customPurpose}
                    onChange={(e) => setCustomPurpose(e.target.value)}
                    placeholder="Ej. Aporte proteico rápido"
                    className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar al Plan Activo</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {supplementsList.length > 0 ? (
              <span>
                <b>{supplementsList.length} suplemento(s)</b> aportando{' '}
                <b className="text-teal-800">{suppTotals.calories} kcal</b> ({suppTotals.protein}g P · {suppTotals.carbs}g C · {suppTotals.fat}g G)
              </span>
            ) : (
              <span>Sin suplementos seleccionados para este menú.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-white transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => onSaveSupplements(supplementsList, false)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Guardar sin alterar comidas
            </button>

            <button
              type="button"
              onClick={() => onSaveSupplements(supplementsList, true)}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Guardar & Cuadrar Menú al 100%</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
