#!/bin/bash

# JA-CMS Development Setup Script
# Script untuk setup environment development

set -e

echo "🚀 Memulai setup JA-CMS Development Environment..."

# Colors untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function untuk print dengan color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    print_status "Memeriksa dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js tidak ditemukan. Silakan install Node.js terlebih dahulu."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm tidak ditemukan. Silakan install npm terlebih dahulu."
        exit 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker ditemukan"
    else
        print_warning "Docker tidak ditemukan. Beberapa fitur mungkin tidak tersedia."
    fi
    
    print_success "Dependencies check selesai"
}

# Install root dependencies
install_root_deps() {
    print_status "Installing root dependencies..."
    npm install
    print_success "Root dependencies installed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    npm install
    
    # Copy environment file
    if [ ! -f .env.local ]; then
        cp env.example .env.local
        print_success "Environment file created"
    fi
    
    cd ..
    print_success "Frontend setup selesai"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Environment file created"
    fi
    
    # Setup database
    if command -v npx &> /dev/null; then
        npx prisma generate
        print_success "Prisma client generated"
    fi
    
    cd ..
    print_success "Backend setup selesai"
}

# Setup shared packages
setup_shared() {
    print_status "Setting up shared packages..."
    
    # Create package.json untuk shared packages jika belum ada
    if [ ! -f shared/package.json ]; then
        cat > shared/package.json << EOF
{
  "name": "@ja-cms/shared",
  "version": "1.0.0",
  "description": "Shared packages untuk JA-CMS",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "keywords": ["ja-cms", "shared"],
  "author": "JA-CMS Team",
  "license": "MIT"
}
EOF
        print_success "Shared package.json created"
    fi
    
    print_success "Shared packages setup selesai"
}

# Setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    if [ -d .husky ]; then
        npx husky install
        print_success "Git hooks setup selesai"
    else
        print_warning "Husky tidak ditemukan. Git hooks tidak disetup."
    fi
}

# Setup development tools
setup_dev_tools() {
    print_status "Setting up development tools..."
    
    # Create tools directory structure
    mkdir -p tools/scripts tools/generators tools/linters
    
    # Make scripts executable
    chmod +x tools/scripts/*.sh 2>/dev/null || true
    
    print_success "Development tools setup selesai"
}

# Setup documentation
setup_docs() {
    print_status "Setting up documentation..."
    
    mkdir -p docs/{api,guides,deployment}
    
    print_success "Documentation structure created"
}

# Main setup function
main() {
    echo "🏗️ JA-CMS Development Setup"
    echo "=========================="
    
    check_dependencies
    install_root_deps
    setup_frontend
    setup_backend
    setup_shared
    setup_git_hooks
    setup_dev_tools
    setup_docs
    
    echo ""
    echo "✅ Setup selesai!"
    echo ""
    echo "📋 Langkah selanjutnya:"
    echo "1. Edit file .env di backend dan frontend"
    echo "2. Setup database sesuai konfigurasi"
    echo "3. Jalankan 'npm run dev' untuk development"
    echo "4. Buka http://localhost:3000 untuk frontend"
    echo "5. Buka http://localhost:3001 untuk backend"
    echo ""
    echo "📚 Dokumentasi tersedia di folder docs/"
    echo "🛠️ Tools tersedia di folder tools/"
}

# Run main function
main "$@" 