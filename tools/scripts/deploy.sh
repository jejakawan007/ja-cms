#!/bin/bash

# JA-CMS Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${GREEN}🚀 Starting JA-CMS deployment for ${ENVIRONMENT}...${NC}"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root${NC}"
   exit 1
fi

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Check Docker (if using Docker deployment)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is available${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Docker not found, will use baremetal deployment${NC}"
    DOCKER_AVAILABLE=false
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Backup existing data
echo -e "${YELLOW}📦 Creating backup...${NC}"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f "backend/.env" ]; then
    cp backend/.env "$BACKUP_DIR/backend.env"
fi

if [ -f "frontend/.env.local" ]; then
    cp frontend/.env.local "$BACKUP_DIR/frontend.env"
fi

echo -e "${GREEN}✅ Backup created in $BACKUP_DIR${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm run install:all

# Build applications
echo -e "${YELLOW}🔨 Building applications...${NC}"
npm run build

# Database migration
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
cd backend
npm run db:migrate:deploy
cd ..

# Seed database (only for development/staging)
if [ "$ENVIRONMENT" = "development" ] || [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    cd backend
    npm run db:seed
    cd ..
fi

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"

if [ "$DOCKER_AVAILABLE" = true ]; then
    # Docker deployment
    echo -e "${GREEN}🐳 Using Docker deployment${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 30
    
    # Check service health
    echo -e "${YELLOW}🔍 Checking service health...${NC}"
    
    # Check backend
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
        exit 1
    fi
    
else
    # Baremetal deployment
    echo -e "${GREEN}🖥️  Using baremetal deployment${NC}"
    
    # Install PM2 if not installed
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}📦 Installing PM2...${NC}"
        npm install -g pm2
    fi
    
    # Start backend
    echo -e "${YELLOW}🚀 Starting backend...${NC}"
    cd backend
    pm2 start dist/app.js --name "ja-cms-backend" --env $ENVIRONMENT
    cd ..
    
    # Start frontend
    echo -e "${YELLOW}🚀 Starting frontend...${NC}"
    cd frontend
    pm2 start npm --name "ja-cms-frontend" -- start
    cd ..
    
    # Save PM2 configuration
    pm2 save
    pm2 startup
fi

# Final checks
echo -e "${YELLOW}🔍 Running final checks...${NC}"

# Check if services are responding
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is accessible${NC}"
else
    echo -e "${RED}❌ Backend API is not accessible${NC}"
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
    exit 1
fi

# Display deployment information
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}📊 Deployment Information:${NC}"
echo -e "Environment: ${ENVIRONMENT}"
echo -e "Backend URL: http://localhost:3001"
echo -e "Frontend URL: http://localhost:3000"
echo -e "API Documentation: http://localhost:3001/api/docs"
echo -e "Health Check: http://localhost:3001/health"
echo ""
echo -e "${GREEN}🔧 Useful Commands:${NC}"
echo -e "View logs: pm2 logs"
echo -e "Restart services: pm2 restart all"
echo -e "Stop services: pm2 stop all"
echo -e "Monitor services: pm2 monit"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo -e "1. Update environment variables for production"
echo -e "2. Configure SSL certificates"
echo -e "3. Set up monitoring and alerting"
echo -e "4. Configure backup strategies"
echo ""
echo -e "${GREEN}🚀 JA-CMS is now running!${NC}" 