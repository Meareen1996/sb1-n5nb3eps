# ALB 故障排查和管理指南

## 问题：重新部署后访问404

### 原因分析

ALB（Application Load Balancer）地址变化通常由以下原因导致：

1. **Ingress没有group.name** - 每次部署创建新的ALB
2. **Ingress被删除重建** - 导致ALB被删除
3. **DNS记录指向旧的ALB** - 新ALB地址未更新到DNS

### 解决方案

#### ✅ 已修复：添加稳定的ALB配置

我们已经在Ingress配置中添加了以下annotations来保持ALB稳定：

```yaml
annotations:
  # 使用ALB分组，多个Ingress共享同一个ALB
  alb.ingress.kubernetes.io/group.name: veoride-prod-alb  # 生产环境
  alb.ingress.kubernetes.io/group.name: veoride-dev-alb   # 开发环境

  # 设置优先级
  alb.ingress.kubernetes.io/group.order: '10'

  # 健康检查配置
  alb.ingress.kubernetes.io/healthcheck-path: /
  alb.ingress.kubernetes.io/healthcheck-protocol: HTTP
```

**好处：**
- ✅ ALB地址不会变化
- ✅ 多个服务可以共享同一个ALB
- ✅ DNS记录只需配置一次
- ✅ 降低AWS成本（少创建ALB）

## 检查和修复步骤

### 1. 检查当前ALB状态

```bash
# 检查生产环境Ingress
kubectl get ingress helpcenter-h5-ingress -n deployed

# 检查开发环境Ingress
kubectl get ingress helpcenter-h5-dev-ingress -n deployed

# 查看详细信息
kubectl describe ingress helpcenter-h5-ingress -n deployed
```

**期望输出：**
```
NAME                      CLASS    HOSTS                ADDRESS                                    PORTS     AGE
helpcenter-h5-ingress     <none>   home.veoride.com     k8s-veoride-prodal-xxx.us-east-2.elb...    80, 443   10m
```

### 2. 获取ALB地址

```bash
# 生产环境
kubectl get ingress helpcenter-h5-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# 开发环境
kubectl get ingress helpcenter-h5-dev-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

**记录这个地址**，例如：`k8s-veoride-prodal-abc123.us-east-2.elb.amazonaws.com`

### 3. 检查DNS配置

#### 方法1：使用nslookup
```bash
nslookup home.veoride.com
nslookup home-dev.veoride.com
```

#### 方法2：使用dig
```bash
dig home.veoride.com
dig home-dev.veoride.com
```

**验证：** DNS应该解析到步骤2获取的ALB地址

### 4. 测试ALB直接访问

```bash
# 直接访问ALB（使用步骤2的地址）
curl -I http://k8s-veoride-prodal-xxx.us-east-2.elb.amazonaws.com

# 使用域名访问
curl -I http://home.veoride.com
```

**期望返回：** HTTP 200 或 301/302

### 5. 更新DNS记录

如果ALB地址变化了，需要更新Cloudflare DNS记录：

1. 登录 Cloudflare Dashboard
2. 选择域名 `veoride.com`
3. 进入 **DNS** 页面
4. 找到记录：
   - `home` (生产)
   - `home-dev` (开发)
5. 点击 **Edit**
6. 更新 **Target** 为新的ALB地址
7. 确保 **Proxy status** 设置为 **DNS only**（灰云）
8. 保存更改

### 6. 验证部署

```bash
# 检查Pod状态
kubectl get pods -n deployed -l app=helpcenter-h5

# 检查Service
kubectl get svc helpcenter-h5 -n deployed

# 检查Pod日志
kubectl logs -n deployed -l app=helpcenter-h5 --tail=50
```

## 常见问题

### Q1: Ingress没有ADDRESS字段

**症状：**
```bash
kubectl get ingress helpcenter-h5-ingress -n deployed
# ADDRESS 列为空
```

**原因：** AWS Load Balancer Controller未正确工作

**解决：**
```bash
# 检查controller状态
kubectl get deployment -n kube-system aws-load-balancer-controller

