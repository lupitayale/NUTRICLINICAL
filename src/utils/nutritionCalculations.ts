import {
  AnthropometricRecord,
  EnergyFormula,
  ActivityLevel,
  Gender,
  MacroPrescription,
  PathologyType,
  NutritionGoal,
  DayPlan,
  MealItem,
  MealIngredient,
  MenuPlan,
} from '../types/nutrition';
import { pickSmartMealsForDay } from './massiveRecipeBank';
import { auditMenuPlanVariety, AVAILABLE_DIETARY_STYLES } from './menuVarietyEngine';

export const PATHOLOGY_INFO: Record<
  PathologyType,
  {
    name: string;
    shortDescription: string;
    clinicalFocus: string;
    recommendedMacroRatio: { proteinPct: number; carbPct: number; fatPct: number };
    proteinPerKg: number;
    specialRestrictions: string[];
    recommendedFoods: string[];
    foodsToAvoid: string[];
  }
> = {
  diabetes_t2: {
    name: 'Diabetes Mellitus Tipo 2',
    shortDescription: 'Resistencia a la insulina y descontrol glucémico',
    clinicalFocus: 'Control de carga glucémica, fibra soluble alta y prevención de picos postprandiales.',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 45, fatPct: 35 },
    proteinPerKg: 1.1,
    specialRestrictions: ['Azúcares añadidos < 5%', 'Fibra dietética >= 35g/día', 'Índice glucémico bajo/medio'],
    recommendedFoods: ['Avena integral', 'Legumbres (lentejas, frijoles)', 'Nopal', 'Semillas de chía', 'Pescados grasos', 'Verduras de hoja verde'],
    foodsToAvoid: ['Refrescos y jugos procesados', 'Harinas refinadas', 'Dulces y repostería', 'Cereales azucarados'],
  },
  diabetes_t1: {
    name: 'Diabetes Mellitus Tipo 1',
    shortDescription: 'Déficit absoluto de insulina, requiere conteo de carbohidratos',
    clinicalFocus: 'Distribución constante de carbohidratos complejos para sincronización con esquema de insulina.',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 45, fatPct: 35 },
    proteinPerKg: 1.1,
    specialRestrictions: ['Conteo estricto de CHO (raciones de 15g)', 'Evitar azúcares rápidos salvo hipoglucemias'],
    recommendedFoods: ['Granos enteros', 'Quinoa', 'Verduras crucíferas', 'Pechuga de pavo', 'Yogur griego natural sin azúcar'],
    foodsToAvoid: ['Azúcares simples no programados', 'Bebidas alcohólicas en ayuno', 'Bollería industrial'],
  },
  hypertension: {
    name: 'Hipertensión Arterial (Protocolo DASH)',
    shortDescription: 'Elevada presión sistólica / diastólica vascular',
    clinicalFocus: 'Restricción de sodio, incremento de potasio, magnesio y calcio dietético.',
    recommendedMacroRatio: { proteinPct: 18, carbPct: 52, fatPct: 30 },
    proteinPerKg: 1.0,
    specialRestrictions: ['Sodio < 1500 - 2000 mg/día', 'Grasa saturada < 6% de kcal'],
    recommendedFoods: ['Plátano, melón, espinacas (ricos en potasio)', 'Almendras y nueces', 'Aceite de oliva virgen extra', 'Lácteos desnatados'],
    foodsToAvoid: ['Embutidos y carnes curadas', 'Enlatados con sal', 'Salsas procesadas (soya, kétchup)', 'Botanas saladas'],
  },
  ckd_non_dialysis: {
    name: 'Enfermedad Renal Crónica (No Diálisis E1-E3b)',
    shortDescription: 'Fallo renal progresivo, retención de toxinas urémicas',
    clinicalFocus: 'Restricción proteica estricta para frenar hiperfiltración glomerular y retención de nitrógeno.',
    recommendedMacroRatio: { proteinPct: 12, carbPct: 58, fatPct: 30 },
    proteinPerKg: 0.7, // 0.6 a 0.8 g/kg/d
    specialRestrictions: ['Proteína: 0.6 - 0.8 g/kg/día', 'Fósforo < 800-1000 mg/día', 'Sodio < 2000 mg/día', 'Control de potasio según analítica'],
    recommendedFoods: ['Claras de huevo', 'Aceite de oliva', 'Arroz blanco', 'Manzana, pera, fresas (bajo potasio)', 'Pechuga de pollo cocida'],
    foodsToAvoid: ['Refrescos oscuros (ácido fosfórico)', 'Carnes rojas en exceso', 'Quesos maduros', 'Frutos secos en exceso (fósforo)'],
  },
  fatty_liver: {
    name: 'Esteatosis Hepática (Hígado Graso no alcohólico)',
    shortDescription: 'Acumulación de triglicéridos en tejido hepático',
    clinicalFocus: 'Reducción de fructosa libre añadida, optimización de ácidos grasos Omega-3 y antioxidantes.',
    recommendedMacroRatio: { proteinPct: 22, carbPct: 43, fatPct: 35 },
    proteinPerKg: 1.2,
    specialRestrictions: ['Cero jarabe de maíz de alta fructosa', 'Grasa saturada < 7%', 'Déficit calórico moderado si hay sobrepeso'],
    recommendedFoods: ['Salmón, sardinas, atún', 'Aguacate', 'Aceite de oliva', 'Café negro sin azúcar', 'Verduras verdes', 'Nueces'],
    foodsToAvoid: ['Refrescos, bebidas energéticas', 'Alcohol', 'Frituras y mantecas', 'Pan blanco y bollería'],
  },
  dyslipidemia: {
    name: 'Dislipidemia / Hipercolesterolemia',
    shortDescription: 'Colesterol LDL elevado y/o triglicéridos aumentados',
    clinicalFocus: 'Fibra soluble alta para atrapar sales biliares, grasas poli y monoinsaturadas.',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 50, fatPct: 30 },
    proteinPerKg: 1.0,
    specialRestrictions: ['Colesterol dietético < 200 mg/día', 'Grasas trans 0%', 'Fibra soluble >= 15g/día'],
    recommendedFoods: ['Avena y salvado de avena', 'Manzanas (pectina)', 'Semillas de linaza', 'Pescados azules', 'Legumbres'],
    foodsToAvoid: ['Mantequilla, nata y manteca', 'Cortes grasos de carne roja', 'Embutidos grasosos', 'Frituras'],
  },
  hyperuricemia_gout: {
    name: 'Hiperuricemia y Gota',
    shortDescription: 'Ácido úrico sérico elevado con riesgo de cristales articulares',
    clinicalFocus: 'Dieta hipopurínica, alcalinización urinaria y alta tasa de hidratación.',
    recommendedMacroRatio: { proteinPct: 18, carbPct: 55, fatPct: 27 },
    proteinPerKg: 1.0,
    specialRestrictions: ['Restricción de purinas altas', 'Agua >= 2.5 a 3.0 Litros/día', 'Evitar alcohol absoluto'],
    recommendedFoods: ['Cerezas y frutos rojos', 'Lácteos desnatados', 'Huevos y tofu (proteínas bajas en purinas)', 'Cítricos (vitamina C)', 'Pepino y apio'],
    foodsToAvoid: ['Vísceras (hígado, mollejas, riñones)', 'Mariscos específicos (camarones, mejillones)', 'Sardinas y anchoas', 'Cerveza y licores'],
  },
  hypothyroidism: {
    name: 'Hipotiroidismo',
    shortDescription: 'Tasa metabólica basal disminuida por baja T3/T4',
    clinicalFocus: 'Ajuste calórico para prevenir aumento ponderal, aporte de selenio, zinc y cocción de bociógenos.',
    recommendedMacroRatio: { proteinPct: 22, carbPct: 48, fatPct: 30 },
    proteinPerKg: 1.2,
    specialRestrictions: ['Cocinar verduras crucíferas (desactiva bociógenos)', 'Separar fibra/calcio 4 horas de la levotiroxina'],
    recommendedFoods: ['Pescados marinos (yodo)', 'Nueces de Brasil (selenio)', 'Huevos cocidos', 'Zanahorias y calabacitas cocidas', 'Proteína magra'],
    foodsToAvoid: ['Coliflor, brócoli crudo en exceso', 'Soya sin fermentar en ayunas', 'Comidas ultraprocesadas'],
  },
  celiac: {
    name: 'Enfermedad Celíaca / Sensibilidad al Gluten',
    shortDescription: 'Atrofia vellositaria por exposición al gluten',
    clinicalFocus: 'Exclusión 100% estricta de gluten y prevención de contaminación cruzada.',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 50, fatPct: 30 },
    proteinPerKg: 1.1,
    specialRestrictions: ['Sin trigo, avena no certificada, cebada ni centeno (TACC)', 'Revisión rigurosa de aditivos y trazas'],
    recommendedFoods: ['Arroz, maíz, mijo, trigo sarraceno, quinoa', 'Papas y camotes', 'Carnes naturales', 'Frutas y verduras frescas'],
    foodsToAvoid: ['Pan, pastas y harinas convencionales', 'Cervezas de cebada', 'Salsas espesadas con harina de trigo'],
  },
  obesity_metabolic: {
    name: 'Obesidad y Síndrome Metabólico',
    shortDescription: 'Exceso de tejido adiposo visceral y disfunción metabólica',
    clinicalFocus: 'Déficit calórico sostenible, preservación de masa muscular y reducción de inflamación crónica.',
    recommendedMacroRatio: { proteinPct: 25, carbPct: 45, fatPct: 30 },
    proteinPerKg: 1.3,
    specialRestrictions: ['Déficit de 500 kcal/día', 'Proteína alta para saciedad y efecto térmico', 'Baja densidad energética'],
    recommendedFoods: ['Pechuga de pollo, pescado blanco', 'Ensaladas abundantes', 'Legumbres saciantes', 'Frutas con cáscara'],
    foodsToAvoid: ['Comida rápida y ultraprocesada', 'Bebidas calóricas', 'Snacks ultraprocesados de alta palatabilidad'],
  },
  // --- ADICIONALES CLÍNICAS COMUNES ---
  heart_failure: {
    name: 'Insuficiencia Cardíaca Congestiva (ICC)',
    shortDescription: 'Compromiso de eyección ventricular y congestión venosa',
    clinicalFocus: 'Restricción hídrica estricta (1.5-2L/día) y control riguroso de sodio (<1.5g/d). Prevención de caquexia cardíaca.',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 50, fatPct: 30 },
    proteinPerKg: 1.2,
    specialRestrictions: ['Sodio < 1500 mg/día', 'Líquidos totales 1500 - 1800 ml/día', 'Monitoreo diario de peso matutino'],
    recommendedFoods: ['Pescados magros', 'Avena natural', 'Frutas frescas bajas en agua', 'Aceite de oliva crudo', 'Hierbas de olor sin sal'],
    foodsToAvoid: ['Embutidos', 'Sopas instantáneas y cubos de caldo', 'Alimentos salmuerados', 'Bebidas isotónicas con sodio'],
  },
  crohn_colitis: {
    name: 'Enfermedad Inflamatoria Intestinal (Crohn / CU)',
    shortDescription: 'Inflamación transmural o mucosa gastrointestinal crónica',
    clinicalFocus: 'En brote: baja en residuos/fibra insoluble, hiperproteica e hipograsa. En remisión: reintroducción guiada de prebióticos y omega-3.',
    recommendedMacroRatio: { proteinPct: 22, carbPct: 53, fatPct: 25 },
    proteinPerKg: 1.4,
    specialRestrictions: ['En brote: fibra cruda < 10g', 'Evitar lácteos enteros e irritantes', 'Monitoreo de anemia y B12'],
    recommendedFoods: ['Arroz blanco y puré de zanahoria', 'Pollo cocido sin piel', 'Pescado blanco al vapor', 'Plátano maduro', 'Huevos tibios'],
    foodsToAvoid: ['Semillas, frutos secos enteros', 'Verduras flatulentas crudas', 'Picantes, café y alcohol', 'Alimentos grasosos o fritos'],
  },
  ibs_fodmap: {
    name: 'Síndrome de Intestino Irritable (Protocolo Low-FODMAP)',
    shortDescription: 'Hipersensibilidad visceral y disbiosis con distensión y dolor',
    clinicalFocus: 'Exclusión temporal de carbohidratos fermentables de cadena corta para desinflamación entérica y reintroducción paulatina.',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 50, fatPct: 30 },
    proteinPerKg: 1.1,
    specialRestrictions: ['Bajo en fructanos, GOS, lactosa, exceso de fructosa y polioles', 'Comidas pequeñas y pausadas'],
    recommendedFoods: ['Zanahorias, espinacas, calabacitas', 'Fresas, uvas, mandarinas', 'Quinoa, avena, arroz', 'Carnes magras no procesadas'],
    foodsToAvoid: ['Cebolla, ajo y poro', 'Trigo y centeno', 'Leguminosas enteras', 'Manzanas, peras, mango', 'Lácteos convencionales con lactosa'],
  },
  pcos: {
    name: 'Síndrome de Ovario Poliquístico (SOP)',
    shortDescription: 'Hiperandrogenismo, anovulación e hiperinsulinemia',
    clinicalFocus: 'Dieta de bajo índice glucémico, antiinflamatoria, rica en mio-inositol, magnesio y grasas monoinsaturadas.',
    recommendedMacroRatio: { proteinPct: 22, carbPct: 43, fatPct: 35 },
    proteinPerKg: 1.2,
    specialRestrictions: ['Cero azúcares refinados', 'Carbohidratos con fibra >= 30g/día', 'Control de picos de insulina'],
    recommendedFoods: ['Semillas de calabaza y lino', 'Aguacate y frutos secos', 'Pescados azules', 'Verduras de hoja oscura', 'Canela'],
    foodsToAvoid: ['Harinas refinadas y repostería', 'Bebidas azucaradas', 'Lácteos industriales con azúcares añadidos'],
  },
  gerd_gastritis: {
    name: 'ERGE y Gastritis Erosiva / Crónica',
    shortDescription: 'Incompetencia del esfínter esofágico inferior e hiperclorhidria',
    clinicalFocus: 'Dieta no irritante gástrica, fraccionada, normo-proteica, baja en grasas saturadas y temperatura templada.',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 55, fatPct: 25 },
    proteinPerKg: 1.0,
    specialRestrictions: ['Cero irritantes químicos y térmicos', 'Cenar 2-3 horas antes de acostarse', 'Comidas no voluminosas'],
    recommendedFoods: ['Avena cocida en agua', 'Pechuga de pavo hervida', 'Calabacita y chayote cocidos', 'Manzana y pera cocidas', 'Papaya'],
    foodsToAvoid: ['Café, té negro, chocolate y menta', 'Cítricos, jitomate y vinagres', 'Frituras y embutidos', 'Bebidas con gas'],
  },
  // --- ENFERMEDADES RARAS Y METABÓLICAS CONGÉNITAS ---
  pku_phenylketonuria: {
    name: 'Fenilcetonuria (PKU) - Enfermedad Rara Metabólica',
    shortDescription: 'Déficit de fenilalanina hidroxilasa (PAH) con acúmulo neurotóxico de Phe',
    clinicalFocus: 'Restricción drástica de fenilalanina dietética. Soporte nutricional con fórmula médica especializada libre de Phe y suplementación de tirosina.',
    recommendedMacroRatio: { proteinPct: 15, carbPct: 60, fatPct: 25 },
    proteinPerKg: 0.8,
    specialRestrictions: ['Phe calculada estrictamente en mg/día según niveles plasmáticos', 'Exclusión de aspartamo (E951)', 'Fórmula libre de Phe obligatoria'],
    recommendedFoods: ['Frutas y verduras bajas en proteína (pesadas en balanza)', 'Alimentos especiales aproteicos médicos', 'Aceites vegetales puros', 'Almidón de maíz modificado'],
    foodsToAvoid: ['Carnes rojas, pollo, pescado y mariscos', 'Huevos y lácteos de cualquier tipo', 'Legumbres, soya, frutos secos y semillas', 'Edulcorante aspartamo'],
  },
  cystic_fibrosis: {
    name: 'Fibrosis Quística (FQ) - Enfermedad Rara Genética',
    shortDescription: 'Mutación en canal CFTR, insuficiencia pancreática exocrina y desnutrición',
    clinicalFocus: 'Dieta hipercalórica densa (120-150% del GET), hiperproteica, suplementación enzimática pancreática (PERT) en cada comida y alto aporte de sodio.',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 40, fatPct: 40 },
    proteinPerKg: 1.8,
    specialRestrictions: ['Enzimas pancreáticas (PERT) antes de cada alimento graso', 'Aporte extra de sal (cloruro sódico)', 'Vitaminas liposolubles ADEK en forma hidrosoluble'],
    recommendedFoods: ['Alimentos hipercalóricos saludables', 'Aceite de oliva, aguacate, mantequilla de frutos secos', 'Lácteos enteros y quesos', 'Pescados grasos y carnes', 'Sal de mesa añadida'],
    foodsToAvoid: ['Alimentos light o hipocalóricos', 'Dietas bajas en grasa', 'Comidas sin enzimas asignadas'],
  },
  wilson_disease: {
    name: 'Enfermedad de Wilson - Trastorno Raro del Cobre',
    shortDescription: 'Mutación ATP7B con acúmulo tóxico de cobre en hígado y ganglios basales',
    clinicalFocus: 'Dieta baja en cobre (< 1 mg/día en inducción), quelación médica y uso de agua desmineralizada/purificada sin tuberías de cobre.',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 55, fatPct: 25 },
    proteinPerKg: 1.1,
    specialRestrictions: ['Cobre dietético < 1 mg/día', 'Evitar agua proveniente de cañerías de cobre', 'Evitar utensilios de cocina de cobre'],
    recommendedFoods: ['Pollo sin piel, pavo, clara de huevo', 'Arroz blanco, avena regular', 'Manzanas, peras, cítricos', 'Zanahorias, calabacitas, lechuga', 'Lácteos frescos simples'],
    foodsToAvoid: ['Vísceras (hígado, riñón)', 'Mariscos y moluscos (ostras, camarón)', 'Chocolate y cacao en polvo', 'Frutos secos y semillas', 'Champiñones y champiñones secos'],
  },
  als_mnd: {
    name: 'Esclerosis Lateral Amiotrófica (ELA) - Enfermedad Rara Motora',
    shortDescription: 'Degeneración de motoneuronas con hipermetabolismo y disfagia progresiva',
    clinicalFocus: 'Aporte hipercalórico denso para contrarrestar hipermetabolismo, texturas modificadas homogéneas para prevenir broncoaspiración y prevención de sarcopenia.',
    recommendedMacroRatio: { proteinPct: 22, carbPct: 48, fatPct: 30 },
    proteinPerKg: 1.5,
    specialRestrictions: ['Texturas adaptadas (néctar/miel/pudín)', 'Comidas densas de poco volumen para evitar fatiga respiratoria', 'Suplementación con espesantes clínicos si hay disfagia'],
    recommendedFoods: ['Papillas calórico-proteicas enriquecidas', 'Batidos concentrados con aceite o TCM', 'Purés aterciopelados con huevo o pollo licuado', 'Yogur espeso y cremas'],
    foodsToAvoid: ['Alimentos secos, desmenuzables o crocantes', 'Líquidos finos no espesados si hay disfagia', 'Carnes fibrosas duras'],
  },
  systemic_lupus: {
    name: 'Lupus Eritematoso Sistémico (LES) - Autoinmune Rara',
    shortDescription: 'Enfermedad autoinmune multisistémica con daño inflamatorio vascular y renal',
    clinicalFocus: 'Dieta antiinflamatoria rica en omega-3, calcio y vitamina D para protección ósea por corticoides. Exclusión rigurosa de brotes de alfalfa (L-canavanina activa el sistema inmune).',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 50, fatPct: 30 },
    proteinPerKg: 1.2,
    specialRestrictions: ['Cero brotes de alfalfa (germinado)', 'Sodio bajo si hay nefritis lúpica o uso de esteroides', 'Aporte preventivo de calcio (1200mg) y Vit D'],
    recommendedFoods: ['Pescados ricos en omega-3 (salmón, sardina)', 'Aceite de linaza y oliva virgen', 'Verduras verdes cocidas', 'Lácteos descremados fortificados', 'Arándanos'],
    foodsToAvoid: ['Brotes de alfalfa / germinados de alfalfa', 'Grasas saturadas y trans inflamatorias', 'Exceso de sal y alimentos procesados'],
  },
  glycogen_storage: {
    name: 'Glucogenosis Hepática (GSD Tipo I) - Enfermedad Rara',
    shortDescription: 'Deficiencia de glucosa-6-fosfatasa con hipoglucemias en ayuno severas',
    clinicalFocus: 'Mantenimiento estricto de normoglucemia (evitar ayunos > 3-4 horas). Terapia con almidón de maíz crudo (maicena en agua fría) y restricción de galactosa/fructosa.',
    recommendedMacroRatio: { proteinPct: 15, carbPct: 65, fatPct: 20 },
    proteinPerKg: 1.2,
    specialRestrictions: ['Evitar ayuno mayor a 3-4 horas', 'Toma programada de almidón crudo', 'Restricción severa de azúcar de mesa, fructosa libre y galactosa/lactosa'],
    recommendedFoods: ['Almidón de maíz crudo (maicena pura)', 'Carbohidratos complejos de absorción lenta (arroz integral, avena)', 'Proteínas magras cocidas'],
    foodsToAvoid: ['Azúcares simples y dulces', 'Frutas con alta fructosa en exceso', 'Leche y lácteos con lactosa', 'Bebidas azucaradas'],
  },
  short_bowel: {
    name: 'Síndrome de Intestino Corto (SIC) - Falla Intestinal',
    shortDescription: 'Resección intestinal masiva con malabsorción crítica de fluidos y micronutrientes',
    clinicalFocus: 'Comidas frecuentes hipercalóricas bajas en solutos osmóticos, uso de Solución de Rehidratación Oral (SRO OMS) y aporte de triglicéridos de cadena media (TCM).',
    recommendedMacroRatio: { proteinPct: 20, carbPct: 50, fatPct: 30 },
    proteinPerKg: 1.5,
    specialRestrictions: ['No beber líquidos durante las comidas (separar 1 hora)', 'Evitar azúcares hiperosmolares que provoquen diarrea osmótica', 'Monitoreo de electrolitos'],
    recommendedFoods: ['Arroz blanco, pasta refinada, pan tostado', 'Carnes muy tiernas y cocidas', 'Aceite TCM (triglicéridos de cadena media)', 'Suero oral isotónico'],
    foodsToAvoid: ['Jugos de frutas y refrescos', 'Alimentos con sorbitol o polialcoholes', 'Fibra insoluble cruda abundante'],
  },
};

