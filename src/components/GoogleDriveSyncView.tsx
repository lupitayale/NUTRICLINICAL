import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  Trash2,
  FolderOpen,
  FileJson,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  UserCheck,
  Users,
  LogOut,
  ExternalLink,
  AlertTriangle,
  Database,
  X,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Patient, ClinicalAppointment } from '../types/nutrition';
import { GoogleSignInButton } from './GoogleSignInButton';
import { GoogleAuthDiagnosticCard } from './GoogleAuthDiagnosticCard';
import {
  googleSignIn,
  googleLogout,
  getAccessToken,
  getCurrentFirebaseUser,
} from '../utils/googleAuth';
import {
  CLINIC_FOLDER_NAME,
  FULL_BACKUP_FILENAME,
  DriveClinicFile,
  FullClinicBackupPayload,
  IndividualPatientPayload,
  findOrCreateClinicFolder,
  listDriveClinicFiles,
  savePatientRecordToDrive,
  saveFullClinicBackupToDrive,
  extractFileContentFromDrive,
  deleteFileFromDrive,
} from '../utils/googleDrivePatients';

interface GoogleDriveSyncViewProps {
  patients: Patient[];
  activePatient: Patient | null;
  appointments: ClinicalAppointment[];
  clinicianName: string;
  googleUser: User | null;
  driveAccessToken: string | null;
  onGoogleConnected: (user: User, token: string) => void;
  onGoogleDisconnected: () => void;
  onImportPatients: (
    importedPatients: Patient[],
    mode: 'merge' | 'replace',
    importedAppointments?: ClinicalAppointment[]
  ) => void;
  onSelectPatient: (patient: Patient) => void;
  onNavigateToTab: (tab: string) => void;
}

interface PendingDriveConfirm {
  type:
    | 'save_active_patient'
    | 'save_all_individual'
    | 'save_full_backup'
    | 'delete_file';
  title: string;
  description: string;
  affectedItems: string[];
  isDestructive?: boolean;
  targetFileId?: string;
  targetPatient?: Patient;
}

interface ExtractionPreviewState {
  file: DriveClinicFile;
  kind: 'patient' | 'full_backup';
  patientPayload?: IndividualPatientPayload;
  backupPayload?: FullClinicBackupPayload;
}

