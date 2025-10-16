#!/usr/bin/env node
/**
 * Doctor script - validates environment, manifest reachability, and basic health
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const base = process.env.BASE_URL || 'https://clockify-xcfe-git-main-alexs-projects-a9be258a.vercel.app';
const results = {};

function get(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ code: res.statusCode, data, headers: res.headers }));
    }).on('error', (err) => resolve({ code: 0, error: err.message }));
  });
}

async function main() {
  console.log('xCFE Doctor - Environment & Deployment Health Check\n');

  // 1. Check environment variables
  console.log('1. Environment Variables');
  const requiredEnvVars = [
    'BASE_URL',
    'CLOCKIFY_PUBLIC_KEY_PEM',
    'ADDON_KEY',
    'WORKSPACE_ID',
    'ENCRYPTION_KEY'
  ];
  const kvEnvVars = ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'KV_URL'];

  const envCheck = {};
  for (const key of requiredEnvVars) {
    const val = process.env[key];
    envCheck[key] = val ? (val.length > 30 ? `set (${val.length} chars)` : 'set') : 'MISSING';
  }

  // Check KV configuration (need either KV_REST_API_URL+TOKEN or KV_URL)
  const kvConfigured = !!(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    process.env.KV_URL
  );
  envCheck['KV_CONFIGURED'] = kvConfigured ? 'YES' : 'NO';
  for (const key of kvEnvVars) {
    const val = process.env[key];
    if (val) {
      envCheck[key] = val.length > 30 ? `set (${val.length} chars)` : 'set';
    }
  }

  results.env = envCheck;
  console.table(envCheck);

  // 2. Check manifest endpoint
  console.log('\n2. Manifest Endpoint');
  const manifestUrl = `${base}/manifest`;
  const manifestRes = await get(manifestUrl);
  results.manifest = {
    url: manifestUrl,
    status: manifestRes.code,
    ok: manifestRes.code === 200
  };
  if (manifestRes.code === 200) {
    try {
      const manifest = JSON.parse(manifestRes.data);
      results.manifest.name = manifest.name || 'N/A';
      results.manifest.version = manifest.version || 'N/A';
      console.log(`✓ Manifest reachable (${manifestRes.code}): ${manifest.name} v${manifest.version}`);
    } catch (e) {
      console.log(`✗ Manifest parse error: ${e.message}`);
      results.manifest.parseError = e.message;
    }
  } else {
    console.log(`✗ Manifest unreachable (${manifestRes.code}): ${manifestRes.error || manifestRes.data.substring(0, 100)}`);
  }

  // 3. Check health endpoint
  console.log('\n3. Health Endpoint');
  const healthUrl = `${base}/health`;
  const healthRes = await get(healthUrl);
  results.health = {
    url: healthUrl,
    status: healthRes.code,
    ok: healthRes.code === 200
  };
  if (healthRes.code === 200) {
    try {
      const health = JSON.parse(healthRes.data);
      console.log(`✓ Health check OK (${healthRes.code}):`, health);
      results.health.data = health;
    } catch (e) {
      console.log(`✗ Health parse error: ${e.message}`);
    }
  } else {
    console.log(`✗ Health check failed (${healthRes.code})`);
  }

  // 4. Check lifecycle endpoints (GET probes)
  console.log('\n4. Lifecycle Endpoints (GET probes)');
  const lifecycleRoutes = ['installed', 'status-changed', 'settings-updated', 'updated', 'uninstalled'];
  results.lifecycle = {};
  for (const route of lifecycleRoutes) {
    const url = `${base}/v1/lifecycle/${route}`;
    const res = await get(url);
    const ok = res.code === 200;
    results.lifecycle[route] = { status: res.code, ok };
    console.log(`  ${ok ? '✓' : '✗'} ${route}: ${res.code}`);
  }

  // 5. Check local install state
  console.log('\n5. Local Install State');
  const statePath = path.resolve(process.cwd(), '.state', 'install.json');
  if (fs.existsSync(statePath)) {
    try {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      results.installState = state;
      console.log(`✓ Install state found:`, state);
    } catch (e) {
      console.log(`✗ Install state parse error: ${e.message}`);
    }
  } else {
    console.log(`  No install state at ${statePath}`);
    results.installState = null;
  }

  // 6. Summary
  console.log('\n=== Summary ===');
  const allOk = results.manifest?.ok && results.health?.ok && Object.values(results.lifecycle || {}).every(r => r.ok);
  console.log(allOk ? '✓ All checks passed' : '✗ Some checks failed');
  console.log('\nFull results:');
  console.log(JSON.stringify(results, null, 2));

  process.exit(allOk ? 0 : 1);
}

main().catch(err => {
  console.error('Doctor script error:', err);
  process.exit(2);
});
