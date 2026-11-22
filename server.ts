import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { generateLocalClinicalMenu } from './src/utils/nutritionCalculations';
import {
  AVAILABLE_DIETARY_STYLES,
  auditMenuPlanVariety,
} from './src/utils/menuVarietyEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Gemini menu generator endpoint
app.post('/api/generate-menu', async (req, res) => {
  try {
    const {
      patientName = 'Paciente',
      age = 35,
      gender = 'male',
      weightKg = 70,
      heightCm = 170,
      pathologies = [],
      targetGoal = 'maintenance',
      targetCalories = 2000,
      targetProtein = 100,
      targetCarbs = 250,
      targetFat = 65,
      mealsPerDay = 5,
      daysCount = 7,
      allergies = [],
      dislikes = [],
      preferences = [],
      dietaryStyle = 'estandar',
      excludedMeals = [],
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Buscar definición del estilo dietético
    const styleDef =
      AVAILABLE_DIETARY_STYLES.find((s) => s.id === dietaryStyle) ||
      AVAILABLE_DIETARY_STYLES[AVAILABLE_DIETARY_STYLES.length - 1];

    // Si no hay API key disponible en el entorno, usamos el motor clínico algorítmico masivo
    if (!apiKey) {
      console.log('No GEMINI_API_KEY found, using expert local clinical generator with anti-repetition.');
      const localPlan = generateLocalClinicalMenu(
        patientName,
        pathologies,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        mealsPerDay,
        daysCount,
        allergies,
        dislikes,
        dietaryStyle,
        excludedMeals
      );
      return res.json({
        success: true,
        source: 'clinical_engine_fallback',
        plan: localPlan,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const daysList =
      daysCount === 1
        ? ['Día 1 (Modelo)']
        : Array.from({ length: daysCount }, (_, i) => {
            const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            const weekNumber = Math.floor(i / 7) + 1;
            return daysCount > 7
              ? `${dayNames[i % 7]} (Semana ${weekNumber})`
              : dayNames[i % 7];
          });

    const excludedDishesSample = Array.isArray(excludedMeals) && excludedMeals.length > 0
      ? excludedMeals.slice(0, 40).join('; ')
      : 'Ninguno registrado aún';

    const prompt = `Actúa como un Nutriólogo Clínico y Chef Nutricional Especialista de clase mundial.
Diseña un plan de menús clínicos rigurosamente adaptado y balanceado al 100% con las siguientes especificaciones:

DATOS DEL PACIENTE:
- Nombre: ${patientName}
- Edad: ${age} años | Sexo: ${gender === 'male' ? 'Masculino' : 'Femenino'} | Peso: ${weightKg} kg | Talla: ${heightCm} cm
- Patologías diagnosticadas: ${pathologies.join(', ') || 'Ninguna (Acondicionamiento general y salud preventiva)'}
- Objetivo terapéutico: ${targetGoal}
- ESTILO DIETÉTICO SELECCIONADO: ${styleDef.name}
  * Descripción: ${styleDef.subtitle}
  * Ingredientes característicos: ${styleDef.characteristicIngredients.join(', ')}
  * Enfoque: ${styleDef.clinicalIndication}
- Alergias / Intolerancias: ${allergies.join(', ') || 'Ninguna'}
- Alimentos que le desagradan / no consume: ${dislikes.join(', ') || 'Ninguno'}
- Preferencias del paciente: ${preferences.join(', ') || 'Variada y apetitosa'}

PRESCRIPCIÓN DIETOSINTÉTICA DIARIA EXACTA (Cada día debe sumar esto):
- Calorías meta por día: ${targetCalories} kcal
- Proteínas meta por día: ${targetProtein} gramos
- Carbohidratos meta por día: ${targetCarbs} gramos
- Grasas meta por día: ${targetFat} gramos
- Distribución de comidas: ${mealsPerDay} tiempos al día (${
      mealsPerDay === 3
        ? 'Desayuno (30%), Comida (45%), Cena (25%)'
        : mealsPerDay === 4
        ? 'Desayuno (25%), Comida (40%), Colación (15%), Cena (20%)'
        : 'Desayuno (25%), Colación 1 (10%), Comida (35%), Colación 2 (10%), Cena (20%)'
    })
- Duración del menú: ${daysCount} día(s) (${daysList.join(', ')})

REGLAS DE ORO DE VARIEDAD Y ANTI-REPETICIÓN (VENTANA DE AL MENOS 1 MES / 30 DÍAS):
1. NINGÚN PLATILLO DEBE REPETIRSE entre los días generados. Los desayunos, comidas, colaciones y cenas deben ser 100% distintos cada día para que el paciente jamás se aburra.
2. HISTORIAL DE PLATILLOS CONSUMIDOS RECIENTEMENTE (ÚLTIMOS 30 DÍAS) QUE ESTÁ ESTRICTAMENTE PROHIBIDO REPETIR:
   [ ${excludedDishesSample} ]
   Por favor inventa opciones nuevas, apetitosas y creativas que no coincidan con esta lista.
3. UTILIZA UNA BASE CREATIVA INFINITA: Explora la vasta gastronomía del estilo "${styleDef.name}". Si es cocina mexicana, aprovecha guisados caseros, tingas magras, salpicones, caldos desgrasados, nopales, frijoles y calabacitas. Si es mediterránea, pescados frescos, romero, aceite de oliva virgen extra, legumbres y hortalizas al horno.
4. Si el paciente tiene Diabetes: Emplea alimentos de bajo índice glucémico y fibra soluble alta.
5. Si tiene Hipertensión (DASH): Cero embutidos, bajo sodio (<1500mg) y abundante potasio y magnesio.
6. Si tiene ERC (Enfermedad Renal Crónica No Diálisis): Mantener estricto control proteico moderado y evitar exceso de fósforo inorgánico.
7. Cada platillo debe detallar ingredientes con porciones cuantitativas exactas (gramos, tazas, piezas) y un beneficio clínico motivador redactado en un lenguaje cálido y claro.
8. Semilla aleatoria de innovación y frescura: ${Date.now()}_${Math.random()}

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura sin bloques markdown externos:
{
  "title": "Plan Nutricional ${styleDef.name} (${daysCount} días)",
  "targetCalories": ${targetCalories},
  "targetProtein": ${targetProtein},
  "targetCarbs": ${targetCarbs},
  "targetFat": ${targetFat},
  "hydrationLiters": 2.2,
  "clinicalObservations": [
    "Recomendación adaptada al estilo y patología",
    "Pauta sobre horarios de comida y saciedad",
    "Consejo de preparación culinaria saludable"
  ],
  "groceryList": [
    {
      "category": "Verduras",
      "items": ["Espinacas frescas (500g)", "Nopales (4 piezas)", "Jitomate bola (1 kg)"]
    },
    {
      "category": "Proteínas y Carnes",
      "items": ["Pechuga de pollo limpia (800g)", "Huevos camperos (1 docena)"]
    },
    {
      "category": "Cereales y Legumbres",
      "items": ["Avena en hojuelas (500g)", "Frijoles de la olla (1 taza)"]
    },
    {
      "category": "Grasas Saludables",
      "items": ["Aceite de oliva virgen extra (1 botella)", "Aguacate Hass (3 piezas)"]
    }
  ],
  "days": [
    {
      "dayNumber": 1,
      "dayName": "${daysList[0]}",
      "totalCalories": ${targetCalories},
      "totalProtein": ${targetProtein},
      "totalCarbs": ${targetCarbs},
      "totalFat": ${targetFat},
      "meals": [
        {
          "type": "desayuno",
          "timeLabel": "08:00 AM - Desayuno",
          "name": "Nombre descriptivo y apetitoso del platillo",
          "calories": 450,
          "protein": 25,
          "carbs": 50,
          "fat": 15,
          "ingredients": [
            { "item": "Ingrediente con porción", "quantity": "Ej: 2 piezas / 100g", "category": "Proteínas y Carnes" }
          ],
          "preparation": "Paso a paso de cocción rápida y sencilla.",
          "clinicalBenefit": "Beneficio claro y motivador para el paciente"
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 6000,
      },
    });

    const responseText = response.text || '';
    let parsedPlan;

    try {
      parsedPlan = JSON.parse(responseText.trim());
    } catch (parseError) {
      console.warn('Failed to parse Gemini JSON, cleaning up response:', parseError);
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedPlan = JSON.parse(cleanJson);
    }

    // Aseguramos formato ID, metadatos y auditoría de variedad
    const finalPlan = {
      id: `plan-${Date.now()}`,
      patientId: req.body.patientId || 'patient-custom',
      createdAt: new Date().toISOString(),
      daysCount,
      dietaryStyle,
      dietaryStyleName: styleDef.name,
      ...parsedPlan,
    };

    // Auditoría de variedad y no repetición contra historial de 30 días
    finalPlan.varietyAudit = auditMenuPlanVariety(finalPlan, excludedMeals);

    return res.json({
      success: true,
      source: 'gemini_ai',
      plan: finalPlan,
    });
  } catch (err: any) {
    console.error('Error in /api/generate-menu:', err);
    const {
      patientName = 'Paciente',
      pathologies = [],
      targetCalories = 2000,
      targetProtein = 100,
      targetCarbs = 250,
      targetFat = 65,
      mealsPerDay = 5,
      daysCount = 7,
      allergies = [],
      dislikes = [],
      dietaryStyle = 'estandar',
      excludedMeals = [],
    } = req.body;

    const fallbackPlan = generateLocalClinicalMenu(
      patientName,
      pathologies,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      mealsPerDay,
      daysCount,
      allergies,
      dislikes,
      dietaryStyle,
      excludedMeals
    );

    return res.json({
      success: true,
      source: 'clinical_engine_fallback',
      plan: fallbackPlan,
      notice: 'Menú generado con el motor clínico inteligente de respaldo sin repetición.',
    });
  }
});

// Start express server
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NutriClinical Pro server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
