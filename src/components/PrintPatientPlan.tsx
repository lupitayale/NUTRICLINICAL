import React, { useState } from 'react';
import {
  Printer,
  HeartPulse,
  ArrowLeft,
  Download,
  CheckCircle2,
  FileText,
  Sparkles,
  Upload,
  Pill,
  Activity,
  AlertTriangle,
  Check,
  ShoppingCart,
  Scale,
  Droplets,
  Dumbbell,
  ShieldCheck,
  Utensils,
  Syringe,
} from 'lucide-react';
import { Patient, MenuPlan, ClinicBrandingLogo, MedicalPrescription, LabRecord } from '../types/nutrition';
import { PATHOLOGY_INFO, getPatientExercisePrescription } from '../utils/nutritionCalculations';
import { SMAE_DATABASE, SMAE_GROUP_INFO, SmaeCategory } from '../utils/smaeDatabase';
import { downloadPatientClinicalPdf } from '../utils/generatePdfReport';
import {
  CLINIC_LOGOS,
  getSelectedClinicLogo,
  saveSelectedClinicLogo,
  getCustomLogoData,
  saveCustomLogoData,
} from '../utils/nutritionLogos';
import {
  LAB_MARKERS,
  evaluateMarkerValue,
  analyzeFullLabPanel,
} from '../utils/labCalculations';

export type PrintDocumentType =
  | 'plan'
  | 'prescription'
  | 'labs'
  | 'enteral'
  | 'parenteral'
  | 'groceries'
  | 'equivalents'
  | 'hydration_guides';

interface PrintPatientPlanProps {
  patient: Patient;
  onNavigateBack: () => void;
  activeNutriologist?: { name: string; professionalLicense?: string } | null;
  initialDocumentType?: PrintDocumentType;
}

