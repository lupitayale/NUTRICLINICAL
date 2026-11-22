import React, { useState } from 'react';
import { User, Award, Mail, Phone, Lock, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { Nutriologist } from '../types/nutrition';
import { getStoredNutriologists, saveNutriologistsList } from '../utils/authNutriologists';
import { AuthUser } from '../App';

interface NutriologistProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onUpdateCurrentUser: (updatedUser: AuthUser) => void;
}

export const NutriologistProfileModal: React.FC<NutriologistProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser,
}) => {
  if (!isOpen) return null;

  const nutriologists = getStoredNutriologists();
  const currentNutri = nutriologists.find(
    (n) => n.username.toLowerCase() === currentUser.username.toLowerCase()
  ) || {
    id: 'current-default',
    username: currentUser.username,
    name: currentUser.name,
    professionalLicense: currentUser.professionalLicense || 'Céd. Prof. 8492019',
    specialty: 'Nutrición Clínica & Dietoterapia',
    email: 'especialista@nutriclinical.mx',
    phone: '+52 55 0000 0000',
    role: currentUser.role.includes('Admin') ? 'admin' : 'clinical_nutriologist',
    isActive: true,
    avatarInitials: 'AA',
    password: 'aguilar1',
  };

  const [name, setName] = useState(currentNutri.name);
  const [professionalLicense, setProfessionalLicense] = useState(currentNutri.professionalLicense);
  const [specialty, setSpecialty] = useState(currentNutri.specialty || '');
  const [email, setEmail] = useState(currentNutri.email || '');
  const [phone, setPhone] = useState(currentNutri.phone || '');
  const [password, setPassword] = useState(currentNutri.password || 'aguilar1');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !professionalLicense.trim()) {
      alert('El nombre y la cédula profesional son obligatorios.');
      return;
    }

    const updatedList = nutriologists.map((n) => {
      if (
        n.username.toLowerCase() === currentNutri.username.toLowerCase() ||
        n.id === currentNutri.id
      ) {
        return {
          ...n,
          name: name.trim(),
          professionalLicense: professionalLicense.trim(),
          specialty: specialty.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password.trim(),
        };
      }
      return n;
    });

    // If not found in list, push new
    if (!updatedList.some((n) => n.username.toLowerCase() === currentNutri.username.toLowerCase())) {
      updatedList.push({
        id: `nutri-${Date.now()}`,
        username: currentUser.username,
        name: name.trim(),
        professionalLicense: professionalLicense.trim(),
        specialty: specialty.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: currentUser.role.includes('Admin') ? 'admin' : 'clinical_nutriologist',
        isActive: true,
        avatarInitials: 'NC',
        createdAt: new Date().toISOString(),
        password: password.trim(),
      });
    }

    saveNutriologistsList(updatedList);

    onUpdateCurrentUser({
      username: currentUser.username,
      name: name.trim(),
      role: currentUser.role,
      professionalLicense: professionalLicense.trim(),
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Mis Datos Profesionales</h3>
              <p className="text-[11px] text-slate-500">Modifica tu nombre, cédula y credenciales de receta</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>¡Datos de especialista actualizados con éxito!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Nombre Completo con Título *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lic. Alejandro Aguilar"
                className="w-full text-xs font-medium pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Cédula Profesional (Aparece en Recetas e Impresiones) *
            </label>
            <div className="relative">
              <Award className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={professionalLicense}
                onChange={(e) => setProfessionalLicense(e.target.value)}
                placeholder="Céd. Prof. 8492019"
                className="w-full text-xs font-medium pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Especialidad / Área Clínica
            </label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Nutrición Clínica & Dietoterapia"
              className="w-full text-xs font-medium px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@clinica.mx"
                  className="w-full text-xs font-medium pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 55 ..."
                  className="w-full text-xs font-medium pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="aguilar1"
                className="w-full text-xs font-medium pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
