import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Edit2,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  Award,
  Search,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Nutriologist } from '../types/nutrition';
import {
  getStoredNutriologists,
  saveNutriologistsList,
} from '../utils/authNutriologists';
import { AuthUser } from '../App';

interface AdminNutriologistsViewProps {
  currentUser: AuthUser;
  onSwitchUser: (newUser: AuthUser) => void;
}

export const AdminNutriologistsView: React.FC<AdminNutriologistsViewProps> = ({
  currentUser,
  onSwitchUser,
}) => {
  const [nutriologists, setNutriologists] = useState<Nutriologist[]>(() =>
    getStoredNutriologists()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNutriologist, setEditingNutriologist] = useState<Nutriologist | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    professionalLicense: '',
    specialty: '',
    email: '',
    phone: '',
    role: 'clinical_nutriologist' as 'admin' | 'clinical_nutriologist',
    notes: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const triggerStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleOpenNewModal = () => {
    setEditingNutriologist(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      professionalLicense: '',
      specialty: 'Nutrición Clínica & Dietoterapia',
      email: '',
      phone: '',
      role: 'clinical_nutriologist',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (nutri: Nutriologist) => {
    setEditingNutriologist(nutri);
    setFormData({
      name: nutri.name,
      username: nutri.username,
      password: nutri.password || '',
      professionalLicense: nutri.professionalLicense,
      specialty: nutri.specialty,
      email: nutri.email,
      phone: nutri.phone,
      role: nutri.role,
      notes: nutri.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveNutriologist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      alert('Por favor completa el nombre, usuario y contraseña.');
      return;
    }

    const cleanUsername = formData.username.trim().toLowerCase();

    // Check duplicate username if new
    if (
      !editingNutriologist &&
      nutriologists.some((n) => n.username.toLowerCase() === cleanUsername)
    ) {
      alert('El nombre de usuario ya está registrado en la clínica. Elige otro.');
      return;
    }

    // Avatar initials
    const words = formData.name.trim().split(' ');
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : words[0].slice(0, 2).toUpperCase();

    let updatedList: Nutriologist[];

    if (editingNutriologist) {
      updatedList = nutriologists.map((n) => {
        if (n.id === editingNutriologist.id) {
          return {
            ...n,
            name: formData.name.trim(),
            username: cleanUsername,
            password: formData.password.trim(),
            professionalLicense: formData.professionalLicense.trim() || 'Céd. Pendiente',
            specialty: formData.specialty.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            role: formData.role,
            notes: formData.notes.trim(),
            avatarInitials: initials,
          };
        }
        return n;
      });
      triggerStatus('¡Datos del especialista actualizados correctamente!');
    } else {
      const newNutriologist: Nutriologist = {
        id: `nutri-${Date.now()}`,
        name: formData.name.trim(),
        username: cleanUsername,
        password: formData.password.trim(),
        professionalLicense: formData.professionalLicense.trim() || 'Céd. Profesional',
        specialty: formData.specialty.trim() || 'Nutrición Clínica',
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        isActive: true,
        avatarInitials: initials,
        notes: formData.notes.trim(),
        createdAt: new Date().toISOString(),
      };
      updatedList = [newNutriologist, ...nutriologists];
      triggerStatus(`¡Nutriólogo ${newNutriologist.name} agregado al sistema clínico!`);
    }

    setNutriologists(updatedList);
    saveNutriologistsList(updatedList);
    setIsModalOpen(false);
  };

  const handleDeleteNutriologist = (nutri: Nutriologist) => {
    if (nutri.username.toLowerCase() === 'alejandro') {
      alert('El usuario "alejandro" es el Administrador Maestro del sistema clínico y no puede ser eliminado bajo ninguna circunstancia.');
      return;
    }

    if (nutri.username === currentUser.username) {
      alert('No puedes eliminar al usuario con la sesión activa actual.');
      return;
    }

    if (nutriologists.length <= 1) {
      alert('Debe existir al menos un especialista registrado en la clínica.');
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente a "${nutri.name}" (${nutri.professionalLicense}) del centro de nutrición?`
    );

    if (confirmDelete) {
      const updatedList = nutriologists.filter((n) => n.id !== nutri.id);
      setNutriologists(updatedList);
      saveNutriologistsList(updatedList);
      triggerStatus(`Se eliminó a ${nutri.name} del directorio.`);
    }
  };

  const handleToggleStatus = (nutri: Nutriologist) => {
    if (nutri.username.toLowerCase() === 'alejandro') {
      alert('El Administrador Maestro "alejandro" no puede ser desactivado.');
      return;
    }

    if (nutri.username === currentUser.username) {
      alert('No puedes desactivar tu propio usuario activo.');
      return;
    }

    const updatedList = nutriologists.map((n) =>
      n.id === nutri.id ? { ...n, isActive: !n.isActive } : n
    );
    setNutriologists(updatedList);
    saveNutriologistsList(updatedList);
    triggerStatus(
      `Estado de ${nutri.name} cambiado a ${!nutri.isActive ? 'Activo' : 'Inactivo'}`
    );
  };

  const handleSwitchSessionTo = (nutri: Nutriologist) => {
    if (nutri.username === currentUser.username) return;
    onSwitchUser({
      username: nutri.username,
      name: nutri.name,
      role: nutri.role === 'admin' ? 'Administrador Clínico' : 'Nutriólogo Clínico',
    });
    triggerStatus(`Sesión clínica cambiada a: ${nutri.name}`);
  };

  const filteredNutriologists = nutriologists.filter((n) => {
    const q = searchTerm.toLowerCase();
    return (
      n.name.toLowerCase().includes(q) ||
      n.username.toLowerCase().includes(q) ||
      n.professionalLicense.toLowerCase().includes(q) ||
      n.specialty.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    Panel de Administración de Nutriólogos
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
                    Equipo Clínico
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestiona las cuentas, cédulas profesionales, roles y credenciales de acceso de los especialistas.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Agregar Nuevo Nutriólogo</span>
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, usuario, cédula o especialidad..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold self-end sm:self-auto">
          Total especialistas: <span className="font-extrabold text-slate-800">{nutriologists.length}</span> · Activos:{' '}
          <span className="font-extrabold text-teal-700">
            {nutriologists.filter((n) => n.isActive).length}
          </span>
        </div>
      </div>

      {/* Nutriologists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNutriologists.map((nutri) => {
          const isCurrent = nutri.username === currentUser.username;
          return (
            <div
              key={nutri.id}
              className={`bg-white rounded-2xl border transition p-5 flex flex-col justify-between shadow-2xs ${
                isCurrent
                  ? 'border-teal-500 ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header card with Avatar and Role badge */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-teal-400 font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {nutri.avatarInitials}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {nutri.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          @{nutri.username}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                            Sesión Activa
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      nutri.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {nutri.role === 'admin' ? 'Administrador' : 'Especialista'}
                  </span>
                </div>

                {/* Professional Details */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-semibold text-slate-800">{nutri.professionalLicense}</span>
                  </div>

                  <div className="text-[11px] text-slate-600 font-medium">
                    {nutri.specialty}
                  </div>

                  {nutri.email && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{nutri.email}</span>
                    </div>
                  )}

                  {nutri.phone && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{nutri.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Contraseña: <b className="font-mono text-slate-700">{nutri.password || 'aguilar1'}</b></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(nutri)}
                    title="Editar datos del nutriólogo"
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {!isCurrent && (
                    <button
                      onClick={() => handleDeleteNutriologist(nutri)}
                      title="Eliminar nutriólogo de la clínica"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {!isCurrent ? (
                  <button
                    onClick={() => handleSwitchSessionTo(nutri)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Iniciar Como Este Usuario</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400">
                    Conectado actualmente
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Nutriologist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingNutriologist ? 'Editar Datos del Especialista' : 'Registrar Nuevo Nutriólogo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNutriologist} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Nombre Completo con Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej. Lic. Mariana Torres, Mtro. Carlos Vega"
                  className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Usuario de Acceso *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="mariana.t"
                    className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full text-xs font-medium p-2.5 pr-8 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Cédula Profesional *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.professionalLicense}
                    onChange={(e) => setFormData({ ...formData, professionalLicense: e.target.value })}
                    placeholder="Céd. Prof. 9182746"
                    className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Rol en la Clínica
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as 'admin' | 'clinical_nutriologist',
                      })
                    }
                    className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="clinical_nutriologist">Nutriólogo Clínico</option>
                    <option value="admin">Administrador Clínico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Especialidad / Área de Enfoque
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="ej. Nutrición Renal, Diabetes, Soporte Enteral/Parenteral, Deportiva"
                  className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mariana@clinica.mx"
                    className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+52 55 1234-5678"
                    className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingNutriologist ? 'Actualizar Datos' : 'Guardar Nutriólogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
