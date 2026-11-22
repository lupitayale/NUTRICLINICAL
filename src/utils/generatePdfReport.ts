import { jsPDF } from 'jspdf';
import { Patient, MenuPlan } from '../types/nutrition';
import { PATHOLOGY_INFO } from './nutritionCalculations';

export function downloadPatientClinicalPdf(
  patient: Patient,
  plan: MenuPlan,
  logoId?: string,
  customLogoUrl?: string | null,
  clinicianName: string = 'Lic. Alejandro Aguilar',
  clinicianLicense: string = 'Céd. Prof. 8492019'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  const latestConsult = patient.consultations[patient.consultations.length - 1];

  // Helper to add new page and reset Y
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 16;
      drawHeaderWatermark();
    }
  };

  const drawHeaderWatermark = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 160, 175);
    doc.text('NutriClinical PRO · Expediente y Plan Nutricional Clínico', margin, 10);
    doc.text(
      `Paciente: ${patient.fullName} · Folio #${patient.id.slice(-6)}`,
      pageWidth - margin,
      10,
      { align: 'right' }
    );
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // --- PAGE 1: HEADER & CLINICAL SUMMARY ---
  // Top Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 26, 'F');

  // Decorative Golden/Teal Logo Emblem Badge in Banner
  doc.setFillColor(13, 148, 136); // teal-600
  doc.circle(margin + 12, y + 13, 9, 'F');
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(0.6);
  doc.circle(margin + 12, y + 13, 7.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('NC', margin + 12, y + 15, { align: 'center' });

  // Clinic Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('NUTRICLINICAL PRO', margin + 25, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('CENTRO INTEGRAL DE NUTRICIÓN CLÍNICA Y DIETOTERAPIA', margin + 25, y + 16);
  doc.setTextColor(45, 212, 191); // teal-400
  doc.setFontSize(7.5);
  doc.text(`Especialista: ${clinicianName} · ${clinicianLicense}`, margin + 25, y + 21);

  doc.setFontSize(8);
  doc.setTextColor(45, 212, 191); // teal-400
  const dateStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Fecha de Emisión: ${dateStr}`, pageWidth - margin - 6, y + 9, { align: 'right' });
  doc.text(`Folio Clínico: #${patient.id.slice(-6)}`, pageWidth - margin - 6, y + 15, { align: 'right' });

  y += 28;

  // Section 1: Patient Demographics Block
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text('DATOS GENERALES DEL PACIENTE', margin + 4, y + 5);

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Nombre: ${patient.fullName}`, margin + 4, y + 11);
  doc.text(
    `Edad: ${patient.age} años  |  Sexo: ${patient.gender === 'male' ? 'Masculino' : 'Femenino'}`,
    margin + 4,
    y + 16
  );
  doc.text(
    `Contacto: ${patient.phone || 'N/A'}  |  ${patient.email || 'N/A'}`,
    margin + 4,
    y + 21
  );

  const diagNames = patient.pathologies.map((p) => PATHOLOGY_INFO[p]?.name.split(' (')[0] || p);
  const diagText = diagNames.length > 0 ? diagNames.join(', ') : 'Salud general / Acondicionamiento';
  const allergiesText = patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'Ninguna declarada';

  doc.text(`Diagnósticos: ${diagText}`, margin + 85, y + 11);
  doc.text(`Alergias: ${allergiesText}`, margin + 85, y + 16);
  doc.text(`Objetivo: ${patient.targetGoal.replace('_', ' ').toUpperCase()}`, margin + 85, y + 21);

  y += 30;

  // Section 2: Anthropometric Assessment Table
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. VALORACIÓN ANTROPOMÉTRICA & CLÍNICA', margin, y);
  y += 4;

  const currentWeight = latestConsult ? `${latestConsult.weightKg} kg` : '70 kg';
  const heightStr = latestConsult ? `${latestConsult.heightCm} cm` : '170 cm';
  const bmiStr = latestConsult ? `${latestConsult.bmi} kg/m²` : 'N/A';
  const bmiClass = latestConsult ? latestConsult.bmiClassification : 'Normopeso';
  const waistStr = latestConsult?.waistCm ? `${latestConsult.waistCm} cm` : 'N/D';
  const hipStr = latestConsult?.hipCm ? `${latestConsult.hipCm} cm` : 'N/D';
  const whrStr = latestConsult?.waistHipRatio ? `${latestConsult.waistHipRatio}` : 'N/D';
  const cardioRisk = latestConsult?.cardioRisk || 'Bajo';
  const hamwiIdeal = latestConsult ? `${latestConsult.idealWeightHamwi} kg` : 'N/A';
  const metropolitanIdeal = latestConsult ? `${latestConsult.idealWeightMetropolitan} kg` : 'N/A';
  const adjustedWeight = latestConsult && latestConsult.bmi >= 30 ? `${latestConsult.adjustedWeightKg} kg` : 'N/A';

  const anthropoData = [
    [
      { label: 'Peso Actual', val: currentWeight },
      { label: 'Estatura', val: heightStr },
      { label: 'IMC (OMS)', val: bmiStr },
      { label: 'Diagnóstico IMC', val: bmiClass },
    ],
    [
      { label: 'Cintura', val: waistStr },
      { label: 'Cadera', val: hipStr },
      { label: 'Índice Cintura/Cadera', val: whrStr },
      { label: 'Riesgo Cardiovascular', val: cardioRisk },
    ],
    [
      { label: 'Peso Ideal (Hamwi)', val: hamwiIdeal },
      { label: 'Peso Ideal (Metro)', val: metropolitanIdeal },
      { label: 'Peso Ajustado (Obesidad)', val: adjustedWeight },
      {
        label: 'Presión Arterial',
        val: latestConsult?.bloodPressureSys ? `${latestConsult.bloodPressureSys}/${latestConsult.bloodPressureDia} mmHg` : 'Normal',
      },
    ],
  ];

  const colW = contentWidth / 4;
  anthropoData.forEach((row) => {
    row.forEach((cell, cIdx) => {
      const cellX = margin + cIdx * colW;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(cellX, y, colW, 11, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(cell.label, cellX + 3, y + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(cell.val, cellX + 3, y + 9);
    });
    y += 11;
  });

  y += 6;

  // Section 3: Nutritional Prescription & Macronutrients
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. REQUERIMIENTOS ENERGÉTICOS & CUADRO DIETOSINTÉTICO', margin, y);
  y += 4;

  const presc = patient.activePrescription;
  const macroColW = contentWidth / 5;

  const macroTiles = [
    { label: 'CALORÍAS META', val: `${presc.targetCalories} kcal`, sub: 'Gasto Total Ajustado' },
    { label: 'PROTEÍNAS', val: `${presc.proteinGrams} g (${presc.proteinPercent}%)`, sub: `${presc.proteinGramsPerKg} g/kg/día` },
    { label: 'CARBOHIDRATOS', val: `${presc.carbGrams} g (${presc.carbPercent}%)`, sub: 'Bajo índice glucémico' },
    { label: 'LÍPIDOS / GRASAS', val: `${presc.fatGrams} g (${presc.fatPercent}%)`, sub: 'Grasas cardioprotectoras' },
    { label: 'AGUA NATURAL', val: `${plan.hydrationLiters || 2.2} L`, sub: '~8 vasos al día' },
  ];

  macroTiles.forEach((tile, idx) => {
    const tileX = margin + idx * macroColW;
    doc.setFillColor(idx === 0 ? 240 : 248, idx === 0 ? 253 : 250, idx === 0 ? 250 : 252);
    doc.setDrawColor(idx === 0 ? 13 : 226, idx === 0 ? 148 : 232, idx === 0 ? 136 : 240);
    doc.rect(tileX, y, macroColW, 15, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(idx === 0 ? 13 : 100, idx === 0 ? 148 : 116, idx === 0 ? 136 : 139);
    doc.text(tile.label, tileX + 3, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(idx === 0 ? 15 : 30, idx === 0 ? 23 : 41, idx === 0 ? 42 : 59);
    doc.text(tile.val, tileX + 3, y + 9.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(tile.sub, tileX + 3, y + 13);
  });

  y += 20;

  // Specific Clinical Pathology Guidelines
  if (presc.clinicalGuidelines?.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14); // amber-900
    doc.text('DIRECTRICES CLÍNICAS POR PATOLOGÍA:', margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 53, 15);
    const guideLinesStr = presc.clinicalGuidelines.slice(0, 2).join('  ·  ');
    const splitGuide = doc.splitTextToSize(guideLinesStr, contentWidth - 8);
    doc.text(splitGuide, margin + 4, y + 9);

    y += 18;
  }

  // --- SECTION 4: DETAILED DIET MENU PLAN ---
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. PLAN DE MENÚS DIARIOS ADAPTADO', margin, y);
  y += 5;

  plan.days.forEach((day) => {
    checkPageBreak(35);

    // Day Header Bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`DÍA: ${day.dayName.toUpperCase()}`, margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(
      `Total: ${day.totalCalories} kcal  |  Prot: ${day.totalProtein}g  |  Carbs: ${day.totalCarbs}g  |  Grasas: ${day.totalFat}g`,
      pageWidth - margin - 4,
      y + 5,
      { align: 'right' }
    );
    y += 8;

    day.meals.forEach((meal) => {
      // Calculate needed height for meal
      const ingCount = meal.ingredients.length;
      const neededH = Math.max(18, 10 + ingCount * 3.5);
      checkPageBreak(neededH + 2);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, neededH, 'FD');

      // Meal label and dish title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text(meal.timeLabel || meal.type.toUpperCase(), margin + 3, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(meal.name, contentWidth - 55);
      doc.text(titleLines, margin + 3, y + 8.5);

      // Nutrition pill on right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `${meal.calories} kcal  (${meal.protein}g P / ${meal.carbs}g C / ${meal.fat}g G)`,
        pageWidth - margin - 3,
        y + 5,
        { align: 'right' }
      );

      // Ingredients list
      let ingY = y + 13;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);

      const halfW = (contentWidth - 6) / 2;
      meal.ingredients.forEach((ing, iIdx) => {
        const itemLine = `• ${ing.item}: ${ing.quantity}`;
        if (iIdx % 2 === 0) {
          doc.text(itemLine, margin + 3, ingY);
        } else {
          doc.text(itemLine, margin + 3 + halfW, ingY);
          ingY += 3.5;
        }
      });

      y += neededH + 2;
    });

    y += 3;
  });

  // --- SECTION 5: GROCERY LIST & CLINICAL RECOMMENDATIONS ---
  if (plan.groceryList?.length > 0) {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('4. LISTA DE COMPRAS SUGERIDA (SUPERMERCADO)', margin, y);
    y += 5;

    const gColW = contentWidth / 2;
    let listY = y;
    let leftY = y;
    let rightY = y;

    plan.groceryList.forEach((group, gIdx) => {
      const isLeft = gIdx % 2 === 0;
      const curX = isLeft ? margin : margin + gColW;
      let curY = isLeft ? leftY : rightY;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(13, 148, 136);
      doc.text(group.category.toUpperCase(), curX, curY);
      curY += 3.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      group.items.slice(0, 6).forEach((item) => {
        doc.text(`[  ]  ${item}`, curX + 2, curY);
        curY += 3.2;
      });

      curY += 2;
      if (isLeft) leftY = curY;
      else rightY = curY;
    });

    y = Math.max(leftY, rightY) + 4;
  }

  // Clinical Observations & Doctor Signature
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('5. INDICACIONES MÉDICAS & ESTILO DE VIDA', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  (plan.clinicalObservations || []).slice(0, 4).forEach((obs) => {
    const splitObs = doc.splitTextToSize(`• ${obs}`, contentWidth);
    doc.text(splitObs, margin, y);
    y += splitObs.length * 3.5 + 1;
  });

  y += 10;
  checkPageBreak(25);

  // Professional Signature Block
  const sigX = pageWidth - margin - 60;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);
  doc.line(sigX, y + 10, pageWidth - margin, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(clinicianName, sigX + 30, y + 14, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(clinicianLicense, sigX + 30, y + 18, { align: 'center' });
  doc.text('Nutriólogo Clínico Responsable', sigX + 30, y + 22, { align: 'center' });

  // Add Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${totalPages} · NutriClinical PRO Documento Confidencial`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Trigger browser download
  const cleanPatientName = patient.fullName.replace(/\s+/g, '_').replace(/[^\w]/g, '');
  doc.save(`Reporte_Nutricional_${cleanPatientName}.pdf`);
}
