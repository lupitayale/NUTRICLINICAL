import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  ShoppingCart,
  Printer,
  RotateCcw,
  ChefHat,
  Droplets,
  AlertCircle,
  HelpCircle,
  Save,
  Check,
  Flame,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Trash2,
  Dumbbell,
  History,
  Scale,
} from 'lucide-react';
import { Patient, MenuPlan, MealItem, DayPlan } from '../types/nutrition';
import {
  generateLocalClinicalMenu,
  PATHOLOGY_INFO,
  getPatientExercisePrescription,
} from '../utils/nutritionCalculations';
import { FoodEquivalentsTool } from './FoodEquivalentsTool';
import { SavedPlansModal } from './SavedPlansModal';
import { SupplementsManagerModal } from './SupplementsManagerModal';
import { PatientDishHistoryModal } from './PatientDishHistoryModal';
import {
  AVAILABLE_DIETARY_STYLES,
  extractPatientDishHistory,
  auditMenuPlanVariety,
  recordPlanInPatientHistory,
} from '../utils/menuVarietyEngine';
import {
  calculateSupplementsTotals,
  autoSquareMenuWithSupplements,
} from '../utils/sportsSupplementsCatalog';
import { SupplementItem } from '../types/nutrition';

interface MenuGeneratorViewProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigateToTab: (tab: string, docType?: string) => void;
}

