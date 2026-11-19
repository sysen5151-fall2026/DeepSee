const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const { once } = require('node:events');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../lib/config.ts'), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});

function config(env) {
  const exports = {};
  vm.runInNewContext(outputText, { exports, process: { env }, URL });
  return exports;
}

function workstation(apiUrl) {
  return config({
    NEXT_PUBLIC_DEPLOYMENT_PROFILE: 'workstation-local',
    NEXT_PUBLIC_API_URL: apiUrl,
  });
}

test('workstation profile is connected with an omitted API origin', () => {
  assert.equal(workstation().getApiBaseUrl(), 'http://localhost:8000');
  assert.equal(workstation().isDemoMode(), false);
});

test('workstation profile accepts only HTTP(S) loopback origins', () => {
  assert.equal(workstation('HTTP://127.0.0.1:8000/').getApiBaseUrl(), 'http://127.0.0.1:8000');
  assert.equal(workstation('https://[::1]:8000').getApiBaseUrl(), 'https://[::1]:8000');
  for (const origin of [
    'demo', 'http://192.0.2.10:8000', 'http://localhost.example.test',
    'http://localhost@example.test', 'http://localhost:65536',
    'http://localhost/path', 'http://localhost/?q=1', 'http://localhost/#fragment',
    'file://localhost',
  ]) {
    assert.throws(() => workstation(origin).getApiBaseUrl(), /loopback API origin/i, origin);
  }
});

test('unselected profile preserves the existing demo and connected modes', () => {
  assert.equal(config({}).isDemoMode(), true);
  const existing = config({ NEXT_PUBLIC_API_URL: 'http://192.0.2.10:8000/' });
  assert.equal(existing.getApiBaseUrl(), 'http://192.0.2.10:8000');
  assert.equal(existing.isDemoMode(), false);
});

test('workstation API does not resend a POST body to a redirect target', async () => {
  let initial = 0;
  let redirected = 0;
  const server = http.createServer((req, res) => {
    req.resume();
    if (req.url === '/initial') {
      initial++;
      res.writeHead(307, { Location: '/redirected' }).end();
    } else {
      redirected++;
      res.writeHead(200).end('unexpected redirect');
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const compile = (file, context) => {
      const exports = {};
      const code = fs.readFileSync(path.join(__dirname, file), 'utf8');
      const compiled = ts.transpileModule(code, {
        compilerOptions: { module: ts.ModuleKind.CommonJS },
      });
      vm.runInNewContext(compiled.outputText, { exports, ...context });
      return exports;
    };
    const base = workstation('http://127.0.0.1:' + server.address().port);
    const errors = compile('../utils/errorHandling.ts', { Error });
    const client = compile('../utils/apiClient.ts', {
      require: key => {
        if (key === '@/lib/config') return base;
        if (key === './errorHandling') return errors;
        throw new Error('Unexpected import: ' + key);
      },
      fetch, Headers, Error,
      console: { log() {}, error() {} },
    });
    const response = await client.apiRequest({
      endpoint: '/initial',
      method: 'POST', body: { fixture: true }, requiresAuth: false, retries: 0,
      signal: AbortSignal.timeout(2000),
    });
    assert.equal(initial, 1);
    assert.equal(redirected, 0);
    assert.equal(response.data, null);
    assert.equal(response.error?.name, 'NetworkError');
  } finally {
    server.close();
  }
});
