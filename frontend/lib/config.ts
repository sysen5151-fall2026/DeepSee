/**
 * Runtime configuration for the DeepSee clinician workspace.
 *
 * Demo mode (no backend) is the default. Set NEXT_PUBLIC_API_URL to the
 * local inference service (for example http://localhost:8000) to run in
 * connected mode. The workstation-local profile requires a loopback service.
 */

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.2.0-prototype';

export const REPO_URL = 'https://github.com/sysen5151-fall2026/DeepSee';

export function isWorkstationLocal(): boolean {
  return process.env.NEXT_PUBLIC_DEPLOYMENT_PROFILE === 'workstation-local';
}

export function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!isWorkstationLocal()) return raw.replace(/\/+$/, '');

  const local = raw || 'http://localhost:8000';
  const error = 'The workstation-local profile requires an HTTP(S) loopback API origin.';
  if (!/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]+)?\/?$/i.test(local)) {
    throw new Error(error);
  }
  try {
    return new URL(local).origin;
  } catch {
    throw new Error(error);
  }
}

export function isDemoMode(): boolean {
  const apiUrl = getApiBaseUrl();
  if (!apiUrl) return true;
  return apiUrl.toLowerCase().includes('demo');
}

export function getModeLabel(): 'Demo mode' | 'Connected' {
  return isDemoMode() ? 'Demo mode' : 'Connected';
}
