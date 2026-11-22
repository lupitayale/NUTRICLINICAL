import React from 'react';
import { Trash2, Check, Sparkles } from 'lucide-react';
import { MenuPlan } from '../types/nutrition';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlans: MenuPlan[];
  onSelect: (plan: MenuPlan) => void;
  onDelete: (planId: string) => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  savedPlans,
  onSelect,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Opciones de Menú Guardadas
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">Cerrar</button>
        </div>

        <div className="space-y-3">
          {savedPlans.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No hay opciones de menú guardadas aún.</p>
          ) : (
            savedPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                <div>
                  <div className="font-bold text-slate-900">{plan.title}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(plan.createdAt).toLocaleDateString()} · {plan.daysCount} días · {plan.targetCalories} kcal
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelect(plan)}
                    className="px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer"
                  >
                    Seleccionar
                  </button>
                  <button
                    onClick={() => onDelete(plan.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