export interface PathologyCategoryGroup {
  id: string;
  name: string;
  icon: string;
  pathologies: PathologyType[];
}

export const PATHOLOGY_CATEGORIES: PathologyCategoryGroup[] = [
  {
    id: 'metabolic_endocrine',
    name: 'Metabólicas & Endocrinas',
    icon: 'Activity',
    pathologies: ['diabetes_t2', 'diabetes_t1', 'obesity_metabolic', 'dyslipidemia', 'hyperuricemia_gout', 'hypothyroidism', 'pcos'],
  },
  {
    id: 'cardio_renal',
    name: 'Cardiovasculares & Renales',
    icon: 'HeartPulse',
    pathologies: ['hypertension', 'heart_failure', 'ckd_non_dialysis', 'fatty_liver'],
  },
  {
    id: 'gastro_digestive',
    name: 'Gastrointestinales & Digestivas',
    icon: 'Apple',
    pathologies: ['celiac', 'crohn_colitis', 'ibs_fodmap', 'gerd_gastritis', 'short_bowel'],
  },
  {
    id: 'rare_genetic',
    name: 'Enfermedades Raras & Genéticas',
    icon: 'Sparkles',
    pathologies: ['pku_phenylketonuria', 'cystic_fibrosis', 'wilson_disease', 'als_mnd', 'systemic_lupus', 'glycogen_storage'],
  },
];

