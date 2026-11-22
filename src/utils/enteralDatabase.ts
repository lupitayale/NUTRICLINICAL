import {
  CommercialEnteralFormula,
  ArtisanalIngredient,
  EnteralPrescription,
  EnteralRoute,
  EnteralAdministrationMode,
} from '../types/nutrition';

// ===============================================================
// 1. BASE DE DATOS DE FÓRMULAS ENTERALES COMERCIALES (MÉXICO/LATAM)
// ===============================================================
export const COMMERCIAL_FORMULAS: CommercialEnteralFormula[] = [
  {
    id: 'ensure_plus',
    name: 'Ensure Plus',
    brand: 'Abbott',
    category: 'polimerica_estandar',
    caloricDensityKcalMl: 1.5,
    proteinGramsPerLiter: 54.9,
    carbGramsPerLiter: 200.0,
    fatGramsPerLiter: 53.3,
    proteinPercent: 14.7,
    carbPercent: 53.3,
    fatPercent: 32.0,
    osmolarityMOsmKg: 680,
    fiberGramsPerLiter: 0,
    freeWaterPercent: 78,
    containerSizeMl: 237,
    clinicalIndications:
      'Desnutrición calórico-proteica moderada/severa, anorexia, cáncer, aumento de requerimientos energéticos con restricción de volumen.',
    contraindications: 'Galactosemia, alergia a la proteína de leche o soya, vía parenteral.',
  },
  {
    id: 'glucerna_1_5',
    name: 'Glucerna 1.5 Cal',
    brand: 'Abbott',
    category: 'especializada_diabetes',
    caloricDensityKcalMl: 1.5,
    proteinGramsPerLiter: 75.0,
    carbGramsPerLiter: 133.0,
    fatGramsPerLiter: 75.0,
    proteinPercent: 20.0,
    carbPercent: 35.5,
    fatPercent: 44.5,
    osmolarityMOsmKg: 690,
    fiberGramsPerLiter: 16.0,
    freeWaterPercent: 77,
    containerSizeMl: 237,
    clinicalIndications:
      'Pacientes con Diabetes Mellitus Tipo 1 o 2, intolerancia a la glucosa inducida por estrés, hiperglucemia de estrés en UCI.',
    contraindications: 'Galactosemia, alergia severa a la leche o soya.',
  },
  {
    id: 'pulmocare',
    name: 'Pulmocare',
    brand: 'Abbott',
    category: 'especializada_pulmonar',
    caloricDensityKcalMl: 1.5,
    proteinGramsPerLiter: 62.6,
    carbGramsPerLiter: 106.0,
    fatGramsPerLiter: 92.5,
    proteinPercent: 16.7,
    carbPercent: 28.2,
    fatPercent: 55.1,
    osmolarityMOsmKg: 520,
    fiberGramsPerLiter: 0,
    freeWaterPercent: 78,
    containerSizeMl: 237,
    clinicalIndications:
      'Insuficiencia respiratoria, EPOC, ventilación mecánica (reducida en carbohidratos para disminuir el cociente respiratorio RQ y producción de CO2).',
    contraindications: 'Galactosemia, dislipidemia severa descompensada.',
  },
  {
    id: 'nepro_hp',
    name: 'Nepro HP (High Protein)',
    brand: 'Abbott',
    category: 'especializada_renal',
    caloricDensityKcalMl: 1.8,
    proteinGramsPerLiter: 81.0,
    carbGramsPerLiter: 167.0,
    fatGramsPerLiter: 96.0,
    proteinPercent: 18.0,
    carbPercent: 37.0,
    fatPercent: 45.0,
    osmolarityMOsmKg: 705,
    fiberGramsPerLiter: 12.6,
    freeWaterPercent: 73,
    containerSizeMl: 237,
    clinicalIndications:
      'Enfermedad renal crónica con diálisis peritoneal o hemodiálisis; hipercatabolismo con restricción de volumen y electrolitos (bajo en fósforo, potasio y sodio).',
    contraindications: 'Galactosemia, ERC sin terapia de sustitución renal (etapas 3-4 no diálisis).',
  },
  {
    id: 'fresubin_renal',
    name: 'Fresubin Renal',
    brand: 'Fresenius Kabi',
    category: 'especializada_renal',
    caloricDensityKcalMl: 2.0,
    proteinGramsPerLiter: 60.0,
    carbGramsPerLiter: 264.0,
    fatGramsPerLiter: 89.0,
    proteinPercent: 12.0,
    carbPercent: 53.0,
    fatPercent: 35.0,
    osmolarityMOsmKg: 550,
    fiberGramsPerLiter: 12.0,
    freeWaterPercent: 71,
    containerSizeMl: 200,
    clinicalIndications:
      'ERC estadios 3-5 pre-diálisis con necesidad de restricción proteica moderada pero alta densidad calórica y bajo potasio/fósforo.',
    contraindications: 'Pacientes en hemodiálisis de alto flujo que requieran alta proteína.',
  },
  {
    id: 'peptamen_1_5',
    name: 'Peptamen 1.5 (Peptídica)',
    brand: 'Nestlé Health Science',
    category: 'peptidica_oligomerica',
    caloricDensityKcalMl: 1.5,
    proteinGramsPerLiter: 67.6,
    carbGramsPerLiter: 188.0,
    fatGramsPerLiter: 56.4,
    proteinPercent: 18.0,
    carbPercent: 50.0,
    fatPercent: 32.0,
    osmolarityMOsmKg: 550,
    fiberGramsPerLiter: 0,
    freeWaterPercent: 77,
    containerSizeMl: 250,
    clinicalIndications:
      'Síndrome de intestino corto, pancreatitis aguda o crónica, enfermedad inflamatoria intestinal, malabsorción de grasas (70% de grasa en forma de TCM).',
    contraindications: 'Alergia severa confirmada a la proteína de suero de leche de vaca.',
  },
  {
    id: 'jevity_1_5',
    name: 'Jevity 1.5 Cal',
    brand: 'Abbott',
    category: 'hipercalorica_hiperproteica',
    caloricDensityKcalMl: 1.5,
    proteinGramsPerLiter: 63.3,
    carbGramsPerLiter: 169.0,
    fatGramsPerLiter: 50.0,
    proteinPercent: 17.0,
    carbPercent: 54.0,
    fatPercent: 29.0,
    osmolarityMOsmKg: 525,
    fiberGramsPerLiter: 22.0,
    freeWaterPercent: 76,
    containerSizeMl: 237,
    clinicalIndications:
      'Nutrición enteral a largo plazo, prevención y manejo de diarrea o estreñimiento gracias a mezcla de fibra soluble e insoluble con prebióticos FOS.',
    contraindications: 'Obstrucción intestinal mecánica o íleo paralítico.',
  },
  {
    id: 'osmolite_1_2',
    name: 'Osmolite 1.2 Cal',
    brand: 'Abbott',
    category: 'polimerica_estandar',
    caloricDensityKcalMl: 1.2,
    proteinGramsPerLiter: 55.5,
    carbGramsPerLiter: 158.0,
    fatGramsPerLiter: 39.3,
    proteinPercent: 18.5,
    carbPercent: 52.7,
    fatPercent: 28.8,
    osmolarityMOsmKg: 360,
    fiberGramsPerLiter: 0,
    freeWaterPercent: 82,
    containerSizeMl: 237,
    clinicalIndications:
      'Fórmula polimérica isotónica ideal para inicio de tolerancia enteral en pacientes postquirúrgicos o con sensibilidad osmolar.',
    contraindications: 'Galactosemia.',
  },
  {
    id: 'impact_advanced',
    name: 'Impact Advanced Recovery',
    brand: 'Nestlé Health Science',
    category: 'inmunomoduladora',
    caloricDensityKcalMl: 1.4,
    proteinGramsPerLiter: 85.0,
    carbGramsPerLiter: 147.0,
    fatGramsPerLiter: 38.0,
    proteinPercent: 24.0,
    carbPercent: 48.0,
    fatPercent: 28.0,
    osmolarityMOsmKg: 490,
    fiberGramsPerLiter: 0,
    freeWaterPercent: 79,
    containerSizeMl: 250,
    clinicalIndications:
      'Cirugía mayor electiva gastrointestinal, trauma, quemaduras y cicatrización de heridas complejas (enriquecida con Arginina, Ácidos Grasos Omega-3 y Nucleótidos).',
    contraindications: 'Sepsis grave o choque séptico activo no estabilizado.',
  },
];

