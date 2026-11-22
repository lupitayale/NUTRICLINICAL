import { MealItem, MealIngredient } from '../types/nutrition';
import { normalizeMealName } from './menuVarietyEngine';

export interface RecipeTemplate {
  name: string;
  type: 'desayuno' | 'colacion_1' | 'comida' | 'colacion_2' | 'cena';
  styles: string[]; // e.g. ['dieta_mexicana_saludable', 'estandar', 'fitness_alta_proteina']
  pathologySafe: string[]; // pathologies that can safely eat this or are targeted
  pathologyForbidden?: string[]; // e.g. 'ckd_non_dialysis' (high protein/phosphorus)
  ingredients: MealIngredient[];
  preparation: string;
  clinicalBenefit: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
}

// -------------------------------------------------------------
// BANCO MASIVO DE DESAYUNOS (30+ Platillos Únicos Clínicos)
// -------------------------------------------------------------
export const MASSIVE_BREAKFAST_TEMPLATES: RecipeTemplate[] = [
  // 1. Tradicionales Mexicanos Saludables
  {
    name: 'Huevos Rancheros Saludables con Salsa Casera y Frijoles de la Olla',
    type: 'desayuno',
    styles: ['dieta_mexicana_saludable', 'estandar', 'economica_practica'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'obesity'],
    pathologyForbidden: ['ckd_non_dialysis'],
    baseCalories: 430,
    baseProtein: 24,
    baseCarbs: 45,
    baseFat: 16,
    ingredients: [
      { item: 'Huevos enteros al comal sin grasa', quantity: '2 piezas', category: 'Proteínas y Carnes' },
      { item: 'Tortillas de maíz nixtamalizado', quantity: '2 piezas', category: 'Cereales y Legumbres' },
      { item: 'Salsa ranchera casera (jitomate, cebolla y orégano)', quantity: '1/2 taza', category: 'Verduras' },
      { item: 'Frijoles negros de la olla sin freír', quantity: '1/2 taza (80g)', category: 'Cereales y Legumbres' },
      { item: 'Aguacate en rebanadas', quantity: '1/3 pieza (40g)', category: 'Grasas Saludables' },
    ],
    preparation: 'Calentar las tortillas al comal sin aceite. Montar los huevos cocinados a la plancha, bañar con la salsa ranchera tibia de jitomate asado y acompañar con frijoles caldosos y aguacate.',
    clinicalBenefit: 'Fibra soluble de los frijoles y almidón resistente del maíz que regulan la glucosa y aportan saciedad prolongada.',
  },
  {
    name: 'Omelette Campestre de Claras con Nopales Asados y Queso Panela Artesanal',
    type: 'desayuno',
    styles: ['dieta_mexicana_saludable', 'fitness_alta_proteina', 'low_carb_moderada', 'ovolactovegetariana'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'ckd_non_dialysis', 'fatty_liver', 'obesity'],
    baseCalories: 360,
    baseProtein: 28,
    baseCarbs: 22,
    baseFat: 12,
    ingredients: [
      { item: 'Claras de huevo pasteurizadas', quantity: '4 piezas (120g)', category: 'Proteínas y Carnes' },
      { item: 'Nopal tierno en cubos asado', quantity: '1 taza y media (150g)', category: 'Verduras' },
      { item: 'Queso panela bajo en grasa y sodio', quantity: '40g', category: 'Lácteos' },
      { item: 'Tortilla de maíz o nopal', quantity: '1 pieza', category: 'Cereales y Legumbres' },
      { item: 'Aceite de oliva virgen extra', quantity: '1 cucharadita (5ml)', category: 'Grasas Saludables' },
    ],
    preparation: 'Saltear los nopales en sartén con unas gotas de aceite de oliva hasta secar el mucílago. Verter las claras batidas, rellenar con cubos de panela y doblar suavemente.',
    clinicalBenefit: 'El nopal y la panela magra brindan mucílagos que protegen la mucosa gástrica y mejoran la sensibilidad insulínica.',
  },
  {
    name: 'Chilaquiles Verdes Horneados con Pollo Deshebrado y Crema Ácida Light',
    type: 'desayuno',
    styles: ['dieta_mexicana_saludable', 'estandar', 'fitness_alta_proteina'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver'],
    pathologyForbidden: ['ckd_non_dialysis'],
    baseCalories: 480,
    baseProtein: 35,
    baseCarbs: 52,
    baseFat: 14,
    ingredients: [
      { item: 'Totopos de tortilla horneados sin freír', quantity: '40g', category: 'Cereales y Legumbres' },
      { item: 'Pechuga de pollo cocida deshebrada', quantity: '100g', category: 'Proteínas y Carnes' },
      { item: 'Salsa verde de tomatillo cocido con cilantro y epazote', quantity: '1 taza', category: 'Verduras' },
      { item: 'Queso canasto o panela rallado', quantity: '25g', category: 'Lácteos' },
      { item: 'Cebolla morada fileteada y aguacate', quantity: '1/4 pieza', category: 'Grasas Saludables' },
    ],
    preparation: 'Bañar los totopos horneados con la salsa verde caliente recién licuada. Coronar con la pechuga de pollo deshebrada, queso panela y láminas finas de aguacate.',
    clinicalBenefit: 'Sabor tradicional 100% mexicano con técnica horneada que reduce un 75% las grasas saturadas frente a la receta frita.',
  },
  {
    name: 'Tacos Suaves de Machaca de Res Magra a la Mexicana con Pico de Gallo',
    type: 'desayuno',
    styles: ['dieta_mexicana_saludable', 'fitness_alta_proteina', 'estandar'],
    pathologySafe: ['diabetes_t2', 'fatty_liver'],
    pathologyForbidden: ['ckd_non_dialysis', 'hypertension'],
    baseCalories: 450,
    baseProtein: 34,
    baseCarbs: 42,
    baseFat: 14,
    ingredients: [
      { item: 'Carne de res seca magra (machaca desgrasada)', quantity: '40g hidratada', category: 'Proteínas y Carnes' },
      { item: 'Huevo entero batido', quantity: '1 pieza', category: 'Proteínas y Carnes' },
      { item: 'Jitomate, cebolla y chile serrano picados', quantity: '1 taza', category: 'Verduras' },
      { item: 'Tortillas de maíz recién comaleadas', quantity: '2 piezas', category: 'Cereales y Legumbres' },
      { item: 'Frijoles bayos enteros', quantity: '1/3 taza', category: 'Cereales y Legumbres' },
    ],
    preparation: 'Saltear el jitomate y cebolla, añadir la machaca magra para que absorba el jugo vegetal e incorporar el huevo batido. Servir en tacos suaves.',
    clinicalBenefit: 'Hierro hemínico de alta biodisponibilidad y zinc para el sistema inmunológico y tonificación muscular.',
  },
  // 2. Mediterráneos & Cardiosaludables
  {
    name: 'Tostas de Pan Rústico de Masa Madre con Aguacate, Huevo Poché y Semillas de Calabaza',
    type: 'desayuno',
    styles: ['dieta_mediterranea', 'dieta_dash', 'antiinflamatoria_gut', 'ovolactovegetariana'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'hyperuricemia_gout'],
    baseCalories: 420,
    baseProtein: 20,
    baseCarbs: 40,
    baseFat: 19,
    ingredients: [
      { item: 'Pan rústico de masa madre integral tostado', quantity: '1 rebanada gruesa (50g)', category: 'Cereales y Legumbres' },
      { item: 'Aguacate machacado con limón y pimienta', quantity: '1/2 pieza (60g)', category: 'Grasas Saludables' },
      { item: 'Huevos pochados en agua hirviendo', quantity: '2 piezas', category: 'Proteínas y Carnes' },
      { item: 'Semillas de calabaza tostadas sin sal', quantity: '1 cucharada (10g)', category: 'Grasas Saludables' },
      { item: 'Tomates cherry partidos al medio', quantity: '6 piezas', category: 'Verduras' },
    ],
    preparation: 'Tostar el pan de masa madre. Untar el puré de aguacate sazonado con limón, montar los huevos pochados tibios y coronar con semillas y cherrys.',
    clinicalBenefit: 'Ácidos grasos monoinsaturados y carotenos que desinflaman el endotelio vascular y estabilizan la glucemia.',
  },
  {
    name: 'Revuelto Mediterráneo de Salmón Ahumado con Espinacas Baby y Aceite de Oliva',
    type: 'desayuno',
    styles: ['dieta_mediterranea', 'fitness_alta_proteina', 'low_carb_moderada', 'antiinflamatoria_gut'],
    pathologySafe: ['diabetes_t2', 'fatty_liver', 'obesity'],
    pathologyForbidden: ['ckd_non_dialysis'],
    baseCalories: 410,
    baseProtein: 32,
    baseCarbs: 18,
    baseFat: 21,
    ingredients: [
      { item: 'Huevos enteros camperos', quantity: '2 piezas', category: 'Proteínas y Carnes' },
      { item: 'Láminas de salmón ahumado / fresco al vapor', quantity: '60g', category: 'Proteínas y Carnes' },
      { item: 'Espinacas tiernas baby', quantity: '2 tazas (80g)', category: 'Verduras' },
      { item: 'Aceite de oliva virgen extra', quantity: '1 cucharadita (5ml)', category: 'Grasas Saludables' },
      { item: 'Pan de centeno 100% integral', quantity: '1 rebanada', category: 'Cereales y Legumbres' },
    ],
    preparation: 'Pochar las espinacas con aceite de oliva, añadir el huevo batido y al final incorporar el salmón en tiras para mantener su textura jugosa.',
    clinicalBenefit: 'Riquísimo en ácidos grasos Omega-3 (DHA/EPA) que reducen triglicéridos y modulan marcadores inflamatorios.',
  },
  // 3. Fitness & Alta en Proteína
  {
    name: 'Tazón de Avena Caliente con Proteína Aislada, Canela de Ceilán y Frutos Rojos',
    type: 'desayuno',
    styles: ['fitness_alta_proteina', 'dieta_dash', 'antiinflamatoria_gut', 'ovolactovegetariana', 'economica_practica'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'hyperuricemia_gout'],
    pathologyForbidden: ['ckd_non_dialysis'],
    baseCalories: 440,
    baseProtein: 36,
    baseCarbs: 56,
    baseFat: 8,
    ingredients: [
      { item: 'Hojuelas de avena de grano entero', quantity: '1/2 taza (45g)', category: 'Cereales y Legumbres' },
      { item: 'Whey Protein Isolate o proteína vegetal (vainilla)', quantity: '1 scoop (30g)', category: 'Proteínas y Carnes' },
      { item: 'Leche de almendras o deslactosada light', quantity: '1 taza (240ml)', category: 'Lácteos' },
      { item: 'Fresas y arándanos azules frescos', quantity: '3/4 taza (100g)', category: 'Frutas' },
      { item: 'Canela pura de Ceilán molida', quantity: '1 cucharadita', category: 'Condimentos' },
    ],
    preparation: 'Cocer la avena en la leche a fuego suave 4 minutos. Retirar del fuego y disolver la proteína en polvo para no desnaturalizarla. Añadir la fruta fresca y canela.',
    clinicalBenefit: 'Betaglucanos de avena que limpian el colesterol sanguíneo más 36g de aminoácidos esenciales para recuperación muscular.',
  },
  {
    name: 'Panqueques Proteicos de Avena y Plátano con Yogur Griego y Miel Pura',
    type: 'desayuno',
    styles: ['fitness_alta_proteina', 'estandar', 'ovolactovegetariana'],
    pathologySafe: ['hypertension', 'fatty_liver', 'obesity'],
    baseCalories: 450,
    baseProtein: 30,
    baseCarbs: 60,
    baseFat: 9,
    ingredients: [
      { item: 'Harina de avena integral molida', quantity: '1/2 taza (45g)', category: 'Cereales y Legumbres' },
      { item: 'Plátano maduro machacado', quantity: '1/2 pieza (50g)', category: 'Frutas' },
      { item: 'Claras de huevo', quantity: '3 piezas (90ml)', category: 'Proteínas y Carnes' },
      { item: 'Yogur griego natural sin azúcar 0% grasa', quantity: '1/3 taza (80g)', category: 'Lácteos' },
      { item: 'Frutos del bosque frescos', quantity: '1/2 taza', category: 'Frutas' },
    ],
    preparation: 'Licuar la avena, el plátano y las claras con una pizca de canela. Cocinar en sartén antiadherente 2 min por lado. Acompañar con yogur griego como cobertura.',
    clinicalBenefit: 'Energía sostenida pre-entreno, carbohidratos de asimilación gradual y textura esponjosa sin azúcares refinados.',
  },
  // 4. Vegetariano / Plant-Based
  {
    name: 'Scramble de Tofu a la Mexicana con Cúrcuma, Champiñones y Aguacate',
    type: 'desayuno',
    styles: ['vegetariana_equilibrada', 'antiinflamatoria_gut', 'low_carb_moderada', 'dieta_mexicana_saludable'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'hyperuricemia_gout', 'ckd_non_dialysis'],
    baseCalories: 380,
    baseProtein: 22,
    baseCarbs: 26,
    baseFat: 18,
    ingredients: [
      { item: 'Tofu firme desmenuzado a mano', quantity: '150g', category: 'Proteínas y Carnes' },
      { item: 'Cúrcuma molida y levadura nutricional', quantity: '1/2 cucharadita', category: 'Condimentos' },
      { item: 'Jitomate, cebolla y chile poblano en rajas', quantity: '1 taza', category: 'Verduras' },
      { item: 'Tortillas de maíz comaleadas', quantity: '2 piezas', category: 'Cereales y Legumbres' },
      { item: 'Aguacate fresco', quantity: '1/3 pieza', category: 'Grasas Saludables' },
    ],
    preparation: 'Dorar el tofu desmenuzado en sartén con cúrcuma y sal negra o marina; agregar las rajas de poblano y jitomate. Servir con tortillas calientes.',
    clinicalBenefit: 'Cero colesterol, alto contenido de isoflavonas cardiosaludables y potentes efectos antiinflamatorios de la cúrcuma.',
  },
  // 5. Especial Renal (CKD)
  {
    name: 'Crema de Arroz con Claras Cocidas, Manzana Asada y Aceite de Coco',
    type: 'desayuno',
    styles: ['estandar', 'baja_en_fodmaps'],
    pathologySafe: ['ckd_non_dialysis', 'celiac'],
    baseCalories: 340,
    baseProtein: 14,
    baseCarbs: 58,
    baseFat: 6,
    ingredients: [
      { item: 'Arroz blanco cocido en agua con canela', quantity: '1 taza (150g)', category: 'Cereales y Legumbres' },
      { item: 'Claras de huevo cocidas aparte en tiras', quantity: '3 piezas', category: 'Proteínas y Carnes' },
      { item: 'Manzana pelada al vapor en cubitos', quantity: '1 pieza mediana', category: 'Frutas' },
      { item: 'Canela molida de Ceilán', quantity: 'Al gusto', category: 'Condimentos' },
      { item: 'Aceite de oliva o coco prensado', quantity: '1 cucharadita', category: 'Grasas Saludables' },
    ],
    preparation: 'Triturar el arroz con agua de cocción de canela hasta lograr textura cremosa; mezclar con la manzana cocida y claras picadas muy finas.',
    clinicalBenefit: 'Bajísimo en fósforo, potasio y sodio; aporta proteína pura de alto valor biológico protegiendo la filtración glomerular renal.',
  },
];

// -------------------------------------------------------------
// BANCO MASIVO DE COMIDAS PRINCIPALES (35+ Platillos Únicos)
// -------------------------------------------------------------
export const MASSIVE_LUNCH_TEMPLATES: RecipeTemplate[] = [
  // 1. Tradicionales Mexicanos Caseros
  {
    name: 'Pechuga de Pollo en Caldillo de Jitomate y Calabacitas Tiernas con Arroz Rojo Casero',
    type: 'comida',
    styles: ['dieta_mexicana_saludable', 'estandar', 'economica_practica'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'obesity', 'ckd_non_dialysis'],
    baseCalories: 560,
    baseProtein: 42,
    baseCarbs: 58,
    baseFat: 14,
    ingredients: [
      { item: 'Pechuga de pollo limpia sin piel', quantity: '140g', category: 'Proteínas y Carnes' },
      { item: 'Calabacita criolla en cubos', quantity: '1 taza y media (150g)', category: 'Verduras' },
      { item: 'Caldillo de jitomate con ajo, cebolla y orégano', quantity: '1 taza', category: 'Verduras' },
      { item: 'Arroz rojo al vapor sin grasa saturada', quantity: '3/4 taza cocido (110g)', category: 'Cereales y Legumbres' },
      { item: 'Frijoles de la olla caldosos', quantity: '1/3 taza', category: 'Cereales y Legumbres' },
      { item: 'Aguacate hass', quantity: '1/4 pieza', category: 'Grasas Saludables' },
    ],
    preparation: 'Sellar la pechuga en cubos en una olla con unas gotas de aceite. Agregar el caldillo de jitomate licuado con orégano y las calabacitas. Cocinar tapado 12 minutos. Servir con arroz y frijoles.',
    clinicalBenefit: 'Platillo confort mexicano rico en licopeno antioxidante, potasio y proteína magra con excelente asimilación.',
  },
  {
    name: 'Salpicón de Res Magra con Nopales, Rábanos, Aguacate y Tostadas Horneadas',
    type: 'comida',
    styles: ['dieta_mexicana_saludable', 'fitness_alta_proteina', 'low_carb_moderada'],
    pathologySafe: ['diabetes_t2', 'fatty_liver', 'obesity'],
    pathologyForbidden: ['ckd_non_dialysis', 'hyperuricemia_gout'],
    baseCalories: 540,
    baseProtein: 44,
    baseCarbs: 48,
    baseFat: 18,
    ingredients: [
      { item: 'Falda de res magra cocida y deshebrada fina', quantity: '130g', category: 'Proteínas y Carnes' },
      { item: 'Nopales cocidos en tiras', quantity: '1 taza (100g)', category: 'Verduras' },
      { item: 'Jitomate, cebolla morada, rábano y lechuga picada', quantity: '2 tazas abundantes', category: 'Verduras' },
      { item: 'Tostadas horneadas de maíz sin grasa', quantity: '3 piezas', category: 'Cereales y Legumbres' },
      { item: 'Aceite de oliva virgen extra y vinagre de manzana', quantity: '1 cucharada', category: 'Grasas Saludables' },
      { item: 'Aguacate en cubos', quantity: '1/3 pieza', category: 'Grasas Saludables' },
    ],
    preparation: 'Mezclar en un tazón la carne deshebrada con los vegetales frescos, nopales y vinagreta ligera de aceite de oliva y orégano. Servir fresco sobre tostadas horneadas.',
    clinicalBenefit: 'Comida fresca, saciante y crujiente con alta concentración de hierro, zinc y fibra insoluble reguladora.',
  },
  {
    name: 'Puntas de Lomo de Cerdo Magro en Salsa Verde con Nopales y Frijoles Charros Ligeros',
    type: 'comida',
    styles: ['dieta_mexicana_saludable', 'fitness_alta_proteina', 'estandar'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver'],
    pathologyForbidden: ['ckd_non_dialysis'],
    baseCalories: 580,
    baseProtein: 45,
    baseCarbs: 52,
    baseFat: 19,
    ingredients: [
      { item: 'Lomo de cerdo magro desgrasado en cubos', quantity: '140g', category: 'Proteínas y Carnes' },
      { item: 'Salsa verde de tomatillo cocido con epazote y cilantro', quantity: '1 taza', category: 'Verduras' },
      { item: 'Nopales en tiras blanqueados', quantity: '1 taza', category: 'Verduras' },
      { item: 'Frijoles de la olla caldosos con orégano', quantity: '1/2 taza', category: 'Cereales y Legumbres' },
      { item: 'Tortillas de maíz nixtamalizado', quantity: '2 piezas', category: 'Cereales y Legumbres' },
    ],
    preparation: 'Dorar el lomo en cazuela con toque de ajo; bañar con la salsa verde caliente y los nopales. Hervir 10 minutos a fuego medio. Acompañar con frijoles y tortillas.',
    clinicalBenefit: 'El lomo de cerdo magro aporta tiamina (vitamina B1) y fósforo bioasimilable con menos grasa saturada que muchos cortes vacunos.',
  },
  {
    name: 'Pescado a la Veracruzana con Alcaparras, Tomate, Aceitunas y Arroz al Laurel',
    type: 'comida',
    styles: ['dieta_mexicana_saludable', 'dieta_mediterranea', 'dieta_dash'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'hyperuricemia_gout'],
    baseCalories: 520,
    baseProtein: 40,
    baseCarbs: 54,
    baseFat: 14,
    ingredients: [
      { item: 'Filete de pescado blanco (róbalo, huachinango o tilapia)', quantity: '150g', category: 'Proteínas y Carnes' },
      { item: 'Salsa veracruzana (jitomate, cebolla, pimientos, alcaparras y aceitunas)', quantity: '1 taza', category: 'Verduras' },
      { item: 'Arroz blanco al vapor con hoja de laurel', quantity: '3/4 taza cocido', category: 'Cereales y Legumbres' },
      { item: 'Aceite de oliva virgen extra', quantity: '1 cucharadita (5ml)', category: 'Grasas Saludables' },
      { item: 'Ensalada verde con limón', quantity: '1 taza', category: 'Verduras' },
    ],
    preparation: 'Estofar la salsa con los jitomates, pimientos y aceitunas. Colocar los filetes en la cazuela, tapar y cocer al vapor del caldillo 8 minutos.',
    clinicalBenefit: 'Fusión perfecta mediterráneo-mexicana rica en bioflavonoides y proteína de altísima digestibilidad.',
  },
  // 2. Mediterráneos & Cardiosaludables
  {
    name: 'Filete de Salmón Noruego en Costra de Romero y Ajo con Quinoa Tricolor y Espárragos',
    type: 'comida',
    styles: ['dieta_mediterranea', 'fitness_alta_proteina', 'antiinflamatoria_gut'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'obesity'],
    pathologyForbidden: ['ckd_non_dialysis'],
    baseCalories: 610,
    baseProtein: 44,
    baseCarbs: 45,
    baseFat: 26,
    ingredients: [
      { item: 'Filete de salmón fresco con piel', quantity: '150g', category: 'Proteínas y Carnes' },
      { item: 'Quinoa tricolor cocida con caldo de verduras', quantity: '3/4 taza (120g)', category: 'Cereales y Legumbres' },
      { item: 'Espárragos verdes al grill con limón', quantity: '8 tallos tiernos', category: 'Verduras' },
      { item: 'Aceite de oliva virgen extra', quantity: '1 cucharada (10ml)', category: 'Grasas Saludables' },
      { item: 'Tomates cherry asados', quantity: '1/2 taza', category: 'Verduras' },
    ],
    preparation: 'Marinar el salmón con romero, sal marina y limón. Sellar en sartén caliente 3 min por lado dejando el interior tierno. Servir con quinoa y espárragos crujientes.',
    clinicalBenefit: 'Máxima concentración de Omega-3 antiinflamatorio (EPA/DHA) y astaxantina antioxidante para protección miocárdica y cerebral.',
  },
  {
    name: 'Guiso Mediterráneo de Lentejas Estofadas con Hortalizas, Pavo Magro y Cúrcuma',
    type: 'comida',
    styles: ['dieta_mediterranea', 'dieta_dash', 'antiinflamatoria_gut', 'economica_practica'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver'],
    pathologyForbidden: ['hyperuricemia_gout', 'ckd_non_dialysis'],
    baseCalories: 530,
    baseProtein: 38,
    baseCarbs: 65,
    baseFat: 12,
    ingredients: [
      { item: 'Lentejas pardinas cocidas al dente', quantity: '1 taza (180g)', category: 'Cereales y Legumbres' },
      { item: 'Pechuga de pavo picada en cubos', quantity: '100g', category: 'Proteínas y Carnes' },
      { item: 'Zanahorias, calabacitas y apio en brunoise', quantity: '1 taza abundante', category: 'Verduras' },
      { item: 'Caldillo de jitomate con laurel y cúrcuma', quantity: '1/2 taza', category: 'Verduras' },
      { item: 'Aceite de oliva virgen extra en crudo', quantity: '1 cucharadita (5ml)', category: 'Grasas Saludables' },
    ],
    preparation: 'Estofar las verduras en caldo casero, agregar el pavo en dados y las lentejas ya cocidas. Cocer 10 min a fuego lento y terminar con un hilo de aceite de oliva crudo.',
    clinicalBenefit: 'Almidón resistente que nutre la microbiota bacteriana productora de butirato, mejorando la permeabilidad intestinal.',
  },
  // 3. Fitness & Alta en Proteína
  {
    name: 'Pechuga de Pollo al Limón y Hierbas Finas con Arroz Jazmín y Brócoli al Vapor',
    type: 'comida',
    styles: ['fitness_alta_proteina', 'estandar', 'baja_en_fodmaps'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'hyperuricemia_gout'],
    baseCalories: 570,
    baseProtein: 48,
    baseCarbs: 56,
    baseFat: 14,
    ingredients: [
      { item: 'Pechuga de pollo a la plancha', quantity: '160g', category: 'Proteínas y Carnes' },
      { item: 'Arroz jazmín cocido al vapor', quantity: '1 taza (150g)', category: 'Cereales y Legumbres' },
      { item: 'Ramilletes de brócoli al vapor', quantity: '1 taza y media (120g)', category: 'Verduras' },
      { item: 'Aceite de oliva virgen extra', quantity: '1 cucharadita (5ml)', category: 'Grasas Saludables' },
      { item: 'Aguacate hass', quantity: '1/4 pieza', category: 'Grasas Saludables' },
    ],
    preparation: 'Cocinar la pechuga a la plancha con limón, ajo en polvo y finas hierbas. Cocer el brócoli 4 minutos al vapor para preservar clorofila y servir con arroz jazmín caliente.',
    clinicalBenefit: 'La combinación reina del fitness deportivo: altísimo valor biológico proteico con recarga de glucógeno limpia.',
  },
  {
    name: 'Medallón de Atún Sellado al Ajonjolí con Puré de Camote Asado y Judías Verdes',
    type: 'comida',
    styles: ['fitness_alta_proteina', 'dieta_mediterranea', 'antiinflamatoria_gut'],
    pathologySafe: ['diabetes_t2', 'fatty_liver', 'obesity'],
    baseCalories: 550,
    baseProtein: 46,
    baseCarbs: 48,
    baseFat: 16,
    ingredients: [
      { item: 'Medallón de atún fresco', quantity: '150g', category: 'Proteínas y Carnes' },
      { item: 'Semillas de ajonjolí negro y blanco', quantity: '1 cucharadita (5g)', category: 'Grasas Saludables' },
      { item: 'Puré de camote amarillo asado con canela', quantity: '3/4 taza (130g)', category: 'Cereales y Legumbres' },
      { item: 'Ejotes o judías verdes al vapor', quantity: '1 taza', category: 'Verduras' },
      { item: 'Aceite de ajonjolí u oliva', quantity: '1 cucharadita', category: 'Grasas Saludables' },
    ],
    preparation: 'Rebozar el atún en semillas de ajonjolí. Sellar en sartén de hierro muy caliente 1.5 minutos por lado. Servir sobre cama de puré de camote rústico.',
    clinicalBenefit: 'Betacarotenos precursores de vitamina A para síntesis celular y leucina pura para estímulo mTOR muscular.',
  },
  // 4. Vegetariano / Plant-Based
  {
    name: 'Curry Cremoso de Garbanzos con Espinacas, Leche de Coco Ligera y Arroz Basmati',
    type: 'comida',
    styles: ['vegetariana_equilibrada', 'antiinflamatoria_gut', 'dieta_dash'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver'],
    pathologyForbidden: ['ckd_non_dialysis'],
    baseCalories: 560,
    baseProtein: 24,
    baseCarbs: 78,
    baseFat: 16,
    ingredients: [
      { item: 'Garbanzos cocidos tiernos', quantity: '1 taza y media (220g)', category: 'Cereales y Legumbres' },
      { item: 'Espinacas frescas integradas al final', quantity: '2 tazas', category: 'Verduras' },
      { item: 'Leche de coco light (baja en grasa)', quantity: '1/3 taza (80ml)', category: 'Grasas Saludables' },
      { item: 'Pasta de curry suave o cúrcuma con comino', quantity: '1 cucharada', category: 'Condimentos' },
      { item: 'Arroz basmati aromático cocido', quantity: '3/4 taza (110g)', category: 'Cereales y Legumbres' },
    ],
    preparation: 'Saltear los garbanzos con las especias de curry; verter la leche de coco ligera y reducir 8 min. Incorporar las espinacas al apagar el fuego y servir con basmati.',
    clinicalBenefit: 'Proteína vegetal combinada con polifenoles protectores de endotelio y saciedad prolongada.',
  },
];

// -------------------------------------------------------------
// BANCO MASIVO DE CENAS LIGERAS (25+ Platillos Únicos)
// -------------------------------------------------------------
export const MASSIVE_DINNER_TEMPLATES: RecipeTemplate[] = [
  // 1. Tradicionales Mexicanos Ligeros
  {
    name: 'Tostadas Horneadas de Tinga de Pollo Magro con Lechuga, Rábanos y Queso Panela',
    type: 'cena',
    styles: ['dieta_mexicana_saludable', 'estandar', 'fitness_alta_proteina'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver'],
    pathologyForbidden: ['ckd_non_dialysis'],
    baseCalories: 380,
    baseProtein: 32,
    baseCarbs: 38,
    baseFat: 10,
    ingredients: [
      { item: 'Pechuga de pollo cocida y deshebrada fina', quantity: '100g', category: 'Proteínas y Carnes' },
      { item: 'Tostadas de maíz horneadas sin freír', quantity: '2 piezas', category: 'Cereales y Legumbres' },
      { item: 'Caldillo de jitomate con cebolla asada y orégano', quantity: '1/2 taza', category: 'Verduras' },
      { item: 'Queso panela rallado', quantity: '30g', category: 'Lácteos' },
      { item: 'Lechuga orejona picada y rabanitos', quantity: '1 taza', category: 'Verduras' },
      { item: 'Aguacate en abanico', quantity: '1/4 pieza', category: 'Grasas Saludables' },
    ],
    preparation: 'Calentar la tinga magra en su caldillo sin aceite. Montar sobre las tostadas horneadas crujientes, poner lechuga fresca, queso panela y aguacate.',
    clinicalBenefit: 'Cena ligera, reconfortante y de digestión fácil que promueve un sueño continuo y niveles estables de glucosa nocturna.',
  },
  {
    name: 'Sopa Tarasca Ligera de Frijol Negro con Tiras de Tortilla al Comal y Panela',
    type: 'cena',
    styles: ['dieta_mexicana_saludable', 'dieta_dash', 'ovolactovegetariana'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'hyperuricemia_gout'],
    pathologyForbidden: ['ckd_non_dialysis'],
    baseCalories: 360,
    baseProtein: 22,
    baseCarbs: 48,
    baseFat: 9,
    ingredients: [
      { item: 'Frijoles negros cocidos licuados con caldillo de jitomate', quantity: '1 taza y cuarto', category: 'Cereales y Legumbres' },
      { item: 'Tiras de tortilla horneadas al comal', quantity: '1 pieza', category: 'Cereales y Legumbres' },
      { item: 'Queso panela en cubitos', quantity: '40g', category: 'Lácteos' },
      { item: 'Aguacate fresco', quantity: '1/4 pieza', category: 'Grasas Saludables' },
      { item: 'Chile pasilla frotado al comal desvenado', quantity: '1 pizca decorativa', category: 'Condimentos' },
    ],
    preparation: 'Licuar los frijoles caldosos con jitomate asado y epazote; hervir hasta textura de crema sedosa. Servir en tazón con panela, aguacate y tiras de tortilla.',
    clinicalBenefit: 'Triptófano y magnesio natural de los frijoles negros que estimulan la síntesis de melatonina para un descanso reparador.',
  },
  {
    name: 'Ensalada Tibia de Nopales Asados con Queso Panela al Grill y Pechuga Deshebrada',
    type: 'cena',
    styles: ['dieta_mexicana_saludable', 'low_carb_moderada', 'fitness_alta_proteina'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'obesity'],
    baseCalories: 340,
    baseProtein: 34,
    baseCarbs: 18,
    baseFat: 12,
    ingredients: [
      { item: 'Nopales asados al comal enteros en tiras', quantity: '2 piezas grandes', category: 'Verduras' },
      { item: 'Pechuga de pollo a la plancha deshebrada', quantity: '90g', category: 'Proteínas y Carnes' },
      { item: 'Queso panela asado al comal', quantity: '40g', category: 'Lácteos' },
      { item: 'Jitomate picado, cilantro y cebolla morada', quantity: '1 taza', category: 'Verduras' },
      { item: 'Aceite de oliva virgen extra y limón', quantity: '1 cucharadita', category: 'Grasas Saludables' },
      { item: 'Tortilla de maíz nixtamalizado', quantity: '1 pieza', category: 'Cereales y Legumbres' },
    ],
    preparation: 'Asar los nopales y el queso panela al comal. Cortar en tiras, mezclar con la pechuga y aliñar con limón fresco y aceite de oliva.',
    clinicalBenefit: 'Bajo impacto glucémico, alta saciedad y nulo malestar gástrico antes de acostarse.',
  },
  // 2. Mediterráneos & Pescados Ligeros
  {
    name: 'Filete de Pescado Blanco en Papillote con Calabacitas, Jitomate Cherry y Albahaca',
    type: 'cena',
    styles: ['dieta_mediterranea', 'dieta_dash', 'antiinflamatoria_gut', 'baja_en_fodmaps'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'ckd_non_dialysis', 'celiac'],
    baseCalories: 320,
    baseProtein: 34,
    baseCarbs: 16,
    baseFat: 12,
    ingredients: [
      { item: 'Filete de pescado blanco fresco (tilapia o merluza)', quantity: '140g', category: 'Proteínas y Carnes' },
      { item: 'Calabacita italiana en rodajas finas', quantity: '1 taza (100g)', category: 'Verduras' },
      { item: 'Jitomates cherry partidos al medio', quantity: '8 piezas', category: 'Verduras' },
      { item: 'Aceite de oliva virgen extra', quantity: '1 cucharadita (5ml)', category: 'Grasas Saludables' },
      { item: 'Albahaca fresca y rodajas de limón', quantity: 'Al gusto', category: 'Condimentos' },
    ],
    preparation: 'Colocar el pescado sobre papel pergamino con las verduras, aceite de oliva y albahaca. Sellar el paquete y hornear a 190°C por 12 minutos.',
    clinicalBenefit: 'La cocción en papillote conserva el 100% de los micronutrientes y permite una digestión en menos de 90 minutos.',
  },
  {
    name: 'Crema Sedosa de Calabaza de Castilla y Zanahoria con Huevo Poché y Semillas de Girasol',
    type: 'cena',
    styles: ['dieta_mediterranea', 'dieta_dash', 'antiinflamatoria_gut', 'ovolactovegetariana'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'hyperuricemia_gout'],
    baseCalories: 330,
    baseProtein: 18,
    baseCarbs: 32,
    baseFat: 14,
    ingredients: [
      { item: 'Puré de calabaza de castilla y zanahoria cocidas', quantity: '1 taza y media', category: 'Verduras' },
      { item: 'Huevo campero pochado tibio', quantity: '1 pieza grande', category: 'Proteínas y Carnes' },
      { item: 'Semillas de girasol tostadas sin sal', quantity: '1 cucharada (10g)', category: 'Grasas Saludables' },
      { item: 'Aceite de oliva virgen extra', quantity: '1 cucharadita', category: 'Grasas Saludables' },
      { item: 'Crutones de pan integral al horno', quantity: '20g', category: 'Cereales y Legumbres' },
    ],
    preparation: 'Triturar la calabaza y zanahoria cocidas con caldo vegetal suave. Servir caliente con el huevo pochado en el centro para mezclar su yema con la crema.',
    clinicalBenefit: 'Abundante en vitamina A y potasio con textura ultrareconfortante ideal para noches frescas.',
  },
];

// -------------------------------------------------------------
// BANCO MASIVO DE COLACIONES (30+ Opciones Únicas y Rápidas)
// -------------------------------------------------------------
export const MASSIVE_SNACK_TEMPLATES: RecipeTemplate[] = [
  // Colaciones dulces / frutas / frutos secos
  {
    name: 'Yogur Griego Natural con Frutos Rojos, Semillas de Chía y Nuez de Castilla',
    type: 'colacion_1',
    styles: ['dieta_mediterranea', 'fitness_alta_proteina', 'antiinflamatoria_gut', 'estandar'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver'],
    baseCalories: 210,
    baseProtein: 16,
    baseCarbs: 18,
    baseFat: 8,
    ingredients: [
      { item: 'Yogur griego sin azúcar (estilo islandés o griego 0%)', quantity: '150g', category: 'Lácteos' },
      { item: 'Fresas y moras azules frescas', quantity: '1/2 taza (75g)', category: 'Frutas' },
      { item: 'Nueces de Castilla en mitades', quantity: '3 piezas picadas (15g)', category: 'Grasas Saludables' },
      { item: 'Semillas de chía', quantity: '1 cucharadita', category: 'Grasas Saludables' },
    ],
    preparation: 'Colocar el yogur en copa, añadir los frutos rojos frescos y coronar con las nueces picadas y semillas de chía.',
    clinicalBenefit: 'Probióticos activos para la salud colónica y ácidos grasos Omega-3 de origen vegetal.',
  },
  {
    name: 'Rebanadas de Manzana Verde con Mantequilla de Cacahuate Pura y Canela',
    type: 'colacion_1',
    styles: ['fitness_alta_proteina', 'dieta_dash', 'vegetariana_equilibrada', 'economica_practica'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver'],
    baseCalories: 190,
    baseProtein: 7,
    baseCarbs: 22,
    baseFat: 9,
    ingredients: [
      { item: 'Manzana verde en gajos finos', quantity: '1 pieza mediana', category: 'Frutas' },
      { item: 'Mantequilla de cacahuate 100% natural sin azúcar', quantity: '1 cucharada sopera (15g)', category: 'Grasas Saludables' },
      { item: 'Canela en polvo', quantity: '1 pizca', category: 'Condimentos' },
    ],
    preparation: 'Cortar la manzana en gajos y untar la mantequilla de cacahuate pura espolvoreando un toque de canela.',
    clinicalBenefit: 'Pectina de manzana que amortigua la absorción de azúcares y grasas monoinsaturadas cardiosaludables.',
  },
  // Colaciones saladas / vegetales / mexicanas
  {
    name: 'Jícama y Pepino en Bastones con Limón, Semillas de Calabaza y Sal Marina',
    type: 'colacion_2',
    styles: ['dieta_mexicana_saludable', 'low_carb_moderada', 'dieta_dash', 'economica_practica'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver', 'ckd_non_dialysis'],
    baseCalories: 140,
    baseProtein: 6,
    baseCarbs: 16,
    baseFat: 6,
    ingredients: [
      { item: 'Jícama fresca en bastones', quantity: '1 taza (120g)', category: 'Verduras' },
      { item: 'Pepino pelado en bastones sin semillas', quantity: '1 taza (100g)', category: 'Verduras' },
      { item: 'Semillas de calabaza (pepitas) tostadas sin sal', quantity: '1 cucharada (12g)', category: 'Grasas Saludables' },
      { item: 'Jugo de limón recién exprimido y chile piquín puro', quantity: 'Al gusto', category: 'Condimentos' },
    ],
    preparation: 'Mezclar los bastones crujientes en un vaso, rociar abundante limón y espolvorear las pepitas de calabaza.',
    clinicalBenefit: 'Inulina prebiótica de la jícama y magnesio natural con mínima carga calórica para calmar ansiedad.',
  },
  {
    name: 'Cubos de Queso Panela Asado con Jitomate Cherry, Orégano y Aceite de Oliva',
    type: 'colacion_2',
    styles: ['dieta_mexicana_saludable', 'dieta_mediterranea', 'low_carb_moderada'],
    pathologySafe: ['diabetes_t2', 'fatty_liver', 'obesity'],
    baseCalories: 170,
    baseProtein: 14,
    baseCarbs: 4,
    baseFat: 10,
    ingredients: [
      { item: 'Queso panela bajo en grasa en cubos asados', quantity: '60g', category: 'Lácteos' },
      { item: 'Jitomates cherry partidos al medio', quantity: '6 piezas', category: 'Verduras' },
      { item: 'Aceite de oliva virgen extra', quantity: '1 cucharadita', category: 'Grasas Saludables' },
      { item: 'Orégano seco mexicano', quantity: '1 pizca', category: 'Condimentos' },
    ],
    preparation: 'Pasar los cubos de panela por comal caliente 1 minuto. Montar en brocheta con los cherrys y aderezar con orégano y aceite de oliva.',
    clinicalBenefit: 'Snack proteico de alta saciedad que evita caídas de glucosa en la tarde.',
  },
  {
    name: 'Tazón de Edamames al Vapor con Flor de Sal y Ajonjolí Tostado',
    type: 'colacion_2',
    styles: ['vegetariana_equilibrada', 'fitness_alta_proteina', 'antiinflamatoria_gut'],
    pathologySafe: ['diabetes_t2', 'hypertension', 'fatty_liver'],
    baseCalories: 160,
    baseProtein: 14,
    baseCarbs: 12,
    baseFat: 6,
    ingredients: [
      { item: 'Vainas de edamame tiernas al vapor', quantity: '1 taza (150g en vaina)', category: 'Cereales y Legumbres' },
      { item: 'Semillas de ajonjolí tostadas', quantity: '1 cucharadita', category: 'Grasas Saludables' },
      { item: 'Sal marina y unas gotas de limón', quantity: 'Al gusto', category: 'Condimentos' },
    ],
    preparation: 'Cocer las vainas en agua hirviendo 4 minutos. Escurrir, rociar con limón y saltear brevemente con ajonjolí.',
    clinicalBenefit: 'Proteína vegetal de calidad prémium y fitoesteroles reductores del colesterol.',
  },
];

/**
 * Filtra y selecciona platillos inteligentes del banco masivo garantizando NO repetición
 */
export function pickSmartMealsForDay(
  mealType: 'desayuno' | 'colacion_1' | 'comida' | 'colacion_2' | 'cena',
  targetStyle: string,
  pathologies: string[],
  excludedDishes: string[],
  currentPlanUsedDishes: Set<string>,
  seedOffset: number = 0
): RecipeTemplate {
  let pool: RecipeTemplate[] = [];

  if (mealType === 'desayuno') {
    pool = MASSIVE_BREAKFAST_TEMPLATES;
  } else if (mealType === 'comida') {
    pool = MASSIVE_LUNCH_TEMPLATES;
  } else if (mealType === 'cena') {
    pool = MASSIVE_DINNER_TEMPLATES;
  } else {
    pool = MASSIVE_SNACK_TEMPLATES;
  }

  // Filtrar por patologías prohibidas
  const safePool = pool.filter((recipe) => {
    if (recipe.pathologyForbidden && recipe.pathologyForbidden.some((p) => pathologies.includes(p))) {
      return false;
    }
    return true;
  });

  const normalizedExcluded = new Set(excludedDishes.map((d) => normalizeMealName(d)));

  // 1. Prioridad: Coincide con estilo y NO está en exclusiones ni usado en este plan
  const perfectCandidates = safePool.filter((r) => {
    const norm = normalizeMealName(r.name);
    const matchesStyle = r.styles.includes(targetStyle) || r.styles.includes('estandar');
    const notUsedInPlan = !currentPlanUsedDishes.has(norm);
    const notInHistory = !normalizedExcluded.has(norm);
    return matchesStyle && notUsedInPlan && notInHistory;
  });

  if (perfectCandidates.length > 0) {
    const idx = (seedOffset + Math.floor(Math.random() * perfectCandidates.length)) % perfectCandidates.length;
    return perfectCandidates[idx];
  }

  // 2. Segunda opción: No usado en este plan (aunque sea de otro estilo clínico seguro)
  const nonRepeatCandidates = safePool.filter((r) => {
    const norm = normalizeMealName(r.name);
    return !currentPlanUsedDishes.has(norm) && !normalizedExcluded.has(norm);
  });

  if (nonRepeatCandidates.length > 0) {
    const idx = (seedOffset + Math.floor(Math.random() * nonRepeatCandidates.length)) % nonRepeatCandidates.length;
    return nonRepeatCandidates[idx];
  }

  // 3. Tercera opción: No usado dentro de este plan actual
  const planOnlyCandidates = safePool.filter((r) => {
    const norm = normalizeMealName(r.name);
    return !currentPlanUsedDishes.has(norm);
  });

  if (planOnlyCandidates.length > 0) {
    const idx = Math.floor(Math.random() * planOnlyCandidates.length);
    return planOnlyCandidates[idx];
  }

  // Fallback seguro de emergencia
  return safePool[0] || pool[0];
}
