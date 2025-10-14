fix(proxy,ui): proxy auth cascade, error forwarding; UI token refresh; tests + artifacts

Summary
- Proxy controller:
  - Accept iframe auth_token; cascade to env ADDON_TOKEN, env API_KEY, then DB installationToken; else 403 (prod) or [] (dev).
  - Build user-scoped URL: /v1/workspaces/<ws>/user/<user>/time-entries with start/end; never leak tokens into URL/logs.
  - Forward upstream errors (429 with Retry-After, 401/403 pass-through body snippet); 502 on upstream error; correlationId in responses.
- UI controller:
  - Token refresh posts { title: 'refreshAddonToken' }; handles addonTokenRefreshed/addonTokenRefreshedFailed; shows small toast badge.
  - Settings: double-decode structured config; JS-only form; save via /v1/settings preserving auth_token; friendly parse error card.
- Redirect: preserve all query params for /^/%7B → /ui/settings/<encoded>.
- Tests: restored/expanded proxy coverage; added JSDOM sidebar token tests.
- Config: vitest ESM already; added jsdom dev dep for UI tests.

Evidence
- Typecheck: .artifacts/typecheck.api.txt
- Tests: .artifacts/tests.txt (e.g., “Test Files 9 passed (9), Tests 63 passed (63)”) 
- Migrations: .artifacts/migrate.txt (schema applied)
- Dev URLs (tmux): API http://localhost:8080, Admin UI http://localhost:5174/

Manual probes
- Direct user probe:
  curl -sS -H 'X-Addon-Token: <ADDON_TOKEN>' '<BACKEND_BASE>/v1/user' | jq .
- Proxy probe:
  curl -i 'http://localhost:8080/v1/proxy/time-entries?start=<ISO>&end=<ISO>&auth_token=<IFRAME_AUTH_TOKEN>'
- 429 forwarding: run vitest focused on 'forwards 429 with Retry-After'; expect Retry-After header echoed by proxy.

Risks
- Admin UI port may shift from 5173 → 5174 if occupied (Vite auto-selects).
- Requires Postgres client (psql) and local DB (xcfe_dev) with role xcfe.
