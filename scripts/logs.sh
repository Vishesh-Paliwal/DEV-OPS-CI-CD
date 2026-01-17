#!/bin/bash

# Kubernetes Logs Viewing Script
# This script shows logs from all application pods in real-time

set -e  # Exit on any error

echo "📋 DevOps CI/CD Pipeline - Log Viewer"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Cannot view logs."
    exit 1
fi

# Check if the namespace exists
if ! kubectl get namespace devops-demo &> /dev/null; then
    echo "❌ devops-demo namespace not found. Is the application deployed?"
    echo "💡 Run ./scripts/deploy-local.sh to deploy the application first"
    exit 1
fi

# Check if there are any pods
PODS=$(kubectl get pods -l app=devops-api -n devops-demo --no-headers 2>/dev/null | wc -l)
if [ "$PODS" -eq 0 ]; then
    echo "❌ No application pods found in devops-demo namespace"
    echo "💡 Run ./scripts/deploy-local.sh to deploy the application first"
    exit 1
fi

# Show current pod status
echo "📊 Current pod status:"
kubectl get pods -l app=devops-api -n devops-demo
echo ""

# Parse command line arguments
FOLLOW=false
TAIL_LINES=100

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--tail)
            TAIL_LINES="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -f, --follow     Follow log output (like tail -f)"
            echo "  -n, --tail NUM   Number of lines to show (default: 100)"
            echo "  -h, --help       Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Show last 100 lines"
            echo "  $0 -f                 # Follow logs in real-time"
            echo "  $0 -n 50              # Show last 50 lines"
            echo "  $0 -f -n 200          # Follow logs, starting with last 200 lines"
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "💡 Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Build kubectl logs command
KUBECTL_CMD="kubectl logs -l app=devops-api -n devops-demo --tail=$TAIL_LINES"

if [ "$FOLLOW" = true ]; then
    KUBECTL_CMD="$KUBECTL_CMD -f"
    echo "🔄 Following logs in real-time (Press Ctrl+C to stop)..."
else
    echo "📜 Showing last $TAIL_LINES lines of logs..."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Execute the logs command
$KUBECTL_CMD