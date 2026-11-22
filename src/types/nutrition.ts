export type Gender = 'male' | 'female';

export type PathologyType =
  | 'diabetes_t2'
  | 'diabetes_t1'
  | 'hypertension'
  | 'ckd_non_dialysis'
  | 'fatty_liver'
  | 'dyslipidemia'
  | 'hyperuricemia_gout'
  | 'hypothyroidism'
  | 'celiac'
  | 'obesity_metabolic'
  // Common / Clinical additions
  | 'heart_failure'
  | 'crohn_colitis'
  | 'ibs_fodmap'
  | 'pcos'
  | 'gerd_gastritis'
  // Rare & Genetic diseases
  | 'pku_phenylketonuria'
  | 'cystic_fibrosis'
  | 'wilson_disease'
  | 'als_mnd'
  | 'systemic_lupus'
  | 'glycogen_storage'
  | 'short_bowel';

export type NutritionGoal =
  | 'fat_loss'
  | 'muscle_gain'
  | 'maintenance'
  | 'glycemic_control'
  | 'renal_protection'
  | 'cardiovascular_dash';

export type EnergyFormula =
  | 'mifflin'
  | 'harris_benedict'
  | 'who'
  | 'katch_mcardle'
  | 'oxford_henry'
  | 'schofield'
  | 'valencia'
  | 'cunningham'
  | 'owen'
  | 'tinsley'
  | 'ireton_jones';

export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

export interface AnthropometricRecord {
  id: string;
  patientId: string;
  date: string; // ISO date YYYY-MM-DD
  weightKg: number;
  heightCm: number;
  waistCm?: number;
  hipCm?: number;
  armCircumferenceCm?: number;
  bodyFatPercent?: number;
  muscleMassPercent?: number;
  // Bioquímica y Signos vitales opcionales
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  fastingGlucoseMgDl?: number;
  hba1cPercent?: number;
  cholesterolMgDl?: number;
  triglyceridesMgDl?: number;
  creatinineMgDl?: number;
  // Métricas calculadas
  bmi: number;
  bmiClassification: string;
  bmiStatusClass: 'underweight' | 'normal' | 'overweight' | 'obese1' | 'obese2' | 'obese3';
  waistHipRatio?: number;
  cardioRisk?: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto';
  idealWeightHamwi: number;
  idealWeightMetropolitan: number;
  adjustedWeightKg: number;
  consultationNotes?: string;
}

export interface MacroPrescription {
  formula: EnergyFormula;
  activityLevel: ActivityLevel;
  bmr: number; // GEB
  tef: number; // ETA (10%)
  tee: number; // GET
  calorieAdjustment: number; // e.g. -500 for deficit
  targetCalories: number;
  
  // Sports Nutrition
  isSportsNutrition?: boolean;
  sportsCategory?: 'endurance' | 'strength' | 'power';
  trainingIntensity?: 'baja' | 'moderada' | 'alta';
  
  // Macronutrientes
  proteinGramsPerKg: number;
  proteinGrams: number;
  proteinKcal: number;
  proteinPercent: number;
  
  carbGrams: number;
  carbKcal: number;
  carbPercent: number;
  
  fatGrams: number;
  fatKcal: number;
  fatPercent: number;
  
  // Metas clínicas adicionales por patología
  sodiumMgLimit?: number;
  potassiumMgLimit?: number;
  phosphorusMgLimit?: number;
  fiberGramsTarget?: number;
  clinicalGuidelines: string[];
}

export interface MealIngredient {
  item: string;
  quantity: string;
  category: string;
}

export interface MealItem {
  id: string;
  type: 'desayuno' | 'colacion_1' | 'comida' | 'colacion_2' | 'cena';
  timeLabel: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: MealIngredient[];
  preparation: string;
  clinicalBenefit: string;
}

