/**
 * DeepSee Chapter 11 — Alternative B shared-inference measurement spike.
 *
 * Measures image-acceptance-to-result-display time through the real browser UI
 * while the Django inference service runs on a separate hospital-LAN host.
 *
 * Required environment:
 *   SHARED_API_URL=http://<server-lan-ip>:8000
 * Optional:
 *   BASE_URL=http://localhost:3000
 *   ALT_B_RUNS=30
 *   E2E_CHANNEL=msedge   (or chrome; set empty to use Playwright Chromium)
 *
 * Output:
 *   deepsee_alt_b_measured_timings.csv
 *   deepsee_alt_b_summary.json
 */

const fs = require('node:fs');
const path = require('node:path');
const { createHash, randomBytes } = require('node:crypto');
const { performance } = require('node:perf_hooks');
const { chromium } = require('playwright');

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const API = (process.env.SHARED_API_URL || '').replace(/\/+$/, '');
const TOPOLOGY = process.env.ALT_B_TOPOLOGY || 'operator-specified';
const BACKEND_ROUTE = API + '/api/upload-scan';
const RUNS = Number(process.env.ALT_B_RUNS || 30);
const WARMUPS = 3;
const CHANNEL = process.env.E2E_CHANNEL === undefined ? 'msedge' : (process.env.E2E_CHANNEL || undefined);

if (!API) throw new Error('Set SHARED_API_URL, e.g. http://192.168.1.50:8000');
if (!Number.isInteger(RUNS) || RUNS < 1) throw new Error('ALT_B_RUNS must be a positive integer');

const sampleDir = path.resolve(__dirname, '..', 'assets', 'x-ray-images');
const samples = ['00000001_001.png', '00000001_002.png', '00000002_000.png', '00000003_000.png']
  .map(name => ({ name, file: path.join(sampleDir, name) }));
for (const s of samples) {
  s.sha256 = createHash('sha256').update(fs.readFileSync(s.file)).digest('hex');
}

const username = 'altb_' + randomBytes(5).toString('hex');
const password = randomBytes(18).toString('hex') + 'Aa1!';
const email = username + '@example.test';

async function apiPost(endpoint, body) {
  return fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    redirect: 'error',
  });
}

function nearestRankP95(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil(0.95 * sorted.length) - 1);
  return sorted[index];
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