export const MenuGeneratorView: React.FC<MenuGeneratorViewProps> = ({
  patient,
  onUpdatePatient,
  onNavigateToTab,
}) => {
  const [daysCount, setDaysCount] = useState<number>(7);
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4 | 5>(patient.mealsPerDay || 5);
  const [dietaryStyle, setDietaryStyle] = useState<string>('estandar');
  const [customDietNotes, setCustomDietNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<string | null>(null);

  // Active viewing day (0 to daysCount - 1)
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [activeViewMode, setActiveViewMode] = useState<'menu' | 'groceries' | 'clinical' | 'equivalents'>('menu');

  // Working menu plan (defaults to patient's activeMenuPlan or generates initial local)
  const [currentPlan, setCurrentPlan] = useState<MenuPlan>(() => {
    if (patient.activeMenuPlan) {
      return patient.activeMenuPlan;
    }
    const initialExcluded = extractPatientDishHistory(patient, 30);
    // Generate an initial plan right away so the user never sees an empty screen!
    return generateLocalClinicalMenu(
      patient.fullName,
      patient.pathologies,
      patient.activePrescription.targetCalories,
      patient.activePrescription.proteinGrams,
      patient.activePrescription.carbGrams,
      patient.activePrescription.fatGrams,
      patient.mealsPerDay || 5,
      7,
      patient.allergies,
      patient.foodDislikes,
      'estandar',
      initialExcluded
    );
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSupplementsModalOpen, setIsSupplementsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Generate Menu function (Calls backend Gemini endpoint with robust anti-repetition analysis)
  const handleGenerateMenu = async () => {
    setIsGenerating(true);
    setGenerationSource(null);

    const latestConsult = patient.consultations[patient.consultations.length - 1];
    const weight = latestConsult?.weightKg || 70;
    const height = latestConsult?.heightCm || 170;

    // Extraer historial de platillos consumidos por el paciente en los últimos 30 días
    const excludedMeals = extractPatientDishHistory(patient, 30);

    try {
      const response = await fetch('/api/generate-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.fullName,
          age: patient.age,
          gender: patient.gender,
          weightKg: weight,
          heightCm: height,
          pathologies: patient.pathologies.map((p) => PATHOLOGY_INFO[p]?.name || p),
          targetGoal: patient.targetGoal,
          targetCalories: patient.activePrescription.targetCalories,
          targetProtein: patient.activePrescription.proteinGrams,
          targetCarbs: patient.activePrescription.carbGrams,
          targetFat: patient.activePrescription.fatGrams,
          mealsPerDay,
          daysCount,
          allergies: patient.allergies || [],
          dislikes: patient.foodDislikes || [],
          preferences: patient.foodFavorites || [],
          customNotes: customDietNotes,
          dietaryStyle,
          excludedMeals,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.plan) {
        const finalPlan: MenuPlan = data.plan;
        // Garantizar que la auditoría de variedad esté presente
        if (!finalPlan.varietyAudit) {
          finalPlan.varietyAudit = auditMenuPlanVariety(finalPlan, excludedMeals);
        }

        setCurrentPlan(finalPlan);
        setGenerationSource(data.source === 'gemini_ai' ? 'Gemini 3.8 Flash Clínico (Anti-Repetición)' : 'Motor Clínico Especialista');
        setActiveDayIndex(0);

        // Guardar automáticamente en el paciente y registrar en el historial de 30 días
        const patientWithHistory = recordPlanInPatientHistory(patient, finalPlan);
        onUpdatePatient({
          ...patientWithHistory,
          activeMenuPlan: finalPlan,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('API generation failed, fallbacking to local clinical generator:', err);
      // Fallback con motor de variedad masiva
      const localPlan = generateLocalClinicalMenu(
        patient.fullName,
        patient.pathologies,
        patient.activePrescription.targetCalories,
        patient.activePrescription.proteinGrams,
        patient.activePrescription.carbGrams,
        patient.activePrescription.fatGrams,
        mealsPerDay,
        daysCount,
        patient.allergies,
        patient.foodDislikes,
        dietaryStyle,
        excludedMeals
      );
      setCurrentPlan(localPlan);
      setGenerationSource('Motor Clínico Local Masivo (100% Variedad)');
      setActiveDayIndex(0);
      const patientWithHistory = recordPlanInPatientHistory(patient, localPlan);
      onUpdatePatient({
        ...patientWithHistory,
        activeMenuPlan: localPlan,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToPatient = () => {
    onUpdatePatient({
      ...patient,
      activeMenuPlan: currentPlan,
      updatedAt: new Date().toISOString(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const [isSavedPlansModalOpen, setIsSavedPlansModalOpen] = useState(false);
  const [savedPlanSuccessMsg, setSavedPlanSuccessMsg] = useState(false);

  const handleSaveMenuOption = () => {
    const existing = patient.savedMenuPlans || [];
    const updatedSaved = [currentPlan, ...existing];
    onUpdatePatient({
      ...patient,
      activeMenuPlan: currentPlan,
      savedMenuPlans: updatedSaved,
      updatedAt: new Date().toISOString(),
    });
    setSavedPlanSuccessMsg(true);
    setTimeout(() => setSavedPlanSuccessMsg(false), 3000);
  };

  const handleSelectSavedPlan = (plan: MenuPlan) => {
    setCurrentPlan(plan);
    onUpdatePatient({
      ...patient,
      activeMenuPlan: plan,
      updatedAt: new Date().toISOString(),
    });
    setIsSavedPlansModalOpen(false);
  };

  const handleDeleteSavedPlan = (planId: string) => {
    const existing = patient.savedMenuPlans || [];
    const updatedSaved = existing.filter((p) => p.id !== planId);
    onUpdatePatient({
      ...patient,
      savedMenuPlans: updatedSaved,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRegenerateDay = (dayIndex: number) => {
    if (!currentPlan) return;
    const freshPlan = generateLocalClinicalMenu(
      patient.fullName,
      patient.pathologies,
      patient.activePrescription.targetCalories,
      patient.activePrescription.proteinGrams,
      patient.activePrescription.carbGrams,
      patient.activePrescription.fatGrams,
      mealsPerDay,
      daysCount,
      patient.allergies,
      patient.foodDislikes,
      dietaryStyle
    );
    const newDayData = freshPlan.days[dayIndex % freshPlan.days.length];
    const updatedDays = [...currentPlan.days];
    updatedDays[dayIndex] = {
      ...newDayData,
      dayNumber: dayIndex + 1,
      dayName: currentPlan.days[dayIndex].dayName,
    };
    const updatedPlan = { ...currentPlan, days: updatedDays };
    setCurrentPlan(updatedPlan);
    onUpdatePatient({
      ...patient,
      activeMenuPlan: updatedPlan,
      updatedAt: new Date().toISOString(),
    });
  };

  const duplicateDayIndices: number[] = [];
  const seenMeals = new Map<string, number>();
  currentPlan?.days.forEach((day, idx) => {
    const key = day.meals.map((m) => m.name).join('|');
    if (seenMeals.has(key)) {
      duplicateDayIndices.push(idx);
    } else {
      seenMeals.set(key, idx);
    }
  });
  const hasDuplicates = duplicateDayIndices.length > 0;

  // Swap / Alternate a specific meal with full ingredients, equivalents, and macros
  const handleSwapMeal = (mealIndex: number) => {
    if (!currentPlan) return;
    const currentDay = currentPlan.days[activeDayIndex];
    if (!currentDay) return;
    const targetMeal = currentDay.meals[mealIndex];
    if (!targetMeal) return;

    // Structured meal alternatives categorized by meal type
    const alternateLibraries: Record<
      'desayuno' | 'colacion_1' | 'comida' | 'colacion_2' | 'cena',
      Array<{
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        prep: string;
        benefit: string;
        ingredients: Array<{
          name: string;
          portion: string;
          weightGrams: number;
          category: string;
          equivalents: number;
        }>;
      }>
    > = {
      desayuno: [
        {
          name: 'Omelette de Claras con Champiñones y Tostadas de Maíz',
          calories: 360,
          protein: 24,
          carbs: 38,
          fat: 10,
          prep: 'Batir las claras, saltear champiñones con gotas de aceite y cocinar a fuego medio. Servir con tostadas horneadas y aguacate fresco.',
          benefit: 'Proteína pura de fácil digestión que mantiene tu energía estable durante toda la mañana sin elevar el colesterol.',
          ingredients: [
            { name: 'Claras de huevo', portion: '3 piezas', weightGrams: 99, category: 'AOA Muy Bajo Aporte', equivalents: 1.5 },
            { name: 'Champiñones rebanados', portion: '1 taza', weightGrams: 90, category: 'Verduras', equivalents: 1 },
            { name: 'Tostadas horneadas de maíz', portion: '2 piezas', weightGrams: 30, category: 'Cereales sin Grasa', equivalents: 2 },
            { name: 'Aguacate hass', portion: '1/3 pieza', weightGrams: 35, category: 'Aceites y Grasas', equivalents: 1 },
          ],
        },
        {
          name: 'Tazón de Avena Caliente con Canela, Manzana y Chía',
          calories: 380,
          protein: 16,
          carbs: 58,
          fat: 8,
          prep: 'Cocer la avena en agua o leche descremada con raja de canela. Retirar del fuego y mezclar con la manzana picada y semillas de chía.',
          benefit: 'Fibra soluble que ayuda a bajar el colesterol, mejora tu tránsito intestinal y da una saciedad prolongada.',
          ingredients: [
            { name: 'Avena en hojuelas', portion: '1/2 taza cruda', weightGrams: 40, category: 'Cereales sin Grasa', equivalents: 2 },
            { name: 'Leche descremada', portion: '1 taza', weightGrams: 240, category: 'Leche Descremada', equivalents: 1 },
            { name: 'Manzana picada con cáscara', portion: '1 pieza', weightGrams: 106, category: 'Frutas', equivalents: 1 },
            { name: 'Semillas de chía', portion: '1 cucharada', weightGrams: 10, category: 'Grasas con Proteína', equivalents: 1 },
          ],
        },
        {
          name: 'Huevos Revueltos a la Mexicana con Frijoles de la Olla',
          calories: 390,
          protein: 22,
          carbs: 42,
          fat: 14,
          prep: 'Guisar jitomate, cebolla y chile picado sin grasa. Incorporar el huevo y acompañar con frijoles enteros caldosos.',
          benefit: 'Combinación tradicional con proteína completa, hierro y fibra que no genera picos bruscos de azúcar.',
          ingredients: [
            { name: 'Huevo entero fresco', portion: '2 piezas', weightGrams: 100, category: 'AOA Moderado Aporte', equivalents: 2 },
            { name: 'Jitomate y cebolla picada', portion: '1 taza', weightGrams: 120, category: 'Verduras', equivalents: 1 },
            { name: 'Frijoles negros de la olla', portion: '1/2 taza', weightGrams: 86, category: 'Leguminosas', equivalents: 1 },
            { name: 'Tortilla de maíz', portion: '1 pieza', weightGrams: 28, category: 'Cereales sin Grasa', equivalents: 1 },
          ],
        },
      ],
      colacion_1: [
        {
          name: 'Yogur Griego con Fresas Frescas y Nueces Troceadas',
          calories: 190,
          protein: 15,
          carbs: 18,
          fat: 6,
          prep: 'Servir el yogur en un vaso, añadir fresas en cubos y espolvorear nuez picada.',
          benefit: 'Probióticos naturales para cuidar tu flora intestinal y calcio para tus huesos.',
          ingredients: [
            { name: 'Yogur griego sin azúcar', portion: '3/4 taza', weightGrams: 150, category: 'Leche Descremada', equivalents: 1 },
            { name: 'Fresas rebanadas', portion: '1 taza', weightGrams: 130, category: 'Frutas', equivalents: 1 },
            { name: 'Nuez pecana en trozos', portion: '4 mitades', weightGrams: 10, category: 'Grasas con Proteína', equivalents: 1 },
          ],
        },
        {
          name: 'Bastones de Pepino y Jícama con Limón y Semillas de Girasol',
          calories: 130,
          protein: 4,
          carbs: 18,
          fat: 5,
          prep: 'Pelar y cortar las verduras en bastones, exprimir limón fresco y mezclar con las semillas.',
          benefit: 'Bajísimo en calorías, rico en agua y muy crujiente para quitar el antojo entre comidas.',
          ingredients: [
            { name: 'Pepino y jícama rebanada', portion: '2 tazas', weightGrams: 200, category: 'Verduras', equivalents: 2 },
            { name: 'Semillas de girasol tostadas', portion: '1 cucharada', weightGrams: 12, category: 'Grasas con Proteína', equivalents: 1 },
            { name: 'Jugo de limón fresco', portion: '1 pieza', weightGrams: 20, category: 'Libres de Energía', equivalents: 1 },
          ],
        },
      ],
      comida: [
        {
          name: 'Pechuga a las Finas Hierbas con Quinoa y Brócoli al Vapor',
          calories: 520,
          protein: 45,
          carbs: 52,
          fat: 14,
          prep: 'Sazonar la pechuga con ajo y orégano seco; asar a fuego medio. Servir junto a quinoa cocida y ramilletes de brócoli al dente.',
          benefit: 'Proteína magra para recuperar y fortalecer masa muscular con carbohidratos de absorción lenta.',
          ingredients: [
            { name: 'Pechuga de pollo sin piel', portion: '120g asada', weightGrams: 120, category: 'AOA Muy Bajo Aporte', equivalents: 4 },
            { name: 'Quinoa cocida', portion: '3/4 taza', weightGrams: 135, category: 'Cereales sin Grasa', equivalents: 2 },
            { name: 'Brócoli al vapor', portion: '1.5 tazas', weightGrams: 150, category: 'Verduras', equivalents: 1.5 },
            { name: 'Aceite de oliva virgen extra', portion: '1 cucharadita', weightGrams: 5, category: 'Aceites y Grasas', equivalents: 1 },
          ],
        },
        {
          name: 'Filete de Pescado Blanco Empapelado con Calabacita y Arroz',
          calories: 490,
          protein: 42,
          carbs: 50,
          fat: 12,
          prep: 'Colocar el pescado sobre papel aluminio con rodajas de jitomate, cebolla y calabacita. Hornear 15 min y acompañar con arroz.',
          benefit: 'Cocción sin grasas saturadas, muy fácil de digerir y rico en fósforo y potasio natural.',
          ingredients: [
            { name: 'Filete de tilapia o merluza', portion: '140g crudo', weightGrams: 140, category: 'AOA Muy Bajo Aporte', equivalents: 4 },
            { name: 'Arroz al vapor', portion: '3/4 taza', weightGrams: 120, category: 'Cereales sin Grasa', equivalents: 2 },
            { name: 'Calabacita y jitomate en rodajas', portion: '1.5 tazas', weightGrams: 160, category: 'Verduras', equivalents: 1.5 },
            { name: 'Aceite de oliva virgen extra', portion: '1 cucharadita', weightGrams: 5, category: 'Aceites y Grasas', equivalents: 1 },
          ],
        },
        {
          name: 'Guisado de Res Magra en Salsa Verde con Nopales y Frijoles',
          calories: 530,
          protein: 44,
          carbs: 48,
          fat: 15,
          prep: 'Cocer la carne magra y mezclar con salsa verde casera y nopales tiernos previamente cocidos. Servir con frijoles caldosos.',
          benefit: 'Excelente aporte de hierro biodisponible y fibra viscosa de nopal que reduce la absorción de azúcar.',
          ingredients: [
            { name: 'Bistec de res magro (falda/bola)', portion: '110g cocido', weightGrams: 110, category: 'AOA Bajo Aporte', equivalents: 3.5 },
            { name: 'Nopales picados en salsa verde', portion: '1.5 tazas', weightGrams: 180, category: 'Verduras', equivalents: 1.5 },
            { name: 'Frijoles enteros cocidos', portion: '1/2 taza', weightGrams: 86, category: 'Leguminosas', equivalents: 1 },
            { name: 'Tortillas de maíz', portion: '2 piezas', weightGrams: 56, category: 'Cereales sin Grasa', equivalents: 2 },
          ],
        },
      ],
      colacion_2: [
        {
          name: 'Manzana Verde con Almendras Tostadas',
          calories: 160,
          protein: 4,
          carbs: 22,
          fat: 7,
          prep: 'Rebanar la manzana fresca y acompañar con el puñadito de almendras enteras.',
          benefit: 'Grasas cardiosaludables y antioxidantes que frenan la fatiga de la tarde.',
          ingredients: [
            { name: 'Manzana verde con cáscara', portion: '1 pieza mediana', weightGrams: 110, category: 'Frutas', equivalents: 1 },
            { name: 'Almendras naturales', portion: '10 piezas', weightGrams: 12, category: 'Grasas con Proteína', equivalents: 1 },
          ],
        },
        {
          name: 'Tostada Horneada con Requesón Fresco y Germinado',
          calories: 140,
          protein: 10,
          carbs: 16,
          fat: 3,
          prep: 'Untar el requesón sobre la tostada y coronar con germinado de alfalfa y una pizca de orégano.',
          benefit: 'Proteína láctea de suero de fácil asimilación con mínimo impacto glucémico.',
          ingredients: [
            { name: 'Requesón o queso cottage bajo en grasa', portion: '3 cucharadas (45g)', weightGrams: 45, category: 'AOA Bajo Aporte', equivalents: 1.5 },
            { name: 'Tostada de maíz horneada', portion: '1 pieza', weightGrams: 15, category: 'Cereales sin Grasa', equivalents: 1 },
            { name: 'Germinado de alfalfa o espinaca tierna', portion: '1/2 taza', weightGrams: 30, category: 'Verduras', equivalents: 0.5 },
          ],
        },
      ],
      cena: [
        {
          name: 'Crema Ligera de Calabacitas con Queso Panela y Semillas',
          calories: 340,
          protein: 20,
          carbs: 26,
          fat: 12,
          prep: 'Licuar calabacitas cocidas al vapor con pimienta y consomé vegetal. Servir tibia con cubos de queso panela y semillas.',
          benefit: 'Cena reconfortante y liviana que no interfiere con tu descanso nocturno.',
          ingredients: [
            { name: 'Calabacita cocida licuada', portion: '2 tazas', weightGrams: 220, category: 'Verduras', equivalents: 2 },
            { name: 'Queso panela fresco en dados', portion: '60g', weightGrams: 60, category: 'AOA Bajo Aporte', equivalents: 2 },
            { name: 'Tostada horneada en trocitos', portion: '1 pieza', weightGrams: 15, category: 'Cereales sin Grasa', equivalents: 1 },
            { name: 'Semillas de chía o calabaza', portion: '1 cucharadita', weightGrams: 5, category: 'Grasas con Proteína', equivalents: 0.5 },
          ],
        },
        {
          name: 'Ensalada de Atún al Agua con Aguacate, Pepino y Limón',
          calories: 360,
          protein: 32,
          carbs: 24,
          fat: 13,
          prep: 'Drenar el atún, mezclar con pepino, jitomate picado, aguacate y jugo de limón. Servir con tostadas horneadas.',
          benefit: 'Proteína de digestión limpia rica en Omega-3 para reparar tejidos mientras duermes.',
          ingredients: [
            { name: 'Atún en agua drenado', portion: '1 lata / 100g', weightGrams: 100, category: 'AOA Muy Bajo Aporte', equivalents: 3 },
            { name: 'Pepino y jitomate picado', portion: '1.5 tazas', weightGrams: 150, category: 'Verduras', equivalents: 1.5 },
            { name: 'Aguacate hass', portion: '1/3 pieza', weightGrams: 35, category: 'Aceites y Grasas', equivalents: 1 },
            { name: 'Tostadas horneadas de maíz', portion: '1 pieza', weightGrams: 15, category: 'Cereales sin Grasa', equivalents: 1 },
          ],
        },
      ],
    };

    const mealType = targetMeal.type || 'comida';
    const list = alternateLibraries[mealType] || alternateLibraries['comida'];
    // Filter out the current one if it has the same name
    const candidates = list.filter((alt) => alt.name.toLowerCase() !== targetMeal.name.toLowerCase());
    const picked = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : list[0];

    const updatedMeals = [...currentDay.meals];
    updatedMeals[mealIndex] = {
      id: `meal-swapped-${Date.now()}-${mealIndex}`,
      type: targetMeal.type,
      timeLabel: targetMeal.timeLabel,
      name: picked.name,
      calories: picked.calories,
      protein: picked.protein,
      carbs: picked.carbs,
      fat: picked.fat,
      preparation: picked.prep,
      clinicalBenefit: picked.benefit,
      ingredients: picked.ingredients.map((ing: any) => ({
        item: ing.item || ing.name || '',
        quantity: ing.quantity || ing.portion || '',
        weightGrams: ing.weightGrams,
        category: ing.category,
        equivalents: ing.equivalents,
      })),
    };

    // Recalculate day's totals
    const newDayCalories = updatedMeals.reduce((acc, m) => acc + m.calories, 0);
    const newDayProtein = updatedMeals.reduce((acc, m) => acc + m.protein, 0);
    const newDayCarbs = updatedMeals.reduce((acc, m) => acc + m.carbs, 0);
    const newDayFat = updatedMeals.reduce((acc, m) => acc + m.fat, 0);

    const updatedDays = [...currentPlan.days];
    updatedDays[activeDayIndex] = {
      ...currentDay,
      meals: updatedMeals,
      totalCalories: newDayCalories,
      totalProtein: newDayProtein,
      totalCarbs: newDayCarbs,
      totalFat: newDayFat,
    };

    // Recalculate the entire grocery list
    const groceryMap = new Map<string, Set<string>>();
    updatedDays.forEach((d) => {
      d.meals.forEach((m) => {
        m.ingredients.forEach((ing) => {
          const cat = ing.category || 'Varios';
          if (!groceryMap.has(cat)) groceryMap.set(cat, new Set());
          const itemName = ing.item || (ing as any).name;
          if (itemName) groceryMap.get(cat)!.add(itemName);
        });
      });
    });

    const updatedGroceryList = Array.from(groceryMap.entries()).map(([category, itemsSet]) => ({
      category,
      items: Array.from(itemsSet),
    }));

    setCurrentPlan({
      ...currentPlan,
      days: updatedDays,
      groceryList: updatedGroceryList,
    });
  };

  const handleAddMealToPlan = (
    dayIndex: number,
    mealType: 'desayuno' | 'colacion_1' | 'comida' | 'colacion_2' | 'cena',
    newMeal: MealItem
  ) => {
    if (!currentPlan) return;
    const updatedDays = [...currentPlan.days];
    const targetDay = updatedDays[dayIndex] || updatedDays[0];

    const mealIdx = targetDay.meals.findIndex((m) => m.type === mealType);
    let updatedMeals = [...targetDay.meals];
    if (mealIdx >= 0) {
      updatedMeals[mealIdx] = newMeal;
    } else {
      updatedMeals.push(newMeal);
    }

    const dayCalories = updatedMeals.reduce((acc, m) => acc + m.calories, 0);
    const dayProtein = updatedMeals.reduce((acc, m) => acc + m.protein, 0);
    const dayCarbs = updatedMeals.reduce((acc, m) => acc + m.carbs, 0);
    const dayFat = updatedMeals.reduce((acc, m) => acc + m.fat, 0);

    updatedDays[dayIndex] = {
      ...targetDay,
      meals: updatedMeals,
      totalCalories: dayCalories,
      totalProtein: dayProtein,
      totalCarbs: dayCarbs,
      totalFat: dayFat,
    };

    const updatedPlan: MenuPlan = {
      ...currentPlan,
      days: updatedDays,
    };

    setCurrentPlan(updatedPlan);
    onUpdatePatient({
      ...patient,
      activeMenuPlan: updatedPlan,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveSupplements = (
    updatedSupplements: SupplementItem[],
    shouldAutoSquareMenu: boolean
  ) => {
    let updatedPlan: MenuPlan = {
      ...currentPlan,
      supplements: updatedSupplements,
    };

    if (shouldAutoSquareMenu) {
      const { balancedDays } = autoSquareMenuWithSupplements(
        currentPlan.days,
        updatedSupplements,
        patient.activePrescription.targetCalories,
        patient.activePrescription.proteinGrams,
        patient.activePrescription.carbGrams,
        patient.activePrescription.fatGrams
      );

      // Also ensure supplements appear in grocery list under special aisle
      const suppGroceryItems = updatedSupplements.map(
        (s) => `${s.name} (${s.dosage})`
      );
      const existingGroceries = currentPlan.groceryList.filter(
        (g) => g.category !== 'Suplementación & Nutrición Deportiva'
      );
      const updatedGroceries =
        suppGroceryItems.length > 0
          ? [
              {
                category: 'Suplementación & Nutrición Deportiva',
                items: suppGroceryItems,
              },
              ...existingGroceries,
            ]
          : existingGroceries;

      updatedPlan = {
        ...updatedPlan,
        days: balancedDays,
        groceryList: updatedGroceries,
      };
    } else {
      const suppTotals = calculateSupplementsTotals(updatedSupplements);
      const updatedDays = currentPlan.days.map((d) => {
        const foodCal = d.meals.reduce((sum, m) => sum + m.calories, 0);
        const foodP = d.meals.reduce((sum, m) => sum + m.protein, 0);
        const foodC = d.meals.reduce((sum, m) => sum + m.carbs, 0);
        const foodF = d.meals.reduce((sum, m) => sum + m.fat, 0);
        return {
          ...d,
          totalCalories: foodCal + suppTotals.calories,
          totalProtein: foodP + suppTotals.protein,
          totalCarbs: foodC + suppTotals.carbs,
          totalFat: foodF + suppTotals.fat,
        };
      });
      updatedPlan = {
        ...updatedPlan,
        days: updatedDays,
      };
    }

    setCurrentPlan(updatedPlan);
    onUpdatePatient({
      ...patient,
      activeMenuPlan: updatedPlan,
      updatedAt: new Date().toISOString(),
    });
    setIsSupplementsModalOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const activeDay = currentPlan?.days[activeDayIndex] || currentPlan?.days[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Settings Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Generador Automático de Menús Clínicos
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
                Sin Batallar
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Paciente: <span className="font-bold text-slate-800">{patient.fullName}</span> ·{' '}
              Prescripción: <span className="font-bold text-teal-800">{patient.activePrescription.targetCalories} kcal</span> (
              {patient.activePrescription.proteinGrams}g Prot · {patient.activePrescription.carbGrams}g Carbs ·{' '}
              {patient.activePrescription.fatGrams}g Grasas)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Duración */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              {[
                { label: '1 Día', count: 1 },
                { label: '7 Días (1 Sem)', count: 7 },
                { label: '14 Días (2 Sem)', count: 14 },
                { label: '28 Días (Mes)', count: 28 },
              ].map((d) => (
                <button
                  key={d.count}
                  type="button"
                  onClick={() => setDaysCount(d.count)}
                  className={`px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                    daysCount === d.count
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Suplementación Deportiva */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-3xs hover:border-teal-300 transition">
              <Dumbbell className="w-4 h-4 text-teal-600" />
              <button
                type="button"
                onClick={() => setIsSupplementsModalOpen(true)}
                className="font-bold text-teal-800 hover:text-teal-950 cursor-pointer flex items-center gap-1.5"
              >
                <span>
                  {currentPlan.supplements && currentPlan.supplements.length > 0
                    ? `${currentPlan.supplements.length} Suplemento(s) Cuadrado(s)`
                    : 'Gestionar Suplementos'}
                </span>
                {currentPlan.supplements && currentPlan.supplements.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </button>
            </div>

            {/* Historial Anti-Repetición 30 Días */}
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-3xs hover:border-teal-300 transition cursor-pointer"
              title="Ver el registro de platillos consumidos por el paciente en los últimos 30 días"
            >
              <History className="w-4 h-4 text-teal-600" />
              <span>Memoria 30 Días ({(patient.mealHistory30Days || []).length})</span>
            </button>

            {/* Número de Comidas */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              {[3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMealsPerDay(n as 3 | 4 | 5)}
                  className={`px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                    mealsPerDay === n ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {n} Comidas
                </button>
              ))}
            </div>

            {/* Estilo Dietético Reconocido */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <span className="text-slate-600 pl-1 hidden xl:inline">Estilo:</span>
              <select
                value={dietaryStyle}
                onChange={(e) => setDietaryStyle(e.target.value)}
                className="bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800 px-2.5 py-1.5 focus:outline-hidden cursor-pointer max-w-[200px]"
              >
                {AVAILABLE_DIETARY_STYLES.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Generar Menú Button */}
            <button
              onClick={handleGenerateMenu}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isGenerating
                  ? 'Analizando Variedad & Generando...'
                  : 'Generar Menú Clínico con IA'}
              </span>
            </button>
          </div>
        </div>

        {/* Selected Dietary Style Info Card */}
        {(() => {
          const currentStyleDef = AVAILABLE_DIETARY_STYLES.find((s) => s.id === dietaryStyle);
          if (!currentStyleDef) return null;
          return (
            <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${currentStyleDef.badgeColor} ${currentStyleDef.badgeTextColor}`}>
                  {currentStyleDef.name}
                </span>
                <span className="text-slate-600 hidden sm:inline">
                  {currentStyleDef.subtitle}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-400">Ingredientes Clave:</span>
                {currentStyleDef.characteristicIngredients.slice(0, 4).map((ing, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 30-Day Anti-Repetition & Variety Audit Banner */}
        <div className="mt-3 p-3.5 bg-gradient-to-r from-teal-50/70 via-emerald-50/50 to-white rounded-xl border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-teal-950">
                  Auditoría Anti-Repetición (Ventana de 30 Días)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {currentPlan.varietyAudit
                    ? `${currentPlan.varietyAudit.noveltyScorePercent}% Variedad Única`
                    : '100% Variedad Garantizada'}
                </span>
                {generationSource && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    · Fuente: <b className="text-slate-700">{generationSource}</b>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-teal-800 mt-0.5 leading-snug">
                {currentPlan.varietyAudit?.analysisSummary ||
                  `Cada platillo se analiza contra los últimos 30 días para asegurar que ${patient.fullName} disfrute de alimentos siempre variados y no se aburra jamás.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-teal-200 hover:border-teal-300 text-teal-900 font-semibold text-xs shadow-3xs transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-teal-600" />
              <span>Ver Rotación ({extractPatientDishHistory(patient, 30).length} Platillos)</span>
            </button>
          </div>
        </div>

        {/* Pathology Guidance Badge */}
        {patient.pathologies.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Adaptaciones activas:
            </span>
            {patient.pathologies.map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[11px] font-semibold border border-teal-100"
              >
                {PATHOLOGY_INFO[p]?.name.split(' (')[0]}
              </span>
            ))}
            {patient.allergies.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-100">
                Alergia: {patient.allergies.join(', ')}
              </span>
            )}
            {patient.foodDislikes.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-100">
                Evitar: {patient.foodDislikes.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main View Segmented Control */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveViewMode('menu')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
              activeViewMode === 'menu'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Plan de Alimentación Diario</span>
          </button>

          <button
            onClick={() => setActiveViewMode('groceries')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
              activeViewMode === 'groceries'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Lista de Compras Inteligente ({currentPlan.groceryList.reduce((acc, c) => acc + c.items.length, 0)})</span>
          </button>

          <button
            onClick={() => setActiveViewMode('equivalents')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
              activeViewMode === 'equivalents'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4 text-teal-400" />
            <span>Buscador & Equivalentes (SMAE)</span>
          </button>

          <button
            onClick={() => setActiveViewMode('clinical')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer ${
              activeViewMode === 'clinical'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Hidratación & Guías Clínicas</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveMenuOption}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition cursor-pointer shadow-xs"
            title="Guardar esta opción de menú en el historial del paciente"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedPlanSuccessMsg ? '¡Opción Guardada!' : 'Guardar Nueva Opción'}</span>
          </button>

          {(patient.savedMenuPlans || []).length > 0 && (
            <button
              onClick={() => setIsSavedPlansModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition cursor-pointer"
            >
              <span>⭐ Opciones Guardadas ({(patient.savedMenuPlans || []).length})</span>
            </button>
          )}

          <button
            onClick={handleSaveToPatient}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? '¡Activo Guardado!' : 'Fijar Activo'}</span>
          </button>

          <button
            onClick={() => onNavigateToTab('print')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DAILY MENU CARDS */}
      {activeViewMode === 'menu' && (
        <div className="space-y-6">
          {/* Day Tabs */}
          {currentPlan.days.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
              {currentPlan.days.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap flex flex-col items-center min-w-[90px] ${
                    activeDayIndex === idx
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{day.dayName}</span>
                  <span className={`text-[10px] font-normal mt-0.5 ${activeDayIndex === idx ? 'text-teal-100' : 'text-slate-400'}`}>
                    {day.totalCalories} kcal
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Daily Nutrient Breakdown Header */}
          {activeDay && (
            <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900">{activeDay.dayName}</span>
                <span className="text-xs text-slate-500 font-medium">
                  ({activeDay.meals.length} tiempos de comida)
                </span>
              {duplicateDayIndices.includes(activeDayIndex) && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">¡Duplicado!</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {duplicateDayIndices.includes(activeDayIndex) && (
                <button
                  onClick={() => handleRegenerateDay(activeDayIndex)}
                  className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-100 rounded-lg hover:bg-amber-200 transition cursor-pointer"
                >
                  Cambiar día
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 uppercase text-[10px]">Energía:</span>
                  <span className="text-slate-900 font-extrabold">{activeDay.totalCalories} kcal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-500 uppercase text-[10px]">Proteínas:</span>
                  <span className="text-slate-900 font-extrabold">{activeDay.totalProtein}g</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-500 uppercase text-[10px]">Carbos:</span>
                  <span className="text-slate-900 font-extrabold">{activeDay.totalCarbs}g</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 uppercase text-[10px]">Grasas:</span>
                  <span className="text-slate-900 font-extrabold">{activeDay.totalFat}g</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveViewMode('equivalents')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition cursor-pointer"
                  title="Calcular porciones de alimentos y equivalentes nutricionales SMAE"
                >
                  <Calculator className="w-3.5 h-3.5 text-teal-600" />
                  <span>Calcular Alimentos SMAE</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Sports & Clinical Supplements for this day */}
          {activeDay && currentPlan.supplements && currentPlan.supplements.length > 0 && (
            <div className="bg-gradient-to-r from-teal-50/90 via-emerald-50/70 to-indigo-50/80 rounded-2xl border border-teal-200/90 p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-teal-200/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-2">
                      <span>Suplementación Nutricional & Deportiva Integrada</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-200/80 text-teal-900 font-black">
                        {currentPlan.supplements.length} seleccionados
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-700">
                      Aporte sincronizado y cuadrado automáticamente en la prescripción del plan.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSupplementsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition cursor-pointer shadow-xs shrink-0"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Gestionar / Re-cuadrar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {currentPlan.supplements.map((supp, sIdx) => {
                  const servings = supp.servings || 1;
                  const cal = Math.round((supp.calories || 0) * servings);
                  const p = Number(((supp.protein || 0) * servings).toFixed(1));
                  const c = Number(((supp.carbs || 0) * servings).toFixed(1));
                  const g = Number(((supp.fat || 0) * servings).toFixed(1));

                  return (
                    <div
                      key={supp.id || sIdx}
                      className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-3xs space-y-1.5 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-extrabold text-xs text-slate-900 leading-tight">
                            {supp.name}
                          </span>
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded shrink-0 border border-teal-100">
                            {supp.dosage}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          <span className="font-bold text-slate-700">Momento:</span>{' '}
                          <span className="text-teal-800 font-semibold">
                            {supp.timing === 'post_entreno'
                              ? 'Post-Entrenamiento'
                              : supp.timing === 'pre_entreno'
                              ? 'Pre-Entrenamiento'
                              : supp.timing === 'con_alimentos'
                              ? 'Con Alimentos'
                              : supp.timing === 'en_ayunas'
                              ? 'En Ayunas'
                              : supp.timing === 'antes_dormir'
                              ? 'Antes de Dormir'
                              : supp.timing}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-600">
                        <span>{cal > 0 ? `${cal} kcal` : '0 kcal (Soporte)'}</span>
                        <div className="flex items-center gap-1.5">
                          {p > 0 && <span className="text-blue-600">{p}g P</span>}
                          {c > 0 && <span className="text-amber-600">{c}g C</span>}
                          {g > 0 && <span className="text-emerald-600">{g}g G</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meals List */}
          {activeDay && (
            <div className="space-y-4">
              {activeDay.meals.map((meal, mIdx) => (
                <div
                  key={meal.id || mIdx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 transition hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                        {mIdx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                          {meal.timeLabel || meal.type}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 leading-tight">
                          {meal.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="font-extrabold text-slate-800">{meal.calories} kcal</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-blue-600 font-semibold">{meal.protein}g P</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-amber-600 font-semibold">{meal.carbs}g C</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-emerald-600 font-semibold">{meal.fat}g G</span>
                      </div>

                      <button
                        onClick={() => handleSwapMeal(mIdx)}
                        title="Cambiar platillo por otra alternativa clínica"
                        className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Ingredients & Prep */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                    <div>
                      <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">
                        Ingredientes & Raciones Exactas (SMAE)
                      </div>
                      <ul className="space-y-1.5">
                        {meal.ingredients.map((ing, ingIdx) => (
                          <li key={ingIdx} className="flex items-center justify-between text-slate-700 bg-slate-50/60 px-2.5 py-1 rounded">
                            <span className="font-medium">{ing.item}</span>
                            <span className="font-bold text-slate-900">{ing.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">
                          Preparación Rápida
                        </div>
                        <p className="text-slate-600 leading-relaxed bg-slate-50/40 p-2.5 rounded-lg border border-slate-100">
                          {meal.preparation}
                        </p>
                      </div>

                      {meal.clinicalBenefit && (
                        <div className="mt-3 p-2.5 rounded-lg bg-teal-50/60 border border-teal-100 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                          <div className="text-[11px] text-teal-900 leading-tight">
                            <span className="font-bold">Beneficio Clínico: </span>
                            {meal.clinicalBenefit}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SMART GROCERY LIST */}
      {activeViewMode === 'groceries' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-teal-600" />
                <span>Lista de Compras Consolidada por Pasillo</span>
              </h3>
              <p className="text-xs text-slate-500">
                Organizada automáticamente para facilitar las compras en el supermercado o mercado local
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('print', 'groceries')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Lista de Súper</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPlan.groceryList.map((catGroup, idx) => (
              <div key={idx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-3 border-b border-slate-200 pb-1.5">
                  {catGroup.category} ({catGroup.items.length})
                </h4>
                <ul className="space-y-2 text-xs">
                  {catGroup.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-center gap-2 text-slate-700">
                      <input
                        type="checkbox"
                        id={`g-${idx}-${itemIdx}`}
                        className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <label htmlFor={`g-${idx}-${itemIdx}`} className="cursor-pointer select-none">
                        {item}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CLINICAL RECOMMENDATIONS, HYDRATION & EXERCISE */}
      {activeViewMode === 'clinical' && (
        <div className="space-y-6">
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pautas de Hidratación & Prescripción de Ejercicio Clínico
              </h3>
              <p className="text-xs text-slate-500">
                Guías adaptadas a los {patient.age} años de edad y las condiciones clínicas evaluadas del paciente
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('print', 'hydration_guides')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Hidratación & Actividad</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hydration Planner */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span>Prescripción de Hidratación</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cálculo hídrico basado en la masa corporal y requerimiento energético
              </p>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-900">Agua Natural Recomendada</div>
                  <div className="text-2xl font-black text-blue-800 mt-1">
                    {currentPlan.hydrationLiters || 2.2} Litros / día
                  </div>
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    Equivalente a aproximadamente {Math.round((currentPlan.hydrationLiters || 2.2) / 0.25)} vasos de 250ml
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Consumir 1 vaso en ayunas para estimular la motilidad gastrointestinal.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Distribuir a lo largo del día y evitar beber cantidades excesivas durante las comidas principales.</span>
                </div>
                {patient.pathologies.includes('hyperuricemia_gout') && (
                  <div className="flex items-start gap-2 font-semibold text-teal-800">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>Gota activa: Ingesta hídrica aumentada favorece la excreción renal de ácido úrico.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Directives */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-teal-600" />
                <span>Observaciones y Pautas Terapéuticas</span>
              </h3>

              <div className="space-y-3">
                {currentPlan.clinicalObservations.map((obs, oIdx) => (
                  <div key={oIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {oIdx + 1}
                    </span>
                    <span>{obs}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs text-slate-500">
                * El paciente debe evitar sustituir ingredientes sin consultar previamente la lista de equivalentes.
              </div>
            </div>
          </div>

          {/* Physical Activity Prescription Card */}
          {(() => {
            const exercise = getPatientExercisePrescription(patient);
            return (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-teal-600" />
                      <span>Prescripción de Actividad Física y Ejercicio Adaptado</span>
                    </h3>
                    <p className="text-xs text-slate-500">{exercise.patientSummary}</p>
                  </div>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg">
                    Meta: {exercise.weeklyTargetMinutes} min / sem · {exercise.frequencyDays}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Aerobic */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-teal-900 flex items-center justify-between">
                      <span className="uppercase text-[10px]">A) Aeróbico (Cardio)</span>
                      <span className="text-[10px] text-teal-700">{exercise.aerobic.durationPerSession}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Intensidad:</strong> {exercise.aerobic.intensity}
                    </div>
                    <ul className="space-y-1">
                      {exercise.aerobic.recommended.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-slate-800">
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
                      <span className="uppercase text-[10px]">B) Fuerza & Músculo</span>
                      <span className="text-[10px] text-teal-700">{exercise.strength.frequency}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Intensidad:</strong> {exercise.strength.intensity}
                    </div>
                    <ul className="space-y-1">
                      {exercise.strength.recommended.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-slate-800">
                          <span className="text-teal-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-slate-500 italic mt-1 border-t border-slate-200 pt-1">
                      {exercise.strength.tips}
                    </p>
                  </div>

                  {/* Mobility & Precautions */}
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                    <div className="font-bold text-amber-900 uppercase text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Precauciones Clínicas</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-700">
                      {exercise.clinicalPrecautions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW 4: FOOD EQUIVALENTS SMAE CALCULATOR & BUILDER */}
      {activeViewMode === 'equivalents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <span className="text-sm font-bold text-slate-900">
                Tabla Completa de Equivalentes (SMAE)
              </span>
              <p className="text-xs text-slate-500">
                Imprime o exporta la tabla de porciones oficiales para entrega al paciente
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('print', 'equivalents')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Tabla SMAE</span>
            </button>
          </div>

          <FoodEquivalentsTool
            currentPlan={currentPlan}
            activeDayIndex={activeDayIndex}
            onAddMealToPlan={handleAddMealToPlan}
            targetDailyCalories={patient.activePrescription.targetCalories}
          />
        </div>
      )}
      <SavedPlansModal
        isOpen={isSavedPlansModalOpen}
        onClose={() => setIsSavedPlansModalOpen(false)}
        savedPlans={patient.savedMenuPlans || []}
        onSelect={handleSelectSavedPlan}
        onDelete={handleDeleteSavedPlan}
      />

      <SupplementsManagerModal
        isOpen={isSupplementsModalOpen}
        onClose={() => setIsSupplementsModalOpen(false)}
        activeSupplements={currentPlan.supplements || []}
        targetCalories={patient.activePrescription.targetCalories}
        targetProtein={patient.activePrescription.proteinGrams}
        targetCarbs={patient.activePrescription.carbGrams}
        targetFat={patient.activePrescription.fatGrams}
        currentFoodTotals={{
          calories: activeDay?.meals?.reduce((acc, m) => acc + m.calories, 0) || 0,
          protein: activeDay?.meals?.reduce((acc, m) => acc + m.protein, 0) || 0,
          carbs: activeDay?.meals?.reduce((acc, m) => acc + m.carbs, 0) || 0,
          fat: activeDay?.meals?.reduce((acc, m) => acc + m.fat, 0) || 0,
        }}
        onSaveSupplements={handleSaveSupplements}
      />

      <PatientDishHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        patient={patient}
        onClearHistory={() => {
          const updated = {
            ...patient,
            mealHistory30Days: [],
            updatedAt: new Date().toISOString(),
          };
          onUpdatePatient(updated);
        }}
      />
    </div>
  );
};
