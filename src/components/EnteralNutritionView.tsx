import React, { useState } from 'react';
import {
  Syringe,
  Package,
  Soup,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Droplets,
  Activity,
  Plus,
  Minus,
  Save,
  Printer,
  Info,
  ShieldCheck,
  Search,
  Filter,
  Check,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  Patient,
  CommercialEnteralFormula,
  ArtisanalIngredient,
  EnteralRoute,
  EnteralAdministrationMode,
  EnteralPrescription,
} from '../types/nutrition';
import {
  COMMERCIAL_FORMULAS,
  ARTISANAL_INGREDIENTS,
  calculateCommercialEnteral,
  calculateArtisanalEnteral,
} from '../utils/enteralDatabase';

interface EnteralNutritionViewProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigateToTab: (tab: string, docType?: string) => void;
}

export const EnteralNutritionView: React.FC<EnteralNutritionViewProps> = ({
  patient,
  onUpdatePatient,
  onNavigateToTab,
}) => {
  const [subTab, setSubTab] = useState<'commercial' | 'artisanal'>('commercial');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const latestConsult = patient.consultations[patient.consultations.length - 1];
  const patientWeightKg = latestConsult ? latestConsult.weightKg : 70;
  const targetCalories = patient.activePrescription.targetCalories || 1800;
  const targetHydrationLiters = (targetCalories / 1000) * 1.1; // approx 1.1 ml per kcal

  // ==========================================
  // COMMERCIAL FORMULA STATE
  // ==========================================
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>('ensure_plus');
  const [commercialRoute, setCommercialRoute] = useState<EnteralRoute>('sng');
  const [commercialMode, setCommercialMode] = useState<EnteralAdministrationMode>('bolus');
  const [commercialInfusionHours, setCommercialInfusionHours] = useState<number>(24);
  const [commercialBolusCount, setCommercialBolusCount] = useState<number>(5);
  const [commercialSearch, setCommercialSearch] = useState<string>('');
  const [commercialCategoryFilter, setCommercialCategoryFilter] = useState<string>('all');

  // ==========================================
  // ARTISANAL BLEND STATE
  // ==========================================
  const [artisanalRoute, setArtisanalRoute] = useState<EnteralRoute>('peg');
  const [artisanalMode, setArtisanalMode] = useState<EnteralAdministrationMode>('bolus');
  const [artisanalBolusCount, setArtisanalBolusCount] = useState<number>(5);
  const [addedWaterMl, setAddedWaterMl] = useState<number>(400);

  // Initial artisanal recipe: Pollo, Clara, Avena, Chayote, Manzana, Aceite Canola
  const [selectedArtisanalItems, setSelectedArtisanalItems] = useState<{
    ingredient: ArtisanalIngredient;
    quantity: number;
  }[]>([
    { ingredient: ARTISANAL_INGREDIENTS.find((i) => i.id === 'pollo_cocido')!, quantity: 1.5 },
    { ingredient: ARTISANAL_INGREDIENTS.find((i) => i.id === 'clara_huevo')!, quantity: 2 },
    { ingredient: ARTISANAL_INGREDIENTS.find((i) => i.id === 'avena_cocida')!, quantity: 1 },
    { ingredient: ARTISANAL_INGREDIENTS.find((i) => i.id === 'chayote_cocido')!, quantity: 2 },
    { ingredient: ARTISANAL_INGREDIENTS.find((i) => i.id === 'manzana_cocida')!, quantity: 1.5 },
    { ingredient: ARTISANAL_INGREDIENTS.find((i) => i.id === 'aceite_canola')!, quantity: 2 },
  ]);

  // Selected commercial formula
  const currentFormula =
    COMMERCIAL_FORMULAS.find((f) => f.id === selectedFormulaId) || COMMERCIAL_FORMULAS[0];

  // Calculated commercial prescription
  const commercialPrescription = calculateCommercialEnteral({
    patientId: patient.id,
    patientWeightKg,
    targetCalories,
    targetHydrationLiters,
    formula: currentFormula,
    route: commercialRoute,
    mode: commercialMode,
    infusionHours: commercialInfusionHours,
    bolusCount: commercialBolusCount,
  });

  // Calculated artisanal prescription
  const artisanalPrescription = calculateArtisanalEnteral({
    patientId: patient.id,
    patientWeightKg,
    addedWaterMl,
    route: artisanalRoute,
    mode: artisanalMode,
    items: selectedArtisanalItems,
    bolusCount: artisanalBolusCount,
  });

  const activePrescription =
    subTab === 'commercial' ? commercialPrescription : artisanalPrescription;

  const handleSaveToPatient = () => {
    const existingHistory = patient.enteralPrescriptions || [];
    const newPrescription = {
      ...activePrescription,
      date: new Date().toISOString().split('T')[0],
    };
    onUpdatePatient({
      ...patient,
      activeEnteralPrescription: newPrescription,
      enteralPrescriptions: [newPrescription, ...existingHistory],
      updatedAt: new Date().toISOString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleQuantityChange = (ingredientId: string, delta: number) => {
    setSelectedArtisanalItems((prev) => {
      return prev
        .map((item) => {
          if (item.ingredient.id === ingredientId) {
            const newQty = Math.max(0, +(item.quantity + delta).toFixed(1));
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleAddIngredient = (ingredient: ArtisanalIngredient) => {
    setSelectedArtisanalItems((prev) => {
      const exists = prev.find((i) => i.ingredient.id === ingredient.id);
      if (exists) {
        return prev.map((i) =>
          i.ingredient.id === ingredient.id
            ? { ...i, quantity: +(i.quantity + 1).toFixed(1) }
            : i
        );
      }
      return [...prev, { ingredient, quantity: 1 }];
    });
  };

  // Filtered commercial formulas
  const filteredFormulas = COMMERCIAL_FORMULAS.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(commercialSearch.toLowerCase()) ||
      f.brand.toLowerCase().includes(commercialSearch.toLowerCase()) ||
      f.clinicalIndications.toLowerCase().includes(commercialSearch.toLowerCase());
    const matchesCategory =
      commercialCategoryFilter === 'all' || f.category === commercialCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Syringe className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Módulo de Nutrición Enteral Clínica
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
                ESPEN / ASPEN
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Paciente: <span className="font-bold text-slate-800">{patient.fullName}</span> ·{' '}
              Peso Actual:{' '}
              <span className="font-bold text-teal-800">{patientWeightKg} kg</span> · Requerimiento:{' '}
              <span className="font-bold text-slate-900">{targetCalories} kcal/día</span> (
              {patient.activePrescription.proteinGrams}g Prot)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveToPatient}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savedSuccess ? '¡Prescripción Guardada!' : 'Guardar Prescripción Enteral'}</span>
            </button>

            <button
              onClick={() => onNavigateToTab('print', 'enteral')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation: Commercial vs. Artisanal */}
        <div className="flex items-center gap-2 border-t border-slate-200 mt-5 pt-4">
          <button
            onClick={() => setSubTab('commercial')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              subTab === 'commercial'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-teal-400" />
            <span>Fórmulas Comerciales Estandarizadas</span>
          </button>

          <button
            onClick={() => setSubTab('artisanal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              subTab === 'artisanal'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Soup className="w-4 h-4 text-amber-400" />
            <span>Licuados Enterales Artesanales (Alimentos Reales)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. COMMERCIAL FORMULAS MODULE */}
      {/* ======================================================== */}
      {subTab === 'commercial' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Formula Catalog & Route Selectors */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search and Category Filter */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={commercialSearch}
                    onChange={(e) => setCommercialSearch(e.target.value)}
                    placeholder="Buscar Ensure, Glucerna, Nepro, Peptamen, Jevity..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <select
                  value={commercialCategoryFilter}
                  onChange={(e) => setCommercialCategoryFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 cursor-pointer focus:outline-hidden"
                >
                  <option value="all">Todas las Categorías</option>
                  <option value="polimerica_estandar">Poliméricas Estándar</option>
                  <option value="especializada_diabetes">Diabetes (Glucerna)</option>
                  <option value="especializada_renal">Renal (Nepro / Fresubin)</option>
                  <option value="especializada_pulmonar">Pulmonar (Pulmocare)</option>
                  <option value="peptidica_oligomerica">Peptídicas / Oligoméricas</option>
                  <option value="inmunomoduladora">Inmunomoduladora (Impact)</option>
                </select>
              </div>

              {/* Formula Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredFormulas.map((formula) => {
                  const isSelected = formula.id === selectedFormulaId;
                  return (
                    <div
                      key={formula.id}
                      onClick={() => setSelectedFormulaId(formula.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-2 ring-teal-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 block">
                              {formula.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              {formula.brand}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {formula.caloricDensityKcalMl} kcal/ml
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {formula.clinicalIndications}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                        <span>Prot: {formula.proteinGramsPerLiter}g/L</span>
                        <span>Osm: {formula.osmolarityMOsmKg} mOsm</span>
                        <span>Agua: {formula.freeWaterPercent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Administration Route & Regimen Settings */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Vía de Acceso & Régimen de Administración</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vía */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Vía de Acceso Enteral
                  </label>
                  <select
                    value={commercialRoute}
                    onChange={(e) => setCommercialRoute(e.target.value as EnteralRoute)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                  >
                    <option value="oral">Vía Oral / Suplementación</option>
                    <option value="sng">Sonda Nasogástrica (SNG)</option>
                    <option value="sny">Sonda Nasoyeyunal (SNY)</option>
                    <option value="peg">Gastrostomía Endoscópica (PEG)</option>
                    <option value="pej">Yeyunostomía (PEJ)</option>
                  </select>
                </div>

                {/* Modalidad */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Modalidad de Infusión
                  </label>
                  <select
                    value={commercialMode}
                    onChange={(e) => setCommercialMode(e.target.value as EnteralAdministrationMode)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2 bg-white text-slate-800"
                  >
                    <option value="bolus">Por Bolos / Jeringa (Gástrico)</option>
                    <option value="gravity">Gravedad Intermitente</option>
                    <option value="continuous">Infusión Continua por Bomba (24h/16h)</option>
                  </select>
                </div>
              </div>

              {commercialMode === 'continuous' ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Horas de Infusión al Día
                  </label>
                  <div className="flex gap-2">
                    {[24, 20, 16, 12].map((hours) => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => setCommercialInfusionHours(hours)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          commercialInfusionHours === hours
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {hours} Horas
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Número de Bolos al Día
                  </label>
                  <div className="flex gap-2">
                    {[4, 5, 6].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setCommercialBolusCount(count)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          commercialBolusCount === count
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {count} Tomas / Bolos
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Calculated Prescription Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Prescripción Calculada
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {currentFormula.name}
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-100">
                  {currentFormula.brand}
                </span>
              </div>

              {/* Big KPI Metric: Daily Volume & Cans */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-900 text-white rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Volumen Total Diario
                  </span>
                  <div className="text-2xl font-black mt-0.5">
                    {commercialPrescription.totalVolumeMl}{' '}
                    <span className="text-xs font-normal text-teal-400">ml/día</span>
                  </div>
                  <span className="text-[11px] text-slate-300 mt-1 block">
                    ~{commercialPrescription.containersCount} latas ({currentFormula.containerSizeMl}ml c/u)
                  </span>
                </div>

                <div className="p-3.5 bg-teal-50 border border-teal-100 text-teal-950 rounded-xl">
                  <span className="text-[10px] text-teal-700 font-bold uppercase block">
                    Energía Aportada
                  </span>
                  <div className="text-2xl font-black mt-0.5 text-teal-900">
                    {commercialPrescription.dailyCalories}{' '}
                    <span className="text-xs font-normal text-teal-700">kcal</span>
                  </div>
                  <span className="text-[11px] text-teal-800 mt-1 block">
                    Densidad: {currentFormula.caloricDensityKcalMl} kcal/ml
                  </span>
                </div>
              </div>

              {/* Macro Nutrients Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Macronutrientes Aportados:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">
                      Proteínas
                    </span>
                    <span className="text-base font-extrabold text-blue-900">
                      {commercialPrescription.dailyProteinGrams}g
                    </span>
                    <span className="text-[10px] text-blue-600 block mt-0.5">
                      {(commercialPrescription.dailyProteinGrams / patientWeightKg).toFixed(2)} g/kg
                    </span>
                  </div>

                  <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">
                      Carbohidratos
                    </span>
                    <span className="text-base font-extrabold text-amber-900">
                      {commercialPrescription.dailyCarbGrams}g
                    </span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">
                      {currentFormula.carbPercent}% VCT
                    </span>
                  </div>

                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                      Lípidos
                    </span>
                    <span className="text-base font-extrabold text-emerald-900">
                      {commercialPrescription.dailyFatGrams}g
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">
                      {currentFormula.fatPercent}% VCT
                    </span>
                  </div>
                </div>
              </div>

              {/* Fluid Balance & Sonda Flushing */}
              <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl space-y-1.5 text-xs text-sky-950">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-sky-900">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    Balance Hídrico Enteral:
                  </span>
                  <span>Meta: {Math.round(targetHydrationLiters * 1000)} ml/d</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-sky-800">
                  <span>Agua libre de la fórmula ({currentFormula.freeWaterPercent}%):</span>
                  <span className="font-bold">{commercialPrescription.freeWaterMl} ml</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-sky-900 font-extrabold pt-1 border-t border-sky-200">
                  <span>Agua adicional para lavados de sonda:</span>
                  <span className="text-teal-700">+{commercialPrescription.additionalWaterFlushesMl} ml/d</span>
                </div>
              </div>

              {/* Infusion Regimen Highlight */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Instrucciones de Dosificación al Personal de Enfermería / Cuidador:
                </div>
                {commercialMode === 'continuous' ? (
                  <div className="text-sm">
                    Velocidad de bomba:{' '}
                    <span className="font-extrabold text-teal-300 text-base">
                      {commercialPrescription.infusionRateMlPerHour} ml/hora
                    </span>{' '}
                    durante {commercialInfusionHours} horas continuas.
                  </div>
                ) : (
                  <div className="text-sm">
                    Horario de bolos:{' '}
                    <span className="font-extrabold text-teal-300 text-base">
                      {commercialBolusCount} bolos de {commercialPrescription.bolusVolumeMl} ml
                    </span>{' '}
                    cada {commercialPrescription.bolusIntervalHours} horas.
                  </div>
                )}
                <div className="text-[11px] text-slate-300">
                  Calibre de sonda recomendado: Sonda <b>Fr {commercialPrescription.tubeGaugeFr}</b>. Lavar con 30-50ml de agua hervida tibia.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ARTISANAL BLEND (LICUADOS ARTESANALES) MODULE */}
      {/* ======================================================== */}
      {subTab === 'artisanal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recipe Builder with Real Foods */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Soup className="w-4 h-4 text-amber-500" />
                    <span>Ingredientes del Licuado Artesanal Clínico</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifica porciones o agrega ingredientes cocidos y colados.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Agua hervida agregada:</span>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    max="1500"
                    value={addedWaterMl}
                    onChange={(e) => setAddedWaterMl(Number(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg text-center font-bold"
                  />
                  <span className="text-xs text-slate-500 font-bold">ml</span>
                </div>
              </div>

              {/* Active Ingredients List */}
              <div className="space-y-2.5">
                {selectedArtisanalItems.map(({ ingredient, quantity }) => {
                  const caloriesTotal = Math.round(ingredient.calories * quantity);
                  const proteinTotal = Math.round(ingredient.protein * quantity);
                  return (
                    <div
                      key={ingredient.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">
                            {ingredient.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              ingredient.viscosityScore === 3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {ingredient.viscosityScore === 3 ? 'Tamizado Estricto' : 'Fluido'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Unidad: {ingredient.portionUnit} · {caloriesTotal} kcal · {proteinTotal}g Prot
                        </div>
                      </div>

                      {/* Counter */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ingredient.id, -0.5)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-9 text-center font-bold text-xs text-slate-800">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(ingredient.id, 0.5)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add More Ingredients Catalog */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  Agregar más alimentos recomendados para sonda:
                </span>
                <div className="flex flex-wrap gap-2">
                  {ARTISANAL_INGREDIENTS.filter(
                    (ing) => !selectedArtisanalItems.some((i) => i.ingredient.id === ing.id)
                  ).map((ing) => (
                    <button
                      key={ing.id}
                      onClick={() => handleAddIngredient(ing)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50 rounded-lg text-slate-700 font-medium transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-teal-600" />
                      <span>{ing.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Safety & Hygiene Protocol Card */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3 text-xs text-amber-950">
              <h4 className="font-bold flex items-center gap-2 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Protocolo de Higiene & Prevención de Obstrucción de Sonda</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] leading-relaxed text-amber-900">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><b>Doble tamizado:</b> Colar 2 veces con malla fina o gasa limpia antes de administrar para evitar tapones.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><b>Calibre mínimo de sonda:</b> Se requiere sonda Fr 14 o superior (PEG Fr 16-18) para licuados artesanales.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><b>Lavado de sonda:</b> Pasar 30-50 ml de agua hervida tibia antes y después de cada bolo.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><b>Refrigeración máx. 24h:</b> Desechar cualquier sobrante después de 24 horas.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Artisanal Calculations & Schedule */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Resumen del Licuado
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    Fórmula Artesanal Homogeneizada
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
                  {artisanalPrescription.tubeGaugeFr} Fr Sugerido
                </span>
              </div>

              {/* Big KPI Metric */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-900 text-white rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Volumen Final
                  </span>
                  <div className="text-2xl font-black mt-0.5">
                    {artisanalPrescription.totalVolumeMl}{' '}
                    <span className="text-xs font-normal text-amber-400">ml</span>
                  </div>
                  <span className="text-[11px] text-slate-300 mt-1 block">
                    Densidad: {(artisanalPrescription.dailyCalories / artisanalPrescription.totalVolumeMl).toFixed(2)} kcal/ml
                  </span>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-100 text-amber-950 rounded-xl">
                  <span className="text-[10px] text-amber-700 font-bold uppercase block">
                    Energía Total
                  </span>
                  <div className="text-2xl font-black mt-0.5 text-amber-900">
                    {artisanalPrescription.dailyCalories}{' '}
                    <span className="text-xs font-normal text-amber-700">kcal</span>
                  </div>
                  <span className="text-[11px] text-amber-800 mt-1 block">
                    {Math.round((artisanalPrescription.dailyCalories / targetCalories) * 100)}% de meta diaria
                  </span>
                </div>
              </div>

              {/* Macro Nutrients Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Macronutrientes Aportados:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">
                      Proteínas
                    </span>
                    <span className="text-base font-extrabold text-blue-900">
                      {artisanalPrescription.dailyProteinGrams}g
                    </span>
                    <span className="text-[10px] text-blue-600 block mt-0.5">
                      {(artisanalPrescription.dailyProteinGrams / patientWeightKg).toFixed(2)} g/kg
                    </span>
                  </div>

                  <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">
                      Carbohidratos
                    </span>
                    <span className="text-base font-extrabold text-amber-900">
                      {artisanalPrescription.dailyCarbGrams}g
                    </span>
                  </div>

                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                      Lípidos
                    </span>
                    <span className="text-base font-extrabold text-emerald-900">
                      {artisanalPrescription.dailyFatGrams}g
                    </span>
                  </div>
                </div>
              </div>

              {/* Bolus Schedule Card */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Horario de Bolos Artesanales:
                </div>
                <div className="text-sm">
                  Administrar:{' '}
                  <span className="font-extrabold text-amber-300 text-base">
                    {artisanalBolusCount} bolos de {artisanalPrescription.bolusVolumeMl} ml
                  </span>{' '}
                  cada {artisanalPrescription.bolusIntervalHours} horas.
                </div>
                <div className="text-[11px] text-slate-300">
                  Lavar con <b>40 ml de agua hervida tibia</b> antes y después de cada bolo.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Fórmulas y Licuados Enterales Asignados */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Registro Clínico de Soporte Enteral
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              Historial de Fórmulas y Licuados Asignados ({patient.enteralPrescriptions?.length || 0})
            </h3>
          </div>
          <button
            onClick={() => onNavigateToTab('print', 'enteral')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Activa</span>
          </button>
        </div>

        {patient.enteralPrescriptions && patient.enteralPrescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {patient.enteralPrescriptions.map((p, idx) => (
              <div key={p.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                    {p.type === 'commercial' ? 'Comercial' : 'Artesanal'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{p.date || 'Reciente'}</span>
                </div>
                <div className="font-extrabold text-slate-900 text-sm">{p.formulaName}</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                  <div>Volumen: <b className="text-slate-900">{p.totalVolumeMl} ml</b></div>
                  <div>Energía: <b className="text-teal-800">{p.dailyCalories} kcal</b></div>
                  <div>Proteína: <b className="text-blue-700">{p.dailyProteinGrams} g</b></div>
                  <div>Vía: <b className="text-slate-800 uppercase">{p.route}</b></div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onUpdatePatient({
                        ...patient,
                        activeEnteralPrescription: p,
                        updatedAt: new Date().toISOString(),
                      });
                      onNavigateToTab('print', 'enteral');
                    }}
                    className="w-full py-1.5 text-center text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer"
                  >
                    Ver / Imprimir este Registro
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No hay registros previos de prescripción enteral guardados. Guarde la prescripción actual para registrarla en el historial clínico.
          </div>
        )}
      </div>
    </div>
  );
};
