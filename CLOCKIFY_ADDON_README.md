# Clockify Add-on: xCustom Field Expander

A comprehensive Clockify add-on that automatically evaluates mathematical formulas, conditional logic, and validation rules for Clockify time entries. This project has been refactored to follow the official Clockify Marketplace patterns and best practices.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- pnpm 8+
- PostgreSQL (for production)
- ngrok or similar tunneling service (for development)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd clockify-xcfe
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers:**
   ```bash
   pnpm run dev
   ```

4. **Expose with ngrok:**
   ```bash
   ngrok http 3000
   # Update BASE_URL in .env with your ngrok URL
   ```

## 📁 Project Structure

```
clockify-xcfe/
├── apps/
│   ├── api/                    # Express.js backend
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── clockifyJwt.ts      # JWT validation
│   │   │   │   └── ...
│   │   │   ├── routes/
│   │   │   │   ├── lifecycle.ts        # Lifecycle hooks
│   │   │   │   ├── webhooks.ts         # Webhook handlers
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── package.json
│   └── admin-ui/               # React iframe app
│       ├── src/
│       │   ├── components/
│       │   │   └── ClockifySidebar.tsx # Sidebar component
│       │   └── ...
│       ├── public/
│       │   └── sidebar.html            # Standalone sidebar
│       └── package.json
├── infra/
│   ├── manifest.json           # Clockify v1.3 manifest
│   └── db.sql                  # Database schema
├── starter-minimal/            # Minimal starter example
└── docs/                       # Documentation
```

## 🔧 Architecture

### Clockify Integration

This add-on follows the official Clockify Marketplace patterns:

- **Manifest v1.3**: Proper schema with components, lifecycle hooks, and webhooks
- **JWT Authentication**: RS256 verification with Clockify public key
- **Iframe Components**: Sidebar and project tab integrations
- **Webhook Security**: Signature validation for all webhook events
- **Environment Agnostic**: Dynamic API endpoints from JWT claims

### Key Components

1. **API Backend** (`apps/api/`)
   - Express.js server with proper CORS for Clockify
   - JWT validation with Clockify public key
   - Lifecycle hooks for installation/updates
   - Webhook handlers with signature verification
   - Formula engine for custom field evaluation

2. **Admin UI** (`apps/admin-ui/`)
   - React SPA designed for iframe embedding
   - Clockify-specific components and utilities
   - Window message communication with Clockify
   - Responsive design matching Clockify's theme

3. **Minimal Starter** (`starter-minimal/`)
   - Complete working example following the guides
   - Vanilla JavaScript implementation
   - Ready-to-deploy with minimal dependencies

## 🔐 Security

### JWT Validation

All tokens are validated using the official Clockify public key:

```typescript
import { verifyClockifyJwt } from './lib/clockifyJwt.js';

const payload = verifyClockifyJwt(token, ADDON_KEY, 'user');
```

### Webhook Security

Webhook signatures are verified for authenticity:

```typescript
const signature = req.headers['clockify-signature'];
const payload = verifyClockifyJwt(signature, ADDON_KEY, 'webhook');
```

### Environment Handling

API endpoints are dynamically resolved from JWT claims:

```typescript
const { backendUrl, reportsUrl } = getApiUrls(jwtPayload);
```

## 📋 Manifest Configuration

The add-on manifest follows Clockify v1.3 schema:

```json
{
  "schemaVersion": "1.3",
  "key": "xcfe-custom-field-expander",
  "name": "xCustom Field Expander",
  "baseUrl": "https://your-addon-server.com",
  "components": [
    {
      "type": "sidebar.page",
      "label": "Formula Manager",
      "path": "/ui/sidebar",
      "accessLevel": "EVERYONE"
    }
  ],
  "lifecycle": {
    "installed": "/api/lifecycle/installed",
    "updated": "/api/lifecycle/updated",
    "uninstalled": "/api/lifecycle/uninstalled"
  },
  "webhooks": [
    {
      "event": "NEW_TIME_ENTRY",
      "path": "/api/webhooks/time-entry-created"
    }
  ]
}
```

## 🚀 Deployment

### Development

1. Start local servers:
   ```bash
   pnpm run dev
   ```

2. Expose with ngrok:
   ```bash
   ngrok http 3000
   ```

3. Update manifest baseUrl with ngrok URL

4. Test in Clockify Developer Portal

### Production

1. **Build the application:**
   ```bash
   pnpm run build
   ```

2. **Deploy to your hosting platform:**
   - Update `BASE_URL` in environment
   - Ensure HTTPS is enabled
   - Configure database connection

3. **Submit to Clockify Marketplace:**
   - Create developer account
   - Upload manifest URL
   - Submit for review

## 🧪 Testing

### Unit Tests
```bash
pnpm run test
```

### Integration Tests
```bash
pnpm run test:integration
```

### Manual Testing

1. Install add-on in test workspace
2. Verify sidebar component loads
3. Test webhook delivery
4. Validate JWT token handling

## 📚 Documentation

- [Clockify Add-on Guide](ADDON_GUIDE)
- [Clockify API Documentation](https://docs.clockify.me/)
- [Marketplace Developer Portal](https://dev-docs.marketplace.cake.com/)

## 🔄 Development Workflow

1. **Local Development:**
   - Make changes to code
   - Test with ngrok tunnel
   - Verify in Clockify test workspace

2. **Testing:**
   - Run unit tests
   - Test webhook delivery
   - Validate JWT handling

3. **Deployment:**
   - Build production bundle
   - Deploy to hosting platform
   - Update manifest URL

4. **Publishing:**
   - Submit to Clockify Marketplace
   - Respond to review feedback
   - Monitor production metrics

## 🛠️ Available Scripts

- `pnpm run dev` - Start development servers
- `pnpm run build` - Build for production
- `pnpm run test` - Run unit tests
- `pnpm run lint` - Run ESLint
- `pnpm run typecheck` - Run TypeScript checks

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Clockify Support: [Clockify Help Center](https://clockify.me/help)
