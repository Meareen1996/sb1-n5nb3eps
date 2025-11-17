# Quick Reference - ALB and Domain Management

## 🚨 Problem: 404 After Redeployment

### Root Cause
ALB address changed, but DNS still points to old address.

### Quick Fix
```bash
# 1. Get current ALB address
kubectl get ingress helpcenter-h5-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# 2. Update Cloudflare DNS record to new address
# Login to Cloudflare → DNS → Edit CNAME → Update Target

# 3. Wait 5 minutes and test
curl -I http://home.veoride.com
```

---

## ✅ Solution: Stable ALB Configuration

We've added `group.name` annotation to prevent ALB changes:

```yaml
annotations:
  alb.ingress.kubernetes.io/group.name: veoride-prod-alb  # Production
  alb.ingress.kubernetes.io/group.name: veoride-dev-alb   # Development
```

**Benefits:**
- ✅ Same ALB across deployments
- ✅ DNS configured once
- ✅ No more 404 after redeployment

---

## 📋 Quick Commands

### Check ALB Status
```bash
# Production
kubectl get ingress helpcenter-h5-ingress -n deployed

# Development
kubectl get ingress helpcenter-h5-dev-ingress -n deployed
```

### Get ALB Address
```bash
# Production (one-liner)
kubectl get ingress helpcenter-h5-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Development (one-liner)
kubectl get ingress helpcenter-h5-dev-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Test Connectivity
```bash
# DNS resolution
nslookup home.veoride.com

# HTTP test
curl -I http://home.veoride.com

# Full test
ALB=$(kubectl get ingress helpcenter-h5-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "ALB: $ALB"
curl -I http://$ALB
curl -I http://home.veoride.com
```

### Check Pod Health
```bash
# Status
kubectl get pods -n deployed -l app=helpcenter-h5

# Logs
kubectl logs -n deployed -l app=helpcenter-h5 --tail=50

# Describe
kubectl describe pod -n deployed -l app=helpcenter-h5
```

---

## 🔧 Common Issues

| Issue | Command | Expected Result |
|-------|---------|----------------|
| No ALB address | `kubectl describe ingress -n deployed helpcenter-h5-ingress` | Check Events section |
| Pod not ready | `kubectl get pods -n deployed -l app=helpcenter-h5` | Should show 1/1 READY |
| DNS not resolving | `nslookup home.veoride.com` | Should return ALB address |
| 502 error | `kubectl logs -n deployed -l app=helpcenter-h5` | Check for errors |

---

## 📊 Environment Info

| Environment | Cluster | Domain | ALB Group | Namespace |
|-------------|---------|--------|-----------|-----------|
| Production | `fargate` | `home.veoride.com` | `veoride-prod-alb` | `deployed` |
| Development | `fargate-dev` | `home-dev.veoride.com` | `veoride-dev-alb` | `deployed` |

---

## 📖 Full Documentation

- **ALB Troubleshooting**: `ci-cd/ALB_TROUBLESHOOTING.md`
- **Domain Setup**: `ci-cd/DOMAIN_SETUP.md`
- **Deployment Guide**: `ci-cd/README.md`

---

## 🆘 Emergency Checklist

If site is down:

- [ ] Check Pod status: `kubectl get pods -n deployed -l app=helpcenter-h5`
- [ ] Check Ingress: `kubectl get ingress -n deployed`
- [ ] Check ALB address hasn't changed
- [ ] Check DNS points to correct ALB
- [ ] Check pod logs for errors
- [ ] Verify Service exists: `kubectl get svc helpcenter-h5 -n deployed`
- [ ] Check AWS console for ALB health checks

**Still broken?** See `ALB_TROUBLESHOOTING.md` for detailed diagnosis.
