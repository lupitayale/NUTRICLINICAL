import { Patient, MenuPlan, MealItem } from '../types/nutrition';

export interface DietaryStyleDefinition {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  badgeColor: string;
  badgeTextColor: string;
  iconName: string;
  focusNutrients: string[];
  characteristicIngredients: string[];
  clinicalIndication: string;
}

export const AVAILABLE_DIETARY_STYLES: DietaryStyleDefinition[] = [
  {
    id: 'dieta_mexicana_saludable',
    name: 'Dieta Tradicional Mexicana Saludable',
    shortName: 'Tradicional Mexicana',
    subtitle: 'Guisados caseros magros, nopales, legumbres y maíz nixtamalizado',
    badgeColor: 'bg-emerald-100 border-emerald-300',
    badgeTextColor: 'text-emerald-800',
    iconName: 'Flame',
    focusNutrients: ['Fibra prebiótica', 'Antioxidantes naturales', 'Hierro biodisponible', 'Calcio nixtamal'],
    characteristicIngredients: ['Nopales asados', 'Frijoles de la olla', 'Tinga de pollo magro', 'Picadillo con verduras', 'Salpicón de res', 'Calabacitas con elote', 'Tortillas de maíz', 'Epazote fresco', 'Aguacate'],
    clinicalIndication: 'Ideal para alta adherencia cultural en México, control glucémico natural, saciedad y prevención cardiovascular sin grasas saturadas.',
  },
  {
    id: 'dieta_mediterranea',
    name: 'Dieta Mediterránea Cardiosaludable',
    shortName: 'Mediterránea',
    subtitle: 'Aceite de oliva virgen extra, pescado azul, frutos secos y hortalizas',
    badgeColor: 'bg-blue-100 border-blue-300',
    badgeTextColor: 'text-blue-800',
    iconName: 'Droplets',
    focusNutrients: ['Omega-3 EPA/DHA', 'Ácido oleico (MUFA)', 'Polifenoles', 'Vitamina E'],
    characteristicIngredients: ['Aceite de oliva virgen extra', 'Salmón noruego', 'Atún fresco', 'Tomates maduros', 'Albahaca y romero', 'Nueces de Castilla', 'Aceitunas', 'Garbanzos estofados'],
    clinicalIndication: 'Excelente evidencia para reducción de riesgo infarto, hígado graso, hipertensión arterial y reducción de LDL oxidado.',
  },
  {
    id: 'fitness_alta_proteina',
    name: 'Dieta Fitness / Alta en Proteína & Definición',
    shortName: 'Fitness / Hipertrofia',
    subtitle: 'Proteínas limpias de alto valor biológico y carbohidratos complejos medidos',
    badgeColor: 'bg-indigo-100 border-indigo-300',
    badgeTextColor: 'text-indigo-800',
    iconName: 'Dumbbell',
    focusNutrients: ['Proteína de alto VB (1.6 - 2.2 g/kg)', 'BCAAs & Leucina', 'Glucógeno muscular', 'Bajo sodio añadido'],
    characteristicIngredients: ['Pechuga de pollo al grill', 'Claras de huevo', 'Lomo de cerdo desgrasado', 'Arroz jazmín o basmati', 'Avena en hojuelas', 'Camote asado', 'Espinacas baby'],
    clinicalIndication: 'Diseñada para recomposición corporal, hipertrofia muscular, protección de masa magra en déficit calórico y deportistas.',
  },
  {
    id: 'dieta_dash',
    name: 'Dieta DASH Antihipertensiva',
    shortName: 'DASH Antihipertensiva',
    subtitle: 'Restricción de sodio (<1500mg), abundante potasio, magnesio y calcio',
    badgeColor: 'bg-teal-100 border-teal-300',
    badgeTextColor: 'text-teal-800',
    iconName: 'ShieldCheck',
    focusNutrients: ['Potasio (>3500mg)', 'Magnesio (>400mg)', 'Calcio bioasimilable', 'Bajo sodio (<1500mg)'],
    characteristicIngredients: ['Plátano y cítricos', 'Espinacas y acelgas', 'Semillas de calabaza sin sal', 'Yogur natural descremado', 'Frijoles negros sin sal', 'Pescado blanco', 'Hierbas de olor'],
    clinicalIndication: 'Patrón clínico de oro para descenso sostenido de tensión arterial sistólica y diastólica y salud endotelial.',
  },
  {
    id: 'low_carb_moderada',
    name: 'Dieta Baja en Carbohidratos (Low Carb Moderada)',
    shortName: 'Low Carb Moderada',
    subtitle: 'Enfoque en verduras sin almidón, proteínas saciantes y grasas saludables',
    badgeColor: 'bg-amber-100 border-amber-300',
    badgeTextColor: 'text-amber-800',
    iconName: 'Scale',
    focusNutrients: ['Bajo índice glucémico', 'Fibra vegetal insoluble', 'Ácidos grasos monoinsaturados', 'Saciedad temprana'],
    characteristicIngredients: ['Calabacita espiralizada', 'Brócoli al vapor', 'Aguacate', 'Huevos orgánicos', 'Filete de pescado blanco', 'Almendras fileteadas', 'Pechuga a la plancha'],
    clinicalIndication: 'Muy efectiva en resistencia a la insulina, síndrome metabólico, SOP (ovario poliquístico) y triglicéridos elevados.',
  },
  {
    id: 'antiinflamatoria_gut',
    name: 'Dieta Antiinflamatoria & Salud Intestinal (Microbiota)',
    shortName: 'Antiinflamatoria & Gut',
    subtitle: 'Rica en polifenoles, fermentados probióticos, cúrcuma y ácidos grasos antiinflamatorios',
    badgeColor: 'bg-rose-100 border-rose-300',
    badgeTextColor: 'text-rose-800',
    iconName: 'Sparkles',
    focusNutrients: ['Curcumina + Piperina', 'Antocianinas', 'Probióticos vivos', 'Fibra soluble butirogénica'],
    characteristicIngredients: ['Frutos rojos silvestres', 'Kéfir o yogur búlgaro', 'Cúrcuma y jengibre fresco', 'Semillas de linaza molida', 'Pescado graso', 'Té verde matcha', 'Espinacas'],
    clinicalIndication: 'Indicada en dolores articulares crónicos, permeabilidad intestinal, enfermedades autoinmunes y cansancio metabólico.',
  },
  {
    id: 'dieta_cetogenica',
    name: 'Dieta Cetogénica Clínica (Keto)',
    shortName: 'Keto Clínica',
    subtitle: 'Cetosis nutricional controlada (<30g carb netos), grasas nobles y proteínas moderadas',
    badgeColor: 'bg-purple-100 border-purple-300',
    badgeTextColor: 'text-purple-800',
    iconName: 'Zap',
    focusNutrients: ['Carbohidratos netos < 30g', 'Grasas saludables 70-75%', 'Cuerpos cetónicos', 'Electrolitos (Sodio/Potasio/Magnesio)'],
    characteristicIngredients: ['Aceite de oliva virgen', 'Aguacate hass', 'Salmón fresco', 'Huevos enteros', 'Espinacas tiernas', 'Nueces pecana', 'Queso madurado de cabra'],
    clinicalIndication: 'Casos seleccionados de resistencia a la insulina severa, epilepsia, hipertrigliceridemia y saciedad profunda.',
  },
  {
    id: 'vegetariana_equilibrada',
    name: 'Dieta Vegetariana Equilibrada (Plant-Based)',
    shortName: 'Vegetariana',
    subtitle: '100% libre de carnes; combinaciones de legumbres, cereales enteros, tofu y semillas',
    badgeColor: 'bg-green-100 border-green-300',
    badgeTextColor: 'text-green-800',
    iconName: 'ChefHat',
    focusNutrients: ['Proteína vegetal completa', 'Vitamina B12 fortificada', 'Hierro no hemo + Vit C', 'Zinc vegetal'],
    characteristicIngredients: ['Lentejas pardinas', 'Tofu firme marinado', 'Garbanzos cocidos', 'Quinoa real', 'Semillas de cáñamo', 'Espinacas', 'Nueces y almendras'],
    clinicalIndication: 'Excelente para longevidad, salud cardiovascular, huella ecológica y pacientes vegetarianos estrictos.',
  },
  {
    id: 'ovolactovegetariana',
    name: 'Dieta Ovo-Lacto-Vegetariana',
    shortName: 'Ovo-Lacto-Vegetariana',
    subtitle: 'Vegetales, legumbres, huevos de pastoreo, requesón y lácteos seleccionados',
    badgeColor: 'bg-lime-100 border-lime-300',
    badgeTextColor: 'text-lime-800',
    iconName: 'CheckCircle2',
    focusNutrients: ['Colina de alta calidad', 'Calcio lácteo', 'Proteína de huevo y suero', 'Fibra'],
    characteristicIngredients: ['Huevos revueltos con verduras', 'Queso panela artesanal', 'Requesón magro', 'Frijoles negros', 'Avena cocida', 'Champiñones salteados'],
    clinicalIndication: 'Transición óptima hacia un patrón más vegetal con la practicidad y proteína del huevo y quesos magros.',
  },
  {
    id: 'economica_practica',
    name: 'Dieta Económica & Práctica (Batch Cooking)',
    shortName: 'Económica & Práctica',
    subtitle: 'Ingredientes accesibles de mercado local, recetas rendidoras en menos de 20 min',
    badgeColor: 'bg-orange-100 border-orange-300',
    badgeTextColor: 'text-orange-800',
    iconName: 'ShoppingCart',
    focusNutrients: ['Máximo rendimiento nutricional/costo', 'Alimentos de temporada', 'Conservación semanal', 'Preparación rápida'],
    characteristicIngredients: ['Huevos', 'Atún en agua', 'Frijoles y lentejas secas', 'Arroz integral', 'Zanahorias y calabacitas', 'Plátano y manzana', 'Avena'],
    clinicalIndication: 'Pacientes con horarios apretados, presupuesto familiar estricto o que requieren cocinar para toda la semana en 1 día.',
  },
  {
    id: 'baja_en_fodmaps',
    name: 'Dieta Baja en FODMAPs (Gastroprotectora)',
    shortName: 'Baja en FODMAPs',
    subtitle: 'Sin carbohidratos fermentables de cadena corta para colon irritable y distensión',
    badgeColor: 'bg-sky-100 border-sky-300',
    badgeTextColor: 'text-sky-800',
    iconName: 'Clock',
    focusNutrients: ['Bajo contenido en fructanos, GOS, lactosa y polioles', 'Digestión gástrica ultraligera'],
    characteristicIngredients: ['Zanahoria cocida', 'Calabacita verde', 'Pechuga de pollo', 'Arroz blanco al vapor', 'Aceite con infusión de ajo (sin sólidos)', 'Plátano verde', 'Papaya'],
    clinicalIndication: 'Tratamiento de primera línea para Síndrome de Intestino Irritable (SII), meteorismo, gases y diarreas funcionales.',
  },
  {
    id: 'estandar',
    name: 'Estándar Clínico Equilibrado (SMAE)',
    shortName: 'Estándar Clínico',
    subtitle: 'Distribución macro y micronutricional equilibrada basada en el sistema de equivalentes',
    badgeColor: 'bg-slate-100 border-slate-300',
    badgeTextColor: 'text-slate-800',
    iconName: 'Calculator',
    focusNutrients: ['50-55% Carbohidratos complejos', '18-22% Proteína magra', '28-30% Grasas equilibradas'],
    characteristicIngredients: ['Avena', 'Pollo', 'Pescado', 'Frijoles', 'Arroz', 'Frutas variadas', 'Aceite de oliva'],
    clinicalIndication: 'Patrón general versátil apto para cualquier paciente en mantenimiento o inicio de asesoría nutricional.',
  },
];

