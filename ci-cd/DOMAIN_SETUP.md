# 域名配置指南

## ⚠️ 重要提示：ALB稳定性

我们的Ingress配置已经包含 `alb.ingress.kubernetes.io/group.name` annotation，这意味着：

✅ **ALB地址不会改变** - 重新部署时使用相同的ALB
✅ **DNS只需配置一次** - 不需要每次部署后更新DNS
✅ **成本更低** - 多个服务共享同一个ALB

**如果遇到404问题，请查看 `ALB_TROUBLESHOOTING.md` 文档。**

---

## 📋 首次部署配置步骤

### 1. 验证 Ingress 域名

检查域名配置是否正确：

**生产环境** (`ci-cd/deployment.yaml`):
```yaml
spec:
  rules:
  - host: home.veoride.com  # 生产域名
```

**开发环境** (`ci-cd/deployment-dev.yaml`):
```yaml
spec:
  rules:
  - host: home-dev.veoride.com  # 开发域名
```

### 2. (可选) 检查 AWS Load Balancer Controller

⚠️ **注意：如果集群已经部署过其他服务并使用ALB，这一步可能已经完成，可以跳过。**

运行以下命令检查：

```bash
kubectl get deployment -n kube-system aws-load-balancer-controller
```

**如果没有安装**，需要先安装 AWS Load Balancer Controller。

### 3. 部署应用

推送代码到 GitLab，CI/CD 会自动部署：

```bash
git add .
git commit -m "Deploy helpcenter-h5"
git push origin master  # 生产环境
# 或
git push origin develop # 开发环境
```

### 4. 获取 ALB 地址

部署完成后（等待3-5分钟），获取ALB地址：

**生产环境：**
```bash
kubectl get ingress helpcenter-h5-ingress -n deployed
```

**开发环境：**
```bash
kubectl get ingress helpcenter-h5-dev-ingress -n deployed
```

输出示例：
```
NAME                      CLASS    HOSTS                   ADDRESS                                                PORTS     AGE
helpcenter-h5-ingress     <none>   home.veoride.com        k8s-veoride-prodal-abc123.us-east-2.elb.amazonaws.com  80, 443   5m
```

**重要：** 注意ALB名称包含 `veoride-prodal` 或 `veoride-deval`，这表示使用了稳定的ALB group。

**一键获取命令：**
```bash
# 生产环境ALB
kubectl get ingress helpcenter-h5-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# 开发环境ALB
kubectl get ingress helpcenter-h5-dev-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### 5. 在 Cloudflare 配置 DNS

登录 Cloudflare Dashboard:

#### 生产环境 (home.veoride.com)

1. 选择域名 `veoride.com`
2. 进入 **DNS** 设置
3. 添加/编辑 **CNAME** 记录：
   - **Type**: CNAME
   - **Name**: `home`
   - **Target**: `k8s-veoride-prodal-xxx.us-east-2.elb.amazonaws.com` （步骤4获取）
   - **Proxy status**: ☁️ DNS only（灰云图标，关闭代理）
   - **TTL**: Auto
4. 点击 **Save**

#### 开发环境 (home-dev.veoride.com)

1. 在同一个域名下
2. 添加/编辑 **CNAME** 记录：
   - **Type**: CNAME
   - **Name**: `home-dev`
   - **Target**: `k8s-veoride-deval-xxx.us-east-2.elb.amazonaws.com` （步骤4获取）
   - **Proxy status**: ☁️ DNS only（灰云图标，关闭代理）
   - **TTL**: Auto
3. 点击 **Save**

**💡 提示：** 因为使用了ALB group，这个地址应该是稳定的，只需配置一次！

### 6. 验证访问

等待 DNS 传播（通常 1-5 分钟），然后测试：

**生产环境：**
```bash
# 测试DNS解析
nslookup home.veoride.com

# 测试HTTP访问
curl -I http://home.veoride.com

# 浏览器访问
open http://home.veoride.com  # macOS
# 或直接在浏览器打开 http://home.veoride.com
```

**开发环境：**
```bash
# 测试DNS解析
nslookup home-dev.veoride.com

# 测试HTTP访问
curl -I http://home-dev.veoride.com

