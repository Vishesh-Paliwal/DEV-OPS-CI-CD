#!/bin/bash
# Diagnostic script to check deployment status

echo "=== Checking Deployment Status ==="
kubectl get deployment devops-api -n devops-demo

echo ""
echo "=== Checking Pod Status ==="
kubectl get pods -n devops-demo -l app=devops-api

echo ""
echo "=== Checking Pod Events ==="
kubectl get events -n devops-demo --sort-by='.lastTimestamp' | tail -20

echo ""
echo "=== Checking Pod Logs (if any pods exist) ==="
POD_NAME=$(kubectl get pods -n devops-demo -l app=devops-api -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ ! -z "$POD_NAME" ]; then
  echo "Logs from pod: $POD_NAME"
  kubectl logs $POD_NAME -n devops-demo --tail=50
else
  echo "No pods found"
fi

echo ""
echo "=== Checking Pod Description (if any pods exist) ==="
if [ ! -z "$POD_NAME" ]; then
  kubectl describe pod $POD_NAME -n devops-demo | tail -30
fi

echo ""
echo "=== Checking Ingress Status ==="
kubectl get ingress devops-api-ingress -n devops-demo

echo ""
echo "=== Checking Service Status ==="
kubectl get service devops-api-service -n devops-demo