// ===============================================================
// 2. CATÁLOGO DE INGREDIENTES PARA LICUADOS ENTERALES ARTESANALES
// ===============================================================
export const ARTISANAL_INGREDIENTS: ArtisanalIngredient[] = [
  // PROTEÍNAS
  {
    id: 'pollo_cocido',
    name: 'Pechuga de Pollo Hervida y Molida',
    category: 'proteina',
    portionUnit: '100g (pesado cocido sin piel)',
    gramsPerUnit: 100,
    calories: 165,
    protein: 31.0,
    carbs: 0.0,
    fat: 3.6,
    fiber: 0.0,
    fluidMl: 65,
    viscosityScore: 2,
    tips: 'Hervir muy suave y licuar a máxima potencia con caldo bajo en grasa. Colar en malla fina.',
  },
  {
    id: 'clara_huevo',
    name: 'Clara de Huevo Cocida / Pasteurizada',
    category: 'proteina',
    portionUnit: '3 claras cocidas (100g)',
    gramsPerUnit: 100,
    calories: 52,
    protein: 11.0,
    carbs: 0.7,
    fat: 0.2,
    fiber: 0.0,
    fluidMl: 88,
    viscosityScore: 1,
    tips: 'Excelente fluidez para pasar por sonda sin atascar. Nunca usar cruda para prevenir Salmonella.',
  },
  {
    id: 'proteina_suero',
    name: 'Aislado de Proteína de Suero (Whey Isolate)',
    category: 'suplemento',
    portionUnit: '1 scoop / medida (30g)',
    gramsPerUnit: 30,
    calories: 115,
    protein: 26.0,
    carbs: 1.0,
    fat: 0.5,
    fiber: 0.0,
    fluidMl: 0,
    viscosityScore: 1,
    tips: 'Disolver primero en agua tibia antes de mezclar con el resto del licuado para evitar grumos.',
  },
  {
    id: 'leche_descremada',
    name: 'Leche Descremada / Deslactosada',
    category: 'liquido',
    portionUnit: '1 taza (240ml)',
    gramsPerUnit: 240,
    calories: 84,
    protein: 8.2,
    carbs: 12.0,
    fat: 0.4,
    fiber: 0.0,
    fluidMl: 220,
    viscosityScore: 1,
    tips: 'Vehículo líquido excelente para mejorar solubilidad y calcio si no hay intolerancia severa.',
  },

  // CARBOHIDRATOS / CEREALES
  {
    id: 'avena_cocida',
    name: 'Avena en Hojuelas Bien Cocida',
    category: 'carbohidrato',
    portionUnit: '1/2 taza cocida (120g)',
    gramsPerUnit: 120,
    calories: 85,
    protein: 3.0,
    carbs: 14.5,
    fat: 1.8,
    fiber: 2.0,
    fluidMl: 98,
    viscosityScore: 3,
    tips: 'Al cocinar se gelifica; requiere doble tamizado por colador fino para no obstruir sondas menores a 14 Fr.',
  },
  {
    id: 'arroz_cocido',
    name: 'Arroz Blanco Hervido (al dente)',
    category: 'carbohidrato',
    portionUnit: '1/2 taza cocida (100g)',
    gramsPerUnit: 100,
    calories: 130,
    protein: 2.7,
    carbs: 28.0,
    fat: 0.3,
    fiber: 0.4,
    fluidMl: 68,
    viscosityScore: 2,
    tips: 'Muy fácil digestión, ideal en síndrome diarreico. Licuar con abundante agua hervida.',
  },
  {
    id: 'maltodextrina',
    name: 'Maltodextrina / Miel de Maíz',
    category: 'suplemento',
    portionUnit: '2 cucharadas soperas (30g)',
    gramsPerUnit: 30,
    calories: 114,
    protein: 0.0,
    carbs: 28.5,
    fat: 0.0,
    fiber: 0.0,
    fluidMl: 0,
    viscosityScore: 1,
    tips: 'Aporta calorías limpias de absorción rápida sin espesar el licuado.',
  },

  // VEGETALES COCIDOS
  {
    id: 'chayote_cocido',
    name: 'Chayote Hervido sin Piel',
    category: 'vegetal',
    portionUnit: '1 pieza mediana (150g)',
    gramsPerUnit: 150,
    calories: 28,
    protein: 1.2,
    carbs: 6.8,
    fat: 0.2,
    fiber: 1.8,
    fluidMl: 140,
    viscosityScore: 1,
    tips: 'Excelente volumen líquido y baja osmolalidad. Muy noble con el tracto gastrointestinal.',
  },
  {
    id: 'calabacita_cocida',
    name: 'Calabacita Italiana Hervida (sin semillas)',
    category: 'vegetal',
    portionUnit: '1 pieza mediana (120g)',
    gramsPerUnit: 120,
    calories: 20,
    protein: 1.4,
    carbs: 4.0,
    fat: 0.3,
    fiber: 1.3,
    fluidMl: 112,
    viscosityScore: 1,
    tips: 'Retirar las semillas antes de licuar para evitar atoramiento en la punta de la sonda.',
  },
  {
    id: 'zanahoria_cocida',
    name: 'Zanahoria Hervida y Pelada',
    category: 'vegetal',
    portionUnit: '1 pieza mediana (100g)',
    gramsPerUnit: 100,
    calories: 35,
    protein: 0.8,
    carbs: 8.2,
    fat: 0.2,
    fiber: 2.8,
    fluidMl: 88,
    viscosityScore: 2,
    tips: 'Rica en betacarotenos y pectina para regular motilidad.',
  },

  // FRUTAS COCIDAS
  {
    id: 'manzana_cocida',
    name: 'Manzana Amarilla Hervida en Compota',
    category: 'fruta',
    portionUnit: '1 pieza mediana pelada (130g)',
    gramsPerUnit: 130,
    calories: 68,
    protein: 0.4,
    carbs: 18.0,
    fat: 0.2,
    fiber: 2.5,
    fluidMl: 110,
    viscosityScore: 2,
    tips: 'Siempre hervida y pelada. La pectina ayuda a dar consistencia homogénea al licuado.',
  },
  {
    id: 'platano_maduro',
    name: 'Plátano Tabasco Maduro',
    category: 'fruta',
    portionUnit: '1/2 pieza (60g)',
    gramsPerUnit: 60,
    calories: 54,
    protein: 0.7,
    carbs: 13.8,
    fat: 0.2,
    fiber: 1.6,
    fluidMl: 44,
    viscosityScore: 2,
    tips: 'Aporta potasio y densidad calórica. Si el paciente tiene ERC o hiperpotasemia, restringir.',
  },

  // GRASAS SALUDABLES
  {
    id: 'aceite_canola',
    name: 'Aceite de Canola o Maíz Prensado',
    category: 'grasa',
    portionUnit: '1 cucharada sopera (15ml)',
    gramsPerUnit: 14,
    calories: 120,
    protein: 0.0,
    carbs: 0.0,
    fat: 14.0,
    fiber: 0.0,
    fluidMl: 0,
    viscosityScore: 1,
    tips: 'Emulsionar bien en licuadora a alta velocidad con los demás ingredientes para evitar separación de fases.',
  },
  {
    id: 'aceite_tcm',
    name: 'Aceite de Triglicéridos de Cadena Media (MCT Oil)',
    category: 'grasa',
    portionUnit: '1 cucharada (15ml)',
    gramsPerUnit: 14,
    calories: 115,
    protein: 0.0,
    carbs: 0.0,
    fat: 14.0,
    fiber: 0.0,
    fluidMl: 0,
    viscosityScore: 1,
    tips: 'Absorción directa vía portal sin requerir sales biliares ni lipasa pancreática.',
  },
  {
    id: 'aguacate_hass',
    name: 'Aguacate Hass Machacado',
    category: 'grasa',
    portionUnit: '1/3 pieza (50g)',
    gramsPerUnit: 50,
    calories: 80,
    protein: 1.0,
    carbs: 4.2,
    fat: 7.3,
    fiber: 3.4,
    fluidMl: 36,
    viscosityScore: 3,
    tips: 'Muy rico en ácidos grasos monoinsaturados. Colar meticulosamente.',
  },
];

