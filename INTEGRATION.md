# H5 Support Form Integration Guide

## Overview

This H5 application is designed to be embedded in a native mobile app (iOS/Android) and provides a Zendesk-powered support request system.

## Architecture

### 1. **Zendesk API Integration** (`src/services/zendesk.ts`)

The application fetches ticket forms dynamically from Zendesk API:

```typescript
// Fetch available forms
const forms = await zendeskService.getTicketForms()

// Submit a support ticket
const result = await zendeskService.submitTicket({
  formId: 'ride-not-ended',
  fields: { ... },
  attachments: [ ... ]
})
```

### 2. **Native App Bridge** (`src/services/appBridge.ts`)

Provides communication between H5 and native app for:

#### Camera Access
```typescript
const image = await appBridge.openCamera()
// Returns: { uri, base64, width, height, fileSize }
```

#### Image Picker
```typescript
const images = await appBridge.openImagePicker(multiple: true)
// Returns: Array of image objects
```

#### QR Scanner
```typescript
const qrResult = await appBridge.openQRScanner()
// Returns: { data, type }
```

#### Navigation
```typescript
appBridge.goBack() // Navigate back in native app
```

#### User Info
```typescript
const userInfo = await appBridge.getUserInfo()
// Returns: { name, email, phone }
```

### 3. **UI Component Library**

Custom UI components based on shadcn/ui design system:
- `Button` - Primary action buttons
- `Input` - Text input fields
- `Textarea` - Multi-line text input
- `Label` - Form labels with required indicator
- `RadioGroup` / `RadioGroupItem` - Radio button selections

All components follow the design specifications from Figma.

## Native App Integration

### iOS Integration

The native iOS app should implement the following message handlers:

```swift
// Camera
webView.configuration.userContentController.add(self, name: "openCamera")

// Image Picker
webView.configuration.userContentController.add(self, name: "openImagePicker")

// QR Scanner
webView.configuration.userContentController.add(self, name: "openQRScanner")

// Navigation
webView.configuration.userContentController.add(self, name: "goBack")

// User Info
webView.configuration.userContentController.add(self, name: "getUserInfo")
```

Response format:
```swift
// Send response back to H5
let response = ["type": "camera_result", "data": imageData]
webView.evaluateJavaScript("window.dispatchEvent(new CustomEvent('native_response', { detail: \(response) }))")
```

### Android Integration

The native Android app should implement the following bridge methods:

```java
@JavascriptInterface
public String openCamera() {
    // Open camera and return JSON string
    return "{ \"uri\": \"...\", \"base64\": \"...\", ... }"
}

@JavascriptInterface
public String openImagePicker(boolean multiple) {
    // Open image picker and return JSON string
    return "[{ \"uri\": \"...\", ... }]"
}

@JavascriptInterface
public String openQRScanner() {
    // Open QR scanner and return JSON string
    return "{ \"data\": \"...\", \"type\": \"QR_CODE\" }"
}

@JavascriptInterface
public void goBack() {
    // Navigate back
}

@JavascriptInterface
public String getUserInfo() {
    // Return user info as JSON string
    return "{ \"name\": \"...\", \"email\": \"...\", \"phone\": \"...\" }"
}
```

Register the bridge:
```java
webView.addJavascriptInterface(new AppBridge(), "AndroidBridge")
```

## Environment Configuration

The application supports separate Development and Production Zendesk environments.

### Environment Files

The project includes three environment files:
- `.env` - Default environment variables (gitignored)
- `.env.development` - Development environment (gitignored)
- `.env.production` - Production environment (gitignored)
- `.env.example` - Template file (committed to repo)

### Configuration Variables

```env
# Environment (development | production)
VITE_ENV=development

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Zendesk Configuration - Development
VITE_ZENDESK_DEV_API_URL=https://your-dev-subdomain.zendesk.com
VITE_ZENDESK_DEV_API_TOKEN=your_dev_zendesk_api_token

# Zendesk Configuration - Production
VITE_ZENDESK_PROD_API_URL=https://your-prod-subdomain.zendesk.com
VITE_ZENDESK_PROD_API_TOKEN=your_prod_zendesk_api_token
```

