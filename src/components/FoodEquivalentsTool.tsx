import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Calculator,
  Utensils,
  Check,
  Copy,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
  Scale,
} from 'lucide-react';
import {
  SMAE_DATABASE,
  SMAE_GROUP_INFO,
  SmaeCategory,
  SmaeFoodItem,
} from '../utils/smaeDatabase';
import { MenuPlan, MealItem } from '../types/nutrition';

interface FoodEquivalentsToolProps {
  currentPlan?: MenuPlan;
  activeDayIndex: number;
  onAddMealToPlan?: (
    dayIndex: number,
    mealType: 'desayuno' | 'colacion_1' | 'comida' | 'colacion_2' | 'cena',
    newMeal: MealItem
  ) => void;
  targetDailyCalories?: number;
}

interface TrayItem {
  food: SmaeFoodItem;
  equivalents: number;
}

export const FoodEquivalentsTool: React.FC<FoodEquivalentsToolProps> = ({
  currentPlan,
  activeDayIndex,
  onAddMealToPlan,
  targetDailyCalories = 2000,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFood, setSelectedFood] = useState<SmaeFoodItem>(SMAE_DATABASE[0]);
  const [foodEquivalents, setFoodEquivalents] = useState<number>(1);

  // Plate builder tray
  const [dishName, setDishName] = useState('Mi Platillo Personalizado');
  const [trayItems, setTrayItems] = useState<TrayItem[]>([
    { food: SMAE_DATABASE[0], equivalents: 1 }, // Nopal
    { food: SMAE_DATABASE[12], equivalents: 2 }, // Pechuga pollo (60g)
    { food: SMAE_DATABASE[18], equivalents: 1 }, // Aceite oliva
  ]);

  const [targetMealType, setTargetMealType] = useState<
    'desayuno' | 'colacion_1' | 'comida' | 'colacion_2' | 'cena'
  >('comida');

  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Filter foods by search and category
  const filteredFoods = useMemo(() => {
    return SMAE_DATABASE.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.clinicalSuitability &&
          item.clinicalSuitability.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  // Selected food calculated values
  const currentItemCalories = Math.round(selectedFood.calories * foodEquivalents);
  const currentItemProtein = Number((selectedFood.protein * foodEquivalents).toFixed(1));
  const currentItemCarbs = Number((selectedFood.carbs * foodEquivalents).toFixed(1));
  const currentItemFat = Number((selectedFood.fat * foodEquivalents).toFixed(1));
  const currentItemGrams = Math.round(selectedFood.servingWeightGrams * foodEquivalents);

  // Tray totals
  const trayTotals = useMemo(() => {
    return trayItems.reduce(
      (acc, item) => {
        acc.calories += Math.round(item.food.calories * item.equivalents);
        acc.protein += Number((item.food.protein * item.equivalents).toFixed(1));
        acc.carbs += Number((item.food.carbs * item.equivalents).toFixed(1));
        acc.fat += Number((item.food.fat * item.equivalents).toFixed(1));
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [trayItems]);

  const handleAddToTray = () => {
    const existingIndex = trayItems.findIndex((ti) => ti.food.id === selectedFood.id);
    if (existingIndex >= 0) {
      const updated = [...trayItems];
      updated[existingIndex].equivalents += foodEquivalents;
      setTrayItems(updated);
    } else {
      setTrayItems([...trayItems, { food: selectedFood, equivalents: foodEquivalents }]);
    }
  };

  const handleRemoveFromTray = (index: number) => {
    setTrayItems(trayItems.filter((_, i) => i !== index));
  };

  const handleUpdateTrayEquivalents = (index: number, newEq: number) => {
    if (newEq <= 0) return handleRemoveFromTray(index);
    const updated = [...trayItems];
    updated[index].equivalents = Number(newEq.toFixed(1));
    setTrayItems(updated);
  };

  const handleCopyIngredients = () => {
    const text = trayItems
      .map(
        (t) =>
          `• ${t.food.name}: ${t.equivalents} equiv (${Math.round(
            t.food.servingWeightGrams * t.equivalents
          )}g)`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleInsertIntoPlan = () => {
    if (!onAddMealToPlan || trayItems.length === 0) return;

    const timeLabels = {
      desayuno: '08:00 AM - Desayuno',
      colacion_1: '11:30 AM - Colación Matutina',
      comida: '02:30 PM - Comida Principal',
      colacion_2: '05:30 PM - Colación Vespertina',
      cena: '08:30 PM - Cena Ligera',
    };

    const ingredients = trayItems.map((ti) => ({
      item: ti.food.name,
      quantity: `${ti.equivalents} equiv (${Math.round(
        ti.food.servingWeightGrams * ti.equivalents
      )}g)`,
      category: ti.food.categoryLabel,
    }));

    const newMeal: MealItem = {
      id: `meal-custom-${Date.now()}`,
      type: targetMealType,
      timeLabel: timeLabels[targetMealType],
      name: dishName.trim() || 'Platillo Calculado con SMAE',
      calories: trayTotals.calories,
      protein: Math.round(trayTotals.protein),
      carbs: Math.round(trayTotals.carbs),
      fat: Math.round(trayTotals.fat),
      ingredients,
      preparation:
        'Preparar combinando los ingredientes con técnicas de cocción al vapor o a la plancha.',
      clinicalBenefit:
        'Platillo balanceado calculado con equivalentes nutricionales exactos.',
    };

    onAddMealToPlan(activeDayIndex, targetMealType, newMeal);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-600" />
                <span>Buscador de Alimentos & Calculadora de Equivalentes (SMAE)</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
                Sistema Oficial
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Busca alimentos clínicos, calcula automáticamente sus carbohidratos, proteínas y grasas según el número de raciones e insértalos directamente en los menús.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500">Meta Diaria Paciente:</span>
            <span className="font-extrabold text-teal-800">{targetDailyCalories} kcal</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Search & Calculator on Left, Dish Builder Tray on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Food Search & Individual Food Calculator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
            {/* Search Input & Category Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar alimento (ej. pechuga, avena, nopal, frijol, aguacate, salmón)..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({SMAE_DATABASE.length})
                </button>
                {(Object.keys(SMAE_GROUP_INFO) as SmaeCategory[]).map((catKey) => {
                  const info = SMAE_GROUP_INFO[catKey];
                  const count = SMAE_DATABASE.filter((f) => f.category === catKey).length;
                  if (count === 0) return null;

                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setSelectedCategory(catKey)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                        selectedCategory === catKey
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {info.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Food Selection List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {filteredFoods.map((food) => {
                const isSelected = selectedFood.id === food.id;
                const groupStyle = SMAE_GROUP_INFO[food.category]?.color || 'bg-slate-100 text-slate-700';

                return (
                  <div
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setFoodEquivalents(1);
                    }}
                    className={`p-3 transition cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-teal-50/80 border-l-4 border-teal-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{food.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Porción: <span className="font-medium text-slate-700">{food.servingPortion}</span> ({food.servingWeightGrams}g)
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${groupStyle}`}>
                        {food.categoryLabel}
                      </span>
                      <span className="font-extrabold text-slate-800">{food.calories} kcal</span>
                    </div>
                  </div>
                );
              })}

              {filteredFoods.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  No se encontraron alimentos que coincidan con la búsqueda.
                </div>
              )}
            </div>
          </div>

          {/* Active Food Macro Calculator Card */}
          {selectedFood && (
            <div className="bg-white rounded-2xl border border-teal-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                    Alimento Seleccionado
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {selectedFood.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    1 equivalente base = {selectedFood.servingPortion} ({selectedFood.servingWeightGrams}g)
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFoodEquivalents(Math.max(0.5, foodEquivalents - 0.5))}
                    className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-black text-sm text-slate-900 min-w-[50px] text-center">
                    {foodEquivalents} eq
                  </span>
                  <button
                    type="button"
                    onClick={() => setFoodEquivalents(foodEquivalents + 0.5)}
                    className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Calculated Values Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Energía</div>
                  <div className="text-base font-black text-slate-900">{currentItemCalories}</div>
                  <div className="text-[10px] text-slate-500">kcal</div>
                </div>

                <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                  <div className="text-[10px] uppercase font-bold text-blue-800">Proteína</div>
                  <div className="text-base font-black text-blue-950">{currentItemProtein}g</div>
                  <div className="text-[10px] text-blue-700">SMAE</div>
                </div>

                <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                  <div className="text-[10px] uppercase font-bold text-amber-800">Carbohidratos</div>
                  <div className="text-base font-black text-amber-950">{currentItemCarbs}g</div>
                  <div className="text-[10px] text-amber-700">HC</div>
                </div>

                <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Grasas</div>
                  <div className="text-base font-black text-emerald-950">{currentItemFat}g</div>
                  <div className="text-[10px] text-emerald-700">Lípidos</div>
                </div>
              </div>

              {/* Net Portion & Clinical Suitability */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-600">
                    Ración calculada:{' '}
                    <b className="text-slate-900">
                      {currentItemGrams} gramos netos ({foodEquivalents} raciones de {selectedFood.servingPortion})
                    </b>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToTray}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-2xs transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir a la Canasta de Platillo</span>
                </button>
              </div>

              {selectedFood.clinicalSuitability && (
                <div className="text-[11px] text-teal-900 bg-teal-50/70 p-2.5 rounded-lg border border-teal-100 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                  <span>{selectedFood.clinicalSuitability}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Custom Dish Builder & Direct Inserter into Patient Plan (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-teal-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Canasta de Platillo Personalizado
                </h4>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                {trayItems.length} Alimento(s)
              </span>
            </div>

            {/* Custom Dish Title Input */}
            <div className="mb-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nombre del Platillo
              </label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="Ej. Omelette con Espinaca y Tostadas"
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Tray Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {trayItems.map((item, idx) => {
                const itemCal = Math.round(item.food.calories * item.equivalents);
                const itemProt = Number((item.food.protein * item.equivalents).toFixed(1));
                const itemCarb = Number((item.food.carbs * item.equivalents).toFixed(1));
                const itemFat = Number((item.food.fat * item.equivalents).toFixed(1));
                const itemGrams = Math.round(item.food.servingWeightGrams * item.equivalents);

                return (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.food.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.equivalents} eq ({itemGrams}g) · {itemCal} kcal ({itemProt}g P / {itemCarb}g C / {itemFat}g G)
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateTrayEquivalents(idx, item.equivalents - 0.5)}
                        className="w-6 h-6 rounded flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-slate-800 text-[11px]">
                        {item.equivalents}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateTrayEquivalents(idx, item.equivalents + 0.5)}
                        className="w-6 h-6 rounded flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromTray(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {trayItems.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Selecciona alimentos en el buscador izquierdo y pulsa "Añadir a la Canasta" para armar tu platillo.
                </div>
              )}
            </div>

            {/* Tray Combined Totals */}
            <div className="mt-4 p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900 mb-1.5">
                <span>TOTAL DEL PLATILLO:</span>
                <span className="text-base font-black text-teal-950">{trayTotals.calories} kcal</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-[11px] font-bold">
                <span className="bg-white/80 py-1 rounded text-blue-900">
                  {Math.round(trayTotals.protein)}g Prot
                </span>
                <span className="bg-white/80 py-1 rounded text-amber-900">
                  {Math.round(trayTotals.carbs)}g Carbs
                </span>
                <span className="bg-white/80 py-1 rounded text-emerald-900">
                  {Math.round(trayTotals.fat)}g Grasas
                </span>
              </div>
            </div>
          </div>

          {/* Insertion controls into patient meal plan */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Insertar en el Menú del Paciente (Día {activeDayIndex + 1})
              </label>
              <div className="grid grid-cols-3 gap-1 text-xs">
                {(
                  [
                    { key: 'desayuno', label: 'Desayuno' },
                    { key: 'colacion_1', label: 'Colación 1' },
                    { key: 'comida', label: 'Comida' },
                    { key: 'colacion_2', label: 'Colación 2' },
                    { key: 'cena', label: 'Cena' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setTargetMealType(m.key)}
                    className={`py-1.5 px-2 rounded-lg font-semibold text-xs transition cursor-pointer ${
                      targetMealType === m.key
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyIngredients}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSuccess ? '¡Copiado!' : 'Copiar Raciones'}</span>
              </button>

              <button
                type="button"
                onClick={handleInsertIntoPlan}
                disabled={trayItems.length === 0}
                className="flex-2 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>
                  {addedSuccess ? '¡Platillo Insertado en Menú!' : 'Insertar en Menú'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
