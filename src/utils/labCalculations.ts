import {
  Gender,
  LabMarkerDefinition,
  LabMarkerCategory,
  LabMarkerEvaluation,
  ClinicalLabAlert,
} from '../types/nutrition';

export const LAB_CATEGORIES: { id: LabMarkerCategory; label: string; description: string }[] = [
  {
    id: 'glucidico',
    label: 'Metabolismo Glucídico',
    description: 'Glucosa, Hemoglobina Glucosilada, Insulina y HOMA-IR',
  },
  {
    id: 'lipidico',
    label: 'Perfil Lipídico',
    description: 'Colesterol Total, HDL, LDL, VLDL y Triglicéridos',
  },
  {
    id: 'renal_electrolitos',
    label: 'Función Renal & Electrolitos',
    description: 'Creatinina, eGFR, BUN, Urea, Ácido Úrico, Na+, K+, P, Ca',
  },
  {
    id: 'hepatico',
    label: 'Perfil Hepático & Enzimas',
    description: 'ALT (TGP), AST (TGO), GGT, Fosfatasa Alcalina, Bilirrubina',
  },
  {
    id: 'hematologia_nutricional',
    label: 'Nutrientes & Hematología',
    description: 'Albúmina, Hemoglobina, Ferritina, Vitamina D (25-OH)',
  },
];