/**
 * Calcula IMC y clasificación OMS
 */
export function calculateBMI(weightKg: number, heightCm: number) {
  if (!weightKg || !heightCm) {
    return {
      bmi: 0,
      classification: 'Pendiente',
      statusClass: 'normal' as const,
      color: 'text-slate-500',
    };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let classification = 'Normopeso';
  let statusClass: AnthropometricRecord['bmiStatusClass'] = 'normal';
  let color = 'text-emerald-600';

  if (bmi < 18.5) {
    classification = 'Bajo peso';
    statusClass = 'underweight';
    color = 'text-amber-500';
  } else if (bmi <= 24.9) {
    classification = 'Normopeso (Saludable)';
    statusClass = 'normal';
    color = 'text-emerald-600';
  } else if (bmi <= 29.9) {
    classification = 'Sobrepeso';
    statusClass = 'overweight';
    color = 'text-amber-600';
  } else if (bmi <= 34.9) {
    classification = 'Obesidad Grado I';
    statusClass = 'obese1';
    color = 'text-rose-500';
  } else if (bmi <= 39.9) {
    classification = 'Obesidad Grado II';
    statusClass = 'obese2';
    color = 'text-rose-600';
  } else {
    classification = 'Obesidad Grado III (Mórbida)';
    statusClass = 'obese3';
    color = 'text-red-700';
  }

  return { bmi, classification, statusClass, color };
}

/**
 * Calcula Índice Cintura / Cadera y Riesgo Cardiovascular
 */
export function calculateWaistHipRatio(waistCm: number, hipCm: number, gender: Gender) {
  if (!waistCm || !hipCm) return { ratio: 0, cardioRisk: undefined };
  const ratio = Number((waistCm / hipCm).toFixed(2));
  let cardioRisk: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto' = 'Bajo';

  if (gender === 'male') {
    if (ratio < 0.90) cardioRisk = 'Bajo';
    else if (ratio <= 0.95) cardioRisk = 'Moderado';
    else if (ratio <= 1.0) cardioRisk = 'Alto';
    else cardioRisk = 'Muy Alto';
  } else {
    if (ratio < 0.80) cardioRisk = 'Bajo';
    else if (ratio <= 0.85) cardioRisk = 'Moderado';
    else if (ratio <= 0.90) cardioRisk = 'Alto';
    else cardioRisk = 'Muy Alto';
  }

  return { ratio, cardioRisk };
}

/**
 * Pesos Ideales y Peso Ajustado para Obesidad
 */
export function calculateIdealWeights(heightCm: number, weightKg: number, gender: Gender) {
  const heightInches = heightCm / 2.54;
  const inchesOver60 = Math.max(0, heightInches - 60);

  // Hamwi Formula
  let hamwi = 0;
  if (gender === 'male') {
    hamwi = 48 + 2.7 * inchesOver60;
  } else {
    hamwi = 45.5 + 2.2 * inchesOver60;
  }
  hamwi = Number(hamwi.toFixed(1));

  // Metropolitan Life Insurance (aproximación basada en IMC medio 22)
  const heightM = heightCm / 100;
  const metropolitan = Number((22 * heightM * heightM).toFixed(1));

  // Peso Ajustado para Obesidad: PI + 0.4 * (Peso Actual - PI)
  let adjustedWeightKg = weightKg;
  const bmi = weightKg / (heightM * heightM);
  if (bmi >= 30) {
    adjustedWeightKg = Number((hamwi + 0.4 * (weightKg - hamwi)).toFixed(1));
  }

  return {
    idealWeightHamwi: hamwi,
    idealWeightMetropolitan: metropolitan,
    adjustedWeightKg,
  };
}

/**
 * Calcula el Gasto Energético Basal (GEB)
 */
export function calculateBMR(
  formula: EnergyFormula,
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  bodyFatPercent?: number
): number {
  if (!weightKg || !heightCm || !age) return 1600;

  switch (formula) {
    case 'mifflin': {
      // Mifflin-St Jeor: 10*wt + 6.25*ht - 5*age + (male: +5, female: -161)
      const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
      return Math.round(gender === 'male' ? base + 5 : base - 161);
    }
    case 'harris_benedict': {
      // Roza & Shizgal 1984
      if (gender === 'male') {
        return Math.round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age);
      } else {
        return Math.round(447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age);
      }
    }
    case 'who': {
      // FAO/OMS/UNU
      if (gender === 'male') {
        if (age < 30) return Math.round(15.3 * weightKg + 679);
        if (age <= 60) return Math.round(11.6 * weightKg + 879);
        return Math.round(13.5 * weightKg + 487);
      } else {
        if (age < 30) return Math.round(14.7 * weightKg + 496);
        if (age <= 60) return Math.round(8.7 * weightKg + 829);
        return Math.round(10.5 * weightKg + 596);
      }
    }
    case 'valencia': {
      // Valencia et al. (INCMNSZ - Población Mexicana Adulta)
      if (gender === 'male') {
        if (age < 30) return Math.round(13.37 * weightKg + 747);
        if (age <= 60) return Math.round(13.08 * weightKg + 693);
        return Math.round(14.21 * weightKg + 429);
      } else {
        if (age < 30) return Math.round(11.02 * weightKg + 679);
        if (age <= 60) return Math.round(10.92 * weightKg + 677);
        return Math.round(10.98 * weightKg + 520);
      }
    }
    case 'schofield': {
      // Schofield 1985 (Base de OMS)
      if (gender === 'male') {
        if (age < 18) return Math.round(17.686 * weightKg + 658.2);
        if (age < 30) return Math.round(15.057 * weightKg + 692.2);
        if (age <= 60) return Math.round(11.472 * weightKg + 873.1);
        return Math.round(11.711 * weightKg + 587.7);
      } else {
        if (age < 18) return Math.round(13.384 * weightKg + 692.6);
        if (age < 30) return Math.round(14.818 * weightKg + 486.6);
        if (age <= 60) return Math.round(8.126 * weightKg + 845.6);
        return Math.round(9.082 * weightKg + 658.5);
      }
    }
    case 'oxford_henry': {
      // Oxford / Henry 2005 (con peso y estatura en metros)
      const heightM = heightCm / 100;
      if (gender === 'male') {
        if (age < 30) return Math.round(14.4 * weightKg + 313 * heightM + 113);
        if (age <= 60) return Math.round(11.4 * weightKg + 541 * heightM - 137);
        return Math.round(11.4 * weightKg + 541 * heightM - 256);
      } else {
        if (age < 30) return Math.round(10.4 * weightKg + 615 * heightM - 282);
        if (age <= 60) return Math.round(8.18 * weightKg + 502 * heightM - 11.6);
        return Math.round(8.52 * weightKg + 421 * heightM + 10.7);
      }
    }
    case 'cunningham': {
      // Cunningham (1980/1991): 500 + 22 * FFM (kg)
      let ffm = weightKg * 0.75;
      if (bodyFatPercent && bodyFatPercent > 0) {
        ffm = weightKg * (1 - bodyFatPercent / 100);
      }
      return Math.round(500 + 22 * ffm);
    }
    case 'katch_mcardle': {
      // Si tenemos % de grasa corporal
      if (bodyFatPercent && bodyFatPercent > 0) {
        const leanBodyMassKg = weightKg * (1 - bodyFatPercent / 100);
        return Math.round(370 + 21.6 * leanBodyMassKg);
      }
      // Fallback a Mifflin si no hay plicometría/%grasa
      const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
      return Math.round(gender === 'male' ? base + 5 : base - 161);
    }
    case 'owen': {
      // Owen et al. (1986, 1987)
      if (gender === 'male') {
        return Math.round(879 + 10.2 * weightKg);
      } else {
        return Math.round(795 + 7.18 * weightKg);
      }
    }
    case 'tinsley': {
      // Tinsley et al. (2018) Atletas de fuerza
      if (bodyFatPercent && bodyFatPercent > 0) {
        const ffm = weightKg * (1 - bodyFatPercent / 100);
        return Math.round(25.9 * ffm + 284);
      }
      return Math.round(24.8 * weightKg + 10);
    }
    case 'ireton_jones': {
      // Ireton-Jones (1992) Pacientes hospitalizados / estrés metabólico no ventilados
      return Math.round(629 - 11 * age + 25 * weightKg);
    }
    default:
      return 1600;
  }
}

