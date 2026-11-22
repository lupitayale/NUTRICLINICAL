import React, { useState } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Database,
  Users,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
} from 'lucide-react';
import { Patient, ClinicalAppointment } from '../types/nutrition';

interface FileBackupSyncViewProps {
  patients: Patient[];
  activePatient: Patient | null;
  appointments: ClinicalAppointment[];
  clinicianName: string;
  onImportPatients: (
    importedPatients: Patient[],
    mode: 'merge' | 'replace',
    importedAppointments?: ClinicalAppointment[]
  ) => void;
  onSelectPatient: (patient: Patient) => void;
  onNavigateToTab: (tab: string) => void;
}

export const FileBackupSyncView: React.FC<FileBackupSyncViewProps> = ({
  patients,
  activePatient,
  appointments,
  clinicianName,
  onImportPatients,
  onSelectPatient,
  onNavigateToTab,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    activePatient?.id || patients[0]?.id || ''
  );
  const [statusMsg, setStatusMsg] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [importModalData, setImportModalData] = useState<{
    patients: Patient[];
    appointments?: ClinicalAppointment[];
    fileName: string;
    kind: 'full_backup' | 'patient_record';
  } | null>(null);

  const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setStatusMsg({ type, message });
    if (type !== 'error') {
      setTimeout(() => {
        setStatusMsg((prev) => (prev?.message === message ? null : prev));
      }, 6000);
    }
  };

  // --- Export Full Backup ---
  const handleExportFullBackup = () => {
    try {
      const backupPayload = {
        schemaVersion: '1.0',
        exportedAt: new Date().toISOString(),
        clinicianName,
        patients,
        appointments,
      };

      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `NutriClinical_Base_Completa_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showStatus(
        'success',
        `Respaldo maestro exportado correctamente (${patients.length} pacientes, ${appointments.length} citas). Puedes guardarlo en tu Google Drive personal, iCloud o memoria USB.`
      );
    } catch (err: any) {
      showStatus('error', 'Error al exportar el respaldo maestro.');
    }
  };

  // --- Export Individual Patient ---
  const handleExportSinglePatient = () => {
    const target = patients.find((p) => p.id === selectedPatientId) || activePatient;
    if (!target) {
      showStatus('error', 'Selecciona un paciente válido para exportar.');
      return;
    }

    try {
      const patientPayload = {
        schemaVersion: '1.0',
        exportedAt: new Date().toISOString(),
        clinicianName,
        patient: target,
      };

      const cleanName = target.fullName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_');

      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(patientPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `Expediente_${cleanName}_${target.id}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showStatus(
        'success',
        `Expediente de ${target.fullName} exportado correctamente a tu equipo. Súbelo a tu Google Drive personal cuando lo necesites.`
      );
    } catch (err: any) {
      showStatus('error', 'Error al exportar el expediente del paciente.');
    }
  };

  // --- Handle File Upload / Import ---
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        if (json.patients && Array.isArray(json.patients)) {
          // Full backup
          setImportModalData({
            patients: json.patients,
            appointments: json.appointments || [],
            fileName: file.name,
            kind: 'full_backup',
          });
        } else if (json.patient && json.patient.id && json.patient.fullName) {
          // Individual patient payload
          setImportModalData({
            patients: [json.patient],
            fileName: file.name,
            kind: 'patient_record',
          });
        } else if (json.id && json.fullName && json.consultations) {
          // Raw patient object
          setImportModalData({
            patients: [json as Patient],
            fileName: file.name,
            kind: 'patient_record',
          });
        } else {
          showStatus(
            'error',
            'El archivo seleccionado no tiene el formato clínico compatible de NutriClinical Pro.'
          );
        }
      } catch (parseErr) {
        showStatus('error', 'El archivo no es un JSON válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = (mode: 'merge' | 'replace') => {
    if (!importModalData) return;

    if (importModalData.kind === 'patient_record') {
      const imported = importModalData.patients[0];
      onImportPatients([imported], 'merge');
      onSelectPatient(imported);
      showStatus(
        'success',
        `Expediente de ${imported.fullName} importado correctamente y cargado en el consultorio.`
      );
      setImportModalData(null);
      onNavigateToTab('patients');
    } else {
      onImportPatients(
        importModalData.patients,
        mode,
        importModalData.appointments
      );
      showStatus(
        'success',
        `Se importaron ${importModalData.patients.length} paciente(s) desde el archivo (${
          mode === 'replace' ? 'Directorio reemplazado' : 'Fusionado con registros locales'
        }).`
      );
      setImportModalData(null);
      onNavigateToTab('patients');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-700/50">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold">
            <Cloud className="w-3.5 h-3.5" />
            <span>Gestión de Respaldos e Intercambio en la Nube (Google Drive, iCloud, OneDrive)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Respaldo y Portabilidad de Expedientes por Archivo (.json)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Exporta tu base completa o expedientes individuales con un solo clic. Puedes guardar tus archivos en <b>tu cuenta personal de Google Drive</b>, OneDrive o memoria USB, manteniendo total independencia sin requerir autorizaciones de Google Cloud ni permisos complejos.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : statusMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{statusMsg.message}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Export vs Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EXPORT SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shrink-0">
                <CloudDownload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Exportar e Descargar Archivos (Backup)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Guarda la información en tu equipo y súbela a tu Google Drive personal
                </p>
              </div>
            </div>

            {/* 1. Full Backup */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Respaldo Maestro Completo
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  {patients.length} paciente(s)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Descarga un archivo JSON maestro con todos los expedientes, consultas y citas programadas.
              </p>
              <button
                onClick={handleExportFullBackup}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CloudDownload className="w-4 h-4" />
                <span>Descargar Base Completa (.json)</span>
              </button>
            </div>

            {/* 2. Individual Patient Export */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">
                  Expediente Individual por Paciente
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Selecciona un paciente para exportar exclusivamente su expediente y consultas clínicas.
              </p>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} · {p.consultations.length} consulta(s)
                  </option>
                ))}
              </select>
              <button
                onClick={handleExportSinglePatient}
                disabled={patients.length === 0}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CloudDownload className="w-4 h-4" />
                <span>Descargar Expediente de Paciente (.json)</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Tus datos están bajo tu control total en tus propias carpetas de Google Drive.</span>
          </div>
        </div>

        {/* IMPORT SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                <CloudUpload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Importar y Restaurar desde tu Google Drive / Equipo
                </h3>
                <p className="text-[11px] text-slate-500">
                  Sube un archivo .json guardado previamente para abrir tus pacientes en esta computadora
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 text-center space-y-4 bg-slate-50/50 transition relative">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mx-auto">
                <FileJson className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">
                  Selecciona o arrastra tu archivo JSON
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Soporta respaldos maestros completos (<code className="bg-slate-200 px-1 py-0.5 rounded">NutriClinical_Base_Completa.json</code>) o expedientes individuales.
                </p>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer">
                  <CloudUpload className="w-4 h-4" />
                  <span>Explorar Archivo JSON</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Multi-Dispositivo & Multi-Nutriólogo</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Cada nutriólogo puede descargar sus archivos .json y guardarlos en su propia cuenta de Google Drive. Al cambiar de computadora, simplemente importa el archivo JSON para retomar la consulta exactamente donde la dejaste.
            </p>
          </div>
        </div>
      </div>

      {/* IMPORT PREVIEW & MERGE MODAL */}
      {importModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Vista Previa de Importación
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-xs">
                    Archivo: {importModalData.fileName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImportModalData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200 text-xs space-y-1">
              <div className="font-bold text-teal-950 text-sm">
                {importModalData.kind === 'patient_record'
                  ? `Expediente Individual: ${importModalData.patients[0]?.fullName}`
                  : `Base Maestra Completa: ${importModalData.patients.length} paciente(s) y ${importModalData.appointments?.length || 0} cita(s)`}
              </div>
              <div className="text-teal-800 text-[11px]">
                Selecciona cómo deseas integrar estos datos en tu sistema local:
              </div>
            </div>

            {importModalData.kind === 'full_backup' && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 max-h-40 overflow-y-auto space-y-1 text-xs">
                {importModalData.patients.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-0.5">
                    <span className="font-semibold text-slate-800">{p.fullName}</span>
                    <span className="text-slate-500">{p.consultations.length} consulta(s)</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setImportModalData(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>

              {importModalData.kind === 'patient_record' ? (
                <button
                  onClick={() => handleConfirmImport('merge')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  <span>Cargar Expediente al Sistema</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleConfirmImport('merge')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <span>Fusionar con Actuales (Recomendado)</span>
                  </button>
                  <button
                    onClick={() => handleConfirmImport('replace')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <span>Reemplazar Directorio Local</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