# 浏览器访问
open http://home-dev.veoride.com  # macOS
```

**期望结果：**
- DNS解析到ALB地址
- HTTP返回 200 OK 或重定向到HTTPS
- 浏览器显示H5应用界面

---

## 🔧 快速故障排查

### ❌ 重新部署后出现404

**原因：** ALB地址可能变化了（虽然不应该），或DNS记录未更新

**解决：** 查看详细的故障排查文档
```bash
cat ci-cd/ALB_TROUBLESHOOTING.md
```

### ❌ Ingress 没有获取到 ADDRESS

```bash
# 检查 Load Balancer Controller 日志
kubectl logs -n kube-system deployment/aws-load-balancer-controller --tail=100

# 检查 Ingress 详情（查看Events）
kubectl describe ingress helpcenter-h5-ingress -n deployed

# 重启controller
kubectl rollout restart deployment/aws-load-balancer-controller -n kube-system
```

### ❌ 域名无法访问

```bash
# 1. 验证DNS解析
nslookup home.veoride.com

# 2. 测试ALB直接访问
ALB=$(kubectl get ingress helpcenter-h5-ingress -n deployed -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl -I http://$ALB

# 3. 测试域名访问
curl -I http://home.veoride.com

# 4. 检查Cloudflare DNS设置
# 确保Proxy status为DNS only（灰云）
```

### ❌ 502 Bad Gateway

```bash
# 1. 检查 Pod 状态
kubectl get pods -n deployed -l app=helpcenter-h5
# 确保显示 1/1 READY

# 2. 查看Pod日志
kubectl logs -n deployed -l app=helpcenter-h5 --tail=50

# 3. 检查 Service
kubectl get svc helpcenter-h5 -n deployed

# 4. 测试Service内部访问
kubectl run test -n deployed --rm -it --image=curlimages/curl -- curl http://helpcenter-h5
```

---

## 📌 重要提醒

### ✅ 关于ALB稳定性

我们的配置使用了 `alb.ingress.kubernetes.io/group.name`，这意味着：

- ✅ **生产环境** 使用 `veoride-prod-alb` group
- ✅ **开发环境** 使用 `veoride-dev-alb` group
- ✅ **同一个group的所有Ingress共享同一个ALB**
- ✅ **ALB地址保持稳定，不会因为重新部署而变化**
- ✅ **DNS记录配置一次即可，无需每次部署更新**

### ⚠️ 注意事项

1. **域名已配置**：
   - 生产：`home.veoride.com`
   - 开发：`home-dev.veoride.com`

2. **SSL/TLS支持**：
   - 配置已启用 HTTPS（443端口）
   - HTTP会自动重定向到HTTPS
   - 如需自定义SSL证书，添加 `alb.ingress.kubernetes.io/certificate-arn`

3. **Cloudflare 代理**：
   - 初次配置：使用 **DNS only** 模式（灰云 ☁️）
   - 验证成功后：可选择启用 Cloudflare 代理（橙云 ⚡）

4. **首次部署后**：
   - 记录ALB地址
   - 配置Cloudflare DNS CNAME记录
   - ⭐ **后续部署无需更改DNS**

5. **故障排查**：
   - 查看 `ALB_TROUBLESHOOTING.md` 获取详细帮助
   - 检查GitLab CI/CD日志
   - 验证Kubernetes资源状态

---

## 🔗 相关文档

- [ALB故障排查指南](./ALB_TROUBLESHOOTING.md) - 详细的问题诊断和解决方案
- [CI/CD部署说明](./README.md) - GitLab CI/CD配置说明
- [Kubernetes部署文件](./deployment.yaml) - 生产环境配置
- [开发环境配置](./deployment-dev.yaml) - 开发环境配置

---

## 📊 检查清单

在配置域名前，确认以下事项：

- [ ] EKS集群已安装 AWS Load Balancer Controller
- [ ] GitLab CI/CD变量已配置（AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY）
- [ ] Ingress配置包含正确的域名
- [ ] Ingress配置包含 `group.name` annotation
- [ ] 代码已推送到正确的分支（master或develop）
- [ ] Ingress已成功创建并获取到ADDRESS
- [ ] ALB地址已记录
- [ ] Cloudflare DNS记录已配置
- [ ] DNS解析正常
- [ ] 应用可以通过域名访问
