import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Sparkles,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Scale,
  ShieldCheck,
  ChevronRight,
  UserPlus,
  HeartPulse,
  Flame,
  Check,
  Bell,
  BellRing,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Patient, ClinicalAppointment, PatientActivity, PathologyType } from '../types/nutrition';
import { PATHOLOGY_INFO } from '../utils/nutritionCalculations';

interface DashboardViewProps {
  patients: Patient[];
  activePatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenNewPatientModal: () => void;
  appointments: ClinicalAppointment[];
  onUpdateAppointments: (appointments: ClinicalAppointment[]) => void;
  activities: PatientActivity[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  activePatient,
  onSelectPatient,
  onNavigateToTab,
  onOpenNewPatientModal,
  appointments,
  onUpdateAppointments,
  activities,
}) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);

  // Notification system state
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'today' | 'tomorrow' | 'pending'>('all');
  const [isAlertPanelCollapsed, setIsAlertPanelCollapsed] = useState(false);
  const [dismissedAptIds, setDismissedAptIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nutriclinical_dismissed_alerts_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Date identification logic (supports real system date & clinical simulation dates)
  const isAppointmentToday = (aptDate: string) => {
    const realToday = new Date().toISOString().split('T')[0];
    return aptDate === realToday || aptDate === '2026-10-26';
  };

  const isAppointmentTomorrow = (aptDate: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const realTomorrow = tomorrow.toISOString().split('T')[0];
    return aptDate === realTomorrow || aptDate === '2026-10-27';
  };

  // Notification calculations
  const todayUpcomingAppointments = appointments.filter(
    (apt) => isAppointmentToday(apt.date) && apt.status !== 'cancelada'
  );
  const tomorrowUpcomingAppointments = appointments.filter(
    (apt) => isAppointmentTomorrow(apt.date) && apt.status !== 'cancelada'
  );

  const allAlertAppointments = [...todayUpcomingAppointments, ...tomorrowUpcomingAppointments];
  const activeAlerts = allAlertAppointments.filter((apt) => !dismissedAptIds.includes(apt.id));

  const displayedAlerts = activeAlerts.filter((apt) => {
    if (notificationFilter === 'today') return isAppointmentToday(apt.date);
    if (notificationFilter === 'tomorrow') return isAppointmentTomorrow(apt.date);
    if (notificationFilter === 'pending') return apt.status === 'pendiente';
    return true;
  });

  const todayCount = todayUpcomingAppointments.length;
  const tomorrowCount = tomorrowUpcomingAppointments.length;
  const pendingCount = allAlertAppointments.filter((a) => a.status === 'pendiente').length;

  const handleDismissAlert = (aptId: string) => {
    const updated = [...dismissedAptIds, aptId];
    setDismissedAptIds(updated);
    try {
      localStorage.setItem('nutriclinical_dismissed_alerts_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRestoreDismissedAlerts = () => {
    setDismissedAptIds([]);
    try {
      localStorage.removeItem('nutriclinical_dismissed_alerts_v1');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSetAppointmentStatus = (appointmentId: string, newStatus: ClinicalAppointment['status']) => {
    const updated = appointments.map((apt) => {
      if (apt.id === appointmentId) {
        return { ...apt, status: newStatus };
      }
      return apt;
    });
    onUpdateAppointments(updated);
  };

  // New appointment form state
  const [aptPatientId, setAptPatientId] = useState(patients[0]?.id || '');
  const [aptDate, setAptDate] = useState('2026-10-26');
  const [aptTime, setAptTime] = useState('10:00 AM');
  const [aptType, setAptType] = useState<ClinicalAppointment['type']>('seguimiento');
  const [aptNotes, setAptNotes] = useState('');

  // High-level Calculations
  const totalActivePatients = patients.length;
  const patientsWithPathologies = patients.filter((p) => p.pathologies.length > 0).length;
  const patientsWithMenus = patients.filter((p) => Boolean(p.activeMenuPlan)).length;
  const totalConsultations = patients.reduce((acc, p) => acc + p.consultations.length, 0);

  // Pathologies distribution in clinic
  const pathologyCounts: Record<string, number> = {};
  patients.forEach((p) => {
    p.pathologies.forEach((pathology) => {
      pathologyCounts[pathology] = (pathologyCounts[pathology] || 0) + 1;
    });
  });

  const sortedPathologies = Object.entries(pathologyCounts).sort((a, b) => b[1] - a[1]);

  // Appointment filtering in agenda
  const filteredAppointments = appointments.filter((apt) => {
    if (selectedDayFilter === 'all') return true;
    if (selectedDayFilter === 'today') return isAppointmentToday(apt.date);
    if (selectedDayFilter === 'tomorrow') return isAppointmentTomorrow(apt.date);
    return true;
  });

  const handleToggleAppointmentStatus = (appointmentId: string) => {
    const updated = appointments.map((apt) => {
      if (apt.id === appointmentId) {
        const nextStatus: ClinicalAppointment['status'] =
          apt.status === 'confirmada'
            ? 'completada'
            : apt.status === 'completada'
            ? 'pendiente'
            : 'confirmada';
        return { ...apt, status: nextStatus };
      }
      return apt;
    });
    onUpdateAppointments(updated);
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find((p) => p.id === aptPatientId);
    if (!patientObj) return;

    const newApt: ClinicalAppointment = {
      id: `apt-${Date.now()}`,
      patientId: aptPatientId,
      patientName: patientObj.fullName,
      date: aptDate,
      time: aptTime,
      type: aptType,
      status: 'confirmada',
      notes: aptNotes.trim(),
    };

    onUpdateAppointments([newApt, ...appointments]);
    setIsNewAppointmentModalOpen(false);
    setAptNotes('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Welcome Clinical Executive Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold text-xs border border-teal-500/30">
                Panel Clínico Profesional
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300">
                Semana del 26 al 31 de Octubre, 2026
              </span>
              {todayCount + tomorrowCount > 0 && (
                <>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                    <BellRing className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>{todayCount} hoy · {tomorrowCount} mañana</span>
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bienvenido, Lic. Alejandro Aguilar
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tienes <b className="text-teal-400">{appointments.filter(a => a.status !== 'completada').length} consultas programadas</b> para esta semana y <b className="text-teal-400">{totalActivePatients} pacientes activos</b> con seguimiento antropométrico y planes dietéticos ajustados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNewPatientModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Paciente</span>
            </button>

            <button
              onClick={() => setIsNewAppointmentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Cita</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Notification Center: Upcoming Appointments for Today & Tomorrow */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Banner Top Bar */}
        <div className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b transition ${
          pendingCount > 0 ? 'bg-amber-50/70 border-amber-200/80' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
              todayCount > 0
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : tomorrowCount > 0
                ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                : 'bg-slate-200 text-slate-600 border-slate-300'
            }`}>
              {todayCount > 0 ? (
                <BellRing className="w-5 h-5 animate-bounce" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Notificaciones de Citas Próximas
                </h2>
                {todayCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    {todayCount} para hoy
                  </span>
                )}
                {tomorrowCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300">
                    {tomorrowCount} para mañana
                  </span>
                )}
                {pendingCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                    {pendingCount} sin confirmar
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {activeAlerts.length > 0
                  ? `Monitoreo en tiempo real de pacientes citados para hoy (${todayCount}) y mañana (${tomorrowCount}).`
                  : 'No tienes citas pendientes para hoy ni mañana en la agenda.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200 text-xs font-semibold shadow-2xs">
              <button
                onClick={() => setNotificationFilter('all')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  notificationFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({activeAlerts.length})
              </button>
              <button
                onClick={() => setNotificationFilter('today')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  notificationFilter === 'today'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hoy ({todayUpcomingAppointments.filter(a => !dismissedAptIds.includes(a.id)).length})
              </button>
              <button
                onClick={() => setNotificationFilter('tomorrow')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  notificationFilter === 'tomorrow'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mañana ({tomorrowUpcomingAppointments.filter(a => !dismissedAptIds.includes(a.id)).length})
              </button>
              {pendingCount > 0 && (
                <button
                  onClick={() => setNotificationFilter('pending')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    notificationFilter === 'pending'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pendientes ({activeAlerts.filter(a => a.status === 'pendiente').length})
                </button>
              )}
            </div>

            {/* Restore dismissed alerts if any */}
            {dismissedAptIds.length > 0 && (
              <button
                onClick={handleRestoreDismissedAlerts}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-dashed border-slate-300 cursor-pointer"
                title="Restaurar alertas descartadas"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restaurar ({dismissedAptIds.length})</span>
              </button>
            )}

            {/* Collapse toggle */}
            <button
              onClick={() => setIsAlertPanelCollapsed(!isAlertPanelCollapsed)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 transition cursor-pointer"
              title={isAlertPanelCollapsed ? 'Expandir notificaciones' : 'Minimizar notificaciones'}
            >
              {isAlertPanelCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Notification Cards Body */}
        {!isAlertPanelCollapsed && (
          <div className="p-4 sm:p-5">
            {displayedAlerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedAlerts.map((apt) => {
                  const patientObj = patients.find((p) => p.id === apt.patientId);
                  const isToday = isAppointmentToday(apt.date);

                  return (
                    <div
                      key={apt.id}
                      className={`relative rounded-xl p-4 border transition flex flex-col justify-between group shadow-2xs ${
                        isToday
                          ? 'bg-amber-50/40 border-amber-200/90 hover:border-amber-300'
                          : 'bg-sky-50/30 border-sky-200/80 hover:border-sky-300'
                      }`}
                    >
                      {/* Card Header: Timing Badge & Dismiss */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isToday ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-2xs">
                              <Clock className="w-3.5 h-3.5" />
                              <span>HOY · {apt.time}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-600 text-white shadow-2xs">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>MAÑANA · {apt.time}</span>
                            </span>
                          )}

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              apt.status === 'confirmada'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : apt.status === 'completada'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            {apt.status === 'confirmada'
                              ? 'Confirmada'
                              : apt.status === 'completada'
                              ? 'Completada'
                              : 'Por Confirmar'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDismissAlert(apt.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-white/80 transition cursor-pointer"
                          title="Descartar esta notificación"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Card Content: Patient & Consultation type */}
                      <div className="mt-3 space-y-1.5">
                        <h4
                          onClick={() => {
                            if (patientObj) {
                              onSelectPatient(patientObj);
                              onNavigateToTab('anthropometry');
                            }
                          }}
                          className="text-sm font-black text-slate-900 hover:text-teal-700 cursor-pointer transition leading-snug line-clamp-1"
                          title="Clic para abrir expediente"
                        >
                          {apt.patientName}
                        </h4>

                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">
                            {apt.type === 'seguimiento'
                              ? 'Consulta de Seguimiento'
                              : apt.type === 'primera_vez'
                              ? 'Primera Vez / Valoración'
                              : apt.type === 'entrega_menu'
                              ? 'Entrega y Explicación de Menú'
                              : 'Control Bioquímico'}
                          </span>
                        </div>

                        {apt.notes && (
                          <p className="text-xs text-slate-500 italic bg-white/70 p-2 rounded-lg border border-slate-200/60 line-clamp-2">
                            "{apt.notes}"
                          </p>
                        )}

                        {patientObj && patientObj.pathologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {patientObj.pathologies.slice(0, 2).map((pathology) => (
                              <span
                                key={pathology}
                                className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white text-slate-700 border border-slate-200"
                              >
                                {PATHOLOGY_INFO[pathology]?.name.split(' (')[0]}
                              </span>
                            ))}
                            {patientObj.pathologies.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{patientObj.pathologies.length - 2} más
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Actions Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                        {/* Status Change CTA */}
                        {apt.status === 'pendiente' ? (
                          <button
                            onClick={() => handleSetAppointmentStatus(apt.id, 'confirmada')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar Cita</span>
                          </button>
                        ) : apt.status === 'confirmada' ? (
                          <button
                            onClick={() => handleSetAppointmentStatus(apt.id, 'completada')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition cursor-pointer"
                            title="Marcar consulta como completada"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Marcar Atendida</span>
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            Atendida
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          {patientObj && (
                            <>
                              <button
                                onClick={() => {
                                  onSelectPatient(patientObj);
                                  onNavigateToTab('menus');
                                }}
                                className="p-1.5 text-teal-800 hover:bg-teal-100/70 rounded-lg transition cursor-pointer"
                                title="Ver o diseñar menú nutricional"
                              >
                                <Sparkles className="w-4 h-4 text-teal-700" />
                              </button>

                              <button
                                onClick={() => {
                                  onSelectPatient(patientObj);
                                  onNavigateToTab('anthropometry');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 rounded-lg transition cursor-pointer"
                              >
                                <span>Expediente</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {dismissedAptIds.length > 0 && activeAlerts.length === 0
                    ? 'Has descartado las alertas de hoy y mañana'
                    : '¡Agenda al día! Sin citas pendientes para hoy o mañana'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {dismissedAptIds.length > 0 && activeAlerts.length === 0
                    ? 'Puedes restaurar las notificaciones cuando desees o revisar la agenda semanal completa más abajo.'
                    : 'Aprovecha este tiempo para diseñar menús clínicos, evaluar expedientes o agendar nuevas consultas.'}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {dismissedAptIds.length > 0 && (
                    <button
                      onClick={handleRestoreDismissedAlerts}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                    >
                      Restaurar Alertas Ocultas
                    </button>
                  )}
                  <button
                    onClick={() => setIsNewAppointmentModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-2xs transition cursor-pointer"
                  >
                    + Agendar Nueva Cita
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. High-Level KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pacientes Activos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Pacientes Activos</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-3xl font-black text-slate-900">{totalActivePatients}</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Con patología clínica:</span>
            <span className="font-bold text-teal-800">{patientsWithPathologies} ({Math.round((patientsWithPathologies / Math.max(1, totalActivePatients)) * 100)}%)</span>
          </div>
        </div>

        {/* KPI 2: Citas de la Semana */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Citas de la Semana</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 text-3xl font-black text-slate-900">{appointments.length}</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Confirmadas:</span>
            <span className="font-bold text-emerald-700">
              {appointments.filter((a) => a.status === 'confirmada').length} citas
            </span>
          </div>
        </div>

        {/* KPI 3: Menús Clínicos Activos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Menús Diseñados</span>
              <Sparkles className="w-4 h-4 text-teal-600" />
            </div>
            <div className="mt-2 text-3xl font-black text-teal-800">{patientsWithMenus}</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Cobertura de pacientes:</span>
            <span className="font-bold text-teal-900">
              {Math.round((patientsWithMenus / Math.max(1, totalActivePatients)) * 100)}%
            </span>
          </div>
        </div>

        {/* KPI 4: Consultas de Seguimiento */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Visitas Registradas</span>
              <Scale className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-3xl font-black text-slate-900">{totalConsultations}</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Evolución promedio:</span>
            <span className="font-bold text-emerald-700">-2.3 kg / paciente</span>
          </div>
        </div>
      </div>

      {/* 4. Main Dashboard Columns: Upcoming Appointments & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Appointments (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span>Agenda de Citas de la Semana</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consultas programadas, revisiones bioquímicas y entregas de planes dietéticos
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setSelectedDayFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      selectedDayFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todas ({appointments.length})
                  </button>
                  <button
                    onClick={() => setSelectedDayFilter('today')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      selectedDayFilter === 'today'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hoy ({todayCount})
                  </button>
                  <button
                    onClick={() => setSelectedDayFilter('tomorrow')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      selectedDayFilter === 'tomorrow'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mañana ({tomorrowCount})
                  </button>
                </div>

                <button
                  onClick={() => setIsNewAppointmentModalOpen(true)}
                  className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg transition cursor-pointer border border-teal-200"
                  title="Agendar nueva cita"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Appointments List */}
            <div className="divide-y divide-slate-100">
              {filteredAppointments.map((apt) => {
                const patientObj = patients.find((p) => p.id === apt.patientId);

                return (
                  <div
                    key={apt.id}
                    className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Time badge */}
                      <div className="bg-slate-100 text-slate-800 rounded-xl p-2.5 text-center min-w-[70px] border border-slate-200 shrink-0">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          {apt.date.slice(-5)}
                        </div>
                        <div className="text-xs font-black text-slate-900">{apt.time}</div>
                      </div>

                      {/* Patient & Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {apt.patientName}
                          </h4>
                          <span
                            onClick={() => handleToggleAppointmentStatus(apt.id)}
                            className={`cursor-pointer text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                              apt.status === 'confirmada'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : apt.status === 'completada'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                            title="Haz clic para cambiar estado"
                          >
                            {apt.status === 'confirmada'
                              ? 'Confirmada'
                              : apt.status === 'completada'
                              ? 'Completada'
                              : 'Pendiente'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-0.5">
                          Tipo: <span className="font-semibold text-slate-700 capitalize">{apt.type.replace('_', ' ')}</span>
                          {apt.notes && <span> · {apt.notes}</span>}
                        </div>

                        {/* Patient Pathologies Mini Tags */}
                        {patientObj && patientObj.pathologies.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {patientObj.pathologies.map((p) => (
                              <span
                                key={p}
                                className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600"
                              >
                                {PATHOLOGY_INFO[p]?.name.split(' (')[0]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {patientObj && (
                        <button
                          onClick={() => {
                            onSelectPatient(patientObj);
                            onNavigateToTab('anthropometry');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <span>Expediente</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredAppointments.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No hay citas programadas para el filtro seleccionado.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => setIsNewAppointmentModalOpen(true)}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              + Agendar Nueva Cita para esta Semana
            </button>
          </div>
        </div>

        {/* Right Column: Recent Activities (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  <span>Actividad Clínica Reciente</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Historial de cambios y consultas
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {activities.map((act) => {
                const targetPatient = patients.find((p) => p.id === act.patientId);

                return (
                  <div
                    key={act.id}
                    onClick={() => {
                      if (targetPatient) {
                        onSelectPatient(targetPatient);
                        if (act.type === 'menu_generated') onNavigateToTab('menus');
                        else onNavigateToTab('anthropometry');
                      }
                    }}
                    className="p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-teal-900 line-clamp-1">
                        {act.patientName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800 mt-1 flex items-center justify-between">
                      <span>{act.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 transition" />
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                      {act.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateToTab('patients')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Ver Directorio Completo ({patients.length} pacientes)
            </button>
          </div>
        </div>
      </div>

      {/* 4. Pathologies Breakdown & Clinical Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pathological Distribution Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Distribución de Patologías Tratadas</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prevalencia de condiciones clínicas activas en tu consulta nutricional
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
              {sortedPathologies.length} Patologías
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {sortedPathologies.map(([pathologyKey, count]) => {
              const info = PATHOLOGY_INFO[pathologyKey as PathologyType];
              const percentage = Math.round((count / Math.max(1, totalActivePatients)) * 100);

              return (
                <div key={pathologyKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{info?.name || pathologyKey}</span>
                    <span className="text-slate-500">{count} paciente(s) · {percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-teal-600 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Alerts & Recommendations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>Alertas y Prioridades Clínicas</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Seguimiento de metas terapéuticas y requerimientos pendientes
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Activas
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900">Control Renal Pendiente: </span>
                <span className="text-amber-800">
                  Lic. Sofía Mendoza requiere revisión de analítica de fósforo y TFG estimada en su próxima cita de mañana.
                </span>
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-900">Adherencia Sobresaliente: </span>
                <span className="text-teal-800">
                  Carlos Andrés Morales ha reducido exitosamente su glucemia a 114 mg/dL con normalización de cifras tensionales.
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-900">Generador con IA disponible: </span>
                <span className="text-blue-800">
                  Puedes estructurar y generar planes dietéticos semanales con ingredientes precisos del SMAE en un solo clic.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {isNewAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Agendar Cita en Consultorio</h3>
              <button
                onClick={() => setIsNewAppointmentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Paciente *</label>
                <select
                  required
                  value={aptPatientId}
                  onChange={(e) => setAptPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.age} años)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hora *</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Consulta *</label>
                <select
                  value={aptType}
                  onChange={(e) => setAptType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="seguimiento">Seguimiento Antropométrico</option>
                  <option value="primera_vez">Primera Vez / Valoración Inicial</option>
                  <option value="entrega_menu">Entrega y Explicación de Menú</option>
                  <option value="control_bioquimico">Revisión de Laboratorios Bioquímicos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas / Motivo</label>
                <textarea
                  rows={2}
                  value={aptNotes}
                  onChange={(e) => setAptNotes(e.target.value)}
                  placeholder="Observaciones de la cita..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewAppointmentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition cursor-pointer"
                >
                  Agendar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