export const GoogleDriveSyncView: React.FC<GoogleDriveSyncViewProps> = ({
  patients,
  activePatient,
  appointments,
  clinicianName,
  googleUser,
  driveAccessToken,
  onGoogleConnected,
  onGoogleDisconnected,
  onImportPatients,
  onSelectPatient,
  onNavigateToTab,
}) => {
  const [driveFiles, setDriveFiles] = useState<DriveClinicFile[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileFilter, setFileFilter] = useState<'all' | 'patient_record' | 'full_backup'>('all');
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

  const [pendingConfirm, setPendingConfirm] = useState<PendingDriveConfirm | null>(null);
  const [extractionPreview, setExtractionPreview] = useState<ExtractionPreviewState | null>(null);
  const [selectedPatientToUploadId, setSelectedPatientToUploadId] = useState<string>(
    activePatient?.id || patients[0]?.id || ''
  );

  useEffect(() => {
    if (activePatient?.id) {
      setSelectedPatientToUploadId(activePatient.id);
    } else if (
      patients.length > 0 &&
      !patients.some((p) => p.id === selectedPatientToUploadId)
    ) {
      setSelectedPatientToUploadId(patients[0].id);
    }
  }, [activePatient?.id, patients, selectedPatientToUploadId]);

  const showStatus = (type: 'success' | 'error' | 'info', message: string) => {
    setStatusBanner({ type, message });
    if (type !== 'error') {
      setTimeout(() => {
        setStatusBanner((prev) => (prev?.message === message ? null : prev));
      }, 6000);
    }
  };

  const fetchDriveFiles = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || driveAccessToken || (await getAccessToken());
    if (!token) return;

    setIsLoadingFiles(true);
    try {
      const result = await listDriveClinicFiles(token);
      setFolderId(result.folderId);
      setDriveFiles(result.files);
    } catch (err: any) {
      if (err?.message === 'TOKEN_EXPIRED') {
        onGoogleDisconnected();
        showStatus(
          'error',
          'Tu sesión de Google Drive expiró. Inicia sesión nuevamente con Google para continuar.'
        );
      } else {
        showStatus('error', err?.message || 'No se pudieron consultar los archivos de Google Drive.');
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, [driveAccessToken, onGoogleDisconnected]);

  useEffect(() => {
    if (driveAccessToken) {
      fetchDriveFiles(driveAccessToken);
    } else {
      setDriveFiles([]);
      setFolderId(null);
    }
  }, [driveAccessToken, fetchDriveFiles]);

  const handleConnectGoogle = async () => {
    setIsLoggingIn(true);
    setAuthErrorCode(null);
    setStatusBanner(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setAuthErrorCode(null);
        onGoogleConnected(res.user, res.accessToken);
        showStatus(
          'success',
          `Conectado con Google Drive como ${res.user.email || res.user.displayName}.`
        );
        await fetchDriveFiles(res.accessToken);
      }
    } catch (err: any) {
      if (err?.code) {
        setAuthErrorCode(err.code);
      }
      showStatus(
        'error',
        err?.message || 'No se pudo completar el inicio de sesión con Google.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    await googleLogout();
    onGoogleDisconnected();
    setDriveFiles([]);
    setFolderId(null);
    showStatus('info', 'Se desconectó la sesión de Google Drive.');
  };

  // --- Confirmation Triggers for Mutating/Destructive Operations ---
  const requestSaveSinglePatient = () => {
    const target = patients.find((p) => p.id === selectedPatientToUploadId) || activePatient;
    if (!target) return;

    const existing = driveFiles.find(
      (f) =>
        f.appProperties?.patientId === target.id ||
        f.name.includes(`_${target.id}.json`)
    );

    setPendingConfirm({
      type: 'save_active_patient',
      title: existing
        ? `¿Actualizar expediente en Google Drive?`
        : `¿Generar nuevo expediente en Google Drive?`,
      description: existing
        ? `Se sobrescribirá el archivo existente de ${target.fullName} en tu carpeta "${CLINIC_FOLDER_NAME}" de Google Drive con sus consultas, menús y prescripciones actuales.`
        : `Se creará un nuevo archivo JSON con el expediente completo de ${target.fullName} dentro de la carpeta "${CLINIC_FOLDER_NAME}" en tu Google Drive.`,
      affectedItems: [
        existing
          ? `Actualizar archivo: ${existing.name}`
          : `Crear archivo para: ${target.fullName} (${target.consultations.length} consulta(s))`,
      ],
      targetFileId: existing?.id,
      targetPatient: target,
    });
  };

  const requestSaveFullBackup = () => {
    const existingBackup = driveFiles.find(
      (f) =>
        f.appProperties?.nutriclinicalType === 'full_backup' ||
        f.name === FULL_BACKUP_FILENAME
    );

    setPendingConfirm({
      type: 'save_full_backup',
      title: existingBackup
        ? '¿Sobrescribir Base de Datos Completa en Google Drive?'
        : '¿Crear Base de Datos Completa en Google Drive?',
      description: existingBackup
        ? `Se actualizará el respaldo maestro "${FULL_BACKUP_FILENAME}" en Google Drive con los ${patients.length} pacientes y ${appointments.length} citas actuales.`
        : `Se creará el archivo maestro "${FULL_BACKUP_FILENAME}" dentro de "${CLINIC_FOLDER_NAME}" para que puedas abrir todos tus pacientes desde cualquier computadora.`,
      affectedItems: patients.map((p) => `${p.fullName} (${p.consultations.length} consultas)`),
      targetFileId: existingBackup?.id,
    });
  };

  const requestSaveAllIndividual = () => {
    setPendingConfirm({
      type: 'save_all_individual',
      title: `¿Generar/Actualizar ${patients.length} Expedientes Individuales en Drive?`,
      description: `Esta operación guardará o actualizará un archivo individual en Google Drive por cada uno de tus ${patients.length} pacientes registrados en la carpeta "${CLINIC_FOLDER_NAME}".`,
      affectedItems: patients.map((p) => {
        const exists = driveFiles.some(
          (f) => f.appProperties?.patientId === p.id || f.name.includes(`_${p.id}.json`)
        );
        return `${exists ? '[Actualizar]' : '[Crear]'} ${p.fullName}`;
      }),
    });
  };

  const requestDeleteFile = (file: DriveClinicFile) => {
    setPendingConfirm({
      type: 'delete_file',
      title: '¿Eliminar archivo de Google Drive?',
      description: `Estás a punto de eliminar permanentemente el archivo "${file.name}" de tu Google Drive. Esta acción no se puede deshacer.`,
      affectedItems: [file.name],
      isDestructive: true,
      targetFileId: file.id,
    });
  };

  const executeConfirmedAction = async () => {
    if (!pendingConfirm) return;
    const token = driveAccessToken || (await getAccessToken());
    if (!token) {
      setPendingConfirm(null);
      onGoogleDisconnected();
      showStatus('error', 'Sesión de Google expirada. Vuelve a iniciar sesión.');
      return;
    }

    const action = pendingConfirm;
    setPendingConfirm(null);
    setIsProcessing(true);

    try {
      if (action.type === 'delete_file' && action.targetFileId) {
        await deleteFileFromDrive(token, action.targetFileId);
        showStatus('success', `Archivo eliminado de Google Drive correctamente.`);
        await fetchDriveFiles(token);
        return;
      }

      const activeFolderId = folderId || (await findOrCreateClinicFolder(token));
      setFolderId(activeFolderId);

      if (action.type === 'save_active_patient' && action.targetPatient) {
        const saved = await savePatientRecordToDrive(
          token,
          activeFolderId,
          action.targetPatient,
          clinicianName,
          action.targetFileId
        );
        showStatus(
          'success',
          `Expediente de ${action.targetPatient.fullName} guardado en Google Drive (${saved.name}).`
        );
      } else if (action.type === 'save_full_backup') {
        const saved = await saveFullClinicBackupToDrive(
          token,
          activeFolderId,
          patients,
          appointments,
          clinicianName,
          action.targetFileId
        );
        showStatus(
          'success',
          `Base completa con ${patients.length} paciente(s) respaldada en Google Drive (${saved.name}).`
        );
      } else if (action.type === 'save_all_individual') {
        let createdCount = 0;
        let updatedCount = 0;
        for (const p of patients) {
          const existing = driveFiles.find(
            (f) => f.appProperties?.patientId === p.id || f.name.includes(`_${p.id}.json`)
          );
          await savePatientRecordToDrive(
            token,
            activeFolderId,
            p,
            clinicianName,
            existing?.id
          );
          if (existing) updatedCount++;
          else createdCount++;
        }
        showStatus(
          'success',
          `Sincronización por lotes lista: ${createdCount} creado(s), ${updatedCount} actualizado(s) en Google Drive.`
        );
      }

      await fetchDriveFiles(token);
    } catch (err: any) {
      if (err?.message === 'TOKEN_EXPIRED') {
        onGoogleDisconnected();
        showStatus('error', 'Tu token de Google Drive expiró. Inicia sesión con Google nuevamente.');
      } else {
        showStatus('error', err?.message || 'Error al operar con Google Drive.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Read-Only Extraction from Drive ---
  const handleExtractFile = async (file: DriveClinicFile) => {
    const token = driveAccessToken || (await getAccessToken());
    if (!token) {
      onGoogleDisconnected();
      return;
    }

    setIsProcessing(true);
    try {
      const content = await extractFileContentFromDrive(token, file.id);
      if ('patients' in content && Array.isArray(content.patients)) {
        setExtractionPreview({
          file,
          kind: 'full_backup',
          backupPayload: content,
        });
      } else if ('patient' in content && content.patient) {
        setExtractionPreview({
          file,
          kind: 'patient',
          patientPayload: content,
        });
      } else if ((content as any).fullName && (content as any).id) {
        setExtractionPreview({
          file,
          kind: 'patient',
          patientPayload: {
            schemaVersion: '1.0',
            exportedAt: file.modifiedTime,
            clinicianName,
            patient: content as unknown as Patient,
          },
        });
      } else {
        showStatus('error', 'El archivo seleccionado no tiene el formato clínico de NutriClinical Pro.');
      }
    } catch (err: any) {
      if (err?.message === 'TOKEN_EXPIRED') {
        onGoogleDisconnected();
        showStatus('error', 'Tu sesión de Google expiró. Vuelve a iniciar sesión.');
      } else {
        showStatus('error', err?.message || 'No se pudo extraer el contenido del archivo.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmExtraction = (mode: 'merge' | 'replace') => {
    if (!extractionPreview) return;

    if (extractionPreview.kind === 'patient' && extractionPreview.patientPayload) {
      const extracted = extractionPreview.patientPayload.patient;
      onImportPatients([extracted], 'merge');
      onSelectPatient(extracted);
      showStatus(
        'success',
        `Expediente de ${extracted.fullName} extraído de Google Drive y cargado en el sistema.`
      );
      setExtractionPreview(null);
      onNavigateToTab('patients');
    } else if (extractionPreview.kind === 'full_backup' && extractionPreview.backupPayload) {
      const { patients: extractedPatients, appointments: extractedAppointments } =
        extractionPreview.backupPayload;
      onImportPatients(extractedPatients, mode, extractedAppointments);
      showStatus(
        'success',
        `Se extrajeron ${extractedPatients.length} paciente(s) desde Google Drive (${
          mode === 'replace' ? 'Directorio reemplazado' : 'Fusionado con registros locales'
        }).`
      );
      setExtractionPreview(null);
      onNavigateToTab('patients');
    }
  };

  const activeFirebaseUser = googleUser || getCurrentFirebaseUser();
  const isConnected = Boolean(driveAccessToken);

  const filteredDriveFiles = driveFiles.filter((file) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.appProperties?.patientName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const fileType =
      file.appProperties?.nutriclinicalType ||
      (file.name === FULL_BACKUP_FILENAME ? 'full_backup' : 'patient_record');

    const matchesFilter = fileFilter === 'all' || fileType === fileFilter;
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytesStr?: string) => {
    if (!bytesStr) return 'JSON';
    const bytes = Number(bytesStr);
    if (isNaN(bytes)) return 'JSON';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold">
              <Cloud className="w-3.5 h-3.5" />
              <span>Respaldo Clínico Multi-Equipo en Google Drive</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Expedientes en la Nube con tu Cuenta de Google
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Guarda, genera y extrae los expedientes de tus pacientes directamente desde la carpeta{' '}
              <b className="text-white">"{CLINIC_FOLDER_NAME}"</b> en tu Google Drive. Así podrás abrir tu consultorio desde cualquier computadora sin depender del almacenamiento local.
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 min-w-[290px]">
            {isConnected && activeFirebaseUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {activeFirebaseUser.photoURL ? (
                    <img
                      src={activeFirebaseUser.photoURL}
                      alt={activeFirebaseUser.displayName || 'Google'}
                      className="w-10 h-10 rounded-full border-2 border-teal-400"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center font-bold text-sm">
                      {(activeFirebaseUser.displayName || activeFirebaseUser.email || 'G')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{activeFirebaseUser.displayName || 'Cuenta Google Conectada'}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                    <div className="text-[11px] text-teal-200 truncate">
                      {activeFirebaseUser.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => fetchDriveFiles()}
                    disabled={isLoadingFiles || isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    <span>Actualizar Drive</span>
                  </button>
                  <button
                    onClick={handleDisconnectGoogle}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-rose-500/30 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                    title="Desconectar cuenta Google"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Salir</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <div className="text-xs font-semibold text-slate-200">
                  Conecta tu cuenta Google para habilitar lectura y respaldo en Drive
                </div>
                <GoogleSignInButton
                  onClick={handleConnectGoogle}
                  disabled={isLoggingIn}
                  label={isLoggingIn ? 'Conectando con Google...' : 'Iniciar sesión con Google'}
                  className="w-full"
                />
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  <span>Solo se accede a los archivos creados por NutriClinical Pro</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusBanner && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : statusBanner.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{statusBanner.message}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isConnected && authErrorCode && (
        <GoogleAuthDiagnosticCard
          errorType={authErrorCode === 'auth/unauthorized-domain' ? 'unauthorized-domain' : 'access-denied'}
          onRetry={handleConnectGoogle}
        />
      )}

      {!isConnected ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mx-auto">
            <Cloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Inicia sesión con tu cuenta de Google para acceder a Google Drive
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Al conectarte con Google podrás generar registros individuales o respaldos completos de tus {patients.length} paciente(s) en la nube y extraerlos desde cualquier computadora en el momento que los necesites.
          </p>
          <div className="pt-2 flex justify-center">
            <GoogleSignInButton
              onClick={handleConnectGoogle}
              disabled={isLoggingIn}
              label={isLoggingIn ? 'Conectando...' : 'Conectar Google Drive ahora'}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT PANEL: Generate & Save Records to Drive */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Full Clinic Database Backup */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Respaldo Maestro en Google Drive
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Guarda todos tus pacientes ({patients.length}) y citas ({appointments.length}) en un solo archivo sincronizable
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={requestSaveFullBackup}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CloudUpload className="w-4 h-4" />
                <span>Guardar Base Completa en Drive ({patients.length} pacientes)</span>
              </button>
            </div>

            {/* 2. Individual Patient Record Generator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Generar Expediente Individual en Drive
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Crea un archivo independiente por paciente para extraerlo por separado cuando sea requerido
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase block">
                  Seleccionar Paciente Local:
                </label>
                <select
                  value={selectedPatientToUploadId}
                  onChange={(e) => setSelectedPatientToUploadId(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} · {p.consultations.length} consulta(s)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={requestSaveSinglePatient}
                  disabled={isProcessing || patients.length === 0}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Guardar Este Paciente</span>
                </button>

                <button
                  onClick={requestSaveAllIndividual}
                  disabled={isProcessing || patients.length === 0}
                  className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Generar Todos ({patients.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Extract & Manage Drive Records */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Registros Almacenados en Google Drive
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Carpeta: <b>{CLINIC_FOLDER_NAME}</b> · {driveFiles.length} archivo(s) encontrados
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchDriveFiles()}
                disabled={isLoadingFiles}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                <span>Sincronizar Lista</span>
              </button>
            </div>

            {/* Search & Filter */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar expediente o respaldo en Google Drive..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px] font-semibold shrink-0">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'patient_record', label: 'Pacientes' },
                  { id: 'full_backup', label: 'Bases' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFileFilter(tab.id as any)}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      fileFilter === tab.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Files List */}
            <div className="flex-1 p-4 space-y-2.5 max-h-[520px] overflow-y-auto">
              {isLoadingFiles ? (
                <div className="py-12 text-center space-y-2 text-xs text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                  <div>Consultando expedientes en Google Drive...</div>
                </div>
              ) : filteredDriveFiles.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileJson className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {driveFiles.length === 0
                      ? 'Aún no hay expedientes guardados en tu Google Drive'
                      : 'No hay archivos que coincidan con la búsqueda'}
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Usa las opciones de la izquierda para generar el respaldo de tu base completa o expedientes individuales en Google Drive.
                  </p>
                </div>
              ) : (
                filteredDriveFiles.map((file) => {
                  const isFullBackup =
                    file.appProperties?.nutriclinicalType === 'full_backup' ||
                    file.name === FULL_BACKUP_FILENAME;

                  return (
                    <div
                      key={file.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 bg-white hover:bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isFullBackup
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isFullBackup ? (
                            <Database className="w-4 h-4" />
                          ) : (
                            <FileJson className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {file.appProperties?.patientName || file.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isFullBackup
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {isFullBackup
                                ? `Base Completa (${file.appProperties?.patientCount || '?'} pac.)`
                                : 'Expediente Individual'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span className="truncate max-w-[220px]">{file.name}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(file.modifiedTime).toLocaleString('es-MX', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                            <span>· {formatFileSize(file.size)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleExtractFile(file)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-3xs disabled:opacity-50"
                          title="Extraer e importar este registro desde Google Drive"
                        >
                          <CloudDownload className="w-3.5 h-3.5" />
                          <span>Extraer</span>
                        </button>

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                            title="Ver archivo en Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => requestDeleteFile(file)}
                          disabled={isProcessing}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Eliminar de Google Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION DIALOG FOR MUTATING / DESTRUCTIVE DRIVE OPERATIONS */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  pendingConfirm.isDestructive
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}
              >
                {pendingConfirm.isDestructive ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CloudUpload className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">{pendingConfirm.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {pendingConfirm.description}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 max-h-40 overflow-y-auto space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                Elementos afectados ({pendingConfirm.affectedItems.length}):
              </div>
              {pendingConfirm.affectedItems.map((item, idx) => (
                <div key={idx} className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition shadow-xs cursor-pointer ${
                  pendingConfirm.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {pendingConfirm.isDestructive
                  ? 'Confirmar y Eliminar de Drive'
                  : 'Confirmar y Guardar en Drive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXTRACTION PREVIEW & IMPORT MODAL */}
      {extractionPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <CloudDownload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Registro Extraído de Google Drive
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-sm">
                    Archivo: {extractionPreview.file.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExtractionPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {extractionPreview.kind === 'patient' && extractionPreview.patientPayload && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-sm text-slate-900">
                  {extractionPreview.patientPayload.patient.fullName}
                </div>
                <div className="text-slate-600 flex flex-wrap gap-3">
                  <span>Edad: <b>{extractionPreview.patientPayload.patient.age} años</b></span>
                  <span>
                    Consultas: <b>{extractionPreview.patientPayload.patient.consultations.length}</b>
                  </span>
                  <span>
                    Meta calórica:{' '}
                    <b>
                      {extractionPreview.patientPayload.patient.activePrescription.targetCalories}{' '}
                      kcal
                    </b>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Exportado el{' '}
                  {new Date(extractionPreview.patientPayload.exportedAt).toLocaleString('es-MX')} por{' '}
                  {extractionPreview.patientPayload.clinicianName}
                </div>
              </div>
            )}

            {extractionPreview.kind === 'full_backup' && extractionPreview.backupPayload && (
              <div className="space-y-3">
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-200 text-xs space-y-1">
                  <div className="font-bold text-teal-950">
                    Base Completa con {extractionPreview.backupPayload.patients.length} paciente(s) y{' '}
                    {extractionPreview.backupPayload.appointments?.length || 0} cita(s)
                  </div>
                  <div className="text-teal-800">
                    Respaldo generado el{' '}
                    {new Date(extractionPreview.backupPayload.exportedAt).toLocaleString('es-MX')}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 max-h-40 overflow-y-auto space-y-1 text-xs">
                  {extractionPreview.backupPayload.patients.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-0.5">
                      <span className="font-semibold text-slate-800">{p.fullName}</span>
                      <span className="text-slate-500">
                        {p.consultations.length} consulta(s)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setExtractionPreview(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>

              {extractionPreview.kind === 'patient' ? (
                <button
                  onClick={() => handleConfirmExtraction('merge')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  <span>Cargar Expediente al Sistema</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleConfirmExtraction('merge')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <span>Fusionar con Actuales (Recomendado)</span>
                  </button>
                  <button
                    onClick={() => handleConfirmExtraction('replace')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <span>Reemplazar Lista Local</span>
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
