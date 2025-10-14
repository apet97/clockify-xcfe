# ADDON_GUIDE
- `manifest.json` must define `schemaVersion`, unique `key`, descriptive `name`, and `baseUrl` that hosts all iframe assets.
- Add-on UIs render inside Clockify `<iframe>` elements with an appended `auth_token` query parameter for JWT-based context.
- Authentication model issues Installation Tokens, short-lived User Tokens, and Webhook Signature tokens; each JWT carries `backendUrl` and `workspaceId` claims.
- Developers are responsible for hosting APIs, databases, and web servers; Clockify supplies only the manifest loader and iframe container.
- Backend services must validate JWT `iss`, `sub`, and `exp` claims before using workspace-scoped data or API routes.
- Webhooks are registered in the manifest and deliver event payloads that should be validated and idempotently processed.
- Error handling should normalize HTTP errors (400, 401, 403, 404, 500) and display actionable messaging inside the iframe UI.
- Security checklist highlights HTTPS-only `baseUrl`, strict CSP headers, least-privilege scopes, and secret storage outside source control.

# Official Clockify Dev Docs
- Marketplace lifecycle requires handling `/install`, `/settings`, and `/uninstall` callbacks defined in the manifest `lifecycle` block.
- Manifest builder `ClockifyManifest.v1_3Builder()` sets fields like `.key()`, `.name()`, `.baseUrl()`, `.scopes(List.of(ClockifyScope.TIME_ENTRY_READ))`.
- Components are declared via `manifest.components` array with `location`, `access`, `path`, and `label` attributes.
- JWTs include region-specific `backendUrl` claim to route API calls such as `GET /v1/user` and `GET /v1/workspaces/{workspaceId}/time-entries`.
- Credential cascade flows: iframe JWT → installation token → add-on service token → optional Clockify API key fallback.
- Rate limits require respecting `Retry-After` headers and exponential backoff when Clockify responds with `429 Too Many Requests`.
- Structured settings use JSON payloads exchanged through `GET/POST /settings` with enforced schema definitions.
- Manifest `webhooks` entries provide `eventType` and `targetUrl` fields for registering event subscriptions.

# Manifest Lifecycle SDK
- `ClockifyComponent.builder().sidebar().allowEveryone().path("/sidebar-component").label("Time Reports")` defines a sidebar iframe entry.
- Components resolve to `GET {baseUrl}{path}` and must serve HTML/JS assets with embedded iframe messaging handlers.
- SDK emits window events (`clockify:addon:token:refresh`) for refreshing `auth_token` without reloading the iframe.
- Lifecycle SDK helpers emit typed events like `settings:save` and `settings:close` for settings cards embedded inside Clockify UI.
- Manifest Lifecycle SDK enforces schema versioning (`schemaVersion: "1.3"`) and validates required scopes before publishing.
- Webhook helpers provide signature verification utilities that expect `x-clockify-signature` headers and canonical payload hashing.
- Component mounting occurs through `AddonRuntime.mountComponent({ elementId, component })` with automatic JWT retrieval.

# GitHub SDK Examples
- Java example declares Maven dependency `<groupId>com.cake.clockify</groupId><artifactId>addon-sdk</artifactId><version>1.4.0</version>`.
- GitHub Packages host `addon-java-sdk`; authentication requires configuring the `https://maven.pkg.github.com/clockify/addon-java-sdk` repository.
- Example manifest builder uses chained setters plus `.build()` to emit a JSON manifest hosted on a developer-controlled endpoint.
- Sample UI fetches iframe `auth_token` via `new URLSearchParams(window.location.search).get('auth_token')` and decodes JWT payload.
- Starter project demonstrates `fetch(`${backendUrl}/v1/user`, { headers: { Authorization: \`Bearer ${token}\` } })` to call Clockify API.
- Webhook handler template listens for `time.entry.updated` events and validates shared secrets before enqueueing background jobs.
- SDK quickstart includes CLI commands for `mvn package` and deployment to register manifest at `/manifest` route.
