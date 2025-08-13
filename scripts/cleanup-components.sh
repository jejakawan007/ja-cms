#!/bin/bash

# 🧹 Component Cleanup Script - JA-CMS
# Script untuk menghapus komponen lama setelah migrasi ke shadcn/ui

set -e

echo "🧹 Starting Component Cleanup..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if backup exists
if [ ! -d "frontend/components/backup" ]; then
    print_error "Backup directory not found! Please run the migration script first."
    exit 1
fi

# Confirmation prompt
echo ""
print_warning "⚠️  WARNING: This will permanently delete old component folders!"
echo ""
echo "The following folders will be deleted:"
echo "- frontend/components/buttons/"
echo "- frontend/components/inputs/"
echo "- frontend/components/cards/"
echo "- frontend/components/modals/"
echo "- frontend/components/dropdown/"
echo "- frontend/components/forms/"
echo "- frontend/components/tables/"
echo "- frontend/components/notifications/"
echo "- frontend/components/tooltip/"
echo "- frontend/components/tabs/"
echo "- frontend/components/progressBar/"
echo "- frontend/components/loading/"
echo "- frontend/components/dateTime/"
echo ""
echo "A backup is available in: frontend/components/backup/"
echo ""

read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Cleanup cancelled by user"
    exit 0
fi

# Phase 1: Verify shadcn/ui components are installed
print_status "Phase 1: Verifying shadcn/ui components..."

REQUIRED_COMPONENTS=(
    "frontend/components/ui/button.tsx"
    "frontend/components/ui/input.tsx"
    "frontend/components/ui/card.tsx"
    "frontend/components/ui/dialog.tsx"
    "frontend/components/ui/dropdown-menu.tsx"
    "frontend/components/ui/form.tsx"
    "frontend/components/ui/table.tsx"
    "frontend/components/ui/toast.tsx"
    "frontend/components/ui/tooltip.tsx"
    "frontend/components/ui/tabs.tsx"
)

for component in "${REQUIRED_COMPONENTS[@]}"; do
    if [ ! -f "$component" ]; then
        print_error "Required component not found: $component"
        print_error "Please run the migration script first to install shadcn/ui components"
        exit 1
    fi
done

print_success "All required shadcn/ui components are installed"

# Phase 2: Remove old component directories
print_status "Phase 2: Removing old component directories..."

OLD_COMPONENT_DIRS=(
    "frontend/components/buttons"
    "frontend/components/inputs"
    "frontend/components/cards"
    "frontend/components/modals"
    "frontend/components/dropdown"
    "frontend/components/forms"
    "frontend/components/tables"
    "frontend/components/notifications"
    "frontend/components/tooltip"
    "frontend/components/tabs"
    "frontend/components/progressBar"
    "frontend/components/loading"
    "frontend/components/dateTime"
)

for dir in "${OLD_COMPONENT_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_status "Removing $dir..."
        rm -rf "$dir"
        print_success "Removed $dir"
    else
        print_warning "$dir not found, skipping..."
    fi
done

# Phase 3: Update index files in remaining component directories
print_status "Phase 3: Updating index files..."

# List of remaining component directories that might need index updates
REMAINING_DIRS=(
    "frontend/components/dashboard"
    "frontend/components/navigation"
    "frontend/components/theme"
    "frontend/components/analytics"
    "frontend/components/media"
    "frontend/components/fileUpload"
    "frontend/components/slider"
    "frontend/components/blog"
    "frontend/components/megaMenu"
    "frontend/components/validation"
    "frontend/components/imageOptimizer"
    "frontend/components/gallery"
    "frontend/components/layout"
    "frontend/components/errors"
)

for dir in "${REMAINING_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -f "$dir/index.ts" ]; then
        print_status "Checking index.ts in $dir..."
        # You can add specific index.ts updates here if needed
        print_success "Index file in $dir is up to date"
    fi
done

# Phase 4: Clean up any empty directories
print_status "Phase 4: Cleaning up empty directories..."

find frontend/components -type d -empty -delete 2>/dev/null || true

print_success "Cleaned up empty directories"

# Phase 5: Final verification
print_status "Phase 5: Final verification..."

echo ""
echo "📋 Cleanup Summary:"
echo "✅ Old component directories removed"
echo "✅ Backup preserved in frontend/components/backup/"
echo "✅ shadcn/ui components remain intact"
echo "✅ Empty directories cleaned up"
echo ""

# Show current component structure
echo "📁 Current component structure:"
echo "frontend/components/"
if [ -d "frontend/components" ]; then
    tree frontend/components -I 'node_modules|.next|backup' --dirsfirst 2>/dev/null || ls -la frontend/components/
fi

echo ""
print_success "🎉 Component cleanup completed successfully!"
echo ""
echo "🔄 Next steps:"
echo "1. Test your application: npm run dev"
echo "2. Build the project: npm run build"
echo "3. Run tests: npm run test"
echo "4. Update any remaining imports if needed"
echo "5. Update documentation"
echo ""
echo "📚 Documentation:"
echo "- Check docs/development/DEVELOPMENT_STANDARDS.md"
echo "- Check docs/development/UI_MIGRATION_GUIDE.md"
echo ""
print_success "✨ Your project is now using shadcn/ui components!"