# 查看controller日志
kubectl logs -n kube-system deployment/aws-load-balancer-controller --tail=100

# 重启controller
kubectl rollout restart deployment/aws-load-balancer-controller -n kube-system
```

### Q2: ALB创建但无法访问（502/503错误）

**可能原因：**
1. Pod未就绪
2. Service配置错误
3. 安全组阻止流量

**排查步骤：**

```bash
# 1. 检查Pod健康状态
kubectl get pods -n deployed -l app=helpcenter-h5
# 确保 READY 列显示 1/1

# 2. 检查Pod日志
kubectl logs -n deployed -l app=helpcenter-h5

# 3. 测试Service内部连通性
kubectl run test-pod -n deployed --rm -it --image=curlimages/curl -- sh
curl http://helpcenter-h5

# 4. 检查Target Group健康状态（AWS Console）
# EC2 → Target Groups → 搜索 k8s-deployed-helpcent
```

### Q3: 域名解析到旧的ALB地址

**原因：** DNS缓存或记录未更新

**解决：**

```bash
# 清除本地DNS缓存
# macOS
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches

# Windows
ipconfig /flushdns

# 等待DNS传播（5-10分钟）
# 使用在线工具检查：https://dnschecker.org
```

### Q4: HTTPS无法访问

**可能原因：**
1. ACM证书未配置
2. Ingress注解缺少HTTPS配置

**检查：**
```bash
# 查看Ingress详情
kubectl describe ingress helpcenter-h5-ingress -n deployed

# 确认annotations包含：
# alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
# alb.ingress.kubernetes.io/ssl-redirect: '443'
```

如需配置SSL证书：
```yaml
annotations:
  alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-2:xxxxx:certificate/xxxxx
```

## 最佳实践

### ✅ DO：

1. **使用ALB group.name** - 保持ALB稳定
2. **记录ALB地址** - 第一次部署后保存地址
3. **使用CNAME记录** - 而不是A记录
4. **监控健康检查** - 确保Target健康
5. **渐进式部署** - 先在dev环境测试

### ❌ DON'T：

1. **不要频繁删除Ingress** - 会导致ALB被删除
2. **不要使用IP地址** - ALB IP会变化，使用域名
3. **不要在Cloudflare开启代理** - 初期配置时关闭代理（灰云）
4. **不要忽略健康检查** - 确保`/`路径可访问

## 快速参考

### 获取ALB信息

```bash
# 快速获取所有信息
kubectl get ingress -n deployed -o wide

# 获取ALB地址（生产）
PROD_ALB=$(kubectl get ingress helpcenter-h5-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Production ALB: $PROD_ALB"

# 获取ALB地址（开发）
DEV_ALB=$(kubectl get ingress helpcenter-h5-dev-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Development ALB: $DEV_ALB"
```

### 测试连通性

```bash
# 一键测试脚本
#!/bin/bash
DOMAIN="home.veoride.com"

echo "=== DNS Resolution ==="
nslookup $DOMAIN

echo -e "\n=== HTTP Test ==="
curl -I http://$DOMAIN

echo -e "\n=== HTTPS Test ==="
curl -I https://$DOMAIN

echo -e "\n=== Service Health ==="
kubectl get pods -n deployed -l app=helpcenter-h5
```

## 监控和告警

建议配置：

1. **CloudWatch Alarms** - ALB健康检查失败告警
2. **Kubernetes Events** - Ingress状态变化监控
3. **DNS监控** - 域名可用性检查

## 联系支持

如果问题持续存在：

1. 检查GitLab CI/CD日志
2. 收集Kubernetes事件：`kubectl get events -n deployed`
3. 导出Ingress配置：`kubectl get ingress -n deployed -o yaml > ingress-config.yaml`
4. 联系DevOps团队

---

**记住：** 使用 `group.name` annotation 后，ALB地址应该保持稳定！
