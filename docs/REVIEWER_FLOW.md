# Reviewer Flow

1. Sync env + PEM on Vercel

   cli vercel:sync --project "<proj>" --pem-file ./public.pem

2. Wait for installation

   cli install:wait

3. Verify webhook JWT (provide token)

   cli jwt:webhook:verify --token "<jwt>"

4. Detailed report smoke (via server/proxy)

   cli report:detailed --from 2024-01-01T00:00:00Z --to 2024-01-02T00:00:00Z

5. Custom field ensure/write (manual)

   cli cf:ensure --name "Computed Hours" --type number
   cli cf:write --time-entry <id> --field <id> --value 1.5

6. Webhook dedupe test

   cli webhook:test:dedupe --event-file ./fixtures/time_entry_updated.json

7. Audits

   cli audit:env
   cli audit:origins
   cli audit:logging
