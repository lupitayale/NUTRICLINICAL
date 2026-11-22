import React, { useState } from 'react';
import {
  Calculator,
  Zap,
  Activity,
  Flame,
  UserPlus,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Gender, NutritionGoal, PathologyType } from '../types/nutrition';
import {
  calculateBMI,
  calculateIdealWeights,
  buildClinicalMacroPrescription,
  PATHOLOGY_INFO,
} from '../utils/nutritionCalculations';

interface QuickExpressCalculatorProps {
  onTransferToNewPatient: (data: {
    weight: number;
    height: number;
    age: number;
    gender: Gender;
    pathologies: PathologyType[];
    goal: NutritionGoal;
  }) => void;
}

export const QuickExpressCalculator: React.FC<QuickExpressCalculatorProps> = ({
  onTransferToNewPatient,
}) => {
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(172);
  const [age, setAge] = useState<number>(38);
  const [gender, setGender] = useState<Gender>('male');
  const [activityFactor, setActivityFactor] = useState<number>(1.375);
  const [goal, setGoal] = useState<NutritionGoal>('fat_loss');
  const [selectedPathologies, setSelectedPathologies] = useState<PathologyType[]>([]);

  const bmiData = calculateBMI(weight, height);
  const idealData = calculateIdealWeights(height, weight, gender);
  const prescription = buildClinicalMacroPrescription(
    weight,
    height,
    age,
    gender,
    selectedPathologies,
    goal,
    'mifflin',
    activityFactor as any
  );

  const togglePathology = (p: PathologyType) => {
    setSelectedPathologies((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Calculator className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Calculadora Nutricional Express</h2>
              <p className="text-xs text-slate-500">
                Valoración antropométrica y cálculo de macronutrientes instantáneo sin registrar paciente
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              onTransferToNewPatient({
                weight,
                height,
                age,
                gender,
                pathologies: selectedPathologies,
                goal,
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Paciente con estos Datos</span>
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Talla (cm)</label>
            <input
              type="number"
              step="1"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Edad (años)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo</label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                  gender === 'male' ? 'bg-teal-50 border-teal-600 text-teal-900' : 'border-slate-200'
                }`}
              >
                Hombre
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                  gender === 'female' ? 'bg-teal-50 border-teal-600 text-teal-900' : 'border-slate-200'
                }`}
              >
                Mujer
              </button>
            </div>
          </div>
        </div>

        {/* Pathologies Fast Switch */}
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-teal-800 mb-2">
            Patologías diagnosticadas (Ajuste automático de macronutrientes)
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PATHOLOGY_INFO) as PathologyType[]).map((key) => {
              const info = PATHOLOGY_INFO[key];
              const isSelected = selectedPathologies.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePathology(key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-600 border-teal-600 text-white shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{info.name.split(' (')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Calculated Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Antropometría */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold uppercase text-slate-400">Diagnóstico Antropométrico</div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{bmiData.bmi}</div>
            <div className="text-xs font-bold text-teal-700 mt-0.5">{bmiData.classification}</div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div>
              Peso Hamwi Ideal: <b>{idealData.idealWeightHamwi} kg</b>
            </div>
            <div>
              Peso Metropolitan: <b>{idealData.idealWeightMetropolitan} kg</b>
            </div>
            {bmiData.bmi >= 30 && (
              <div className="text-amber-800 font-semibold">
                Peso Ajustado Obesidad: <b>{idealData.adjustedWeightKg} kg</b>
              </div>
            )}
          </div>
        </div>

        {/* Calorías */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold uppercase text-slate-400">Gasto Energético & Meta</div>
          <div>
            <div className="text-3xl font-black text-teal-800">{prescription.targetCalories}</div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">kcal / día objetivo</div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div>
              GEB (Mifflin): <b>{prescription.bmr} kcal</b>
            </div>
            <div>
              ETA (10%): <b>{prescription.tef} kcal</b>
            </div>
            <div>
              GET (Mantenimiento): <b>{prescription.tee} kcal</b>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold uppercase text-slate-400">Distribución de Macros</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-blue-50/70 p-2 rounded-lg">
              <span className="font-bold text-blue-900">Proteínas:</span>
              <span className="font-extrabold text-blue-950">
                {prescription.proteinGrams}g ({prescription.proteinPercent}%) · {prescription.proteinGramsPerKg} g/kg
              </span>
            </div>
            <div className="flex justify-between items-center bg-amber-50/70 p-2 rounded-lg">
              <span className="font-bold text-amber-900">Carbohidratos:</span>
              <span className="font-extrabold text-amber-950">
                {prescription.carbGrams}g ({prescription.carbPercent}%)
              </span>
            </div>
            <div className="flex justify-between items-center bg-emerald-50/70 p-2 rounded-lg">
              <span className="font-bold text-emerald-900">Grasas:</span>
              <span className="font-extrabold text-emerald-950">
                {prescription.fatGrams}g ({prescription.fatPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