// ===============================================================
// 3. FUNCIONES DE CÁLCULO DE NUTRICIÓN ENTERAL
// ===============================================================

export interface CommercialCalculationParams {
  patientId: string;
  patientWeightKg: number;
  targetCalories: number;
  targetHydrationLiters: number;
  formula: CommercialEnteralFormula;
  route: EnteralRoute;
  mode: EnteralAdministrationMode;
  infusionHours?: number; // e.g. 24 or 16
  bolusCount?: number; // e.g. 5 bolos
}

export function calculateCommercialEnteral(
  params: CommercialCalculationParams
): EnteralPrescription {
  const {
    patientId,
    patientWeightKg,
    targetCalories,
    targetHydrationLiters,
    formula,
    route,
    mode,
    infusionHours = 24,
    bolusCount = 5,
  } = params;

  // 1. Calculate required volume in ml based on target calories and caloric density
  const totalVolumeMl = Math.round(targetCalories / formula.caloricDensityKcalMl);

  // 2. Calculate containers (cans / bottles) count
  const containersCount = +(totalVolumeMl / formula.containerSizeMl).toFixed(1);

  // 3. Exact macros supplied
  const dailyCalories = Math.round(totalVolumeMl * formula.caloricDensityKcalMl);
  const dailyProteinGrams = Math.round((formula.proteinGramsPerLiter * totalVolumeMl) / 1000);
  const dailyCarbGrams = Math.round((formula.carbGramsPerLiter * totalVolumeMl) / 1000);
  const dailyFatGrams = Math.round((formula.fatGramsPerLiter * totalVolumeMl) / 1000);

  // 4. Free water from the formula
  const freeWaterMl = Math.round((totalVolumeMl * formula.freeWaterPercent) / 100);

  // 5. Additional water flushes required to satisfy total hydration requirement
  const targetTotalWaterMl = Math.round(targetHydrationLiters * 1000);
  const additionalWaterFlushesMl = Math.max(0, targetTotalWaterMl - freeWaterMl);
  const totalFluidMl = totalVolumeMl + additionalWaterFlushesMl;

  // 6. Infusion regimen calculations
  let infusionRateMlPerHour: number | undefined;
  let bolusVolumeMl: number | undefined;
  let bolusIntervalHours: number | undefined;

  if (mode === 'continuous') {
    infusionRateMlPerHour = Math.round(totalVolumeMl / infusionHours);
  } else {
    // Bolus or gravity
    bolusVolumeMl = Math.round(totalVolumeMl / bolusCount);
    bolusIntervalHours = +(24 / bolusCount).toFixed(1);
  }

  // Recommended catheter gauge Fr
  let tubeGaugeFr = 10;
  if (route === 'peg' || route === 'pej') tubeGaugeFr = 14;
  else if (formula.fiberGramsPerLiter > 10) tubeGaugeFr = 12;

  // Preparation and safety clinical notes
  const preparationNotes: string[] = [
    `Fórmula comercial: ${formula.name} (${formula.brand}) - Densidad calórica ${formula.caloricDensityKcalMl} kcal/ml.`,
    `Volumen enteral total: ${totalVolumeMl} ml/día (~${containersCount} frascos/latas de ${formula.containerSizeMl} ml).`,
    `Aporte proteico: ${dailyProteinGrams} g/día (${(dailyProteinGrams / patientWeightKg).toFixed(2)} g/kg/día).`,
    `Agua libre de la fórmula: ${freeWaterMl} ml/día.`,
    `Agua adicional recomendada para lavados de sonda: ${additionalWaterFlushesMl} ml/día distribuidos en bolos de 30-50 ml antes y después de cada administración.`,
    mode === 'continuous'
      ? `Infusión continua por bomba: Iniciar a velocidad gradual (ej. 30 ml/h primeras 8h) hasta alcanzar meta de ${infusionRateMlPerHour} ml/h en ${infusionHours} horas continuas.`
      : `Administración por bolos: Administrar ${bolusCount} tomas al día de ${bolusVolumeMl} ml cada una, con un intervalo de aproximadamente cada ${bolusIntervalHours} horas (pasar lentamente en 20-30 minutos).`,
    `Posición del paciente: Mantener cabecera elevada a 30°-45° (posición semi-Fowler) durante la infusión y hasta 45 minutos después para prevenir broncoaspiración.`,
    `Comprobar residuo gástrico si la vía es gástrica (SNG/PEG) antes de cada bolo. Si el residuo supera 250-500 ml, evaluar tolerancia clínica y motilidad.`,
  ];

  return {
    id: `enteral-${Date.now()}`,
    patientId,
    type: 'commercial',
    formulaName: formula.name,
    route,
    mode,
    totalVolumeMl,
    dailyCalories,
    dailyProteinGrams,
    dailyCarbGrams,
    dailyFatGrams,
    freeWaterMl,
    additionalWaterFlushesMl,
    totalFluidMl,
    commercialFormulaId: formula.id,
    containersCount,
    infusionRateMlPerHour,
    infusionHoursPerDay: infusionHours,
    bolusCount,
    bolusVolumeMl,
    bolusIntervalHours,
    tubeGaugeFr,
    preparationNotes,
    date: new Date().toISOString().split('T')[0],
  };
}

