import type { PatientVitals } from '@/types';
import type { Prediction } from './predictions';

/**
 * Local-only case history.
 *
 * Reviews are kept in the browser's localStorage on the clinician's
 * workstation. Nothing here is synchronised to a server, which matches the
 * DeepSee privacy boundary: PHI stays local.
 */

export type DecisionStatus = 'accepted' | 'rejected' | 'indeterminate';

export interface ClinicianDecision {
  status: DecisionStatus;
  note?: string;
  recordedAt: string;
}

export interface StoredCase {
  id: string;
  createdAt: string;
  topLabel: string;
  topConfidence: number;
  predictions: Prediction[];
  vitals: PatientVitals | null;
  /** Downscaled JPEG data URL of the submitted image. */
  thumbnail: string;
  /** The full result payload so the case can be reopened. */
  result: Record<string, any>;
  decision?: ClinicianDecision;
}

const STORAGE_KEY = 'deepsee.cases.v1';
export const MAX_CASES = 12;

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function newCaseId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function shortCaseId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export function listCases(): StoredCase[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredCase[]) : [];
  } catch (error) {
    console.warn('Could not read local case history:', error);
    return [];
  }
}

function writeCases(cases: StoredCase[]): boolean {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases.slice(0, MAX_CASES)));
    return true;
  } catch (error) {
    // Most likely a quota error; drop the oldest case and retry once.
    if (cases.length > 1) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases.slice(0, cases.length - 1)));
        return true;
      } catch {
        /* fall through */
      }
    }
    console.warn('Could not write local case history:', error);
    return false;
  }
}

export function getCase(id: string): StoredCase | undefined {
  return listCases().find((item) => item.id === id);
}

/** Inserts or replaces a case and keeps the newest MAX_CASES entries. */
export function saveCase(entry: StoredCase): boolean {
  const others = listCases().filter((item) => item.id !== entry.id);
  return writeCases([entry, ...others]);
}

export function updateCaseDecision(id: string, decision: ClinicianDecision): boolean {
  const cases = listCases();
  const index = cases.findIndex((item) => item.id === id);
  if (index === -1) return false;
  cases[index] = { ...cases[index], decision };
  return writeCases(cases);
}

export function deleteCase(id: string): boolean {
  return writeCases(listCases().filter((item) => item.id !== id));
}

export function clearCases(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Produces a downscaled JPEG data URL for a same-origin or blob image URL so
 * the case can be stored and reopened after the original object URL expires.
 */
export function makeThumbnail(src: string, maxSize = 640, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Thumbnails can only be generated in the browser'));
      return;
    }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Canvas is not available'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Could not encode thumbnail'));
      }
    };
    image.onerror = () => reject(new Error('Could not load image for thumbnail'));
    image.src = src;
  });
}

export function decisionLabel(status: DecisionStatus | undefined): string {
  switch (status) {
    case 'accepted':
      return 'Suggestion accepted';
    case 'rejected':
      return 'Suggestion rejected';
    case 'indeterminate':
      return 'Marked indeterminate';
    default:
      return 'Awaiting clinician decision';
  }
}
