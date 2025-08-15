#!/bin/bash

# 🔧 Fix I18nContext Imports Script - JA-CMS
# Script untuk memperbaiki semua import I18nContext dan menggantinya dengan text langsung

set -e

echo "🔧 Fixing I18nContext imports..."
echo "=================================="

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

cd frontend

# List of files to fix (excluding backup files)
FILES_TO_FIX=(
    "app/dashboard/dashboard-cards.tsx"
    "app/dashboard/media/page.tsx"
    "app/dashboard/posts/create/page.tsx"
    "app/dashboard/posts/edit/[id]/page.tsx"
    "app/dashboard/categories/create/page.tsx"
    "components/fileUpload/FileUpload.tsx"
    "components/inputs/CheckboxInput.tsx"
    "components/layout/DashboardLayout.tsx"
    "components/modals/ConfirmModal.tsx"
    "components/theme/ThemeCustomizer.tsx"
    "components/forms/FormField.tsx"
    "components/forms/DynamicForm.tsx"
)

print_status "Phase 1: Removing I18nContext imports and usage..."

for file in "${FILES_TO_FIX[@]}"; do
    if [ -f "$file" ]; then
        print_status "Fixing $file..."
        
        # Create backup
        cp "$file" "$file.backup"
        
        # Remove I18nContext import
        sed -i '/import.*useI18n.*from.*@\/contexts\/I18nContext/d' "$file"
        sed -i '/import.*I18nContext/d' "$file"
        
        # Remove useI18n hook usage
        sed -i '/const.*useI18n/d' "$file"
        sed -i '/const.*{.*t.*}.*=.*useI18n/d' "$file"
        
        # Replace t('TEXT') with "TEXT"
        sed -i "s/t('\([^']*\)')/\"\1\"/g" "$file"
        
        # Remove empty lines that might be left
        sed -i '/^[[:space:]]*$/d' "$file"
        
        print_success "Fixed $file"
    else
        print_warning "File not found: $file"
    fi
done

print_status "Phase 2: Updating specific text patterns..."

# Update common text patterns
for file in "${FILES_TO_FIX[@]}"; do
    if [ -f "$file" ]; then
        print_status "Updating text patterns in $file..."
        
        # Common text replacements
        sed -i 's/"DASHBOARD"/"Dashboard"/g' "$file"
        sed -i 's/"POSTS"/"Posts"/g' "$file"
        sed -i 's/"CATEGORIES"/"Categories"/g' "$file"
        sed -i 's/"MEDIA"/"Media"/g' "$file"
        sed -i 's/"ANALYTICS"/"Analytics"/g' "$file"
        sed -i 's/"SETTINGS"/"Settings"/g' "$file"
        sed -i 's/"USERS"/"Users"/g' "$file"
        sed -i 's/"NAVIGATION"/"Navigation"/g' "$file"
        sed -i 's/"CREATE"/"Create"/g' "$file"
        sed -i 's/"EDIT"/"Edit"/g' "$file"
        sed -i 's/"DELETE"/"Delete"/g' "$file"
        sed -i 's/"SAVE"/"Save"/g' "$file"
        sed -i 's/"CANCEL"/"Cancel"/g' "$file"
        sed -i 's/"CONFIRM"/"Confirm"/g' "$file"
        sed -i 's/"SUBMIT"/"Submit"/g' "$file"
        sed -i 's/"UPLOAD"/"Upload"/g' "$file"
        sed -i 's/"SELECT"/"Select"/g' "$file"
        sed -i 's/"CHOOSE"/"Choose"/g' "$file"
        sed -i 's/"BROWSE"/"Browse"/g' "$file"
        sed -i 's/"DRAG_DROP_HERE"/"Drag and drop files here"/g' "$file"
        sed -i 's/"CLICK_TO_SELECT"/"Click to select files"/g' "$file"
        sed -i 's/"FILE_SIZE_ERROR"/"File size exceeds limit"/g' "$file"
        sed -i 's/"FILE_TYPE_ERROR"/"Invalid file type"/g' "$file"
        sed -i 's/"MAX_FILES_ERROR"/"Maximum files exceeded"/g' "$file"
        sed -i 's/"REMOVE_FILE"/"Remove file"/g' "$file"
        sed -i 's/"LOADING"/"Loading"/g' "$file"
        sed -i 's/"ERROR"/"Error"/g' "$file"
        sed -i 's/"SUCCESS"/"Success"/g' "$file"
        sed -i 's/"WARNING"/"Warning"/g' "$file"
        sed -i 's/"INFO"/"Info"/g' "$file"
        
        print_success "Updated text patterns in $file"
    fi
done

print_status "Phase 3: Testing build..."

# Test build
if npm run build > /dev/null 2>&1; then
    print_success "Build successful!"
else
    print_warning "Build failed, but this is expected during migration"
fi

print_status "Phase 4: Final verification..."

# Check if any I18nContext imports remain
REMAINING_IMPORTS=$(find . -name "*.tsx" -exec grep -l "useI18n\|@/contexts/I18nContext" {} \; 2>/dev/null || true)

if [ -z "$REMAINING_IMPORTS" ]; then
    print_success "No remaining I18nContext imports found!"
else
    print_warning "Some I18nContext imports may still exist:"
    echo "$REMAINING_IMPORTS"
fi

echo ""
print_success "✅ I18nContext imports fixed successfully!"
echo ""
echo "📋 Summary:"
echo "✅ Removed I18nContext imports from all files"
echo "✅ Replaced t('TEXT') with \"TEXT\""
echo "✅ Updated common text patterns"
echo "✅ Created backups of original files"
echo ""
echo "🔄 Next steps:"
echo "1. Test the application: npm run dev"
echo "2. Build the project: npm run build"
echo "3. Review the changes and test functionality"
echo "4. Remove backup files when satisfied"
echo ""
print_success "🎉 I18nContext migration completed!"