/**
 * Motor Fisiopatológico de Cálculo y Ajuste de Macronutrientes
 */
export function buildClinicalMacroPrescription(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  pathologies: PathologyType[],
  goal: NutritionGoal,
  formula: EnergyFormula = 'mifflin',
  activityLevel: ActivityLevel = 1.375,
  customCalorieOffset?: number,
  bodyFatPercent?: number
): MacroPrescription {
  // 1. GEB
  const bmr = calculateBMR(formula, weightKg, heightCm, age, gender, bodyFatPercent);

  // 2. ETA (10%) y GET (Gasto Energético Total)
  const bmrWithActivity = Math.round(bmr * activityLevel);
  const tef = Math.round(bmrWithActivity * 0.1);
  const tee = bmrWithActivity + tef;

  // 3. Ajuste por objetivo (Déficit, Superávit, Normo)
  let calorieAdjustment = 0;
  if (customCalorieOffset !== undefined) {
    calorieAdjustment = customCalorieOffset;
  } else {
    switch (goal) {
      case 'fat_loss':
        calorieAdjustment = -500;
        break;
      case 'muscle_gain':
        calorieAdjustment = 300;
        break;
      case 'glycemic_control':
        calorieAdjustment = -300;
        break;
      case 'renal_protection':
        calorieAdjustment = 0; // Normocalórica para no catabolizar
        break;
      case 'cardiovascular_dash':
        calorieAdjustment = -250;
        break;
      case 'maintenance':
      default:
        calorieAdjustment = 0;
        break;
    }
  }

  // Si tiene ERC, evitamos déficits agresivos para prevenir catabolismo proteico
  if (pathologies.includes('ckd_non_dialysis') && calorieAdjustment < -200) {
    calorieAdjustment = -150;
  }

  const targetCalories = Math.max(1200, Math.round(tee + calorieAdjustment));

  // 4. Ajuste según Patologías Clínicas
  let proteinPerKg = 1.1;
  let carbPct = 50;
  let fatPct = 30;
  let proteinPct = 20;

  const clinicalGuidelines: string[] = [];
  let sodiumMgLimit: number | undefined;
  let potassiumMgLimit: number | undefined;
  let phosphorusMgLimit: number | undefined;
  let fiberGramsTarget: number = 30;

  // Prioridad 1: Enfermedad Renal Crónica (Restricción proteica prioritaria)
  if (pathologies.includes('ckd_non_dialysis')) {
    proteinPerKg = 0.7; // 0.6 - 0.8 g/kg
    proteinPct = 12;
    carbPct = 58;
    fatPct = 30;
    sodiumMgLimit = 1800;
    phosphorusMgLimit = 800;
    clinicalGuidelines.push('ERC No Diálisis: Restricción estricta de proteína a 0.6-0.8 g/kg/d para preservar la función renal.');
    clinicalGuidelines.push('Control estricto de fósforo (<800-1000 mg/d) y sodio (<1800 mg/d). Evitar aditivos de fosfato inorgánico.');
  }

  // Prioridad 2: Diabetes tipo 2 / tipo 1
  if (pathologies.includes('diabetes_t2') || pathologies.includes('diabetes_t1')) {
    if (!pathologies.includes('ckd_non_dialysis')) {
      proteinPerKg = 1.2;
      carbPct = 42;
      fatPct = 35;
      proteinPct = 23;
    } else {
      carbPct = 52;
      fatPct = 36;
      proteinPct = 12;
    }
    fiberGramsTarget = 35;
    clinicalGuidelines.push('Diabetes: Distribución de carbohidratos de bajo índice glucémico y alto contenido en fibra soluble.');
    clinicalGuidelines.push('Azúcares añadidos restringidos a < 5% del valor calórico total.');
  }

  // Hipertensión Arterial (DASH)
  if (pathologies.includes('hypertension')) {
    sodiumMgLimit = Math.min(sodiumMgLimit ?? 2000, 1500);
    clinicalGuidelines.push('Hipertensión (Protocolo DASH): Restricción de sodio a < 1500 mg/d. Énfasis en potasio, magnesio y calcio.');
  }

  // Esteatosis Hepática / Hígado Graso
  if (pathologies.includes('fatty_liver')) {
    clinicalGuidelines.push('Hígado Graso: Exclusión de jarabes de maíz altos en fructosa; enriquecer en ácidos grasos monoinsaturados y Omega-3.');
  }

  // Dislipidemia
  if (pathologies.includes('dyslipidemia')) {
    clinicalGuidelines.push('Dislipidemia: Grasa saturada < 6% de kcal totales, colesterol dietético < 200 mg/d y fibra soluble >= 15 g/d.');
  }

  // Hiperuricemia y Gota
  if (pathologies.includes('hyperuricemia_gout')) {
    clinicalGuidelines.push('Gota / Hiperuricemia: Dieta hipopurínica estricta (sin vísceras, anchoas ni extractos de carne). Hidratación forzada >= 2.5 L.');
  }

  // Hipotiroidismo
  if (pathologies.includes('hypothyroidism')) {
    clinicalGuidelines.push('Hipotiroidismo: Cocinar crucíferas para inactivar glucosinolatos; asegurar selenio y zinc dietéticos.');
  }

  // Celiaquía
  if (pathologies.includes('celiac')) {
    clinicalGuidelines.push('Celiaquía: Dieta 100% libre de gluten (sin trigo, cebada, centeno ni avena convencional). Cuidado con contaminación cruzada.');
  }

  // Cálculo de gramos exactos de macronutrientes
  // Si tenemos g/kg fijado (ej. renal), calculamos gramos y luego %
  let proteinGrams: number;
  let proteinKcal: number;

  if (pathologies.includes('ckd_non_dialysis')) {
    proteinGrams = Math.round(weightKg * proteinPerKg);
    proteinKcal = proteinGrams * 4;
    proteinPct = Math.round((proteinKcal / targetCalories) * 100);
    // Reparar suma 100%
    const remainingKcal = targetCalories - proteinKcal;
    const carbKcal = Math.round(remainingKcal * (carbPct / (carbPct + fatPct)));
    const fatKcal = remainingKcal - carbKcal;
    const carbGrams = Math.round(carbKcal / 4);
    const fatGrams = Math.round(fatKcal / 9);

    return {
      formula,
      activityLevel,
      bmr,
      tef,
      tee,
      calorieAdjustment,
      targetCalories,
      proteinGramsPerKg: proteinPerKg,
      proteinGrams,
      proteinKcal,
      proteinPercent: proteinPct,
      carbGrams,
      carbKcal,
      carbPercent: Math.round((carbKcal / targetCalories) * 100),
      fatGrams,
      fatKcal,
      fatPercent: Math.round((fatKcal / targetCalories) * 100),
      sodiumMgLimit,
      potassiumMgLimit,
      phosphorusMgLimit,
      fiberGramsTarget,
      clinicalGuidelines,
    };
  }

  // Caso estándar
  proteinKcal = Math.round(targetCalories * (proteinPct / 100));
  proteinGrams = Math.round(proteinKcal / 4);
  proteinPerKg = Number((proteinGrams / weightKg).toFixed(2));

  const carbKcal = Math.round(targetCalories * (carbPct / 100));
  const carbGrams = Math.round(carbKcal / 4);

  const fatKcal = targetCalories - (proteinKcal + carbKcal);
  const fatGrams = Math.round(fatKcal / 9);
  fatPct = 100 - (proteinPct + carbPct);

  return {
    formula,
    activityLevel,
    bmr,
    tef,
    tee,
    calorieAdjustment,
    targetCalories,
    proteinGramsPerKg: proteinPerKg,
    proteinGrams,
    proteinKcal,
    proteinPercent: proteinPct,
    carbGrams,
    carbKcal,
    carbPercent: carbPct,
    fatGrams,
    fatKcal,
    fatPercent: fatPct,
    sodiumMgLimit,
    potassiumMgLimit,
    phosphorusMgLimit,
    fiberGramsTarget,
    clinicalGuidelines,
  };
}

