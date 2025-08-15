#!/bin/bash

# 🚀 UI Migration Script - JA-CMS
# Script untuk migrasi UI frontend ke shadcn/ui

set -e

echo "🚀 Starting UI Migration to shadcn/ui..."
echo "=========================================="

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

# Phase 1: Preparation
print_status "Phase 1: Preparation & Audit"

# Create backup directory
print_status "Creating backup of custom components..."
mkdir -p frontend/components/backup

# Backup important custom components
if [ -d "frontend/components/buttons" ]; then
    cp -r frontend/components/buttons frontend/components/backup/
    print_success "Backed up buttons components"
fi

if [ -d "frontend/components/inputs" ]; then
    cp -r frontend/components/inputs frontend/components/backup/
    print_success "Backed up inputs components"
fi

if [ -d "frontend/components/cards" ]; then
    cp -r frontend/components/cards frontend/components/backup/
    print_success "Backed up cards components"
fi

if [ -d "frontend/components/modals" ]; then
    cp -r frontend/components/modals frontend/components/backup/
    print_success "Backed up modals components"
fi

if [ -d "frontend/components/dropdown" ]; then
    cp -r frontend/components/dropdown frontend/components/backup/
    print_success "Backed up dropdown components"
fi

if [ -d "frontend/components/forms" ]; then
    cp -r frontend/components/forms frontend/components/backup/
    print_success "Backed up forms components"
fi

if [ -d "frontend/components/tables" ]; then
    cp -r frontend/components/tables frontend/components/backup/
    print_success "Backed up tables components"
fi

if [ -d "frontend/components/notifications" ]; then
    cp -r frontend/components/notifications frontend/components/backup/
    print_success "Backed up notifications components"
fi

if [ -d "frontend/components/tooltip" ]; then
    cp -r frontend/components/tooltip frontend/components/backup/
    print_success "Backed up tooltip components"
fi

if [ -d "frontend/components/tabs" ]; then
    cp -r frontend/components/tabs frontend/components/backup/
    print_success "Backed up tabs components"
fi

if [ -d "frontend/components/progressBar" ]; then
    cp -r frontend/components/progressBar frontend/components/backup/
    print_success "Backed up progressBar components"
fi

if [ -d "frontend/components/loading" ]; then
    cp -r frontend/components/loading frontend/components/backup/
    print_success "Backed up loading components"
fi

if [ -d "frontend/components/dateTime" ]; then
    cp -r frontend/components/dateTime frontend/components/backup/
    print_success "Backed up dateTime components"
fi

print_success "Backup completed! All custom components are saved in frontend/components/backup/"

# Phase 2: Remove unnecessary dependencies
print_status "Phase 2: Removing unnecessary dependencies..."

cd frontend

# List of dependencies to remove
DEPENDENCIES_TO_REMOVE=(
    "@heroicons/react"
    "react-hot-toast"
    "framer-motion"
    "vaul"
    "cmdk"
    "react-day-picker"
    "next-auth"
    "next-intl"
    "react-markdown"
    "rehype-highlight"
    "remark-gfm"
)

for dep in "${DEPENDENCIES_TO_REMOVE[@]}"; do
    if npm list "$dep" >/dev/null 2>&1; then
        print_status "Removing $dep..."
        npm uninstall "$dep"
        print_success "Removed $dep"
    else
        print_warning "$dep is not installed, skipping..."
    fi
done

# Phase 3: Install shadcn/ui components
print_status "Phase 3: Installing shadcn/ui components..."

# List of shadcn/ui components to install
SHADCN_COMPONENTS=(
    "button"
    "input"
    "card"
    "dialog"
    "dropdown-menu"
    "form"
    "table"
    "toast"
    "tooltip"
    "tabs"
    "select"
    "checkbox"
    "radio-group"
    "switch"
    "slider"
    "progress"
    "skeleton"
    "avatar"
    "badge"
    "alert"
    "calendar"
    "command"
    "popover"
    "sheet"
    "separator"
    "scroll-area"
    "navigation-menu"
    "menubar"
    "hover-card"
    "collapsible"
    "accordion"
    "breadcrumb"
    "pagination"
    "label"
    "textarea"
)

