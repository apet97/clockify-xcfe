#!/bin/bash

echo "Fixing router type annotations..."

# Add import for Router type and fix router export in all route files
for file in apps/api/src/routes/*.ts; do
  if [[ $(basename "$file") != "index.ts" ]]; then
    # Add Router import if not present
    if ! grep -q "import.*Router.*from.*express" "$file"; then
      sed -i '' '1i\
import { Router } from '\''express'\'';
' "$file"
    fi
    
    # Fix router declaration
    sed -i '' 's/const router = Router()/const router: Router = Router()/g' "$file"
  fi
done

# Fix index.ts
sed -i '' 's/const router = Router()/const router: express.Router = Router()/g' apps/api/src/routes/index.ts

echo "Router type annotations fixed!"