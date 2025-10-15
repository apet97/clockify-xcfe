Vercel Env + PEM Setup and Self‑Check

Pasteable steps to set the Clockify RSA public key, required envs, and redeploy. Tokens are provided by Clockify at installation and via webhooks — do NOT put installation or webhook tokens in env.

1) Prepare the Clockify RSA public key (PEM)
Save the exact PEM from the Clockify developer portal or docs (no edits, no extra spaces). Example placeholder below — replace with the official text.

-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAubktufFNO/op+E5WBWLG
/Y9QRZGSGGCsVOOFmMPR15AOmMSfQu3yq2Yaq47INOzgFy9IUG8/JfwiehsmbrKa
49t/xSkpGlu9wlGUyYg4eKDUwoHKAt3IPwOSt4qsWLKIMO+koUo56CGQOEpTuUi
5bMfmefVBBfShXTaZ0tXPB349FdzSuY1U/503L12zVWMutNhiJCKyGfsuu2uXa9+
6uQnZBwlw03/QEci7i4TbC+ZXqW1lrCcbogSMORQHAP6qSACTFRmrjFAEsOWiUUh
ZrLDg2QJ8VTDghFnUhYkINTI1Ggfo80qEWeINLIwvZjOh3bWRfrqZHsD/Yjhoduk
yQIDAQAB
-----END PUBLIC KEY-----

2) Add env vars (production, preview, development)
Use the CLOCKIFY_PUBLIC_KEY_PEM variable (accepted by the app as an alias for RSA_PUBLIC_KEY_PEM).

vercel env add CLOCKIFY_PUBLIC_KEY_PEM production < public.pem
vercel env add CLOCKIFY_PUBLIC_KEY_PEM preview    < public.pem
vercel env add CLOCKIFY_PUBLIC_KEY_PEM development < public.pem

Also ensure these vars exist:
- BASE_URL = https://your-app.vercel.app
- ADMIN_UI_ORIGIN = https://app.clockify.me,https://*.clockify.me,https://developer.clockify.me
- ENCRYPTION_KEY = (32+ chars)
- ADMIN_SECRET = (optional; protects /api/webhooks/bootstrap; defaults to ENCRYPTION_KEY)
- CLOCKIFY_BASE_URL = https://api.clockify.me/api/v1
- LOG_LEVEL = info

3) Redeploy and verify

vercel deploy --prod --confirm
curl -sS -o /dev/null -w "%{http_code}\n" "https://your-app.vercel.app/health"

Expect 200 and JSON containing:
- ok: true
- status: "healthy"
- workspaceId: (present)
- addonKey, baseUrl, timestamp, db

4) Enforced verification rules
The API enforces:
- iss = "clockify"
- type = "addon"
- sub = <your add-on key> (CONFIG.ADDON_KEY)
Proper verification requires a clean PEM (no OCR artifacts).

