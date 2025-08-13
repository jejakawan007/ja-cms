#!/bin/bash

echo "🚀 Setting up JA-CMS..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "📖 Installation guide: https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating backend environment file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating frontend environment file..."
    cp env.example .env.local
    echo "⚠️  Please edit frontend/.env.local with your configuration"
fi

cd ..

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/logs
mkdir -p backend/uploads/images
mkdir -p backend/uploads/documents
mkdir -p backend/uploads/temp
mkdir -p shared/types
mkdir -p shared/utils
mkdir -p shared/config
mkdir -p tools/scripts
mkdir -p tools/docs
mkdir -p infrastructure/nginx
mkdir -p infrastructure/deployment
mkdir -p infrastructure/monitoring
mkdir -p docs

# Create shared packages structure
echo "📦 Setting up shared packages structure..."

# Create shared/types package.json
cat > shared/types/package.json << EOF
{
  "name": "@ja-cms/types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

# Create shared/utils package.json
cat > shared/utils/package.json << EOF
{
  "name": "@ja-cms/utils",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

# Create shared/config package.json
cat > shared/config/package.json << EOF
{
  "name": "@ja-cms/config",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

# Create TypeScript configs for shared packages
cat > shared/types/tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

cp shared/types/tsconfig.json shared/utils/tsconfig.json
cp shared/types/tsconfig.json shared/config/tsconfig.json

# Create basic shared files
mkdir -p shared/types/src
mkdir -p shared/utils/src
mkdir -p shared/config/src

cat > shared/types/src/index.ts << EOF
// Shared TypeScript types for JA-CMS
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  authorId: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
EOF

cat > shared/utils/src/index.ts << EOF
// Shared utilities for JA-CMS
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('id-ID');
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};
EOF

cat > shared/config/src/index.ts << EOF
// Shared configurations for JA-CMS
export const API_ENDPOINTS = {
  POSTS: '/api/posts',
  USERS: '/api/users',
  AUTH: '/api/auth',
  MEDIA: '/api/media',
} as const;

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  AUTHOR: 'AUTHOR',
} as const;

export const POST_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
  SCHEDULED: 'SCHEDULED',
} as const;
EOF

echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Edit frontend/.env.local with your configuration"
echo "3. Create PostgreSQL databases:"
echo "   - createdb ja_cms_dev"
echo "   - createdb ja_cms_test"
echo "4. Run database setup: npm run db:setup"
echo "5. Start development servers: npm run dev"
echo ""
echo "📚 Documentation:"
echo "- DEVELOPMENT_STANDARDS.md: Development standards"
echo "- AI_ASSISTANT_GUIDE.md: AI assistant guidelines"
echo "- README.md: Quick start guide"
echo ""
echo "🎉 Happy coding!" 