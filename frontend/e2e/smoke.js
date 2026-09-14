/* End-to-end smoke test for the DeepSee demo flow.
 *
 * Drives a real browser through sign-in, imaging upload, patient context,
 * analysis, decision capture, and reopening the case from local history, and
 * saves screenshots along the way.
 *
 * Usage (workspace running in demo mode on http://localhost:3000):
 *   npm run build && npm run start          # in one terminal
 *   npm run e2e                             # in another
 *
 * Environment:
 *   BASE_URL      default http://localhost:3000
 *   SHOT_DIR      default e2e/shots
 *   SAMPLE_XRAY   default assets/x-ray-images/00000001_001.png
 *   E2E_CHANNEL   Playwright browser channel, default "msedge" (use "chrome",
 *                 or unset with E2E_CHANNEL="" after `npx playwright install chromium`)
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = process.env.SHOT_DIR || path.resolve(__dirname, 'shots');
const SAMPLE = process.env.SAMPLE_XRAY || path.resolve(__dirname, '..', 'assets', 'x-ray-images', '00000001_001.png');
const CHANNEL = process.env.E2E_CHANNEL === undefined ? 'msedge' : process.env.E2E_CHANNEL || undefined;

fs.mkdirSync(OUT, { recursive: true });

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

(async () => {
  const browser = await chromium.launch({ channel: CHANNEL, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  const shot = (name, opts = {}) => page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });

  try {
    // Overview
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    check('overview renders', await page.getByRole('heading', { name: /See the diagnosis/i }).isVisible());
    check('header shows demo badge', await page.getByText('Demo mode · mock model').first().isVisible());
    await shot('overview');

    // Login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    check('login shows demo notice', await page.getByText('No inference service is connected').isVisible());
    await shot('login');
    await page.fill('#username', 'dr.rivera');
    await page.fill('#password', 'demo-password-123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/analyze', { timeout: 15000 });
    check('sign-in redirects to analyze', page.url().endsWith('/analyze'));
    await page.getByText('Add diagnostic imaging').waitFor();
    await shot('analyze-imaging');

    // Upload
    await page.setInputFiles('input[type="file"]', SAMPLE);
    await page.locator('img[alt="X-ray preview"]').waitFor();
    check('image preview appears', true);
    await page.getByRole('button', { name: /Continue to patient context/ }).click();
    await page.getByText('Add patient context').waitFor();

    // Vitals
    await page.fill('#birthdate', '1962-04-15');
    await page.selectOption('#gender', 'male');
    await page.fill('#temperature', '38.6');
    await page.fill('#heartRate', '104');
    await page.fill('#systolicBP', '128');
    await page.fill('#diastolicBP', '84');
    await page.check('#hasCough');
    await shot('analyze-context');
    await page.getByRole('button', { name: 'Save patient context' }).click();
    await page.getByText('Patient context saved').waitFor();
    check('vitals saved', true);
    await page.getByRole('button', { name: /Review case/ }).click();
    await page.getByText('Review before analysis').waitFor();
    await shot('analyze-review');

    // Analysis
    await page.getByRole('button', { name: /Run clinical analysis/ }).click();
    await page.waitForURL('**/result', { timeout: 30000 });
    await page.getByRole('heading', { name: 'Ranked differential' }).waitFor();
    const summary = await page.locator('h2').filter({ hasText: /leading model suggestion|No major abnormality/ }).first().textContent();
    check('result page shows clinical summary', !!summary, summary?.trim());
    const differentialCount = await page.locator('section:has(h2:text-is("Ranked differential")) .font-black').count();
    check('ranked differential has entries', differentialCount > 0, `${differentialCount} rows`);
    await page.getByText('Saved locally').waitFor({ timeout: 10000 });
    check('case saved to local history', true);
    await page.waitForTimeout(1200);
    const overlayBadge = await page.locator('text=/Attention regions|Saliency approximation|No focal attention/').first().isVisible();
    check('attention overlay status shown', overlayBadge);
    await shot('result', { fullPage: true });

    // Decision
    await page.getByRole('button', { name: /Accept suggestion/ }).click();
    await page.fill('#decision-note', 'Correlates with fever and productive cough. Ordering CBC and blood cultures.');
    await page.getByRole('button', { name: 'Record decision' }).click();
    await page.getByText('Suggestion accepted').waitFor();
    check('decision recorded', true);
    await shot('result-decision', { fullPage: true });

    // History
    await page.goto(`${BASE}/cases`, { waitUntil: 'networkidle' });
    const cards = await page.locator('article').count();
    check('recent reviews lists the case', cards === 1, `${cards} card(s)`);
    check('history shows decision badge', await page.getByText('Suggestion accepted').first().isVisible());
    await shot('cases');
    await page.getByRole('button', { name: 'Open review' }).first().click();
    await page.waitForURL('**/result', { timeout: 15000 });
    await page.getByText('Suggestion accepted').waitFor();
    check('reopened case keeps decision', true);

    // Public pages
    await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
    check('about renders', await page.getByText('System boundaries').first().isVisible());
    await shot('about', { fullPage: true });
    await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
    check('support renders diagnostics', await page.getByText('Session diagnostics').isVisible());
    await shot('support');

    // Sign out
    await page.goto(`${BASE}/analyze`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Account menu' }).hover();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL('**/login', { timeout: 15000 });
    check('sign out returns to login', true);

    // Register (only reachable when signed out)
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    check('register renders', await page.getByRole('button', { name: /Create clinician account/ }).isVisible());
    await shot('register');

    // Protected route redirects when signed out
    await page.goto(`${BASE}/cases`, { waitUntil: 'networkidle' });
    await page.waitForURL('**/login', { timeout: 15000 });
    check('protected route redirects to login when signed out', true);
  } catch (error) {
    check('flow completed without exception', false, String(error).split('\n')[0]);
    await shot('failure', { fullPage: true }).catch(() => {});
  }

  const relevantConsole = consoleErrors.filter((t) => !/favicon|sw\.js|service worker/i.test(t));
  check('no page errors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 300));
  check('no console errors', relevantConsole.length === 0, relevantConsole.join(' | ').slice(0, 300));

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots in ${OUT}`);
  process.exit(failed.length ? 1 : 0);
})();