/**
 * Generador Clínico Local Experto de Menús ("Sin batallar")
 * Diseñado con biblioteca de alimentos reales, porciones del SMAE y reglas estrictas de patologías.
 * Proporciona respuesta inmediata de alta fidelidad nutricional.
 */
export function generateLocalClinicalMenu(
  patientName: string,
  pathologies: PathologyType[],
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number,
  mealsPerDay: 3 | 4 | 5 = 5,
  daysCount: number = 7,
  allergies: string[] = [],
  dislikes: string[] = [],
  dietaryStyle: string = 'estandar',
  excludedDishes: string[] = []
): MenuPlan {
  const isCkd = pathologies.includes('ckd_non_dialysis');
  const isDiabetes = pathologies.includes('diabetes_t2') || pathologies.includes('diabetes_t1');
  const isHTA = pathologies.includes('hypertension');
  const isLiver = pathologies.includes('fatty_liver');
  const isGout = pathologies.includes('hyperuricemia_gout');
  const isCeliac = pathologies.includes('celiac');

  const isMediterranea = dietaryStyle === 'dieta_mediterranea';
  const isMaiz = dietaryStyle === 'dieta_del_maiz';
  const isVegetariano = dietaryStyle === 'vegetariano';
  const isOvoLacto = dietaryStyle === 'ovolactovegetariano';

  const daysNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Reparto calórico por tiempos de comida
  // 5 comidas: Desayuno (25%), Colación 1 (10%), Comida (35%), Colación 2 (10%), Cena (20%)
  // 4 comidas: Desayuno (25%), Comida (40%), Colación (15%), Cena (20%)
  // 3 comidas: Desayuno (30%), Comida (45%), Cena (25%)

  const mealSplits5 = [
    { type: 'desayuno' as const, label: '08:00 AM - Desayuno', pct: 0.25 },
    { type: 'colacion_1' as const, label: '11:30 AM - Colación Matutina', pct: 0.10 },
    { type: 'comida' as const, label: '02:30 PM - Comida Principal', pct: 0.35 },
    { type: 'colacion_2' as const, label: '05:30 PM - Colación Vespertina', pct: 0.10 },
    { type: 'cena' as const, label: '08:30 PM - Cena Ligera', pct: 0.20 },
  ];

  const mealSplits3 = [
    { type: 'desayuno' as const, label: '08:30 AM - Desayuno', pct: 0.30 },
    { type: 'comida' as const, label: '02:30 PM - Comida Principal', pct: 0.45 },
    { type: 'cena' as const, label: '08:30 PM - Cena Ligera', pct: 0.25 },
  ];

  const mealSplits4 = [
    { type: 'desayuno' as const, label: '08:00 AM - Desayuno', pct: 0.25 },
    { type: 'comida' as const, label: '02:00 PM - Comida Principal', pct: 0.40 },
    { type: 'colacion_1' as const, label: '05:30 PM - Colación', pct: 0.15 },
    { type: 'cena' as const, label: '08:30 PM - Cena Ligera', pct: 0.20 },
  ];

  const activeSplits = mealsPerDay === 3 ? mealSplits3 : mealsPerDay === 4 ? mealSplits4 : mealSplits5;

  // Catálogo de platillos clínicos adaptados
  const breakfasts = [
    {
      name: isCkd
        ? 'Omelette de Claras con Espinacas y Arepa de Maíz'
        : isDiabetes
        ? 'Huevos al Gusto con Nopales Asados, Frijoles Negros y Aguacate'
        : 'Tazón de Avena Cocida con Chía, Almendras y Frutos Rojos',
      ingredients: isCkd
        ? [
            { item: 'Claras de huevo pasteurizadas', quantity: '3 piezas (90g)', category: 'Proteínas y Carnes' as const },
            { item: 'Espinaca fresca salteada', quantity: '1 taza (60g)', category: 'Verduras' as const },
            { item: 'Tortilla de maíz nixtamalizado', quantity: '2 piezas', category: 'Cereales y Legumbres' as const },
            { item: 'Aceite de oliva virgen extra', quantity: '1 cucharadita (5ml)', category: 'Grasas Saludables' as const },
          ]
        : isDiabetes
        ? [
            { item: 'Huevo entero orgánico', quantity: '2 piezas', category: 'Proteínas y Carnes' as const },
            { item: 'Nopal tierno asado', quantity: '1 taza y media picado', category: 'Verduras' as const },
            { item: 'Frijoles negros de la olla sin freír', quantity: '1/2 taza', category: 'Cereales y Legumbres' as const },
            { item: 'Aguacate hass', quantity: '1/3 pieza (40g)', category: 'Grasas Saludables' as const },
            { item: 'Tortilla de maíz o nopal', quantity: '2 piezas', category: 'Cereales y Legumbres' as const },
          ]
        : [
            { item: 'Avena en hojuelas enteras', quantity: '1/2 taza (40g)', category: 'Cereales y Legumbres' as const },
            { item: 'Leche vegetal de almendras sin azúcar', quantity: '1 taza (240ml)', category: 'Lácteos' as const },
            { item: 'Semillas de chía', quantity: '1 cucharada (10g)', category: 'Grasas Saludables' as const },
            { item: 'Fresas y arándanos frescos', quantity: '1/2 taza', category: 'Frutas' as const },
            { item: 'Almendras fileteadas tostadas', quantity: '10 piezas', category: 'Grasas Saludables' as const },
          ],
      prep: 'Saltear las verduras en sartén de teflón con el aceite de oliva a fuego medio, incorporar la fuente de proteína y servir con guarnición.',
      benefit: isCkd
        ? 'Te aporta proteína excelente y muy ligera que cuida con mucho cariño la salud de tus riñones.'
        : isDiabetes
        ? 'Te ayuda a mantener estables tus niveles de azúcar en la sangre y te da mucha saciedad.'
        : 'Te llena de energía natural, mejora tu digestión y te mantiene satisfecho por varias horas.',
    },
    {
      name: isCkd
        ? 'Crema de Arroz con Manzana Cocida y Canela en Rama'
        : 'Tostadas de Tinga de Pollo Deshebrada con Ensalada de Col y Aguacate',
      ingredients: isCkd
        ? [
            { item: 'Harina de arroz cocida en agua', quantity: '1/2 taza', category: 'Cereales y Legumbres' as const },
            { item: 'Manzana pelada al vapor', quantity: '1 pieza mediana', category: 'Frutas' as const },
            { item: 'Clara de huevo deshidratada / cocida aparte', quantity: '2 piezas', category: 'Proteínas y Carnes' as const },
            { item: 'Canela molida de Ceilán', quantity: '1 pizca', category: 'Condimentos' as const },
          ]
        : [
            { item: 'Pechuga de pollo cocida y deshebrada', quantity: '90g', category: 'Proteínas y Carnes' as const },
            { item: 'Tostadas horneadas sin grasa', quantity: '2 piezas', category: 'Cereales y Legumbres' as const },
            { item: 'Jitomate y cebolla para caldillo sin sal', quantity: '1 pieza', category: 'Verduras' as const },
            { item: 'Aguacate fresco', quantity: '1/3 pieza', category: 'Grasas Saludables' as const },
            { item: 'Lechuga orejona picada', quantity: '1 taza', category: 'Verduras' as const },
          ],
      prep: 'Cocinar la proteína con hierbas aromáticas aromáticas; montar sobre las tostadas horneadas y coronar con vegetales frescos.',
      benefit: 'Una combinación ligera y deliciosa que nutre tu cuerpo sin causarte pesadez ni alterar tu azúcar.',
    },
    {
      name: isDiabetes
        ? 'Revuelto Campestre con Champiñones, Espinacas y Pan de Masa Madre'
        : 'Pudín de Chía con Proteína Aislada, Leche de Almendras y Frambuesas',
      ingredients: [
        { item: 'Huevo campero o claras', quantity: '2 piezas', category: 'Proteínas y Carnes' as const },
        { item: 'Champiñones frescos fileteados', quantity: '1 taza (70g)', category: 'Verduras' as const },
        { item: 'Espinacas tiernas', quantity: '1 taza', category: 'Verduras' as const },
        { item: 'Pan 100% integral o centeno de fermentación lenta', quantity: '1 rebanada gruesa', category: 'Cereales y Legumbres' as const },
        { item: 'Aceite de oliva virgen extra', quantity: '1 cucharadita', category: 'Grasas Saludables' as const },
      ],
      prep: 'Saltear los champiñones con espinacas y un toque de orégano. Verter el huevo batido y remover suavemente. Servir sobre pan tostado.',
      benefit: 'Rico en minerales naturales que te dan energía constante y apoyan tu bienestar diario.',
    },
  ];

  const mainMeals = [
    {
      name: isCkd
        ? 'Pechuga de Pollo Tierna a la Plancha con Arroz al Vapor y Zanahorias Salteadas'
        : isLiver || isDiabetes
        ? 'Filete de Salmón o Trucha en Costra de Hierbas con Quinoa y Espárragos'
        : 'Pechuga de Pollo al Limón y Romero con Arroz Integral y Ensalada Mediterránea',
      ingredients: [
        { item: isCkd ? 'Pechuga de pollo limpia' : 'Pechuga de pollo o filete de pescado', quantity: isCkd ? '80g' : '130g', category: 'Proteínas y Carnes' as const },
        { item: isCkd ? 'Arroz blanco cocido al vapor' : 'Quinoa o arroz integral cocido', quantity: '3/4 taza (120g)', category: 'Cereales y Legumbres' as const },
        { item: 'Espárragos o calabacitas verdes', quantity: '1 taza (100g)', category: 'Verduras' as const },
        { item: 'Aceite de oliva virgen extra', quantity: '1 cucharada (10ml)', category: 'Grasas Saludables' as const },
        { item: 'Limón y romero fresco', quantity: 'Al gusto', category: 'Condimentos' as const },
      ],
      prep: 'Marinar la proteína con limón y hierbas. Cocinar a la plancha a fuego medio-alto 4 min por lado. Acompañar con cereal integral y vegetales.',
      benefit: isCkd
        ? 'Porciones exactas y medidas para nutrirte excelente sin sobrecargar tus riñones.'
        : 'Grasas saludables que cuidan tu corazón y ayudan a disminuir la inflamación en tu cuerpo.',
    },
    {
      name: isGout
        ? 'Bowl de Tofu Firme Marinado con Verduras Salteadas y Fideos de Arroz'
        : 'Medallón de Atún Sellado con Ajonjolí, Aguacate y Puré de Camote Asado',
      ingredients: [
        { item: isGout ? 'Tofu firme prensado' : 'Medallón de atún fresco', quantity: '130g', category: 'Proteínas y Carnes' as const },
        { item: 'Camote naranja o fideos de arroz', quantity: '1/2 taza cocido', category: 'Cereales y Legumbres' as const },
        { item: 'Brócoli al vapor o calabacitas', quantity: '1 taza', category: 'Verduras' as const },
        { item: 'Semillas de ajonjolí tostadas', quantity: '1 cucharadita', category: 'Grasas Saludables' as const },
        { item: 'Aguacate hass en láminas', quantity: '1/3 pieza', category: 'Grasas Saludables' as const },
      ],
      prep: 'Sellar el atún o tofu en sartén muy caliente 2 minutos por lado dejando el centro jugoso. Servir con camote al horno.',
      benefit: 'Excelente fuente de nutrientes que te dan energía limpia y cuidan tu salud cardiovascular.',
    },
    {
      name: 'Guiso Casero de Lentejas Estofadas con Verduras y Tiras de Pavo Magro',
      ingredients: [
        { item: 'Lentejas cocidas', quantity: '3/4 taza', category: 'Cereales y Legumbres' as const },
        { item: 'Pechuga de pavo picada en cubos', quantity: '90g', category: 'Proteínas y Carnes' as const },
        { item: 'Zanahoria, apio y calabacita en cubos', quantity: '1 taza abundante', category: 'Verduras' as const },
        { item: 'Jitomate licuado con ajo y orégano', quantity: '1/2 taza', category: 'Condimentos' as const },
        { item: 'Aceite de oliva', quantity: '1 cucharadita', category: 'Grasas Saludables' as const },
      ],
      prep: 'Estofar las verduras picadas con el jitomate y hierbas aromáticas. Agregar las lentejas cocidas y el pavo hasta concentrar sabores.',
      benefit: 'Fibra excelente que cuida tu flora intestinal y te ayuda a mantener tus niveles de azúcar estables.',
    },
  ];

  const dinners = [
    {
      name: isDiabetes
        ? 'Ensalada Tibia de Nopales Asados con Queso Panela y Pechuga Deshebrada'
        : 'Filete de Pescado Blanco en Papillote con Calabacitas y Hierbas Finas',
      ingredients: [
        { item: 'Filete de pescado blanco (róbalo, tilapia o merluza)', quantity: '120g', category: 'Proteínas y Carnes' as const },
        { item: 'Calabacita italiana en rodajas', quantity: '1 taza', category: 'Verduras' as const },
        { item: 'Jitomate cherry partidos', quantity: '1/2 taza', category: 'Verduras' as const },
        { item: 'Aceite de oliva virgen extra', quantity: '1 cucharadita', category: 'Grasas Saludables' as const },
        { item: isCeliac ? 'Tortilla de maíz nixtamalizado' : 'Tortilla de maíz o pan integral', quantity: '1 pieza', category: 'Cereales y Legumbres' as const },
      ],
      prep: 'Envolver el filete con las verduras y aceite de oliva en papel vegetal o aluminio. Hornear a 180°C durante 15 minutos.',
      benefit: 'Cena muy ligera y fácil de digerir para que duermas profundamente y amanezcas con gran energía.',
    },
    {
      name: 'Crema Ligera de Calabaza de Castilla y Zanahoria con Semillas y Huevo Poché',
      ingredients: [
        { item: 'Calabaza y zanahoria cocidas en caldo vegetal sin sal', quantity: '1 taza y media', category: 'Verduras' as const },
        { item: 'Huevo pochado o cocido', quantity: '1 pieza grande', category: 'Proteínas y Carnes' as const },
        { item: 'Semillas de calabaza tostadas', quantity: '1 cucharada', category: 'Grasas Saludables' as const },
        { item: 'Tostada de maíz horneada', quantity: '1 pieza', category: 'Cereales y Legumbres' as const },
      ],
      prep: 'Licuar la calabaza con su caldo hasta obtener textura aterciopelada. Servir caliente con el huevo pochado encima y pepitas.',
      benefit: 'Te aporta vitaminas naturales y sustancias que relajan tu cuerpo para un descanso nocturno reparador.',
    },
    {
      name: 'Tacos Ligeros de Lechuga Romana con Salteado de Pavo, Pimientos y Aguacate',
      ingredients: [
        { item: 'Molida de pechuga de pavo 98% libre de grasa', quantity: '100g', category: 'Proteínas y Carnes' as const },
        { item: 'Pimientos tricolores en juliana', quantity: '1 taza', category: 'Verduras' as const },
        { item: 'Hojas enteras de lechuga orejona o francesa', quantity: '4 hojas grandes', category: 'Verduras' as const },
        { item: 'Aguacate machacado con limón', quantity: '1/4 pieza', category: 'Grasas Saludables' as const },
      ],
      prep: 'Saltear el pavo con los pimientos a la sartén con comino y ajo. Servir en hojas crujientes de lechuga a modo de tacos.',
      benefit: 'Bajo en calorías y carbohidratos, ideal para quemar grasa mientras duermes.',
    },
  ];

  const snacks = [
    {
      name: isCkd ? 'Manzana Asada con Canela' : 'Manzana Verde con Mantequilla de Almendras 100% Pura',
      ingredients: isCkd
        ? [
            { item: 'Manzana verde pelada', quantity: '1 pieza', category: 'Frutas' as const },
            { item: 'Canela en polvo', quantity: '1 pizca', category: 'Condimentos' as const },
          ]
        : [
            { item: 'Manzana verde con cáscara', quantity: '1 pieza mediana', category: 'Frutas' as const },
            { item: 'Mantequilla de almendra natural', quantity: '1 cucharada (15g)', category: 'Grasas Saludables' as const },
          ],
      prep: 'Cortar la fruta en gajos y untar la mantequilla de fruto seco.',
      benefit: 'Fibra y grasas saludables que evitan que te dé hambre entre comidas y cuidan tu azúcar.',
    },
    {
      name: isDiabetes ? 'Pepinos y Jícama con Limón, Chile en Polvo y Semillas de Girasol' : 'Yogur Griego 0% Grasa con Nueces Picadas',
      ingredients: isDiabetes
        ? [
            { item: 'Pepino pelado y rebanado', quantity: '1 taza', category: 'Verduras' as const },
            { item: 'Jícama fresca en bastones', quantity: '1/2 taza', category: 'Verduras' as const },
            { item: 'Limón y chile piquín puro sin sal añadida', quantity: 'Al gusto', category: 'Condimentos' as const },
            { item: 'Semillas de girasol tostadas', quantity: '1 cucharada', category: 'Grasas Saludables' as const },
          ]
        : [
            { item: 'Yogur griego sin endulzar', quantity: '150g', category: 'Lácteos' as const },
            { item: 'Nueces de castilla en mitades', quantity: '4 piezas', category: 'Grasas Saludables' as const },
          ],
      prep: 'Servir fresco en tazón individual.',
      benefit: 'Un bocadillo fresco y llenador que te quita el antojo sin aportar calorías de más.',
    },
    {
      name: 'Gelatina Light de Frutas con Cubos de Queso Panela',
      ingredients: [
        { item: 'Gelatina sin azúcar preparada', quantity: '1 taza', category: 'Condimentos' as const },
        { item: 'Queso panela fresco en cubitos', quantity: '40g', category: 'Lácteos' as const },
      ],
      prep: 'Cortar el queso y acompañar con la porción de gelatina fría.',
      benefit: 'Proteína ligera y refrescante para calmar el hambre de forma saludable.',
    },
  ];

  const days: DayPlan[] = [];
  const currentPlanUsedDishes = new Set<string>();

  for (let i = 0; i < daysCount; i++) {
    const dayName = daysCount === 1
      ? 'Día Modelo'
      : (daysNames[i % 7] + (daysCount > 7 ? ` (Semana ${Math.floor(i / 7) + 1})` : ''));

    const meals: MealItem[] = activeSplits.map((split, sIdx) => {
      // Pick smart meal avoiding excludedDishes and avoiding dishes already picked in this plan
      const template = pickSmartMealsForDay(
        split.type,
        dietaryStyle,
        pathologies,
        excludedDishes,
        currentPlanUsedDishes,
        i * 7 + sIdx + (Date.now() % 50)
      );

      // Record so subsequent days never repeat it
      currentPlanUsedDishes.add(template.name.toLowerCase().trim());

      const mealCal = Math.round(targetCalories * split.pct);
      const mealProt = Math.round(targetProtein * split.pct);
      const mealCarbs = Math.round(targetCarbs * split.pct);
      const mealFat = Math.round(targetFat * split.pct);

      return {
        id: `meal-${i}-${sIdx}-${Date.now().toString(36)}`,
        type: split.type,
        timeLabel: split.label,
        name: template.name,
        calories: mealCal,
        protein: mealProt,
        carbs: mealCarbs,
        fat: mealFat,
        ingredients: template.ingredients,
        preparation: template.preparation,
        clinicalBenefit: template.clinicalBenefit,
      };
    });

    const dayCalories = meals.reduce((acc, m) => acc + m.calories, 0);
    const dayProtein = meals.reduce((acc, m) => acc + m.protein, 0);
    const dayCarbs = meals.reduce((acc, m) => acc + m.carbs, 0);
    const dayFat = meals.reduce((acc, m) => acc + m.fat, 0);

    days.push({
      dayNumber: i + 1,
      dayName,
      meals,
      totalCalories: dayCalories,
      totalProtein: dayProtein,
      totalCarbs: dayCarbs,
      totalFat: dayFat,
    });
  }

  // Lista de compras consolidada agrupada
  const groceryMap = new Map<string, Set<string>>();
  days.forEach((d) => {
    d.meals.forEach((m) => {
      m.ingredients.forEach((ing) => {
        const cat = ing.category || 'Otros';
        if (!groceryMap.has(cat)) {
          groceryMap.set(cat, new Set());
        }
        groceryMap.get(cat)!.add(`${ing.item}`);
      });
    });
  });

  const groceryList = Array.from(groceryMap.entries()).map(([category, itemsSet]) => ({
    category,
    items: Array.from(itemsSet),
  }));

  const clinicalObservations: string[] = [
    `Plan estructurado para cubrir exactamente ${targetCalories} kcal diarias (${targetProtein}g proteína, ${targetCarbs}g carbohidratos, ${targetFat}g grasas).`,
    isDiabetes ? 'Horarios de comida estables para prevenir fluctuaciones bruscas de glucosa postprandial.' : '',
    isHTA ? 'Condimentar exclusivamente con hierbas secas, orégano, ajo y limón para mantener ingesta de sodio bajo control.' : '',
    isCkd ? 'Control minucioso de alimentos con fósforo inorgánico añadido y seguimiento de volumen urinario.' : '',
    'Se recomienda masticar despacio (al menos 20 minutos por comida principal) para optimizar la respuesta de saciedad.',
  ].filter(Boolean);

  const hydrationLiters = Number(Math.max(2.0, (targetCalories / 1000) * 1.1).toFixed(1));

  const styleInfo = AVAILABLE_DIETARY_STYLES.find((s) => s.id === dietaryStyle);
  const styleName = styleInfo ? styleInfo.name : 'Estándar Clínico Equilibrado';

  const planResult: MenuPlan = {
    id: `plan-${Date.now()}`,
    patientId: 'temp',
    createdAt: new Date().toISOString(),
    title: `Plan Nutricional ${styleName} (${daysCount} días) - ${targetCalories} kcal`,
    daysCount,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    days,
    groceryList,
    clinicalObservations,
    hydrationLiters,
    dietaryStyle,
    dietaryStyleName: styleName,
  };

  planResult.varietyAudit = auditMenuPlanVariety(planResult, excludedDishes);

  return planResult;
}


