import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Pill,
  ChevronRight,
  User,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Patient, MedicalPrescription, SupplementItem } from '../types/nutrition';
import { PRESCRIPTION_TEMPLATES, PrescriptionTemplate } from '../utils/prescriptionTemplates';

interface MedicalPrescriptionViewProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigateToTab: (tab: string, docType?: string) => void;
  activeNutriologist?: { name: string; professionalLicense?: string } | null;
}

export const MedicalPrescriptionView: React.FC<MedicalPrescriptionViewProps> = ({
  patient,
  onUpdatePatient,
  onNavigateToTab,
  activeNutriologist,
}) => {
  const clinicianName = activeNutriologist?.name || 'Lic. Alejandro Aguilar';
  const clinicianLicense = activeNutriologist?.professionalLicense || 'Céd. Prof. 8492019';

  // Current active prescription or empty draft
  const currentPrescription =
    patient.activeMedicalPrescription ||
    (patient.medicalPrescriptions && patient.medicalPrescriptions.length > 0
      ? patient.medicalPrescriptions[0]
      : null);

  const [prescriptionTitle, setPrescriptionTitle] = useState(
    currentPrescription?.title || 'Prescripción de Suplementación & Soporte Nutracéutico'
  );
  const [prescriptionDate, setPrescriptionDate] = useState(
    currentPrescription?.date || new Date().toISOString().split('T')[0]
  );
  const [nextReviewDate, setNextReviewDate] = useState(
    currentPrescription?.nextReviewDate || ''
  );
  const [hydrationLiters, setHydrationLiters] = useState(
    currentPrescription?.hydrationRecommendationLiters || 2.5
  );

  const [supplements, setSupplements] = useState<SupplementItem[]>(
    currentPrescription?.supplements || []
  );

  const [dietaryIndications, setDietaryIndications] = useState<string[]>(
    currentPrescription?.dietaryIndications || [
      'Mantener consumo regular de agua natural a lo largo de todo el día.',
      'Separar la toma de suplementos minerales 2 horas del consumo de café, té verde o lácteos.',
      'Evitar suspender o modificar dosis de medicamentos preexistentes sin autorización médica.',
    ]
  );

  const [clinicalObservations, setClinicalObservations] = useState<string[]>(
    currentPrescription?.clinicalObservations || [
      'Monitorear tolerancia digestiva durante los primeros 5 días.',
      'Reportar cualquier síntoma atípico a su nutriólogo tratante.',
    ]
  );

  // New item drafting inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemDosage, setNewItemDosage] = useState('');
  const [newItemForm, setNewItemForm] = useState<SupplementItem['form']>('cápsulas');
  const [newItemFrequency, setNewItemFrequency] = useState('Cada 24 horas');
  const [newItemTiming, setNewItemTiming] = useState<SupplementItem['timing']>('con_alimentos');
  const [newItemDuration, setNewItemDuration] = useState('60 días');
  const [newItemPurpose, setNewItemPurpose] = useState('');

  // UI state
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newIndicationInput, setNewIndicationInput] = useState('');
  const [newObservationInput, setNewObservationInput] = useState('');

  // Load a predefined template
  const handleApplyTemplate = (template: PrescriptionTemplate) => {
    setPrescriptionTitle(template.title);
    setHydrationLiters(template.hydrationLiters);
    setDietaryIndications([...template.dietaryIndications]);
    setClinicalObservations([...template.clinicalObservations]);

    const generatedSupplements: SupplementItem[] = template.supplements.map((s, idx) => ({
      ...s,
      id: `supp-${Date.now()}-${idx}`,
    }));
    setSupplements(generatedSupplements);
    setIsTemplateModalOpen(false);
  };

  // Add individual supplement to table
  const handleAddSupplement = () => {
    if (!newItemName.trim() || !newItemDosage.trim()) {
      alert('Por favor ingresa el nombre y la dosis del suplemento.');
      return;
    }

    const newItem: SupplementItem = {
      id: `supp-${Date.now()}`,
      name: newItemName.trim(),
      dosage: newItemDosage.trim(),
      form: newItemForm,
      frequency: newItemFrequency.trim(),
      timing: newItemTiming,
      duration: newItemDuration.trim(),
      purpose: newItemPurpose.trim() || 'Soporte nutricional específico',
    };

    setSupplements((prev) => [...prev, newItem]);
    // Reset form
    setNewItemName('');
    setNewItemDosage('');
    setNewItemPurpose('');
  };

  const handleRemoveSupplement = (id: string) => {
    setSupplements((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddIndication = () => {
    if (!newIndicationInput.trim()) return;
    setDietaryIndications((prev) => [...prev, newIndicationInput.trim()]);
    setNewIndicationInput('');
  };

  const handleRemoveIndication = (index: number) => {
    setDietaryIndications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddObservation = () => {
    if (!newObservationInput.trim()) return;
    setClinicalObservations((prev) => [...prev, newObservationInput.trim()]);
    setNewObservationInput('');
  };

  const handleRemoveObservation = (index: number) => {
    setClinicalObservations((prev) => prev.filter((_, i) => i !== index));
  };

  // Save prescription to patient record
  const handleSavePrescription = () => {
    const folioNumber = `RX-${patient.id.slice(-4).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newPrescription: MedicalPrescription = {
      id: currentPrescription?.id || `presc-${Date.now()}`,
      patientId: patient.id,
      folio: currentPrescription?.folio || folioNumber,
      date: prescriptionDate,
      nutriologistName: clinicianName,
      professionalLicense: clinicianLicense,
      title: prescriptionTitle,
      supplements,
      dietaryIndications,
      clinicalObservations,
      hydrationRecommendationLiters: hydrationLiters,
      nextReviewDate: nextReviewDate || undefined,
      signatureDate: prescriptionDate,
      isActive: true,
    };

    const existingHistory = patient.medicalPrescriptions || [];
    const updatedHistory = [
      newPrescription,
      ...existingHistory.filter((p) => p.id !== newPrescription.id),
    ];

    const updatedPatient: Patient = {
      ...patient,
      activeMedicalPrescription: newPrescription,
      medicalPrescriptions: updatedHistory,
      updatedAt: new Date().toISOString(),
    };

    onUpdatePatient(updatedPatient);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const timingLabels: Record<SupplementItem['timing'], string> = {
    con_alimentos: 'Con alimentos principales',
    en_ayunas: 'En ayunas (al despertar)',
    antes_dormir: '30-45 min antes de dormir',
    pre_entreno: '30 min antes de entrenar',
    post_entreno: 'Inmediatamente post-entreno',
    con_comida_grasa: 'Con comida rica en grasas saludables',
    personalizado: 'Horario especial',
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Ribbon */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Prescripción Médica & Receta de Suplementación
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Redacción, dosificación y exportación clínica de micronutrientes, nutracéuticos e indicaciones dietéticas para{' '}
              <strong className="text-slate-800">{patient.fullName}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Cargar Protocolo Clínico</span>
            </button>

            <button
              onClick={handleSavePrescription}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar en Expediente</span>
            </button>

            <button
              onClick={() => {
                handleSavePrescription();
                onNavigateToTab('print', 'prescription');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span>Imprimir Receta (Rx)</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              ¡Receta médica guardada correctamente en el expediente del paciente! Lista para imprimir o consultar.
            </span>
          </div>
        )}
      </div>

      {/* Main Prescription Drafting Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prescription Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prescription Header Parameters */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Datos de la Receta Médica
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Título de la Prescripción
                </label>
                <input
                  type="text"
                  value={prescriptionTitle}
                  onChange={(e) => setPrescriptionTitle(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-slate-50/50"
                  placeholder="Ej. Soporte Glucémico & Antioxidante"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Fecha de Emisión
                </label>
                <input
                  type="date"
                  value={prescriptionDate}
                  onChange={(e) => setPrescriptionDate(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nutriólogo Prescriptor
                </label>
                <div className="text-xs font-bold text-slate-800 p-2 bg-slate-100/70 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span>{clinicianName}</span>
                  <span className="text-[11px] font-mono text-teal-700">{clinicianLicense}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Próxima Fecha de Revisión / Control
                </label>
                <input
                  type="date"
                  value={nextReviewDate}
                  onChange={(e) => setNextReviewDate(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Supplements Table & Items */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>Suplementos & Micronutrientes Prescritos ({supplements.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Formulación personalizada, dosificación exacta y horario específico.
                </p>
              </div>

              {supplements.length > 0 && (
                <button
                  onClick={() => setSupplements([])}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Vaciar lista
                </button>
              )}
            </div>

            {supplements.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                <Pill className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">
                  Aún no has agregado ningún suplemento a esta receta.
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Agrega suplementos manualmente con el formulario de abajo o haz clic en "Cargar Protocolo Clínico" para autocompletar según patología.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Suplemento / Fórmula</th>
                      <th className="py-2.5 px-3">Dosis & Presentación</th>
                      <th className="py-2.5 px-3">Horario & Frecuencia</th>
                      <th className="py-2.5 px-3">Duración</th>
                      <th className="py-2.5 px-3">Objetivo Clínico</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplements.map((supp) => (
                      <tr key={supp.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{supp.name}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-teal-800 block">{supp.dosage}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{supp.form}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800 block">{supp.frequency}</span>
                          <span className="text-[10px] text-slate-500">
                            {timingLabels[supp.timing] || supp.timing}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-700">{supp.duration}</span>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <span className="text-slate-600 text-[11px] line-clamp-2">
                            {supp.purpose}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleRemoveSupplement(supp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Eliminar de la receta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quick Add Form Tile */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                + Agregar Nuevo Suplemento a la Receta
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nombre del Suplemento / Activo
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Ej. Citrato de Magnesio, Omega 3, Creatina, Vitamina D3"
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Dosis Exacta
                  </label>
                  <input
                    type="text"
                    value={newItemDosage}
                    onChange={(e) => setNewItemDosage(e.target.value)}
                    placeholder="Ej. 400 mg, 5 g, 2000 UI"
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Presentación
                  </label>
                  <select
                    value={newItemForm}
                    onChange={(e) => setNewItemForm(e.target.value as SupplementItem['form'])}
                    className="w-full text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white cursor-pointer"
                  >
                    <option value="cápsulas">Cápsulas</option>
                    <option value="comprimidos">Comprimidos</option>
                    <option value="polvo">Polvo</option>
                    <option value="gotas">Gotas</option>
                    <option value="sobres">Sobres</option>
                    <option value="líquido">Líquido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Frecuencia
                  </label>
                  <input
                    type="text"
                    value={newItemFrequency}
                    onChange={(e) => setNewItemFrequency(e.target.value)}
                    placeholder="Ej. Cada 24 horas, 2 veces al día"
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Momento / Horario
                  </label>
                  <select
                    value={newItemTiming}
                    onChange={(e) => setNewItemTiming(e.target.value as SupplementItem['timing'])}
                    className="w-full text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white cursor-pointer"
                  >
                    <option value="con_alimentos">Con alimentos</option>
                    <option value="en_ayunas">En ayunas</option>
                    <option value="antes_dormir">Antes de dormir</option>
                    <option value="pre_entreno">Pre-entreno</option>
                    <option value="post_entreno">Post-entreno</option>
                    <option value="con_comida_grasa">Con comida grasa</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={newItemDuration}
                    onChange={(e) => setNewItemDuration(e.target.value)}
                    placeholder="Ej. 60 días, 3 meses"
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Indicación / Justificación Clínica
                </label>
                <input
                  type="text"
                  value={newItemPurpose}
                  onChange={(e) => setNewItemPurpose(e.target.value)}
                  placeholder="Ej. Mejora de la sensibilidad a la insulina y relajación nocturna"
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                />
              </div>

              <div className="text-right pt-1">
                <button
                  type="button"
                  onClick={handleAddSupplement}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-teal-400" />
                  <span>Insertar en Receta</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dietary Indications & Guidelines */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Indicaciones Dietéticas & Precauciones Especiales
            </h3>

            {/* Hydration target */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Meta Diaria de Hidratación (Agua Natural)
                </span>
                <span className="text-[11px] text-slate-500">
                  Fundamental para absorción entérica y eliminación renal de subproductos.
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={hydrationLiters}
                  onChange={(e) => setHydrationLiters(parseFloat(e.target.value) || 2.5)}
                  className="w-18 text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200 text-center bg-white"
                />
                <span className="text-xs font-bold text-slate-700">Litros</span>
              </div>
            </div>

            {/* List of dietary directives */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Puntos Clave del Tratamiento:
              </span>
              <ul className="space-y-1.5">
                {dietaryIndications.map((ind, idx) => (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50/70 text-xs text-slate-700 border border-slate-100"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                      <span>{ind}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveIndication(idx)}
                      className="text-slate-400 hover:text-rose-600 transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newIndicationInput}
                  onChange={(e) => setNewIndicationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIndication()}
                  placeholder="Añadir indicación dietética específica..."
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                />
                <button
                  onClick={handleAddIndication}
                  className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Prescription Live Preview & History */}
        <div className="space-y-6">
          {/* Prescription Document Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                  Prescripción Nutricional
                </span>
                <span className="text-base font-bold text-white">Resumen de la Receta</span>
              </div>
              <span className="text-2xl font-serif text-teal-400">℞</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Paciente:</span>
                <span className="font-bold text-white text-right">{patient.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Fecha:</span>
                <span className="font-semibold text-slate-200">{prescriptionDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Suplementos:</span>
                <span className="font-bold text-teal-400">{supplements.length} ítems</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Agua recomendada:</span>
                <span className="font-semibold text-slate-200">{hydrationLiters} L / día</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Prescriptor:</span>
                <span className="text-right text-slate-200 font-semibold">{clinicianName}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  handleSavePrescription();
                  onNavigateToTab('print', 'prescription');
                }}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Vista Previa & Imprimir Receta</span>
              </button>
            </div>
          </div>

          {/* Previous Prescriptions History */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Historial de Recetas del Paciente</span>
            </h4>

            {(!patient.medicalPrescriptions || patient.medicalPrescriptions.length === 0) ? (
              <p className="text-xs text-slate-500 italic">
                No hay recetas previas guardadas en este expediente.
              </p>
            ) : (
              <div className="space-y-2">
                {patient.medicalPrescriptions.map((prevPresc) => (
                  <div
                    key={prevPresc.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-teal-500/50 bg-slate-50/50 hover:bg-teal-50/20 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{prevPresc.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{prevPresc.date}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>{prevPresc.supplements.length} suplementos</span>
                      <span className="font-mono text-teal-700">{prevPresc.folio}</span>
                    </div>
                    <button
                      onClick={() => {
                        setPrescriptionTitle(prevPresc.title);
                        setPrescriptionDate(prevPresc.date);
                        setSupplements([...prevPresc.supplements]);
                        setDietaryIndications([...prevPresc.dietaryIndications]);
                        setClinicalObservations([...prevPresc.clinicalObservations]);
                        setHydrationLiters(prevPresc.hydrationRecommendationLiters);
                      }}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Cargar esta receta al editor</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Templates Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Protocolos Clínicos de Suplementación
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecciona una plantilla basada en evidencia científica para cargar automáticamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PRESCRIPTION_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-teal-800 transition">
                      {tmpl.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tmpl.badgeColor}`}>
                      {tmpl.pathologyCategory}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{tmpl.description}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {tmpl.supplements.length} suplementos incluidos:
                    </span>
                    {tmpl.supplements.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
