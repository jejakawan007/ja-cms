#!/bin/bash

# Script untuk monitoring log JA-CMS
# Usage: ./scripts/monitor-logs.sh [backend|frontend|all] [error|combined]

LOG_TYPE=${1:-backend}
LOG_LEVEL=${2:-combined}
DATE=$(date +%Y-%m-%d)

echo "🔍 Monitoring JA-CMS Logs"
echo "📅 Date: $DATE"
echo "📁 Type: $LOG_TYPE"
echo "📊 Level: $LOG_LEVEL"
echo ""

case $LOG_TYPE in
  "backend")
    if [ "$LOG_LEVEL" = "error" ]; then
      echo "📋 Monitoring backend error logs..."
      tail -f logs/backend-error-$DATE.log
    else
      echo "📋 Monitoring backend combined logs..."
      tail -f logs/backend-combined-$DATE.log
    fi
    ;;
  "frontend")
    if [ "$LOG_LEVEL" = "error" ]; then
      echo "📋 Monitoring frontend error logs..."
      tail -f logs/frontend-error-$DATE.log
    else
      echo "📋 Monitoring frontend combined logs..."
      tail -f logs/frontend-combined-$DATE.log
    fi
    ;;
  "all")
    echo "📋 Monitoring all logs..."
    tail -f logs/*.log
    ;;
  *)
    echo "❌ Invalid log type. Use: backend, frontend, or all"
    echo "Usage: $0 [backend|frontend|all] [error|combined]"
    exit 1
    ;;
esac
