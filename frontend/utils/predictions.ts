import type { PatientVitals } from '@/types';

/**
 * Shared helpers for turning any result payload (mock service, legacy flat
 * backend format, or the structured backend format) into a ranked
 * differential the UI can render consistently.
 */

export interface Prediction {
  label: string;
  confidence: number;
}

export const HIGH_RISK_THRESHOLD = 0.7;
export const NORMAL_THRESHOLD = 0.3;

const META_KEYS = new Set([
  'age',
  'topPrediction',
  'predictions',
  'heatmapUrl',
  'regions',
  'severity',
  'diagnosisWithVitals',
  'treatmentSuggestions',
  'vitals',
  'success',
  'error',
  'imageModel',
  'modelVersion',
  'processedAt',
  'caseId',
]);

export function normalizeConfidence(value: unknown): number {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1, numeric > 1 ? numeric / 100 : numeric));
}

export function isNormalLabel(label: string): boolean {
  return label.trim().toLowerCase() === 'normal';
}

/**
 * The legacy backend returns only {"Covid-19": p, "Pneumonia": p, "age": n}.
 * When both probabilities are low, add an explicit "Normal" entry so the
 * differential still has a leading suggestion to show.
 */
export function normalizeResult(data: Record<string, any>): Record<string, any> {
  const processed = { ...data };
  if (Array.isArray(data.predictions) && data.predictions.length) return processed;

  const covid = normalizeConfidence(data['Covid-19'] ?? data['COVID-19'] ?? 0);
  const pneumonia = normalizeConfidence(data.Pneumonia ?? 0);
  if (covid < NORMAL_THRESHOLD && pneumonia < NORMAL_THRESHOLD) {
    const highest = Math.max(covid, pneumonia);
    processed.Normal = Math.max(normalizeConfidence(data.Normal ?? 0), Math.min(0.99, highest + 0.1), 0.9);
  }
  return processed;
}

export function extractPredictions(result: Record<string, any> | null | undefined): Prediction[] {
  if (!result) return [];

  if (Array.isArray(result.predictions) && result.predictions.length) {
    return result.predictions
      .map((p: any) => ({ label: String(p.label), confidence: normalizeConfidence(p.confidence) }))
      .sort((a: Prediction, b: Prediction) => b.confidence - a.confidence);
  }

  const entries = Object.entries(result)
    .filter(([key, value]) => !META_KEYS.has(key) && typeof value === 'number')
    .map(([label, confidence]) => ({ label, confidence: normalizeConfidence(confidence) }));

  if (!entries.length && result.topPrediction) {
    entries.push({
      label: String(result.topPrediction.label),
      confidence: normalizeConfidence(result.topPrediction.confidence),
    });
  }

  return entries.sort((a, b) => b.confidence - a.confidence);
}

/** Highest confidence among non-normal findings (0 when nothing abnormal). */
export function topAbnormalConfidence(predictions: Prediction[]): number {
  return predictions
    .filter((prediction) => !isNormalLabel(prediction.label))
    .reduce((max, prediction) => Math.max(max, prediction.confidence), 0);
}

export function calculateAge(birthdate: string): number {
  const today = new Date();
  const birthDate = new Date(birthdate);
  if (Number.isNaN(birthDate.getTime())) return 0;
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

export function listSymptoms(vitals: PatientVitals): string[] {
  return [
    vitals.hasCough ? 'cough' : null,
    vitals.hasHeadaches ? 'headache' : null,
    vitals.canSmellTaste === false ? 'loss of smell/taste' : null,
  ].filter(Boolean) as string[];
}

export function summarizeVitals(vitals: PatientVitals): string {
  const symptoms = listSymptoms(vitals);
  return `Temperature ${vitals.temperature} °C, heart rate ${vitals.heartRate} bpm, blood pressure ${vitals.systolicBP}/${vitals.diastolicBP} mmHg${
    symptoms.length ? `; reported ${symptoms.join(', ')}` : ''
  }.`;
}
