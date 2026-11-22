import { SupplementItem } from '../types/nutrition';

export interface CatalogSupplement {
  id: string;
  name: string;
  category: 'proteinas' | 'rendimiento' | 'carbohidratos' | 'micronutrientes' | 'hidratacion' | 'salud';
  categoryLabel: string;
  badgeColor: string;
  form: 'polvo' | 'cápsulas' | 'comprimidos' | 'sobres' | 'líquido';
  servingUnit: string;
  defaultServings: number;
  defaultDosageText: string;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  defaultTiming: SupplementItem['timing'];
  purpose: string;
  instructions: string;
}

export const SPORTS_SUPPLEMENTS_CATALOG: CatalogSupplement[] = [
  // --- PROTEÍNAS & AMINOÁCIDOS ---
  {
    id: 'whey_isolate',
    name: 'Whey Protein Isolate (Aislado de Suero CFM 90%)',
    category: 'proteinas',
    categoryLabel: 'Proteína',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    form: 'polvo',
    servingUnit: 'scoop (30g)',
    defaultServings: 1,
    defaultDosageText: '1 scoop (30g) diluido en 250-300ml de agua',
    caloriesPerServing: 110,
    proteinPerServing: 27,
    carbsPerServing: 0.5,
    fatPerServing: 0.2,
    defaultTiming: 'post_entreno',
    purpose: 'Máxima pureza proteica, rápida absorción para síntesis de masa muscular libre de grasa y recuperación inmediata.',
    instructions: 'Tomar inmediatamente después del entrenamiento o como colación proteica rápida.',
  },
  {
    id: 'whey_concentrate',
    name: 'Whey Protein Concentrate (Concentrado WPC 80%)',
    category: 'proteinas',
    categoryLabel: 'Proteína',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    form: 'polvo',
    servingUnit: 'scoop (30g)',
    defaultServings: 1,
    defaultDosageText: '1 scoop (30g) con agua o leche deslactosada',
    caloriesPerServing: 120,
    proteinPerServing: 24,
    carbsPerServing: 2.5,
    fatPerServing: 1.5,
    defaultTiming: 'post_entreno',
    purpose: 'Excelente valor biológico, fraccionamiento de péptidos bioactivos e inmunoglobulinas para hipertrofia y saciedad.',
    instructions: 'Consumir post-entreno o integrado en licuados y avena matutina.',
  },
  {
    id: 'casein_micellar',
    name: 'Caseína Micelar Ultra Pura',
    category: 'proteinas',
    categoryLabel: 'Proteína',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    form: 'polvo',
    servingUnit: 'scoop (32g)',
    defaultServings: 1,
    defaultDosageText: '1 scoop (32g) con agua antes de descansar',
    caloriesPerServing: 120,
    proteinPerServing: 25,
    carbsPerServing: 1.5,
    fatPerServing: 1.0,
    defaultTiming: 'antes_dormir',
    purpose: 'Digestión lenta y liberación sostenida de aminoácidos durante 7-8 horas de sueño para evitar catabolismo nocturno.',
    instructions: 'Consumir 30 a 45 minutos antes de dormir, mezclado en agua o leche.',
  },
  {
    id: 'plant_protein_isolate',
    name: 'Proteína Vegetal Aislada (Guisante + Arroz)',
    category: 'proteinas',
    categoryLabel: 'Proteína',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    form: 'polvo',
    servingUnit: 'scoop (33g)',
    defaultServings: 1,
    defaultDosageText: '1 scoop (33g) con 300ml de agua',
    caloriesPerServing: 125,
    proteinPerServing: 24,
    carbsPerServing: 2.0,
    fatPerServing: 2.0,
    defaultTiming: 'post_entreno',
    purpose: 'Aminograma balanceado completo para pacientes veganos/vegetarianos o con sensibilidad digestiva a la lactosa.',
    instructions: 'Tomar post-entreno o entre comidas principales.',
  },
  {
    id: 'collagen_peptides',
    name: 'Colágeno Hidrolizado + Vitamina C',
    category: 'proteinas',
    categoryLabel: 'Proteína / Articular',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    form: 'polvo',
    servingUnit: 'scoop (10g)',
    defaultServings: 1,
    defaultDosageText: '1 scoop (10g) disuelto en agua o infusión',
    caloriesPerServing: 36,
    proteinPerServing: 9,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'en_ayunas',
    purpose: 'Soporte del tejido conectivo, cartílagos, tendones y articulaciones sometidas a sobrecarga mecánica deportiva.',
    instructions: 'Tomar en ayunas o 45-60 min antes de la sesión de fuerza.',
  },
  {
    id: 'eaa_essential_amino',
    name: 'EAA (9 Aminoácidos Esenciales Libres)',
    category: 'proteinas',
    categoryLabel: 'Aminoácidos',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    form: 'polvo',
    servingUnit: 'scoop (10g)',
    defaultServings: 1,
    defaultDosageText: '1 scoop (10g) diluido en 400ml de agua',
    caloriesPerServing: 40,
    proteinPerServing: 10,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'pre_entreno',
    purpose: 'Estimulación directa de síntesis proteica sin carga digestiva durante o antes del entrenamiento.',
    instructions: 'Beber durante o antes del entrenamiento de alta demanda.',
  },
  {
    id: 'glutamine_powder',
    name: 'L-Glutamina Fermentada Micronizada',
    category: 'proteinas',
    categoryLabel: 'Aminoácidos',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    form: 'polvo',
    servingUnit: 'scoop (5g)',
    defaultServings: 1,
    defaultDosageText: '1 scoop (5g) en agua templada',
    caloriesPerServing: 20,
    proteinPerServing: 5,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'antes_dormir',
    purpose: 'Mantenimiento de la integridad de la barrera intestinal y soporte inmunológico en periodos de alto volumen de carga.',
    instructions: 'Consumir con el estómago vacío antes de dormir o post-entreno.',
  },

  // --- FUERZA, POTENCIA & RENDIMIENTO ---
  {
    id: 'creatine_creapure',
    name: 'Creatina Monohidratada (Sello Creapure)',
    category: 'rendimiento',
    categoryLabel: 'Rendimiento',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    form: 'polvo',
    servingUnit: 'scoop (5g)',
    defaultServings: 1,
    defaultDosageText: '5g diarios disueltos con carbohidratos o agua',
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'post_entreno',
    purpose: 'Saturación de fosfocreatina intracelular, ganancia de fuerza máxima, potencia explosiva e hidratación muscular celular.',
    instructions: 'Tomar diariamente a la misma hora (post-entreno los días de ejercicio) con abundante agua.',
  },
  {
    id: 'beta_alanine',
    name: 'Beta-Alanina (CarnoSyn)',
    category: 'rendimiento',
    categoryLabel: 'Rendimiento',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    form: 'polvo',
    servingUnit: 'dosis (3.2g)',
    defaultServings: 1,
    defaultDosageText: '3.2g divididos en 2 tomas de 1.6g con comida',
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'con_alimentos',
    purpose: 'Incremento de carnosina intramuscular amortiguando la acidosis láctica en esfuerzos de 1 a 4 minutos de alta intensidad.',
    instructions: 'Tomar con alimentos principales para evitar parestesia transitoria.',
  },
  {
    id: 'citrulline_malate',
    name: 'Citrulina Malato 2:1 Ultra Pura',
    category: 'rendimiento',
    categoryLabel: 'Rendimiento',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    form: 'polvo',
    servingUnit: 'scoop (6g)',
    defaultServings: 1,
    defaultDosageText: '6g a 8g 30-45 minutos antes de la sesión',
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'pre_entreno',
    purpose: 'Estimulación de óxido nítrico endotelial, mayor flujo sanguíneo, congestión y eliminación de amoníaco residual.',
    instructions: 'Consumir 40 minutos antes del entrenamiento con agua fresca.',
  },
  {
    id: 'caffeine_anhydrous',
    name: 'Cafeína Anhidra Pura (200 mg)',
    category: 'rendimiento',
    categoryLabel: 'Energía / Rendimiento',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    form: 'cápsulas',
    servingUnit: 'cápsula (200mg)',
    defaultServings: 1,
    defaultDosageText: '1 cápsula (200mg) 45 min antes de entrenar',
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'pre_entreno',
    purpose: 'Aumento de neurotransmisión adrenérgica, reducción de la percepción del esfuerzo (RPE) y retraso de fatiga central.',
    instructions: 'Tomar 45 min antes de la sesión. Evitar tomas posteriores a las 5:00 PM para proteger el sueño.',
  },
  {
    id: 'hmb_caps',
    name: 'HMB (Beta-hidroxi-beta-metilbutirato)',
    category: 'rendimiento',
    categoryLabel: 'Anticatabólico',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    form: 'cápsulas',
    servingUnit: '3 cápsulas (3g)',
    defaultServings: 1,
    defaultDosageText: '3g al día (1g en cada comida principal)',
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'con_alimentos',
    purpose: 'Potente acción anticatabólica y preservación de masa muscular magra en fases de restricción calórica severa.',
    instructions: 'Tomar 1g con desayuno, 1g antes de entrenar y 1g con cena.',
  },

  // --- CARBOHIDRATOS & ENERGÍA DEPORTIVA ---
  {
    id: 'cluster_dextrin',
    name: 'Ciclodextrina Altamente Ramificada (Cluster Dextrin)',
    category: 'carbohidratos',
    categoryLabel: 'Carbohidratos',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    form: 'polvo',
    servingUnit: 'scoop (30g)',
    defaultServings: 1,
    defaultDosageText: '1 scoop (30g) diluido en el termo intra-entreno',
    caloriesPerServing: 116,
    proteinPerServing: 0,
    carbsPerServing: 29,
    fatPerServing: 0,
    defaultTiming: 'pre_entreno',
    purpose: 'Baja presión osmótica y vaciamiento gástrico ultraveloz sin reflujo; energía glucídica limpia y constante durante la sesión.',
    instructions: 'Mezclar con 400-500ml de agua y beber a sorbos durante o justo antes de la sesión.',
  },
  {
    id: 'maltodextrin',
    name: 'Maltodextrina Deportiva Micronizada',
    category: 'carbohidratos',
    categoryLabel: 'Carbohidratos',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    form: 'polvo',
    servingUnit: 'scoop (30g)',
    defaultServings: 1,
    defaultDosageText: '1 scoop (30g) con proteína post-entreno',
    caloriesPerServing: 114,
    proteinPerServing: 0,
    carbsPerServing: 28.5,
    fatPerServing: 0,
    defaultTiming: 'post_entreno',
    purpose: 'Índice glucémico elevado para pico de insulina y reposición acelerada de glucógeno muscular en ventana post-ejercicio.',
    instructions: 'Añadir al batido de proteína post-entreno con agua.',
  },
  {
    id: 'vitargo_amylopectin',
    name: 'Amilopectina de Maíz Ceroso (Vitargo)',
    category: 'carbohidratos',
    categoryLabel: 'Carbohidratos',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    form: 'polvo',
    servingUnit: 'scoop (35g)',
    defaultServings: 1,
    defaultDosageText: '1 scoop (35g) con 500ml de agua',
    caloriesPerServing: 135,
    proteinPerServing: 0,
    carbsPerServing: 33.5,
    fatPerServing: 0,
    defaultTiming: 'post_entreno',
    purpose: 'Alto peso molecular que recarga el glucógeno un 70% más rápido que la dextrosa y sin pesadez estomacal.',
    instructions: 'Consumir post-entreno o antes de pruebas de fondo.',
  },
  {
    id: 'energy_gel',
    name: 'Gel Energético Isotónico Dual (Maltodextrina + Fructosa)',
    category: 'carbohidratos',
    categoryLabel: 'Carbohidratos',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    form: 'sobres',
    servingUnit: 'sachet (32g)',
    defaultServings: 1,
    defaultDosageText: '1 sachet cada 45-60 min de esfuerzo continuo',
    caloriesPerServing: 90,
    proteinPerServing: 0,
    carbsPerServing: 22,
    fatPerServing: 0,
    defaultTiming: 'pre_entreno',
    purpose: 'Carbohidratos de absorción dual (SGLT1 y GLUT5) para evitar el agotamiento de glucógeno en pruebas de fondo (>60 min).',
    instructions: 'Consumir con 100-150ml de agua durante la actividad prolongada.',
  },
  {
    id: 'mass_gainer',
    name: 'Mass Gainer Deportivo Ratio 2:1 (Carbo + Proteína)',
    category: 'carbohidratos',
    categoryLabel: 'Gainer',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200',
    form: 'polvo',
    servingUnit: 'porción (80g)',
    defaultServings: 1,
    defaultDosageText: '80g (2 scoops) con leche o agua entre comidas',
    caloriesPerServing: 310,
    proteinPerServing: 25,
    carbsPerServing: 50,
    fatPerServing: 1.5,
    defaultTiming: 'post_entreno',
    purpose: 'Densidad calórico-proteica para alcanzar superávits calóricos en pacientes ectomorfos o deportistas con gasto extremo.',
    instructions: 'Tomar entre comidas o inmediatamente después del entrenamiento con leche entera o agua.',
  },

  // --- MICRONUTRIENTES, SALUD & RECUPERACIÓN ---
  {
    id: 'omega3_tg_high',
    name: 'Omega 3 Ultra Puro TG (1000 mg EPA / 500 mg DHA)',
    category: 'micronutrientes',
    categoryLabel: 'Ácidos Grasos',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    form: 'cápsulas',
    servingUnit: '2 cápsulas blandas',
    defaultServings: 1,
    defaultDosageText: '2 cápsulas con la comida principal',
    caloriesPerServing: 20,
    proteinPerServing: 0.4,
    carbsPerServing: 0,
    fatPerServing: 2.0,
    defaultTiming: 'con_alimentos',
    purpose: 'Modulación de la inflamación muscular por daño mecánico (DOMS), fluidez de membrana celular y salud vascular.',
    instructions: 'Tomar junto con una comida que contenga grasas saludables para maximizar absorción.',
  },
  {
    id: 'magnesium_bisglycinate',
    name: 'Bisglicinato de Magnesio Quelado (400 mg)',
    category: 'micronutrientes',
    categoryLabel: 'Minerales',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-200',
    form: 'cápsulas',
    servingUnit: '2 cápsulas (400mg)',
    defaultServings: 1,
    defaultDosageText: '400mg 45 minutos antes de dormir',
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'antes_dormir',
    purpose: 'Relajación neuromuscular profunda, síntesis de ATP, prevención de calambres y optimización del sueño REM.',
    instructions: 'Consumir 45 min antes de acostarse con agua templada.',
  },
  {
    id: 'vit_d3_k2',
    name: 'Vitamina D3 (5,000 UI) + Vitamina K2 (MK-7 100 mcg)',
    category: 'micronutrientes',
    categoryLabel: 'Vitaminas',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-200',
    form: 'cápsulas',
    servingUnit: '1 cápsula blanda',
    defaultServings: 1,
    defaultDosageText: '1 cápsula con desayuno que contenga grasa',
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'con_alimentos',
    purpose: 'Salud ósea, función contráctil del miocito, optimización del sistema inmunitario y homeostasis del calcio.',
    instructions: 'Tomar por la mañana junto con el desayuno (liposoluble).',
  },
  {
    id: 'multivitamin_sport',
    name: 'Multivitamínico Deportivo de Alto Espectro',
    category: 'micronutrientes',
    categoryLabel: 'Vitaminas',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-200',
    form: 'comprimidos',
    servingUnit: '1 tableta',
    defaultServings: 1,
    defaultDosageText: '1 tableta con el desayuno',
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'con_alimentos',
    purpose: 'Reposición de oligoelementos y vitaminas coenzimáticas consumidas durante entrenamientos intensos.',
    instructions: 'Tomar después del desayuno con agua.',
  },
  {
    id: 'ashwagandha_ksm',
    name: 'Ashwagandha KSM-66 (Extracto Estandarizado 5%)',
    category: 'salud',
    categoryLabel: 'Adaptógeno',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
    form: 'cápsulas',
    servingUnit: '1 cápsula (600mg)',
    defaultServings: 1,
    defaultDosageText: '600mg al día junto con la cena',
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'con_alimentos',
    purpose: 'Reducción de cortisol en sangre, regulación del estrés sistémico y mejora en la calidad del sueño profundo.',
    instructions: 'Tomar con la cena o 1 hora antes de dormir.',
  },

  // --- HIDRATACIÓN & SALUD DIGESTIVA ---
  {
    id: 'electrolytes_powder',
    name: 'Electrolitos Isotónicos en Polvo (Sodio, Potasio, Magnesio)',
    category: 'hidratacion',
    categoryLabel: 'Hidratación',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-200',
    form: 'sobres',
    servingUnit: 'sobre (8g)',
    defaultServings: 1,
    defaultDosageText: '1 sobre en 600ml de agua durante la sesión',
    caloriesPerServing: 15,
    proteinPerServing: 0,
    carbsPerServing: 3.5,
    fatPerServing: 0,
    defaultTiming: 'pre_entreno',
    purpose: 'Mantenimiento del volumen plasmático, prevención de hiponatremia y calambres por sudoración abundante.',
    instructions: 'Disolver en agua fresca e ingerir durante o después de entrenamientos calurosos o >60 min.',
  },
  {
    id: 'probiotics_sport',
    name: 'Probióticos Multicepa (50 Billones UFC con FOS)',
    category: 'salud',
    categoryLabel: 'Microbiota',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    form: 'cápsulas',
    servingUnit: '1 cápsula',
    defaultServings: 1,
    defaultDosageText: '1 cápsula en ayunas 20 min antes del desayuno',
    caloriesPerServing: 0,
    proteinPerServing: 0,
    carbsPerServing: 0,
    fatPerServing: 0,
    defaultTiming: 'en_ayunas',
    purpose: 'Refuerzo de la microbiota, disminución del síndrome de intestino permeable post-esfuerzo y absorción de nutrientes.',
    instructions: 'Tomar en ayunas con agua a temperatura ambiente.',
  },
];

