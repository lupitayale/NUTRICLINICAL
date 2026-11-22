import React, { useState } from 'react';
import {
  Calculator,
  Scale,
  Droplets,
  Activity,
  Zap,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Patient } from '../types/nutrition';

interface AdvancedClinicalCalculatorsProps {
  patient: Patient;
  onNavigateToTab: (tab: string) => void;
}

export const AdvancedClinicalCalculators: React.FC<AdvancedClinicalCalculatorsProps> = ({
  patient,
}) => {
  const latestConsult = patient.consultations[patient.consultations.length - 1];
  const defaultWeight = latestConsult?.weightKg || 70;
  const defaultHeight = latestConsult?.heightCm || 170;
  const defaultAge = patient.age || 40;

  // 1. BSA (Body Surface Area) State
  const [bsaWeight, setBsaWeight] = useState(defaultWeight);
  const [bsaHeight, setBsaHeight] = useState(defaultHeight);
  const [bsaFormula, setBsaFormula] = useState<'mosteller' | 'dubois'>('mosteller');

  const bsaResult =
    bsaFormula === 'mosteller'
      ? Math.sqrt((bsaWeight * bsaHeight) / 3600).toFixed(2)
      : (0.007184 * Math.pow(bsaWeight, 0.425) * Math.pow(bsaHeight, 0.725)).toFixed(2);

  // 2. Amputated Weight Adjustment State
  const [ampWeight, setAmpWeight] = useState(defaultWeight);
  const [amputationType, setAmputationType] = useState<'mano' | 'antebrazo' | 'brazo_completo' | 'pie' | 'pierna_abajo' | 'pierna_arriba'>('pierna_abajo');

  const amputationPercentages: Record<string, number> = {
    mano: 0.7,
    antebrazo: 2.3,
    brazo_completo: 5.0,
    pie: 1.5,
    pierna_abajo: 5.9,
    pierna_arriba: 16.0,
  };
  const ampPct = amputationPercentages[amputationType] || 5.9;
  const adjustedWeightForAmputation = (ampWeight / (1 - ampPct / 100)).toFixed(1);

  // 3. Holliday-Segar Fluid Maintenance State
  const [fluidWeight, setFluidWeight] = useState(defaultWeight);
  const fluidResultMl =
    fluidWeight <= 10
      ? fluidWeight * 100
      : fluidWeight <= 20
      ? 1000 + (fluidWeight - 10) * 50
      : 1500 + (fluidWeight - 20) * 20;

  // 4. eGFR (CKD-EPI) State
  const [creatinine, setCreatinine] = useState(1.0);
  const [isFemale, setIsFemale] = useState(patient.gender === 'female');
  const k = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.329 : -0.411;
  const sexFactor = isFemale ? 1.018 : 1.0;
  const crRatio = creatinine / k;
  const egfrResult = (
    141 *
    Math.min(Math.max(crRatio, 0.0), 1.0) ** alpha *
    Math.max(crRatio, 1.0) ** -1.209 *
    0.993 ** defaultAge *
    sexFactor
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Calculadoras Clínicas Avanzadas
            </h2>
            <p className="text-xs text-slate-500">
              Herramientas de precisión para Superficie Corporal, Ajuste por Amputaciones, Hidratación Holliday-Segar y Tasa de Filtración Glomerular.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculator 1: BSA */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-600" />
              <span>Superficie Corporal (BSA)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800">
              {bsaFormula === 'mosteller' ? 'Mosteller' : 'Du Bois'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Peso (kg)</label>
                <input
                  type="number"
                  value={bsaWeight}
                  onChange={(e) => setBsaWeight(parseFloat(e.target.value) || 0)}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Talla (cm)</label>
                <input
                  type="number"
                  value={bsaHeight}
                  onChange={(e) => setBsaHeight(parseFloat(e.target.value) || 0)}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">Fórmula de Cálculo</label>
              <select
                value={bsaFormula}
                onChange={(e) => setBsaFormula(e.target.value as any)}
                className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
              >
                <option value="mosteller">Fórmula de Mosteller (Raíz cuadrada de [Peso x Talla / 3600])</option>
                <option value="dubois">Fórmula de Du Bois & Du Bois (0.007184 x P^0.425 x T^0.725)</option>
              </select>
            </div>

            <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-800 block">Superficie Corporal Estimada</span>
                <span className="text-2xl font-black text-teal-900">{bsaResult} <span className="text-sm font-semibold">m²</span></span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Calculator 2: Amputated Weight Adjustment */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Ajuste de Peso por Amputaciones</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800">
              Corrección Anatómica
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Peso Medido (kg)</label>
                <input
                  type="number"
                  value={ampWeight}
                  onChange={(e) => setAmpWeight(parseFloat(e.target.value) || 0)}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Segmento Amputado</label>
                <select
                  value={amputationType}
                  onChange={(e) => setAmputationType(e.target.value as any)}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                >
                  <option value="mano">Mano (0.7%)</option>
                  <option value="antebrazo">Antebrazo con mano (2.3%)</option>
                  <option value="brazo_completo">Brazo completo (5.0%)</option>
                  <option value="pie">Pie (1.5%)</option>
                  <option value="pierna_abajo">Pierna bajo rodilla / con pie (5.9%)</option>
                  <option value="pierna_arriba">Pierna sobre rodilla / completa (16.0%)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-800 block">Peso Corporal Estimado Íntegro</span>
                <span className="text-2xl font-black text-indigo-900">{adjustedWeightForAmputation} <span className="text-sm font-semibold">kg</span></span>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-lg">-{ampPct}% corresp.</span>
            </div>
          </div>
        </div>

        {/* Calculator 3: Holliday-Segar Hydration */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600" />
              <span>Hidratación (Holliday-Segar)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800">
              Requerimiento Basal
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">Peso del Paciente (kg)</label>
              <input
                type="number"
                value={fluidWeight}
                onChange={(e) => setFluidWeight(parseFloat(e.target.value) || 0)}
                className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                0-10kg: 100ml/kg · 10-20kg: 1000ml + 50ml/kg por cada kg &gt;10 · &gt;20kg: 1500ml + 20ml/kg por cada kg &gt;20
              </span>
            </div>

            <div className="p-4 bg-cyan-50/70 border border-cyan-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-cyan-900 block">Volumen Hídrico Diario Basal</span>
                <span className="text-2xl font-black text-cyan-950">{fluidResultMl} <span className="text-sm font-semibold">ml / día</span></span>
              </div>
              <span className="text-xs font-bold text-cyan-800 bg-cyan-100 px-2 py-1 rounded-lg">{(fluidResultMl / 1000).toFixed(2)} Litros</span>
            </div>
          </div>
        </div>

        {/* Calculator 4: eGFR CKD-EPI */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>TFG Estimada (CKD-EPI 2021)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800">
              Función Renal
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Creatinina Sérica (mg/dl)</label>
                <input
                  type="number"
                  step="0.1"
                  value={creatinine}
                  onChange={(e) => setCreatinine(parseFloat(e.target.value) || 1)}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Sexo Biológico</label>
                <select
                  value={isFemale ? 'female' : 'male'}
                  onChange={(e) => setIsFemale(e.target.value === 'female')}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-900 block">Tasa de Filtración Glomerular (eGFR)</span>
                <span className="text-2xl font-black text-purple-950">{egfrResult} <span className="text-sm font-semibold">ml/min/1.73m²</span></span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${Number(egfrResult) >= 90 ? 'bg-emerald-100 text-emerald-800' : Number(egfrResult) >= 60 ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'}`}>
                {Number(egfrResult) >= 90 ? 'Estadio 1' : Number(egfrResult) >= 60 ? 'Estadio 2' : 'Estadio 3+'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