export const LAB_MARKERS: LabMarkerDefinition[] = [
  // --- METABOLISMO GLUCÍDICO ---
  {
    id: 'glucose',
    name: 'Glucosa en Ayuno',
    shortName: 'Glucosa',
    unit: 'mg/dL',
    category: 'glucidico',
    refMale: { min: 70, max: 99, criticalMin: 55, criticalMax: 200 },
    refFemale: { min: 70, max: 99, criticalMin: 55, criticalMax: 200 },
    optimalTarget: '70 - 99 mg/dL en ayuno (< 140 mg/dL postprandial 2h)',
    clinicalSignificance: 'Parámetro cardinal para diagnóstico de intolerancia a carbohidratos, prediabetes y diabetes según ADA.',
  },
  {
    id: 'hba1c',
    name: 'Hemoglobina Glucosilada (HbA1c)',
    shortName: 'HbA1c',
    unit: '%',
    category: 'glucidico',
    refMale: { min: 4.0, max: 5.6, criticalMin: 3.5, criticalMax: 9.0 },
    refFemale: { min: 4.0, max: 5.6, criticalMin: 3.5, criticalMax: 9.0 },
    optimalTarget: '< 5.7% (Normoglucemia) · Meta en DM2: < 7.0%',
    clinicalSignificance: 'Promedio glucémico de los últimos 90-120 días. Predice riesgo de complicaciones micro y macrovasculares.',
  },
  {
    id: 'fasting_insulin',
    name: 'Insulina Basal en Ayuno',
    shortName: 'Insulina',
    unit: 'µUI/mL',
    category: 'glucidico',
    refMale: { min: 2.6, max: 24.9, criticalMin: 1.5, criticalMax: 35.0 },
    refFemale: { min: 2.6, max: 24.9, criticalMin: 1.5, criticalMax: 35.0 },
    optimalTarget: '< 10.0 µUI/mL para sensibilidad óptima',
    clinicalSignificance: 'Hiperinsulinemia compensatoria ante resistencia periférica. Base para el cálculo de HOMA-IR.',
  },

  // --- PERFIL LIPÍDICO ---
  {
    id: 'cholesterol_total',
    name: 'Colesterol Total',
    shortName: 'Colesterol Tot.',
    unit: 'mg/dL',
    category: 'lipidico',
    refMale: { min: 120, max: 199, criticalMax: 300 },
    refFemale: { min: 120, max: 199, criticalMax: 300 },
    optimalTarget: '< 200 mg/dL deseable',
    clinicalSignificance: 'Concentración global de lipoproteínas circulantes. Evaluador de aterogénesis.',
  },
  {
    id: 'triglycerides',
    name: 'Triglicéridos en Ayuno',
    shortName: 'Triglicéridos',
    unit: 'mg/dL',
    category: 'lipidico',
    refMale: { min: 40, max: 149, criticalMax: 500 },
    refFemale: { min: 40, max: 149, criticalMax: 500 },
    optimalTarget: '< 150 mg/dL normal (< 100 mg/dL óptimo metabólico)',
    clinicalSignificance: 'Lípidos derivados de lipogénesis hepática de carbohidratos y alcohol. Riesgo de pancreatitis si >= 500 mg/dL.',
  },
  {
    id: 'hdl',
    name: 'Colesterol HDL (Cardioprotector)',
    shortName: 'HDL',
    unit: 'mg/dL',
    category: 'lipidico',
    refMale: { min: 40, max: 80, criticalMin: 30 },
    refFemale: { min: 50, max: 90, criticalMin: 35 },
    optimalTarget: 'Hombre: > 50 mg/dL · Mujer: > 60 mg/dL',
    clinicalSignificance: 'Transporte reverso de colesterol al hígado. Un valor bajo representa factor de riesgo cardiovascular independiente.',
  },
  {
    id: 'ldl',
    name: 'Colesterol LDL (Aterogénico)',
    shortName: 'LDL',
    unit: 'mg/dL',
    category: 'lipidico',
    refMale: { min: 50, max: 99, criticalMax: 190 },
    refFemale: { min: 50, max: 99, criticalMax: 190 },
    optimalTarget: '< 100 mg/dL (< 70 mg/dL en diabéticos o con riesgo cardiovascular alto)',
    clinicalSignificance: 'Partícula aterogénica primaria. Infiltra el endotelio arterial formando placas ateroscleróticas.',
  },
  {
    id: 'vldl',
    name: 'Colesterol VLDL',
    shortName: 'VLDL',
    unit: 'mg/dL',
    category: 'lipidico',
    refMale: { min: 5, max: 30, criticalMax: 60 },
    refFemale: { min: 5, max: 30, criticalMax: 60 },
    optimalTarget: '< 30 mg/dL',
    clinicalSignificance: 'Lipoproteínas de muy baja densidad ricas en triglicéridos endógenos.',
  },

  // --- FUNCIÓN RENAL & ELECTROLITOS ---
  {
    id: 'creatinine',
    name: 'Creatinina Sérica',
    shortName: 'Creatinina',
    unit: 'mg/dL',
    category: 'renal_electrolitos',
    refMale: { min: 0.7, max: 1.25, criticalMin: 0.4, criticalMax: 3.0 },
    refFemale: { min: 0.55, max: 1.05, criticalMin: 0.35, criticalMax: 2.5 },
    optimalTarget: '0.7 - 1.1 mg/dL',
    clinicalSignificance: 'Subproducto del catabolismo muscular fosfocreatina. Filtrado enteramente por glomérulo.',
  },
  {
    id: 'bun',
    name: 'Nitrógeno Ureico en Sangre (BUN)',
    shortName: 'BUN',
    unit: 'mg/dL',
    category: 'renal_electrolitos',
    refMale: { min: 7, max: 20, criticalMax: 50 },
    refFemale: { min: 7, max: 20, criticalMax: 50 },
    optimalTarget: '10 - 18 mg/dL',
    clinicalSignificance: 'Refleja ingesta proteica y capacidad de aclaramiento renal. Elevado en deshidratación y catabolismo.',
  },
  {
    id: 'urea',
    name: 'Urea Sérica',
    shortName: 'Urea',
    unit: 'mg/dL',
    category: 'renal_electrolitos',
    refMale: { min: 15, max: 45, criticalMax: 100 },
    refFemale: { min: 15, max: 45, criticalMax: 100 },
    optimalTarget: '20 - 40 mg/dL',
    clinicalSignificance: 'Toxina urémica principal formada en el hígado a partir de amonio por desaminación de aminoácidos.',
  },
  {
    id: 'egfr',
    name: 'Tasa de Filtración Glomerular Estimada (eGFR CKD-EPI)',
    shortName: 'eGFR (TFG)',
    unit: 'mL/min/1.73m²',
    category: 'renal_electrolitos',
    refMale: { min: 90, max: 140, criticalMin: 30 },
    refFemale: { min: 90, max: 140, criticalMin: 30 },
    optimalTarget: '>= 90 mL/min/1.73m² (Estadio 1 Normal)',
    clinicalSignificance: 'Capacidad funcional de depuración de nefronas. <60 indica daño renal crónico persistente (KDIGO).',
  },
  {
    id: 'uric_acid',
    name: 'Ácido Úrico',
    shortName: 'Ácido Úrico',
    unit: 'mg/dL',
    category: 'renal_electrolitos',
    refMale: { min: 3.5, max: 7.2, criticalMax: 9.5 },
    refFemale: { min: 2.6, max: 6.0, criticalMax: 8.5 },
    optimalTarget: '< 6.0 mg/dL para prevenir precipitación de urato monosódico',
    clinicalSignificance: 'Producto final de degradación de purinas. > 7 mg/dL precipita cristales en articulaciones (gota) y túbulos renales.',
  },
  {
    id: 'sodium',
    name: 'Sodio Sérico (Na+)',
    shortName: 'Sodio Na+',
    unit: 'mEq/L',
    category: 'renal_electrolitos',
    refMale: { min: 135, max: 145, criticalMin: 125, criticalMax: 155 },
    refFemale: { min: 135, max: 145, criticalMin: 125, criticalMax: 155 },
    optimalTarget: '138 - 142 mEq/L',
    clinicalSignificance: 'Principal catión extracelular. Regula osmolaridad y volumen plasmático.',
  },
  {
    id: 'potassium',
    name: 'Potasio Sérico (K+)',
    shortName: 'Potasio K+',
    unit: 'mEq/L',
    category: 'renal_electrolitos',
    refMale: { min: 3.5, max: 5.1, criticalMin: 3.0, criticalMax: 6.0 },
    refFemale: { min: 3.5, max: 5.1, criticalMin: 3.0, criticalMax: 6.0 },
    optimalTarget: '4.0 - 4.8 mEq/L',
    clinicalSignificance: 'Principal catión intracelular. Crítico en excitabilidad miocárdica. > 5.2 mEq/L en renales exige restricción dietética.',
  },
  {
    id: 'phosphorus',
    name: 'Fósforo Sérico (P)',
    shortName: 'Fósforo P',
    unit: 'mg/dL',
    category: 'renal_electrolitos',
    refMale: { min: 2.5, max: 4.5, criticalMin: 1.8, criticalMax: 6.0 },
    refFemale: { min: 2.5, max: 4.5, criticalMin: 1.8, criticalMax: 6.0 },
    optimalTarget: '3.0 - 4.2 mg/dL',
    clinicalSignificance: 'Regulación óseo-mineral. Hiperfosfatemia produce calcificación vascular y estimula hormona PTH y FGF-23.',
  },
  {
    id: 'calcium',
    name: 'Calcio Total Sérico (Ca)',
    shortName: 'Calcio Ca',
    unit: 'mg/dL',
    category: 'renal_electrolitos',
    refMale: { min: 8.5, max: 10.2, criticalMin: 7.5, criticalMax: 11.5 },
    refFemale: { min: 8.5, max: 10.2, criticalMin: 7.5, criticalMax: 11.5 },
    optimalTarget: '8.8 - 9.8 mg/dL',
    clinicalSignificance: 'Mineralización esquelética y señalización neuromuscular.',
  },

  // --- PERFIL HEPÁTICO ---
  {
    id: 'alt_tgp',
    name: 'Alanina Aminotransferasa (ALT / TGP)',
    shortName: 'ALT / TGP',
    unit: 'U/L',
    category: 'hepatico',
    refMale: { min: 7, max: 55, criticalMax: 150 },
    refFemale: { min: 7, max: 45, criticalMax: 130 },
    optimalTarget: '< 30 U/L',
    clinicalSignificance: 'Enzima citosólica altamente específica de hepatocitos. Se eleva en esteatosis hepática (hígado graso) y hepatitis.',
  },
  {
    id: 'ast_tgo',
    name: 'Aspartato Aminotransferasa (AST / TGO)',
    shortName: 'AST / TGO',
    unit: 'U/L',
    category: 'hepatico',
    refMale: { min: 10, max: 40, criticalMax: 120 },
    refFemale: { min: 10, max: 35, criticalMax: 110 },
    optimalTarget: '< 30 U/L',
    clinicalSignificance: 'Enzima mitocondrial hepática, cardíaca y muscular. Su cociente AST/ALT orienta la causa de daño.',
  },
  {
    id: 'ggt',
    name: 'Gamma Glutamil Transferasa (GGT)',
    shortName: 'GGT',
    unit: 'U/L',
    category: 'hepatico',
    refMale: { min: 9, max: 50, criticalMax: 150 },
    refFemale: { min: 9, max: 40, criticalMax: 120 },
    optimalTarget: '< 35 U/L',
    clinicalSignificance: 'Marcador sensible de colestasis biliar, esteatohepatitis no alcohólica y consumo crónico de alcohol.',
  },
  {
    id: 'alkaline_phosphatase',
    name: 'Fosfatasa Alcalina (FA)',
    shortName: 'Fosf. Alcalina',
    unit: 'U/L',
    category: 'hepatico',
    refMale: { min: 40, max: 130, criticalMax: 250 },
    refFemale: { min: 35, max: 120, criticalMax: 230 },
    optimalTarget: '50 - 100 U/L',
    clinicalSignificance: 'Isoenzima biliar y ósea. Se eleva en obstrucción biliar e hiperparatiroidismo secundario.',
  },
  {
    id: 'bilirubin_total',
    name: 'Bilirrubina Total',
    shortName: 'Bilirrubina Tot.',
    unit: 'mg/dL',
    category: 'hepatico',
    refMale: { min: 0.2, max: 1.2, criticalMax: 3.0 },
    refFemale: { min: 0.2, max: 1.2, criticalMax: 3.0 },
    optimalTarget: '< 1.0 mg/dL',
    clinicalSignificance: 'Pigmento derivado de la hemoglobina. Elevaciones > 2.0 producen ictericia clínica.',
  },

  // --- NUTRIENTES & HEMATOLOGÍA ---
  {
    id: 'albumin',
    name: 'Albúmina Sérica',
    shortName: 'Albúmina',
    unit: 'g/dL',
    category: 'hematologia_nutricional',
    refMale: { min: 3.5, max: 5.2, criticalMin: 2.8 },
    refFemale: { min: 3.5, max: 5.2, criticalMin: 2.8 },
    optimalTarget: '>= 4.0 g/dL',
    clinicalSignificance: 'Proteína plasmática principal. < 3.5 g/dL indica desnutrición proteico-calórica, inflamación crónica o proteinuria.',
  },
  {
    id: 'hemoglobin',
    name: 'Hemoglobina (Hb)',
    shortName: 'Hemoglobina',
    unit: 'g/dL',
    category: 'hematologia_nutricional',
    refMale: { min: 13.5, max: 17.5, criticalMin: 10.0, criticalMax: 19.0 },
    refFemale: { min: 12.0, max: 15.5, criticalMin: 9.5, criticalMax: 17.5 },
    optimalTarget: 'H: 14 - 16 g/dL · M: 12.5 - 14.5 g/dL',
    clinicalSignificance: 'Proteína transportadora de oxígeno. Criterio de anemia si < 13.0 (H) o < 12.0 (M) según la OMS.',
  },
  {
    id: 'ferritin',
    name: 'Ferritina Sérica',
    shortName: 'Ferritina',
    unit: 'ng/mL',
    category: 'hematologia_nutricional',
    refMale: { min: 30, max: 300, criticalMin: 15, criticalMax: 600 },
    refFemale: { min: 20, max: 200, criticalMin: 12, criticalMax: 500 },
    optimalTarget: '50 - 150 ng/mL',
    clinicalSignificance: 'Reserva tisular de hierro corporal. < 30 ng/mL confirma ferropenia antes de que caiga la hemoglobina.',
  },
  {
    id: 'vitamin_d',
    name: 'Vitamina D 25-Hidroxi (25-OH)',
    shortName: 'Vitamina D 25-OH',
    unit: 'ng/mL',
    category: 'hematologia_nutricional',
    refMale: { min: 30, max: 80, criticalMin: 15, criticalMax: 100 },
    refFemale: { min: 30, max: 80, criticalMin: 15, criticalMax: 100 },
    optimalTarget: '35 - 60 ng/mL suficiencia óptima',
    clinicalSignificance: 'Regulador endócrino de absorción de calcio, inmunidad celular y síntesis muscular. < 20 es deficiencia severa.',
  },
];

