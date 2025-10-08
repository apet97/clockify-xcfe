# xCustom Field Expander - Marketplace Installation Guide

This guide walks you through installing the xCFE add-on in your Clockify developer workspace.

## Prerequisites

- **Node.js 20+** and **pnpm** installed
- **ngrok** installed for public URL exposure (`brew install ngrok`)
- **Clockify Developer Portal** access
- **Developer workspace** in Clockify
- **Optional:** PostgreSQL database (SQLite used by default for development)

## Step 1: Environment Setup

1. **Clone and configure the repository:**
   ```bash
   cd /path/to/xCustomFieldExpander/clockify-xcfe
   cp .env.sample .env
   ```

2. **Edit `.env` with your configuration:**
   ```bash
   # Required for marketplace installation
   ADDON_KEY=xcfe.example                    # Change to your unique key
   ADDON_NAME=xCustom Field Expander
   BASE_URL=http://localhost:8080            # Will be overridden by ngrok
   
   # Database (SQLite for development)
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/xcfe
   SKIP_DATABASE_CHECKS=true                 # Skip database checks for quick testing (override in production)
   
   # Security
   ENCRYPTION_KEY=your_32_character_encryption_key_here_minimum_length
   
   # RSA Public Key (use the one from Clockify docs)
   RSA_PUBLIC_KEY_PEM='-----BEGIN PUBLIC KEY-----
   MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuGbXWiK3dQTyCbX5xdE4
   yCuYp0yyTnH2jFjNEJNTOl1iVYNCbL+lJ5DQOr2DaQYyKlMzUYQ6b5E8eKDSA8nN
   VPnLcJr1ixOLqr8c8VqpNQ8xQH+N8zJdE8tn2VfQLFNXkE5VcNJz0ybV5X7V5XKF
   MvKxOl8wGn5zOGGJNTrqhLf3mHj8fKdVN3L0qkO1dA+9U7JvE0eMQ+5h1Y0Mk7yf
   2H8zUzGdkGj8xX2y3K0VwJsD1fPQ8ZXJN8TqnFfYl2ckNw8c0L5n7Q1F0iV8Np3E
   r5X4pKzq3+x4K7F7nR3xHm7m4XJL0a8X7n0y6nQZE4L1Q7x9yV8y+lG8H7z+3Xeq
   owIDAQAB
   -----END PUBLIC KEY-----'
   ```

## Step 2: Start Development Server

**OPTION 1: Full API Server (with database checks disabled)**
```bash
# Install dependencies and start server
pnpm install
pnpm --filter @xcfe/api dev &

# In a new terminal, start ngrok
ngrok http 8080
```

**OPTION 2: Simple Addon Server (fastest for testing)**
```bash
# Use the lightweight addon server  
node simple-addon.mjs &

# In a new terminal, start ngrok
ngrok http 8080
```

**Copy the ngrok URL from the output:**
```
🔗 Manifest URL: https://abcd1234.ngrok-free.app/manifest
🏠 Base URL: https://abcd1234.ngrok-free.app
```

**Test the manifest endpoint:**
```bash
curl -s https://your-ngrok-url.ngrok-free.app/manifest | jq '.key'
# Should return: "xcfe.example"
```

## Step 3: Register Add-on in Developer Portal

1. **Go to [Clockify Developer Portal](https://clockify.me/developers)**

2. **Click "Create Add-on"**

3. **Fill in the add-on details:**
   - **Name:** xCustom Field Expander
   - **Key:** `xcfe.example` (or your unique key)
   - **Manifest URL:** Paste the ngrok manifest URL from Step 2
   - **Description:** Formula automation for Clockify time entries

4. **Click "Save Draft"**

5. **Test the manifest:** The portal should fetch and validate your manifest automatically

## Step 4: Install in Developer Workspace

1. **In the Developer Portal, click "Add Workspace"**

2. **Select your developer workspace**

3. **Click "Install" next to your workspace**

4. **Monitor server logs:** You should see lifecycle webhook calls:
   ```
   [INFO] Add-on installed successfully {"addonId":"...","workspaceId":"..."}
   ```

## Step 5: Verify Installation

1. **Check the health endpoint:**
   ```bash
   curl https://your-ngrok-url.ngrok.io/v1/sites/health
   ```

2. **Seed demo OT formulas (optional but recommended):**
   ```bash
   scripts/seed-demo.sh
   ```
   This installs `Rate`, `OTMultiplier`, `Amount`, and `OTFlag` dictionaries/formulas for quick validation.

3. **Open the Clockify web app** and switch to your developer workspace.

4. **Open the “Add-ons” sidebar** and launch **xCFE**.

5. **Confirm the iframe reports** “✓ Installed OK” with workspace/user info and latest time-entry snapshot.

## Step 6: Test Add-on Functionality

1. **In the xCFE sidebar, click "🔄 Refresh Data"**

2. **Verify it shows your recent time entries**

3. **Check server logs for API calls**

4. **Test token refresh:** Click "🔑 Refresh Token"

## Troubleshooting

### Common Issues

**❌ "Failed to fetch manifest"**
- Check ngrok tunnel is running: `curl https://your-url.ngrok.io/manifest`
- Verify manifest JSON structure: `curl -s https://your-url.ngrok.io/manifest | jq`
- Check server logs for errors

**❌ "JWT verification failed"**
- Ensure `RSA_PUBLIC_KEY_PEM` is correct in `.env`
- Check `ADDON_KEY` matches the one in Developer Portal
- Verify the lifecycle token headers

**❌ "Database connection failed"** 
- Set `SKIP_DATABASE_CHECKS=true` in `.env` for addon testing
- For full database: Check `DATABASE_URL` in `.env`
- Use `simple-addon.mjs` for database-free testing

**❌ "Sidebar shows authentication error"**
- Check `auth_token` parameter in URL
- Verify JWT verification logic
- Check browser console for errors

### Debug Commands

```bash
# Test manifest endpoint
curl -s https://your-ngrok-url.ngrok.io/manifest | jq

# Check health
curl -s https://your-ngrok-url.ngrok.io/v1/sites/health | jq

# Test sidebar (replace TOKEN)
curl "https://your-ngrok-url.ngrok.io/ui/sidebar?auth_token=TOKEN"

# Check installation data
psql $DATABASE_URL -c "SELECT * FROM installations;"
```

### Rollback

To uninstall the add-on:

1. **In Developer Portal:** Go to your workspace and click "Uninstall"
2. **Check server logs:** Should see deletion lifecycle webhook
3. **Verify cleanup:** 
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM installations;"
   ```

## Production Deployment

For production deployment:

1. **Update environment variables:**
   ```bash
   NODE_ENV=production
   BASE_URL=https://your-production-domain.com
   ```

2. **Use production database and secrets**

3. **Deploy to cloud provider (Vercel, Railway, etc.)**

4. **Update manifest URL in Developer Portal**

5. **Re-install in production workspaces**

## Next Steps

After successful installation:

1. **Configure formulas** in the admin UI
2. **Set up time entry webhooks** for real-time processing  
3. **Test backfill functionality** for historical data
4. **Monitor installation logs** and user feedback

---

## Support

- **Documentation:** [GitHub Repository](https://github.com/your-org/xcfe)
- **Issues:** Create GitHub issues for bugs and feature requests
- **API Reference:** Check `/v1/sites/health` endpoint for API status

**🎉 Congratulations!** Your xCustom Field Expander add-on is now installed and ready to automate formula calculations for Clockify time entries.