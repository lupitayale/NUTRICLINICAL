import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Users,
  Scale,
  Sparkles,
  Printer,
  Calculator,
  UserPlus,
  HeartPulse,
  LogOut,
  UserCheck,
  LayoutDashboard,
  Syringe,
  Zap,
  UserCog,
  Edit,
  ChevronDown,
  FileText,
  FlaskConical,
  Pill,
  CalendarDays,
  Cloud,
} from 'lucide-react';
import { Patient, ClinicalAppointment } from '../types/nutrition';
import { AuthUser } from '../App';
import { NutriologistProfileModal } from './NutriologistProfileModal';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  patients: Patient[];
  activePatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  appointments?: ClinicalAppointment[];
  onUpdateCurrentUser?: (user: AuthUser) => void;
  isDriveConnected?: boolean;
  driveEmail?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  patients,
  activePatient,
  onSelectPatient,
  onOpenNewPatientModal,
  currentUser,
  onLogout,
  appointments = [],
  onUpdateCurrentUser,
  isDriveConnected = false,
  driveEmail = null,
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModulesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isToday = (dateStr: string) => {
    const realToday = new Date().toISOString().split('T')[0];
    return dateStr === realToday || dateStr === '2026-10-26';
  };
  const isTomorrow = (dateStr: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const realTomorrow = tomorrow.toISOString().split('T')[0];
    return dateStr === realTomorrow || dateStr === '2026-10-27';
  };
  const upcomingCount = appointments.filter(
    (a) => (isToday(a.date) || isTomorrow(a.date)) && a.status !== 'cancelada'
  ).length;

  const isAdmin = currentUser?.username?.toLowerCase() === 'alejandro' || currentUser?.role?.toLowerCase().includes('admin');

  const allModules = [
    { id: 'patients', name: 'Directorio de Pacientes', icon: Users, color: 'text-blue-600' },
    { id: 'anthropometry', name: 'Valoración & Antropometría', icon: Scale, color: 'text-indigo-600' },
    { id: 'agenda', name: 'Agenda & Citas Clínicas', icon: CalendarDays, color: 'text-indigo-600' },
    { id: 'calculators', name: 'Calculadoras Clínicas Avanzadas', icon: Calculator, color: 'text-cyan-600' },
    { id: 'lifecycle', name: 'Evaluación Ciclo de Vida y Grupos', icon: Users, color: 'text-indigo-600' },
    { id: 'metabolic', name: 'Cálculo & Ajuste por Patología', icon: Activity, color: 'text-emerald-600' },
    { id: 'menus', name: 'Generador de Menús con IA', icon: Sparkles, color: 'text-teal-600' },
    { id: 'enteral', name: 'Nutrición Enteral', icon: Syringe, color: 'text-teal-500' },
    { id: 'parenteral', name: 'Nutrición Parenteral (NPT)', icon: Zap, color: 'text-purple-600' },
    { id: 'prescription', name: 'Prescripción Médica y Suplementos', icon: FileText, color: 'text-blue-500' },
    { id: 'labs', name: 'Laboratorios y Alteraciones', icon: FlaskConical, color: 'text-rose-500' },
    { id: 'print', name: 'Formato Imprimible del Plan', icon: Printer, color: 'text-slate-700' },
    { id: 'drive_sync', name: 'Nube Google Drive (Expedientes)', icon: Cloud, color: 'text-emerald-600' },
    ...(isAdmin ? [{ id: 'admin_nutriologists', name: 'Panel de Nutriólogos', icon: UserCog, color: 'text-teal-700' }] : []),
    { id: 'express', name: 'Calculadora Rápida', icon: Calculator, color: 'text-amber-600' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs print:hidden">
      {/* Top bar with branding, patient selector, user badge and logout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">NutriClinical</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">PRO</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Valoración Antropométrica & Prescripción Clínica Inteligente
              </p>
            </div>
          </div>

          {/* Active Patient Selector, New Patient Button & User Session */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 px-3">
              <span className="text-xs font-medium text-slate-500 hidden md:inline">Paciente:</span>
              <select
                value={activePatient?.id || ''}
                onChange={(e) => {
                  const selected = patients.find((p) => p.id === e.target.value);
                  if (selected) onSelectPatient(selected);
                }}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.age}a)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenNewPatientModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium transition shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Paciente</span>
            </button>

            <button
              onClick={() => setCurrentTab('drive_sync')}
              title={
                isDriveConnected
                  ? `Google Drive Conectado (${driveEmail || 'Activo'})`
                  : 'Conectar con Google Drive para guardar/extraer pacientes'
              }
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                isDriveConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-300 hover:text-teal-800'
              }`}
            >
              <Cloud className={`w-4 h-4 ${isDriveConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="hidden xl:inline">
                {isDriveConnected ? 'Drive Activo' : 'Google Drive'}
              </span>
            </button>

            {/* User Profile Badge & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div
                onClick={() => setIsProfileModalOpen(true)}
                title="Editar mis datos profesionales"
                className="hidden md:flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded-xl transition group"
              >
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-xs group-hover:border-teal-400">
                  {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AA'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition">
                    {currentUser?.name || 'Lic. Alejandro Aguilar'}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span>{currentUser?.role || 'Nutriólogo'}</span>
                    <span className="text-[9px] text-teal-600 underline">Editar perfil</span>
                  </div>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Cerrar Sesión Segura"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-semibold hidden xl:inline">Salir</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {currentUser && (
        <NutriologistProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateCurrentUser={(updated) => {
            if (onUpdateCurrentUser) onUpdateCurrentUser(updated);
          }}
        />
      )}

      {/* Main Navigation Tabs & Dropdown Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center justify-between">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar items-center">


          <button
            onClick={() => setCurrentTab('patients')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'patients'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pacientes</span>
          </button>

          <button
            onClick={() => setCurrentTab('anthropometry')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'anthropometry'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Antropometría</span>
          </button>

          <button
            onClick={() => setCurrentTab('metabolic')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'metabolic'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Patologías</span>
          </button>

          <button
            onClick={() => setCurrentTab('menus')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'menus'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-teal-700 bg-teal-50 hover:bg-teal-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Menús IA</span>
          </button>

          <button
            onClick={() => setCurrentTab('enteral')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'enteral'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Syringe className="w-4 h-4 text-teal-400" />
            <span>Enteral</span>
          </button>

          <button
            onClick={() => setCurrentTab('parenteral')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'parenteral'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Parenteral</span>
          </button>

          <button
            onClick={() => setCurrentTab('prescription')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'prescription'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Prescripción</span>
          </button>

          <button
            onClick={() => setCurrentTab('labs')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'labs'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-rose-400" />
            <span>Laboratorios</span>
          </button>

          <button
            onClick={() => setCurrentTab('print')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'print'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={() => setCurrentTab('drive_sync')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              currentTab === 'drive_sync'
                ? 'bg-emerald-700 text-white shadow-xs'
                : isDriveConnected
                ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Nube Drive</span>
          </button>
        </nav>

        {/* All Modules Dropdown Button */}
        <div className="relative shrink-0 pl-2" ref={dropdownRef}>
          <button
            onClick={() => setIsModulesOpen(!isModulesOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
          >
            <span>Todos los Módulos</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isModulesOpen ? 'rotate-180' : ''}`} />
          </button>

          {isModulesOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Módulos Clínicos Disponibles
                </div>
                <div className="text-[10px] text-slate-500">Seleccione cualquier sección</div>
              </div>
              <div className="max-h-96 overflow-y-auto py-1">
                {allModules.map((m) => {
                  const IconComp = m.icon;
                  const isActive = currentTab === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setCurrentTab(m.id);
                        setIsModulesOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium flex items-center gap-3 transition cursor-pointer ${
                        isActive
                          ? 'bg-teal-50 text-teal-900 font-bold border-l-4 border-teal-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 shrink-0 ${m.color}`} />
                      <span className="truncate">{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

