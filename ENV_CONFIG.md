# Environment Configuration Guide

## Quick Start

### 1. Setup Environment Files

Copy the example file and configure:
```bash
cp .env.example .env
```

### 2. Configure Zendesk Credentials

Edit `.env` and add your credentials:

```env
# Choose environment: development | production
VITE_ENV=development

# Development Zendesk
VITE_ZENDESK_DEV_API_URL=https://your-dev-subdomain.zendesk.com
VITE_ZENDESK_DEV_API_TOKEN=your_dev_token_here

# Production Zendesk
VITE_ZENDESK_PROD_API_URL=https://your-prod-subdomain.zendesk.com
VITE_ZENDESK_PROD_API_TOKEN=your_prod_token_here
```

## Environment Modes

### Development Mode
Uses Development Zendesk instance:
```bash
npm run dev              # Dev server with dev Zendesk
npm run build:dev        # Build with dev Zendesk
npm run preview:dev      # Preview dev build
```

**Features:**
- 🟢 Uses `VITE_ZENDESK_DEV_*` credentials
- 📝 Console logging enabled
- 🔄 Mock data fallback if API not configured
- 🐛 Error details shown in console

### Production Mode
Uses Production Zendesk instance:
```bash
npm run dev:prod         # Dev server with prod Zendesk
npm run build            # Build with prod Zendesk (default)
npm run preview          # Preview prod build
```

**Features:**
- 🔴 Uses `VITE_ZENDESK_PROD_*` credentials
- 🔇 Minimal console logging
- ❌ No mock data fallback
- 🛡️ Production-ready error handling

## Environment Selection Logic

The app determines which Zendesk environment to use:

```
1. Check VITE_ENV variable
   ├─ "production" → Use Prod Zendesk
   └─ "development" → Use Dev Zendesk

2. If VITE_ENV not set, check Vite MODE
   ├─ "production" → Use Prod Zendesk
   └─ "development" → Use Dev Zendesk

3. Default to Development
```

## File Structure

```
.
├── .env                    # Your local config (gitignored)
├── .env.development        # Dev defaults (gitignored)
├── .env.production         # Prod defaults (gitignored)
└── .env.example           # Template (committed to git)
```

## Configuration Module

Access environment config in your code:

```typescript
import { envConfig } from '@/config/env'

// Current environment
console.log(envConfig.env)              // 'development' | 'production'
console.log(envConfig.isDevelopment)    // boolean
console.log(envConfig.isProduction)     // boolean

// Zendesk config (auto-selected based on environment)
console.log(envConfig.zendesk.apiUrl)   // Active Zendesk URL
console.log(envConfig.zendesk.apiToken) // Active Zendesk token

// Supabase config
console.log(envConfig.supabase.url)
console.log(envConfig.supabase.anonKey)
```

## Zendesk Service

The Zendesk service automatically uses the correct environment:

```typescript
import { zendeskService } from '@/services/zendesk'

// Check current environment
console.log(zendeskService.getEnvironment()) // 'development' | 'production'

// API calls use environment-specific credentials automatically
const forms = await zendeskService.getTicketForms()
const result = await zendeskService.submitTicket(submission)
```

## Common Scenarios

### Scenario 1: Local Development
```bash
# Use dev Zendesk for testing
npm run dev

# Your tickets go to dev Zendesk instance
# Safe to test without affecting production
```

### Scenario 2: Testing Production Config Locally
```bash
# Use prod Zendesk credentials in dev server
npm run dev:prod

# Verify production integration before deployment
# Tickets will be created in production Zendesk!
```

### Scenario 3: Building for Deployment

**Development Build:**
```bash
npm run build:dev
# Creates build using dev Zendesk
# Deploy to staging/dev environment
```

**Production Build:**
```bash
npm run build
# Creates build using prod Zendesk
# Deploy to production environment
```

## Troubleshooting

### Issue: Using wrong Zendesk environment

**Check console output:**
```
🔧 Environment: development
📍 Zendesk API: https://your-dev-subdomain.zendesk.com
```

**Solution:**
1. Verify `VITE_ENV` in your `.env` file
2. Run correct npm script (`dev` vs `dev:prod`)
3. Check build mode (`build` vs `build:dev`)

### Issue: Zendesk API not configured

**Console shows:**
```
⚠️ Zendesk API not configured, using mock data
```

**Solution:**
1. Check `.env` file exists
2. Verify credentials are set for current environment:
   - Dev: `VITE_ZENDESK_DEV_API_URL` and `VITE_ZENDESK_DEV_API_TOKEN`
   - Prod: `VITE_ZENDESK_PROD_API_URL` and `VITE_ZENDESK_PROD_API_TOKEN`
3. Restart dev server after changing `.env`

### Issue: Mock data in production

**Cause:** Production Zendesk credentials not configured

**Solution:**
1. Set `VITE_ZENDESK_PROD_API_URL` and `VITE_ZENDESK_PROD_API_TOKEN`
2. Rebuild: `npm run build`
3. Verify credentials are correct

## Best Practices

### ✅ DO:
- Keep separate credentials for dev and prod Zendesk
- Test with dev Zendesk first
- Use `npm run build:dev` for staging deployments
- Set `VITE_ENV` explicitly in CI/CD
- Never commit `.env` files with real credentials

### ❌ DON'T:
- Don't use prod credentials for local testing
- Don't commit `.env`, `.env.development`, or `.env.production`
- Don't mix dev and prod credentials
- Don't skip testing with dev Zendesk first

## CI/CD Setup

### GitHub Actions Example

```yaml
# .github/workflows/deploy-dev.yml
name: Deploy to Development

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install

      - name: Build for Development
        run: npm run build:dev
        env:
          VITE_ENV: development
          VITE_ZENDESK_DEV_API_URL: ${{ secrets.ZENDESK_DEV_URL }}
          VITE_ZENDESK_DEV_API_TOKEN: ${{ secrets.ZENDESK_DEV_TOKEN }}
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Dev Server
        run: # Your deployment command
```

```yaml
# .github/workflows/deploy-prod.yml
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
          node-version: '18'

      - run: npm install

      - name: Build for Production
        run: npm run build
        env:
          VITE_ENV: production
          VITE_ZENDESK_PROD_API_URL: ${{ secrets.ZENDESK_PROD_URL }}
          VITE_ZENDESK_PROD_API_TOKEN: ${{ secrets.ZENDESK_PROD_TOKEN }}
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Deploy to Production Server
        run: # Your deployment command
```

## Summary

| Command | Environment | Zendesk | Use Case |
|---------|-------------|---------|----------|
| `npm run dev` | Development | Dev | Local development |
| `npm run dev:prod` | Production | Prod | Test prod config locally |
| `npm run build:dev` | Development | Dev | Build for staging |
| `npm run build` | Production | Prod | Build for production |

---

Need help? Check `INTEGRATION.md` for full documentation.
