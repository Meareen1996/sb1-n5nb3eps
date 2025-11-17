# Help Center H5 - Deployment Guide

## Overview

This is a mobile-first H5 Help Center application built with React + TypeScript + Vite. Users can submit support requests through various issue-specific forms that will be integrated with Zendesk.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   GitLab    │────▶│  AWS ECR     │────▶│  AWS EKS    │
│   CI/CD     │     │  (Docker)    │     │ (Kubernetes)│
└─────────────┘     └──────────────┘     └─────────────┘
      │                                          │
      │                                          ▼
      │                                   ┌─────────────┐
      └──────────────────────────────────▶│   Nginx     │
                                          │  (Static)   │
                                          └─────────────┘
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite 5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Containerization**: Docker (Multi-stage build)
- **Web Server**: Nginx Alpine
- **Orchestration**: Kubernetes (AWS EKS)
- **Registry**: AWS ECR
- **CI/CD**: GitLab CI/CD

## Project Structure

```
helpcenter-h5/
├── src/
│   ├── components/
│   │   ├── IssueSelector.tsx          # Main issue selection screen
│   │   ├── FormContainer.tsx          # Form router
│   │   └── forms/
│   │       ├── BaseFormFields.tsx     # Reusable form components
│   │       ├── RideNotEndedForm.tsx   # Ride not ended form
│   │       ├── ChargedIncorrectlyForm.tsx
│   │       ├── RideNotMoveForm.tsx
│   │       ├── DeleteAccountForm.tsx
│   │       ├── UnableToRideForm.tsx
│   │       └── IssueNotListedForm.tsx
│   ├── types/
│   │   └── form.ts                    # TypeScript type definitions
│   ├── App.tsx                        # Main application component
│   └── main.tsx                       # Application entry point
├── ci-cd/
│   ├── package.sh                     # Build script
│   ├── build.sh                       # Docker build and push
│   ├── deploy.sh                      # EKS deployment (AWS CLI)
│   ├── kube_deploy.sh                 # Alternative deployment (kubectl)
│   ├── deployment.yaml                # Production Kubernetes manifests
│   ├── deployment-dev.yaml            # Development Kubernetes manifests
│   └── README.md                      # CI/CD documentation
├── Dockerfile                         # Multi-stage Docker build
├── nginx.conf                         # Nginx configuration
├── .gitlab-ci.yml                     # GitLab CI/CD pipeline
└── .dockerignore                      # Docker build exclusions
```

## Features

### Implemented
- ✅ Mobile-first responsive design
- ✅ Six issue categories with dynamic forms
- ✅ Form validation and error handling
- ✅ Camera and image upload UI
- ✅ QR code scanner UI (ready for native bridge)
- ✅ Base form fields (name, phone, email)
- ✅ Radio button groups
- ✅ Conditional form fields
- ✅ File upload component
- ✅ Complete CI/CD pipeline

### Pending
- ⏳ Zendesk API integration
- ⏳ Native mobile bridge (camera, photo library, QR scanner)
- ⏳ Form submission and success states
- ⏳ Error handling and retry logic
- ⏳ Analytics integration
- ⏳ Internationalization (i18n)

## Environment Configuration

### Development Environment
```bash
VITE_ENV=development
VITE_SUPABASE_URL=your_dev_supabase_url
VITE_SUPABASE_ANON_KEY=your_dev_anon_key
```

### Production Environment
```bash
VITE_ENV=production
VITE_SUPABASE_URL=your_prod_supabase_url
VITE_SUPABASE_ANON_KEY=your_prod_anon_key
```

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Docker

### Build Docker Image
```bash
docker build -t helpcenter-h5:local .
```

### Run Docker Container
```bash
docker run -p 8080:80 helpcenter-h5:local
```

Access at: http://localhost:8080

### Test Health Endpoint
```bash
curl http://localhost:8080/health
```

## CI/CD Pipeline

### Pipeline Stages

1. **Build** - Compiles the application
   - Runs on: master, develop branches
   - Artifacts: dist/ directory
   - Cache: node_modules/

2. **Package** - Creates Docker image
   - Runs on: master, develop branches
   - Pushes to AWS ECR
   - Image tag: helpcenter-h5-{COMMIT_SHA}

3. **Deploy** - Deploys to Kubernetes
   - Master → Production (fargate cluster)
   - Develop → Development (fargate-dev cluster)
   - Namespace: deployed

### GitLab CI/CD Variables