export interface FormulaInfo {
  id: EnergyFormula;
  name: string;
  shortName: string;
  population: string;
  badge: string;
  description: string;
}

export const ENERGY_FORMULAS_INFO: FormulaInfo[] = [
  {
    id: 'mifflin',
    name: 'Mifflin - St Jeor (1990)',
    shortName: 'Mifflin-St Jeor',
    population: 'Adultos con sobrepeso / obesidad y población general',
    badge: 'Gold Standard Clínico',
    description: 'Recomendada por la AND/ADA para estimar el GEB en adultos tanto normopeso como con sobrepeso u obesidad.',
  },
  {
    id: 'valencia',
    name: 'Valencia et al. (INCMNSZ México)',
    shortName: 'Valencia (México)',
    population: 'Específica para población mexicana adulta',
    badge: 'Población Mexicana',
    description: 'Desarrollada por el Instituto Nacional de Ciencias Médicas y Nutrición Salvador Zubirán (INCMNSZ). Máxima representatividad en México.',
  },
  {
    id: 'harris_benedict',
    name: 'Harris - Benedict (Roza-Shizgal 1984)',
    shortName: 'Harris-Benedict',
    population: 'Adultos normopeso y uso clínico tradicional',
    badge: 'Tradicional',
    description: 'Ecuación clásica ampliamente utilizada; suele sobreestimar ligeramente en personas con obesidad.',
  },
  {
    id: 'schofield',
    name: 'Schofield (1985 / FAO / OMS)',
    shortName: 'Schofield (OMS)',
    population: 'Internacional / Todas las edades',
    badge: 'Referencia OMS',
    description: 'Base de las recomendaciones energéticas de los comités de expertos OMS/FAO/UNU.',
  },
  {
    id: 'oxford_henry',
    name: 'Oxford / Henry (2005)',
    shortName: 'Oxford (Henry)',
    population: 'Adultos contemporáneos / Multiétnico',
    badge: 'Actualización OMS',
    description: 'Revisión moderna de la base de datos de Schofield excluyendo sesgos de estudios con gasto basal elevado.',
  },
  {
    id: 'cunningham',
    name: 'Cunningham (1980 / 1991 - FFM)',
    shortName: 'Cunningham (FFM)',
    population: 'Atletas y personas con masa muscular desarrollada',
    badge: 'Basada en Masa Magra',
    description: 'Calcula el gasto basal directamente a partir de la masa libre de grasa (FFM). Ideal si se cuenta con bioimpedancia o pliegues.',
  },
  {
    id: 'katch_mcardle',
    name: 'Katch - McArdle (Composición Corporal)',
    shortName: 'Katch-McArdle',
    population: 'Individuos activos con % graso conocido',
    badge: 'Composición Corporal',
    description: 'Requiere porcentaje de grasa corporal; altamente confiable para personas magras o deportistas.',
  },
  {
    id: 'tinsley',
    name: 'Tinsley et al. (2018 - Fuerza y Resistencia)',
    shortName: 'Tinsley (Fitness)',
    population: 'Deportistas de fuerza y entrenamiento de hipertrofia',
    badge: 'Deportistas',
    description: 'Optimizada específicamente para personas en entrenamiento de fuerza y desarrollo de masa muscular.',
  },
  {
    id: 'owen',
    name: 'Owen et al. (1986 - 1987)',
    shortName: 'Owen',
    population: 'Adultos sedentarios o con baja masa muscular',
    badge: 'Baja Masa Muscular',
    description: 'Ecuación conservadora con menores estimaciones basales, muy útil para evitar sobreestimaciones calóricas.',
  },
  {
    id: 'ireton_jones',
    name: 'Ireton-Jones (1992 - Soporte Hospitalario)',
    shortName: 'Ireton-Jones',
    population: 'Pacientes en estrés catabólico, trauma o soporte clínico',
    badge: 'Soporte Hospitalario',
    description: 'Diseñada para pacientes convalecientes, hospitalizados o con trauma metabólico agudo.',
  },
  {
    id: 'who',
    name: 'FAO / OMS / UNU (1985)',
    shortName: 'FAO / OMS',
    population: 'Salud pública y grupos poblacionales',
    badge: 'Salud Pública',
    description: 'Ecuaciones de tablas por rangos de edad aprobadas por organismos internacionales de salud.',
  },
];

