#!/bin/bash

# Local Kubernetes Deployment Script
# This script deploys the DevOps CI/CD Pipeline application to a local Minikube cluster

set -e  # Exit on any error

echo "🚀 Starting local Kubernetes deployment..."

# Check if Minikube is installed
if ! command -v minikube &> /dev/null; then
    echo "❌ Minikube is not installed. Please install Minikube first."
    echo "   Visit: https://minikube.sigs.k8s.io/docs/start/"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    echo "   Visit: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Start Minikube if not running
echo "🔍 Checking Minikube status..."
if ! minikube status &> /dev/null; then
    echo "🚀 Starting Minikube..."
    minikube start
    echo "✅ Minikube started successfully"
else
    echo "✅ Minikube is already running"
fi

# Enable ingress addon
echo "🔧 Enabling ingress addon..."
minikube addons enable ingress
echo "✅ Ingress addon enabled"

# Wait for ingress controller to be ready
echo "⏳ Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

# Apply Kubernetes manifests
echo "📦 Applying Kubernetes manifests..."
kubectl apply -f k8s/
echo "✅ Kubernetes manifests applied"

# Wait for deployment to be ready
echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/devops-api -n devops-demo
echo "✅ Deployment is ready"

# Get deployment status
echo "📊 Deployment status:"
kubectl get deployment devops-api -n devops-demo
kubectl get pods -l app=devops-api -n devops-demo

# Set up port forwarding in background
echo "🔗 Setting up port forwarding..."
kubectl port-forward service/devops-api-service 8080:80 -n devops-demo &
PORT_FORWARD_PID=$!

# Wait a moment for port forwarding to establish
sleep 3

# Display access information
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📍 Application Access:"
echo "   Local URL: http://localhost:8080"
echo "   Health Check: http://localhost:8080/health"
echo "   Users API: http://localhost:8080/api/users"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: ./scripts/logs.sh"
echo "   Stop port forwarding: kill $PORT_FORWARD_PID"
echo "   Cleanup: ./scripts/cleanup.sh"
echo ""
echo "💡 Port forwarding is running in background (PID: $PORT_FORWARD_PID)"
echo "   Press Ctrl+C to stop this script, but port forwarding will continue"
echo ""

# Test health endpoint
echo "🏥 Testing health endpoint..."
sleep 2
if curl -f --max-time 10 "http://localhost:8080/health" &> /dev/null; then
    echo "✅ Health check passed!"
else
    echo "⚠️  Health check failed - application may still be starting up"
    echo "   Try accessing http://localhost:8080/health in a few moments"
fi

echo ""
echo "🎯 Deployment complete! Application is running locally."