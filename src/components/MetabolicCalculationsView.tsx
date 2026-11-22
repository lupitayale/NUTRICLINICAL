import React, { useState, useMemo } from 'react';
import {
  Activity,
  Zap,
  ShieldCheck,
  AlertCircle,
  Flame,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  Patient,
  EnergyFormula,
  ActivityLevel,
  PathologyType,
  NutritionGoal,
  MacroPrescription,
} from '../types/nutrition';
import {
  PATHOLOGY_INFO,
  PATHOLOGY_CATEGORIES,
  ENERGY_FORMULAS_INFO,
  calculateBMR,
  buildClinicalMacroPrescription,
} from '../utils/nutritionCalculations';

interface MetabolicCalculationsViewProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigateToTab: (tab: string) => void;
}

export const MetabolicCalculationsView: React.FC<MetabolicCalculationsViewProps> = ({
  patient,
  onUpdatePatient,
  onNavigateToTab,
}) => {
  const latestConsult = patient.consultations[patient.consultations.length - 1];
  const weight = latestConsult?.weightKg || 70;
  const height = latestConsult?.heightCm || 170;
  const age = patient.age;
  const gender = patient.gender;

  // Active form state based on activePrescription
  const [formula, setFormula] = useState<EnergyFormula>(patient.activePrescription.formula || 'mifflin');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(patient.activePrescription.activityLevel || 1.375);
  const [calorieOffset, setCalorieOffset] = useState<number>(patient.activePrescription.calorieAdjustment || -500);

  // Pathologies active set (local copy allowing instant recalculation)
  const [activePathologies, setActivePathologies] = useState<PathologyType[]>([...patient.pathologies]);
  const [selectedPathologyCategory, setSelectedPathologyCategory] = useState<string>('all');
  const [pathologySearch, setPathologySearch] = useState<string>('');

  const filteredPathologyKeys = useMemo(() => {
    return (Object.keys(PATHOLOGY_INFO) as PathologyType[]).filter((key) => {
      const info = PATHOLOGY_INFO[key];
      const matchesSearch =
        pathologySearch.trim() === '' ||
        info.name.toLowerCase().includes(pathologySearch.toLowerCase()) ||
        info.clinicalFocus.toLowerCase().includes(pathologySearch.toLowerCase()) ||
        info.shortDescription.toLowerCase().includes(pathologySearch.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedPathologyCategory === 'all') return true;
      const group = PATHOLOGY_CATEGORIES.find((g) => g.id === selectedPathologyCategory);
      return group ? group.pathologies.includes(key) : true;
    });
  }, [selectedPathologyCategory, pathologySearch]);

  // Macro percentages
  const [proteinPct, setProteinPct] = useState<number>(patient.activePrescription.proteinPercent);
  const [carbPct, setCarbPct] = useState<number>(patient.activePrescription.carbPercent);
  const [fatPct, setFatPct] = useState<number>(patient.activePrescription.fatPercent);

  // Status message
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sports Nutrition State
  const [isSportsNutrition, setIsSportsNutrition] = useState(false);
  const [sportsCategory, setSportsCategory] = useState<'endurance' | 'strength' | 'power'>('endurance');
  const [trainingIntensity, setTrainingIntensity] = useState<'baja' | 'moderada' | 'alta'>('moderada');

  // Recalculate BMR, TEF, TEE
  const bmr = calculateBMR(formula, weight, height, age, gender, latestConsult?.bodyFatPercent);
  
  // Apply sports nutrition adjustments
  let adjustedActivityLevel = activityLevel;
  if (isSportsNutrition) {
    const sportsFactor = { baja: 0.1, moderada: 0.2, alta: 0.3 }[trainingIntensity];
    adjustedActivityLevel += sportsFactor;
  }
  
  const bmrWithActivity = Math.round(bmr * adjustedActivityLevel);
  const tef = Math.round(bmrWithActivity * 0.1);
  const tee = bmrWithActivity + tef;
  const targetCalories = Math.max(1100, tee + calorieOffset);

  // Compute grams from current percentages (modified for sports protein needs)
  let proteinPctAdj = proteinPct;
  if (isSportsNutrition && proteinPct < 20) proteinPctAdj = Math.max(proteinPct, 20);
  
  const proteinKcal = Math.round(targetCalories * (proteinPctAdj / 100));
  const proteinGrams = Math.round(proteinKcal / 4);
  const proteinGPerKg = Number((proteinGrams / weight).toFixed(2));

  const carbKcal = Math.round(targetCalories * (carbPct / 100));
  const carbGrams = Math.round(carbKcal / 4);

  const fatKcal = Math.round(targetCalories * (fatPct / 100));
  const fatGrams = Math.round(fatKcal / 9);

  // ... (Keep existing UI or add new sports section)
  // [ADD THE UI SECTION HERE LATER]


  const totalPct = proteinPct + carbPct + fatPct;

  // Action: Apply recommended clinical setup based on active pathologies
  const handleApplyClinicalPrescription = () => {
    const recommended = buildClinicalMacroPrescription(
      weight,
      height,
      age,
      gender,
      activePathologies,
      patient.targetGoal,
      formula,
      activityLevel,
      calorieOffset,
      latestConsult?.bodyFatPercent
    );

    setProteinPct(recommended.proteinPercent);
    setCarbPct(recommended.carbPercent);
    setFatPct(recommended.fatPercent);
  };

  const togglePathology = (p: PathologyType) => {
    const updated = activePathologies.includes(p)
      ? activePathologies.filter((item) => item !== p)
      : [...activePathologies, p];
    setActivePathologies(updated);

    // Auto update recommended macros on toggle
    const recommended = buildClinicalMacroPrescription(
      weight,
      height,
      age,
      gender,
      updated,
      patient.targetGoal,
      formula,
      activityLevel,
      calorieOffset,
      latestConsult?.bodyFatPercent
    );

    setProteinPct(recommended.proteinPercent);
    setCarbPct(recommended.carbPercent);
    setFatPct(recommended.fatPercent);
  };

  const handleSavePrescription = () => {
    // Collect guidelines
    const guidelines: string[] = [];
    let sodiumMgLimit: number | undefined;
    let phosphorusMgLimit: number | undefined;

    if (activePathologies.includes('ckd_non_dialysis')) {
      sodiumMgLimit = 1800;
      phosphorusMgLimit = 800;
      guidelines.push('ERC: Ingesta proteica ajustada a 0.6-0.8 g/kg para limitar uremia.');
      guidelines.push('Restricción de fósforo a < 800 mg/día y sodio a < 1800 mg/día.');
    }
    if (activePathologies.includes('diabetes_t2') || activePathologies.includes('diabetes_t1')) {
      guidelines.push('Diabetes: Énfasis en carbohidratos de absorción lenta y >= 35g de fibra.');
    }
    if (activePathologies.includes('hypertension')) {
      sodiumMgLimit = Math.min(sodiumMgLimit ?? 2000, 1500);
      guidelines.push('Hipertensión: Sodio restringido a < 1500 mg/día (Protocolo DASH).');
    }
    if (activePathologies.includes('fatty_liver')) {
      guidelines.push('Hígado Graso: Restringir fructosa añadida; priorizar ácidos grasos monoinsaturados.');
    }

    const updatedPrescription: MacroPrescription = {
      formula,
      activityLevel,
      isSportsNutrition,
      sportsCategory,
      trainingIntensity,
      bmr,
      tef,
      tee,
      calorieAdjustment: calorieOffset,
      targetCalories,
      proteinGramsPerKg: proteinGPerKg,
      proteinGrams,
      proteinKcal,
      proteinPercent: proteinPct,
      carbGrams,
      carbKcal,
      carbPercent: carbPct,
      fatGrams,
      fatKcal,
      fatPercent: fatPct,
      sodiumMgLimit,
      phosphorusMgLimit,
      clinicalGuidelines: guidelines,
    };

    const updatedPatient: Patient = {
      ...patient,
      pathologies: activePathologies,
      activePrescription: updatedPrescription,
      updatedAt: new Date().toISOString(),
    };

    onUpdatePatient(updatedPatient);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Cálculo Energético & Ajuste Fisiopatológico
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-100">
              {patient.fullName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Parámetros base: {weight} kg · {height} cm · {age} años · {gender === 'male' ? 'Hombre' : 'Mujer'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleApplyClinicalPrescription}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            <Zap className="w-4 h-4 text-teal-600" />
            <span>Aplicar Ajuste Fisiopatológico Óptimo</span>
          </button>

          <button
            onClick={handleSavePrescription}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{savedFeedback ? '¡Guardado con Éxito!' : 'Guardar Prescripción'}</span>
          </button>
        </div>
      </div>

      {/* Pathologies Engine Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Patologías Activas (Ajuste Metabólico Clínico)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Selecciona o busca patologías comunes y enfermedades raras. Las reglas dietéticas y macronutrientes se adaptan al instante.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
              {activePathologies.length} Patología(s) Activa(s)
            </span>
          </div>
        </div>

        {/* Filter Controls: Search & Category Filter Tabs / Dropdown */}
        <div className="space-y-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={pathologySearch}
                onChange={(e) => setPathologySearch(e.target.value)}
                placeholder="Buscar patología o enfermedad rara (ej. Lupus, Wilson, ELA, Fibrosis Quística, Glucogenosis, ERC)..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <select
              value={selectedPathologyCategory}
              onChange={(e) => setSelectedPathologyCategory(e.target.value)}
              className="sm:w-64 px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              <option value="all">Todas las categorías ({Object.keys(PATHOLOGY_INFO).length})</option>
              {PATHOLOGY_CATEGORIES.map((cat) => {
                const countActive = cat.pathologies.filter((p) => activePathologies.includes(p)).length;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.pathologies.length}) {countActive > 0 ? `· ${countActive} activa(s)` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Category Pills for quick desktop switching */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedPathologyCategory('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedPathologyCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({Object.keys(PATHOLOGY_INFO).length})
            </button>
            {PATHOLOGY_CATEGORIES.map((cat) => {
              const countActive = cat.pathologies.filter((p) => activePathologies.includes(p)).length;
              const isSelected = selectedPathologyCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedPathologyCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  {countActive > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-white text-teal-800' : 'bg-teal-600 text-white'
                    }`}>
                      {countActive}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pathologies Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredPathologyKeys.map((key) => {
            const info = PATHOLOGY_INFO[key];
            const isSelected = activePathologies.includes(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => togglePathology(key)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-600 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {info.name}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                      isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 line-clamp-2">
                  {info.clinicalFocus}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy Calculation Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Formulas & Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Fórmula de Gasto Energético & Nivel de Actividad</span>
          </h3>

          <div className="space-y-4">
            {/* Formula Selector with rich metadata */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Fórmula Predictiva de Gasto Energético Basal (GEB)
                </label>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  {ENERGY_FORMULAS_INFO.length} Fórmulas Clínicas Validadas
                </span>
              </div>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value as EnergyFormula)}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                {ENERGY_FORMULAS_INFO.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — [{f.badge}]
                  </option>
                ))}
              </select>

              {/* Formula details card */}
              {(() => {
                const currentFormula = ENERGY_FORMULAS_INFO.find((f) => f.id === formula) || ENERGY_FORMULAS_INFO[0];
                return (
                  <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{currentFormula.shortName}</span>
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                        {currentFormula.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Población objetivo:</span> {currentFormula.population}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {currentFormula.description}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Factor de Actividad Física (PAL)
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(Number(e.target.value) as ActivityLevel)}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value={1.2}>Sedentario (1.2) - Trabajo de escritorio, poco ejercicio</option>
                <option value={1.375}>Ligero (1.375) - Ejercicio ligero 1-3 días/semana</option>
                <option value={1.55}>Moderado (1.55) - Ejercicio moderado 3-5 días/semana</option>
                <option value={1.725}>Intenso (1.725) - Entrenamiento intenso 6-7 días/semana</option>
                <option value={1.9}>Muy Intenso (1.9) - Atleta de alto rendimiento</option>
              </select>
            </div>

            {/* Sports Nutrition Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={isSportsNutrition}
                  onChange={(e) => setIsSportsNutrition(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <span className="text-xs font-bold text-slate-800">Activar Nutrición Deportiva</span>
              </label>

              {isSportsNutrition && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Tipo</label>
                      <select
                        value={sportsCategory}
                        onChange={(e) => setSportsCategory(e.target.value as any)}
                        className="w-full px-2 py-1.5 text-[11px] border border-slate-300 rounded-lg"
                      >
                        <option value="endurance">Resistencia (Endurance)</option>
                        <option value="strength">Fuerza (Hipertrofia)</option>
                        <option value="power">Potencia / Velocidad</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Intensidad</label>
                      <select
                        value={trainingIntensity}
                        onChange={(e) => setTrainingIntensity(e.target.value as any)}
                        className="w-full px-2 py-1.5 text-[11px] border border-slate-300 rounded-lg"
                      >
                        <option value="baja">Baja</option>
                        <option value="moderada">Moderada</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calorie Goal Offset */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Ajuste por Objetivo (Déficit / Superávit Calórico)
              </label>
              <span className={`text-xs font-bold ${calorieOffset < 0 ? 'text-amber-600' : calorieOffset > 0 ? 'text-blue-600' : 'text-slate-600'}`}>
                {calorieOffset > 0 ? `+${calorieOffset}` : calorieOffset} kcal / día
              </span>
            </div>

            {/* Quick buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: 'Déficit -500 kcal (Grasa)', val: -500 },
                { label: 'Déficit Leve -300 kcal', val: -300 },
                { label: 'Normocalórica (0 kcal)', val: 0 },
                { label: 'Superávit +300 kcal', val: 300 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => setCalorieOffset(btn.val)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                    calorieOffset === btn.val
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="-1000"
              max="1000"
              step="50"
              value={calorieOffset}
              onChange={(e) => setCalorieOffset(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Caloric Breakdown Summary */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">GEB / TMB</div>
              <div className="text-base font-extrabold text-slate-800">{bmr}</div>
              <div className="text-[10px] text-slate-500">kcal</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">ETA (10%)</div>
              <div className="text-base font-extrabold text-slate-800">{tef}</div>
              <div className="text-[10px] text-slate-500">kcal</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">GET (Mantenimiento)</div>
              <div className="text-base font-extrabold text-slate-800">{tee}</div>
              <div className="text-[10px] text-slate-500">kcal</div>
            </div>

            <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
              <div className="text-[10px] uppercase font-bold text-teal-700">META FINAL</div>
              <div className="text-lg font-black text-teal-900">{targetCalories}</div>
              <div className="text-[10px] text-teal-800 font-semibold">kcal / día</div>
            </div>
          </div>
        </div>

        {/* Right Column: Pathological Clinical Advice */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-teal-600" />
              <span>Directrices Clínicas Específicas</span>
            </h4>

            {activePathologies.length > 0 ? (
              <div className="space-y-3">
                {activePathologies.map((p) => {
                  const info = PATHOLOGY_INFO[p];
                  return (
                    <div key={p} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>{info.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          Prot: {info.proteinPerKg} g/kg
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                        {info.clinicalFocus}
                      </p>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                        {info.specialRestrictions.map((r, rIdx) => (
                          <span
                            key={rIdx}
                            className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                No hay patologías seleccionadas. Se aplicará un reparto balanceado estándar de macronutrientes (20% Proteína, 50% Carbohidratos, 30% Grasas).
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => onNavigateToTab('menus')}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generar Menú Automático con estos Valores</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cuadro Dietosintético (Macronutrient Distribution) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cuadro Dietosintético Interactivo
            </h3>
            <p className="text-xs text-slate-500">
              Distribución de macronutrientes en porcentajes (%), gramos y g/kg de peso corporal
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-lg ${
                totalPct === 100
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              Suma: {totalPct}% {totalPct === 100 ? '(Válido)' : '(Debe sumar 100%)'}
            </span>
          </div>
        </div>

        {/* Visual Macro Progress Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex mb-6 bg-slate-100">
          <div
            style={{ width: `${proteinPct}%` }}
            className="bg-blue-500 h-full transition-all duration-300"
            title={`Proteína: ${proteinPct}%`}
          />
          <div
            style={{ width: `${carbPct}%` }}
            className="bg-amber-500 h-full transition-all duration-300"
            title={`Carbohidratos: ${carbPct}%`}
          />
          <div
            style={{ width: `${fatPct}%` }}
            className="bg-emerald-500 h-full transition-all duration-300"
            title={`Grasas: ${fatPct}%`}
          />
        </div>

        {/* Macro Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Proteínas */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Proteínas (4 kcal/g)
              </span>
              <span className="text-xs font-bold text-blue-700">{proteinGPerKg} g/kg</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="5"
                max="60"
                value={proteinPct}
                onChange={(e) => setProteinPct(Number(e.target.value))}
                className="w-20 px-2 py-1.5 text-sm font-bold bg-white border border-blue-300 rounded-lg text-center"
              />
              <span className="text-xs font-bold text-slate-600">%</span>
              <div className="text-right flex-1 text-xs text-slate-700">
                <span className="font-extrabold text-slate-900 text-sm">{proteinGrams} g</span>{' '}
                · {proteinKcal} kcal
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="60"
              value={proteinPct}
              onChange={(e) => setProteinPct(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            {activePathologies.includes('ckd_non_dialysis') && (
              <p className="text-[10px] text-amber-800 font-semibold bg-amber-50 p-1.5 rounded">
                ERC activa: Mantener entre 0.6 y 0.8 g/kg para no forzar la función renal.
              </p>
            )}
          </div>

          {/* Carbohidratos */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Carbohidratos (4 kcal/g)
              </span>
              <span className="text-xs font-bold text-amber-700">
                {activePathologies.includes('diabetes_t2') ? 'Bajo IG' : 'Complejos'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="10"
                max="80"
                value={carbPct}
                onChange={(e) => setCarbPct(Number(e.target.value))}
                className="w-20 px-2 py-1.5 text-sm font-bold bg-white border border-amber-300 rounded-lg text-center"
              />
              <span className="text-xs font-bold text-slate-600">%</span>
              <div className="text-right flex-1 text-xs text-slate-700">
                <span className="font-extrabold text-slate-900 text-sm">{carbGrams} g</span>{' '}
                · {carbKcal} kcal
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="80"
              value={carbPct}
              onChange={(e) => setCarbPct(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            {activePathologies.includes('diabetes_t2') && (
              <p className="text-[10px] text-teal-800 font-semibold bg-teal-50 p-1.5 rounded">
                Diabetes activa: Recomendar 40-45% de carbohidratos complejos altos en fibra.
              </p>
            )}
          </div>

          {/* Grasas / Lípidos */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Grasas / Lípidos (9 kcal/g)
              </span>
              <span className="text-xs font-bold text-emerald-700">Monoinsaturadas</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="10"
                max="60"
                value={fatPct}
                onChange={(e) => setFatPct(Number(e.target.value))}
                className="w-20 px-2 py-1.5 text-sm font-bold bg-white border border-emerald-300 rounded-lg text-center"
              />
              <span className="text-xs font-bold text-slate-600">%</span>
              <div className="text-right flex-1 text-xs text-slate-700">
                <span className="font-extrabold text-slate-900 text-sm">{fatGrams} g</span>{' '}
                · {fatKcal} kcal
              </div>
            </div>

            <input
              type="range"
              min="10"
              max="60"
              value={fatPct}
              onChange={(e) => setFatPct(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            {activePathologies.includes('fatty_liver') && (
              <p className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 p-1.5 rounded">
                Hígado graso activo: Priorizar aceite de oliva y Omega-3; limitar saturadas &lt;7%.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