export interface PatientExercisePrescription {
  title: string;
  patientSummary: string;
  weeklyTargetMinutes: number;
  frequencyDays: string;
  aerobic: {
    recommended: string[];
    durationPerSession: string;
    intensity: string;
    tips: string;
  };
  strength: {
    recommended: string[];
    frequency: string;
    intensity: string;
    tips: string;
  };
  flexibilityBalance: {
    recommended: string[];
    frequency: string;
    duration: string;
  };
  clinicalPrecautions: string[];
  hydrationTips: string[];
}

/**
 * Genera prescripción personalizada de actividad física y ejercicio según edad y patologías
 */
export function getPatientExercisePrescription(patient?: {
  age?: number;
  gender?: Gender;
  weightKg?: number;
  pathologies?: PathologyType[];
  name?: string;
}): PatientExercisePrescription {
  const age = patient?.age || 35;
  const pathologies = patient?.pathologies || [];
  const isSenior = age >= 60;

  const hasDiabetes = pathologies.includes('diabetes_t2') || pathologies.includes('diabetes_t1');
  const hasHTA = pathologies.includes('hypertension') || pathologies.includes('heart_failure');
  const hasCKD = pathologies.includes('ckd_non_dialysis');
  const hasObesity = pathologies.includes('obesity_metabolic');
  const hasGERD = pathologies.includes('gerd_gastritis');

  // Minutos semanales
  let weeklyMinutes = 150;
  let frequencyDays = '4 a 5 días por semana';

  if (isSenior) {
    weeklyMinutes = 150;
    frequencyDays = '3 a 5 días por semana (en bloques cómodos)';
  } else if (hasObesity) {
    weeklyMinutes = 200;
    frequencyDays = '5 días por semana para gasto calórico sostenido';
  }

  // Aeróbico
  const aerobicList: string[] = [];
  let aerobicDuration = '30 a 45 minutos continuos o fraccionados';
  let aerobicIntensity = 'Moderada (puedes hablar pero no cantar mientras lo haces)';
  let aerobicTips = 'Comienza siempre con 5 minutos de caminata lenta o calentamiento suave antes de aumentar el ritmo.';

  if (isSenior || hasObesity || pathologies.includes('heart_failure')) {
    aerobicList.push('Caminata en terreno plano y regular a paso constante');
    aerobicList.push('Bicicleta estática reclinada o elíptica (bajo impacto articular)');
    aerobicList.push('Natación o aquaeróbics / marcha acuática');
    aerobicIntensity = 'Leve a moderada (Escala Borg 11-13 sobre 20)';
    aerobicDuration = '20 a 35 minutos según tolerancia';
  } else {
    aerobicList.push('Caminata rápida o trote suave progresivo');
    aerobicList.push('Ciclismo al aire libre o bicicleta estática');
    aerobicList.push('Natación estilo libre o aeróbicos funcionales');
    aerobicList.push('Subir escaleras de manera controlada o senderismo');
  }

  // Fuerza
  const strengthList: string[] = [];
  let strengthFreq = '2 a 3 días por semana en días no consecutivos';
  let strengthIntensity = 'Moderada: 2 a 3 series de 10 a 12 repeticiones';
  let strengthTips = 'No contengas la respiración durante el esfuerzo; exhala al levantar y toma aire al bajar.';

  if (isSenior) {
    strengthList.push('Ejercicios con el propio peso corporal (levantarse de una silla, puntas de pie)');
    strengthList.push('Bandas elásticas de resistencia suave a media');
    strengthList.push('Pesas ligeras (mancuernas de 1 a 2 kg) para brazos y hombros');
    strengthIntensity = 'Ligera a moderada (1 a 2 series de 10-15 repeticiones sin llegar al fallo)';
  } else if (hasHTA) {
    strengthList.push('Ejercicios dinámicos con mancuernas ligeras o máquinas guiadas');
    strengthList.push('Sentadillas asistidas y desplantes controlados');
    strengthList.push('Remo y empuje en máquinas o bandas de tensión continua');
    strengthTips = 'Evita la maniobra de Valsalva (aguantar el aire fuertemente), ya que eleva la presión arterial de forma brusca.';
  } else {
    strengthList.push('Rutina funcional con bandas de resistencia y mancuernas');
    strengthList.push('Ejercicios multiarticulares: sentadillas, flexiones apoyadas, peso muerto con carga moderada');
    strengthList.push('Máquinas de gimnasio para fortalecimiento de tren inferior y superior');
  }

  // Flexibilidad y Equilibrio
  const flexList: string[] = [
    'Estiramientos suaves de piernas, cadera y espalda baja',
    'Rotaciones articulares de cuello, hombros y tobillos',
  ];
  if (isSenior) {
    flexList.push('Ejercicios de equilibrio: pararse en un pie apoyado en una silla, caminata talón-punta');
    flexList.push('Tai Chi o yoga restaurativo adaptado');
  } else {
    flexList.push('Sesiones de yoga o movilidad articular de 15 minutos al despertar o al terminar');
  }

  // Precauciones Clínicas Específicas
  const precautions: string[] = [];
  if (hasDiabetes) {
    precautions.push('Mide tu nivel de azúcar antes de entrenar: si está por debajo de 100 mg/dL, consume una colación pequeña (ej. una fruta pequeña) antes de iniciar.');
    precautions.push('Revisa tus pies antes y después de hacer ejercicio y utiliza calcetines sin costuras y calzado deportivo bien acolchado.');
    precautions.push('Lleva siempre contigo una fuente de azúcar rápida (tabletas de glucosa o un jugo pequeño) por seguridad.');
  }

  if (hasHTA) {
    precautions.push('Realiza 5 a 10 minutos de enfriamiento paulatino al terminar; no te detengas de golpe.');
    precautions.push('Evita levantar cargas máximas o hacer fuerza isométrica sostenida que pueda elevar la tensión arterial.');
  }

  if (hasCKD) {
    precautions.push('Evita el ejercicio exhaustivo en ambientes muy calurosos para prevenir deshidratación y sobrecarga renal.');
    precautions.push('Monitorea tu volumen urinario y no uses suplementos deportivos no prescritos por tu nutriólogo.');
  }

  if (hasGERD) {
    precautions.push('Espera al menos 90 minutos después de comer antes de iniciar actividad física vigorosa.');
    precautions.push('Evita ejercicios abdominales intensos con el estómago lleno o posturas invertidas prolongadas.');
  }

  if (pathologies.includes('als_mnd')) {
    precautions.push('Enfermedad de motoneurona: Realizar ejercicio submáximo para evitar fatiga muscular severa y calambres; priorizar movilidad articular.');
  }

  if (pathologies.includes('systemic_lupus')) {
    precautions.push('Lupus: Realizar actividad física en horarios protegidos de la radiación solar directa; suspender en periodos de brote articular.');
  }

  if (pathologies.includes('cystic_fibrosis')) {
    precautions.push('Fibrosis Quística: El ejercicio aeróbico ayuda al aclaramiento de secreciones respiratorias; reponer electrolitos y sodio en sudor.');
  }

  if (pathologies.includes('wilson_disease')) {
    precautions.push('Enfermedad de Wilson: Fomentar ejercicios de coordinación motora fina y equilibrio bajo supervisión.');
  }

  if (precautions.length === 0) {
    precautions.push('Escucha a tu cuerpo: si sientes mareo, dolor en el pecho o falta de aire excesiva, detén la actividad y descansa.');
    precautions.push('La constancia semanal es más valiosa y segura que hacer sesiones aisladas muy extenuantes.');
  }

  // Hidratación deportiva adaptada
  const hydration: string[] = [
    'Bebe 1 a 2 vasos de agua (250-400 ml) entre 30 y 45 minutos antes de empezar.',
    'Durante el ejercicio, toma pequeños sorbos de agua cada 15 a 20 minutos (unos 100-150 ml).',
    'Al finalizar, rehidrátate con agua natural fresca; no requieres bebidas deportivas azucaradas salvo entrenamientos mayores a 60 minutos de alta intensidad.',
  ];

  if (hasHTA || hasCKD) {
    hydration.push('Si tu médico indicó restricción de líquidos por función renal o cardíaca, ajusta tus tomas dentro de tu meta diaria calculada.');
  }

  return {
    title: `Prescripción de Actividad Física y Ejercicio Adaptado`,
    patientSummary: `Plan diseñado para paciente de ${age} años${pathologies.length > 0 ? ` con consideraciones para ${pathologies.length} condición(es) clínica(s)` : ' en condición general'}.`,
    weeklyTargetMinutes: weeklyMinutes,
    frequencyDays,
    aerobic: {
      recommended: aerobicList,
      durationPerSession: aerobicDuration,
      intensity: aerobicIntensity,
      tips: aerobicTips,
    },
    strength: {
      recommended: strengthList,
      frequency: strengthFreq,
      intensity: strengthIntensity,
      tips: strengthTips,
    },
    flexibilityBalance: {
      recommended: flexList,
      frequency: isSenior ? 'Todos los días o al menos 4 días por semana' : '3 a 4 días por semana',
      duration: '10 a 15 minutos por sesión',
    },
    clinicalPrecautions: precautions,
    hydrationTips: hydration,
  };
}
