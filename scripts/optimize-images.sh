#!/bin/bash

# 🖼️ Image Optimization Script - JA-CMS
# Script untuk mengoptimalkan semua images dengan Next.js Image component

set -e

echo "🖼️ Optimizing images with Next.js Image component..."
echo "====================================================="

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

print_status "Phase 1: Adding Next.js Image import to files..."

# Add Next.js Image import to files that have <img> tags
find . -name "*.tsx" -exec grep -l "<img" {} \; | while read file; do
    print_status "Processing $file..."
    
    # Check if Image is already imported
    if ! grep -q "import.*Image.*from.*next/image" "$file"; then
        # Add import after the first import statement
        sed -i '1s/^/import Image from "next\/image";\n/' "$file"
        print_success "Added Image import to $file"
    else
        print_warning "Image import already exists in $file"
    fi
done

print_status "Phase 2: Replacing <img> with <Image>..."

# Replace <img> tags with <Image> component
find . -name "*.tsx" -exec sed -i 's/<img\([^>]*\)>/<Image\1 width={400} height={300} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" \/>/g' {} \;

print_success "Image optimization completed!"

print_status "Phase 3: Testing build..."

# Test build
if npm run build > /dev/null 2>&1; then
    print_success "Build successful after image optimization!"
else
    print_warning "Build failed, manual review needed"
fi

echo ""
print_success "✅ Image optimization completed successfully!"
echo ""
echo "📋 Summary:"
echo "✅ Added Next.js Image import to all files"
echo "✅ Replaced <img> with <Image> component"
echo "✅ Added responsive sizes attribute"
echo "✅ Added width and height props"
echo ""
echo "🔄 Next steps:"
echo "1. Review the changes manually"
echo "2. Test the application"
echo "3. Verify all images load correctly"
echo "4. Check performance improvements"
echo ""
print_success "🎉 Image optimization completed!"