export const PrintPatientPlan: React.FC<PrintPatientPlanProps> = ({
  patient,
  onNavigateBack,
  activeNutriologist,
  initialDocumentType,
}) => {
  const [documentType, setDocumentType] = useState<PrintDocumentType>(initialDocumentType || 'plan');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Logo state
  const [selectedLogo, setSelectedLogo] = useState<ClinicBrandingLogo>(() =>
    getSelectedClinicLogo()
  );
  const [customLogo, setCustomLogo] = useState<string | null>(() => getCustomLogoData());
  const [isLogoSelectorOpen, setIsLogoSelectorOpen] = useState(false);

  const plan: MenuPlan | undefined = patient.activeMenuPlan;
  const latestConsult = patient.consultations[patient.consultations.length - 1];

  const prescription: MedicalPrescription | undefined =
    patient.activeMedicalPrescription ||
    (patient.medicalPrescriptions && patient.medicalPrescriptions.length > 0
      ? patient.medicalPrescriptions[0]
      : undefined);

  const latestLab: LabRecord | undefined =
    patient.labRecords && patient.labRecords.length > 0
      ? patient.labRecords[0]
      : undefined;

  const labAnalysis = latestLab
    ? analyzeFullLabPanel(latestLab.values, patient.gender, patient.age)
    : null;

  const handleSelectLogo = (logo: ClinicBrandingLogo) => {
    setSelectedLogo(logo);
    saveSelectedClinicLogo(logo.id);
  };

  const handleUploadCustomLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCustomLogo(result);
        saveCustomLogoData(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearCustomLogo = () => {
    setCustomLogo(null);
    saveCustomLogoData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const clinicianName = activeNutriologist?.name || 'Lic. Alejandro Aguilar';
  const clinicianLicense = activeNutriologist?.professionalLicense || 'Céd. Prof. 8492019';

  const handleDownloadPdf = () => {
    if (documentType === 'plan' && plan) {
      setIsDownloadingPdf(true);
      try {
        downloadPatientClinicalPdf(
          patient,
          plan,
          selectedLogo.id,
          customLogo,
          clinicianName,
          clinicianLicense
        );
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } catch (err) {
        console.error('Error generating PDF:', err);
        alert('Ocurrió un error al generar el archivo PDF. Intenta de nuevo.');
      } finally {
        setIsDownloadingPdf(false);
      }
    } else {
      // For prescription or labs, window.print() prints directly with browser print/PDF
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Non-printed Toolbar & Document Switcher */}
      <div className="print:hidden bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onNavigateBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Editor</span>
          </button>

          {/* Document Type Selector Segmented Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setDocumentType('plan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                documentType === 'plan'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Plan de Menús</span>
            </button>

            <button
              onClick={() => setDocumentType('prescription')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                documentType === 'prescription'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-purple-600" />
              <span>Receta Médica (Rx)</span>
            </button>

            <button
              onClick={() => setDocumentType('labs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                documentType === 'labs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              <span>Reporte de Laboratorios</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsLogoSelectorOpen(!isLogoSelectorOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Logotipo ({selectedLogo.name.split('&')[0].trim()})</span>
            </button>

            {downloadSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>¡PDF descargado!</span>
              </span>
            )}

            {documentType === 'plan' && plan && (
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloadingPdf ? 'Generando PDF...' : 'Descargar PDF Clínico'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Imprimir Documento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Logo Selector Tray (Non-printed) */}
      {isLogoSelectorOpen && (
        <div className="print:hidden bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Logotipos Profesionales de Nutrición para Imprimir</span>
              </h4>
              <p className="text-xs text-slate-500">
                Selecciona el emblema institucional o sube el logotipo oficial de tu consultorio.
              </p>
            </div>
            <button
              onClick={() => setIsLogoSelectorOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {CLINIC_LOGOS.map((logo) => {
              const isSelected = selectedLogo.id === logo.id && !customLogo;
              return (
                <div
                  key={logo.id}
                  onClick={() => {
                    handleClearCustomLogo();
                    handleSelectLogo(logo);
                  }}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/60 shadow-xs ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className="w-12 h-12 mb-2"
                    dangerouslySetInnerHTML={{ __html: logo.svgBadge }}
                  />
                  <div className="text-[11px] font-bold text-slate-900 leading-tight">
                    {logo.name}
                  </div>
                  {isSelected && (
                    <span className="mt-1 text-[9px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                      Seleccionado
                    </span>
                  )}
                </div>
              );
            })}

            {/* Custom Logo Upload Tile */}
            <label className="p-3 rounded-xl border border-dashed border-slate-300 hover:border-teal-500 hover:bg-teal-50/40 text-center transition cursor-pointer flex flex-col items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCustomLogo}
                className="hidden"
              />
              {customLogo ? (
                <>
                  <img
                    src={customLogo}
                    alt="Custom Logo"
                    className="w-12 h-12 object-contain mb-1.5"
                  />
                  <span className="text-[10px] font-bold text-teal-800">Mi Logo Subido</span>
                  <span className="text-[9px] text-slate-400">Clic para cambiar</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[11px] font-bold text-slate-700">Subir Mi Logo</span>
                  <span className="text-[9px] text-slate-400">PNG / JPG</span>
                </>
              )}
            </label>
          </div>
        </div>
      )}

      {/* DOCUMENT 1: RECETA MÉDICA (PRESCRIPTION) */}
      {documentType === 'prescription' && (
        <div className="relative overflow-hidden bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
          {/* Watermark Background Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-10 print:opacity-15">
            <img
              src="/assets/aistudio/Gemini_Generated_Image_t916jdt916jdt916_47844636.jpg"
              alt="Marca de agua"
              className="w-[450px] h-[450px] object-contain"
            />
          </div>
          <div className="relative z-10">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center p-2 shadow-sm shrink-0">
                {customLogo ? (
                  <img
                    src={customLogo}
                    alt="Logo Personalizado"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: selectedLogo.svgBadge }}
                  />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    NutriClinical Pro
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    RECETA MÉDICA NUTRICIONAL
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                  {selectedLogo.subtitle || 'Centro Especializado de Nutrición Clínica'}
                </p>
                <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                  Especialista: {clinicianName} · {clinicianLicense}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500">
              <div className="font-bold text-slate-800">Fecha de Emisión:</div>
              <div>
                {prescription?.date ||
                  new Date().toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
              </div>
              <div className="mt-1 text-[11px] text-teal-800 font-semibold">
                Folio: #{prescription?.folio || `RX-${patient.id.slice(-6)}`}
              </div>
            </div>
          </div>

          {/* Patient Header Block */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Paciente</span>
                <span className="font-extrabold text-slate-900 text-sm">{patient.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Edad / Sexo</span>
                <span className="font-bold text-slate-800">
                  {patient.age} años · {patient.gender === 'male' ? 'Masculino' : 'Femenino'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Peso / Talla</span>
                <span className="font-bold text-slate-800">
                  {latestConsult ? `${latestConsult.weightKg} kg · ${latestConsult.heightCm} cm` : '70 kg'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Diagnósticos</span>
                <span className="font-bold text-teal-800 truncate block">
                  {patient.pathologies.length > 0
                    ? patient.pathologies.map((p) => PATHOLOGY_INFO[p]?.name.split(' (')[0]).join(', ')
                    : 'Acondicionamiento'}
                </span>
              </div>
            </div>
          </div>

          {/* Rx Symbol & Title */}
          <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-200">
            <span className="text-3xl font-serif font-black text-slate-900">℞</span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {prescription?.title || 'Prescripción de Suplementación & Soporte Nutracéutico'}
              </h2>
              <span className="text-xs text-slate-500">
                Fórmula magistral de micronutrientes, dosis exacta y pauta de administración.
              </span>
            </div>
          </div>

          {/* Supplements Table */}
          {(!prescription?.supplements || prescription.supplements.length === 0) ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl my-4">
              <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">
                No hay suplementos redactados en esta receta aún.
              </p>
              <p className="text-[11px] text-slate-400">
                Ve a la pestaña "Prescripción Médica" para agregar suplementos o cargar un protocolo.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Suplemento / Nutracéutico</th>
                    <th className="py-2.5 px-3">Dosis & Forma</th>
                    <th className="py-2.5 px-3">Frecuencia & Horario</th>
                    <th className="py-2.5 px-3">Duración</th>
                    <th className="py-2.5 px-3">Indicación Clínica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {prescription.supplements.map((supp, sIdx) => (
                    <tr key={sIdx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900 block">{supp.name}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-teal-800 block">{supp.dosage}</span>
                        <span className="text-[10px] text-slate-500 capitalize">{supp.form}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block">{supp.frequency}</span>
                        <span className="text-[10px] text-slate-500">{supp.timing.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{supp.duration}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-600">{supp.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Indications & Hydration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Indicaciones Dietéticas de Soporte
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {(prescription?.dietaryIndications || [
                  'Consumir abundante agua natural a lo largo del día.',
                  'Separar la toma de suplementos minerales 2 horas del consumo de café o lácteos.',
                ]).map((ind, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-1.5">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Hidratación & Observaciones
              </h3>
              <div className="text-xs text-slate-700 space-y-1">
                <p>
                  <strong>Meta Hídrica:</strong> {prescription?.hydrationRecommendationLiters || 2.5} L de agua natural al día.
                </p>
                {prescription?.nextReviewDate && (
                  <p>
                    <strong>Próximo Control Clínico:</strong> {prescription.nextReviewDate}
                  </p>
                )}
                {(prescription?.clinicalObservations || []).map((obs, oIdx) => (
                  <p key={oIdx} className="text-[11px] text-slate-600 italic">
                    • {obs}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Signature Box */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end print:break-inside-avoid">
            <div className="text-xs text-slate-400 max-w-sm">
              Documento clínico oficial emitido por NutriClinical Pro. Válido exclusivamente bajo supervisión del profesional prescriptor.
            </div>
            <div className="text-center w-64">
              <div className="border-b border-slate-400 h-10 mb-1"></div>
              <div className="text-xs font-bold text-slate-900">{clinicianName}</div>
              <div className="text-[11px] text-slate-600 font-semibold">{clinicianLicense}</div>
              <div className="text-[10px] text-slate-500">Nutriólogo Clínico Responsable</div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* DOCUMENT 2: REPORTE DE LABORATORIOS BIOQUÍMICOS */}
      {documentType === 'labs' && (
        <div className="relative overflow-hidden bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
          {/* Watermark Background Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-10 print:opacity-15">
            <img
              src="/assets/aistudio/Gemini_Generated_Image_t916jdt916jdt916_47844636.jpg"
              alt="Marca de agua"
              className="w-[450px] h-[450px] object-contain"
            />
          </div>
          <div className="relative z-10">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center p-2 shadow-sm shrink-0">
                {customLogo ? (
                  <img
                    src={customLogo}
                    alt="Logo Personalizado"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: selectedLogo.svgBadge }}
                  />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    NutriClinical Pro
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                    ANALÍTICA BIOQUÍMICA & DETECCIÓN DE ALTERACIONES
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                  {latestLab?.laboratoryName || 'Informe Clínico de Laboratorio'}
                </p>
                <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                  Especialista: {clinicianName} · {clinicianLicense}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500">
              <div className="font-bold text-slate-800">Fecha de Estudio:</div>
              <div>{latestLab?.date || new Date().toISOString().split('T')[0]}</div>
              <div className="mt-1 text-[11px] text-teal-800 font-semibold">
                Ayuno: {latestLab?.fastingHours || 12} horas
              </div>
            </div>
          </div>

          {/* Patient Header Block */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Paciente</span>
                <span className="font-extrabold text-slate-900 text-sm">{patient.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Edad / Sexo</span>
                <span className="font-bold text-slate-800">
                  {patient.age} años · {patient.gender === 'male' ? 'Masculino' : 'Femenino'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Marcadores</span>
                <span className="font-bold text-slate-800">
                  {labAnalysis?.totalAnalyzed || 0} evaluados ({labAnalysis?.alteredCount || 0} alterados)
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">HOMA-IR / eGFR</span>
                <span className="font-bold text-teal-800">
                  {labAnalysis?.homaIr ? `${labAnalysis.homaIr} pts` : 'N/D'} · {labAnalysis?.egfrCalculated ? `${labAnalysis.egfrCalculated} mL/min` : 'N/D'}
                </span>
              </div>
            </div>
          </div>

          {/* Lab Markers Table */}
          {!latestLab || Object.keys(latestLab.values).length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl my-4">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">
                No hay resultados de laboratorio registrados para este paciente.
              </p>
              <p className="text-[11px] text-slate-400">
                Ve a la pestaña "Laboratorios Clínicos" para capturar la analítica.
              </p>
            </div>
          ) : (
            <div className="space-y-6 mb-8">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Marcador Bioquímico</th>
                    <th className="py-2.5 px-3">Resultado Obtenido</th>
                    <th className="py-2.5 px-3">Rango de Referencia</th>
                    <th className="py-2.5 px-3">Estado Clínico</th>
                    <th className="py-2.5 px-3">Interpretación Fisiológica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(latestLab.values).map(([markerId, val]) => {
                    const evalResult = evaluateMarkerValue(markerId, val, patient.gender);
                    const def = LAB_MARKERS.find((m) => m.id === markerId);

                    return (
                      <tr key={markerId} className={evalResult.isAltered ? 'bg-amber-50/30' : ''}>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{def?.name || markerId}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {val} {def?.unit}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {evalResult.refRangeStr}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${evalResult.badgeClass}`}>
                            {evalResult.statusLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600">
                          {evalResult.interpretation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Detected Alterations Summary Box */}
              {labAnalysis && labAnalysis.alerts.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Conclusiones Fisiopatológicas & Manejo Dietoterápico</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {labAnalysis.alerts.map((alert) => (
                      <div key={alert.id} className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-900 mb-0.5">{alert.title}</div>
                        <p className="text-[11px] text-slate-600 mb-1">{alert.message}</p>
                        <p className="text-[11px] text-teal-800 font-medium">
                          <strong>Pauta Nutricional:</strong> {alert.nutritionalRecommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Signature Box */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end print:break-inside-avoid">
            <div className="text-xs text-slate-400 max-w-sm">
              Reporte de cotejo analítico generado por NutriClinical Pro. Interpretación para uso clínico profesional.
            </div>
            <div className="text-center w-64">
              <div className="border-b border-slate-400 h-10 mb-1"></div>
              <div className="text-xs font-bold text-slate-900">{clinicianName}</div>
              <div className="text-[11px] text-slate-600 font-semibold">{clinicianLicense}</div>
              <div className="text-[10px] text-slate-500">Nutriólogo Clínico Responsable</div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* DOCUMENT 3: COMPLETE MENU & ANTHROPOMETRIC PLAN (Original Document) */}
      {documentType === 'plan' && (
        !plan ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 max-w-xl mx-auto mt-8">
            <h3 className="text-lg font-bold text-slate-800">No hay plan de menú activo aún</h3>
            <p className="text-xs text-slate-500">
              Ve a la pestaña "Generador de Menús Inteligente" para crear un plan automáticamente en 1 clic.
            </p>
            <button
              onClick={onNavigateBack}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition"
            >
              Volver a Generar Menú
            </button>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
            {/* Watermark Background Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-10 print:opacity-15">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_t916jdt916jdt916_47844636.jpg"
                alt="Marca de agua"
                className="w-[450px] h-[450px] object-contain"
              />
            </div>
            <div className="relative z-10">
            {/* Header Document with Selected Logo */}
            <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center p-2 shadow-sm shrink-0">
                  {customLogo ? (
                    <img
                      src={customLogo}
                      alt="Logo Personalizado"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: selectedLogo.svgBadge }}
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      NutriClinical Pro
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {selectedLogo.name.split('&')[0].trim()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                    {selectedLogo.subtitle || 'Centro Especializado de Nutrición Clínica'}
                  </p>
                  <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                    Especialista: {clinicianName} · {clinicianLicense}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500">
                <div className="font-bold text-slate-800">Fecha de Emisión:</div>
                <div>
                  {new Date().toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="mt-1 text-[11px] text-teal-800 font-semibold">
                  Folio: #{patient.id.slice(-6)}
                </div>
              </div>
            </div>

            {/* Patient Clinical Info Block */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Paciente</span>
                  <span className="font-extrabold text-slate-900 text-sm">{patient.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Edad / Sexo</span>
                  <span className="font-bold text-slate-800">
                    {patient.age} años · {patient.gender === 'male' ? 'Masculino' : 'Femenino'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Peso Actual / Talla</span>
                  <span className="font-bold text-slate-800">
                    {latestConsult ? `${latestConsult.weightKg} kg · ${latestConsult.heightCm} cm` : '70 kg'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">IMC / Estado</span>
                  <span className="font-bold text-teal-800">
                    {latestConsult?.bmi} kg/m² ({latestConsult?.bmiClassification.split(' ')[0]})
                  </span>
                </div>
              </div>

              {/* Clinical Directives */}
              {patient.pathologies.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Condiciones Clínicas:
                  </span>
                  {patient.pathologies.map((patKey) => {
                    const info = PATHOLOGY_INFO[patKey];
                    return (
                      <span
                        key={patKey}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 text-slate-700"
                      >
                        {info?.name || patKey}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Plan Title & Dietary Style Badge */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Patrón Culinario:
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200">
                    {plan.dietaryStyleName || 'Estándar Clínico Equilibrado'}
                  </span>
                </div>
                {plan.varietyAudit && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    🛡️ {plan.varietyAudit.noveltyScorePercent}% Variedad Única · 0 Repeticiones en 30 Días
                  </span>
                )}
              </div>
            </div>

            {/* Target Macro Summary */}
            <div className="grid grid-cols-4 gap-3 mb-8 text-center">
              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Energía Diaria</span>
                <span className="text-lg sm:text-xl font-extrabold">{plan.targetCalories} kcal</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Proteínas</span>
                <span className="text-lg sm:text-xl font-extrabold text-blue-900">{plan.targetProtein}g</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Carbohidratos</span>
                <span className="text-lg sm:text-xl font-extrabold text-amber-900">{plan.targetCarbs}g</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Grasas</span>
                <span className="text-lg sm:text-xl font-extrabold text-emerald-900">{plan.targetFat}g</span>
              </div>
            </div>

            {/* Days Plan Listing */}
            <div className="space-y-8">
              {plan.days.map((day, dIdx) => (
                <div key={dIdx} className="space-y-4 print:break-inside-avoid">
                  <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1.5">
                    <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                      {day.dayName}
                    </h2>
                    <div className="text-xs font-bold text-slate-600">
                      Total Día: {day.totalCalories} kcal · P: {day.totalProtein}g · C: {day.totalCarbs}g · G: {day.totalFat}g
                    </div>
                  </div>

                  {/* Meals Grid */}
                  <div className="space-y-3">
                    {day.meals.map((meal, mIdx) => (
                      <div
                        key={meal.id || mIdx}
                        className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 print:bg-transparent print:border-b print:border-slate-200"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                              {meal.timeLabel}
                            </span>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">{meal.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-600">
                            {meal.calories} kcal ({meal.protein}g P · {meal.carbs}g C · {meal.fat}g G)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                          <div>
                            <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">
                              Ingredientes / Equivalentes:
                            </span>
                            <ul className="space-y-0.5">
                              {meal.ingredients.map((ing, iIdx) => (
                                <li key={iIdx} className="text-slate-700 text-[11px] flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-teal-500 shrink-0"></span>
                                  <span>
                                    <b>{ing.quantity}</b> de {ing.item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">
                              Preparación & Beneficio:
                            </span>
                            <p className="text-slate-700 text-[11px] leading-relaxed mb-1">{meal.preparation}</p>
                            {meal.clinicalBenefit && (
                              <p className="text-[10px] text-teal-800 italic">
                                <b>Clínico:</b> {meal.clinicalBenefit}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Supplements & Sports Nutrition Plan */}
            {plan.supplements && plan.supplements.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 print:break-inside-avoid">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                    Prescripción de Suplementación & Nutrición Deportiva
                  </h3>
                  <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Cuadrado al 100% de los Requerimientos
                  </span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-semibold text-[10px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Suplemento</th>
                        <th className="py-2 px-3">Dosis / Porción</th>
                        <th className="py-2 px-3">Momento de Toma</th>
                        <th className="py-2 px-3">Aporte Nutricional</th>
                        <th className="py-2 px-3">Objetivo / Indicación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] text-slate-800">
                      {plan.supplements.map((supp, sIdx) => {
                        const timingLabels: Record<string, string> = {
                          ayunas: 'En ayunas',
                          pre_entreno: 'Pre-entrenamiento (30-45 min antes)',
                          intra_entreno: 'Intra-entrenamiento (durante la sesión)',
                          post_entreno: 'Post-entrenamiento (inmediato al finalizar)',
                          con_comidas: 'Con las comidas principales',
                          antes_dormir: 'Antes de dormir (30 min antes)',
                        };
                        return (
                          <tr key={supp.id || sIdx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-bold text-slate-900">
                              {supp.name}
                            </td>
                            <td className="py-2 px-3 font-semibold text-teal-900">
                              {supp.dosage}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {timingLabels[supp.timing] || supp.timing}
                            </td>
                            <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">
                              {supp.calories ? `${supp.calories} kcal` : '0 kcal'}
                              {supp.protein ? ` · ${supp.protein}g P` : ''}
                              {supp.carbs ? ` · ${supp.carbs}g C` : ''}
                              {supp.fat ? ` · ${supp.fat}g G` : ''}
                            </td>
                            <td className="py-2 px-3 text-slate-600 italic">
                              {supp.purpose || 'Soporte nutricional y rendimiento'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Clinical Observations */}
            {plan.clinicalObservations.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 print:break-inside-avoid">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Recomendaciones Clínicas y Estilo de Vida
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {plan.clinicalObservations.map((obs, oIdx) => (
                    <li key={oIdx} className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Signature Box with Selected Clinician */}
            <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end print:break-inside-avoid">
              <div className="text-xs text-slate-400">
                Documento emitido por NutriClinical Pro · Consulta con tu especialista antes de realizar cambios drásticos.
              </div>
              <div className="text-center w-64">
                <div className="border-b border-slate-400 h-10 mb-1"></div>
                <div className="text-xs font-bold text-slate-900">{clinicianName}</div>
                <div className="text-[11px] text-slate-600 font-semibold">{clinicianLicense}</div>
                <div className="text-[10px] text-slate-500">Nutriólogo Clínico Responsable</div>
              </div>
            </div>
          </div>
        </div>
      )
    )}

      {/* DOCUMENT 4: NUTRICIÓN ENTERAL */}
      {documentType === 'enteral' && (() => {
        const enteral = patient.activeEnteralPrescription || {
          type: 'commercial' as const,
          formulaName: 'Fórmula Polimérica Estándar Hiperproteica con Fibra',
          route: 'Sonda Nasogástrica (SNG)' as const,
          mode: 'continuous' as const,
          totalVolumeMl: Math.round(patient.activePrescription.targetCalories),
          dailyCalories: patient.activePrescription.targetCalories,
          dailyProteinGrams: patient.activePrescription.proteinGrams,
          dailyCarbGrams: patient.activePrescription.carbGrams,
          dailyFatGrams: patient.activePrescription.fatGrams,
          freeWaterMl: Math.round(patient.activePrescription.targetCalories * 0.84),
          additionalWaterFlushesMl: 300,
          totalFluidMl: Math.round(patient.activePrescription.targetCalories * 0.84) + 300,
          infusionRateMlPerHour: Math.round(patient.activePrescription.targetCalories / 24),
          tubeGaugeFr: 12,
          preparationNotes: [
            'Administrar a temperatura ambiente; corroborar posición de sonda mediante auscultación o aspirado antes de iniciar.',
            'Lavar la sonda con 30 a 50 ml de agua purificada antes y después de cada toma o cada 6 horas en infusión continua.',
            'Mantener al paciente en posición semisentada (Fowler 30°-45°) durante la infusión y hasta 60 min posteriores para evitar broncoaspiración.',
            'Descartar remanentes de fórmula comercial tras 24h de apertura bajo refrigeración.',
          ],
        };

        return (
          <div className="relative overflow-hidden bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
            {/* Watermark Background Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-10 print:opacity-15">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_t916jdt916jdt916_47844636.jpg"
                alt="Marca de agua"
                className="w-[450px] h-[450px] object-contain"
              />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center p-2 shadow-sm shrink-0">
                    {customLogo ? (
                      <img src={customLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: selectedLogo.svgBadge }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">NutriClinical Pro</h1>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                        PRESCRIPCIÓN DE NUTRICIÓN ENTERAL
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                      {selectedLogo.subtitle || 'Soporte Nutricional Especializado'}
                    </p>
                    <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                      Especialista: {clinicianName} · {clinicianLicense}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div className="font-bold text-slate-800">Fecha de Emisión:</div>
                  <div>
                    {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="mt-1 text-[11px] text-teal-800 font-semibold">
                    Folio: #NE-{patient.id.slice(-6)}
                  </div>
                </div>
              </div>

              {/* Patient Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Paciente</span>
                    <span className="font-extrabold text-slate-900 text-sm">{patient.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Edad / Sexo</span>
                    <span className="font-bold text-slate-800">{patient.age} años · {patient.gender === 'male' ? 'Masc.' : 'Fem.'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Peso / Talla</span>
                    <span className="font-bold text-slate-800">{latestConsult?.weightKg || 70} kg · {latestConsult?.heightCm || 170} cm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Diagnóstico / Condición</span>
                    <span className="font-bold text-slate-800">
                      {patient.pathologies.map((p) => PATHOLOGY_INFO[p]?.name.split(' (')[0]).join(', ') || 'Soporte Enteral'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enteral Core Details */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-100">
                    <div className="text-[10px] font-bold uppercase text-cyan-800">Fórmula Prescrita</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-1">{enteral.formulaName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Modalidad: {enteral.type === 'commercial' ? 'Fórmula Comercial Industrializada' : 'Dieta Polimérica Artesanal'}</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Vía de Acceso & Calibre</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-1">{enteral.route}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Calibre de Sonda: {enteral.tubeGaugeFr} Fr</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Régimen de Infusión</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-1">
                      {enteral.mode === 'continuous' ? `Continua: ${enteral.infusionRateMlPerHour || 65} ml/hora (24h)` : 'Por Bolos / Gravedad'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Volumen Total Diario: {enteral.totalVolumeMl} ml</div>
                  </div>
                </div>

                {/* Macronutrient Balance Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Aporte Nutricional & Hídrico Diario
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2.5 px-4 text-left">Parámetro Nutricional</th>
                        <th className="py-2.5 px-4 text-center">Cantidad Total</th>
                        <th className="py-2.5 px-4 text-center">Densidad / Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Energía Total</td>
                        <td className="py-2.5 px-4 text-center font-extrabold text-teal-800">{enteral.dailyCalories} kcal</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">{(enteral.dailyCalories / enteral.totalVolumeMl).toFixed(2)} kcal/ml</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Proteínas Totales</td>
                        <td className="py-2.5 px-4 text-center font-bold text-blue-700">{enteral.dailyProteinGrams} g</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">{((enteral.dailyProteinGrams * 4 / enteral.dailyCalories) * 100).toFixed(0)}% del VCT</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Carbohidratos Totales</td>
                        <td className="py-2.5 px-4 text-center font-bold text-amber-700">{enteral.dailyCarbGrams} g</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">{((enteral.dailyCarbGrams * 4 / enteral.dailyCalories) * 100).toFixed(0)}% del VCT</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Lípidos Totales</td>
                        <td className="py-2.5 px-4 text-center font-bold text-emerald-700">{enteral.dailyFatGrams} g</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">{((enteral.dailyFatGrams * 9 / enteral.dailyCalories) * 100).toFixed(0)}% del VCT</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Agua Libre de la Fórmula + Lavados</td>
                        <td className="py-2.5 px-4 text-center font-bold text-slate-800">{enteral.freeWaterMl} ml + {enteral.additionalWaterFlushesMl} ml</td>
                        <td className="py-2.5 px-4 text-center font-extrabold text-cyan-800">{enteral.totalFluidMl} ml Hídricos Totales</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Artisanal Ingredients Breakdown Table if applicable */}
                {enteral.type === 'artisanal' && enteral.artisanalIngredients && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-amber-50 px-4 py-2.5 font-bold text-xs text-amber-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Ingredientes y Porciones de la Fórmula Artesanal</span>
                      <span className="font-normal text-[11px] text-amber-800">Homogeneización & Tamizado</span>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                          <th className="py-2.5 px-4 text-left">Ingrediente Clínico</th>
                          <th className="py-2.5 px-4 text-center">Porciones / Medidas</th>
                          <th className="py-2.5 px-4 text-center">Aporte Calórico</th>
                          <th className="py-2.5 px-4 text-center">Proteínas (g)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {enteral.artisanalIngredients.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-2 px-4 font-semibold text-slate-900">{item.ingredient.name}</td>
                            <td className="py-2 px-4 text-center font-bold text-amber-800">{item.quantity} x {item.ingredient.portionUnit}</td>
                            <td className="py-2 px-4 text-center text-slate-700">{Math.round(item.ingredient.calories * item.quantity)} kcal</td>
                            <td className="py-2 px-4 text-center font-semibold text-blue-700">{Math.round(item.ingredient.protein * item.quantity)}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Preparation and Administration Directives */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Instrucciones de Administración e Higiene de Sonda</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {enteral.preparationNotes.map((note: string, nIdx: number) => (
                      <li key={nIdx} className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Signature Box */}
              <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end print:break-inside-avoid">
                <div className="text-xs text-slate-400 max-w-sm">
                  Prescripción de soporte nutricional enteral especializado · Manejo médico-nutricional hospitalario o ambulatorio.
                </div>
                <div className="text-center w-64">
                  <div className="border-b border-slate-400 h-10 mb-1"></div>
                  <div className="text-xs font-bold text-slate-900">{clinicianName}</div>
                  <div className="text-[11px] text-slate-600 font-semibold">{clinicianLicense}</div>
                  <div className="text-[10px] text-slate-500">Nutriólogo Clínico Responsable</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DOCUMENT 5: NUTRICIÓN PARENTERAL TOTAL (NPT) */}
      {documentType === 'parenteral' && (() => {
        const parenteral: any = patient.activeParenteralPrescription || {
          accessRoute: 'central' as const,
          patientWeightKg: latestConsult?.weightKg || 70,
          totalVolumeMl: 1800,
          aminoAcidTotalGrams: patient.activePrescription.proteinGrams,
          aminoAcidCalories: Math.round(patient.activePrescription.proteinGrams * 4),
          nitrogenGrams: Number((patient.activePrescription.proteinGrams / 6.25).toFixed(1)),
          dextroseTotalGrams: patient.activePrescription.carbGrams,
          dextroseCalories: Math.round(patient.activePrescription.carbGrams * 3.4),
          glucoseInfusionRate: 3.2,
          lipidTotalGrams: patient.activePrescription.fatGrams,
          lipidCalories: Math.round(patient.activePrescription.fatGrams * 9),
          totalCalories: patient.activePrescription.targetCalories,
          calculatedOsmolarity: 1250,
          infusionRateMlPerHour: 75,
        };

        const npcCalories = (parenteral.dextroseCalories || 0) + (parenteral.lipidCalories || 0);
        const npcNitrogenRatio = Math.round(npcCalories / (parenteral.nitrogenGrams || 15));

        return (
          <div className="relative overflow-hidden bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
            {/* Watermark Background Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-10 print:opacity-15">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_t916jdt916jdt916_47844636.jpg"
                alt="Marca de agua"
                className="w-[450px] h-[450px] object-contain"
              />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center p-2 shadow-sm shrink-0">
                    {customLogo ? (
                      <img src={customLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: selectedLogo.svgBadge }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">NutriClinical Pro</h1>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                        PRESCRIPCIÓN DE NUTRICIÓN PARENTERAL (NPT)
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                      {selectedLogo.subtitle || 'Unidad de Mezclas Intravenosas & Soporte Metabólico'}
                    </p>
                    <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                      Especialista: {clinicianName} · {clinicianLicense}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div className="font-bold text-slate-800">Fecha de Emisión:</div>
                  <div>{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="mt-1 text-[11px] text-teal-800 font-semibold">Folio: #NPT-{patient.id.slice(-6)}</div>
                </div>
              </div>

              {/* Patient Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Paciente</span>
                    <span className="font-extrabold text-slate-900 text-sm">{patient.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Edad / Sexo</span>
                    <span className="font-bold text-slate-800">{patient.age} años · {patient.gender === 'male' ? 'Masc.' : 'Fem.'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Peso Actual</span>
                    <span className="font-bold text-slate-800">{parenteral.patientWeightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Vía de Acceso Intravenoso</span>
                    <span className="font-bold text-indigo-900 uppercase">
                      {parenteral.accessRoute === 'central' ? 'Catéter Venoso Central (CVC / PICC)' : 'Vía Venosa Periférica'}
                    </span>
                  </div>
                </div>
              </div>

              {/* NPT Composition Matrix */}
              <div className="space-y-6">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Fórmula 3 en 1 (All-In-One): Macronutrientes & Osmolaridad</span>
                    <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {parenteral.calculatedOsmolarity} mOsm/L
                    </span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="py-2.5 px-4 text-left">Componente Parenteral</th>
                        <th className="py-2.5 px-4 text-center">Gramos / Día</th>
                        <th className="py-2.5 px-4 text-center">Calorías (kcal)</th>
                        <th className="py-2.5 px-4 text-center">Parámetros Clínicos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Aminoácidos Cristalinos (10%)</td>
                        <td className="py-2.5 px-4 text-center font-bold text-blue-700">{parenteral.aminoAcidTotalGrams} g</td>
                        <td className="py-2.5 px-4 text-center font-bold text-slate-800">{parenteral.aminoAcidCalories} kcal</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">Nitrógeno: {parenteral.nitrogenGrams} g N ({(parenteral.aminoAcidTotalGrams / parenteral.patientWeightKg).toFixed(2)} g/kg)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Dextrosa Anhidra (50%)</td>
                        <td className="py-2.5 px-4 text-center font-bold text-amber-700">{parenteral.dextroseTotalGrams} g</td>
                        <td className="py-2.5 px-4 text-center font-bold text-slate-800">{parenteral.dextroseCalories} kcal</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">TIG: {parenteral.glucoseInfusionRate} mg/kg/min</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">Emulsión Lipídica (20% LCT/MCT)</td>
                        <td className="py-2.5 px-4 text-center font-bold text-emerald-700">{parenteral.lipidTotalGrams} g</td>
                        <td className="py-2.5 px-4 text-center font-bold text-slate-800">{parenteral.lipidCalories} kcal</td>
                        <td className="py-2.5 px-4 text-center text-slate-600">{(parenteral.lipidTotalGrams / parenteral.patientWeightKg).toFixed(2)} g/kg/día</td>
                      </tr>
                      <tr className="bg-slate-50/70 font-bold">
                        <td className="py-3 px-4 text-slate-900">Totales de la Mezcla</td>
                        <td className="py-3 px-4 text-center text-slate-900">Volumen: {parenteral.totalVolumeMl} ml</td>
                        <td className="py-3 px-4 text-center text-teal-800 text-sm">{parenteral.totalCalories} kcal</td>
                        <td className="py-3 px-4 text-center text-indigo-800">Ratio Kcal NPC / g N: {npcNitrogenRatio}:1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Infusion Rate and Safety Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5">
                    <div className="font-bold text-indigo-900 uppercase text-[10px]">Parámetros de Infusión Intravenosa</div>
                    <div className="text-slate-800 font-semibold">• Velocidad Continua: {parenteral.infusionRateMlPerHour} ml/hora (durante 24 horas continuas)</div>
                    <div className="text-slate-600">• Emplear bomba de infusión volumétrica con filtro en línea de 1.2 micras para lípidos</div>
                    <div className="text-slate-600">• Monitoreo glucémico capilar cada 6 horas las primeras 48 horas</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-800 uppercase text-[10px]">Electrolitos & Micronutrientes Añadidos</div>
                    <div className="text-slate-600">• Sodio: 1-2 mEq/kg · Potasio: 1 mEq/kg · Calcio: 10-15 mEq</div>
                    <div className="text-slate-600">• Magnesio: 8-20 mEq · Fósforo orgánico: 20-40 mmol</div>
                    <div className="text-slate-600">• Multivitaminas MVI Adulto: 1 ampolleta/día · Oligoelementos traza: 1 ampolleta/día</div>
                  </div>
                </div>
              </div>

              {/* Signature Box */}
              <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end print:break-inside-avoid">
                <div className="text-xs text-slate-400 max-w-sm">
                  Orden médica de nutrición parenteral total para preparación aséptica en campana de flujo laminar.
                </div>
                <div className="text-center w-64">
                  <div className="border-b border-slate-400 h-10 mb-1"></div>
                  <div className="text-xs font-bold text-slate-900">{clinicianName}</div>
                  <div className="text-[11px] text-slate-600 font-semibold">{clinicianLicense}</div>
                  <div className="text-[10px] text-slate-500">Nutriólogo Clínico Responsable</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DOCUMENT 6: LISTA DE SUPERMERCADO & COMPRAS */}
      {documentType === 'groceries' && (() => {
        const groceryItems = (plan && plan.groceryList && plan.groceryList.length > 0)
          ? plan.groceryList
          : [
              { category: 'Verduras & Hortalizas', items: ['Espinacas frescas', 'Calabacita tierna', 'Nopales', 'Brócoli', 'Jitomate guaje', 'Pepino'] },
              { category: 'Frutas Frescas', items: ['Manzana verde', 'Fresas frescas', 'Plátano dominico', 'Limón verde'] },
              { category: 'Cereales & Granos', items: ['Avena entera en hojuelas', 'Tortillas de maíz nixtamalizado', 'Quinoa', 'Arroz integral', 'Tostadas horneadas'] },
              { category: 'Proteínas & Carnes', items: ['Pechuga de pollo sin piel', 'Filete de pescado blanco', 'Huevos frescos', 'Atún en agua'] },
              { category: 'Lácteos & Derivados', items: ['Yogur griego sin azúcar', 'Queso panela fresco artesanal', 'Leche descremada'] },
              { category: 'Grasas Saludables & Semillas', items: ['Aceite de oliva virgen extra', 'Aguacate hass', 'Nueces y almendras', 'Semillas de chía'] },
            ];

        return (
          <div className="relative overflow-hidden bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
            {/* Watermark Background Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-10 print:opacity-15">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_t916jdt916jdt916_47844636.jpg"
                alt="Marca de agua"
                className="w-[450px] h-[450px] object-contain"
              />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center p-2 shadow-sm shrink-0">
                    {customLogo ? (
                      <img src={customLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: selectedLogo.svgBadge }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">NutriClinical Pro</h1>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        GUÍA DE COMPRAS & SUPERMERCADO
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                      {selectedLogo.subtitle || 'Planeación Dietética Inteligente'}
                    </p>
                    <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                      Nutriólogo: {clinicianName} · {clinicianLicense}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div className="font-bold text-slate-800">Fecha:</div>
                  <div>{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="mt-1 text-[11px] text-teal-800 font-semibold">Paciente: {patient.fullName}</div>
                </div>
              </div>

              {/* Patient Banner */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mb-6 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm">{patient.fullName}</span>
                  <div className="text-slate-600 mt-0.5">
                    Lista consolidada para cubrir exactamente las porciones prescritas de tu plan nutricional clínico.
                  </div>
                </div>
                <div className="text-right font-bold text-emerald-800">
                  Meta: {patient.activePrescription.targetCalories} kcal / día
                </div>
              </div>

              {/* Grocery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {groceryItems.map((group, gIdx) => (
                  <div key={gIdx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
                      <span>{group.category}</span>
                      <span className="text-[10px] text-slate-500">({group.items.length})</span>
                    </h3>
                    <ul className="space-y-2 text-xs">
                      {group.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-center gap-2.5 text-slate-700">
                          <span className="w-3.5 h-3.5 rounded border border-slate-400 inline-block shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Shopping Tips */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 uppercase text-[10px]">Consejos Clínicos para tus Compras</div>
                <p className="text-slate-600">• Elige verduras y frutas de temporada, firmes y de colores vivos.</p>
                <p className="text-slate-600">• Revisa que los panes y tostadas no contengan azúcares añadidos ni jarabe de maíz de alta fructosa en los primeros ingredientes.</p>
                <p className="text-slate-600">• Evita comprar alimentos procesados con sellos de exceso de sodio o grasas saturadas.</p>
              </div>

              {/* Signature Box */}
              <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end print:break-inside-avoid">
                <div className="text-xs text-slate-400 max-w-sm">
                  Lista de compras personalizada generada con el Sistema Mexicano de Alimentos Equivalentes (SMAE).
                </div>
                <div className="text-center w-64">
                  <div className="border-b border-slate-400 h-10 mb-1"></div>
                  <div className="text-xs font-bold text-slate-900">{clinicianName}</div>
                  <div className="text-[11px] text-slate-600 font-semibold">{clinicianLicense}</div>
                  <div className="text-[10px] text-slate-500">Nutriólogo Clínico Responsable</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DOCUMENT 7: TABLA DE EQUIVALENTES (SMAE) */}
      {documentType === 'equivalents' && (() => {
        return (
          <div className="relative overflow-hidden bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
            {/* Watermark Background Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-10 print:opacity-15">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_t916jdt916jdt916_47844636.jpg"
                alt="Marca de agua"
                className="w-[450px] h-[450px] object-contain"
              />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center p-2 shadow-sm shrink-0">
                    {customLogo ? (
                      <img src={customLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: selectedLogo.svgBadge }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">NutriClinical Pro</h1>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        TABLA CLÍNICA DE EQUIVALENTES (SMAE)
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                      {selectedLogo.subtitle || 'Sistema Mexicano de Alimentos Equivalentes Oficial'}
                    </p>
                    <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                      Nutriólogo: {clinicianName} · {clinicianLicense}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div className="font-bold text-slate-800">Fecha:</div>
                  <div>{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="mt-1 text-[11px] text-teal-800 font-semibold">Paciente: {patient.fullName}</div>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 mb-6 text-xs space-y-1">
                <div className="font-bold text-amber-900">¿Cómo usar tu tabla de equivalentes?</div>
                <p className="text-slate-700">
                  Los alimentos dentro del mismo grupo aportan prácticamente las mismas calorías y nutrimentos. Puedes sustituir 1 porción de un alimento por 1 porción de cualquier otro de su misma fila para variar tus platillos sin alterar tu plan nutricional.
                </p>
              </div>

              {/* Comprehensive SMAE Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="py-2.5 px-3 text-left">Grupo de Alimentos</th>
                      <th className="py-2.5 px-2 text-center">Energía (kcal)</th>
                      <th className="py-2.5 px-2 text-center">Prot (g)</th>
                      <th className="py-2.5 px-2 text-center">Carb (g)</th>
                      <th className="py-2.5 px-2 text-center">Grasa (g)</th>
                      <th className="py-2.5 px-3 text-left">Ejemplos de 1 Equivalente (Ración)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(Object.keys(SMAE_GROUP_INFO) as SmaeCategory[]).map((catKey) => {
                      const info = SMAE_GROUP_INFO[catKey];
                      const examples = SMAE_DATABASE.filter((f) => f.category === catKey).slice(0, 3);
                      return (
                        <tr key={catKey} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{info.label}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-slate-800">{info.baseCal}</td>
                          <td className="py-2.5 px-2 text-center text-blue-600 font-semibold">{info.baseProt}</td>
                          <td className="py-2.5 px-2 text-center text-amber-600 font-semibold">{info.baseCarb}</td>
                          <td className="py-2.5 px-2 text-center text-emerald-600 font-semibold">{info.baseFat}</td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            {examples.map((ex) => `${ex.name} (${ex.servingPortion})`).join(' · ') || 'Ver base SMAE'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signature Box */}
              <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end print:break-inside-avoid">
                <div className="text-xs text-slate-400 max-w-sm">
                  Documento de educación alimentaria para el paciente basado en el SMAE 4ta/5ta Edición.
                </div>
                <div className="text-center w-64">
                  <div className="border-b border-slate-400 h-10 mb-1"></div>
                  <div className="text-xs font-bold text-slate-900">{clinicianName}</div>
                  <div className="text-[11px] text-slate-600 font-semibold">{clinicianLicense}</div>
                  <div className="text-[10px] text-slate-500">Nutriólogo Clínico Responsable</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DOCUMENT 8: HIDRATACIÓN, GUÍAS CLÍNICAS & PRESCRIPCIÓN DE ACTIVIDAD FÍSICA */}
      {documentType === 'hydration_guides' && (() => {
        const exercise = getPatientExercisePrescription(patient);
        const hydrationLiters = plan?.hydrationLiters || 2.2;

        return (
          <div className="relative overflow-hidden bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
            {/* Watermark Background Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-10 print:opacity-15">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_t916jdt916jdt916_47844636.jpg"
                alt="Marca de agua"
                className="w-[450px] h-[450px] object-contain"
              />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center p-2 shadow-sm shrink-0">
                    {customLogo ? (
                      <img src={customLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: selectedLogo.svgBadge }} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">NutriClinical Pro</h1>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        HIDRATACIÓN & ACTIVIDAD FÍSICA CLÍNICA
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                      {selectedLogo.subtitle || 'Prescripción Integral de Estilo de Vida'}
                    </p>
                    <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                      Nutriólogo: {clinicianName} · {clinicianLicense}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div className="font-bold text-slate-800">Fecha:</div>
                  <div>{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="mt-1 text-[11px] text-teal-800 font-semibold">Paciente: {patient.fullName}</div>
                </div>
              </div>

              {/* Patient Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Paciente</span>
                    <span className="font-extrabold text-slate-900 text-sm">{patient.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Edad / Sexo</span>
                    <span className="font-bold text-slate-800">{patient.age} años · {patient.gender === 'male' ? 'Masc.' : 'Fem.'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Peso / IMC</span>
                    <span className="font-bold text-slate-800">{latestConsult?.weightKg || 70} kg (IMC: {latestConsult?.bmi || 24.2})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Condiciones Evaluadas</span>
                    <span className="font-bold text-slate-800">
                      {patient.pathologies.map((p) => PATHOLOGY_INFO[p]?.name.split(' (')[0]).join(', ') || 'General / Saludable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 1: HYDRATION PRESCRIPTION */}
              <div className="space-y-4 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>1. Prescripción de Hidratación Diaria</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-900 uppercase">Meta Diaria Recomendada</span>
                      <div className="text-2xl font-black text-blue-800 mt-1">{hydrationLiters} Litros</div>
                    </div>
                    <div className="text-[11px] text-blue-700 mt-2">
                      Aprox. {Math.round(hydrationLiters / 0.25)} vasos de agua natural al día
                    </div>
                  </div>

                  <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">Horarios Clave de Hidratación</span>
                    <div className="space-y-1 text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-700">• Al despertar:</span>
                        <span>1 vaso (250 ml) para rehidratar el organismo y activar el metabolismo.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-700">• Media mañana y tarde:</span>
                        <span>Tomar pequeños sorbos constantes entre comidas principales.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-700">• Con las comidas:</span>
                        <span>Moderar la cantidad a 1/2 vaso para no diluir los jugos gástricos.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PHYSICAL ACTIVITY PRESCRIPTION */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-teal-600" />
                    <span>2. Prescripción Médica de Actividad Física y Ejercicio Adaptado</span>
                  </h3>
                  <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                    Meta: {exercise.weeklyTargetMinutes} min / semana · {exercise.frequencyDays}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Aerobic */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-teal-900 flex items-center justify-between">
                      <span className="uppercase text-[10px]">A) Ejercicio Aeróbico (Cardiovascular)</span>
                      <span className="text-[10px] text-teal-700 font-semibold">{exercise.aerobic.durationPerSession}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Intensidad:</strong> {exercise.aerobic.intensity}
                    </div>
                    <ul className="space-y-1">
                      {exercise.aerobic.recommended.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-800">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-slate-500 italic mt-1 border-t border-slate-200 pt-1">
                      {exercise.aerobic.tips}
                    </p>
                  </div>

                  {/* Strength */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-teal-900 flex items-center justify-between">
                      <span className="uppercase text-[10px]">B) Fuerza y Resistencia Muscular</span>
                      <span className="text-[10px] text-teal-700 font-semibold">{exercise.strength.frequency}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Intensidad:</strong> {exercise.strength.intensity}
                    </div>
                    <ul className="space-y-1">
                      {exercise.strength.recommended.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-800">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-slate-500 italic mt-1 border-t border-slate-200 pt-1">
                      {exercise.strength.tips}
                    </p>
                  </div>
                </div>

                {/* Flexibility and Clinical Precautions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 uppercase text-[10px] block">
                      C) Flexibilidad, Movilidad y Equilibrio
                    </span>
                    <ul className="space-y-1">
                      {exercise.flexibilityBalance.recommended.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-700">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5">
                    <span className="font-bold text-amber-900 uppercase text-[10px] block flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Precauciones Clínicas de Seguridad</span>
                    </span>
                    <ul className="space-y-1">
                      {exercise.clinicalPrecautions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-800 text-[11px]">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Signature Box */}
              <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end print:break-inside-avoid">
                <div className="text-xs text-slate-400 max-w-sm">
                  Prescripción clínica individualizada acorde a la edad y patología del paciente · NutriClinical Pro.
                </div>
                <div className="text-center w-64">
                  <div className="border-b border-slate-400 h-10 mb-1"></div>
                  <div className="text-xs font-bold text-slate-900">{clinicianName}</div>
                  <div className="text-[11px] text-slate-600 font-semibold">{clinicianLicense}</div>
                  <div className="text-[10px] text-slate-500">Nutriólogo Clínico Responsable</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
