#!/bin/bash

# Kubernetes Port Forwarding Script
# This script sets up port forwarding to the application service

set -e  # Exit on any error

echo "🔗 DevOps CI/CD Pipeline - Port Forwarding Setup"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Cannot set up port forwarding."
    exit 1
fi

# Check if the namespace exists
if ! kubectl get namespace devops-demo &> /dev/null; then
    echo "❌ devops-demo namespace not found. Is the application deployed?"
    echo "💡 Run ./scripts/deploy-local.sh to deploy the application first"
    exit 1
fi

# Check if the service exists
if ! kubectl get service devops-api-service -n devops-demo &> /dev/null; then
    echo "❌ devops-api-service not found in devops-demo namespace"
    echo "💡 Run ./scripts/deploy-local.sh to deploy the application first"
    exit 1
fi

# Default port
LOCAL_PORT=8080

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            LOCAL_PORT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -p, --port PORT   Local port to forward to (default: 8080)"
            echo "  -h, --help        Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                # Forward to localhost:8080"
            echo "  $0 -p 3000        # Forward to localhost:3000"
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "💡 Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Check if port is already in use
if lsof -Pi :$LOCAL_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port $LOCAL_PORT is already in use"
    echo "💡 Try a different port with: $0 -p <port_number>"
    echo "💡 Or stop the process using port $LOCAL_PORT"
    exit 1
fi

# Show service status
echo "📊 Service status:"
kubectl get service devops-api-service -n devops-demo
echo ""

# Show pod status
echo "📊 Pod status:"
kubectl get pods -l app=devops-api -n devops-demo
echo ""

# Check if pods are ready
READY_PODS=$(kubectl get pods -l app=devops-api -n devops-demo --no-headers | grep "Running" | grep "1/1" | wc -l)
if [ "$READY_PODS" -eq 0 ]; then
    echo "⚠️  No pods are ready yet. Port forwarding may not work immediately."
    echo "💡 Wait for pods to be ready or check logs with: ./scripts/logs.sh"
fi

echo "🔗 Setting up port forwarding..."
echo "   Local port: $LOCAL_PORT"
echo "   Target: devops-api-service:80 (devops-demo namespace)"
echo ""

# Set up port forwarding
echo "🚀 Starting port forwarding (Press Ctrl+C to stop)..."
echo ""
echo "📍 Application will be available at:"
echo "   🌐 Main URL: http://localhost:$LOCAL_PORT"
echo "   🏥 Health Check: http://localhost:$LOCAL_PORT/health"
echo "   👥 Users API: http://localhost:$LOCAL_PORT/api/users"
echo ""
echo "🔧 Other useful commands:"
echo "   📋 View logs: ./scripts/logs.sh"
echo "   🧹 Cleanup: ./scripts/cleanup.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start port forwarding
kubectl port-forward service/devops-api-service $LOCAL_PORT:80 -n devops-demo