export interface DayPlan {
  dayNumber: number;
  dayName: string;
  meals: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MenuPlan {
  id: string;
  patientId: string;
  createdAt: string;
  title: string;
  daysCount: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  days: DayPlan[];
  groceryList: { category: string; items: string[] }[];
  clinicalObservations: string[];
  hydrationLiters: number;
  supplements?: SupplementItem[];
  dietaryStyle?: string;
  dietaryStyleName?: string;
  varietyAudit?: {
    totalMealsInPlan: number;
    uniqueMealsInPlan: number;
    duplicateMealsWithinPlan: string[];
    historyOverlaps: string[];
    noveltyScorePercent: number;
    monthlyStatus: 'excelente_sin_repeticiones' | 'buena_variacion' | 'alerta_duplicados';
    analysisSummary: string;
    analyzedAt: string;
  };
}

export interface SupplementItem {
  id: string;
  name: string;
  dosage: string;
  form: 'cápsulas' | 'comprimidos' | 'polvo' | 'gotas' | 'sobres' | 'líquido';
  frequency: string;
  timing:
    | 'con_alimentos'
    | 'en_ayunas'
    | 'antes_dormir'
    | 'pre_entreno'
    | 'post_entreno'
    | 'con_comida_grasa'
    | 'personalizado';
  timingCustom?: string;
  duration: string;
  purpose: string;
  // Nutritional macros when included in meal plans & sports nutrition
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servings?: number;
  servingUnit?: string;
  category?: 'proteinas' | 'rendimiento' | 'carbohidratos' | 'micronutrientes' | 'hidratacion' | 'salud';
}

export interface MedicalPrescription {
  id: string;
  patientId: string;
  folio: string;
  date: string; // YYYY-MM-DD
  nutriologistName: string;
  professionalLicense: string;
  specialty?: string;
  title: string;
  supplements: SupplementItem[];
  dietaryIndications: string[];
  clinicalObservations: string[];
  hydrationRecommendationLiters: number;
  nextReviewDate?: string;
  signatureDate: string;
  isActive: boolean;
}

export type LabMarkerCategory =
  | 'glucidico'
  | 'lipidico'
  | 'renal_electrolitos'
  | 'hepatico'
  | 'hematologia_nutricional';

export type LabStatus = 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high';

export interface LabMarkerDefinition {
  id: string;
  name: string;
  shortName: string;
  unit: string;
  category: LabMarkerCategory;
  refMale: { min: number; max: number; criticalMin?: number; criticalMax?: number };
  refFemale: { min: number; max: number; criticalMin?: number; criticalMax?: number };
  optimalTarget?: string;
  clinicalSignificance: string;
}

export interface LabMarkerEvaluation {
  markerId: string;
  value: number;
  status: LabStatus;
  statusLabel: string;
  colorClass: string;
  badgeClass: string;
  refRangeStr: string;
  interpretation: string;
  isAltered: boolean;
  isCritical: boolean;
}

export interface ClinicalLabAlert {
  id: string;
  title: string;
  severity: 'warning' | 'danger' | 'info';
  message: string;
  nutritionalRecommendation: string;
  affectedMarkers: string[];
}

export interface LabRecord {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  laboratoryName?: string;
  fastingHours?: number;
  notes?: string;
  values: Record<string, number>; // markerId -> number
  computedHomaIr?: number;
  computedEgfr?: number;
}

export interface Patient {
  id: string;
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  age: number;
  gender: Gender;
  email: string;
  phone: string;
  occupation: string;
  reasonForVisit: string;
  pathologies: PathologyType[];
  targetGoal: NutritionGoal;
  allergies: string[];
  foodDislikes: string[];
  foodFavorites: string[];
  mealsPerDay: 3 | 4 | 5;
  activePrescription: MacroPrescription;
  consultations: AnthropometricRecord[];
  activeMenuPlan?: MenuPlan;
  savedMenuPlans?: MenuPlan[];
  activeEnteralPrescription?: EnteralPrescription;
  enteralPrescriptions?: EnteralPrescription[];
  activeParenteralPrescription?: ParenteralPrescription;
  medicalPrescriptions?: MedicalPrescription[];
  activeMedicalPrescription?: MedicalPrescription;
  labRecords?: LabRecord[];
  clinicalLifecycleAssessment?: ClinicalLifecycleAssessment;
  mealHistory30Days?: {
    id: string;
    date: string;
    mealName: string;
    type: string;
    dayIndex?: number;
    planTitle?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalAppointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM"
  type: 'primera_vez' | 'seguimiento' | 'entrega_menu' | 'control_bioquimico';
  status: 'confirmada' | 'pendiente' | 'completada' | 'cancelada';
  notes?: string;
}

export interface PatientActivity {
  id: string;
  patientId: string;
  patientName: string;
  type: 'consultation' | 'menu_generated' | 'prescription_updated' | 'patient_created' | 'goal_achieved';
  title: string;
  description: string;
  timestamp: string;
  badgeColor?: string;
}

// ==========================================
// NUTRIOLOGIST & CLINIC ADMINISTRATION
// ==========================================
export interface Nutriologist {
  id: string;
  username: string;
  password?: string;
  name: string;
  professionalLicense: string; // Cédula Profesional
  specialty: string;
  email: string;
  phone: string;
  role: 'admin' | 'clinical_nutriologist';
  isActive: boolean;
  avatarInitials: string;
  notes?: string;
  createdAt: string;
}

// ==========================================
// ENTERAL NUTRITION (COMMERCIAL & ARTISANAL)
// ==========================================
export type EnteralRoute = 'oral' | 'sng' | 'sny' | 'peg' | 'pej';
export type EnteralAdministrationMode = 'continuous' | 'bolus' | 'gravity' | 'intermittent';

export interface CommercialEnteralFormula {
  id: string;
  name: string;
  brand: string;
  category:
    | 'polimerica_estandar'
    | 'especializada_diabetes'
    | 'especializada_renal'
    | 'especializada_pulmonar'
    | 'peptidica_oligomerica'
    | 'hipercalorica_hiperproteica'
    | 'inmunomoduladora';
  caloricDensityKcalMl: number;
  proteinGramsPerLiter: number;
  carbGramsPerLiter: number;
  fatGramsPerLiter: number;
  proteinPercent: number;
  carbPercent: number;
  fatPercent: number;
  osmolarityMOsmKg: number;
  fiberGramsPerLiter: number;
  freeWaterPercent: number; // e.g. 78 => 78%
  containerSizeMl: number; // e.g. 237ml
  clinicalIndications: string;
  contraindications?: string;
}

export interface ArtisanalIngredient {
  id: string;
  name: string;
  category: 'proteina' | 'carbohidrato' | 'vegetal' | 'fruta' | 'grasa' | 'liquido' | 'suplemento';
  portionUnit: string;
  gramsPerUnit: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  fluidMl: number;
  viscosityScore: 1 | 2 | 3; // 1 = Muy fluido, 3 = Denso (requiere colar/diluir)
  tips: string;
}

export interface EnteralPrescription {
  id: string;
  patientId: string;
  type: 'commercial' | 'artisanal';
  formulaName: string;
  route: EnteralRoute;
  mode: EnteralAdministrationMode;
  totalVolumeMl: number;
  dailyCalories: number;
  dailyProteinGrams: number;
  dailyCarbGrams: number;
  dailyFatGrams: number;
  freeWaterMl: number;
  additionalWaterFlushesMl: number;
  totalFluidMl: number;
  // Commercial specific
  commercialFormulaId?: string;
  containersCount?: number;
  // Artisanal specific
  artisanalIngredients?: { ingredient: ArtisanalIngredient; quantity: number }[];
  // Regimen
  infusionRateMlPerHour?: number;
  infusionHoursPerDay?: number;
  bolusCount?: number;
  bolusVolumeMl?: number;
  bolusIntervalHours?: number;
  tubeGaugeFr: number; // e.g. 10, 12, 14, 16 Fr
  preparationNotes: string[];
  date: string;
}

// ==========================================
// PARENTERAL NUTRITION (NPT / TPN)
// ==========================================
export type ParenteralAccessRoute = 'central' | 'peripheral';

export interface ParenteralPrescription {
  id: string;
  patientId: string;
  accessRoute: ParenteralAccessRoute;
  patientWeightKg: number;
  totalVolumeMl: number;
  // Amino Acids
  aminoAcidConcentrationPercent: number; // 10, 8.5, 15
  aminoAcidGramsPerKg: number;
  aminoAcidTotalGrams: number;
  aminoAcidCalories: number;
  nitrogenGrams: number;
  // Dextrose
  dextroseConcentrationPercent: number; // 50, 10
  dextroseTotalGrams: number;
  dextroseCalories: number;
  glucoseInfusionRateMgKgMin: number; // TIG
  // Lipids
  lipidConcentrationPercent: number; // 20
  lipidGramsPerKg: number;
  lipidTotalGrams: number;
  lipidCalories: number;
  // Totals & Ratios
  totalCalories: number;
  nonProteinCalories: number;
  nonProteinCalorieToNitrogenRatio: number; // Kcal NP : g N
  proteinCaloriePercent: number;
  dextroseCaloriePercent: number;
  lipidCaloriePercent: number;
  // Electrolytes
  sodiumMeq: number;
  potassiumMeq: number;
  calciumMeq: number;
  magnesiumMeq: number;
  phosphorusMmol: number;
  // Additives
  mviMl: number;
  traceElementsMl: number;
  heparinUnits?: number;
  vitaminCMg?: number;
  // Safety
  calculatedOsmolarityMOsmL: number;
  isCentralRouteMandatory: boolean;
  // Infusion Regimen
  infusionHours: number;
  infusionRateMlPerHour: number;
  clinicalWarnings: string[];
  date: string;
}

export interface ClinicalLifecycleAssessment {
  id: string;
  patientId: string;
  category: 'pediatric' | 'pregnancy_lactation' | 'geriatric' | 'adult_general';
  // Pediatric specific
  pediatricZScores?: {
    weightForAge?: number; // e.g. -1.2 Z
    heightForAge?: number;
    bmiForAge?: number;
    nutritionalDiagnosis: string; // e.g. "Eutrófico", "Desnutrición leve", "Sobrepeso"
  };
  // Pregnancy / Lactation specific
  pregnancyLactationData?: {
    gestationalWeeks?: number;
    prePregnancyBmi?: number;
    weightGainKg?: number;
    recommendedGainRange?: string; // e.g. "11.5 - 16 kg"
    trimester?: 1 | 2 | 3 | 4; // 4 = lactancia
    lactationMonths?: number;
    obstetricRisk: 'bajo' | 'moderado' | 'alto';
  };
  // Geriatric specific
  geriatricData?: {
    mnaScore?: number; // Mini Nutritional Assessment (0-30)
    mnaCategory?: 'normal' | 'riesgo_desnutricion' | 'desnutricion';
    frailtyStatus?: 'robusto' | 'pre_fragil' | 'fragil';
    adlScore?: number; // Barthel / Katz
    cognitiveStatus?: 'normal' | 'deterioro_leve' | 'deterioro_moderado_severo';
  };
  // Global multi-pathology clinical summary
  globalPathologySummary: string;
  metabolicRiskLevel: 'bajo' | 'moderado' | 'alto' | 'critico';
  recommendedIntervention: string;
  evaluatorName: string;
  date: string;
}

export interface ClinicBrandingLogo {
  id: string;
  name: string;
  subtitle: string;
  accentColor: string;
  svgBadge: string;
  previewClass?: string;
}