/**
 * CKD-EPI 2021 eGFR equation (standard without race variable)
 */
export function calculateCkdEpiEgfr(
  creatinineMgDl: number,
  age: number,
  gender: Gender
): number {
  if (!creatinineMgDl || creatinineMgDl <= 0 || !age || age <= 0) return 0;

  const isFemale = gender === 'female';
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const femaleFactor = isFemale ? 1.012 : 1.0;

  const scrOverKappa = creatinineMgDl / kappa;
  const minTerm = Math.min(scrOverKappa, 1);
  const maxTerm = Math.max(scrOverKappa, 1);

  const egfr =
    142 *
    Math.pow(minTerm, alpha) *
    Math.pow(maxTerm, -1.2) *
    Math.pow(0.9938, age) *
    femaleFactor;

  return Math.round(egfr * 10) / 10;
}

/**
 * Calculates HOMA-IR index (Homeostatic Model Assessment of Insulin Resistance)
 * HOMA-IR = (Glucosa mg/dL * Insulina basal µUI/mL) / 405
 */
export function calculateHomaIr(glucoseMgDl: number, insulinUuMl: number): number {
  if (!glucoseMgDl || !insulinUuMl || glucoseMgDl <= 0 || insulinUuMl <= 0) return 0;
  return Math.round(((glucoseMgDl * insulinUuMl) / 405) * 100) / 100;
}

