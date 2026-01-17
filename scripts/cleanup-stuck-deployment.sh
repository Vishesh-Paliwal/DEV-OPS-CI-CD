#!/bin/bash
# Script to clean up stuck deployment and start fresh

echo "=== Cleaning up stuck deployment ==="

# Delete the deployment (this will delete all pods)
echo "Deleting deployment..."
kubectl delete deployment devops-api -n devops-demo --ignore-not-found=true

# Wait a moment
sleep 5

# Delete any stuck replica sets
echo "Cleaning up replica sets..."
kubectl delete replicaset -n devops-demo -l app=devops-api

# Wait a moment
sleep 5

# Verify everything is cleaned up
echo ""
echo "=== Verifying cleanup ==="
kubectl get pods -n devops-demo -l app=devops-api
kubectl get replicasets -n devops-demo -l app=devops-api

echo ""
echo "✅ Cleanup complete! Now you can redeploy with the fixed configuration."
echo ""
echo "To redeploy, push your changes to main branch or run:"
echo "kubectl apply -f k8s/"