let browser;
(async () => {
  // Create a disposable synthetic account directly on the shared service.
  const signup = await apiPost('/auth/signup/', { username, email, password });
  if (signup.status !== 201) {
    const detail = await signup.text().catch(() => '');
    throw new Error(`Shared-service signup failed: HTTP ${signup.status} ${detail.slice(0, 200)}`);
  }

  const executablePath = process.env.E2E_CHROMIUM_PATH;
  browser = await chromium.launch(executablePath
    ? { executablePath, headless: true, args: ['--disable-dev-shm-usage', '--no-proxy-server'] }
    : { channel: CHANNEL, headless: true });
  const browserVersion = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  // Sign in through the real browser UI so the test covers the connected workspace.
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/analyze', { timeout: 15000 });
  page.setDefaultTimeout(15000);
  const caseIds = new Set();

  const rows = [];
  const total = RUNS + WARMUPS;

  for (let i = 0; i < total; i++) {
    const sample = samples[i % samples.length];
    const isWarmup = i < WARMUPS;

    // Start each trial from a clean analysis page while preserving authentication.
    await page.goto(`${BASE}/analyze`, { waitUntil: 'networkidle' });
    await page.getByText('Add diagnostic imaging').waitFor({ timeout: 15000 });

    await page.setInputFiles('input[type="file"]', sample.file);
    const preview = page.getByRole('img', { name: 'X-ray preview', exact: true });
    await preview.waitFor();

    // Timing boundary: image accepted/previewed -> ranked result displayed.
    const acceptedAt = performance.now();
    const previewUrl = await preview.getAttribute('src');

    await page.getByRole('button', { name: /Continue to patient context/ }).click();
    await page.getByText('Add patient context').waitFor();
    await page.fill('#birthdate', '1962-04-15');
    await page.selectOption('#gender', 'male');
    await page.fill('#temperature', '38.6');
    await page.fill('#heartRate', '104');
    await page.fill('#systolicBP', '128');
    await page.fill('#diastolicBP', '84');
    await page.check('#hasCough');
    await page.getByRole('button', { name: 'Save patient context' }).click();
    await page.getByText('Patient context saved').waitFor();
    await page.getByRole('button', { name: /Review case/ }).click();
    await page.getByText('Review before analysis').waitFor();

    const responsePromise = page.waitForResponse(
      response => response.url() === BACKEND_ROUTE && response.request().method() === 'POST',
      { timeout: 60000 }
    );
    responsePromise.catch(() => {});

    let httpStatus = null;
    let modelVersion = '';
    let success = false;
    let error = '';

    try {
      await page.getByRole('button', { name: /Run clinical analysis/ }).click();
      const response = await responsePromise;
      httpStatus = response.status();
      let payload = null;
      try { payload = await response.json(); } catch {}
      modelVersion = payload?.modelVersion || '';

      await page.waitForURL('**/result', { timeout: 60000 });
      const ranked = page.getByRole('heading', { name: 'Ranked differential', exact: true });
      await ranked.waitFor({ timeout: 60000 });
      const displayedAt = performance.now();
      const elapsedMs = displayedAt - acceptedAt;

      const validPayload = httpStatus === 201 && modelVersion === 'cnn-pneumonia-v1'
        && Array.isArray(payload?.predictions) && payload.predictions.length > 0
        && payload.predictions.every(item => typeof item.label === 'string' && item.label.length > 0
          && Number.isFinite(item.confidence) && item.confidence >= 0 && item.confidence <= 1);
      const resultCaseId = await page.evaluate(() => sessionStorage.getItem('caseId'));
      const resultImage = await page.getByRole('img', { name: 'Chest X-ray under review' }).getAttribute('src');
      const displayedImageHash = await page.evaluate(async url => {
        if (!url?.startsWith('blob:')) return '';
        const data = await (await fetch(url)).arrayBuffer();
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
      }, resultImage);
      const currentCase = previewUrl && resultImage === previewUrl && displayedImageHash === sample.sha256
        && resultCaseId && !caseIds.has(resultCaseId);
      if (resultCaseId) caseIds.add(resultCaseId);
      const resultSection = ranked.locator('xpath=ancestor::section[1]');
      const displayedPrediction = validPayload && await resultSection
        .getByText(payload.predictions[0].label, { exact: true }).isVisible();
      success = Boolean(validPayload && currentCase && displayedPrediction);
      error = success ? '' : 'Could not verify the model response, submitted image, or displayed case';

      if (!isWarmup) {
        rows.push({
          run: rows.length + 1,
          sample: sample.name,
          http_status: httpStatus,
          model_version: modelVersion,
          image_acceptance_to_display_ms: Number(elapsedMs.toFixed(3)),
          success,
          error,
        });
      }

      console.log(`${isWarmup ? 'WARMUP' : 'RUN'} ${isWarmup ? i + 1 : rows.length}/${isWarmup ? WARMUPS : RUNS}: ${sample.name} ${elapsedMs.toFixed(1)} ms HTTP ${httpStatus} ${success ? 'OK' : 'FAIL'}`);
    } catch (e) {
      error = String(e).split('\n')[0];
      if (!isWarmup) {
        rows.push({
          run: rows.length + 1,
          sample: sample.name,
          http_status: httpStatus ?? '',
          model_version: modelVersion,
          image_acceptance_to_display_ms: '',
          success: false,
          error,
        });
      }
      console.error(`${isWarmup ? 'WARMUP' : 'RUN'} failed: ${error}`);
    }
  }

  await browser.close();

  const successful = rows.filter(r => r.success && Number.isFinite(r.image_acceptance_to_display_ms));
  const timings = successful.map(r => Number(r.image_acceptance_to_display_ms));
  const p95Ms = nearestRankP95(timings);
  const completionRate = rows.length ? (successful.length / rows.length) * 100 : 0;

  const csvColumns = ['run', 'sample', 'http_status', 'model_version', 'image_acceptance_to_display_ms', 'success', 'error'];
  const csv = [csvColumns.join(','), ...rows.map(row => csvColumns.map(k => csvEscape(row[k])).join(','))].join('\n') + '\n';
  const csvPath = path.resolve(process.cwd(), 'deepsee_alt_b_measured_timings.csv');
  fs.writeFileSync(csvPath, csv);

  const summary = {
    alternative: 'B — Shared Inference Prototype',
    topology: TOPOLOGY,
    browser_version: browserVersion,
    timing_boundary: 'image accepted/preview visible -> Ranked differential displayed',
    warmups: WARMUPS,
    measured_runs: rows.length,
    successful_runs: successful.length,
    completion_rate_percent: Number(completionRate.toFixed(2)),
    p95_acceptance_to_display_ms_nearest_rank: p95Ms == null ? null : Number(p95Ms.toFixed(3)),
    p95_acceptance_to_display_seconds: p95Ms == null ? null : Number((p95Ms / 1000).toFixed(3)),
    model: 'cnn-pneumonia-v1',
    shared_api_url: API,
    frontend_url: BASE,
    test_images: samples.map(s => s.name),
    patient_context: 'fixed synthetic context; sequential single-request trials',
    note: 'Course-project prototype spike. Do not use real patient data.',
  };
  const summaryPath = path.resolve(process.cwd(), 'deepsee_alt_b_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n');

  console.log('\n=== Alternative B summary ===');
  console.log(JSON.stringify(summary, null, 2));
  console.log(`CSV: ${csvPath}`);
  console.log(`Summary: ${summaryPath}`);

  if (successful.length !== rows.length) process.exitCode = 2;
})().catch(async error => {
  await browser?.close().catch(() => {});
  console.error(error);
  process.exitCode = 1;
});
