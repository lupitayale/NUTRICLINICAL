import React, { useState } from 'react';
import {
  Scale,
  Plus,
  TrendingDown,
  TrendingUp,
  Activity,
  Heart,
  Droplets,
  Calendar,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Patient, AnthropometricRecord } from '../types/nutrition';
import {
  calculateBMI,
  calculateWaistHipRatio,
  calculateIdealWeights,
  buildClinicalMacroPrescription,
} from '../utils/nutritionCalculations';
import { PatientWeightHistoryChart } from './PatientWeightHistoryChart';

interface AnthropometryViewProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigateToTab: (tab: string) => void;
}

export const AnthropometryView: React.FC<AnthropometryViewProps> = ({
  patient,
  onUpdatePatient,
  onNavigateToTab,
}) => {
  const [isNewConsultationModalOpen, setIsNewConsultationModalOpen] = useState(false);

  // New consultation state form
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState(patient.consultations[patient.consultations.length - 1]?.weightKg || 75);
  const [heightCm, setHeightCm] = useState(patient.consultations[patient.consultations.length - 1]?.heightCm || 170);
  const [waistCm, setWaistCm] = useState<number | ''>('');
  const [hipCm, setHipCm] = useState<number | ''>('');
  const [armCircumferenceCm, setArmCircumferenceCm] = useState<number | ''>('');
  const [bodyFatPercent, setBodyFatPercent] = useState<number | ''>('');
  const [muscleMassPercent, setMuscleMassPercent] = useState<number | ''>('');
  const [bloodPressureSys, setBloodPressureSys] = useState<number | ''>('');
  const [bloodPressureDia, setBloodPressureDia] = useState<number | ''>('');
  const [fastingGlucoseMgDl, setFastingGlucoseMgDl] = useState<number | ''>('');
  const [hba1cPercent, setHba1cPercent] = useState<number | ''>('');
  const [cholesterolMgDl, setCholesterolMgDl] = useState<number | ''>('');
  const [triglyceridesMgDl, setTriglyceridesMgDl] = useState<number | ''>('');
  const [creatinineMgDl, setCreatinineMgDl] = useState<number | ''>('');
  const [consultationNotes, setConsultationNotes] = useState('');


  // Sorted consultations by date
  const sortedConsultations = [...patient.consultations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const initialConsult = sortedConsultations[0];
  const latestConsult = sortedConsultations[sortedConsultations.length - 1] || initialConsult;

  const totalWeightDelta = initialConsult && latestConsult
    ? Number((latestConsult.weightKg - initialConsult.weightKg).toFixed(1))
    : 0;

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg || !heightCm) return;

    const bmiData = calculateBMI(Number(weightKg), Number(heightCm));
    const whrData = waistCm && hipCm ? calculateWaistHipRatio(Number(waistCm), Number(hipCm), patient.gender) : { ratio: undefined, cardioRisk: undefined };
    const idealData = calculateIdealWeights(Number(heightCm), Number(weightKg), patient.gender);

    const newRecord: AnthropometricRecord = {
      id: `c-${Date.now()}`,
      patientId: patient.id,
      date,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      waistCm: waistCm ? Number(waistCm) : undefined,
      hipCm: hipCm ? Number(hipCm) : undefined,
      armCircumferenceCm: armCircumferenceCm ? Number(armCircumferenceCm) : undefined,
      bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : undefined,
      muscleMassPercent: muscleMassPercent ? Number(muscleMassPercent) : undefined,
      bloodPressureSys: bloodPressureSys ? Number(bloodPressureSys) : undefined,
      bloodPressureDia: bloodPressureDia ? Number(bloodPressureDia) : undefined,
      fastingGlucoseMgDl: fastingGlucoseMgDl ? Number(fastingGlucoseMgDl) : undefined,
      hba1cPercent: hba1cPercent ? Number(hba1cPercent) : undefined,
      cholesterolMgDl: cholesterolMgDl ? Number(cholesterolMgDl) : undefined,
      triglyceridesMgDl: triglyceridesMgDl ? Number(triglyceridesMgDl) : undefined,
      creatinineMgDl: creatinineMgDl ? Number(creatinineMgDl) : undefined,
      bmi: bmiData.bmi,
      bmiClassification: bmiData.classification,
      bmiStatusClass: bmiData.statusClass,
      waistHipRatio: whrData.ratio,
      cardioRisk: whrData.cardioRisk,
      idealWeightHamwi: idealData.idealWeightHamwi,
      idealWeightMetropolitan: idealData.idealWeightMetropolitan,
      adjustedWeightKg: idealData.adjustedWeightKg,
      consultationNotes: consultationNotes.trim(),
    };

    const updatedConsultations = [...patient.consultations, newRecord];

    // Recompute prescription with new weight
    const updatedPrescription = buildClinicalMacroPrescription(
      Number(weightKg),
      Number(heightCm),
      patient.age,
      patient.gender,
      patient.pathologies,
      patient.targetGoal,
      patient.activePrescription.formula,
      patient.activePrescription.activityLevel,
      patient.activePrescription.calorieAdjustment,
      bodyFatPercent ? Number(bodyFatPercent) : undefined
    );

    const updatedPatient: Patient = {
      ...patient,
      consultations: updatedConsultations,
      activePrescription: updatedPrescription,
      updatedAt: new Date().toISOString(),
    };

    onUpdatePatient(updatedPatient);
    setIsNewConsultationModalOpen(false);
    setConsultationNotes('');
  };

  const handleDeleteConsultation = (recordId: string) => {
    if (patient.consultations.length <= 1) {
      alert('Debe mantenerse al menos una consulta inicial de referencia en el expediente.');
      return;
    }
    if (confirm('¿Eliminar esta consulta de seguimiento?')) {
      const filtered = patient.consultations.filter((c) => c.id !== recordId);
      const latest = filtered[filtered.length - 1];
      const updatedPrescription = buildClinicalMacroPrescription(
        latest.weightKg,
        latest.heightCm,
        patient.age,
        patient.gender,
        patient.pathologies,
        patient.targetGoal,
        patient.activePrescription.formula,
        patient.activePrescription.activityLevel,
        patient.activePrescription.calorieAdjustment
      );

      onUpdatePatient({
        ...patient,
        consultations: filtered,
        activePrescription: updatedPrescription,
        updatedAt: new Date().toISOString(),
      });
    }
  };


  return (
    <div className="space-y-6">
      {/* Patient Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{patient.fullName}</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-100">
              Expediente #{patient.id.slice(-6)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {patient.age} años · {patient.gender === 'male' ? 'Hombre' : 'Mujer'} · {patient.consultations.length} consultas registradas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('metabolic')}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
          >
            Ajustar Requerimientos & Macros
          </button>
          <button
            onClick={() => setIsNewConsultationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Consulta de Seguimiento</span>
          </button>
        </div>
      </div>

      {/* Primary Clinical Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Peso y Evolución */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>PESO ACTUAL</span>
            <Scale className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{latestConsult?.weightKg}</span>
            <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
            {totalWeightDelta !== 0 ? (
              <>
                {totalWeightDelta < 0 ? (
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                )}
                <span className={totalWeightDelta < 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                  {totalWeightDelta > 0 ? `+${totalWeightDelta}` : totalWeightDelta} kg
                </span>
                <span className="text-slate-400">vs consulta inicial</span>
              </>
            ) : (
              <span className="text-slate-400">Sin variación (1ra visita)</span>
            )}
          </div>
        </div>

        {/* Card 2: IMC OMS */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>IMC CLÍNICO (OMS)</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{latestConsult?.bmi}</span>
            <span className="text-sm font-semibold text-slate-500">kg/m²</span>
          </div>
          <div className="mt-2">
            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
              {latestConsult?.bmiClassification}
            </span>
          </div>
        </div>

        {/* Card 3: Riesgo Cardiovascular / Cintura-Cadera */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>ÍNDICE CINTURA / CADERA</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {latestConsult?.waistHipRatio ? latestConsult.waistHipRatio : (latestConsult?.waistCm ? `${latestConsult.waistCm} cm` : 'Pendiente')}
            </span>
            {latestConsult?.waistHipRatio && <span className="text-xs font-semibold text-slate-400">ratio</span>}
          </div>
          <div className="mt-2 text-xs">
            {latestConsult?.cardioRisk ? (
              <span className="font-semibold text-slate-700">
                Riesgo CV: <span className="text-rose-600 font-bold">{latestConsult.cardioRisk}</span>
              </span>
            ) : (
              <span className="text-slate-400">Cintura: {latestConsult?.waistCm ? `${latestConsult.waistCm} cm` : 'No medida'}</span>
            )}
          </div>
        </div>

        {/* Card 4: Peso Ideal Teórico & Ajustado */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>PESO IDEAL & AJUSTADO</span>
            <Info className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-800">{latestConsult?.idealWeightHamwi}</span>
            <span className="text-sm font-semibold text-slate-500">kg (Hamwi)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {latestConsult?.bmi >= 30 ? (
              <span className="font-semibold text-amber-700">
                Ajustado Obesidad: {latestConsult.adjustedWeightKg} kg
              </span>
            ) : (
              <span>Metropolitan: {latestConsult?.idealWeightMetropolitan} kg</span>
            )}
          </div>
        </div>
      </div>

      {/* Evolution Chart Section with Recharts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <PatientWeightHistoryChart
          consultations={patient.consultations}
          idealWeightKg={latestConsult?.idealWeightHamwi}
          gender={patient.gender}
        />
      </div>

      {/* Consultations History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Historial de Consultas Antropométricas</h3>
            <p className="text-xs text-slate-500">Registro cronológico completo de visitas médicas</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {sortedConsultations.length} Visitas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Peso</th>
                <th className="px-4 py-3">IMC (OMS)</th>
                <th className="px-4 py-3">Cintura / Cadera</th>
                <th className="px-4 py-3">P. Arterial</th>
                <th className="px-4 py-3">Glucosa / Labs</th>
                <th className="px-4 py-3">Notas de Evolución</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...sortedConsultations].reverse().map((record, index) => {
                return (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.date}</span>
                        {index === 0 && (
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">
                            Actual
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                      {record.weightKg} kg
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{record.bmi}</span>{' '}
                      <span className="text-[11px] text-slate-500">({record.bmiClassification.split(' ')[0]})</span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {record.waistCm ? `${record.waistCm} cm` : '-'}{' '}
                      {record.hipCm ? `/ ${record.hipCm} cm` : ''}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {record.bloodPressureSys && record.bloodPressureDia ? (
                        <span className="font-medium">
                          {record.bloodPressureSys}/{record.bloodPressureDia} mmHg
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {record.fastingGlucoseMgDl ? (
                        <span>Gluc: {record.fastingGlucoseMgDl} mg/dL</span>
                      ) : record.creatinineMgDl ? (
                        <span>Cr: {record.creatinineMgDl} mg/dL</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={record.consultationNotes}>
                      {record.consultationNotes || 'Sin observaciones registradas.'}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteConsultation(record.id)}
                        title="Eliminar registro de consulta"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Consultation Modal */}
      {isNewConsultationModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Consulta de Seguimiento
                </h3>
                <p className="text-xs text-slate-500">
                  Paciente: {patient.fullName}
                </p>
              </div>
              <button
                onClick={() => setIsNewConsultationModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConsultation} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Consulta *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Talla (cm) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Circunferencia Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 88"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Circunferencia Cadera (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 102"
                    value={hipCm}
                    onChange={(e) => setHipCm(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">% Grasa Corporal</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej. 24.5"
                    value={bodyFatPercent}
                    onChange={(e) => setBodyFatPercent(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">P.A. Sistólica (mmHg)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={bloodPressureSys}
                    onChange={(e) => setBloodPressureSys(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">P.A. Diastólica (mmHg)</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={bloodPressureDia}
                    onChange={(e) => setBloodPressureDia(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Glucemia Ayuno (mg/dL)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={fastingGlucoseMgDl}
                    onChange={(e) => setFastingGlucoseMgDl(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notas y Observaciones Clínicas de la Consulta
                  </label>
                  <textarea
                    rows={3}
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    placeholder="Adherencia a la dieta, síntomas reportados, cambios en medicación o actividad física..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewConsultationModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition cursor-pointer"
                >
                  Guardar Consulta & Recalcular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
