import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, AlertCircle, Plus, Trash2, Search } from 'lucide-react';
import { Patient, PathologyType, NutritionGoal, Gender } from '../types/nutrition';
import { PATHOLOGY_INFO, PATHOLOGY_CATEGORIES, calculateBMI, calculateIdealWeights, buildClinicalMacroPrescription } from '../utils/nutritionCalculations';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePatient: (patient: Patient) => void;
  patientToEdit?: Patient | null;
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSavePatient,
  patientToEdit,
}) => {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState<Gender>('male');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [occupation, setOccupation] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [pathologies, setPathologies] = useState<PathologyType[]>([]);
  const [selectedPathologyCategory, setSelectedPathologyCategory] = useState<string>('all');
  const [pathologySearch, setPathologySearch] = useState<string>('');

  const filteredPathologyKeys = useMemo(() => {
    return (Object.keys(PATHOLOGY_INFO) as PathologyType[]).filter((key) => {
      const info = PATHOLOGY_INFO[key];
      const matchesSearch =
        pathologySearch.trim() === '' ||
        info.name.toLowerCase().includes(pathologySearch.toLowerCase()) ||
        info.clinicalFocus.toLowerCase().includes(pathologySearch.toLowerCase()) ||
        info.shortDescription.toLowerCase().includes(pathologySearch.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedPathologyCategory === 'all') return true;
      const group = PATHOLOGY_CATEGORIES.find((g) => g.id === selectedPathologyCategory);
      return group ? group.pathologies.includes(key) : true;
    });
  }, [selectedPathologyCategory, pathologySearch]);
  const [targetGoal, setTargetGoal] = useState<NutritionGoal>('fat_loss');
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4 | 5>(5);

  // Initial measurements for new patient
  const [initialWeight, setInitialWeight] = useState(75);
  const [initialHeight, setInitialHeight] = useState(170);

  // Allergies & dislikes
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikeInput, setDislikeInput] = useState('');
  const [foodDislikes, setFoodDislikes] = useState<string[]>([]);
  const [favoriteInput, setFavoriteInput] = useState('');
  const [foodFavorites, setFoodFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (patientToEdit) {
      setFullName(patientToEdit.fullName);
      setBirthDate(patientToEdit.birthDate);
      setAge(patientToEdit.age);
      setGender(patientToEdit.gender);
      setEmail(patientToEdit.email);
      setPhone(patientToEdit.phone);
      setOccupation(patientToEdit.occupation);
      setReasonForVisit(patientToEdit.reasonForVisit);
      setPathologies(patientToEdit.pathologies);
      setTargetGoal(patientToEdit.targetGoal);
      setMealsPerDay(patientToEdit.mealsPerDay);
      setAllergies(patientToEdit.allergies || []);
      setFoodDislikes(patientToEdit.foodDislikes || []);
      setFoodFavorites(patientToEdit.foodFavorites || []);

      const latestConsult = patientToEdit.consultations[patientToEdit.consultations.length - 1];
      if (latestConsult) {
        setInitialWeight(latestConsult.weightKg);
        setInitialHeight(latestConsult.heightCm);
      }
    } else {
      // Reset defaults
      setFullName('');
      setBirthDate('1988-06-15');
      setAge(38);
      setGender('male');
      setEmail('');
      setPhone('');
      setOccupation('');
      setReasonForVisit('Valoración inicial y reeducación alimentaria.');
      setPathologies([]);
      setTargetGoal('fat_loss');
      setMealsPerDay(5);
      setInitialWeight(78);
      setInitialHeight(172);
      setAllergies([]);
      setFoodDislikes([]);
      setFoodFavorites([]);
    }
  }, [patientToEdit, isOpen]);

  if (!isOpen) return null;

  const togglePathology = (pathology: PathologyType) => {
    if (pathologies.includes(pathology)) {
      setPathologies(pathologies.filter((p) => p !== pathology));
    } else {
      setPathologies([...pathologies, pathology]);
    }
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const handleAddDislike = () => {
    if (dislikeInput.trim() && !foodDislikes.includes(dislikeInput.trim())) {
      setFoodDislikes([...foodDislikes, dislikeInput.trim()]);
      setDislikeInput('');
    }
  };

  const handleAddFavorite = () => {
    if (favoriteInput.trim() && !foodFavorites.includes(favoriteInput.trim())) {
      setFoodFavorites([...foodFavorites, favoriteInput.trim()]);
      setFavoriteInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const patientId = patientToEdit ? patientToEdit.id : `pat-${Date.now()}`;
    const weight = Number(initialWeight) || 70;
    const height = Number(initialHeight) || 170;

    // Build prescription
    const prescription = buildClinicalMacroPrescription(
      weight,
      height,
      age,
      gender,
      pathologies,
      targetGoal
    );

    // Initial consultation if new
    let consultations = patientToEdit?.consultations ? [...patientToEdit.consultations] : [];
    if (consultations.length === 0) {
      const bmiData = calculateBMI(weight, height);
      const idealData = calculateIdealWeights(height, weight, gender);
      consultations = [
        {
          id: `c-${Date.now()}`,
          patientId,
          date: new Date().toISOString().split('T')[0],
          weightKg: weight,
          heightCm: height,
          bmi: bmiData.bmi,
          bmiClassification: bmiData.classification,
          bmiStatusClass: bmiData.statusClass,
          idealWeightHamwi: idealData.idealWeightHamwi,
          idealWeightMetropolitan: idealData.idealWeightMetropolitan,
          adjustedWeightKg: idealData.adjustedWeightKg,
          consultationNotes: 'Consulta de ingreso y valoración antropométrica inicial.',
        },
      ];
    }

    const savedPatient: Patient = {
      id: patientId,
      fullName: fullName.trim(),
      birthDate,
      age: Number(age),
      gender,
      email: email.trim(),
      phone: phone.trim(),
      occupation: occupation.trim(),
      reasonForVisit: reasonForVisit.trim(),
      pathologies,
      targetGoal,
      allergies,
      foodDislikes,
      foodFavorites,
      mealsPerDay,
      activePrescription: prescription,
      consultations,
      activeMenuPlan: patientToEdit?.activeMenuPlan,
      createdAt: patientToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSavePatient(savedPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {patientToEdit ? 'Editar Expediente del Paciente' : 'Alta de Nuevo Paciente'}
            </h3>
            <p className="text-xs text-slate-500">
              Datos demográficos, patologías diagnosticadas y objetivos nutricionales
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Demographics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3">
              1. Datos Generales del Paciente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Carlos Andrés Morales Ortiz"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo Biológico *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      gender === 'male'
                        ? 'bg-teal-50 border-teal-600 text-teal-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Masculino
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      gender === 'female'
                        ? 'bg-teal-50 border-teal-600 text-teal-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Femenino
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Edad (años) *</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ocupación</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Ej. Gerente de oficina"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 ..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paciente@correo.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Initial Measurements (Weight & Height) */}
          {!patientToEdit && (
            <div className="p-4 bg-teal-50/50 border border-teal-200/60 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2">
                Mediciones Antropométricas Iniciales
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Peso Inicial (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={initialWeight}
                    onChange={(e) => setInitialWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estatura / Talla (cm) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="100"
                    max="230"
                    value={initialHeight}
                    onChange={(e) => setInitialHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div className="col-span-2 flex items-center pt-5 text-xs text-slate-600">
                  <AlertCircle className="w-4 h-4 text-teal-700 mr-1.5 shrink-0" />
                  <span>
                    El IMC inicial y gasto calórico se configurarán automáticamente y podrás registrar consultas subsecuentes con historial completo.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Pathologies (Ajuste Fisiopatológico) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                2. Patologías Diagnosticadas (Motor Fisiopatológico)
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {pathologies.length} seleccionada(s)
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Selecciona o busca las condiciones clínicas del paciente. El sistema recalcula automáticamente los límites y restricciones.
            </p>

            {/* Pathology Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={pathologySearch}
                  onChange={(e) => setPathologySearch(e.target.value)}
                  placeholder="Buscar condición clínica o rara (ej. Lupus, Wilson, ELA, Fibrosis Quística)..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
              <select
                value={selectedPathologyCategory}
                onChange={(e) => setSelectedPathologyCategory(e.target.value)}
                className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="all">Todas ({Object.keys(PATHOLOGY_INFO).length})</option>
                {PATHOLOGY_CATEGORIES.map((cat) => {
                  const countActive = cat.pathologies.filter((p) => pathologies.includes(p)).length;
                  return (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.pathologies.length}) {countActive > 0 ? `· ${countActive} activa(s)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredPathologyKeys.map((key) => {
                const info = PATHOLOGY_INFO[key];
                const isSelected = pathologies.includes(key);
                return (
                  <div
                    key={key}
                    onClick={() => togglePathology(key)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition ${
                        isSelected
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{info.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{info.clinicalFocus}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Goals and Meals per day */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3">
              3. Objetivo y Distribución de Comidas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Objetivo Terapéutico</label>
                <select
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value as NutritionGoal)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="fat_loss">Pérdida de Grasa Corporal (Déficit -500 kcal)</option>
                  <option value="glycemic_control">Control Glucémico e Insulínico (Diabetes)</option>
                  <option value="renal_protection">Protección Renal (Normocalórica / Baja carga ácida)</option>
                  <option value="cardiovascular_dash">Protocolo Cardiovascular / Hipertensión DASH</option>
                  <option value="maintenance">Mantenimiento y Salud Metabólica</option>
                  <option value="muscle_gain">Hipertrofia / Ganancia Muscular (+300 kcal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tiempos de Comida al Día</label>
                <div className="flex gap-2">
                  {[3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMealsPerDay(num as 3 | 4 | 5)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                        mealsPerDay === num
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {num} Comidas
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo de Consulta / Notas</label>
                <textarea
                  rows={2}
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  placeholder="Detalles clínicos o antecedentes relevantes..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Food preferences, Allergies & Dislikes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3">
              4. Alergias y Preferencias Alimentarias (Para Menús Sin Batallar)
            </h4>
            <div className="space-y-3">
              {/* Allergies */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alergias o Intolerancias</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAllergy();
                      }
                    }}
                    placeholder="Ej. Mariscos, Lácteos, Gluten..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allergies.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => setAllergies(allergies.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-800 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {allergies.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Sin alergias registradas</span>
                  )}
                </div>
              </div>

              {/* Food Dislikes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alimentos Rechazados / Que le desagradan</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={dislikeInput}
                    onChange={(e) => setDislikeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDislike();
                      }
                    }}
                    placeholder="Ej. Hígado, Sardinas, Brócoli..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddDislike}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {foodDislikes.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => setFoodDislikes(foodDislikes.filter((_, i) => i !== idx))}
                        className="text-amber-600 hover:text-amber-900 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {foodDislikes.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Sin alimentos rechazados</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition cursor-pointer"
            >
              {patientToEdit ? 'Guardar Cambios' : 'Registrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
