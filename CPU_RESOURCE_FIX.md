# CPU Resource Issue - FIXED

## The Real Problem

Your pods were **NEVER running** - they were stuck in `Pending` state with this error:

```
Warning  FailedScheduling   0/1 nodes are available: 1 Insufficient cpu
```

### Root Cause

Your DigitalOcean cluster has:
- **1 vCPU node** (1000m total CPU)
- **NGINX Ingress Controller** (using ~100-200m CPU)
- **System pods** (using ~100-200m CPU)
- **Available CPU**: ~600-800m

Your deployment was requesting:
- **2 replicas** × **100m CPU** = **200m minimum**
- **Plus limits**: 2 × 200m = 400m maximum

The node simply didn't have enough CPU to schedule even one pod!

## The Fix

### 1. Reduced Replicas
```yaml
replicas: 1  # Changed from 2
```

### 2. Reduced CPU Requests
```yaml
resources:
  requests:
    memory: "64Mi"   # Changed from 128Mi
    cpu: "50m"       # Changed from 100m
  limits:
    memory: "128Mi"  # Changed from 256Mi
    cpu: "100m"      # Changed from 200m
```

### New Resource Usage
- **1 replica** × **50m CPU** = **50m minimum**
- **Limit**: 100m maximum
- **This fits comfortably** on your 1 vCPU node!

## How to Apply the Fix

### Option 1: Clean Up and Redeploy (Recommended)

```bash
# 1. Set your kubeconfig
export KUBECONFIG=kubeconfig

# 2. Run the cleanup script
chmod +x scripts/cleanup-stuck-deployment.sh
./scripts/cleanup-stuck-deployment.sh

# 3. Push changes to main branch
git add k8s/deployment.yaml
git commit -m "fix: reduce resource requests for 1 vCPU node"
git push origin main

# The CD pipeline will automatically deploy with the new configuration
```

### Option 2: Manual Cleanup and Apply

```bash
# Set your kubeconfig
export KUBECONFIG=kubeconfig

# Delete stuck deployment
kubectl delete deployment devops-api -n devops-demo

# Delete stuck replica sets
kubectl delete replicaset -n devops-demo -l app=devops-api

# Apply the fixed configuration
kubectl apply -f k8s/

# Watch the deployment
kubectl rollout status deployment/devops-api -n devops-demo
```

## Verification

After applying the fix, verify the deployment:

```bash
# Check pod status (should show Running)
kubectl get pods -n devops-demo -l app=devops-api

# Check deployment status
kubectl get deployment devops-api -n devops-demo

# Check node resource usage
kubectl top nodes

# Check pod resource usage
kubectl top pods -n devops-demo
```

Expected output:
```
NAME                          READY   STATUS    RESTARTS   AGE
devops-api-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
```

## Why This Happened

1. **Small Node**: 1 vCPU is minimal for Kubernetes
2. **System Overhead**: Ingress controller and system pods use significant resources
3. **Over-provisioning**: Requesting 2 replicas with 100m each was too much
4. **No Auto-scaling**: DigitalOcean cluster wasn't configured to add nodes

## Recommendations

### For Production

If you need high availability (2+ replicas), you have two options:

#### Option A: Upgrade Node Size
```bash
# Upgrade to 2 vCPU node ($24/month instead of $12/month)
doctl kubernetes cluster node-pool update <cluster-id> <pool-id> --size s-2vcpu-4gb
```

#### Option B: Add More Nodes
```bash
# Add another 1 vCPU node ($12/month additional)
doctl kubernetes cluster node-pool create <cluster-id> --name pool-2 --size s-1vcpu-2gb --count 1
```

### For This Demo

The current configuration (1 replica, 50m CPU) is perfect for:
- ✅ Demonstrating CI/CD pipeline
- ✅ Running on minimal infrastructure
- ✅ Keeping costs low ($24/month total)
- ✅ Testing and development

## Cost Breakdown

**Current Setup** (after fix):
- DigitalOcean Kubernetes: $12/month (1 vCPU, 2GB RAM)
- Load Balancer: $12/month
- **Total**: $24/month

**With 2 Replicas** (requires upgrade):
- DigitalOcean Kubernetes: $24/month (2 vCPU, 4GB RAM)
- Load Balancer: $12/month
- **Total**: $36/month

## Next Steps

1. **Clean up stuck pods** using the script above
2. **Push the fixed configuration** to main branch
3. **Watch the CD pipeline** deploy successfully
4. **Test your application** at http://152.42.158.147

The deployment should complete in ~2-3 minutes now!
