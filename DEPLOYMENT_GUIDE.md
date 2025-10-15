# Clockify Add-on Deployment Guide

This guide walks you through deploying the xCustom Field Expander add-on to production and submitting it to the Clockify Marketplace.

## 🚀 Pre-Deployment Checklist

- [ ] All tests passing (`pnpm run test`)
- [ ] Build successful (`pnpm run build`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] HTTPS enabled
- [ ] Manifest URL accessible
- [ ] Webhook endpoints responding

## 📋 Environment Setup

### Required Environment Variables

```bash
# Core Configuration
NODE_ENV=production
PORT=3000
BASE_URL=https://your-addon-server.com

# Clockify Add-on Configuration
ADDON_KEY=xcfe-custom-field-expander
ADDON_NAME=xCustom Field Expander
MIN_PLAN=FREE

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
RSA_PUBLIC_KEY_PEM=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----

# Clockify API
CLOCKIFY_BASE_URL=https://api.clockify.me/api/v1
CLOCKIFY_WEBHOOK_SECRET=your-webhook-secret

# Optional
ADMIN_UI_ORIGIN=https://app.clockify.me,https://*.clockify.me
LOG_LEVEL=info
RATE_LIMIT_RPS=50
```

## 🏗️ Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Configure Vercel:**
   ```bash
   vercel
   ```

3. **Set environment variables:**
   ```bash
   vercel env add NODE_ENV
   vercel env add BASE_URL
   vercel env add DATABASE_URL
   # ... add all required variables
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Railway

1. **Connect GitHub repository**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on push**

### Option 3: DigitalOcean App Platform

1. **Create new app from GitHub**
2. **Configure build settings:**
   - Build command: `pnpm run build`
   - Run command: `pnpm start`
3. **Set environment variables**
4. **Deploy**

### Option 4: AWS/GCP/Azure

1. **Set up container registry**
2. **Create Dockerfile:**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install -g pnpm && pnpm install
   COPY . .
   RUN pnpm run build
   EXPOSE 3000
   CMD ["pnpm", "start"]
   ```
3. **Deploy container**
4. **Configure load balancer and SSL**

## 🔧 Database Setup

### PostgreSQL (Recommended)

1. **Create database:**
   ```sql
   CREATE DATABASE xcfe_production;
   ```

2. **Run migrations:**
   ```bash
   pnpm run migrate
   ```

3. **Verify schema:**
   ```bash
   pnpm run db:verify
   ```

## 🔐 Security Configuration

### SSL/TLS

Ensure your production server has valid SSL certificates:

```bash
# Using Let's Encrypt
certbot --nginx -d your-addon-server.com
```

### CORS Configuration

Update CORS settings for production:

```typescript
app.use(cors({
  origin: [
    'https://app.clockify.me',
    'https://*.clockify.me'
  ],
  credentials: true
}));
```

### Rate Limiting

Configure appropriate rate limits:

```typescript
const rateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
```

## 📝 Manifest Configuration

### Update Manifest URL

1. **Ensure manifest is accessible:**
   ```bash
   curl https://your-addon-server.com/manifest.json
   ```

2. **Verify manifest structure:**
   ```json
   {
     "schemaVersion": "1.3",
     "key": "xcfe-custom-field-expander",
     "name": "xCustom Field Expander",
     "baseUrl": "https://your-addon-server.com",
     ...
   }
   ```

### Test Manifest

1. **Validate with Clockify tools**
2. **Test component loading**
3. **Verify webhook endpoints**

## 🧪 Testing in Production

### 1. Health Check

```bash
curl https://your-addon-server.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "addonKey": "xcfe-custom-field-expander"
}
```

### 2. Manifest Validation

```bash
curl https://your-addon-server.com/manifest.json | jq .
```

### 3. Component Testing

1. Install add-on in test workspace
2. Verify sidebar loads correctly
3. Test API calls with JWT tokens
4. Validate webhook delivery

### 4. Webhook Testing

```bash
# Test webhook endpoint
curl -X POST https://your-addon-server.com/api/webhooks/time-entry-created \
  -H "Content-Type: application/json" \
  -H "clockify-signature: test-signature" \
  -H "clockify-webhook-event-type: NEW_TIME_ENTRY" \
  -d '{"id": "test-entry", "workspaceId": "test-workspace"}'
```

## 🏪 Marketplace Submission

### 1. Create Developer Account

1. Go to [Clockify Developer Portal](https://dev-docs.marketplace.cake.com/)
2. Create developer account
3. Verify email address

### 2. Create Add-on Listing

1. **Basic Information:**
   - Name: xCustom Field Expander
   - Description: Automated formula evaluation and validation for Clockify custom fields
   - Category: Productivity
   - Pricing: Free

2. **Technical Details:**
   - Manifest URL: `https://your-addon-server.com/manifest.json`
   - Icon: Upload 512x512 PNG icon
   - Screenshots: Upload 3-5 screenshots

3. **Support Information:**
   - Support email
   - Documentation URL
   - Privacy policy URL
   - Terms of service URL

### 3. Private Testing

1. **Whitelist test workspaces:**
   - Add up to 3 workspace IDs
   - Test installation and functionality
   - Verify all features work correctly

2. **Gather feedback:**
   - Test with different user roles
   - Verify cross-browser compatibility
   - Check mobile responsiveness

### 4. Submit for Review

1. **Complete all required fields**
2. **Upload all assets**
3. **Submit for review**
4. **Respond to feedback**

## 📊 Monitoring and Maintenance

### 1. Application Monitoring

Set up monitoring for:
- Server health and uptime
- Database performance
- API response times
- Error rates

### 2. Log Management

Configure log aggregation:
- Application logs
- Error tracking
- Performance metrics
- Security events

### 3. Backup Strategy

- Database backups (daily)
- Configuration backups
- Code repository backups
- Disaster recovery plan

### 4. Update Process

1. **Development:**
   - Make changes in feature branch
   - Test thoroughly
   - Create pull request

2. **Staging:**
   - Deploy to staging environment
   - Run integration tests
   - User acceptance testing

3. **Production:**
   - Deploy to production
   - Monitor for issues
   - Rollback if necessary

## 🚨 Troubleshooting

### Common Issues

1. **Manifest not loading:**
   - Check URL accessibility
   - Verify CORS headers
   - Check SSL certificate

2. **Webhooks not working:**
   - Verify signature validation
   - Check endpoint accessibility
   - Validate event types

3. **JWT validation errors:**
   - Check public key format
   - Verify token claims
   - Check expiration times

4. **Database connection issues:**
   - Verify connection string
   - Check network access
   - Validate credentials

### Debug Commands

```bash
# Check server status
curl -I https://your-addon-server.com/health

# Test manifest
curl https://your-addon-server.com/manifest.json

# Check logs
vercel logs
# or
docker logs container-name

# Database connection
psql $DATABASE_URL -c "SELECT 1;"
```

## 📈 Performance Optimization

### 1. Caching

- Implement Redis for session storage
- Cache API responses
- Use CDN for static assets

### 2. Database Optimization

- Add appropriate indexes
- Optimize queries
- Use connection pooling

### 3. API Optimization

- Implement request batching
- Use pagination
- Optimize response sizes

## 🔄 Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 Support

- **Documentation:** [CLOCKIFY_ADDON_README.md](CLOCKIFY_ADDON_README.md)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Clockify Support:** [Clockify Help Center](https://clockify.me/help)
- **Developer Forum:** [CAKE.com Developer Forum](https://dev-forum.marketplace.cake.com/)