/**
 * Evaluates an individual laboratory marker against gender-specific clinical reference ranges
 */
export function evaluateMarkerValue(
  markerId: string,
  value: number,
  gender: Gender
): LabMarkerEvaluation {
  const def = LAB_MARKERS.find((m) => m.id === markerId);
  if (!def) {
    return {
      markerId,
      value,
      status: 'normal',
      statusLabel: 'Normal',
      colorClass: 'text-slate-700',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
      refRangeStr: 'N/A',
      interpretation: 'Sin rango de referencia configurado.',
      isAltered: false,
      isCritical: false,
    };
  }

  const range = gender === 'female' ? def.refFemale : def.refMale;
  const refRangeStr = `${range.min} - ${range.max} ${def.unit}`;

  // Evaluate critical status first
  if (range.criticalMin !== undefined && value <= range.criticalMin) {
    return {
      markerId,
      value,
      status: 'critical_low',
      statusLabel: 'Bajo Crítico',
      colorClass: 'text-rose-700 font-bold',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
      refRangeStr,
      interpretation: `Valor por debajo del umbral de seguridad clínica (<= ${range.criticalMin} ${def.unit}). Requiere atención prioritaria.`,
      isAltered: true,
      isCritical: true,
    };
  }

  if (range.criticalMax !== undefined && value >= range.criticalMax) {
    return {
      markerId,
      value,
      status: 'critical_high',
      statusLabel: 'Elevado Crítico',
      colorClass: 'text-rose-700 font-bold',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
      refRangeStr,
      interpretation: `Valor supera el límite de riesgo agudo (>= ${range.criticalMax} ${def.unit}). Se aconseja intervención médica/nutricional inmediata.`,
      isAltered: true,
      isCritical: true,
    };
  }

  if (value < range.min) {
    return {
      markerId,
      value,
      status: 'low',
      statusLabel: 'Bajo',
      colorClass: 'text-amber-700 font-semibold',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
      refRangeStr,
      interpretation: `Concentración disminuida respecto al límite inferior fisiológico (${range.min} ${def.unit}).`,
      isAltered: true,
      isCritical: false,
    };
  }

  if (value > range.max) {
    return {
      markerId,
      value,
      status: 'high',
      statusLabel: 'Elevado',
      colorClass: 'text-rose-600 font-semibold',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      refRangeStr,
      interpretation: `Concentración por encima del límite superior deseable (${range.max} ${def.unit}).`,
      isAltered: true,
      isCritical: false,
    };
  }

  return {
    markerId,
    value,
    status: 'normal',
    statusLabel: 'En Rango Normal',
    colorClass: 'text-emerald-700 font-medium',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    refRangeStr,
    interpretation: `Dentro de parámetros fisiológicos saludables (${refRangeStr}).`,
    isAltered: false,
    isCritical: false,
  };
}

