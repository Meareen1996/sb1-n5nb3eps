# CI/CD Configuration for Help Center H5

This directory contains the CI/CD pipeline configuration for deploying the Help Center H5 application to AWS EKS.

## Pipeline Overview

The CI/CD pipeline consists of three main stages:

1. **Build** - Compiles the React application
2. **Package** - Builds and pushes Docker image to AWS ECR
3. **Deploy** - Deploys to Kubernetes cluster on AWS EKS

## Files Description

### package.sh
Builds the application using npm. Handles different environment configurations:
- `master` branch → Production build
- Other branches → Development build

### build.sh
- Authenticates with AWS ECR
- Builds Docker image with the application
- Pushes the image to ECR registry with commit SHA as tag

### deploy.sh
Deploys to AWS EKS using aws-cli:
- `master` branch → Deploys to `fargate` cluster
- Other branches → Deploys to `fargate-dev` cluster
- Target namespace: `deployed`

### kube_deploy.sh
Alternative deployment script using kubectl configuration:
- Uses environment variables for cluster configuration
- `master` branch → Deploys to `prod` namespace
- Other branches → Deploys to `dev` namespace

### deployment.yaml
Kubernetes deployment configuration:
- Service: NodePort on port 80
- Deployment: 2 replicas with health checks
- Resources: 250m CPU / 512Mi RAM (requests), 500m CPU / 1Gi RAM (limits)
- Health checks: Liveness and readiness probes

## Environment Variables Required

The following environment variables need to be configured in GitLab CI/CD settings:

### For AWS ECR & EKS (deploy.sh)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_DEFAULT_REGION` - AWS region (default: us-east-2)

### For kubectl (kube_deploy.sh)
- `SERVER` - Kubernetes API server URL
- `CERTIFICATE_AUTHORITY_DATA` - Cluster certificate
- `USER_TOKEN` - GitLab service account token

### GitLab CI Variables
- `CI_COMMIT_SHA` - Automatically provided by GitLab
- `CI_COMMIT_REF_NAME` - Automatically provided by GitLab

## Docker Image

The application is containerized using a multi-stage Dockerfile:
- **Build stage**: Node.js 18 Alpine - builds the application
- **Production stage**: Nginx Alpine - serves the static files

Image naming convention:
```
488938767527.dkr.ecr.us-east-2.amazonaws.com/veo-service:helpcenter-h5-{COMMIT_SHA}
```

## Deployment Strategy

### Branch Deployment
- **master**: Deploys to production (fargate cluster)
- **develop**: Deploys to development (fargate-dev cluster)
- **feature/***: Builds only, no deployment
- **tags**: Manual deployment using kube_deploy.sh

### Kubernetes Resources
- Service: Exposes application on port 80
- Deployment: Manages pod replicas and rolling updates
- Health checks: Ensures pod readiness before routing traffic

## Usage

### Manual Deployment
```bash
# Set environment variables
export CI_COMMIT_SHA=$(git rev-parse HEAD)
export CI_COMMIT_REF_NAME=$(git rev-parse --abbrev-ref HEAD)

# Build the application
./ci-cd/package.sh

# Build and push Docker image
./ci-cd/build.sh

# Deploy to Kubernetes
./ci-cd/deploy.sh
```

### Rollback
To rollback to a previous version:
```bash
kubectl rollout undo deployment/helpcenter-h5-deployment -n deployed
```

### View Deployment Status
```bash
kubectl get pods -n deployed -l app=helpcenter-h5
kubectl logs -f deployment/helpcenter-h5-deployment -n deployed
```

## Health Checks

The application includes health check endpoints:
- `/` - Main application
- `/health` - Health check endpoint for Kubernetes probes

## Security

- Docker images are stored in private AWS ECR
- All sensitive credentials are stored in GitLab CI/CD variables
- Kubernetes uses RBAC for access control
- Application includes security headers in nginx configuration

## Monitoring

Health checks are configured:
- **Liveness probe**: Checks if the container is running (initial delay: 30s)
- **Readiness probe**: Checks if the container is ready to serve traffic (initial delay: 5s)

## Support

For issues or questions about the CI/CD pipeline, contact:
- li.zhou@veoride.com
