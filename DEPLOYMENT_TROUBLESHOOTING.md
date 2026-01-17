# Deployment Troubleshooting Guide

## Issue: "deployment exceeded its progress deadline"

### What Happened
The Kubernetes deployment failed with the error: `deployment "devops-api" exceeded its progress deadline`

This means the deployment couldn't complete within the default 10-minute timeout.

### Root Cause
The pods couldn't pull the Docker image from DockerHub because:

1. **Missing Image Pull Secret**: Kubernetes needs credentials to pull private images from DockerHub
2. **No imagePullPolicy**: The deployment didn't specify when to pull images
3. **Authentication Required**: DockerHub requires authentication for private repositories

### How It Was Fixed

#### 1. Added Docker Registry Secret
The CD workflow now creates a Kubernetes secret with DockerHub credentials:

```yaml
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=${{ secrets.DOCKERHUB_USERNAME }} \
  --docker-password=${{ secrets.DOCKERHUB_TOKEN }} \
  --namespace=devops-demo
```

#### 2. Updated Deployment to Use Secret
Added `imagePullSecrets` to the deployment:

```yaml
spec:
  imagePullSecrets:
  - name: dockerhub-secret
  containers:
  - name: api
    imagePullPolicy: Always
```

#### 3. Added Better Debugging
The CD workflow now shows detailed error information when rollout fails:
- Pod status
- Recent events
- Pod descriptions

### How to Diagnose Issues

Run the diagnostic script:
```bash
chmod +x scripts/diagnose-deployment.sh
./scripts/diagnose-deployment.sh
```

Or manually check:
```bash
# Check deployment status
kubectl get deployment devops-api -n devops-demo

# Check pod status
kubectl get pods -n devops-demo -l app=devops-api

# Check pod logs
kubectl logs -n devops-demo -l app=devops-api --tail=50

# Check events
kubectl get events -n devops-demo --sort-by='.lastTimestamp'

# Describe pods (shows image pull errors)
kubectl describe pods -n devops-demo -l app=devops-api
```

### Common Issues and Solutions

#### Issue: ImagePullBackOff
**Symptom**: Pods show `ImagePullBackOff` or `ErrImagePull`
**Solution**: 
- Verify DockerHub credentials are correct
- Ensure image exists in DockerHub
- Check imagePullSecrets is configured

#### Issue: CrashLoopBackOff
**Symptom**: Pods keep restarting
**Solution**:
- Check pod logs: `kubectl logs <pod-name> -n devops-demo`
- Verify environment variables in ConfigMap
- Check application startup issues

#### Issue: Pods Pending
**Symptom**: Pods stuck in `Pending` state
**Solution**:
- Check node resources: `kubectl describe nodes`
- Verify resource requests/limits are reasonable
- Ensure node has enough CPU/memory

#### Issue: Health Check Failures
**Symptom**: Pods running but not ready
**Solution**:
- Verify /health endpoint works
- Check readiness probe timing (initialDelaySeconds)
- Review application logs

### Load Balancer Information

Your DigitalOcean Load Balancer:
- **IP**: 152.42.158.147
- **Status**: Creating/Active
- **Cost**: ~$12/month
- **Purpose**: Routes external traffic to your application via Ingress

Once the deployment succeeds, your app will be accessible at:
```
http://152.42.158.147/health
http://152.42.158.147/api/users
```

### Next Steps

1. **Push to main branch** - The fixed CD workflow will run
2. **Monitor the deployment** - Check GitHub Actions logs
3. **Verify deployment** - Once successful, test the external IP
4. **Check Load Balancer** - Ensure it has the external IP assigned

### Useful Commands

```bash
# Watch deployment progress
kubectl rollout status deployment/devops-api -n devops-demo

# Get external IP
kubectl get ingress devops-api-ingress -n devops-demo

# Test health endpoint
curl http://152.42.158.147/health

# Restart deployment (if needed)
kubectl rollout restart deployment/devops-api -n devops-demo

# Delete and recreate (nuclear option)
kubectl delete -f k8s/
kubectl apply -f k8s/
```
