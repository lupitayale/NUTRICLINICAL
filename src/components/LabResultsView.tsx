import React, { useState, useMemo } from 'react';
import {
  Activity,
  Plus,
  Save,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  FileSpreadsheet,
  Info,
  ChevronRight,
  Filter,
  Trash2,
} from 'lucide-react';
import { Patient, LabRecord, LabMarkerCategory } from '../types/nutrition';
import {
  LAB_MARKERS,
  LAB_CATEGORIES,
  evaluateMarkerValue,
  analyzeFullLabPanel,
  calculateHomaIr,
  calculateCkdEpiEgfr,
} from '../utils/labCalculations';

interface LabResultsViewProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigateToTab: (tab: string, docType?: string) => void;
  activeNutriologist?: { name: string; professionalLicense?: string } | null;
}

export const LabResultsView: React.FC<LabResultsViewProps> = ({
  patient,
  onUpdatePatient,
  onNavigateToTab,
}) => {
  const existingLabs = patient.labRecords || [];
  const latestLab = existingLabs.length > 0 ? existingLabs[0] : null;

  // Active lab panel being edited or viewed
  const [selectedLabId, setSelectedLabId] = useState<string>(
    latestLab ? latestLab.id : 'new'
  );

  const activeRecord = useMemo(() => {
    return existingLabs.find((l) => l.id === selectedLabId) || null;
  }, [existingLabs, selectedLabId]);

  // Form states
  const [labDate, setLabDate] = useState<string>(
    activeRecord?.date || new Date().toISOString().split('T')[0]
  );
  const [laboratoryName, setLaboratoryName] = useState<string>(
    activeRecord?.laboratoryName || 'Laboratorio Clínico Central'
  );
  const [fastingHours, setFastingHours] = useState<number>(
    activeRecord?.fastingHours || 12
  );
  const [labNotes, setLabNotes] = useState<string>(activeRecord?.notes || '');

  // Marker values dictionary
  const [markerValues, setMarkerValues] = useState<Record<string, number>>(() => {
    return activeRecord ? { ...activeRecord.values } : {};
  });

  // Category filter
  const [activeCategory, setActiveCategory] = useState<LabMarkerCategory | 'all'>('all');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync when switching between saved lab panels
  const handleSelectRecord = (record: LabRecord) => {
    setSelectedLabId(record.id);
    setLabDate(record.date);
    setLaboratoryName(record.laboratoryName || '');
    setFastingHours(record.fastingHours || 12);
    setLabNotes(record.notes || '');
    setMarkerValues({ ...record.values });
  };

  const handleCreateNewPanel = () => {
    setSelectedLabId('new');
    setLabDate(new Date().toISOString().split('T')[0]);
    setLaboratoryName('Laboratorio Clínico');
    setFastingHours(12);
    setLabNotes('');
    setMarkerValues({});
  };

  const handleValueChange = (markerId: string, rawVal: string) => {
    const num = parseFloat(rawVal);
    setMarkerValues((prev) => {
      const next = { ...prev };
      if (isNaN(num) || rawVal === '') {
        delete next[markerId];
      } else {
        next[markerId] = num;
      }
      return next;
    });
  };

  // Live clinical analysis
  const panelAnalysis = useMemo(() => {
    return analyzeFullLabPanel(markerValues, patient.gender, patient.age);
  }, [markerValues, patient.gender, patient.age]);

  // Live HOMA-IR calculation if glucose and insulin entered
  const liveHomaIr = useMemo(() => {
    if (markerValues.glucose && markerValues.fasting_insulin) {
      return calculateHomaIr(markerValues.glucose, markerValues.fasting_insulin);
    }
    return null;
  }, [markerValues.glucose, markerValues.fasting_insulin]);

  // Live eGFR calculation if creatinine entered
  const liveEgfr = useMemo(() => {
    if (markerValues.creatinine) {
      return calculateCkdEpiEgfr(markerValues.creatinine, patient.age, patient.gender);
    }
    return null;
  }, [markerValues.creatinine, patient.age, patient.gender]);

  // Filtered markers list
  const filteredMarkers = useMemo(() => {
    if (activeCategory === 'all') return LAB_MARKERS;
    return LAB_MARKERS.filter((m) => m.category === activeCategory);
  }, [activeCategory]);

  // Save current panel
  const handleSavePanel = () => {
    const labRecordId = selectedLabId === 'new' ? `lab-${Date.now()}` : selectedLabId;

    const newLabRecord: LabRecord = {
      id: labRecordId,
      patientId: patient.id,
      date: labDate,
      laboratoryName,
      fastingHours,
      notes: labNotes,
      values: { ...markerValues },
      computedHomaIr: liveHomaIr || undefined,
      computedEgfr: liveEgfr || undefined,
    };

    const remaining = existingLabs.filter((l) => l.id !== labRecordId);
    const updatedLabs = [newLabRecord, ...remaining].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const updatedPatient: Patient = {
      ...patient,
      labRecords: updatedLabs,
      updatedAt: new Date().toISOString(),
    };

    onUpdatePatient(updatedPatient);
    setSelectedLabId(labRecordId);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeletePanel = (recordId: string) => {
    if (!confirm('¿Deseas eliminar este registro de laboratorio?')) return;
    const remaining = existingLabs.filter((l) => l.id !== recordId);
    const updatedPatient: Patient = {
      ...patient,
      labRecords: remaining,
      updatedAt: new Date().toISOString(),
    };
    onUpdatePatient(updatedPatient);
    if (selectedLabId === recordId) {
      if (remaining.length > 0) {
        handleSelectRecord(remaining[0]);
      } else {
        handleCreateNewPanel();
      }
    }
  };

  // Helper for visual reference meter
  const renderRangeMeter = (markerId: string, currentVal: number | undefined) => {
    if (currentVal === undefined) return null;
    const def = LAB_MARKERS.find((m) => m.id === markerId);
    if (!def) return null;
    const range = patient.gender === 'female' ? def.refFemale : def.refMale;

    const spanMin = range.min * 0.7;
    const spanMax = range.max * 1.3;
    const pct = Math.max(0, Math.min(100, ((currentVal - spanMin) / (spanMax - spanMin)) * 100));

    const isNormal = currentVal >= range.min && currentVal <= range.max;
    const isHigh = currentVal > range.max;
    const isLow = currentVal < range.min;

    return (
      <div className="w-full mt-1.5 space-y-1">
        <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {/* Low zone */}
          <div className="w-1/4 bg-amber-200/70 h-full border-r border-white/50" />
          {/* Normal zone */}
          <div className="w-2/4 bg-emerald-300 h-full border-r border-white/50" />
          {/* High zone */}
          <div className="w-1/4 bg-rose-200/80 h-full" />

          {/* Indicator pin */}
          <div
            className={`absolute top-0 bottom-0 w-1.5 rounded-full shadow-xs ${
              isNormal ? 'bg-emerald-700' : isHigh ? 'bg-rose-700' : 'bg-amber-700'
            }`}
            style={{ left: `calc(${pct}% - 3px)` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Min: {range.min}</span>
          <span className="font-semibold text-slate-600">Rango Clínico</span>
          <span>Max: {range.max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <Activity className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Laboratorios Clínicos & Detección de Alteraciones
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Registro bioquímico, cotejo automático de rangos de referencia según sexo y alertas fisiopatológicas para{' '}
              <strong className="text-slate-800">{patient.fullName}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCreateNewPanel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Nueva Analítica</span>
            </button>

            <button
              onClick={handleSavePanel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Analítica</span>
            </button>

            <button
              onClick={() => {
                handleSavePanel();
                onNavigateToTab('print', 'labs');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span>Imprimir Reporte</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              ¡Analítica de laboratorio guardada correctamente en el expediente! Las alteraciones han sido computadas.
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Parameters & Real-Time Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form and Category Markers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Block (Date, Lab, Fasting) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Datos del Estudio Bioquímico
              </h3>
              {existingLabs.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Histórico:</span>
                  <select
                    value={selectedLabId}
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        handleCreateNewPanel();
                      } else {
                        const rec = existingLabs.find((l) => l.id === e.target.value);
                        if (rec) handleSelectRecord(rec);
                      }
                    }}
                    className="text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    {existingLabs.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.date} · {l.laboratoryName || 'Laboratorio'} ({Object.keys(l.values).length} marcadores)
                      </option>
                    ))}
                    <option value="new">+ Capturar Nueva Fecha</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Fecha de Toma de Muestra
                </label>
                <input
                  type="date"
                  value={labDate}
                  onChange={(e) => setLabDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Gabinete o Laboratorio
                </label>
                <input
                  type="text"
                  value={laboratoryName}
                  onChange={(e) => setLaboratoryName(e.target.value)}
                  placeholder="Ej. Laboratorio Chopo, Polanco, Hospital"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Horas de Ayuno
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={fastingHours}
                    onChange={(e) => setFastingHours(parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-slate-50/50 text-center"
                  />
                  <span className="font-semibold text-slate-600">horas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Todos los Marcadores ({LAB_MARKERS.length})
            </button>
            {LAB_CATEGORIES.map((cat) => {
              const countInCat = LAB_MARKERS.filter((m) => m.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.label} ({countInCat})
                </button>
              );
            })}
          </div>

          {/* Markers Input Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Captura de Valores & Validación en Tiempo Real
              </span>
              <span className="text-[11px] text-slate-400">
                Rangos clínicos calibrados para paciente {patient.gender === 'female' ? 'Femenino' : 'Masculino'} ({patient.age} años)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMarkers.map((marker) => {
                const curVal = markerValues[marker.id];
                const hasValue = curVal !== undefined && !isNaN(curVal);
                const evalResult = hasValue
                  ? evaluateMarkerValue(marker.id, curVal, patient.gender)
                  : null;

                const range = patient.gender === 'female' ? marker.refFemale : marker.refMale;

                return (
                  <div
                    key={marker.id}
                    className={`p-3.5 rounded-xl border transition ${
                      evalResult
                        ? evalResult.isCritical
                          ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400'
                          : evalResult.isAltered
                          ? 'border-amber-300 bg-amber-50/30'
                          : 'border-emerald-300 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block leading-tight">
                          {marker.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Ref: {range.min} - {range.max} {marker.unit}
                        </span>
                      </div>

                      {evalResult ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-bold shrink-0 ${evalResult.badgeClass}`}
                        >
                          {evalResult.statusLabel}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Sin capturar
                        </span>
                      )}
                    </div>

                    {/* Numeric Input & Unit */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="any"
                          value={curVal !== undefined ? curVal : ''}
                          onChange={(e) => handleValueChange(marker.id, e.target.value)}
                          placeholder={`${range.min} - ${range.max}`}
                          className="w-full text-sm font-bold font-mono px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-teal-500 bg-white"
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 font-mono w-14 shrink-0">
                        {marker.unit}
                      </span>
                    </div>

                    {/* Visual Meter */}
                    {hasValue && renderRangeMeter(marker.id, curVal)}

                    {/* Clinical significance note */}
                    {evalResult?.isAltered && (
                      <p className="mt-2 text-[11px] leading-tight text-slate-600 pt-1.5 border-t border-slate-200/60">
                        <strong className="text-slate-800">Criterio:</strong> {evalResult.interpretation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Diagnostic Evaluation & Pathological Alerts */}
        <div className="space-y-6">
          {/* Summary Scoreboard */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block">
                  Diagnóstico Bioquímico
                </span>
                <span className="text-base font-bold text-white">Estado del Panel</span>
              </div>
              <Activity className="w-5 h-5 text-teal-400" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-800/80 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Analizados</span>
                <span className="text-xl font-bold font-mono text-white">
                  {panelAnalysis.totalAnalyzed}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/60 rounded-xl">
                <span className="text-[10px] text-emerald-400 block font-bold uppercase">En Rango</span>
                <span className="text-xl font-bold font-mono text-emerald-300">
                  {panelAnalysis.normalCount}
                </span>
              </div>
              <div className="p-2.5 bg-rose-950/60 border border-rose-800/60 rounded-xl">
                <span className="text-[10px] text-rose-400 block font-bold uppercase">Alterados</span>
                <span className="text-xl font-bold font-mono text-rose-300">
                  {panelAnalysis.alteredCount}
                </span>
              </div>
            </div>

            {/* Calculated Clinical Biomarkers (HOMA-IR & eGFR) */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="p-2.5 bg-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase block">
                    Índice HOMA-IR (Insulino-Resistencia)
                  </span>
                  <span className="font-bold text-white">
                    {liveHomaIr !== null ? `${liveHomaIr} pts` : 'Requiere Glucosa + Insulina'}
                  </span>
                </div>
                {liveHomaIr !== null && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      liveHomaIr >= 2.5
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-400/50'
                        : liveHomaIr >= 2.0
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                        : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                    }`}
                  >
                    {liveHomaIr >= 2.5 ? 'Resistencia Alta' : liveHomaIr >= 2.0 ? 'Limítrofe' : 'Sensibilidad Óptima'}
                  </span>
                )}
              </div>

              <div className="p-2.5 bg-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-teal-400 uppercase block">
                    eGFR Tasa Filtración Glomerular (CKD-EPI)
                  </span>
                  <span className="font-bold text-white">
                    {liveEgfr !== null ? `${liveEgfr} mL/min/1.73m²` : 'Requiere Creatinina'}
                  </span>
                </div>
                {liveEgfr !== null && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      liveEgfr < 60
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-400/50'
                        : liveEgfr < 90
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                        : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                    }`}
                  >
                    {liveEgfr < 30 ? 'Severo E4/5' : liveEgfr < 60 ? 'Moderado E3' : liveEgfr < 90 ? 'Leve E2' : 'Normal E1'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pathological Alterations & Nutritional Directives Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Alteraciones Clínicas Detectadas ({panelAnalysis.alerts.length})</span>
            </h4>

            {panelAnalysis.alerts.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <span className="text-xs font-bold text-emerald-900 block">
                  {panelAnalysis.totalAnalyzed > 0
                    ? '¡Todos los marcadores capturados están dentro de rangos normales!'
                    : 'Ingresa valores de laboratorio para evaluar alteraciones.'}
                </span>
                <span className="text-[11px] text-emerald-700 block">
                  No se detectan banderas rojas metabólicas, renales o hepáticas.
                </span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {panelAnalysis.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      alert.severity === 'danger'
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-amber-50/70 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {alert.severity === 'danger' ? (
                        <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {alert.title}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="pt-1.5 border-t border-slate-200/80">
                      <span className="text-[10px] font-bold uppercase text-teal-800 block">
                        Intervención Nutricional Recomendada:
                      </span>
                      <p className="text-[11px] text-teal-900 font-medium leading-relaxed">
                        {alert.nutritionalRecommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Dates List Tile */}
          {existingLabs.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Analíticas Registradas ({existingLabs.length})</span>
              </h4>

              <div className="space-y-2">
                {existingLabs.map((lab) => (
                  <div
                    key={lab.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      lab.id === selectedLabId
                        ? 'border-teal-500 bg-teal-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                    onClick={() => handleSelectRecord(lab)}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{lab.date}</span>
                      <span className="text-[10px] text-slate-500">
                        {lab.laboratoryName || 'Laboratorio'} · {Object.keys(lab.values).length} marcadores
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePanel(lab.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Eliminar analítica"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
