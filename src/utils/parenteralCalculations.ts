import {
  ParenteralPrescription,
  ParenteralAccessRoute,
} from '../types/nutrition';

export interface ParenteralInputParams {
  patientId: string;
  patientWeightKg: number;
  totalVolumeTargetMl: number;
  // Amino Acids
  aminoAcidGramsPerKg: number; // e.g. 1.2 to 1.8 g/kg
  aminoAcidConcentrationPercent: number; // 10, 8.5, 15
  // Dextrose
  dextroseTotalGrams: number; // or calculated from non-protein calories
  dextroseConcentrationPercent: number; // 50 or 10
  // Lipids
  lipidGramsPerKg: number; // e.g. 0.8 to 1.2 g/kg
  lipidConcentrationPercent: number; // 20
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
  // Infusion
  infusionHours: number; // usually 24h
  accessRouteChoice: ParenteralAccessRoute;
}

export function calculateParenteralPrescription(
  params: ParenteralInputParams
): ParenteralPrescription {
  const {
    patientId,
    patientWeightKg,
    totalVolumeTargetMl,
    aminoAcidGramsPerKg,
    aminoAcidConcentrationPercent,
    dextroseTotalGrams,
    dextroseConcentrationPercent,
    lipidGramsPerKg,
    lipidConcentrationPercent,
    sodiumMeq,
    potassiumMeq,
    calciumMeq,
    magnesiumMeq,
    phosphorusMmol,
    mviMl,
    traceElementsMl,
    heparinUnits = 0,
    vitaminCMg = 0,
    infusionHours = 24,
    accessRouteChoice,
  } = params;

  // 1. Amino Acids
  const aminoAcidTotalGrams = +(patientWeightKg * aminoAcidGramsPerKg).toFixed(1);
  const aminoAcidCalories = Math.round(aminoAcidTotalGrams * 4); // 4 kcal/g
  const nitrogenGrams = +(aminoAcidTotalGrams / 6.25).toFixed(2); // 1g N = 6.25g AA
  const aminoAcidVolumeMl = Math.round((aminoAcidTotalGrams / aminoAcidConcentrationPercent) * 100);

  // 2. Dextrose
  const dextroseCalories = Math.round(dextroseTotalGrams * 3.4); // 3.4 kcal/g monohydrate
  const dextroseVolumeMl = Math.round((dextroseTotalGrams / dextroseConcentrationPercent) * 100);

  // Glucose Infusion Rate (TIG / GIR) in mg/kg/min
  // TIG = (g dextrose * 1000) / (weight_kg * infusion_minutes)
  const infusionMinutes = infusionHours * 60;
  const glucoseInfusionRateMgKgMin = +(
    (dextroseTotalGrams * 1000) /
    (patientWeightKg * infusionMinutes)
  ).toFixed(2);

  // 3. Lipids (20% emulsion => 2.0 kcal/ml, 10 kcal/g)
  const lipidTotalGrams = +(patientWeightKg * lipidGramsPerKg).toFixed(1);
  const lipidVolumeMl = Math.round((lipidTotalGrams / (lipidConcentrationPercent / 100)));
  const lipidCalories = Math.round(lipidVolumeMl * 2.0); // 20% lipid emulsion = 2 kcal/ml

  // 4. Totals and Ratios
  const nonProteinCalories = dextroseCalories + lipidCalories;
  const totalCalories = aminoAcidCalories + nonProteinCalories;

  const nonProteinCalorieToNitrogenRatio = nitrogenGrams > 0
    ? Math.round(nonProteinCalories / nitrogenGrams)
    : 0;

  const proteinCaloriePercent = Math.round((aminoAcidCalories / totalCalories) * 100) || 0;
  const dextroseCaloriePercent = Math.round((dextroseCalories / totalCalories) * 100) || 0;
  const lipidCaloriePercent = Math.round((lipidCalories / totalCalories) * 100) || 0;

  // 5. Volume check
  const additivesVolumeMl = mviMl + traceElementsMl;
  const electrolytesVolumeEstimatedMl = Math.round((sodiumMeq + potassiumMeq) * 0.2); // approx ampoules volume
  const sumSubcomponentsVolumeMl =
    aminoAcidVolumeMl + dextroseVolumeMl + lipidVolumeMl + additivesVolumeMl + electrolytesVolumeEstimatedMl;
  
  const finalTotalVolumeMl = Math.max(totalVolumeTargetMl, sumSubcomponentsVolumeMl);
  const waterForInjectionVolumeMl = Math.max(0, finalTotalVolumeMl - sumSubcomponentsVolumeMl);

  // 6. Calculated Osmolarity (mOsm/L)
  // Osm = [(g Dextrose * 5) + (g AA * 10) + (g Lipids * 1.5) + (mEq Cations * 2)] / Volume_in_Liters
  const liters = finalTotalVolumeMl / 1000;
  const totalCationsMeq = sodiumMeq + potassiumMeq + calciumMeq + magnesiumMeq;
  const totalEstimatedMOsm =
    dextroseTotalGrams * 5 +
    aminoAcidTotalGrams * 10 +
    lipidTotalGrams * 1.5 +
    totalCationsMeq * 2;

  const calculatedOsmolarityMOsmL = Math.round(totalEstimatedMOsm / liters);
  const isCentralRouteMandatory = calculatedOsmolarityMOsmL >= 900;

  const accessRoute: ParenteralAccessRoute = isCentralRouteMandatory
    ? 'central'
    : accessRouteChoice;

  // 7. Infusion rate
  const infusionRateMlPerHour = +(finalTotalVolumeMl / infusionHours).toFixed(1);

  // 8. Clinical safety alerts & warnings
  const clinicalWarnings: string[] = [];

  if (isCentralRouteMandatory) {
    clinicalWarnings.push(
      `ALERTA VASCULAR: Osmolaridad calculada ${calculatedOsmolarityMOsmL} mOsm/L. Supera el límite periférico de 850-900 mOsm/L. REQUIERE OBLIGATORIAMENTE Catéter Venoso Central (CVC - Subclavia, Yugular interna o PICC) para evitar flebitis química severa y trombosis vascular.`
    );
  } else {
    clinicalWarnings.push(
      `Vía periférica permitida (Osmolaridad ${calculatedOsmolarityMOsmL} mOsm/L < 900 mOsm/L). Monitorear sitio de punción venosa periférica cada 12-24 horas.`
    );
  }

  if (glucoseInfusionRateMgKgMin > 4.5) {
    clinicalWarnings.push(
      `ALERTA TIG ELEVADA (${glucoseInfusionRateMgKgMin} mg/kg/min): Supera el límite de oxidación hepática de glucosa (>4-5 mg/kg/min). Alto riesgo de esteatosis hepática, hiperglucemia refractaria y lipogénesis excesiva con aumento de producción de CO2.`
    );
  } else if (glucoseInfusionRateMgKgMin < 1.5) {
    clinicalWarnings.push(
      `TIG baja (${glucoseInfusionRateMgKgMin} mg/kg/min): Evaluar si el aporte calórico de carbohidratos es suficiente para evitar gluconeogénesis endógena.`
    );
  }

  if (nonProteinCalorieToNitrogenRatio < 80) {
    clinicalWarnings.push(
      `Relación Kcal NP : g N baja (${nonProteinCalorieToNitrogenRatio}:1). Sugerido solo en trauma severo / UCI hipercatabólica. Verificar que los aminoácidos no se estén oxidando como fuente energética.`
    );
  } else if (nonProteinCalorieToNitrogenRatio > 180) {
    clinicalWarnings.push(
      `Relación Kcal NP : g N elevada (${nonProteinCalorieToNitrogenRatio}:1). El aporte de proteína podría ser insuficiente para las calorías no proteicas administradas.`
    );
  }

  if (calciumMeq > 0 && phosphorusMmol > 0) {
    // Calcium-phosphate compatibility check
    const caMmols = calciumMeq / 2;
    const caPProduct = (caMmols * 2) * phosphorusMmol;
    if (caPProduct > 300) {
      clinicalWarnings.push(
        `PRECAUCIÓN DE PRECIPITACIÓN: Producto Calcio-Fósforo elevado. Asegurar la adición de fosfato al inicio en la solución de aminoácidos y gluconato de calcio al final con agitación continua para prevenir precipitación de fosfato dibásico de calcio.`
      );
    }
  }

  return {
    id: `parenteral-${Date.now()}`,
    patientId,
    accessRoute,
    patientWeightKg,
    totalVolumeMl: finalTotalVolumeMl,
    aminoAcidConcentrationPercent,
    aminoAcidGramsPerKg,
    aminoAcidTotalGrams,
    aminoAcidCalories,
    nitrogenGrams,
    dextroseConcentrationPercent,
    dextroseTotalGrams,
    dextroseCalories,
    glucoseInfusionRateMgKgMin,
    lipidConcentrationPercent,
    lipidGramsPerKg,
    lipidTotalGrams,
    lipidCalories,
    totalCalories,
    nonProteinCalories,
    nonProteinCalorieToNitrogenRatio,
    proteinCaloriePercent,
    dextroseCaloriePercent,
    lipidCaloriePercent,
    sodiumMeq,
    potassiumMeq,
    calciumMeq,
    magnesiumMeq,
    phosphorusMmol,
    mviMl,
    traceElementsMl,
    heparinUnits,
    vitaminCMg,
    calculatedOsmolarityMOsmL,
    isCentralRouteMandatory,
    infusionHours,
    infusionRateMlPerHour,
    clinicalWarnings,
    date: new Date().toISOString().split('T')[0],
  };
}
