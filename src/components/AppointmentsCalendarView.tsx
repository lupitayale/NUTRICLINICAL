import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  FileText,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import { Patient, ClinicalAppointment } from '../types/nutrition';

interface AppointmentsCalendarViewProps {
  patients: Patient[];
  appointments: ClinicalAppointment[];
  onUpdateAppointments: (newAppointments: ClinicalAppointment[]) => void;
  onSelectPatientById: (patientId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const AppointmentsCalendarView: React.FC<AppointmentsCalendarViewProps> = ({
  patients,
  appointments,
  onUpdateAppointments,
  onSelectPatientById,
  onNavigateToTab,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [assistantEmail, setAssistantEmail] = useState('alexlokito@gmail.com');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [type, setType] = useState<'primera_vez' | 'seguimiento' | 'entrega_menu' | 'control_bioquimico'>('seguimiento');
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId);
    if (!pat) {
      alert('Selecciona un paciente válido.');
      return;
    }

    const newApt: ClinicalAppointment = {
      id: `apt-${Date.now()}`,
      patientId: pat.id,
      patientName: pat.fullName,
      date,
      time,
      type,
      status: 'confirmada',
      notes: notes.trim(),
    };

    onUpdateAppointments([newApt, ...appointments]);
    setIsModalOpen(false);
    setNotes('');
  };

  const handleToggleStatus = (aptId: string, newStatus: ClinicalAppointment['status']) => {
    const updated = appointments.map((a) => (a.id === aptId ? { ...a, status: newStatus } : a));
    onUpdateAppointments(updated);
  };

  const handleDeleteApt = (aptId: string) => {
    if (confirm('¿Deseas eliminar esta cita de la agenda?')) {
      onUpdateAppointments(appointments.filter((a) => a.id !== aptId));
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Agenda & Citas Clínicas Nutricionales
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
                Control de Consultas
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Organiza consultas de primera vez, seguimientos, entregas de menús y controles bioquímicos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAssistantModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
            >
              <span>🤖 Asistente Médico (Correo)</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Nueva Cita</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Todas las Citas' },
          { id: 'confirmada', label: 'Confirmadas' },
          { id: 'completada', label: 'Completadas' },
          { id: 'cancelada', label: 'Canceladas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3 relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      apt.type === 'primera_vez'
                        ? 'bg-blue-100 text-blue-900'
                        : apt.type === 'seguimiento'
                        ? 'bg-teal-100 text-teal-900'
                        : apt.type === 'entrega_menu'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-purple-100 text-purple-900'
                    }`}
                  >
                    {apt.type === 'primera_vez'
                      ? 'Primera Vez'
                      : apt.type === 'seguimiento'
                      ? 'Seguimiento'
                      : apt.type === 'entrega_menu'
                      ? 'Entrega de Menú'
                      : 'Control Bioquímico'}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      apt.status === 'confirmada'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : apt.status === 'completada'
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div>
                  <h3
                    onClick={() => {
                      onSelectPatientById(apt.patientId);
                      onNavigateToTab('anthropometry');
                    }}
                    className="font-extrabold text-slate-900 text-base hover:text-teal-700 cursor-pointer transition"
                  >
                    {apt.patientName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {apt.time}
                    </span>
                  </div>
                </div>

                {apt.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {apt.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => {
                      const text = `Hola ${apt.patientName}, le recordamos su cita nutricional programada para el día ${apt.date} a las ${apt.time}. Centro NutriClinical Pro.`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition cursor-pointer inline-flex items-center gap-1"
                    title="Enviar recordatorio por WhatsApp"
                  >
                    <span>💬 WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      const subject = encodeURIComponent('Recordatorio de Cita Nutricional - NutriClinical Pro');
                      const body = encodeURIComponent(`Estimado/a ${apt.patientName},\n\nLe recordamos su próxima cita nutricional en NutriClinical Pro programada para:\n- Fecha: ${apt.date}\n- Hora: ${apt.time}\n- Tipo: ${apt.type}\n\nAtentamente,\nNutriClinical Pro`);
                      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                    }}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-lg transition cursor-pointer inline-flex items-center gap-1"
                    title="Enviar recordatorio por Correo Electrónico"
                  >
                    <span>✉️ Correo</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {apt.status !== 'completada' && (
                    <button
                      onClick={() => handleToggleStatus(apt.id, 'completada')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition cursor-pointer"
                      title="Marcar como Completada"
                    >
                      Completar
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteApt(apt.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Eliminar Cita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">No hay citas registradas en esta vista</div>
            <p className="text-xs text-slate-400 mt-1">Programa una nueva consulta con el botón superior.</p>
          </div>
        )}
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Agendar Nueva Cita Nutricional</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Seleccionar Paciente</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
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
                  <label className="font-bold text-slate-700 uppercase block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Hora</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Ej. 10:30 AM"
                    className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Tipo de Consulta</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                >
                  <option value="primera_vez">Primera Vez & Valoración Inicial</option>
                  <option value="seguimiento">Consulta de Seguimiento</option>
                  <option value="entrega_menu">Entrega y Explicación de Menú</option>
                  <option value="control_bioquimico">Control Bioquímico & Laboratorios</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Notas u Observaciones (Opcional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instrucciones especiales para la cita..."
                  className="w-full font-medium border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm"
                >
                  Guardar Cita en Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asistente Médico Virtual Email Modal */}
      {isAssistantModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h3 className="text-base font-bold text-slate-900">Asistente Médico Virtual (Correo)</h3>
              </div>
              <button
                onClick={() => setIsAssistantModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Tu asistente médico virtual recopilará todas tus citas confirmadas y seguimientos pendientes para enviarte un reporte completo directamente a tu correo electrónico sin necesidad de entrar a la plataforma.
              </p>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Correo de Destino del Nutriólogo</label>
                <input
                  type="email"
                  value={assistantEmail}
                  onChange={(e) => setAssistantEmail(e.target.value)}
                  className="w-full font-semibold border border-slate-300 rounded-xl p-2.5 bg-white text-slate-900"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-950">
                <b>Citas pendientes a incluir:</b> {appointments.filter(a => a.status === 'confirmada').length} citas confirmadas en tu agenda.
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssistantModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const pendingApts = appointments.filter((a) => a.status === 'confirmada');
                    const subject = encodeURIComponent('🤖 Asistente Médico - Reporte de Citas Pendientes & Seguimientos');
                    let bodyText = `Estimado Dr. / Lic. Asistente Médico de NutriClinical Pro,\n\nA continuación el reporte automatizado de sus próximas citas y seguimientos pendientes:\n\n`;
                    pendingApts.forEach((a, i) => {
                      bodyText += `${i + 1}. Paciente: ${a.patientName}\n   - Fecha: ${a.date} a las ${a.time}\n   - Tipo: ${a.type}\n   - Notas: ${a.notes || 'Ninguna'}\n\n`;
                    });
                    bodyText += `Atentamente,\nSu Asistente Médico Virtual - NutriClinical Pro`;

                    window.open(`mailto:${assistantEmail}?subject=${subject}&body=${encodeURIComponent(bodyText)}`, '_blank');
                    setIsAssistantModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition cursor-pointer shadow-sm"
                >
                  Enviar Reporte a mi Correo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
