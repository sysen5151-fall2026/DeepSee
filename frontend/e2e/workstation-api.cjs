// Smoke check of a local test instance. Creates a disposable synthetic account.
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

const api = 'http://127.0.0.1:8000';
const names = ['00000001_001.png', '00000001_002.png', '00000002_000.png', '00000003_000.png'];
const sampleDir = path.join(__dirname, '../assets/x-ray-images');
const username = 'localcheck_' + randomBytes(5).toString('hex');
const password = randomBytes(20).toString('hex') + 'Aa!';

async function auth(endpoint, fields) {
  return fetch(api + '/auth/' + endpoint + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
    redirect: 'error',
  });
}

async function main() {
  const signup = await auth('signup', { username, email: username + '@example.test', password });
  assert.equal(signup.status, 201, 'Synthetic account signup failed');
  const login = await auth('login', { username, password });
  assert.equal(login.status, 200, 'Synthetic account login failed');
  const token = (await login.json()).access_token;
  assert(token, 'No access token from local API');
  const rounds = Number(process.env.WORKSTATION_CHECK_RUNS || 3);
  assert(Number.isInteger(rounds) && rounds > 0);
  const fixtures = names.map(name => [name, fs.readFileSync(path.join(sampleDir, name))]);
  const results = [];
  for (let n = 0; n < rounds + 3; n++) {
    const [name, bytes] = fixtures[n % fixtures.length];
    const body = new FormData();
    body.append('image', new Blob([bytes], { type: 'image/png' }), name);
    for (const [k, v] of Object.entries({
      birthdate: '1962-04-15', gender: 'male', temperature: '38.6', heartRate: '104',
      systolicBP: '128', diastolicBP: '84', hasCough: 'true', hasHeadaches: 'false',
      canSmellTaste: 'true',
    })) body.append(k, v);

    const start = performance.now();
    const response = await fetch(api + '/api/upload-scan', {
      method: 'POST', headers: { Authorization: 'Bearer ' + token }, body, redirect: 'error',
    });
    assert.equal(response.status, 201, 'Expected successful loopback inference');
    const result = await response.json();
    const milliseconds = performance.now() - start;
    assert.equal(result.modelVersion, 'cnn-pneumonia-v1');
    assert(result.predictions.length > 0);
    assert(result.predictions.every(x =>
      x.label && Number.isFinite(x.confidence) && x.confidence >= 0 && x.confidence <= 1
    ));
    if (n >= 3) results.push({ sample: name, status: response.status, milliseconds });
  }
  console.log(JSON.stringify({ warmups: 3, model: 'cnn-pneumonia-v1', results }));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