export interface PlanVarietyAudit {
  totalMealsInPlan: number;
  uniqueMealsInPlan: number;
  duplicateMealsWithinPlan: string[];
  historyOverlaps: string[];
  noveltyScorePercent: number; // 100% when 0 repetitions
  monthlyStatus: 'excelente_sin_repeticiones' | 'buena_variacion' | 'alerta_duplicados';
  analysisSummary: string;
  analyzedAt: string;
}

/**
 * Normaliza nombres de platillos para comparaciones anti-repetición inteligentes
 */
export function normalizeMealName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos
    .replace(/[^a-z0-9\s]/g, '') // Quita signos
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrae todo el historial de platillos consumidos por el paciente en los últimos 30 días
 */
export function extractPatientDishHistory(patient: Patient, daysLimit = 30): string[] {
  const historySet = new Set<string>();

  // 1. Historial explícito en paciente
  if (patient.mealHistory30Days && Array.isArray(patient.mealHistory30Days)) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysLimit);

    patient.mealHistory30Days.forEach((entry) => {
      if (entry.mealName) {
        historySet.add(entry.mealName.trim());
      }
    });
  }

  // 2. Platillos del menú activo
  if (patient.activeMenuPlan?.days) {
    patient.activeMenuPlan.days.forEach((day) => {
      day.meals?.forEach((m) => {
        if (m.name) historySet.add(m.name.trim());
      });
    });
  }

  // 3. Platillos de planes guardados recientemente
  if (patient.savedMenuPlans && Array.isArray(patient.savedMenuPlans)) {
    patient.savedMenuPlans.forEach((plan) => {
      plan.days?.forEach((day) => {
        day.meals?.forEach((m) => {
          if (m.name) historySet.add(m.name.trim());
        });
      });
    });
  }

  return Array.from(historySet);
}

