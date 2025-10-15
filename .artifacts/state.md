# Session State Digest

## Completed (Steps 0-5)
- ✅ Repo sanity: commit 95c154e, node v20.19.4, pnpm 8.15.1
- ✅ Public host: https://9e5a48f11537.ngrok-free.app
- ✅ Manifest baseUrl matches PUBLIC_HOST
- ✅ `/version` returns correct JSON with baseUrl
- ✅ `/ui/formulas` serves React SPA correctly
- ✅ GET `/v1/formulas/recompute` → 405 JSON
- ✅ POST `/v1/formulas/recompute` with empty body → 400 with Zod details
- ✅ POST `/lifecycle/settings` invalid → 400 with Zod details
- ✅ POST `/lifecycle/settings` valid → 200
- ✅ Tests: 71/71 passing (70 API + 1 UI)

## Current Issues (from user specs)
1. **Recompute validates body BEFORE JWT**: Should validate JWT first → 401 on missing/invalid
2. **No credential cascade**: After JWT validation, should cascade: iframe → installation → env
3. **No JSON enforcement**: Upstream non-JSON should return 502
4. **No CF validation**: Should verify CF_CALC_HOURS_ID exists and is numeric type
5. **No debug/lifecycle tracking**: Need `/debug/last-lifecycle` endpoint

## Files Modified (previous session)
- `apps/api/src/controllers/formulasController.ts`: Reordered validation (body before JWT)
- `apps/api/src/controllers/lifecycleController.ts`: Added Zod schema validation
- `apps/api/src/routes/formulas.ts`: Added GET handler for 405

## Blocked
- Steps 6-7 (E2E recompute + read-back): No REAL_IFRAME_JWT until add-on installed in Clockify

## Next Actions (per user plan)
1. Create `/debug/last-lifecycle` endpoint
2. Fix recompute controller: JWT validation FIRST, then body
3. Implement credential cascade after JWT validation
4. Add upstream JSON enforcement
5. Add `/v1/cf/fields` endpoint for CF listing/validation
6. Create install runbook
7. Wait for user to install add-on and provide iframe request
