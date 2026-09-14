/**
 * Runtime configuration for the DeepSee clinician workspace.
 *
 * Demo mode (no backend) is the default. Set NEXT_PUBLIC_API_URL to the
 * local inference service (for example http://localhost:8000) to run in
 * connected mode. Any value containing the word "demo" also forces demo mode.
 */

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.2.0-prototype';

export const REPO_URL = 'https://github.com/sysen5151-fall2026/DeepSee';

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
}

export function isDemoMode(): boolean {
  const apiUrl = getApiBaseUrl();
  if (!apiUrl) return true;
  return apiUrl.toLowerCase().includes('demo');
}

export function getModeLabel(): 'Demo mode' | 'Connected' {
  return isDemoMode() ? 'Demo mode' : 'Connected';
}