/**
 * Audita a profundidad la variedad y no-repetición de un menú recién generado
 */
export function auditMenuPlanVariety(
  plan: MenuPlan,
  historyDishes: string[] = []
): PlanVarietyAudit {
  const allMeals: string[] = [];
  const normalizedSeen = new Map<string, string>(); // normalized -> original name
  const duplicateMealsWithinPlan: string[] = [];

  plan.days.forEach((day) => {
    day.meals.forEach((m) => {
      if (m.name) {
        allMeals.push(m.name.trim());
        const norm = normalizeMealName(m.name);
        if (normalizedSeen.has(norm)) {
          if (!duplicateMealsWithinPlan.includes(m.name.trim())) {
            duplicateMealsWithinPlan.push(m.name.trim());
          }
        } else {
          normalizedSeen.set(norm, m.name.trim());
        }
      }
    });
  });

  const totalMealsInPlan = allMeals.length;
  const uniqueMealsInPlan = normalizedSeen.size;

  // Analizar coincidencias con el historial de 30 días
  const normalizedHistory = new Set(historyDishes.map((d) => normalizeMealName(d)));
  const historyOverlaps: string[] = [];

  allMeals.forEach((meal) => {
    const norm = normalizeMealName(meal);
    if (normalizedHistory.has(norm)) {
      if (!historyOverlaps.includes(meal)) {
        historyOverlaps.push(meal);
      }
    }
  });

  const totalPenalties = duplicateMealsWithinPlan.length * 2 + historyOverlaps.length;
  const rawScore = totalMealsInPlan > 0 ? Math.max(0, 100 - Math.round((totalPenalties / totalMealsInPlan) * 100)) : 100;
  const noveltyScorePercent = totalPenalties === 0 ? 100 : Math.min(95, rawScore);

  let monthlyStatus: 'excelente_sin_repeticiones' | 'buena_variacion' | 'alerta_duplicados' = 'excelente_sin_repeticiones';
  let analysisSummary = '';

  if (duplicateMealsWithinPlan.length === 0 && historyOverlaps.length === 0) {
    monthlyStatus = 'excelente_sin_repeticiones';
    analysisSummary = `¡Variedad 100% impecable! Los ${totalMealsInPlan} tiempos de comida son totalmente únicos y no se repiten con ningún menú consumido en los últimos 30 días. Tu paciente disfrutará de una alimentación fresca y motivadora.`;
  } else if (duplicateMealsWithinPlan.length === 0 && historyOverlaps.length <= 2) {
    monthlyStatus = 'buena_variacion';
    analysisSummary = `Muy buena variedad (${noveltyScorePercent}% único). No hay platillos repetidos dentro de esta semana, solo ${historyOverlaps.length} platillo(s) coinciden con menús anteriores del mes.`;
  } else {
    monthlyStatus = 'alerta_duplicados';
    analysisSummary = `Atención: Se detectaron ${duplicateMealsWithinPlan.length} repeticiones internas y ${historyOverlaps.length} coincidencias con el historial mensual. Puedes rotar estos platillos con 1 clic para asegurar que el paciente no se aburra.`;
  }

  return {
    totalMealsInPlan,
    uniqueMealsInPlan,
    duplicateMealsWithinPlan,
    historyOverlaps,
    noveltyScorePercent,
    monthlyStatus,
    analysisSummary,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Guarda y actualiza los platillos del plan en el registro histórico del paciente (rotación 30 días)
 */
export function recordPlanInPatientHistory(patient: Patient, plan: MenuPlan): Patient {
  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setDate(now.getDate() - 30);
  const cutoffIso = cutoffDate.toISOString();

  // Filtrar existentes menores a 30 días
  const existingHistory = (patient.mealHistory30Days || []).filter(
    (item) => item.date >= cutoffIso
  );

  const newEntries: {
    id: string;
    date: string;
    mealName: string;
    type: string;
    dayIndex?: number;
    planTitle?: string;
  }[] = [];

  const existingNamesSet = new Set(existingHistory.map((h) => normalizeMealName(h.mealName)));

  plan.days.forEach((day, dIdx) => {
    day.meals.forEach((m) => {
      const norm = normalizeMealName(m.name);
      if (!existingNamesSet.has(norm)) {
        existingNamesSet.add(norm);
        newEntries.push({
          id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          date: now.toISOString().split('T')[0],
          mealName: m.name.trim(),
          type: m.type,
          dayIndex: dIdx + 1,
          planTitle: plan.title,
        });
      }
    });
  });

  return {
    ...patient,
    mealHistory30Days: [...newEntries, ...existingHistory].slice(0, 200), // guardar hasta 200 platillos rotativos
    updatedAt: new Date().toISOString(),
  };
}