export interface ArtisanalCalculationParams {
  patientId: string;
  patientWeightKg: number;
  addedWaterMl: number;
  route: EnteralRoute;
  mode: EnteralAdministrationMode;
  items: { ingredient: ArtisanalIngredient; quantity: number }[];
  bolusCount?: number;
}

export function calculateArtisanalEnteral(
  params: ArtisanalCalculationParams
): EnteralPrescription {
  const {
    patientId,
    patientWeightKg,
    addedWaterMl,
    route,
    mode,
    items,
    bolusCount = 5,
  } = params;

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalIngredientFluid = 0;

  items.forEach(({ ingredient, quantity }) => {
    totalCalories += ingredient.calories * quantity;
    totalProtein += ingredient.protein * quantity;
    totalCarbs += ingredient.carbs * quantity;
    totalFat += ingredient.fat * quantity;
    totalIngredientFluid += ingredient.fluidMl * quantity;
  });

  const totalVolumeMl = Math.round(totalIngredientFluid + addedWaterMl);
  const caloricDensity = +(totalCalories / (totalVolumeMl || 1)).toFixed(2);
  const freeWaterMl = Math.round(totalIngredientFluid * 0.9 + addedWaterMl);

  const bolusVolumeMl = Math.round(totalVolumeMl / bolusCount);
  const bolusIntervalHours = +(24 / bolusCount).toFixed(1);

  // Artisanal formulas require larger tube gauges due to viscosity and microparticulates
  const tubeGaugeFr = Math.max(14, route === 'peg' ? 16 : 14);

  const preparationNotes: string[] = [
    `Licuado Enteral Artesanal Clínico: Volumen final ${totalVolumeMl} ml con densidad de ${caloricDensity} kcal/ml.`,
    `Aporte nutricional: ${Math.round(totalCalories)} kcal · ${Math.round(totalProtein)}g Proteína (${(totalProtein / patientWeightKg).toFixed(2)} g/kg) · ${Math.round(totalCarbs)}g Carbohidratos · ${Math.round(totalFat)}g Lípidos.`,
    `Técnica de preparación aséptica: Lavado riguroso de manos. Hervir y desinfectar previamente todos los vegetales, carnes y huevo. Utilizar agua hervida potable.`,
    `Licuado de alta potencia: Licuar los ingredientes durante al menos 3 a 5 minutos continuos hasta obtener consistencia homogénea sin grumos.`,
    `Doble colado / tamizado obligatorio: Pasar la mezcla por colador de malla metálica fina o gasa limpia doble para eliminar residuos de fibra insoluble que tapen la sonda.`,
    `Calibre de sonda requerido: Se recomienda sonda Fr 14 o superior (PEG Fr 16-18) para evitar obstrucciones mecánicas.`,
    `Lavado de sonda: Irrigar la sonda con 30 a 50 ml de agua hervida tibia INMEDIATAMENTE antes y después de cada bolo.`,
    `Conservación y caducidad: Conservar en refrigeración (2°C a 6°C) en recipiente hermético limpio por un MÁXIMO de 24 horas. Sacar la porción del bolo 20 minutos antes para atemperar a temperatura ambiente (no calentar en microondas directamente para no coagular proteínas).`,
    `Tiempo de colgado seguro: No mantener el frasco colgado a temperatura ambiente por más de 4 horas continuas para evitar proliferación bacteriana.`,
  ];

  return {
    id: `enteral-art-${Date.now()}`,
    patientId,
    type: 'artisanal',
    formulaName: 'Licuado Enteral Artesanal Estandarizado',
    route,
    mode,
    totalVolumeMl,
    dailyCalories: Math.round(totalCalories),
    dailyProteinGrams: Math.round(totalProtein),
    dailyCarbGrams: Math.round(totalCarbs),
    dailyFatGrams: Math.round(totalFat),
    freeWaterMl,
    additionalWaterFlushesMl: bolusCount * 40, // 40ml per bolus flush
    totalFluidMl: totalVolumeMl + bolusCount * 40,
    artisanalIngredients: items,
    bolusCount,
    bolusVolumeMl,
    bolusIntervalHours,
    tubeGaugeFr,
    preparationNotes,
    date: new Date().toISOString().split('T')[0],
  };
}
