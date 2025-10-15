#!/bin/bash

# Quick TypeScript fixes for compilation

echo "Applying TypeScript fixes..."

# Fix errorHandler.ts
sed -i '' 's/req\.correlationId/(req as any).correlationId/g' apps/api/src/middleware/errorHandler.ts

# Fix webhookController.ts
sed -i '' 's/req\.rawBody/(req as any).rawBody/g' apps/api/src/controllers/webhookController.ts
sed -i '' 's/req\.correlationId/(req as any).correlationId/g' apps/api/src/controllers/webhookController.ts

# Fix webhook controller custom fields typing
sed -i '' 's/timeEntry\.customFieldValues ?? \[\]/(timeEntry.customFieldValues ?? []).map(cf => ({ customFieldId: cf.customFieldId, value: cf.value ?? null }))/g' apps/api/src/controllers/webhookController.ts

echo "TypeScript fixes applied!"