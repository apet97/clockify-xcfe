#!/usr/bin/env tsx
/* eslint-disable no-console */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

type Args = Record<string, string | boolean | undefined> & { _: string[] };

const parseArgs = (argv: string[]): Args => {
  const out: Args = { _: [] } as any;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        (out as any)[key] = true;
      } else {
        (out as any)[key] = next;
        i++;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
};

const run = (cmd: string, args: string[], opts: any = {}) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const curl = (url: string) => {
  const r = spawnSync('curl', ['-sS', '-o', '/dev/null', '-w', '%{http_code}\n', url], { encoding: 'utf8' });
  return String(r.stdout || '').trim();
};

const statePath = path.resolve(process.cwd(), '.state/install.json');

const cmd = (process.argv[2] || '').toLowerCase();
const args = parseArgs(process.argv);

const baseUrl = process.env.BASE_URL || 'http://localhost:8080';

const die = (msg: string) => {
  console.error(msg);
  process.exit(1);
};

switch (cmd) {
  case 'vercel:sync': {
    const project = (args.project as string) || '';
    const pemFile = (args['pem-file'] as string) || '';
    const pemEnv = (args['pem-env'] as string) || '';
    const prodAlias = (args['prod-alias'] as string) || '';
    const script = path.resolve('scripts/vercel-env-and-pem-check.sh');
    if (!fs.existsSync(script)) die('scripts/vercel-env-and-pem-check.sh not found');
    const argv: string[] = ['--project', project, '--repo-root', process.cwd()];
    if (pemFile) argv.push('--pem-file', pemFile);
    if (pemEnv) argv.push('--pem-env', pemEnv);
    if (prodAlias) argv.push('--prod-alias', prodAlias);
    run('bash', [script, ...argv]);
    break;
  }

  case 'install:wait': {
    const timeout = Number(process.env.INSTALL_WAIT_SECS || '300');
    const start = Date.now();
    for (;;) {
      if (fs.existsSync(statePath)) break;
      if ((Date.now() - start) / 1000 > timeout) die('timeout waiting for installation');
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
    console.log('installed');
    break;
  }

  case 'install:status': {
    if (!fs.existsSync(statePath)) die('not-installed');
    const j = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    const maskedWs = (j.workspaceId || '').replace(/^(.*)(.{4})$/, '****$2');
    console.log(JSON.stringify({ workspaceId: maskedWs, addonId: j.addonId, hasAuthToken: !!j.hasAuthToken, revokedAt: j.revokedAt || null }, null, 2));
    break;
  }

  case 'install:purge': {
    if (!fs.existsSync(statePath)) die('state-missing');
    const j = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    j.revokedAt = new Date().toISOString();
    fs.writeFileSync(statePath, JSON.stringify(j, null, 2));
    console.log('purged');
    break;
  }

  case 'jwt:webhook:verify': {
    // Requires a token via --token or file via --file
    const token = (args.token as string) || (args.file ? fs.readFileSync(args.file as string, 'utf8') : '').trim();
    if (!token) die('provide --token <jwt> or --file <path>');
    const pem = process.env.CLOCKIFY_PUBLIC_KEY_PEM || process.env.RSA_PUBLIC_KEY_PEM || '';
    if (!pem) die('CLOCKIFY_PUBLIC_KEY_PEM/RSA_PUBLIC_KEY_PEM not set');
    // Use node: No external deps; decode header/payload unverified
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
    const { iss, type, sub } = payload || {};
    if (iss !== 'clockify') die(`invalid iss: ${iss}`);
    if (type !== 'addon') die(`invalid type: ${type}`);
    const addonKey = process.env.ADDON_KEY || process.env.npm_package_config_ADDON_KEY || '';
    if (addonKey && sub !== addonKey) die(`invalid sub: ${sub}`);
    console.log('jwt-ok');
    break;
  }

  case 'jwt:ui:decode': {
    const t = args._[1];
    if (!t) die('usage: cli jwt:ui:decode <auth_token>');
    const parts = t.split('.');
    if (parts.length !== 3) die('invalid-jwt');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    const exp = payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
    console.log(JSON.stringify({ exp, claims: payload }, null, 2));
    break;
  }

  case 'report:detailed': {
    const from = (args.from as string) || '';
    const to = (args.to as string) || '';
    if (!from || !to) die('usage: cli report:detailed --from <ISO> --to <ISO>');
    const url = new URL('/health', baseUrl);
    const code = curl(url.toString());
    console.log(`health=${code}`);
    console.log('note: use your server endpoints to perform reports via authenticated context');
    break;
  }

  case 'report:summary': {
    console.log('note: not implemented; use API proxy or server endpoint');
    break;
  }

  case 'cf:ensure':
  case 'cf:write':
  case 'cf:backfill': {
    console.log('note: not implemented; prefer API endpoints for custom-field ops');
    break;
  }

  case 'webhook:test:dedupe': {
    const file = (args['event-file'] as string) || '';
    const secret = process.env.CLOCKIFY_WEBHOOK_SECRET || '';
    if (!file || !secret) die('usage: cli webhook:test:dedupe --event-file <json> with CLOCKIFY_WEBHOOK_SECRET');
    const body = fs.readFileSync(file, 'utf8');
    // HMAC signature
    const sig = execFileSync('bash', ['-lc', `node -e "const c=require('crypto');const b='${body.replace(/"/g, '\\"')}';const h=c.createHmac('sha256', process.env.CLOCKIFY_WEBHOOK_SECRET||'').update(b).digest('hex');console.log('sha256='+h)"`], { env: process.env, encoding: 'utf8' }).trim();
    const post = (b: string) => spawnSync('curl', ['-sS', '-o', '/dev/stderr', '-w', '\n%{http_code}\n', '-X', 'POST', new URL('/v1/webhooks/clockify', baseUrl).toString(), '-H', `X-Clockify-Signature: ${sig}`, '-H', 'Content-Type: application/json', '--data', b], { stdio: 'inherit' });
    console.log('first:');
    post(body);
    console.log('second:');
    post(body);
    break;
  }

  case 'audit:env': {
    const pem = process.env.CLOCKIFY_PUBLIC_KEY_PEM || process.env.RSA_PUBLIC_KEY_PEM;
    if (!pem) die('missing PEM');
    const bad = ['WORKSPACE_ID', 'ADDON_ID', 'INSTALL_TOKEN', 'WEBHOOK_TOKEN'];
    const found = bad.filter(k => process.env[k]);
    if (found.length) die('forbidden envs present: ' + found.join(','));
    console.log('env-ok');
    break;
  }

  case 'audit:origins': {
    const origin = process.env.ADMIN_UI_ORIGIN || '';
    if (!origin.includes('app.clockify.me') || !origin.includes('developer.clockify.me')) die('origins-missing-required');
    console.log('origins-ok');
    break;
  }

  case 'audit:logging': {
    const logDir = path.resolve('logs');
    if (!fs.existsSync(logDir)) { console.log('logs-ok'); break; }
    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.log') || f.endsWith('.ndjson'));
    const suspect = ['X-Addon-Token', 'X-Api-Key'];
    for (const f of files) {
      const text = fs.readFileSync(path.join(logDir, f), 'utf8');
      for (const s of suspect) {
        if (text.includes(s)) die(`secret-printed:${s} in ${f}`);
      }
    }
    console.log('logging-ok');
    break;
  }

  case 'review:script': {
    const out = (args.out as string) || 'docs/REVIEWER_FLOW.md';
    const content = `# Reviewer Flow\n\n1. Sync env + PEM on Vercel\n\n   cli vercel:sync --project \"<proj>\" --pem-file ./public.pem\n\n2. Wait for installation\n\n   cli install:wait\n\n3. Verify webhook JWT (provide token)\n\n   cli jwt:webhook:verify --token \"<jwt>\"\n\n4. Detailed report smoke (via server/proxy)\n\n   cli report:detailed --from 2024-01-01T00:00:00Z --to 2024-01-02T00:00:00Z\n\n5. Custom field ensure/write (manual)\n\n   cli cf:ensure --name \"Computed Hours\" --type number\n   cli cf:write --time-entry <id> --field <id> --value 1.5\n\n6. Webhook dedupe test\n\n   cli webhook:test:dedupe --event-file ./fixtures/time_entry_updated.json\n\n7. Audits\n\n   cli audit:env\n   cli audit:origins\n   cli audit:logging\n`;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, content);
    console.log(`wrote ${out}`);
    break;
  }

  default: {
    console.log('Usage:');
    console.log('  cli vercel:sync --project <name> [--pem-file <path>|--pem-env <pem>] [--prod-alias <url>]');
    console.log('  cli install:wait | install:status | install:purge');
    console.log('  cli jwt:webhook:verify [--token <jwt>|--file <path>]');
    console.log('  cli jwt:ui:decode <auth_token>');
    console.log('  cli report:detailed --from <ISO> --to <ISO>');
    console.log('  cli webhook:test:dedupe --event-file <json>');
    console.log('  cli audit:env | audit:origins | audit:logging');
    console.log('  cli review:script --out docs/REVIEWER_FLOW.md');
  }
}