/**
 * Helper to calculate total macros from a list of supplements
 */
export function calculateSupplementsTotals(supplements: SupplementItem[] = []): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  return supplements.reduce(
    (acc, supp) => {
      const servings = supp.servings || 1;
      const cal = (supp.calories || 0) * servings;
      const prot = (supp.protein || 0) * servings;
      const carb = (supp.carbs || 0) * servings;
      const fat = (supp.fat || 0) * servings;

      return {
        calories: acc.calories + cal,
        protein: Number((acc.protein + prot).toFixed(1)),
        carbs: Number((acc.carbs + carb).toFixed(1)),
        fat: Number((acc.fat + fat).toFixed(1)),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Auto-balance helper:
 * Takes the patient's target calories & macros, subtracts the supplement contribution,
 * and scales all food meals across all days so that (Food Meals + Supplements) perfectly
 * squares to the target prescription!
 */
export function autoSquareMenuWithSupplements(
  days: {
    dayNumber: number;
    dayName: string;
    meals: {
      id: string;
      type: 'desayuno' | 'colacion_1' | 'comida' | 'colacion_2' | 'cena';
      timeLabel: string;
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      ingredients: { item: string; quantity: string; category: string }[];
      preparation: string;
      clinicalBenefit: string;
    }[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  }[],
  supplements: SupplementItem[],
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
) {
  const suppTotals = calculateSupplementsTotals(supplements);

  // Targets to be covered by whole food meals
  const foodTargetCalories = Math.max(800, targetCalories - suppTotals.calories);
  const foodTargetProtein = Math.max(25, targetProtein - suppTotals.protein);
  const foodTargetCarbs = Math.max(30, targetCarbs - suppTotals.carbs);
  const foodTargetFat = Math.max(15, targetFat - suppTotals.fat);

  const balancedDays = days.map((day) => {
    // Current total of meals for this day
    const currentMealsKcal = day.meals.reduce((sum, m) => sum + m.calories, 0);
    const currentMealsProtein = day.meals.reduce((sum, m) => sum + m.protein, 0);
    const currentMealsCarbs = day.meals.reduce((sum, m) => sum + m.carbs, 0);
    const currentMealsFat = day.meals.reduce((sum, m) => sum + m.fat, 0);

    const kcalRatio = currentMealsKcal > 0 ? foodTargetCalories / currentMealsKcal : 1;
    const proteinRatio = currentMealsProtein > 0 ? foodTargetProtein / currentMealsProtein : 1;
    const carbsRatio = currentMealsCarbs > 0 ? foodTargetCarbs / currentMealsCarbs : 1;
    const fatRatio = currentMealsFat > 0 ? foodTargetFat / currentMealsFat : 1;

    // Scale each meal proportionally to match target
    const scaledMeals = day.meals.map((meal) => {
      const newKcal = Math.round(meal.calories * kcalRatio);
      const newProtein = Math.round(meal.protein * proteinRatio);
      const newCarbs = Math.round(meal.carbs * carbsRatio);
      const newFat = Math.round(meal.fat * fatRatio);

      // Slightly scale quantities in string for visual consistency
      const scaledIngredients = meal.ingredients.map((ing) => {
        // If ingredient has numeric prefix, scale it
        const match = ing.quantity.match(/^([\d.,]+)\s*(.*)$/);
        if (match && kcalRatio !== 1) {
          const num = parseFloat(match[1].replace(',', '.'));
          if (!isNaN(num)) {
            const scaledNum = (num * kcalRatio).toFixed(1).replace(/\.0$/, '');
            return {
              ...ing,
              quantity: `${scaledNum} ${match[2]}`.trim(),
            };
          }
        }
        return ing;
      });

      return {
        ...meal,
        calories: newKcal,
        protein: newProtein,
        carbs: newCarbs,
        fat: newFat,
        ingredients: scaledIngredients,
      };
    });

    const newFoodCalories = scaledMeals.reduce((sum, m) => sum + m.calories, 0);
    const newFoodProtein = scaledMeals.reduce((sum, m) => sum + m.protein, 0);
    const newFoodCarbs = scaledMeals.reduce((sum, m) => sum + m.carbs, 0);
    const newFoodFat = scaledMeals.reduce((sum, m) => sum + m.fat, 0);

    return {
      ...day,
      meals: scaledMeals,
      // Total day = food meals + supplements contribution
      totalCalories: newFoodCalories + suppTotals.calories,
      totalProtein: newFoodProtein + suppTotals.protein,
      totalCarbs: newFoodCarbs + suppTotals.carbs,
      totalFat: newFoodFat + suppTotals.fat,
    };
  });

  return {
    balancedDays,
    suppTotals,
    foodTargetCalories,
    foodTargetProtein,
    foodTargetCarbs,
    foodTargetFat,
  };
}