Required environment variables in GitLab:
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_DEFAULT_REGION=us-east-2
```

### Branch Strategy

| Branch | Environment | Cluster | Domain | Auto-Deploy |
|--------|------------|---------|---------|-------------|
| master | Production | fargate | home.veoride.com | Yes |
| develop | Development | fargate-dev | home-dev.veoride.com | Yes |

## Kubernetes Deployment

### Resources
- **Replicas**: 2 (production), 1 (development)
- **CPU Request**: 250m
- **Memory Request**: 512Mi
- **CPU Limit**: 500m
- **Memory Limit**: 1Gi

### Health Checks
- **Liveness Probe**: HTTP GET / (initial delay: 30s, period: 10s)
- **Readiness Probe**: HTTP GET / (initial delay: 5s, period: 5s)

### Service
- **Type**: NodePort
- **Port**: 80
- **Target Port**: 80

## Deployment Commands

### View Deployment Status
```bash
kubectl get deployments -n deployed
kubectl get pods -n deployed -l app=helpcenter-h5
kubectl get services -n deployed
```

### View Logs
```bash
# All pods
kubectl logs -f deployment/helpcenter-h5-deployment -n deployed

# Specific pod
kubectl logs -f <pod-name> -n deployed
```

### Rollback Deployment
```bash
# Rollback to previous version
kubectl rollout undo deployment/helpcenter-h5-deployment -n deployed

# Check rollout status
kubectl rollout status deployment/helpcenter-h5-deployment -n deployed

# View rollout history
kubectl rollout history deployment/helpcenter-h5-deployment -n deployed
```

### Scale Deployment
```bash
# Scale to 3 replicas
kubectl scale deployment/helpcenter-h5-deployment --replicas=3 -n deployed
```

### Update Deployment
```bash
# Update image
kubectl set image deployment/helpcenter-h5-deployment \
  helpcenter-h5=488938767527.dkr.ecr.us-east-2.amazonaws.com/veo-service:helpcenter-h5-new-sha \
  -n deployed
```

## Monitoring

### Application Metrics
- Response time
- Error rates
- Request count
- Active users

### Infrastructure Metrics
- Pod CPU usage
- Pod memory usage
- Pod restart count
- Service availability

### Health Endpoints
- `/` - Main application (200 OK)
- `/health` - Health check (200 OK with "healthy" text)

## Troubleshooting

### Build Failures
```bash
# Check build logs in GitLab CI/CD
# Verify package.json and dependencies
npm ci --no-audit --no-fund
npm run build
```

### Docker Build Failures
```bash
# Test locally
docker build -t helpcenter-h5:test .

# Check Dockerfile syntax
docker build --no-cache -t helpcenter-h5:test .
```

### Deployment Failures
```bash
# Check pod status
kubectl describe pod <pod-name> -n deployed

# Check events
kubectl get events -n deployed --sort-by='.lastTimestamp'

# Check deployment status
kubectl describe deployment helpcenter-h5-deployment -n deployed
```

### Pod Not Starting
```bash
# Check pod logs
kubectl logs <pod-name> -n deployed

# Check previous logs if pod restarted
kubectl logs <pod-name> -n deployed --previous

# Check resource quotas
kubectl describe resourcequota -n deployed
```

## Security

### Best Practices
- ✅ Docker multi-stage builds (reduced image size)
- ✅ Non-root user in container
- ✅ Security headers in Nginx
- ✅ Private ECR registry
- ✅ RBAC in Kubernetes
- ✅ Secrets management via GitLab variables
- ✅ Regular dependency updates
- ✅ No secrets in codebase

### Security Headers
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
```

## Performance Optimization

### Frontend
- ✅ Code splitting (Vite automatic)
- ✅ Tree shaking (Vite automatic)
- ✅ Asset optimization
- ✅ Gzip compression (Nginx)
- ✅ Cache headers for static assets (1 year)
- ✅ No cache for index.html

### Infrastructure
- ✅ Multi-stage Docker builds
- ✅ Alpine Linux base images
- ✅ Multiple replicas for load distribution
- ✅ Health checks for zero-downtime deployments
- ✅ Resource limits to prevent resource exhaustion

## Support

### Contacts
- **DevOps**: li.zhou@veoride.com
- **Frontend Team**: [Your team contact]

### Resources
- GitLab Repository: [Repository URL]
- AWS ECR: 488938767527.dkr.ecr.us-east-2.amazonaws.com
- Kubernetes Dashboard: [Dashboard URL]

## Future Enhancements

1. **Integration**
   - Zendesk API integration
   - Native mobile bridge for camera/QR scanner
   - Analytics tracking

2. **Features**
   - Multi-language support (i18n)
   - Offline support with service workers
   - Form auto-save and recovery
   - File compression before upload

3. **Infrastructure**
   - CDN integration
   - Auto-scaling based on traffic
   - Blue-green deployment
   - Canary releases

4. **Monitoring**
   - Application Performance Monitoring (APM)
   - Error tracking (Sentry)
   - User session recording
   - A/B testing framework
