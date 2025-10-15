import { createServer } from 'node:http';
import { parse } from 'node:url';

const PORT = 8080;
const BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:8080';

const ADDON_CONFIG = {
  ADDON_KEY: 'xcfe.example',
  ADDON_NAME: 'xCustom Field Expander',
  BASE_URL,
  MIN_PLAN: 'FREE'
};

const manifest = {
  schemaVersion: '1.3',
  key: ADDON_CONFIG.ADDON_KEY,
  name: ADDON_CONFIG.ADDON_NAME,
  baseUrl: ADDON_CONFIG.BASE_URL,
  description:
    'xCustom Field Expander (xCFE) automatically evaluates mathematical formulas, conditional logic, and validation rules for Clockify time entries. Configure formulas to compute amounts, categorize entries, validate data integrity, and maintain consistent custom field values across your workspace.',
  minimalSubscriptionPlan: 'PRO',
  scopes: [
    'TIME_ENTRY_READ',
    'TIME_ENTRY_WRITE',
    'USER_READ',
    'PROJECT_READ',
    'TASK_READ',
    'CUSTOM_FIELDS_READ',
    'WORKSPACE_READ'
  ],
  components: [
    {
      type: 'sidebar',
      accessLevel: 'EVERYONE',
      path: '/ui/sidebar',
      label: 'xCFE'
    }
  ],
  settings: JSON.stringify({
    tabs: [
      {
        id: 'general',
        name: 'General Settings',
        description: 'Configure general xCFE behavior',
        fields: [
          {
            key: 'enableAutoFormulas',
            type: 'TXT',
            label: 'Enable Auto Formulas',
            description: 'Automatically evaluate formulas on time entry changes',
            required: false,
            defaultValue: 'true'
          }
        ]
      }
    ]
  }),
  lifecycle: [
    { type: 'INSTALLED', path: '/lifecycle/installed' },
    { type: 'STATUS_CHANGED', path: '/lifecycle/status' },
    { type: 'SETTINGS_UPDATED', path: '/lifecycle/settings' },
    { type: 'DELETED', path: '/lifecycle/deleted' }
  ],
  webhooks: []
};

const customFields = [
  { id: 'cf_billable_total', name: 'Billable total', type: 'NUMBER' },
  { id: 'cf_cost_code', name: 'Cost code', type: 'TEXT' },
  { id: 'cf_phase', name: 'Project phase', type: 'DROPDOWN' },
  { id: 'cf_quality', name: 'Quality score', type: 'NUMBER' }
];

const workspaceState = {
  workspaceId: 'xcfe-demo',
  strictMode: true,
  referenceMonths: 3,
  region: 'use2',
  formulas: [
    { targetId: 'cf_billable_total', expr: 'hours * rate' },
    { targetId: 'cf_cost_code', expr: "project?.category ?? 'GEN'" }
  ],
  lastSavedAt: new Date().toISOString()
};

const lookupMap = Object.fromEntries(customFields.map(field => [field.id, field.name]));

const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const sendHtml = (res, html) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
};

const readJsonBody = req =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1e6) {
        reject(new Error('Payload too large'));
        req.socket.destroy();
      }
    });
    req.on('end', () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });

const sidebarHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>xCFE · Formula Command Center</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      color-scheme: light;
      --gradient: linear-gradient(140deg, #0f172a 0%, #1d4ed8 50%, #2563eb 100%);
      --card-bg: rgba(255, 255, 255, 0.96);
      --accent: #2563eb;
      --accent-strong: #1d4ed8;
      --text-muted: #475569;
      --text-strong: #0f172a;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--gradient);
      min-height: 100vh;
      color: var(--text-strong);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 20px;
    }
    main {
      width: 100%;
      max-width: 360px;
      background: var(--card-bg);
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 28px 80px -40px rgba(15, 23, 42, 0.6);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(37, 99, 235, 0.14);
      color: var(--accent);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    h1 {
      margin: 16px 0 8px;
      font-size: 1.6rem;
      line-height: 1.3;
    }
    .lede {
      margin: 0 0 20px;
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    #snapshot { margin: 0 0 20px; }
    .pill-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .pill-list li {
      padding: 14px 16px;
      background: #f8fafc;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .pill-list li strong { font-size: 0.95rem; }
    .pill-list li span {
      color: var(--text-muted);
      font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
      font-size: 0.82rem;
    }
    .empty, .error {
      padding: 18px;
      border-radius: 16px;
      background: #f1f5f9;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .cta {
      width: 100%;
      border: none;
      border-radius: 18px;
      padding: 14px 18px;
      background: var(--accent);
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 12px 30px -12px rgba(37, 99, 235, 0.6);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      margin-bottom: 18px;
    }
    .cta:hover { transform: translateY(-1px); box-shadow: 0 16px 36px -18px rgba(37, 99, 235, 0.55); }
    .checklist { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 8px; }
    .checklist h2 {
      font-size: 0.95rem;
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }
    .checklist ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .checklist li span { margin-right: 8px; }
    footer {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.78rem;
      color: #64748b;
    }
    footer .value {
      font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <main>
    <div class="badge">Live workspace</div>
    <h1>Formula command center</h1>
    <p class="lede">Keep Clockify custom fields aligned in real-time with automation, guardrails, and proactive insights.</p>
    <section id="snapshot">
      <div class="empty">Fetching live status…</div>
    </section>
    <button id="openSettings" class="cta">Open Formula Studio →</button>
    <div class="checklist">
      <h2>Next best actions</h2>
      <ul>
        <li><span>⚙️</span> Review active automation rules before the next sprint.</li>
        <li><span>⚡️</span> Trigger an on-demand recompute after importing time entries.</li>
        <li><span>🛡️</span> Confirm strict mode is aligned with finance QA checkpoints.</li>
      </ul>
    </div>
    <footer>
      <span class="footnote">Base URL</span>
      <span class="value">${ADDON_CONFIG.BASE_URL}</span>
    </footer>
  </main>
  <script>
    (function(){
      const params = new URLSearchParams(window.location.search);
      const authToken = params.get('auth_token');
      const headers = authToken ? { Authorization: 'Bearer ' + authToken } : {};

      function withAuth(path) {
        const url = new URL(path, window.location.origin);
        if (authToken) {
          url.searchParams.set('auth_token', authToken);
        }
        return url;
      }

      function renderSnapshot(payload) {
        const container = document.getElementById('snapshot');
        const formulas = Array.isArray(payload.formulas) ? payload.formulas : [];
        if (!formulas.length) {
          container.innerHTML = '<div class="empty">No formulas yet. Launch Formula Studio to create your first automation.</div>';
          return;
        }

        const items = formulas.slice(0, 3).map(formula => {
          const label = payload.lookup && payload.lookup[formula.targetId] ? payload.lookup[formula.targetId] : formula.targetId;
          return '<li><strong>' + label + '</strong><span>' + formula.expr + '</span></li>';
        }).join('');

        const saved = payload.lastSavedAt ? new Date(payload.lastSavedAt).toLocaleString() : 'just now';
        container.innerHTML = '<ul class="pill-list">' + items + '</ul><p class="meta" style="margin-top:12px;color:#475569;font-size:0.82rem;">Last saved <strong>' + saved + '</strong></p>';
      }

      async function loadSnapshot() {
        try {
          const response = await fetch(withAuth('/v1/settings'), { headers });
          if (!response.ok) throw new Error('HTTP ' + response.status);
          const data = await response.json();
          renderSnapshot(data);
        } catch (error) {
          document.getElementById('snapshot').innerHTML = '<div class="error">Unable to load current settings. Open Formula Studio to diagnose.</div>';
        }
      }

      document.getElementById('openSettings').addEventListener('click', () => {
        window.location.href = withAuth('/ui/settings').toString();
      });

      loadSnapshot();
    })();
  <\/script>
</body>
</html>`;

const settingsHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>xCFE · Formula Studio</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      color-scheme: light;
      --bg: #0f172a;
      --panel: #ffffff;
      --border: #e2e8f0;
      --accent: #2563eb;
      --accent-strong: #1d4ed8;
      --text: #0f172a;
      --muted: #475569;
      --success: #047857;
      --warning: #c2410c;
      --error: #b91c1c;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: radial-gradient(circle at top, rgba(37, 99, 235, 0.25), rgba(15, 23, 42, 0.9));
      min-height: 100vh;
      color: var(--text);
      display: flex;
      justify-content: center;
      padding: 32px;
    }
    main {
      width: 100%;
      max-width: 960px;
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
    .card {
      background: var(--panel);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 30px 70px -50px rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .card h1, .card h2 {
      margin-top: 0;
      line-height: 1.3;
    }
    .hero h1 { font-size: 1.6rem; margin-bottom: 8px; }
    .hero p { color: var(--muted); margin: 0 0 16px; }
    .hero ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; color: var(--muted); }
    label { display: block; font-weight: 600; margin-bottom: 8px; }
    select, textarea, input[type="number"], input[type="text"] {
      width: 100%;
      border-radius: 14px;
      border: 1px solid var(--border);
      padding: 10px 12px;
      font-size: 0.95rem;
      background: #f8fafc;
      transition: border-color 0.15s ease;
    }
    select:focus, textarea:focus, input:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15); }
    textarea { min-height: 96px; font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace; }
    .hint { font-size: 0.8rem; color: var(--muted); margin-top: 6px; }
    .mini-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); margin-top: 12px; align-items: end; }
    button.primary {
      background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
      color: white;
      border: none;
      border-radius: 16px;
      padding: 12px 18px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 18px 40px -20px rgba(37, 99, 235, 0.7);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    button.primary:hover { transform: translateY(-1px); box-shadow: 0 22px 48px -24px rgba(37, 99, 235, 0.65); }
    button.secondary, button.ghost {
      border-radius: 14px;
      border: 1px solid var(--border);
      background: #f8fafc;
      color: var(--muted);
      padding: 10px 14px;
      font-weight: 600;
      cursor: pointer;
    }
    button.secondary:hover, button.ghost:hover { border-color: var(--accent); color: var(--accent); }
    .toolbar { display: flex; gap: 12px; justify-content: flex-end; margin-top: 18px; }
    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .formula-list { display: flex; flex-direction: column; gap: 14px; }
    .formula-card {
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      background: #f8fafc;
      display: grid;
      gap: 10px;
    }
    .formula-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(37, 99, 235, 0.12);
      color: var(--accent-strong);
      font-weight: 600;
      font-size: 0.82rem;
    }
    .formula-card pre {
      margin: 0;
      font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
      font-size: 0.9rem;
      background: #e2e8f0;
      padding: 10px 12px;
      border-radius: 12px;
      overflow-x: auto;
    }
    .formula-card button {
      justify-self: flex-start;
    }
    .empty {
      border: 1px dashed var(--border);
      border-radius: 16px;
      padding: 18px;
      text-align: center;
      color: var(--muted);
      background: rgba(248, 250, 252, 0.6);
    }
    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-radius: 20px;
      background: rgba(15, 23, 42, 0.04);
      font-size: 0.92rem;
      color: var(--muted);
      gap: 16px;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .status-bar[data-tone="success"] { color: var(--success); border-color: rgba(4, 120, 87, 0.35); }
    .status-bar[data-tone="warning"] { color: var(--warning); border-color: rgba(194, 65, 12, 0.35); }
    .status-bar[data-tone="error"] { color: var(--error); border-color: rgba(185, 28, 28, 0.4); }
    .actions { display: flex; gap: 12px; }
    @media (max-width: 720px) {
      body { padding: 18px; }
      .toolbar { flex-direction: column; align-items: stretch; }
      .actions { flex-direction: column; }
    }
  </style>
</head>
<body>
  <main>
    <section class="card hero" style="grid-column: 1 / -1;">
      <h1>Formula Studio</h1>
      <p>Design, preview, and deploy calculations that instantly keep your Clockify custom fields accurate. Every change is validated, timestamped, and ready for on-demand recomputes.</p>
      <ul>
        <li>✨ Build reusable automations with one click.</li>
        <li>🧪 Preview outputs using sample data before saving.</li>
        <li>📊 Trigger Evaluate Now runs to backfill historical entries.</li>
      </ul>
    </section>

    <section class="card" id="editor">
      <h2>Create a formula</h2>
      <label for="fieldSelect">Target custom field</label>
      <select id="fieldSelect"></select>

      <label for="exprInput" style="margin-top:16px;">Expression</label>
      <textarea id="exprInput" placeholder="hours * rate"></textarea>
      <p class="hint">Available variables: <code>hours</code>, <code>rate</code>, <code>amount</code>, <code>project</code>, <code>tags['Label']</code></p>

      <div class="mini-grid">
        <label>
          Sample hours
          <input type="number" id="sampleHours" value="8" min="0" step="0.25" />
        </label>
        <label>
          Sample rate
          <input type="number" id="sampleRate" value="120" min="0" step="1" />
        </label>
        <button type="button" id="previewFormula" class="secondary">Preview output</button>
      </div>
      <div id="previewResult" class="hint" style="margin-top:12px;"></div>

      <div class="toolbar">
        <button type="button" id="addFormula" class="secondary">Add to playbook</button>
      </div>
    </section>

    <section class="card" id="playbook">
      <div class="list-header">
        <h2>Active formula playbook</h2>
        <button type="button" id="clearAll" class="ghost">Clear all</button>
      </div>
      <div id="formulaList" class="formula-list"></div>
    </section>

    <section class="card status-bar" data-tone="muted" style="grid-column: 1 / -1;">
      <span id="statusMessage">Loading workspace settings…</span>
      <div class="actions">
        <button type="button" id="runRecompute" class="ghost">Evaluate now</button>
        <button type="button" id="saveChanges" class="primary">Save changes</button>
      </div>
    </section>
  </main>

  <script>
    (function(){
      const params = new URLSearchParams(window.location.search);
      const authToken = params.get('auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = 'Bearer ' + authToken;
      }

      const fieldSelect = document.getElementById('fieldSelect');
      const exprInput = document.getElementById('exprInput');
      const formulaList = document.getElementById('formulaList');
      const statusMessage = document.getElementById('statusMessage');
      const previewResult = document.getElementById('previewResult');

      let fields = [];
      let formulas = [];
      let dirty = false;

      function withAuth(path) {
        const url = new URL(path, window.location.origin);
        if (authToken) {
          url.searchParams.set('auth_token', authToken);
        }
        return url;
      }

      function setStatus(message, tone = 'muted') {
        statusMessage.textContent = message;
        statusMessage.parentElement.dataset.tone = tone;
      }

      function setPreview(message, tone = 'muted') {
        previewResult.textContent = '';
        previewResult.innerHTML = message;
        previewResult.style.color = tone === 'success' ? 'var(--success)' : tone === 'error' ? 'var(--error)' : 'var(--muted)';
      }

      function renderFieldOptions() {
        fieldSelect.innerHTML = fields
          .map(field =>
            '<option value="' +
            field.id +
            '">' +
            field.name +
            ' · ' +
            field.type +
            '</option>'
          )
          .join('');
      }

      function renderFormulas() {
        if (!formulas.length) {
          formulaList.innerHTML = '<div class="empty">No formulas yet. Add one above to start automating.</div>';
          return;
        }

        formulaList.innerHTML = formulas
          .map((formula, index) => {
            const field = fields.find(f => f.id === formula.targetId);
            const label = field ? field.name : formula.targetId;
            return [
              '<article class="formula-card">',
              '  <span class="formula-pill">' + label + '</span>',
              '  <pre>' + formula.expr.replace(/</g, '&lt;') + '</pre>',
              '  <button type="button" class="ghost" data-index="' + index + '">Remove</button>',
              '</article>'
            ].join('');
          })
          .join('');

        formulaList.querySelectorAll('button[data-index]').forEach(button => {
          button.addEventListener('click', event => {
            const idx = Number(event.currentTarget.dataset.index);
            formulas.splice(idx, 1);
            renderFormulas();
            markDirty();
          });
        });
      }

      function markDirty() {
        if (!dirty) {
          dirty = true;
        }
        setStatus('Unsaved changes', 'warning');
      }

      async function bootstrap() {
        try {
          setStatus('Loading workspace settings…');
          const [fieldsResponse, settingsResponse] = await Promise.all([
            fetch(withAuth('/v1/cf/fields'), { headers }),
            fetch(withAuth('/v1/settings'), { headers })
          ]);

          if (!fieldsResponse.ok) throw new Error('Unable to fetch custom fields');
          if (!settingsResponse.ok) throw new Error('Unable to fetch settings');

          fields = await fieldsResponse.json();
          const settings = await settingsResponse.json();
          formulas = Array.isArray(settings.formulas) ? [...settings.formulas] : [];

          renderFieldOptions();
          renderFormulas();

          if (settings.lastSavedAt) {
            setStatus('Last saved ' + new Date(settings.lastSavedAt).toLocaleString(), 'success');
          } else {
            setStatus('Ready to create your first formula', 'success');
          }
        } catch (error) {
          setStatus(error.message ?? 'Unable to load settings', 'error');
        }
      }

      function addFormula() {
        const targetId = fieldSelect.value;
        const expr = exprInput.value.trim();

        if (!targetId) {
          setPreview('Select a target custom field first.', 'error');
          return;
        }
        if (!expr) {
          setPreview('Enter an expression before adding to the playbook.', 'error');
          return;
        }

        formulas.push({ targetId, expr });
        exprInput.value = '';
        renderFormulas();
        setPreview('Added to playbook.', 'success');
        markDirty();
      }

      async function saveSettings() {
        try {
          const payload = { formulas: formulas.map(({ targetId, expr }) => ({ targetId, expr })) };
          const response = await fetch(withAuth('/v1/settings'), {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });

          if (!response.ok) throw new Error('Save failed (HTTP ' + response.status + ')');

          const result = await response.json();
          dirty = false;
          setStatus('Saved at ' + new Date(result.savedAt ?? Date.now()).toLocaleTimeString(), 'success');
        } catch (error) {
          setStatus(error.message ?? 'Unable to save changes', 'error');
        }
      }

      async function runRecompute() {
        try {
          const now = new Date();
          const payload = {
            start: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
            end: now.toISOString()
          };
          const response = await fetch(withAuth('/v1/formulas/recompute'), {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error('Evaluate now failed');
          const result = await response.json();
          setStatus('Queued ' + result.evaluated + ' formulas · ' + result.updated + ' updates', 'success');
        } catch (error) {
          setStatus(error.message ?? 'Unable to evaluate', 'error');
        }
      }

      function previewFormula() {
        const expr = exprInput.value.trim();
        if (!expr) {
          setPreview('Enter an expression to preview.', 'error');
          return;
        }
        const scope = {
          hours: Number(document.getElementById('sampleHours').value || '0'),
          rate: Number(document.getElementById('sampleRate').value || '0'),
          amount: Number(document.getElementById('sampleHours').value || '0') * Number(document.getElementById('sampleRate').value || '0')
        };
        try {
          // eslint-disable-next-line no-new-func
          const evaluator = new Function(...Object.keys(scope), 'return ' + expr + ';');
          const result = evaluator(...Object.values(scope));
          setPreview('Sample output: <strong>' + (Number(result).toFixed(2)) + '</strong>', 'success');
        } catch (error) {
          setPreview('Preview error: ' + (error instanceof Error ? error.message : 'invalid expression'), 'error');
        }
      }

      document.getElementById('addFormula').addEventListener('click', addFormula);
      document.getElementById('saveChanges').addEventListener('click', saveSettings);
      document.getElementById('runRecompute').addEventListener('click', runRecompute);
      document.getElementById('clearAll').addEventListener('click', () => {
        formulas = [];
        renderFormulas();
        markDirty();
      });
      document.getElementById('previewFormula').addEventListener('click', previewFormula);

      bootstrap();
    })();
  <\/script>
</body>
</html>`;

const handleRequest = async (req, res) => {
  const { pathname } = parse(req.url ?? '/', true);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/manifest' || pathname === '/manifest.json') {
    sendJson(res, 200, manifest);
    return;
  }

  if (pathname === '/v1/sites/health') {
    sendJson(res, 200, {
      status: 'ok',
      workspaceId: workspaceState.workspaceId,
      baseUrl: ADDON_CONFIG.BASE_URL,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (pathname === '/v1/me') {
    sendJson(res, 200, {
      isAdmin: true,
      workspaceId: workspaceState.workspaceId,
      userId: 'xcfe-owner'
    });
    return;
  }

  if (pathname === '/v1/cf/fields') {
    sendJson(res, 200, customFields);
    return;
  }

  if (pathname === '/v1/settings') {
    if (req.method === 'GET') {
      sendJson(res, 200, {
        workspaceId: workspaceState.workspaceId,
        strict_mode: workspaceState.strictMode,
        reference_months: workspaceState.referenceMonths,
        region: workspaceState.region,
        lastSavedAt: workspaceState.lastSavedAt,
        formulas: workspaceState.formulas,
        lookup: lookupMap
      });
      return;
    }

    if (req.method === 'POST') {
      try {
        const payload = await readJsonBody(req);
        if (!Array.isArray(payload.formulas)) {
          sendJson(res, 400, { error: 'invalid_payload', message: 'formulas must be an array' });
          return;
        }

        const sanitized = payload.formulas
          .filter(item => item && typeof item.targetId === 'string' && item.targetId.trim() && typeof item.expr === 'string' && item.expr.trim())
          .map(item => ({ targetId: item.targetId.trim(), expr: item.expr.trim() }));

        workspaceState.formulas = sanitized;
        workspaceState.lastSavedAt = new Date().toISOString();

        sendJson(res, 200, {
          ok: true,
          savedAt: workspaceState.lastSavedAt,
          formulas: workspaceState.formulas
        });
      } catch (error) {
        sendJson(res, 400, { error: 'invalid_payload', message: error instanceof Error ? error.message : 'Malformed JSON body' });
      }
      return;
    }
  }

  if (pathname === '/v1/formulas/recompute' && req.method === 'POST') {
    const evaluated = workspaceState.formulas.length;
    const updated = evaluated ? Math.max(1, Math.round(evaluated * 0.6)) : 0;
    sendJson(res, 200, {
      evaluated,
      updated,
      durationMs: 450 + Math.floor(Math.random() * 400),
      startedAt: new Date().toISOString()
    });
    return;
  }

  if (pathname?.startsWith('/lifecycle/')) {
    console.log('🎯 Lifecycle event:', pathname, req.method);
    sendJson(res, 200, { success: true });
    return;
  }

  if (pathname === '/ui/sidebar') {
    sendHtml(res, sidebarHtml());
    return;
  }

  if (pathname === '/ui/settings') {
    sendHtml(res, settingsHtml());
    return;
  }

  sendJson(res, 200, {
    name: 'xCustom Field Expander API',
    version: '1.0.0',
    manifest: `${ADDON_CONFIG.BASE_URL}/manifest.json`
  });
};

const server = createServer((req, res) => {
  handleRequest(req, res).catch(error => {
    console.error('Request failed', error);
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'internal_error', message: error instanceof Error ? error.message : 'Unknown error' });
    } else {
      res.end();
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 xCFE Addon Server running on http://localhost:${PORT}`);
  console.log(`📋 Manifest URL: ${BASE_URL}/manifest.json`);
  console.log(`❤️ Health Check: ${BASE_URL}/v1/sites/health`);
  console.log('Ready for Clockify Developer Portal! 🎯');
});
