import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PatientList } from './components/PatientList';
import { AnthropometryView } from './components/AnthropometryView';
import { MetabolicCalculationsView } from './components/MetabolicCalculationsView';
import { MenuGeneratorView } from './components/MenuGeneratorView';
import { PrintPatientPlan } from './components/PrintPatientPlan';
import { QuickExpressCalculator } from './components/QuickExpressCalculator';
import { PatientModal } from './components/PatientModal';
import { LoginView } from './components/LoginView';
import { PublicLandingView } from './components/PublicLandingView';

import { EnteralNutritionView } from './components/EnteralNutritionView';
import { ParenteralNutritionView } from './components/ParenteralNutritionView';
import { AdminNutriologistsView } from './components/AdminNutriologistsView';
import { MedicalPrescriptionView } from './components/MedicalPrescriptionView';
import { LabResultsView } from './components/LabResultsView';
import { ClinicalLifecycleAssessmentView } from './components/ClinicalLifecycleAssessmentView';
import { AppointmentsCalendarView } from './components/AppointmentsCalendarView';
import { AdvancedClinicalCalculators } from './components/AdvancedClinicalCalculators';
import { FileBackupSyncView } from './components/FileBackupSyncView';
import { Patient, Gender, NutritionGoal, PathologyType, ClinicalAppointment, PatientActivity } from './types/nutrition';
import { getInitialDemoPatients, getInitialDemoAppointments, getInitialDemoActivities } from './utils/mockPatients';
import { initAuth, googleLogout } from './utils/googleAuth';
import { listDriveClinicFiles } from './utils/googleDrivePatients';

const STORAGE_KEY = 'nutriclinical_pro_patients_v2';
const AUTH_KEY = 'nutriclinical_auth_session_v1';
const APPOINTMENTS_KEY = 'nutriclinical_appointments_v1';
const ACTIVITIES_KEY = 'nutriclinical_activities_v1';

