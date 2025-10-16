# Reports API & Backfill Usage

## Backfill Service (apps/api/src/services/backfillService.ts)

### Date Range Constraint
- Maximum: 366 days (line 61)
- Validation: throws error if daysDiff > 366

### Reports API Call (line 288)
```typescript
report = await clockifyClient.getDetailedReport(
  workspaceId,
  {
    dateRangeStart: windowStart.toISOString(),
    dateRangeEnd: windowEnd.toISOString(),
    users: userIds ? { ids: userIds } : undefined,
    page: currentPage,
    pageSize: 200 // Capped at 200 in clockifyClient.ts
  },
  correlationId,
  ctx?.authToken,
  ctx?.baseUrlOverride
);
```

### Implementation Notes
- Calls clockifyClient.getDetailedReport()
- Includes detailedFilter object (required for PRO plan workspaces)
- pageSize capped at 200 (API maximum)
- Pagination handled with page parameter
- Uses authToken from ctx (installation token or override)
- baseUrlOverride allows region-specific reporting URL

### Manifest Plan Requirement
- minimalSubscriptionPlan: "PRO" (infra/manifest.json:33)
- Reports API requires PRO plan or higher

### Region Derivation
- reportsBaseUrl derived from backendUrl via transformation:
  - api.clockify.me → reports.api.clockify.me
  - euc1-api.clockify.me → euc1-reports.api.clockify.me
  - etc.
- baseUrlOverride from JWT backendUrl claim

## Security & Auth
- authToken from installation lifecycle or memory cache
- X-Addon-Token header used for Reports API auth
- No separate API key for Reports (uses addon token)

## Rate Limiting
- RateLimitError handling in backfill with retry
- Reports API calls wrapped in rateLimiter.schedule()
- Per-workspace rate limit key

## Code References
- backfillService.ts:288 - getDetailedReport call
- clockifyClient.ts:234 - getDetailedReport implementation
- clockifyClient.ts:82 - detailedFilter body structure
