import React, { useState } from 'react';
import {
  Users,
  Baby,
  Heart,
  Activity,
  ShieldCheck,
  AlertCircle,
  Save,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  Scale,
  Brain,
  FileText,
} from 'lucide-react';
import { Patient, ClinicalLifecycleAssessment } from '../types/nutrition';

interface ClinicalLifecycleAssessmentViewProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigateToTab: (tab: string, docType?: string) => void;
}

export const ClinicalLifecycleAssessmentView: React.FC<ClinicalLifecycleAssessmentViewProps> = ({
  patient,
  onUpdatePatient,
  onNavigateToTab,
}) => {
  const existing = patient.clinicalLifecycleAssessment;

  const [category, setCategory] = useState<'pediatric' | 'pregnancy_lactation' | 'geriatric' | 'adult_general'>(
    existing?.category || (patient.age < 18 ? 'pediatric' : patient.age >= 65 ? 'geriatric' : 'adult_general')
  );

  // Pediatric state
  const [weightZ, setWeightZ] = useState<number>(existing?.pediatricZScores?.weightForAge ?? 0.0);
  const [heightZ, setHeightZ] = useState<number>(existing?.pediatricZScores?.heightForAge ?? 0.0);
  const [bmiZ, setBmiZ] = useState<number>(existing?.pediatricZScores?.bmiForAge ?? 0.0);
  const [pediatricDiagnosis, setPediatricDiagnosis] = useState<string>(
    existing?.pediatricZScores?.nutritionalDiagnosis || 'Eutrófico / Normopeso'
  );

  // Pregnancy state
  const [gestWeeks, setGestWeeks] = useState<number>(existing?.pregnancyLactationData?.gestationalWeeks ?? 20);
  const [preBmi, setPreBmi] = useState<number>(existing?.pregnancyLactationData?.prePregnancyBmi ?? 22.5);
  const [weightGain, setWeightGain] = useState<number>(existing?.pregnancyLactationData?.weightGainKg ?? 5.5);
  const [trimester, setTrimester] = useState<1 | 2 | 3 | 4>(existing?.pregnancyLactationData?.trimester ?? 2);
  const [obsRisk, setObsRisk] = useState<'bajo' | 'moderado' | 'alto'>(
    existing?.pregnancyLactationData?.obstetricRisk || 'bajo'
  );

  // Geriatric state
  const [mnaScore, setMnaScore] = useState<number>(existing?.geriatricData?.mnaScore ?? 24);
  const [frailty, setFrailty] = useState<'robusto' | 'pre_fragil' | 'fragil'>(
    existing?.geriatricData?.frailtyStatus || 'pre_fragil'
  );
  const [adlScore, setAdlScore] = useState<number>(existing?.geriatricData?.adlScore ?? 90);
  const [cognitive, setCognitive] = useState<'normal' | 'deterioro_leve' | 'deterioro_moderado_severo'>(
    existing?.geriatricData?.cognitiveStatus || 'normal'
  );

  // Global Assessment
  const [globalSummary, setGlobalSummary] = useState<string>(
    existing?.globalPathologySummary ||
      `Evaluación clínica global para ${patient.fullName} considerando antecedentes patológicos (${patient.pathologies.join(', ') || 'Ninguna grave'}) y estado metabólico actual.`
  );
  const [riskLevel, setRiskLevel] = useState<'bajo' | 'moderado' | 'alto' | 'critico'>(
    existing?.metabolicRiskLevel || 'moderado'
  );
  const [intervention, setIntervention] = useState<string>(
    existing?.recommendedIntervention ||
      'Monitoreo clínico continuo, ajuste de densidad calórico-proteica y revisión bioquímica trimestral.'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    const assessment: ClinicalLifecycleAssessment = {
      id: existing?.id || `eval-${Date.now()}`,
      patientId: patient.id,
      category,
      pediatricZScores:
        category === 'pediatric'
          ? {
              weightForAge: weightZ,
              heightForAge: heightZ,
              bmiForAge: bmiZ,
              nutritionalDiagnosis: pediatricDiagnosis,
            }
          : undefined,
      pregnancyLactationData:
        category === 'pregnancy_lactation'
          ? {
              gestationalWeeks: gestWeeks,
              prePregnancyBmi: preBmi,
              weightGainKg: weightGain,
              recommendedGainRange: preBmi < 18.5 ? '12.5 - 18 kg' : preBmi < 25 ? '11.5 - 16 kg' : preBmi < 30 ? '7 - 11.5 kg' : '5 - 9 kg',
              trimester,
              obstetricRisk: obsRisk,
            }
          : undefined,
      geriatricData:
        category === 'geriatric'
          ? {
              mnaScore,
              mnaCategory: mnaScore >= 24 ? 'normal' : mnaScore >= 17 ? 'riesgo_desnutricion' : 'desnutricion',
              frailtyStatus: frailty,
              adlScore,
              cognitiveStatus: cognitive,
            }
          : undefined,
      globalPathologySummary: globalSummary,
      metabolicRiskLevel: riskLevel,
      recommendedIntervention: intervention,
      evaluatorName: 'Nutriólogo Clínico Certificado',
      date: new Date().toISOString().split('T')[0],
    };

    onUpdatePatient({
      ...patient,
      clinicalLifecycleAssessment: assessment,
      updatedAt: new Date().toISOString(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Evaluación Clínica Integral & Ciclo de Vida
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
                Pediátrico · Embarazo · Geriátrico · Global
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Paciente: <span className="font-bold text-slate-800">{patient.fullName}</span> · Edad:{' '}
              <span className="font-bold text-teal-800">{patient.age} años</span> · Patologías Activas:{' '}
              <span className="font-bold text-slate-900">{patient.pathologies.length} registradas</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savedSuccess ? '¡Evaluación Guardada!' : 'Guardar Evaluación Clínica'}</span>
            </button>

            <button
              onClick={() => onNavigateToTab('print', 'plan')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setCategory('pediatric')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            category === 'pediatric'
              ? 'bg-teal-600 border-teal-600 text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Baby className={`w-5 h-5 ${category === 'pediatric' ? 'text-white' : 'text-teal-600'}`} />
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${category === 'pediatric' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
              0 - 17 Años
            </span>
          </div>
          <div>
            <div className="font-extrabold text-sm">Pediátrico & Adolescente</div>
            <div className={`text-[11px] mt-0.5 ${category === 'pediatric' ? 'text-teal-100' : 'text-slate-500'}`}>
              Percentilas OMS, Z-scores & Velocidad de Crecimiento
            </div>
          </div>
        </button>

        <button
          onClick={() => setCategory('pregnancy_lactation')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            category === 'pregnancy_lactation'
              ? 'bg-teal-600 border-teal-600 text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Heart className={`w-5 h-5 ${category === 'pregnancy_lactation' ? 'text-white' : 'text-rose-600'}`} />
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${category === 'pregnancy_lactation' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
              Materno
            </span>
          </div>
          <div>
            <div className="font-extrabold text-sm">Embarazo & Lactancia</div>
            <div className={`text-[11px] mt-0.5 ${category === 'pregnancy_lactation' ? 'text-teal-100' : 'text-slate-500'}`}>
              Ganancia ponderal gestacional, trimestre & lactancia
            </div>
          </div>
        </button>

        <button
          onClick={() => setCategory('geriatric')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            category === 'geriatric'
              ? 'bg-teal-600 border-teal-600 text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Users className={`w-5 h-5 ${category === 'geriatric' ? 'text-white' : 'text-purple-600'}`} />
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${category === 'geriatric' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
              65+ Años
            </span>
          </div>
          <div>
            <div className="font-extrabold text-sm">Geriátrico & Fragilidad</div>
            <div className={`text-[11px] mt-0.5 ${category === 'geriatric' ? 'text-teal-100' : 'text-slate-500'}`}>
              MNA Tamizaje, sarcopenia, autonomía & funcionalidad
            </div>
          </div>
        </button>

        <button
          onClick={() => setCategory('adult_general')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            category === 'adult_general'
              ? 'bg-teal-600 border-teal-600 text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className={`w-5 h-5 ${category === 'adult_general' ? 'text-white' : 'text-blue-600'}`} />
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${category === 'adult_general' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
              Universal
            </span>
          </div>
          <div>
            <div className="font-extrabold text-sm">Evaluación Global Multipatología</div>
            <div className={`text-[11px] mt-0.5 ${category === 'adult_general' ? 'text-teal-100' : 'text-slate-500'}`}>
              Seguimiento integral para cualquier enfermedad y adulto
            </div>
          </div>
        </button>
      </div>

      {/* Conditional Forms based on Category */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        {category === 'pediatric' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Baby className="w-5 h-5 text-teal-600" />
                <span>Evaluación Pediátrica & Crecimiento (OMS / Z-Scores)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cálculo de desviaciones estándar (Z-scores) para peso, talla e índice de masa corporal según edad y sexo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Z-Score Peso / Edad</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightZ}
                  onChange={(e) => setWeightZ(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Normal: -2.0 a +2.0 Z</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Z-Score Talla / Edad</label>
                <input
                  type="number"
                  step="0.1"
                  value={heightZ}
                  onChange={(e) => setHeightZ(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Talla baja si &lt; -2.0 Z</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Z-Score IMC / Edad</label>
                <input
                  type="number"
                  step="0.1"
                  value={bmiZ}
                  onChange={(e) => setBmiZ(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Sobrepeso si &gt; +1.0 Z</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Diagnóstico Nutricional Pediátrico</label>
              <select
                value={pediatricDiagnosis}
                onChange={(e) => setPediatricDiagnosis(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800"
              >
                <option value="Eutrófico / Normopeso">Eutrófico / Normopeso (Adecuado para la edad)</option>
                <option value="Desnutrición leve (Z -1 a -2)">Desnutrición leve (Z -1 a -2)</option>
                <option value="Desnutrición moderada / severa">Desnutrición moderada / severa (&lt; -2 Z)</option>
                <option value="Sobrepeso (+1 a +2 Z)">Sobrepeso (+1 a +2 Z)</option>
                <option value="Obesidad (> +2 Z)">Obesidad (&gt; +2 Z)</option>
                <option value="Talla baja armónica">Talla baja armónica / Desmedro</option>
              </select>
            </div>
          </div>
        )}

        {category === 'pregnancy_lactation' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <span>Evaluación Materna: Embarazo & Lactancia</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Seguimiento de ganancia ponderal gestacional recomendada por Institute of Medicine (IOM) y soporte nutricional en lactancia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Semanas de Gestación</label>
                <input
                  type="number"
                  value={gestWeeks}
                  onChange={(e) => setGestWeeks(parseInt(e.target.value) || 1)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">IMC Pregestacional</label>
                <input
                  type="number"
                  step="0.1"
                  value={preBmi}
                  onChange={(e) => setPreBmi(parseFloat(e.target.value) || 22)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Ganancia Ponderal Actual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightGain}
                  onChange={(e) => setWeightGain(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Trimestre Actual / Lactancia</label>
                <select
                  value={trimester}
                  onChange={(e) => setTrimester(parseInt(e.target.value) as any)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800"
                >
                  <option value={1}>Primer Trimestre (Semanas 1-13)</option>
                  <option value={2}>Segundo Trimestre (Semanas 14-27)</option>
                  <option value={3}>Tercer Trimestre (Semanas 28-40+)</option>
                  <option value={4}>Lactancia Materna Exclusiva / Mixta</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Riesgo Obstétrico</label>
                <select
                  value={obsRisk}
                  onChange={(e) => setObsRisk(e.target.value as any)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800"
                >
                  <option value="bajo">Bajo Riesgo Obstétrico</option>
                  <option value="moderado">Moderado Riesgo (Diabetes gestacional / Preeclampsia leve)</option>
                  <option value="alto">Alto Riesgo (Embarazo múltiple / Patología grave)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {category === 'geriatric' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Evaluación Geriátrica Integral (MNA & Fragilidad)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tamizaje Mini Nutritional Assessment (MNA), fragilidad de Fried, actividades de la vida diaria y estado cognitivo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Puntuación MNA (Mini Nutritional Assessment)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={mnaScore}
                  onChange={(e) => setMnaScore(parseInt(e.target.value) || 24)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  24-30: Estado nutricional normal · 17-23.5: Riesgo de desnutrición · &lt; 17: Desnutrición
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Estatus de Fragilidad (Fried)</label>
                <select
                  value={frailty}
                  onChange={(e) => setFrailty(e.target.value as any)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800"
                >
                  <option value="robusto">Anciano Robusto (Sin criterios de fragilidad)</option>
                  <option value="pre_fragil">Pre-frágil (1-2 criterios positivos)</option>
                  <option value="fragil">Frágil (&ge; 3 criterios: debilidad, fatiga, marcha lenta, bajo peso)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Índice de Autonomía / ADL (Barthel)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={adlScore}
                  onChange={(e) => setAdlScore(parseInt(e.target.value) || 90)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">100: Independiente · 0-20: Dependencia total</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Estatus Cognitivo</label>
                <select
                  value={cognitive}
                  onChange={(e) => setCognitive(e.target.value as any)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800"
                >
                  <option value="normal">Cognición Normal</option>
                  <option value="deterioro_leve">Deterioro Cognitivo Leve</option>
                  <option value="deterioro_moderado_severo">Deterioro Moderado a Severo / Demencia</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {category === 'adult_general' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Evaluación Multipatología & Riesgo Metabólico Global</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Seguimiento transversal para pacientes adultos con múltiples patologías activas, comorbilidades y riesgo cardiovascular/renal.
              </p>
            </div>
          </div>
        )}

        {/* Global Summary & Recommendations for all categories */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
              Resumen Clínico Multipatología & Ciclo de Vida
            </label>
            <textarea
              rows={3}
              value={globalSummary}
              onChange={(e) => setGlobalSummary(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-xl p-3 bg-white text-slate-900"
              placeholder="Describa el diagnóstico clínico integral, requerimientos específicos y observaciones..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Nivel de Riesgo Metabólico Clínico</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800"
              >
                <option value="bajo">Bajo Riesgo (Estable)</option>
                <option value="moderado">Moderado Riesgo (Control farmacológico-nutricional)</option>
                <option value="alto">Alto Riesgo (Comorbilidades múltiples / Alteraciones bioquímicas)</option>
                <option value="critico">Crítico / Soporte Nutricional Especializado Requerido</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Intervención Nutricional Recomendada</label>
              <input
                type="text"
                value={intervention}
                onChange={(e) => setIntervention(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
