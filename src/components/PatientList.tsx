import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Scale,
  Sparkles,
  Edit,
  Trash2,
  Calendar,
  Activity,
  ArrowRight,
  ShieldAlert,
  Cloud,
} from 'lucide-react';
import { Patient, PathologyType } from '../types/nutrition';
import { PATHOLOGY_INFO } from '../utils/nutritionCalculations';

interface PatientListProps {
  patients: Patient[];
  activePatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onNavigateToTab: (tab: string) => void;
  isDriveConnected?: boolean;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  onOpenNewPatientModal,
  onEditPatient,
  onDeletePatient,
  onNavigateToTab,
  isDriveConnected = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.pathologies.some((p) =>
        PATHOLOGY_INFO[p]?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'with_pathology') return matchesSearch && patient.pathologies.length > 0;
    if (selectedFilter === 'with_menu') return matchesSearch && Boolean(patient.activeMenuPlan);
    return matchesSearch && patient.pathologies.includes(selectedFilter as PathologyType);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Pacientes
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{patients.length}</div>
          <div className="text-xs text-slate-400 mt-1">Expedientes activos</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
            Con Patología Clínica
          </div>
          <div className="text-2xl font-extrabold text-teal-800 mt-1">
            {patients.filter((p) => p.pathologies.length > 0).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Ajuste metabólico guiado</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Consultas Registradas
          </div>
          <div className="text-2xl font-extrabold text-blue-800 mt-1">
            {patients.reduce((acc, p) => acc + p.consultations.length, 0)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Seguimiento antropométrico</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Planes de Menú Activos
          </div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">
            {patients.filter((p) => Boolean(p.activeMenuPlan)).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Diseñados y listos</div>
        </div>
      </div>

      {/* Control Bar: Search & Action */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, correo o patología (ej. Diabetes, Renal)..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({patients.length})
          </button>
          <button
            onClick={() => setSelectedFilter('diabetes_t2')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'diabetes_t2'
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Diabetes
          </button>
          <button
            onClick={() => setSelectedFilter('hypertension')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'hypertension'
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hipertensión
          </button>
          <button
            onClick={() => setSelectedFilter('ckd_non_dialysis')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'ckd_non_dialysis'
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Renal (ERC)
          </button>
          <button
            onClick={() => setSelectedFilter('fatty_liver')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'fatty_liver'
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hígado Graso
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateToTab('drive_sync')}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition shadow-2xs cursor-pointer ${
              isDriveConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-800'
            }`}
            title="Guardar o extraer expedientes de pacientes en Google Drive"
          >
            <Cloud className={`w-4 h-4 ${isDriveConnected ? 'text-emerald-600' : 'text-teal-600'}`} />
            <span>{isDriveConnected ? 'Sincronizar Drive' : 'Nube Google Drive'}</span>
          </button>

          <button
            onClick={onOpenNewPatientModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition shadow-xs cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Agregar Paciente</span>
          </button>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map((patient) => {
          const isCurrentActive = activePatient?.id === patient.id;
          const latestConsultation = patient.consultations[patient.consultations.length - 1];
          const initialConsultation = patient.consultations[0];
          const weightDiff =
            latestConsultation && initialConsultation && patient.consultations.length > 1
              ? Number((latestConsultation.weightKg - initialConsultation.weightKg).toFixed(1))
              : null;

          return (
            <div
              key={patient.id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isCurrentActive
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                        patient.gender === 'female'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : 'bg-teal-50 text-teal-700 border border-teal-100'
                      }`}
                    >
                      {patient.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {patient.fullName}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {patient.age} años · {patient.gender === 'male' ? 'Hombre' : 'Mujer'} ·{' '}
                        {patient.phone || patient.email || 'Sin contacto'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditPatient(patient)}
                      title="Editar Datos del Paciente"
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {patients.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al paciente ${patient.fullName}?`)) {
                            onDeletePatient(patient.id);
                          }
                        }}
                        title="Eliminar Paciente"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Pathologies Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {patient.pathologies.map((p) => (
                    <span
                      key={p}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                    >
                      {PATHOLOGY_INFO[p]?.name.split(' (')[0] || p}
                    </span>
                  ))}
                  {patient.pathologies.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">
                      Sin patologías registradas
                    </span>
                  )}
                </div>
              </div>

              {/* Antropometric & Metabolic Snapshot */}
              <div className="px-5 py-3 bg-slate-50/70 border-y border-slate-100">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Peso Actual</div>
                    <div className="text-sm font-extrabold text-slate-800">
                      {latestConsultation ? `${latestConsultation.weightKg} kg` : 'N/A'}
                    </div>
                    {weightDiff !== null && (
                      <div
                        className={`text-[10px] font-bold ${
                          weightDiff < 0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">IMC (OMS)</div>
                    <div className="text-sm font-extrabold text-slate-800">
                      {latestConsultation ? latestConsultation.bmi : 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {latestConsultation ? latestConsultation.bmiClassification.split(' ')[0] : '-'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Meta Calórica</div>
                    <div className="text-sm font-extrabold text-teal-800">
                      {patient.activePrescription.targetCalories}
                    </div>
                    <div className="text-[10px] text-slate-500">kcal / día</div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{patient.consultations.length} consulta(s)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectPatient(patient);
                      onNavigateToTab('menus');
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      patient.activeMenuPlan
                        ? 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{patient.activeMenuPlan ? 'Ver Menú' : 'Crear Menú'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectPatient(patient);
                      onNavigateToTab('anthropometry');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer"
                  >
                    <span>Expediente</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron pacientes</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Prueba con otro término de búsqueda o registra a un nuevo paciente con el botón superior.
          </p>
        </div>
      )}
    </div>
  );
};
