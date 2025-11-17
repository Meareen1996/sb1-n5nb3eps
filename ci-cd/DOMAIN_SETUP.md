# 域名配置指南

## 📋 配置步骤

### 1. 修改 Ingress 域名

编辑 `ci-cd/deployment.yaml` 第 26 行，将 `helpcenter.yourdomain.com` 替换为你的实际域名：

```yaml
- host: helpcenter.yourdomain.com  # 改成你的域名，例如：helpcenter.veoride.com
```

### 2. 检查 EKS 集群是否有 AWS Load Balancer Controller

运行以下命令检查：

```bash
kubectl get deployment -n kube-system aws-load-balancer-controller
```

**如果没有安装**，需要先安装 AWS Load Balancer Controller：

```bash
# 1. 创建 IAM policy
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.0/docs/install/iam_policy.json

aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json

# 2. 创建 IAM role 和 service account
eksctl create iamserviceaccount \
  --cluster=fargate \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::<AWS-ACCOUNT-ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --region us-east-2 \
  --approve

# 3. 安装 controller
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=fargate \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-east-2 \
  --set vpcId=<YOUR-VPC-ID>
```

### 3. 部署更新后的配置

推送代码到 GitLab，CI/CD 会自动部署 Ingress：

```bash
git add ci-cd/deployment.yaml
git commit -m "Add Ingress for domain access"
git push origin master
```

### 4. 获取 Load Balancer 地址

部署完成后，运行：

```bash
kubectl get ingress helpcenter-h5-ingress -n deployed
```

输出类似：

```
NAME                     CLASS    HOSTS                        ADDRESS                                                              PORTS     AGE
helpcenter-h5-ingress    <none>   helpcenter.veoride.com       k8s-deployed-helpcent-xxx-123456789.us-east-2.elb.amazonaws.com      80, 443   5m
```

复制 `ADDRESS` 列的值（ALB 地址）。

### 5. 在 Cloudflare 配置 DNS

登录 Cloudflare：

1. 选择你的域名
2. 进入 **DNS** 设置
3. 添加 **CNAME** 记录：
   - **Type**: CNAME
   - **Name**: helpcenter （或你选择的子域名）
   - **Target**: `k8s-deployed-helpcent-xxx-123456789.us-east-2.elb.amazonaws.com`（步骤4获取的地址）
   - **Proxy status**: DNS only（灰云，关闭代理）
   - **TTL**: Auto

4. 保存

### 6. 验证访问

等待 DNS 传播（通常 1-5 分钟），然后访问：

```
http://helpcenter.yourdomain.com
```

## 🔧 故障排查

### 问题 1：Ingress 没有获取到 ADDRESS

```bash
# 检查 Load Balancer Controller 日志
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# 检查 Ingress 详情
kubectl describe ingress helpcenter-h5-ingress -n deployed
```

### 问题 2：域名无法访问

```bash
# 测试 DNS 解析
nslookup helpcenter.yourdomain.com

# 测试 ALB 是否可访问
curl -I http://k8s-deployed-helpcent-xxx.us-east-2.elb.amazonaws.com
```

### 问题 3：502 Bad Gateway

```bash
# 检查 Pod 状态
kubectl get pods -n deployed -l app=helpcenter-h5

# 检查 Service
kubectl get svc helpcenter-h5 -n deployed
```

## 📌 重要提醒

1. **替换域名**：务必将 `helpcenter.yourdomain.com` 改为你的实际域名
2. **SSL/TLS**：此配置支持 HTTPS（443端口），ALB 会自动重定向 HTTP 到 HTTPS
3. **Cloudflare 代理**：初次配置建议使用 "DNS only" 模式，确认工作正常后可启用 Cloudflare 代理
