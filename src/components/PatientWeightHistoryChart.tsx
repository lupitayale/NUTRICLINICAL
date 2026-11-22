import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { AnthropometricRecord, Gender } from '../types/nutrition';
import { Scale, TrendingDown, TrendingUp, Target, Info, Sparkles } from 'lucide-react';

interface PatientWeightHistoryChartProps {
  consultations: AnthropometricRecord[];
  idealWeightKg?: number;
  gender: Gender;
}

type ChartMetric = 'weight' | 'fat' | 'bmi' | 'glucose';

export const PatientWeightHistoryChart: React.FC<PatientWeightHistoryChartProps> = ({
  consultations,
  idealWeightKg,
  gender,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('weight');

  // Sort chronological
  const sorted = [...consultations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Map to chart items with deltas
  const data = sorted.map((c, index) => {
    const prev = index > 0 ? sorted[index - 1] : null;
    const weightDelta = prev ? Number((c.weightKg - prev.weightKg).toFixed(1)) : 0;

    // Format date for label
    const dateObj = new Date(c.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    });

    return {
      date: c.date,
      dateFormatted: formattedDate,
      weight: c.weightKg,
      weightDelta,
      bmi: c.bmi,
      fatPercent: c.bodyFatPercent || null,
      glucose: c.fastingGlucoseMgDl || null,
      notes: c.consultationNotes || '',
      classification: c.bmiClassification,
    };
  });

  const initialRecord = sorted[0];
  const latestRecord = sorted[sorted.length - 1];
  const totalDelta =
    initialRecord && latestRecord && sorted.length > 1
      ? Number((latestRecord.weightKg - initialRecord.weightKg).toFixed(1))
      : 0;

  const weights = sorted.map((c) => c.weightKg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  // Determine metric configs
  const metricConfigs = {
    weight: {
      key: 'weight',
      name: 'Peso',
      unit: 'kg',
      stroke: '#0d9488', // teal-600
      fill: 'url(#weightGradient)',
      refLine: idealWeightKg,
      refLineLabel: `Meta Ideal (${idealWeightKg} kg)`,
      refLineStroke: '#6366f1',
    },
    fat: {
      key: 'fatPercent',
      name: '% Grasa',
      unit: '%',
      stroke: '#f59e0b', // amber-500
      fill: 'url(#fatGradient)',
      refLine: gender === 'male' ? 18 : 23,
      refLineLabel: gender === 'male' ? 'Ref. Saludable (18%)' : 'Ref. Saludable (23%)',
      refLineStroke: '#10b981',
    },
    bmi: {
      key: 'bmi',
      name: 'IMC',
      unit: 'kg/m²',
      stroke: '#3b82f6', // blue-500
      fill: 'url(#bmiGradient)',
      refLine: 24.9,
      refLineLabel: 'Límite Normopeso (24.9)',
      refLineStroke: '#10b981',
    },
    glucose: {
      key: 'glucose',
      name: 'Glucemia en Ayuno',
      unit: 'mg/dL',
      stroke: '#ef4444', // red-500
      fill: 'url(#glucoseGradient)',
      refLine: 100,
      refLineLabel: 'Límite Normal (100 mg/dL)',
      refLineStroke: '#10b981',
    },
  };

  const currentConfig = metricConfigs[selectedMetric];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-700 text-xs min-w-[200px] z-50">
          <div className="font-bold text-slate-300 pb-1.5 border-b border-slate-800 flex items-center justify-between">
            <span>{point.date}</span>
            <span className="text-[10px] text-teal-400 font-normal">Consulta</span>
          </div>

          <div className="py-2 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-slate-400 font-medium">Peso:</span>
              <span className="text-base font-extrabold text-white">
                {point.weight} <span className="text-xs font-normal text-slate-300">kg</span>
              </span>
            </div>

            {point.weightDelta !== 0 && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Variación:</span>
                <span
                  className={`font-bold ${
                    point.weightDelta < 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {point.weightDelta > 0 ? `+${point.weightDelta}` : point.weightDelta} kg
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">IMC (OMS):</span>
              <span className="font-semibold text-slate-200">
                {point.bmi} <span className="text-slate-400 font-normal">({point.classification.split(' ')[0]})</span>
              </span>
            </div>

            {point.fatPercent && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">% Grasa:</span>
                <span className="font-semibold text-amber-400">{point.fatPercent}%</span>
              </div>
            )}

            {point.glucose && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Glucosa ayuno:</span>
                <span className="font-semibold text-rose-400">{point.glucose} mg/dL</span>
              </div>
            )}
          </div>

          {point.notes && (
            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 italic line-clamp-2">
              "{point.notes}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Control bar: Title, metric selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-600" />
              <span>Historial Antropométrico con Recharts</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
              Datos Dinámicos
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo gráfico interactivo de la trayectoria de peso y composición corporal
          </p>
        </div>

        {/* Metric Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSelectedMetric('weight')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              selectedMetric === 'weight'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Peso (kg)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('fat')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              selectedMetric === 'fat'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            % Grasa
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('bmi')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              selectedMetric === 'bmi'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            IMC
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('glucose')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              selectedMetric === 'glucose'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Glucemia
          </button>
        </div>
      </div>

      {/* Main Recharts Area Container */}
      {data.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 pt-6">
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  {/* Gradients */}
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="bmiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />

                <XAxis
                  dataKey="dateFormatted"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  dy={8}
                />

                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  unit={` ${currentConfig.unit}`}
                  dx={-5}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Reference line for target / ideal weight */}
                {currentConfig.refLine && (
                  <ReferenceLine
                    y={currentConfig.refLine}
                    stroke={currentConfig.refLineStroke}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: currentConfig.refLineLabel,
                      position: 'insideTopRight',
                      fill: currentConfig.refLineStroke,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey={currentConfig.key}
                  stroke={currentConfig.stroke}
                  strokeWidth={2.5}
                  fill={currentConfig.fill}
                  dot={{
                    r: 4,
                    fill: '#ffffff',
                    stroke: currentConfig.stroke,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: currentConfig.stroke,
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  name={currentConfig.name}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Peso Inicial
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                {initialRecord?.weightKg} kg
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {initialRecord?.date}
              </span>
            </div>

            <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Peso Actual
              </span>
              <span className="text-sm font-extrabold text-teal-800">
                {latestRecord?.weightKg} kg
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {latestRecord?.date}
              </span>
            </div>

            <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Cambio Neto Total
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {totalDelta !== 0 && (
                  totalDelta < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  )
                )}
                <span
                  className={`text-sm font-extrabold ${
                    totalDelta < 0
                      ? 'text-emerald-700'
                      : totalDelta > 0
                      ? 'text-amber-700'
                      : 'text-slate-700'
                  }`}
                >
                  {totalDelta > 0 ? `+${totalDelta}` : totalDelta} kg
                </span>
              </div>
            </div>

            <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Rango Registrado
              </span>
              <span className="text-xs font-bold text-slate-700">
                Mín {minWeight} kg · Máx {maxWeight} kg
              </span>
              {idealWeightKg && (
                <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                  Meta ideal: {idealWeightKg} kg
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Info className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
          <span>Registra al menos una consulta para visualizar el gráfico de evolución.</span>
        </div>
      )}
    </div>
  );
};
