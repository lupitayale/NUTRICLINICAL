import React, { useState } from 'react';
import {
  X,
  History,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Search,
  Sparkles,
  Calendar,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Patient } from '../types/nutrition';
import { extractPatientDishHistory } from '../utils/menuVarietyEngine';

interface PatientDishHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onClearHistory: () => void;
}

export const PatientDishHistoryModal: React.FC<PatientDishHistoryModalProps> = ({
  isOpen,
  onClose,
  patient,
  onClearHistory,
}) => {
  const [search, setSearch] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');

  if (!isOpen) return null;

  const historyEntries = patient.mealHistory30Days || [];
  const extractedDishNames = extractPatientDishHistory(patient, 30);

  const filteredEntries = historyEntries.filter((item) => {
    const matchesSearch =
      search.trim() === '' ||
      item.mealName.toLowerCase().includes(search.toLowerCase()) ||
      (item.planTitle && item.planTitle.toLowerCase().includes(search.toLowerCase()));

    const matchesType =
      selectedMealType === 'all' || item.type === selectedMealType;

    return matchesSearch && matchesType;
  });

  const mealTypeLabels: Record<string, string> = {
    desayuno: 'Desayuno',
    colacion_1: 'Colación 1',
    comida: 'Comida Principal',
    colacion_2: 'Colación 2',
    cena: 'Cena Ligera',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Historial Anti-Repetición (30 Días)
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Activo
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Platillos registrados para {patient.fullName} · El motor de IA excluye estos platillos para evitar monotonía
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-teal-50/30 border-b border-teal-100/50 text-center">
          <div className="p-2.5 bg-white rounded-xl border border-teal-100 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Platillos Únicos Mes</span>
            <span className="text-xl font-extrabold text-teal-900">{extractedDishNames.length}</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-teal-100 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Días de Cobertura</span>
            <span className="text-xl font-extrabold text-slate-800">30 Días</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-teal-100 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Garantía Variedad</span>
            <span className="text-xl font-extrabold text-emerald-700">100% Único</span>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar platillo por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <select
            value={selectedMealType}
            onChange={(e) => setSelectedMealType(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="all">Todos los tiempos</option>
            <option value="desayuno">Desayunos</option>
            <option value="comida">Comidas</option>
            <option value="cena">Cenas</option>
            <option value="colacion_1">Colaciones 1</option>
            <option value="colacion_2">Colaciones 2</option>
          </select>
        </div>

        {/* Dishes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {search ? 'No se encontraron platillos con esa búsqueda' : 'No hay platillos en el historial aún'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Al generar menús para {patient.fullName}, cada platillo se guardará aquí automáticamente para no repetirlo en 30 días.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredEntries.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{item.mealName}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {mealTypeLabels[item.type] || item.type}
                        </span>
                        <span>Registrado: {item.date}</span>
                        {item.planTitle && <span>· {item.planTitle}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Protegido (No repetir)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reiniciar ciclo mensual de este paciente</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
