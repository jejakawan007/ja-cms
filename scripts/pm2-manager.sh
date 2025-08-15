#!/bin/bash

# PM2 Service Manager Script for JA-CMS
# Usage: ./scripts/pm2-manager.sh [start|stop|restart|status|logs|monitor]

APP_NAME="ja-cms"
CONFIG_FILE="ecosystem.config.js"

case "$1" in
    start)
        echo "🚀 Starting $APP_NAME with PM2..."
        pm2 start ecosystem.config.js
        pm2 save
        echo "✅ $APP_NAME started successfully!"
        ;;
    stop)
        echo "🛑 Stopping $APP_NAME..."
        pm2 stop $APP_NAME
        pm2 save
        echo "✅ $APP_NAME stopped successfully!"
        ;;
    restart)
        echo "🔄 Restarting $APP_NAME..."
        pm2 restart $APP_NAME
        pm2 save
        echo "✅ $APP_NAME restarted successfully!"
        ;;
    status)
        echo "📊 Status of $APP_NAME:"
        pm2 list
        ;;
    logs)
        echo "📝 Showing logs for $APP_NAME:"
        pm2 logs $APP_NAME
        ;;
    monitor)
        echo "📈 Opening PM2 monitor..."
        pm2 monit
        ;;
    delete)
        echo "🗑️  Deleting $APP_NAME from PM2..."
        pm2 delete $APP_NAME
        pm2 save
        echo "✅ $APP_NAME deleted from PM2!"
        ;;
    *)
        echo "❌ Usage: $0 {start|stop|restart|status|logs|monitor|delete}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the application with PM2"
        echo "  stop    - Stop the application gracefully"
        echo "  restart - Restart the application"
        echo "  status  - Show application status"
        echo "  logs    - Show application logs"
        echo "  monitor - Open PM2 monitoring interface"
        echo "  delete  - Remove application from PM2"
        exit 1
        ;;
esac
