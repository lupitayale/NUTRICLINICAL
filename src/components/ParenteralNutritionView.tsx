import React, { useState } from 'react';
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Save,
  Printer,
  Info,
  Scale,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Patient, ParenteralPrescription, ParenteralAccessRoute } from '../types/nutrition';
import {
  calculateParenteralPrescription,
  ParenteralInputParams,
} from '../utils/parenteralCalculations';

interface ParenteralNutritionViewProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigateToTab: (tab: string, docType?: string) => void;
}

export const ParenteralNutritionView: React.FC<ParenteralNutritionViewProps> = ({
  patient,
  onUpdatePatient,
  onNavigateToTab,
}) => {
  const latestConsult = patient.consultations[patient.consultations.length - 1];
  const initialWeight = latestConsult ? latestConsult.weightKg : 70;

  const [weightKg, setWeightKg] = useState<number>(initialWeight);
  const [totalVolumeTargetMl, setTotalVolumeTargetMl] = useState<number>(1800);
  const [accessRouteChoice, setAccessRouteChoice] = useState<ParenteralAccessRoute>('central');
  const [infusionHours, setInfusionHours] = useState<number>(24);

  // Amino Acids
  const [aminoAcidConcentration, setAminoAcidConcentration] = useState<number>(10); // 10%
  const [aminoAcidGramsPerKg, setAminoAcidGramsPerKg] = useState<number>(1.3); // g/kg

  // Dextrose
  const [dextroseConcentration, setDextroseConcentration] = useState<number>(50); // 50%
  const [dextroseTotalGrams, setDextroseTotalGrams] = useState<number>(220); // grams

  // Lipids
  const [lipidConcentration, setLipidConcentration] = useState<number>(20); // 20%
  const [lipidGramsPerKg, setLipidGramsPerKg] = useState<number>(0.9); // g/kg

  // Electrolytes
  const [sodiumMeq, setSodiumMeq] = useState<number>(Math.round(initialWeight * 1.2)); // ~1.2 mEq/kg
  const [potassiumMeq, setPotassiumMeq] = useState<number>(Math.round(initialWeight * 1.0)); // ~1.0 mEq/kg
  const [calciumMeq, setCalciumMeq] = useState<number>(12); // mEq
  const [magnesiumMeq, setMagnesiumMeq] = useState<number>(10); // mEq
  const [phosphorusMmol, setPhosphorusMmol] = useState<number>(25); // mmol

  // Additives
  const [mviMl, setMviMl] = useState<number>(10); // 1 vial = 10ml
  const [traceElementsMl, setTraceElementsMl] = useState<number>(5); // 1 vial = 5ml
  const [heparinUnits, setHeparinUnits] = useState<number>(1000);
  const [vitaminCMg, setVitaminCMg] = useState<number>(500);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compute prescription in real-time
  const params: ParenteralInputParams = {
    patientId: patient.id,
    patientWeightKg: weightKg,
    totalVolumeTargetMl,
    aminoAcidGramsPerKg,
    aminoAcidConcentrationPercent: aminoAcidConcentration,
    dextroseTotalGrams,
    dextroseConcentrationPercent: dextroseConcentration,
    lipidGramsPerKg,
    lipidConcentrationPercent: lipidConcentration,
    sodiumMeq,
    potassiumMeq,
    calciumMeq,
    magnesiumMeq,
    phosphorusMmol,
    mviMl,
    traceElementsMl,
    heparinUnits,
    vitaminCMg,
    infusionHours,
    accessRouteChoice,
  };

  const prescription: ParenteralPrescription = calculateParenteralPrescription(params);

  // Component volumes for compounding
  const aaVolumeMl = Math.round((prescription.aminoAcidTotalGrams / aminoAcidConcentration) * 100);
  const dexVolumeMl = Math.round((prescription.dextroseTotalGrams / dextroseConcentration) * 100);
  const lipVolumeMl = Math.round((prescription.lipidTotalGrams / (lipidConcentration / 100)));
  const additivesVolumeMl = mviMl + traceElementsMl;
  const electroVolumeEstMl = Math.round((sodiumMeq + potassiumMeq) * 0.2);
  const sterileWaterForInjectionMl = Math.max(
    0,
    prescription.totalVolumeMl - (aaVolumeMl + dexVolumeMl + lipVolumeMl + additivesVolumeMl + electroVolumeEstMl)
  );

  const handleSaveToPatient = () => {
    onUpdatePatient({
      ...patient,
      activeParenteralPrescription: prescription,
      updatedAt: new Date().toISOString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Módulo de Nutrición Parenteral Total (NPT / TPN)
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-100">
                Guías ESPEN / ASPEN
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Paciente: <span className="font-bold text-slate-800">{patient.fullName}</span> ·{' '}
              Peso de Prescripción:{' '}
              <span className="font-bold text-purple-800">{weightKg} kg</span> · Acceso Vascular:{' '}
              <span
                className={`font-bold ${
                  prescription.isCentralRouteMandatory ? 'text-rose-600' : 'text-teal-700'
                }`}
              >
                {prescription.isCentralRouteMandatory
                  ? 'Catéter Venoso Central (CVC Requerido)'
                  : accessRouteChoice === 'central'
                  ? 'Catéter Venoso Central (CVC)'
                  : 'Vía Periférica Permitida'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveToPatient}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savedSuccess ? '¡Prescripción NPT Guardada!' : 'Guardar Prescripción NPT'}</span>
            </button>

            <button
              onClick={() => onNavigateToTab('print', 'parenteral')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Real-time Critical Safety Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-200">
          {/* Osmolarity Metric */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col justify-between ${
              prescription.calculatedOsmolarityMOsmL >= 900
                ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Osmolaridad Total
              </span>
              {prescription.calculatedOsmolarityMOsmL >= 900 ? (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div className="mt-1">
              <span className="text-2xl font-black">
                {prescription.calculatedOsmolarityMOsmL}
              </span>
              <span className="text-xs font-semibold ml-1">mOsm/L</span>
            </div>
            <span className="text-[10px] font-bold mt-1">
              {prescription.calculatedOsmolarityMOsmL >= 900
                ? '⚠️ CVC Central Obligatorio (Flebitis)'
                : '✓ Apta para Vía Periférica'}
            </span>
          </div>

          {/* Glucose Infusion Rate (TIG) Metric */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col justify-between ${
              prescription.glucoseInfusionRateMgKgMin > 4.5
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-blue-50/80 border-blue-200 text-blue-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Tasa Infusión Glucosa (TIG)
              </span>
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-1">
              <span className="text-2xl font-black">
                {prescription.glucoseInfusionRateMgKgMin}
              </span>
              <span className="text-xs font-semibold ml-1">mg/kg/min</span>
            </div>
            <span className="text-[10px] font-bold mt-1">
              {prescription.glucoseInfusionRateMgKgMin > 4.5
                ? '⚠️ Riesgo de Esteatosis (>4.5)'
                : '✓ Rango Seguro Óptimo (2.0-4.0)'}
            </span>
          </div>

          {/* Non-Protein Calories to Nitrogen Ratio */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between text-slate-900">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Relación Kcal NP : g N
            </span>
            <div className="mt-1">
              <span className="text-2xl font-black text-slate-900">
                {prescription.nonProteinCalorieToNitrogenRatio}:1
              </span>
            </div>
            <span className="text-[10px] text-slate-600 font-semibold mt-1">
              {prescription.nonProteinCalorieToNitrogenRatio < 100
                ? 'Estrés Severo / Catabolismo'
                : prescription.nonProteinCalorieToNitrogenRatio <= 130
                ? 'Estrés Moderado / Postquirúrgico'
                : 'Mantenimiento / Anabolismo'}
            </span>
          </div>

          {/* Infusion Rate ml/h */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
              Velocidad de Bomba Infusora
            </span>
            <div className="mt-1">
              <span className="text-2xl font-black text-white">
                {prescription.infusionRateMlPerHour}
              </span>
              <span className="text-xs font-normal text-teal-300 ml-1">ml/hora</span>
            </div>
            <span className="text-[10px] text-slate-300 font-semibold mt-1">
              Volumen Total: {prescription.totalVolumeMl} ml en {infusionHours}h
            </span>
          </div>
        </div>
      </div>

      {/* Main Form & Calculation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clinical Parameters Input */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: General Parenteral Settings */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>1. Parámetros Basales & Vía Vascular</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Peso del Paciente (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value) || 1)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Volumen Total Objetivo (ml)
                </label>
                <input
                  type="number"
                  step="50"
                  value={totalVolumeTargetMl}
                  onChange={(e) => setTotalVolumeTargetMl(Number(e.target.value) || 500)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Horas de Infusión
                </label>
                <select
                  value={infusionHours}
                  onChange={(e) => setInfusionHours(Number(e.target.value))}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value={24}>24 Horas (Continuo)</option>
                  <option value={18}>18 Horas (Cíclico)</option>
                  <option value={16}>16 Horas (Cíclico)</option>
                  <option value={12}>12 Horas (Cíclico)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Vía Vascular Programada
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccessRouteChoice('central')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                    accessRouteChoice === 'central'
                      ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-extrabold">Catéter Venoso Central (CVC)</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    Subclavia, Yugular, PICC. Tolera osmolaridad &gt; 900 mOsm/L.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessRouteChoice('peripheral')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-left ${
                    accessRouteChoice === 'peripheral'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-extrabold">Vía Periférica</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    Vena antebrazo. Límite osmolar estricto &lt; 850-900 mOsm/L.
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Macronutrients (AA, Dextrose, Lipids) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>2. Prescripción de Macronutrientes Parenterales</span>
            </h3>

            {/* Amino Acids */}
            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase">
                  Aminoácidos (Proteína)
                </span>
                <span className="text-xs font-extrabold text-blue-800">
                  {prescription.aminoAcidTotalGrams}g AA ({prescription.aminoAcidCalories} kcal) · {prescription.nitrogenGrams}g Nitrógeno
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-blue-800 uppercase block mb-1">
                    Concentración Solución AA
                  </label>
                  <select
                    value={aminoAcidConcentration}
                    onChange={(e) => setAminoAcidConcentration(Number(e.target.value))}
                    className="w-full text-xs font-bold border border-blue-200 rounded-lg p-2 bg-white"
                  >
                    <option value={10}>Aminoácidos al 10% (100 g/L)</option>
                    <option value={8.5}>Aminoácidos al 8.5% (85 g/L)</option>
                    <option value={15}>Aminoácidos al 15% (150 g/L)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-blue-800 uppercase block mb-1">
                    Aporte Proteico: {aminoAcidGramsPerKg} g/kg/día
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    value={aminoAcidGramsPerKg}
                    onChange={(e) => setAminoAcidGramsPerKg(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Dextrose */}
            <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase">
                  Dextrosa (Carbohidratos)
                </span>
                <span className="text-xs font-extrabold text-amber-800">
                  {dextroseTotalGrams}g Dextrosa ({prescription.dextroseCalories} kcal) · TIG: {prescription.glucoseInfusionRateMgKgMin} mg/kg/min
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                    Concentración Dextrosa
                  </label>
                  <select
                    value={dextroseConcentration}
                    onChange={(e) => setDextroseConcentration(Number(e.target.value))}
                    className="w-full text-xs font-bold border border-amber-200 rounded-lg p-2 bg-white"
                  >
                    <option value={50}>Dextrosa al 50% (500 g/L - 0.5g/ml)</option>
                    <option value={10}>Dextrosa al 10% (100 g/L - 0.1g/ml)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                    Gramos Totales de Dextrosa
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="50"
                    max="500"
                    value={dextroseTotalGrams}
                    onChange={(e) => setDextroseTotalGrams(Number(e.target.value) || 50)}
                    className="w-full text-xs font-bold border border-amber-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Lipids */}
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase">
                  Lípidos Parenterales (Emulsión 20%)
                </span>
                <span className="text-xs font-extrabold text-emerald-800">
                  {prescription.lipidTotalGrams}g Lípidos ({prescription.lipidCalories} kcal) · {lipVolumeMl} ml
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                    Emulsión Lipídica
                  </label>
                  <select
                    value={lipidConcentration}
                    onChange={(e) => setLipidConcentration(Number(e.target.value))}
                    className="w-full text-xs font-bold border border-emerald-200 rounded-lg p-2 bg-white"
                  >
                    <option value={20}>Lípidos al 20% (SMOFlipid / Lipofundin - 2 kcal/ml)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                    Aporte Lipídico: {lipidGramsPerKg} g/kg/día
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={lipidGramsPerKg}
                    onChange={(e) => setLipidGramsPerKg(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Electrolytes & Additives */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-purple-600" />
              <span>3. Electrolitos & Micronutrientes Parenterales</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Sodio (mEq)
                </label>
                <input
                  type="number"
                  value={sodiumMeq}
                  onChange={(e) => setSodiumMeq(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-center"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Potasio (mEq)
                </label>
                <input
                  type="number"
                  value={potassiumMeq}
                  onChange={(e) => setPotassiumMeq(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-center"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Calcio (mEq)
                </label>
                <input
                  type="number"
                  value={calciumMeq}
                  onChange={(e) => setCalciumMeq(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-center"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Magnesio (mEq)
                </label>
                <input
                  type="number"
                  value={magnesiumMeq}
                  onChange={(e) => setMagnesiumMeq(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-center"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Fósforo (mmol)
                </label>
                <input
                  type="number"
                  value={phosphorusMmol}
                  onChange={(e) => setPhosphorusMmol(Number(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  MVI Adulto (ml)
                </label>
                <input
                  type="number"
                  value={mviMl}
                  onChange={(e) => setMviMl(Number(e.target.value) || 0)}
                  className="w-full p-1.5 border border-slate-300 rounded-lg font-bold text-center"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Oligoelementos (ml)
                </label>
                <input
                  type="number"
                  value={traceElementsMl}
                  onChange={(e) => setTraceElementsMl(Number(e.target.value) || 0)}
                  className="w-full p-1.5 border border-slate-300 rounded-lg font-bold text-center"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Heparina (UI)
                </label>
                <input
                  type="number"
                  step="500"
                  value={heparinUnits}
                  onChange={(e) => setHeparinUnits(Number(e.target.value) || 0)}
                  className="w-full p-1.5 border border-slate-300 rounded-lg font-bold text-center"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Vitamina C (mg)
                </label>
                <input
                  type="number"
                  step="100"
                  value={vitaminCMg}
                  onChange={(e) => setVitaminCMg(Number(e.target.value) || 0)}
                  className="w-full p-1.5 border border-slate-300 rounded-lg font-bold text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prescription Summary & Compounding Sheet */}
        <div className="lg:col-span-5 space-y-5">
          {/* Energy and Macros Summary Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Resumen Calórico Total
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                {(prescription.totalCalories / weightKg).toFixed(1)} kcal/kg/día
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Calorías Totales NPT
                </span>
                <div className="text-2xl font-black mt-0.5 text-white">
                  {prescription.totalCalories}{' '}
                  <span className="text-xs font-normal text-purple-300">kcal/d</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 text-purple-950 rounded-xl">
                <span className="text-[10px] text-purple-700 font-bold uppercase block">
                  Kcal No Proteicas
                </span>
                <div className="text-2xl font-black mt-0.5 text-purple-900">
                  {prescription.nonProteinCalories}{' '}
                  <span className="text-xs font-normal text-purple-700">kcal</span>
                </div>
              </div>
            </div>

            {/* Distribution Percentages */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-blue-700">Proteínas (AA): {prescription.proteinCaloriePercent}%</span>
                <span className="text-amber-700">Dextrosa: {prescription.dextroseCaloriePercent}%</span>
                <span className="text-emerald-700">Lípidos: {prescription.lipidCaloriePercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${prescription.proteinCaloriePercent}%` }}
                  className="bg-blue-500 h-full"
                />
                <div
                  style={{ width: `${prescription.dextroseCaloriePercent}%` }}
                  className="bg-amber-400 h-full"
                />
                <div
                  style={{ width: `${prescription.lipidCaloriePercent}%` }}
                  className="bg-emerald-500 h-full"
                />
              </div>
            </div>
          </div>

          {/* Pharmaceutical Compounding Mixing Sheet */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Hoja de Mezclado Farmacéutico (Bolsa NPT)</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-700">
                  Aminoácidos al {aminoAcidConcentration}%:
                </span>
                <span className="font-extrabold text-blue-900">{aaVolumeMl} ml</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-700">
                  Dextrosa al {dextroseConcentration}%:
                </span>
                <span className="font-extrabold text-amber-900">{dexVolumeMl} ml</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-700">
                  Emulsión Lipídica al {lipidConcentration}%:
                </span>
                <span className="font-extrabold text-emerald-900">{lipVolumeMl} ml</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-700">
                  Aditivos (MVI + Oligoelementos):
                </span>
                <span className="font-extrabold text-purple-900">{additivesVolumeMl} ml</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="font-semibold text-slate-700">
                  Agua Inyectable para Aforo:
                </span>
                <span className="font-extrabold text-slate-900">{sterileWaterForInjectionMl} ml</span>
              </div>

              <div className="p-3 bg-purple-900 text-white rounded-xl flex items-center justify-between font-bold">
                <span>VOLUMEN TOTAL FINAL BOLSA NPT:</span>
                <span className="text-base text-teal-300">{prescription.totalVolumeMl} ml</span>
              </div>
            </div>
          </div>

          {/* Clinical Warnings */}
          {prescription.clinicalWarnings.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-950">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Alertas Clínicas y de Estabilidad:
              </span>
              <ul className="space-y-1 text-[11px] leading-relaxed text-amber-900">
                {prescription.clinicalWarnings.map((warn, wIdx) => (
                  <li key={wIdx} className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-600">•</span>
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