for component in "${SHADCN_COMPONENTS[@]}"; do
    print_status "Installing $component..."
    npx shadcn@latest add "$component" --yes
    print_success "Installed $component"
done

# Phase 4: Create index.ts for ui components
print_status "Phase 4: Creating index.ts for ui components..."

cat > components/ui/index.ts << 'EOF'
// Shadcn/ui components exports
export * from "./button"
export * from "./input"
export * from "./card"
export * from "./dialog"
export * from "./dropdown-menu"
export * from "./form"
export * from "./table"
export * from "./toast"
export * from "./tooltip"
export * from "./tabs"
export * from "./select"
export * from "./checkbox"
export * from "./radio-group"
export * from "./switch"
export * from "./slider"
export * from "./progress"
export * from "./skeleton"
export * from "./avatar"
export * from "./badge"
export * from "./alert"
export * from "./calendar"
export * from "./command"
export * from "./popover"
export * from "./sheet"
export * from "./separator"
export * from "./scroll-area"
export * from "./navigation-menu"
export * from "./menubar"
export * from "./hover-card"
export * from "./collapsible"
export * from "./accordion"
export * from "./breadcrumb"
export * from "./pagination"
export * from "./label"
export * from "./textarea"
EOF

print_success "Created index.ts for ui components"

# Phase 5: Update tsconfig.json for better path mapping
print_status "Phase 5: Updating tsconfig.json..."

# Check if tsconfig.json exists
if [ -f "tsconfig.json" ]; then
    # Backup original tsconfig.json
    cp tsconfig.json tsconfig.json.backup
    
    # Update tsconfig.json with better path mapping
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/ui/*": ["./components/ui/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"],
      "@/styles/*": ["./styles/*"],
      "@/config/*": ["./config/*"],
      "@/contexts/*": ["./contexts/*"],
      "@/services/*": ["./services/*"],
      "@/themes/*": ["./themes/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

    print_success "Updated tsconfig.json with better path mapping"
else
    print_warning "tsconfig.json not found, skipping..."
fi

# Phase 6: Cleanup old components (optional - commented out for safety)
print_status "Phase 6: Ready for cleanup..."

echo ""
print_warning "IMPORTANT: Before proceeding with cleanup, please:"
echo "1. Test all components to ensure they work correctly"
echo "2. Review the backup in frontend/components/backup/"
echo "3. Make sure all imports are updated correctly"
echo ""
echo "To cleanup old components, run:"
echo "rm -rf frontend/components/buttons/"
echo "rm -rf frontend/components/inputs/"
echo "rm -rf frontend/components/cards/"
echo "rm -rf frontend/components/modals/"
echo "rm -rf frontend/components/dropdown/"
echo "rm -rf frontend/components/forms/"
echo "rm -rf frontend/components/tables/"
echo "rm -rf frontend/components/notifications/"
echo "rm -rf frontend/components/tooltip/"
echo "rm -rf frontend/components/tabs/"
echo "rm -rf frontend/components/progressBar/"
echo "rm -rf frontend/components/loading/"
echo "rm -rf frontend/components/dateTime/"
echo ""

# Phase 7: Final status
print_status "Phase 7: Migration Summary"

echo ""
print_success "✅ Migration completed successfully!"
echo ""
echo "📋 Summary:"
echo "✅ Backup created in frontend/components/backup/"
echo "✅ Unnecessary dependencies removed"
echo "✅ shadcn/ui components installed"
echo "✅ Index file created for ui components"
echo "✅ tsconfig.json updated with better path mapping"
echo ""
echo "🔄 Next steps:"
echo "1. Test all components: npm run test"
echo "2. Build the project: npm run build"
echo "3. Update imports in your components"
echo "4. Clean up old component folders (when ready)"
echo "5. Update documentation"
echo ""
echo "📚 Documentation:"
echo "- Check docs/development/DEVELOPMENT_STANDARDS.md"
echo "- Check docs/development/UI_MIGRATION_GUIDE.md"
echo ""
print_success "🎉 UI Migration to shadcn/ui is ready!"
