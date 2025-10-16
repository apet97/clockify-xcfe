# xCFE API Endpoints

## Lifecycle Hooks
- POST /v1/lifecycle/installed - Installation
- POST /v1/lifecycle/status-changed - Enable/disable
- POST /v1/lifecycle/settings-updated - Settings change
- POST /v1/lifecycle/updated - Version update
- POST /v1/lifecycle/uninstalled - Uninstall
(All have GET liveness probes)

## Webhooks
- POST /v1/webhooks/clockify - Consolidated webhook endpoint
- POST /v1/webhooks/time-entry-created - Legacy create hook
- POST /v1/webhooks/time-entry-updated - Legacy update hook
- POST /v1/webhooks/time-entry-deleted - Legacy delete hook
- GET/POST /v1/webhooks/bootstrap - Bootstrap webhook registration

## Formulas
- GET /v1/formulas - List formulas
- POST /v1/formulas - Create formula
- PUT /v1/formulas/:id - Update formula
- DELETE /v1/formulas/:id - Delete formula
- GET/POST /v1/formulas/recompute - Trigger recompute
- GET /v1/formulas/verify - Verify formula syntax

## Dictionaries
- GET /v1/dictionaries - List dictionaries
- POST /v1/dictionaries - Upsert dictionary
- DELETE /v1/dictionaries/:fieldKey - Remove dictionary

## Settings
- GET /v1/settings - Get workspace settings
- POST /v1/settings - Update settings

## Backfill
- POST /v1/backfill - Execute backfill

## UI/Admin
- GET /ui/sidebar - Render sidebar iframe
- GET /ui/settings - Render settings page
- GET /ui/settings/:config - Render settings with config

## Proxy
- GET /v1/proxy/time-entries - Proxy time entries to Clockify

## Runs
- GET /v1/runs - Get formula execution runs

## Custom Fields
- GET /v1/cf/fields - Get custom fields

## Manifest & Health
- GET /manifest - Add-on manifest
- GET /health - Health check
- GET /ready - Readiness check

## User
- GET /v1/me - Get current user info

## Auth
- POST /v1/auth/magic-link - Create magic link

## Debug
- GET /v1/debug/last-lifecycle - Get last lifecycle event
