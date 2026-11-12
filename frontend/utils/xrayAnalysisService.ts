import { AnalysisResult, PatientVitals } from '../types';
import { apiRequest } from './apiClient';
import { generateMockAnalysisResult } from './mockService';
import { isDemoMode } from '@/lib/config';

/**
 * F.3 Perform Clinical Analysis, client side.
 *
 * Demo mode: the mock model runs in the browser (no backend).
 * Connected mode: the local inference service runs F.3.1 (CNN) and F.3.2
 * (knowledge base refinement and ranking). F.3.3 Evaluate Analysis
 * Availability is enforced here: a failed request or no result within
 * ANALYSIS_TIMEOUT_MS throws, and the caller shows the analysis unavailable
 * notice (IO.12, SR13). There is no silent fallback to mock results in
 * connected mode.
 */
export const ANALYSIS_TIMEOUT_MS = 60_000;

export async function analyzeXray(image?: File, vitals?: PatientVitals): Promise<AnalysisResult> {
  if (!image || !vitals) {
    throw new Error('Both image and vitals are required');
  }

  if (isDemoMode()) {
    console.log('[X-ray Service] Demo mode: mock model in the browser');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return generateMockAnalysisResult(vitals);
  }

  const formData = new FormData();
  formData.append('image', image);
  if (vitals.birthdate) formData.append('birthdate', vitals.birthdate);
  if (vitals.gender) formData.append('gender', vitals.gender);
  if (vitals.systolicBP) formData.append('systolicBP', vitals.systolicBP.toString());
  if (vitals.diastolicBP) formData.append('diastolicBP', vitals.diastolicBP.toString());
  if (vitals.temperature) formData.append('temperature', vitals.temperature.toString());
  if (vitals.heartRate) formData.append('heartRate', vitals.heartRate.toString());
  if (vitals.hasCough !== undefined) formData.append('hasCough', vitals.hasCough.toString());
  if (vitals.hasHeadaches !== undefined) formData.append('hasHeadaches', vitals.hasHeadaches.toString());
  if (vitals.canSmellTaste !== undefined) formData.append('canSmellTaste', vitals.canSmellTaste.toString());

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Analysis timed out after 60 seconds')), ANALYSIS_TIMEOUT_MS);
  });

  try {
    const response = await Promise.race([
      apiRequest<AnalysisResult>({
        endpoint: '/api/upload-scan',
        method: 'POST',
        body: formData,
        formData: true,
        requiresAuth: true,
      }),
      timeout,
    ]);
    if (response.error) {
      throw response.error;
    }
    return response.data as AnalysisResult;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const analyzeAndSubmit = analyzeXray;
