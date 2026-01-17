#!/bin/bash

# Kubernetes Cleanup Script
# This script removes all Kubernetes resources for the DevOps CI/CD Pipeline application

set -e  # Exit on any error

echo "🧹 Starting Kubernetes cleanup..."

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Cannot proceed with cleanup."
    exit 1
fi

# Check if the namespace exists
if kubectl get namespace devops-demo &> /dev/null; then
    echo "🔍 Found devops-demo namespace"
    
    # Show current resources before cleanup
    echo "📊 Current resources in devops-demo namespace:"
    kubectl get all -n devops-demo
    echo ""
    
    # Ask for confirmation
    read -p "❓ Are you sure you want to delete all resources? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing all Kubernetes resources..."
        
        # Delete all resources defined in k8s manifests
        kubectl delete -f k8s/ --ignore-not-found=true
        
        echo "✅ All resources removed successfully"
        
        # Verify cleanup
        echo "🔍 Verifying cleanup..."
        if kubectl get namespace devops-demo &> /dev/null; then
            echo "⚠️  Namespace still exists (may contain other resources)"
            kubectl get all -n devops-demo
        else
            echo "✅ Namespace removed completely"
        fi
        
    else
        echo "❌ Cleanup cancelled by user"
        exit 0
    fi
else
    echo "ℹ️  No devops-demo namespace found - nothing to clean up"
fi

# Kill any running port-forward processes
echo "🔗 Checking for running port-forward processes..."
PORT_FORWARD_PIDS=$(pgrep -f "kubectl port-forward.*devops-api-service" || true)
if [ ! -z "$PORT_FORWARD_PIDS" ]; then
    echo "🛑 Stopping port-forward processes..."
    echo "$PORT_FORWARD_PIDS" | xargs kill
    echo "✅ Port-forward processes stopped"
else
    echo "ℹ️  No port-forward processes found"
fi

echo ""
echo "🎉 Cleanup completed!"
echo ""
echo "💡 To redeploy the application, run:"
echo "   ./scripts/deploy-local.sh"