export interface AuthUser {
  username: string;
  name: string;
  role: string;
  professionalLicense?: string;
  email?: string;
  photoURL?: string;
  authProvider?: 'local' | 'google';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read auth from localStorage', e);
    }
    return null;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const nutriologistKey = currentUser?.username || 'admin';
    const storageKey = `nutriclinical_pro_patients_${nutriologistKey}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read patients from localStorage, loading clinical demo set.', e);
    }
    return getInitialDemoPatients();
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    return patients[0]?.id || '';
  });

  const [currentTab, setCurrentTab] = useState<string>('patients');
  const [printInitialDocType, setPrintInitialDocType] = useState<string>('plan');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const handleNavigateToTab = (tab: string, docType?: string) => {
    if (docType) {
      setPrintInitialDocType(docType);
    }
    setCurrentTab(tab);
  };

  const [appointments, setAppointments] = useState<ClinicalAppointment[]>(() => {
    try {
      const saved = localStorage.getItem(APPOINTMENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load appointments from localStorage', e);
    }
    return getInitialDemoAppointments();
  });

  const [activities, setActivities] = useState<PatientActivity[]>(() => {
    try {
      const saved = localStorage.getItem(ACTIVITIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load activities from localStorage', e);
    }
    return getInitialDemoActivities();
  });

  const handleUpdateAppointments = (newApts: ClinicalAppointment[]) => {
    setAppointments(newApts);
    try {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(newApts));
    } catch (e) {
      console.error('Failed to save appointments to localStorage', e);
    }
  };

  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
  const [driveBackupNotice, setDriveBackupNotice] = useState<{ count: number } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setDriveAccessToken(token);
      },
      () => {
        setDriveAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (
    user: AuthUser,
    googleAuth?: { user: any; accessToken: string }
  ) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth to localStorage:', e);
    }

    if (googleAuth) {
      setGoogleUser(googleAuth.user);
      setDriveAccessToken(googleAuth.accessToken);
      listDriveClinicFiles(googleAuth.accessToken)
        .then((res) => {
          if (res.files && res.files.length > 0) {
            setDriveBackupNotice({ count: res.files.length });
          }
        })
        .catch((err) => {
          console.warn('Could not check existing Drive files on login:', err);
        });
    }
  };

  const handleUpdateCurrentUser = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to update auth in localStorage:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGoogleUser(null);
    setDriveAccessToken(null);
    setDriveBackupNotice(null);
    googleLogout().catch(() => {});
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.error('Failed to remove auth from localStorage:', e);
    }
  };

  const [activeAppointmentAlert, setActiveAppointmentAlert] = useState<ClinicalAppointment | null>(null);

  // Request browser notification permission and check appointments
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const checkAppointments = () => {
      const realToday = new Date().toISOString().split('T')[0];
      const todayApt = appointments.find(
        (a) => a.date === realToday && a.status === 'confirmada'
      );
      if (todayApt) {
        setActiveAppointmentAlert(todayApt);
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('🔔 Recordatorio de Cita - NutriClinical Pro', {
              body: `Tienes consulta hoy con ${todayApt.patientName} a las ${todayApt.time} (${todayApt.type}).`,
            });
          } catch (e) {
            // ignore
          }
        }
      }
    };

    checkAppointments();
    const interval = setInterval(checkAppointments, 60000); // check every minute
    return () => clearInterval(interval);
  }, [appointments]);

  // Load patients when current nutriologist changes
  useEffect(() => {
    const nutriologistKey = currentUser?.username || 'admin';
    const storageKey = `nutriclinical_pro_patients_${nutriologistKey}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPatients(parsed);
          setActivePatientId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read patients for nutriologist', e);
    }
    const initial = getInitialDemoPatients();
    setPatients(initial);
    setActivePatientId(initial[0]?.id || '');
  }, [currentUser?.username]);

  // Sync patients to nutriologist-specific localStorage key
  useEffect(() => {
    const nutriologistKey = currentUser?.username || 'admin';
    const storageKey = `nutriclinical_pro_patients_${nutriologistKey}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [patients, currentUser?.username]);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || null;

  const handleSelectPatient = (patient: Patient) => {
    setActivePatientId(patient.id);
  };

  const handleSavePatient = (savedPatient: Patient) => {
    setPatients((prev) => {
      const exists = prev.some((p) => p.id === savedPatient.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPatient.id ? savedPatient : p));
      }
      return [savedPatient, ...prev];
    });
    setActivePatientId(savedPatient.id);
    setPatientToEdit(null);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients((prev) => {
      const filtered = prev.filter((p) => p.id !== patientId);
      if (activePatientId === patientId && filtered.length > 0) {
        setActivePatientId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleOpenNewPatientModal = () => {
    setPatientToEdit(null);
    setIsPatientModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setPatientToEdit(patient);
    setIsPatientModalOpen(true);
  };

  const handleTransferFromExpress = (data: {
    weight: number;
    height: number;
    age: number;
    gender: Gender;
    pathologies: PathologyType[];
    goal: NutritionGoal;
  }) => {
    setPatientToEdit(null);
    setIsPatientModalOpen(true);
  };

  const handleImportPatients = (
    importedPatients: Patient[],
    mode: 'merge' | 'replace',
    importedAppointments?: ClinicalAppointment[]
  ) => {
    if (importedPatients && importedPatients.length > 0) {
      if (mode === 'replace') {
        setPatients(importedPatients);
        setActivePatientId(importedPatients[0].id);
      } else {
        setPatients((prev) => {
          const importedMap = new Map(importedPatients.map((p) => [p.id, p]));
          const updatedExisting = prev.map((p) => importedMap.get(p.id) || p);
          const existingIds = new Set(prev.map((p) => p.id));
          const brandNew = importedPatients.filter((p) => !existingIds.has(p.id));
          return [...brandNew, ...updatedExisting];
        });
        setActivePatientId((prev) => importedPatients[0]?.id || prev);
      }
    }

    if (importedAppointments && importedAppointments.length > 0) {
      if (mode === 'replace') {
        handleUpdateAppointments(importedAppointments);
      } else {
        const importedAptMap = new Map(importedAppointments.map((a) => [a.id, a]));
        const updatedApts = appointments.map((a) => importedAptMap.get(a.id) || a);
        const existingAptIds = new Set(appointments.map((a) => a.id));
        const newApts = importedAppointments.filter((a) => !existingAptIds.has(a.id));
        handleUpdateAppointments([...newApts, ...updatedApts]);
      }
    }
  };

  if (!currentUser) {
    return <PublicLandingView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Application Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        patients={patients}
        activePatient={activePatient}
        onSelectPatient={handleSelectPatient}
        onOpenNewPatientModal={handleOpenNewPatientModal}
        currentUser={currentUser}
        onLogout={handleLogout}
        appointments={appointments}
        onUpdateCurrentUser={handleUpdateCurrentUser}
        isDriveConnected={Boolean(driveAccessToken)}
        driveEmail={googleUser?.email || currentUser.email || null}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeAppointmentAlert && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-950 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base shrink-0">
                🔔
              </div>
              <div>
                <div className="font-bold text-sm text-amber-900">Recordatorio Activo para el Nutriólogo (Cita Programada Hoy)</div>
                <div className="text-amber-800 mt-0.5">
                  Paciente: <b className="text-amber-950">{activeAppointmentAlert.patientName}</b> · Hora: <b className="text-amber-950">{activeAppointmentAlert.time}</b> · Tipo: {activeAppointmentAlert.type}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const pat = patients.find((p) => p.id === activeAppointmentAlert.patientId);
                  if (pat) {
                    setActivePatientId(pat.id);
                    setCurrentTab('anthropometry');
                  }
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Atender Paciente
              </button>
              <button
                onClick={() => setActiveAppointmentAlert(null)}
                className="p-1 text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                title="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        )}


        {driveBackupNotice && (
          <div className="mb-6 bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sky-950 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base shrink-0">
                ☁️
              </div>
              <div>
                <div className="font-bold text-sm text-sky-950">
                  Respaldos encontrados en Google Drive ({driveBackupNotice.count} {driveBackupNotice.count === 1 ? 'archivo' : 'archivos'})
                </div>
                <div className="text-sky-800 mt-0.5">
                  Detectamos expedientes clínicos guardados en tu carpeta de Google Drive. Puedes extraerlos para continuar trabajando desde este equipo.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setCurrentTab('drive_sync');
                  setDriveBackupNotice(null);
                }}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Abrir Nube Google Drive y Extraer
              </button>
              <button
                onClick={() => setDriveBackupNotice(null)}
                className="p-1.5 text-sky-700 hover:text-sky-950 font-bold cursor-pointer"
                title="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {currentTab === 'patients' && (
          <PatientList
            patients={patients}
            activePatient={activePatient}
            onSelectPatient={handleSelectPatient}
            onOpenNewPatientModal={handleOpenNewPatientModal}
            onEditPatient={handleEditPatient}
            onDeletePatient={handleDeletePatient}
            onNavigateToTab={setCurrentTab}
            isDriveConnected={Boolean(driveAccessToken)}
          />
        )}

        {currentTab === 'lifecycle' && activePatient && (
          <ClinicalLifecycleAssessmentView
            patient={activePatient}
            onUpdatePatient={handleUpdatePatient}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {currentTab === 'agenda' && (
          <AppointmentsCalendarView
            patients={patients}
            appointments={appointments}
            onUpdateAppointments={handleUpdateAppointments}
            onSelectPatientById={setActivePatientId}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'calculators' && activePatient && (
          <AdvancedClinicalCalculators
            patient={activePatient}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'anthropometry' && activePatient && (
          <AnthropometryView
            patient={activePatient}
            onUpdatePatient={handleUpdatePatient}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'metabolic' && activePatient && (
          <MetabolicCalculationsView
            patient={activePatient}
            onUpdatePatient={handleUpdatePatient}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {currentTab === 'menus' && activePatient && (
          <MenuGeneratorView
            patient={activePatient}
            onUpdatePatient={handleUpdatePatient}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {currentTab === 'enteral' && activePatient && (
          <EnteralNutritionView
            patient={activePatient}
            onUpdatePatient={handleUpdatePatient}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {currentTab === 'parenteral' && activePatient && (
          <ParenteralNutritionView
            patient={activePatient}
            onUpdatePatient={handleUpdatePatient}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {currentTab === 'prescription' && activePatient && (
          <MedicalPrescriptionView
            patient={activePatient}
            onUpdatePatient={handleUpdatePatient}
            onNavigateToTab={handleNavigateToTab}
            activeNutriologist={{
              name: currentUser.name,
              professionalLicense: currentUser.professionalLicense || 'Céd. Prof. 11995820',
            }}
          />
        )}

        {currentTab === 'labs' && activePatient && (
          <LabResultsView
            patient={activePatient}
            onUpdatePatient={handleUpdatePatient}
            onNavigateToTab={handleNavigateToTab}
            activeNutriologist={{
              name: currentUser.name,
              professionalLicense: currentUser.professionalLicense || 'Céd. Prof. 11995820',
            }}
          />
        )}

        {currentTab === 'print' && activePatient && (
          <PrintPatientPlan
            patient={activePatient}
            onNavigateBack={() => setCurrentTab('menus')}
            activeNutriologist={{
              name: currentUser.name,
              professionalLicense: currentUser.professionalLicense || 'Céd. Prof. 11995820',
            }}
            initialDocumentType={printInitialDocType as any}
          />
        )}

        {currentTab === 'admin_nutriologists' && (currentUser?.username?.toLowerCase() === 'alejandro' || currentUser?.role?.toLowerCase().includes('admin')) ? (
          <AdminNutriologistsView
            currentUser={currentUser}
            onSwitchUser={handleLoginSuccess}
          />
        ) : currentTab === 'admin_nutriologists' ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto my-12 space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              🔒
            </div>
            <h2 className="text-xl font-bold text-slate-900">Acceso Restringido al Panel de Nutriólogos</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              El Panel de Control de Nutriólogos es exclusivo del Administrador Maestro (Lic. Alejandro Aguilar). Los especialistas clínicos no tienen autorización para gestionar o dar de alta cuentas de personal.
            </p>
            <button
              onClick={() => setCurrentTab('patients')}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Volver al Directorio de Pacientes
            </button>
          </div>
        ) : null}

        {currentTab === 'express' && (
          <QuickExpressCalculator
            onTransferToNewPatient={handleTransferFromExpress}
          />
        )}

        {currentTab === 'drive_sync' && (
          <FileBackupSyncView
            patients={patients}
            activePatient={activePatient}
            appointments={appointments}
            clinicianName={currentUser.name}
            onImportPatients={handleImportPatients}
            onSelectPatient={handleSelectPatient}
            onNavigateToTab={setCurrentTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="print:hidden border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-700">NutriClinical Pro</span> · Software Clínico de Valoración y Planificación Nutricional
          </div>
          <div className="text-slate-400">
            Ajustes fisiopatológicos según Guías Clínicas (ADA, DASH, KDIGO, ESPEN)
          </div>
        </div>
      </footer>

      {/* Add / Edit Patient Modal */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSavePatient={handleSavePatient}
        patientToEdit={patientToEdit}
      />
    </div>
  );
}