### Environment Selection

The application automatically selects the correct Zendesk environment based on:
1. `VITE_ENV` variable (if set)
2. Vite `MODE` (development/production)
3. Defaults to `development`

**Development Mode:**
- Uses `VITE_ZENDESK_DEV_API_URL` and `VITE_ZENDESK_DEV_API_TOKEN`
- Additional console logging enabled
- Mock data fallback if API not configured

**Production Mode:**
- Uses `VITE_ZENDESK_PROD_API_URL` and `VITE_ZENDESK_PROD_API_TOKEN`
- Minimal console logging
- No mock data fallback

## Development & Testing

### Installation
```bash
npm install
```

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`

### Local Development

**Development Mode** (uses dev Zendesk):
```bash
npm run dev
```

**Production Mode** (uses prod Zendesk):
```bash
npm run dev:prod
```

### Building

**Production Build** (uses prod Zendesk):
```bash
npm run build
```

**Development Build** (uses dev Zendesk):
```bash
npm run build:dev
```

### Preview Build

**Preview Production Build:**
```bash
npm run preview
```

**Preview Development Build:**
```bash
npm run preview:dev
```

The build output will be in the `dist/` directory.

### Testing Native Features

When running in a browser (non-native environment), the app will:
- Use file input for camera/image picker
- Show prompt for QR scanner input
- Use window.history.back() for navigation

### Debug Logging

In development mode, the console will show:
- 🔧 Current environment (dev/prod)
- 📍 Active Zendesk API URL
- 🗄️ Supabase configuration
- 🎫 Ticket form fetching status
- 📤 Ticket submission details

## Form Flow

1. **Issue Selection** - User selects from Zendesk ticket forms
2. **Dynamic Form** - Form fields are rendered based on Zendesk configuration
3. **Native Features** - Camera, image picker, QR scanner triggered as needed
4. **Submission** - Data submitted to Zendesk API
5. **Success Page** - Confirmation shown

## Data Persistence

The application uses Supabase for storing:
- User submission history
- Draft forms (auto-save)
- User profile cache

## Key Features

✅ **Multi-Environment Support** - Separate dev and prod Zendesk instances
✅ **Dynamic Forms** - Fetched from Zendesk API
✅ **Native Integration** - Camera, Gallery, QR Scanner
✅ **Conditional Fields** - Show/hide based on user selections
✅ **Auto-fill** - Pre-populate user info from native app
✅ **Image Upload** - Multiple images up to 5
✅ **Responsive Design** - Mobile-optimized UI
✅ **Type Safety** - Full TypeScript support
✅ **Graceful Degradation** - Mock data fallback in development

## Deployment

### Development Deployment

1. Set up `.env.development` with dev Zendesk credentials
2. Build for development: `npm run build:dev`
3. Deploy `dist/` folder to dev environment
4. Test thoroughly with dev Zendesk data

### Production Deployment

1. Set up `.env.production` with prod Zendesk credentials
2. Build for production: `npm run build`
3. Deploy `dist/` folder to production environment
4. Verify production Zendesk connection

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches:
      - develop  # Deploy to dev
      - main     # Deploy to prod

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Build (Development)
        if: github.ref == 'refs/heads/develop'
        run: npm run build:dev
        env:
          VITE_ZENDESK_DEV_API_URL: ${{ secrets.ZENDESK_DEV_URL }}
          VITE_ZENDESK_DEV_API_TOKEN: ${{ secrets.ZENDESK_DEV_TOKEN }}

      - name: Build (Production)
        if: github.ref == 'refs/heads/main'
        run: npm run build
        env:
          VITE_ZENDESK_PROD_API_URL: ${{ secrets.ZENDESK_PROD_URL }}
          VITE_ZENDESK_PROD_API_TOKEN: ${{ secrets.ZENDESK_PROD_TOKEN }}

      - name: Deploy
        run: # Your deployment command
```

## Next Steps

1. Configure Zendesk API credentials for both dev and prod in `.env`
2. Implement native bridge handlers in iOS/Android app
3. Test with development Zendesk first
4. Verify prod Zendesk integration
5. Deploy to production

## Support

For questions or issues, please contact the development team.
