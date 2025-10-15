import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clockify public key for JWT verification (RS256)
const CLOCKIFY_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAubktufFNO/op+E5WBWLG
/Y9QRZGSGGCsVOOFmMPR15AOmMSfQu3yq2Yaq47INOzgFy9IUG8/JfwiehsmbrKa
49t/xSkpGlu9wlGUyYg4eKDUwoHKAt3IPwOSt4qsWLKIMO+koUo56CGQOEpTuUi
5bMfmefVBBfShXTaZ0tXPB349FdzSuY1U/503L12zVWMutNhiJCKyGfsuu2uXa9+
6uQnZBwlw03/QEci7i4TbC+ZXqW1lrCcbogSMORQHAP6qSACTFRmrjFAEsOWiUUhZ
rLDg2QJ8VTDghFnUhYkINTI1Ggfo80qEWeINLIwvZjOh3bWRfrqZHsD/Yjhoduk
yQIDAQAB
-----END PUBLIC KEY-----`;

const ADDON_KEY = 'com.example.clockify.demo';
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const app = express();

// Middleware
app.use(cors({
  origin: ['https://app.clockify.me', 'https://*.clockify.me'],
  credentials: true
}));

app.use(express.json());
app.use(pinoHttp({
  genReqId: () => randomUUID()
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// JWT verification helper
function verifyClockifyJwt(token: string, expectedAddonKey: string) {
  try {
    const payload = jwt.verify(token, CLOCKIFY_PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: 'clockify',
      subject: expectedAddonKey
    }) as any;

    if (payload.type !== 'addon') {
      throw new Error('Invalid token type');
    }

    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error}`);
  }
}

// Manifest endpoint
app.get('/manifest.json', (req, res) => {
  const manifest = {
    schemaVersion: "1.3",
    key: ADDON_KEY,
    name: "Demo Add-on",
    baseUrl: BASE_URL,
    description: "A minimal Clockify add-on demonstration",
    iconPath: "/assets/icon.png",
    requiredPlan: "FREE",
    scopes: [
      "TIME_ENTRY_READ",
      "USER_READ"
    ],
    components: [
      {
        type: "sidebar.page",
        label: "Demo",
        path: "/ui/sidebar",
        accessLevel: "EVERYONE"
      }
    ],
    webhooks: [
      {
        event: "NEW_TIME_ENTRY",
        path: "/api/webhooks/time-entry-created"
      }
    ]
  };

  res.json(manifest);
});

// Sidebar UI component
app.get('/ui/sidebar', (req, res) => {
  const authToken = req.query.auth_token as string;
  const userId = req.query.userId as string;

  if (!authToken) {
    return res.status(400).send('Missing auth_token parameter');
  }

  try {
    // Verify the JWT token
    const payload = verifyClockifyJwt(authToken, ADDON_KEY);
    
    // Serve the sidebar HTML with the token
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Clockify Demo Add-on</title>
          <style>
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  margin: 0; 
                  padding: 1rem;
                  background: #f8f9fa;
              }
              .container { 
                  background: white; 
                  padding: 1.5rem; 
                  border-radius: 8px; 
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header { 
                  border-bottom: 1px solid #e9ecef; 
                  padding-bottom: 1rem; 
                  margin-bottom: 1rem; 
              }
              .btn { 
                  background: #007bff; 
                  color: white; 
                  border: none; 
                  padding: 0.5rem 1rem; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  margin: 0.25rem;
              }
              .btn:hover { background: #0056b3; }
              .info { 
                  background: #e7f3ff; 
                  padding: 1rem; 
                  border-radius: 4px; 
                  margin: 1rem 0; 
              }
              .error { 
                  background: #f8d7da; 
                  color: #721c24; 
                  padding: 1rem; 
                  border-radius: 4px; 
                  margin: 1rem 0; 
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Clockify Demo Add-on</h1>
                  <p>Welcome to your custom Clockify integration!</p>
              </div>
              
              <div class="info">
                  <h3>Workspace Info</h3>
                  <p><strong>Workspace ID:</strong> ${payload.workspaceId}</p>
                  <p><strong>User ID:</strong> ${payload.user}</p>
                  <p><strong>Language:</strong> ${payload.language || 'EN'}</p>
                  <p><strong>Theme:</strong> ${payload.theme || 'DEFAULT'}</p>
              </div>

              <div>
                  <h3>Actions</h3>
                  <button class="btn" onclick="fetchUserData()">Get User Data</button>
                  <button class="btn" onclick="showToast('info', 'Hello from add-on!')">Show Toast</button>
                  <button class="btn" onclick="navigateToTracker()">Go to Tracker</button>
              </div>

              <div id="userData" class="info" style="display: none;">
                  <h3>User Data</h3>
                  <pre id="userDataContent"></pre>
              </div>
          </div>

          <script>
              const authToken = '${authToken}';
              const backendUrl = '${payload.backendUrl}';

              async function fetchUserData() {
                  try {
                      const response = await fetch(\`\${backendUrl}/v1/user\`, {
                          headers: {
                              'X-Addon-Token': authToken
                          }
                      });
                      
                      if (!response.ok) {
                          throw new Error(\`HTTP \${response.status}\`);
                      }
                      
                      const userData = await response.json();
                      document.getElementById('userDataContent').textContent = JSON.stringify(userData, null, 2);
                      document.getElementById('userData').style.display = 'block';
                  } catch (error) {
                      console.error('Error fetching user data:', error);
                      alert('Error: ' + error.message);
                  }
              }

              function showToast(type, message) {
                  window.parent?.postMessage({
                      type: 'toastrPop',
                      payload: { type, message }
                  }, '*');
              }

              function navigateToTracker() {
                  window.parent?.postMessage({
                      type: 'navigate',
                      payload: { type: 'tracker' }
                  }, '*');
              }

              // Listen for messages from Clockify
              window.addEventListener('message', (event) => {
                  console.log('Received message from Clockify:', event.data);
              });

              // Auto-fetch user data on load
              fetchUserData();
          </script>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(401).send(`
      <div class="error">
          <h3>Authentication Error</h3>
          <p>${error}</p>
      </div>
    `);
  }
});

// Webhook handler
app.post('/api/webhooks/time-entry-created', (req, res) => {
  const signature = req.headers['clockify-signature'] as string;
  const eventType = req.headers['clockify-webhook-event-type'] as string;

  if (!signature || eventType !== 'NEW_TIME_ENTRY') {
    return res.status(400).json({ error: 'Missing or invalid webhook headers' });
  }

  try {
    // Verify webhook signature
    const payload = verifyClockifyJwt(signature, ADDON_KEY);
    
    console.log('Time entry created webhook received:', {
      timeEntryId: req.body.id,
      workspaceId: payload.workspaceId,
      userId: req.body.userId
    });

    // Process the webhook here
    // ...

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    res.status(401).json({ error: 'Invalid webhook signature' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    addonKey: ADDON_KEY
  });
});

app.listen(PORT, () => {
  console.log(`Clockify add-on server running on port ${PORT}`);
  console.log(`Manifest available at: ${BASE_URL}/manifest.json`);
  console.log(`Sidebar UI available at: ${BASE_URL}/ui/sidebar`);
  console.log(`Health check available at: ${BASE_URL}/health`);
});