/**
 * Diagnostic Analysis Engine: Evaluates the entire laboratory panel, identifies combined
 * clinical alterations and generates actionable nutritional recommendations.
 */
export function analyzeFullLabPanel(
  values: Record<string, number>,
  gender: Gender,
  age: number
): {
  totalAnalyzed: number;
  normalCount: number;
  alteredCount: number;
  criticalCount: number;
  homaIr?: number;
  homaStatus?: string;
  egfrCalculated?: number;
  egfrStage?: string;
  alerts: ClinicalLabAlert[];
} {
  const evaluations: LabMarkerEvaluation[] = [];
  const alerts: ClinicalLabAlert[] = [];

  Object.entries(values).forEach(([markerId, val]) => {
    if (val !== undefined && val !== null && !isNaN(val)) {
      evaluations.push(evaluateMarkerValue(markerId, val, gender));
    }
  });

  const normalCount = evaluations.filter((e) => e.status === 'normal').length;
  const alteredCount = evaluations.filter((e) => e.isAltered).length;
  const criticalCount = evaluations.filter((e) => e.isCritical).length;

  // 1. EVALUACIÓN GLUCÍDICA & RESISTENCIA A LA INSULINA
  const glucose = values.glucose;
  const hba1c = values.hba1c;
  const insulin = values.fasting_insulin;
  let homaIr: number | undefined;
  let homaStatus: string | undefined;

  if (glucose && insulin) {
    homaIr = calculateHomaIr(glucose, insulin);
    if (homaIr >= 2.5) {
      homaStatus = 'Resistencia a la Insulina Marcada (HOMA >= 2.5)';
      alerts.push({
        id: 'homa_ir_high',
        title: 'Resistencia a la Insulina (HOMA-IR Elevado)',
        severity: 'warning',
        message: `El índice HOMA-IR es de ${homaIr} (normal < 2.0). Sugiere hiperinsulinemia compensatoria y captación disminuida de glucosa periférica.`,
        nutritionalRecommendation:
          'Prescribir dieta de bajo índice glucémico (< 45% de CHO), aumentar fibra soluble a >= 35 g/día (avena, chía, legumbres) y considerar suplementación con Citrato de Magnesio (400 mg) y Berberina o Ácido Alfa Lipoico.',
        affectedMarkers: ['glucose', 'fasting_insulin'],
      });
    } else if (homaIr >= 2.0) {
      homaStatus = 'Sensibilidad a la Insulina Limítrofe (2.0 - 2.4)';
    } else {
      homaStatus = 'Sensibilidad a la Insulina Óptima (< 2.0)';
    }
  }

  if (glucose && glucose >= 126) {
    alerts.push({
      id: 'glucose_diabetic',
      title: 'Hiperglucemia Franca (Criterio Diagnóstico DM2)',
      severity: 'danger',
      message: `Glucosa en ayuno de ${glucose} mg/dL (criterio ADA >= 126 mg/dL). Alto riesgo de gluco-toxicidad y daño vascular.`,
      nutritionalRecommendation:
        'Eliminar azúcares simples y harinas refinadas. Fraccionar carbohidratos complejos en 4-5 tiempos de comida sincronizados con monitoreo capilar. Incorporar caminata postprandial de 15 minutos.',
      affectedMarkers: ['glucose'],
    });
  } else if (glucose && glucose >= 100 && glucose <= 125) {
    alerts.push({
      id: 'glucose_prediabetes',
      title: 'Glucosa Alterada en Ayuno (Pre-diabetes)',
      severity: 'warning',
      message: `Glucosa de ${glucose} mg/dL en rango de pre-diabetes (100 - 125 mg/dL). Ventana de oportunidad de reversión metabólica con cambios nutricionales.`,
      nutritionalRecommendation:
        'Déficit calórico moderado si hay sobrepeso, priorizar carbohidratos de grano entero con bajo índice glucémico y asegurar aporte adecuado de cromo y magnesio.',
      affectedMarkers: ['glucose'],
    });
  }

  if (hba1c && hba1c >= 6.5) {
    alerts.push({
      id: 'hba1c_high',
      title: 'Hemoglobina Glucosilada Elevada (>= 6.5%)',
      severity: 'danger',
      message: `HbA1c de ${hba1c}%. Confirma descontrol glucémico crónico sostenido en los últimos 3 meses.`,
      nutritionalRecommendation:
        'Meta de HbA1c < 7.0%. Ajustar cuadro dietosintético a 45% carbohidratos complejos ricos en almidón resistente y grasas monoinsaturadas (aceite de oliva virgen extra, aguacate).',
      affectedMarkers: ['hba1c'],
    });
  }

  // 2. EVALUACIÓN DEL PERFIL LIPÍDICO & RIESGO CARDIOVASCULAR
  const tg = values.triglycerides;
  const hdl = values.hdl;
  const ldl = values.ldl;
  const chol = values.cholesterol_total;

  if (tg && tg >= 500) {
    alerts.push({
      id: 'tg_critical',
      title: 'Hipertrigliceridemia Severa (Riesgo Pancreatitis Aguda)',
      severity: 'danger',
      message: `Triglicéridos en ${tg} mg/dL (umbral crítico >= 500 mg/dL). Riesgo inminente de pancreatitis aguda por saturación de quilomicrones.`,
      nutritionalRecommendation:
        'URGENTE: Suspender por completo el alcohol y fructosa/azúcares añadidos. Reducir grasa total a < 15-20% de calorías temporalmente. Suplementar con Omega-3 EPA/DHA de grado farmacéutico (2 a 4 g/día).',
      affectedMarkers: ['triglycerides'],
    });
  } else if (tg && tg >= 200) {
    alerts.push({
      id: 'tg_high',
      title: 'Hipertrigliceridemia Moderada-Alta',
      severity: 'warning',
      message: `Triglicéridos en ${tg} mg/dL (normal < 150 mg/dL). Marcador de sobrecarga de carbohidratos simples y esteatosis hepática.`,
      nutritionalRecommendation:
        'Reducir carbohidratos simples, harinas y jarabes de maíz. Aumentar consumo de pescado azul (salmón, sardinas) y semillas ricas en omega 3.',
      affectedMarkers: ['triglycerides'],
    });
  }

  const hdlMin = gender === 'female' ? 50 : 40;
  if (hdl && hdl < hdlMin) {
    alerts.push({
      id: 'hdl_low',
      title: 'Colesterol HDL Bajo (Riesgo Cardiovascular)',
      severity: 'warning',
      message: `HDL en ${hdl} mg/dL (mínimo deseable: ${hdlMin} mg/dL). Disminuye la capacidad de transporte reverso de colesterol.`,
      nutritionalRecommendation:
        'Fomentar ejercicio aeróbico regular, eliminar grasas trans y sustituir grasas saturadas por aceite de oliva virgen extra y frutos secos crudos (nueces, almendras).',
      affectedMarkers: ['hdl'],
    });
  }

  if (ldl && ldl >= 160) {
    alerts.push({
      id: 'ldl_high',
      title: 'Colesterol LDL Aterogénico Elevado',
      severity: 'danger',
      message: `LDL en ${ldl} mg/dL (deseable < 100 mg/dL). Promueve infiltración y oxidación de placa en las arterias coronarias.`,
      nutritionalRecommendation:
        'Limitar grasas saturadas a < 7% del gasto energético total. Suplementar fitoesteroles (2 g/día) y fibra viscosa (Psyllium husk, avena, pectina de manzana).',
      affectedMarkers: ['ldl'],
    });
  }

  // 3. EVALUACIÓN DE FUNCIÓN RENAL & ÁCIDO ÚRICO
  const creatinine = values.creatinine;
  let egfrCalculated: number | undefined;
  let egfrStage: string | undefined;

  if (creatinine && age) {
    egfrCalculated = calculateCkdEpiEgfr(creatinine, age, gender);
    if (egfrCalculated < 15) {
      egfrStage = 'Estadio 5 (Falla Renal Terminal, eGFR < 15)';
    } else if (egfrCalculated < 30) {
      egfrStage = 'Estadio 4 (Descenso Severo de TFG, 15 - 29)';
    } else if (egfrCalculated < 45) {
      egfrStage = 'Estadio 3b (Descenso Moderado a Severo, 30 - 44)';
    } else if (egfrCalculated < 60) {
      egfrStage = 'Estadio 3a (Descenso Moderado de TFG, 45 - 59)';
    } else if (egfrCalculated < 90) {
      egfrStage = 'Estadio 2 (Descenso Leve de TFG con daño renal, 60 - 89)';
    } else {
      egfrStage = 'Estadio 1 (TFG Normal o Alta >= 90)';
    }

    if (egfrCalculated < 60) {
      alerts.push({
        id: 'renal_impairment',
        title: `Alteración de Función Renal - ${egfrStage}`,
        severity: egfrCalculated < 30 ? 'danger' : 'warning',
        message: `Filtrado glomerular calculado (CKD-EPI) de ${egfrCalculated} mL/min/1.73m² y Creatinina sérica de ${creatinine} mg/dL. Evidencia deterioro renal crónico según guías KDIGO.`,
        nutritionalRecommendation:
          'Ajustar proteína a 0.6 - 0.8 g/kg/día con predominio de alto valor biológico. Control estricto de sodio (< 2,000 mg/día) y vigilar ingesta de fósforo (evitar aditivos inorgánicos) y potasio si está elevado.',
        affectedMarkers: ['creatinine'],
      });
    }
  }

  const uricAcid = values.uric_acid;
  const uricAcidMax = gender === 'female' ? 6.0 : 7.2;
  if (uricAcid && uricAcid > uricAcidMax) {
    alerts.push({
      id: 'hyperuricemia',
      title: 'Hiperuricemia (Ácido Úrico Elevado)',
      severity: uricAcid >= 8.5 ? 'danger' : 'warning',
      message: `Ácido úrico en ${uricAcid} mg/dL (límite: ${uricAcidMax} mg/dL). Riesgo de artritis gotosa aguda y nefrolitiasis por cristales de urato.`,
      nutritionalRecommendation:
        'Prescribir dieta hipopurínica: eliminar carnes rojas grasas, vísceras, mariscos y cerveza. Incrementar hidratación a >= 2.5 - 3.0 L/día para alcalinizar orina. Fomentar cerezas ácidas (tart cherry) y Vitamina C (1000 mg/día).',
      affectedMarkers: ['uric_acid'],
    });
  }

  // 4. ELECTROLITOS CLÍNICOS
  const potassium = values.potassium;
  if (potassium && potassium > 5.1) {
    alerts.push({
      id: 'hyperkalemia',
      title: 'Hiperpotasemia / Hiperkalemia (> 5.1 mEq/L)',
      severity: potassium >= 5.5 ? 'danger' : 'warning',
      message: `Potasio en ${potassium} mEq/L. Riesgo de arritmias cardíacas y alteraciones de conducción miocárdica.`,
      nutritionalRecommendation:
        'Restringir alimentos con alto contenido de potasio (plátano, jitomate concentrado, aguacate, melón, papas, frutos secos). Aplicar técnica de doble cocción y remojo para hortalizas.',
      affectedMarkers: ['potassium'],
    });
  }

  const phosphorus = values.phosphorus;
  if (phosphorus && phosphorus > 4.5) {
    alerts.push({
      id: 'hyperphosphatemia',
      title: 'Hiperfosfatemia (> 4.5 mg/dL)',
      severity: 'warning',
      message: `Fósforo sérico en ${phosphorus} mg/dL. Aumenta el producto Ca x P, calcificación vascular y hormona paratiroidea (PTH).`,
      nutritionalRecommendation:
        'Restricción estricta de fósforo inorgánico (aditivos alimentarios E338-E343 en refrescos oscuros, embutidos y procesados). Limitar lácteos y legumbres no remojadas.',
      affectedMarkers: ['phosphorus'],
    });
  }

  // 5. PERFIL HEPÁTICO & DAÑO HEPATOCELULAR
  const alt = values.alt_tgp;
  const ast = values.ast_tgo;
  const ggt = values.ggt;

  if ((alt && alt > (gender === 'female' ? 45 : 55)) || (ast && ast > 40)) {
    alerts.push({
      id: 'liver_enzymes_high',
      title: 'Elevación de Transaminasas Hepáticas (Patrón Citolítico / Esteatosis)',
      severity: alt && alt > 100 ? 'danger' : 'warning',
      message: `ALT en ${alt || 'N/D'} U/L y AST en ${ast || 'N/D'} U/L. Sugiere inflamación hepatocelular activa compatible con hígado graso (EHNA/MASLD) o sobrecarga metabólica.`,
      nutritionalRecommendation:
        'Protocolo hepatoprotector: dieta mediterránea con alto contenido de polifenoles y antioxidantes. Suplementar Silimarina (Cardo Mariano 300 mg/día) y N-Acetilcisteína (NAC 600 mg/día). Prohibir alcohol.',
      affectedMarkers: ['alt_tgp', 'ast_tgo'],
    });
  }

  // 6. ESTADO NUTRICIONAL, HEMATOLÓGICO Y VITAMINAS
  const albumin = values.albumin;
  if (albumin && albumin < 3.5) {
    alerts.push({
      id: 'hypoalbuminemia',
      title: 'Hipoalbuminemia (Riesgo de Malnutrición Proteica)',
      severity: albumin < 3.0 ? 'danger' : 'warning',
      message: `Albúmina en ${albumin} g/dL (normal >= 3.5 g/dL). Indica balance nitrogenado negativo, desnutrición clínica o pérdida renal/digestiva de proteínas.`,
      nutritionalRecommendation:
        'Incrementar aporte proteico de alto valor biológico (clara de huevo pasteurizada, proteína aislada de suero o fórmulas ricas en albúmina). Monitorear edema y presión oncótica.',
      affectedMarkers: ['albumin'],
    });
  }

  const hemoglobin = values.hemoglobin;
  const hbMin = gender === 'female' ? 12.0 : 13.5;
  if (hemoglobin && hemoglobin < hbMin) {
    alerts.push({
      id: 'anemia',
      title: 'Anemia Clínica (Hemoglobina Disminuida)',
      severity: hemoglobin < 10.0 ? 'danger' : 'warning',
      message: `Hemoglobina en ${hemoglobin} g/dL (umbral normal: ${hbMin} g/dL). Compromete la oxigenación tisular y el rendimiento físico.`,
      nutritionalRecommendation:
        'Prescribir alimentos ricos en hierro hemo (carnes magras) combinados con Vitamina C para maximizar absorción. Suplementar con Bisglicinato Ferroso (mayor tolerancia digestiva) y Ácido Fólico.',
      affectedMarkers: ['hemoglobin'],
    });
  }

  const vitD = values.vitamin_d;
  if (vitD && vitD < 30) {
    alerts.push({
      id: 'vitamin_d_low',
      title: vitD < 20 ? 'Deficiencia Severa de Vitamina D (< 20 ng/mL)' : 'Insuficiencia de Vitamina D (20 - 29 ng/mL)',
      severity: vitD < 20 ? 'danger' : 'warning',
      message: `Vitamina D 25-OH en ${vitD} ng/mL (nivel óptimo: 30 - 60 ng/mL). Afecta la salud ósea, sensibilidad insulínica e inmunidad.`,
      nutritionalRecommendation:
        'Prescribir suplementación con Vitamina D3 (Colecalciferol) 2,000 a 4,000 UI diarias durante 8 a 12 semanas, preferiblemente junto con una comida grasa para optimizar absorción.',
      affectedMarkers: ['vitamin_d'],
    });
  }

  return {
    totalAnalyzed: evaluations.length,
    normalCount,
    alteredCount,
    criticalCount,
    homaIr,
    homaStatus,
    egfrCalculated,
    egfrStage,
    alerts,
  };
}
