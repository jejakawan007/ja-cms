# 🏗️ JA-CMS Development Standards & Guidelines

## 📋 **STANDAR ATURAN JA-CMS DEVELOPMENT**

### **🌍 ATURAN BAHASA (WAJIB DIIKUTI)**

#### **📝 Prinsip Dasar Bahasa:**
1. **✅ Kode Teknis**: Selalu gunakan Bahasa Inggris
   - Variable names: `userName`, `isLoading`, `handleSubmit`
   - Function names: `fetchPosts`, `validateEmail`, `handleDelete`
   - Class names: `PostController`, `UserService`, `AuthMiddleware`
   - Interface names: `UserProfile`, `PostData`, `ApiResponse`

2. **✅ UI Text**: Gunakan Bahasa Inggris sebagai default untuk semua text UI
   - Button text: "Save", "Delete", "Create Post"
   - Error messages: "Network Error", "Validation Error"
   - Success messages: "Post created successfully", "Post updated successfully"
   - Menu items: "Dashboard", "Posts", "Categories", "Users"

3. **✅ Dokumentasi Kode**: Gunakan Bahasa Indonesia untuk komentar dan dokumentasi
   ```typescript
   /**
    * Mengambil daftar posts dengan pagination dan filtering
    * @param searchParams - Parameter pencarian dan filter
    * @returns Promise dengan data posts dan informasi pagination
    */
   async getPosts(searchParams: PostSearchParams): Promise<PostsResponse> {
     // Implementation
   }
   ```

#### **🔧 Implementasi Text Langsung (WAJIB):**

##### **1. Penggunaan Text Langsung:**
```typescript
// ✅ BAIK - Gunakan text langsung dalam bahasa Inggris
<h1>Dashboard</h1>
<button>Save</button>
<p>Post created successfully</p>
<span>Total Posts</span>

// ❌ KURANG BAIK - Hardcoded text bahasa lain
<h1>Dashboard</h1>
<button>Simpan</button>
<p>Post berhasil dibuat</p>
```

##### **2. Component dengan Text Langsung:**
```typescript
// ✅ BAIK - Component dengan text langsung
export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  return (
    <div>
      <h2>JA-CMS</h2>
      <nav>
        <a href="/dashboard">Dashboard</a>
        <a href="/dashboard/posts">Posts</a>
      </nav>
    </div>
  );
};
```

#### **🚫 Larangan Penting:**
- ❌ **JANGAN** gunakan sistem i18n yang kompleks
- ❌ **JANGAN** buat translation files
- ❌ **JANGAN** gunakan language switcher
- ❌ **JANGAN** hardcode text bahasa Indonesia di UI
- ❌ **JANGAN** gunakan bahasa campuran dalam satu komponen

#### **✅ Best Practices:**
- ✅ **Gunakan Text Langsung** dalam bahasa Inggris untuk UI
- ✅ **Gunakan Bahasa Indonesia** untuk komentar kode
- ✅ **Konsisten** dalam penggunaan bahasa
- ✅ **Simple dan Fast** untuk development
- ✅ **No i18n Overhead** untuk mempercepat development

### **🏗️ Struktur Proyek (AKTUAL - WAJIB DIIKUTI)**
```
ja-cms/
├── 📁 frontend/              # Next.js Frontend (Port 3000)
│   ├── 📁 app/              # Next.js App Router
│   ├── 📁 components/       # Reusable components
│   └── 📁 lib/              # Utilities & configurations
├── 📁 backend/               # Express.js Backend (Port 3001)
│   ├── 📁 controllers/      # Business logic
│   ├── 📁 routes/           # Route definitions
│   ├── 📁 middleware/       # Express middleware
│   ├── 📁 services/         # Business services
│   ├── 📁 models/           # Data models
│   ├── 📁 prisma/           # Database schema & migrations
│   └── app.ts               # Main application
├── 📁 shared/                # Shared packages
├── 📁 tools/                 # Development tools
├── 📁 infrastructure/        # Infrastructure configs
├── 📁 docs/                  # Project documentation
└── package.json              # Root workspace
```

### **📝 Penamaan File & Folder (WAJIB)**

#### **File Naming Convention:**
- **Components:** `PascalCase` (e.g., `LoginForm.tsx`)
- **Pages:** `kebab-case` (e.g., `create-post.tsx`)
- **Services:** `kebab-case` (e.g., `auth-service.ts`)
- **Controllers:** `kebab-case` (e.g., `auth-controller.ts`)
- **Types:** `kebab-case` (e.g., `api-types.ts`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **Functions:** `camelCase` (e.g., `handleLogin`)
- **Interfaces:** `PascalCase` (e.g., `UserProfile`)

#### **Folder Naming Convention:**
- **Features:** `kebab-case` (e.g., `user-management/`)
- **Components:** `kebab-case` (e.g., `form-components/`)
- **Utilities:** `kebab-case` (e.g., `date-helpers/`)
- **Services:** `kebab-case` (e.g., `auth-service/`)

### **📦 Import/Export Strategy (WAJIB)**

#### **✅ BAIK - Menggunakan Path Mapping**
```typescript
// ✅ BAIK - Menggunakan alias @/ untuk cross-folder imports
import { Button } from '@/components/ui/button';
import { useNotification } from '@/hooks/useNotification';
import { ButtonProps } from '@/types/button';
import { cn } from '@/lib/utils';

// ✅ BAIK - Relative imports untuk components dalam satu folder
import { Modal } from './Modal';
import { ConfirmModal } from './ConfirmModal';
import { NotificationToast } from './NotificationToast';
```

#### **❌ KURANG BAIK - Relative imports untuk cross-folder**
```typescript
// ❌ KURANG BAIK - Relative imports yang panjang
import { Button } from '../../components/ui/button';
import { useNotification } from '../../hooks/useNotification';
import { ButtonProps } from '../../types/button';
```

#### **Path Mapping Configuration:**
```json
{
  "paths": {
    "@/*": ["./*"],
    "@/components/*": ["./components/*"],
    "@/hooks/*": ["./hooks/*"],
    "@/types/*": ["./types/*"],
    "@/utils/*": ["./utils/*"],
    "@/styles/*": ["./styles/*"],
    "@shared/*": ["../shared/*"]
  }
}
```

#### **Component Standards (ShadCN/UI):**
- ✅ **UI Library:** ShadCN/UI sebagai foundation component library
- ✅ **Theme System:** Neutral/Grey theme sebagai default
- ✅ **Responsive Design:** Mobile-first approach dengan breakpoints konsisten
- ✅ **Dark/Light Mode:** Toggle support dengan CSS variables
- ✅ **Loading States:** Skeleton/Spinner components dari ShadCN/UI
- ✅ **Error Handling:** User-friendly error messages dengan toast notifications
- ✅ **Accessibility:** ARIA labels, keyboard navigation, focus management
- ✅ **Animations:** Smooth transitions (300ms) dengan Tailwind CSS
- ✅ **Modern Design:** Glass effect, backdrop-blur, subtle gradients
- ✅ **Component Variants:** Menggunakan `cva` (Class Variance Authority)
- ✅ **Utility Functions:** `cn()` untuk conditional classes

### **🎨 ShadCN/UI Implementation Standards (WAJIB)**

#### **Component Usage:**
```typescript
// ✅ BAIK - Import ShadCN/UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ✅ BAIK - Gunakan variants yang tersedia
<Button variant="outline" size="sm">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon">
  <Icon className="h-4 w-4" />
</Button>

// ✅ BAIK - Conditional styling dengan cn()
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>
```

#### **Theme System:**
```css
/* CSS Variables untuk Neutral/Grey Theme */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --secondary: 217.2 32.6% 17.5%;
  --muted: 217.2 32.6% 17.5%;
  --border: 217.2 32.6% 17.5%;
}
```

#### **🎨 Neutral Flat Clean Design Standards (WAJIB DIIKUTI)**

##### **🏗️ Design Philosophy:**
- **Neutral**: Menggunakan grey/neutral color palette tanpa warna-warna yang mencolok
- **Flat**: Minimal shadows, subtle borders, clean surfaces tanpa depth yang berlebihan
- **Clean**: Whitespace yang cukup, typography yang jelas, layout yang rapi

##### **🎨 Color Palette (WAJIB):**
```css
/* Neutral Color System */
--background: 0 0% 100% (Pure White)
--foreground: 222.2 84% 4.9% (Dark Grey)
--card: 0 0% 100% (Pure White)
--card-foreground: 222.2 84% 4.9% (Dark Grey)
--primary: 222.2 47.4% 11.2% (Dark Grey)
--primary-foreground: 210 40% 98% (Light Grey)
--secondary: 210 40% 96% (Very Light Grey)
--muted: 210 40% 96% (Very Light Grey)
--muted-foreground: 215.4 16.3% 46.9% (Medium Grey)
--border: 214.3 31.8% 91.4% (Light Grey Border)
--accent: 210 40% 96% (Very Light Grey)
--accent-foreground: 222.2 47.4% 11.2% (Dark Grey)
```

##### **📐 Layout & Spacing Standards:**
- **Container Padding**: `p-6` untuk main containers, `p-4` untuk cards
- **Section Spacing**: `space-y-6` untuk vertical sections, `gap-4` untuk horizontal
- **Card Spacing**: `p-4` untuk card content, `p-6` untuk card headers
- **Form Spacing**: `space-y-4` untuk form fields, `gap-3` untuk button groups
- **List Spacing**: `space-y-2` untuk compact lists, `space-y-3` untuk normal lists

##### **🎭 Component Styling Rules:**

###### **Cards & Containers:**
```typescript
// ✅ BAIK - Flat, clean card design
<Card className="border border-border bg-card shadow-sm">
  <CardHeader className="pb-4">
    <CardTitle className="text-lg font-medium text-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
</Card>

// ❌ KURANG BAIK - Heavy shadows dan gradients
<Card className="shadow-xl bg-gradient-to-r from-blue-500 to-purple-500">
```

###### **Buttons:**
```typescript
// ✅ BAIK - Neutral button variants
<Button variant="outline" size="sm" className="border-border text-foreground">
  Secondary Action
</Button>
<Button variant="default" size="sm" className="bg-primary text-primary-foreground">
  Primary Action
</Button>
<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
  Ghost Action
</Button>

// ❌ KURANG BAIK - Colorful buttons
<Button className="bg-blue-500 hover:bg-blue-600 text-white">
```

###### **Forms & Inputs:**
```typescript
// ✅ BAIK - Clean form design
<div className="space-y-4">
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">Email</Label>
    <Input 
      className="border-border bg-background text-foreground placeholder:text-muted-foreground"
      placeholder="Enter your email"
    />
  </div>
</div>

// ❌ KURANG BAIK - Styled inputs
<Input className="border-2 border-blue-500 bg-blue-50" />
```

###### **Tables:**
```typescript
// ✅ BAIK - Flat table design
<Table>
  <TableHeader>
    <TableRow className="border-border bg-muted/50">
      <TableHead className="text-sm font-medium text-foreground">Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-border hover:bg-muted/50">
      <TableCell className="text-sm text-foreground">John Doe</TableCell>
    </TableRow>
  </TableBody>
</Table>

// ❌ KURANG BAIK - Heavy table styling
<Table className="border-2 border-blue-500 shadow-lg">
```

##### **🎨 Visual Effects Standards:**

###### **Shadows (Minimal):**
```typescript
// ✅ BAIK - Subtle shadows
className="shadow-sm" // Very light shadow
className="shadow" // Light shadow
className="shadow-md" // Medium shadow (use sparingly)

// ❌ KURANG BAIK - Heavy shadows
className="shadow-xl" // Too heavy
className="shadow-2xl" // Too heavy
```

###### **Borders:**
```typescript
// ✅ BAIK - Clean borders
className="border border-border" // Standard border
className="border-t border-border" // Top border only
className="border-b border-border" // Bottom border only

// ❌ KURANG BAIK - Heavy borders
className="border-2 border-blue-500" // Too thick and colorful
```

###### **Hover Effects:**
```typescript
// ✅ BAIK - Subtle hover effects
className="hover:bg-muted/50 transition-colors" // Light background change
className="hover:border-border/80 transition-colors" // Subtle border change
className="hover:text-foreground transition-colors" // Text color change

// ❌ KURANG BAIK - Heavy hover effects
className="hover:scale-105 hover:shadow-xl" // Too dramatic
```

##### **📱 Responsive Design:**
```typescript
// ✅ BAIK - Consistent responsive spacing
<div className="p-4 sm:p-6 lg:p-8">
<div className="space-y-4 sm:space-y-6">
<div className="gap-3 sm:gap-4 lg:gap-6">

// ❌ KURANG BAIK - Inconsistent spacing
<div className="p-2 sm:p-8 lg:p-4">
```

##### **🎯 Page Layout Standards:**

###### **Page Header:**
```typescript
// ✅ BAIK - Clean page header
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Page Title</h1>
      <p className="text-sm text-muted-foreground">Page description</p>
    </div>
    <Button variant="default" size="sm">Action</Button>
  </div>
  <Separator className="border-border" />
</div>
```

###### **Content Sections:**
```typescript
// ✅ BAIK - Organized content sections
<div className="space-y-6">
  <Card className="border border-border bg-card shadow-sm">
    <CardHeader className="pb-4">
      <CardTitle className="text-lg font-medium text-foreground">Section Title</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Section content */}
    </CardContent>
  </Card>
</div>
```

##### **🔧 Utility Classes (WAJIB DIGUNAKAN):**
```typescript
// Spacing utilities
"space-y-4" // Vertical spacing
"gap-4" // Horizontal spacing
"p-4" // Padding
"m-4" // Margin

// Color utilities
"text-foreground" // Primary text
"text-muted-foreground" // Secondary text
"bg-background" // Background
"bg-card" // Card background
"border-border" // Border color

// Typography utilities
"text-sm" // Small text
"text-base" // Base text
"text-lg" // Large text
"font-medium" // Medium weight
"font-semibold" // Semi-bold weight
```

##### **🚫 Larangan Penting:**
- ❌ **JANGAN** gunakan warna-warna yang mencolok (blue, red, green, dll)
- ❌ **JANGAN** gunakan shadows yang berat (shadow-xl, shadow-2xl)
- ❌ **JANGAN** gunakan gradients yang berlebihan
- ❌ **JANGAN** gunakan border radius yang terlalu besar (rounded-2xl, rounded-3xl)
- ❌ **JANGAN** gunakan hover effects yang dramatis (scale, rotate)
- ❌ **JANGAN** gunakan spacing yang tidak konsisten
- ❌ **JANGAN** gunakan typography yang tidak sesuai hierarchy

##### **✅ Best Practices:**
- ✅ **Gunakan neutral color palette** secara konsisten
- ✅ **Implementasi flat design** dengan minimal shadows
- ✅ **Maintain clean layout** dengan proper spacing
- ✅ **Gunakan subtle hover effects** untuk interactivity
- ✅ **Konsisten dalam typography** hierarchy
- ✅ **Responsive design** dengan breakpoints yang tepat
- ✅ **Accessibility** dengan proper contrast ratios
- ✅ **Performance** dengan minimal CSS complexity

### **🔧 Development Standards (WAJIB)**

#### **TypeScript:**
- ✅ **Strict Mode:** Enabled
- ✅ **Type Safety:** No `any` types
- ✅ **Interface Naming:** PascalCase (e.g., `UserProfile`)
- ✅ **Type Exports:** From shared packages

#### **Code Quality:**
- ✅ **ESLint:** Strict rules
- ✅ **Prettier:** Consistent formatting
- ✅ **Husky:** Pre-commit hooks
- ✅ **Lint-staged:** Staged files only

#### **Testing:**
- ✅ **Unit Tests:** Jest + React Testing Library
- ✅ **Integration Tests:** API endpoints
- ✅ **E2E Tests:** Playwright/Cypress
- ✅ **Coverage:** Minimum 80%

### **🔄 API Standards (WAJIB)**

#### **Response Format:**
```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

#### **HTTP Status Codes:**
- ✅ **200**: Success
- ✅ **201**: Created
- ✅ **400**: Bad Request
- ✅ **401**: Unauthorized
- ✅ **403**: Forbidden
- ✅ **404**: Not Found
- ✅ **422**: Validation Error
- ✅ **500**: Internal Server Error

### **🔐 Authentication Standards (WAJIB)**
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AUTHOR';
  permissions: string[];
  iat: number;
  exp: number;
}

// Login Request
interface LoginRequest {
  email: string;
  password: string;
}

// Login Response
interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}
```

### **🗄️ Database Standards (WAJIB)**
```prisma
// User Model Example
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

### **🔒 Security Standards (WAJIB)**

#### **Backend Security:**
- ✅ **Password Hashing:** bcrypt dengan salt rounds
- ✅ **JWT Tokens:** Secure token generation
- ✅ **Input Validation:** Zod schema validation
- ✅ **SQL Injection Protection:** Prisma ORM
- ✅ **Rate Limiting:** Express rate limit
- ✅ **CORS Configuration:** Proper CORS setup
- ✅ **Security Headers:** Helmet.js

#### **Frontend Security:**
- ✅ **HTTPS Enforcement:** Secure connections
- ✅ **XSS Protection:** Input sanitization
- ✅ **CSRF Protection:** Token-based protection
- ✅ **Secure Cookie Handling:** HttpOnly cookies
- ✅ **Content Security Policy:** CSP headers

### **📋 Development Workflow**

#### **Git Standards:**
```bash
# Branch Naming
feature/user-management
bugfix/login-error
hotfix/security-patch
release/v1.2.0

# Commit Messages
feat: add user management system
fix: resolve login authentication issue
docs: update API documentation
refactor: improve code structure
test: add unit tests for auth service
```

#### **Environment Variables:**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=JA-CMS

# Backend (.env)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
BCRYPT_SALT_ROUNDS=12
ADMIN_EMAIL=admin@jacms.com
ADMIN_PASSWORD=admin123
```

### **🧪 Testing Standards**

#### **Backend Testing:**
```typescript
// Unit Test Example
describe('AuthService', () => {
  it('should authenticate user with valid credentials', async () => {
    const authService = new AuthService();
    const result = await authService.login('admin@jacms.com', 'admin123');
    expect(result.success).toBe(true);
  });
});
```

#### **Frontend Testing:**
```typescript
// Component Test Example
describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@jacms.com' }
    });
    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByText('Login successful')).toBeInTheDocument();
    });
  });
});
```

### **📚 Documentation Standards**

#### **Code Documentation:**
```typescript
/**
 * Authenticates a user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise<LoginResponse> - Authentication result
 * @throws UnauthorizedError - If credentials are invalid
 */
async login(email: string, password: string): Promise<LoginResponse> {
  // Implementation
}
```

#### **API Documentation:**
- ✅ **Swagger/OpenAPI:** Auto-generated docs
- ✅ **Postman Collections:** API testing
- ✅ **Code Examples:** Request/Response examples
- ✅ **Error Codes:** Comprehensive error list

### **🎯 Development Checklists**

#### **Ketika Membuat Kode (CHECKLIST):**
1. **✅ Ikuti struktur folder yang sudah ditentukan**
2. **✅ Gunakan penamaan file/folder yang konsisten**
3. **✅ Gunakan ShadCN/UI components sebagai foundation**
4. **✅ Implementasi neutral theme di semua komponen**
5. **✅ Implementasi dark/light mode dengan CSS variables**
6. **✅ Buat komponen yang reusable dengan proper variants**
7. **✅ Gunakan TypeScript dengan strict mode**
8. **✅ Gunakan `cn()` untuk conditional classes**
9. **✅ Tambahkan proper error handling dengan toast notifications**
10. **✅ Buat loading states dengan skeleton components**
11. **✅ Gunakan shared packages untuk types dan utils**
12. **✅ Tambahkan proper validation dengan Zod + react-hook-form**
13. **✅ Implementasi responsive design dengan breakpoints konsisten**
14. **✅ Gunakan glass effect dan subtle animations**
15. **✅ Gunakan bcrypt untuk password hashing**
16. **✅ Implementasi JWT untuk authentication**
17. **✅ Tambahkan proper CORS configuration**
18. **✅ Gunakan Prisma ORM untuk database**
19. **✅ Gunakan text langsung dalam bahasa Inggris untuk UI**
20. **✅ Gunakan bahasa Indonesia untuk komentar kode**

#### **🎨 Neutral Flat Clean Design Checklist (WAJIB):**
21. **✅ Gunakan neutral color palette** (grey/neutral tanpa warna mencolok)
22. **✅ Implementasi flat design** dengan minimal shadows (shadow-sm, shadow)
23. **✅ Maintain clean layout** dengan proper spacing (space-y-4, gap-4, p-4)
24. **✅ Gunakan subtle hover effects** (hover:bg-muted/50, transition-colors)
25. **✅ Konsisten dalam typography** hierarchy (text-sm, text-base, text-lg)
26. **✅ Gunakan proper border styling** (border-border, border-t, border-b)
27. **✅ Implementasi clean card design** (border border-border bg-card shadow-sm)
28. **✅ Gunakan neutral button variants** (outline, default, ghost)
29. **✅ Maintain consistent spacing** (p-4 untuk cards, p-6 untuk containers)
30. **✅ JANGAN gunakan warna mencolok** (blue, red, green, dll)
31. **✅ JANGAN gunakan heavy shadows** (shadow-xl, shadow-2xl)
32. **✅ JANGAN gunakan dramatic hover effects** (scale, rotate)
33. **✅ JANGAN gunakan gradients berlebihan**
34. **✅ JANGAN gunakan border radius terlalu besar** (rounded-2xl, rounded-3xl)

#### **ShadCN/UI Component Development (CHECKLIST):**
1. **✅ Import components dari @/components/ui/**
2. **✅ Gunakan proper variants (default, outline, ghost, destructive)**
3. **✅ Implementasi size variants (sm, md, lg, icon)**
4. **✅ Tambahkan loading states dengan disabled prop**
5. **✅ Gunakan proper icons dari lucide-react**
6. **✅ Implementasi proper focus management**
7. **✅ Tambahkan keyboard navigation support**
8. **✅ Gunakan proper ARIA attributes**
9. **✅ Implementasi proper color scheme (neutral)**
10. **✅ Tambahkan hover dan active states**
11. **✅ Gunakan consistent spacing (gap-4, gap-6, gap-8)**
12. **✅ Implementasi glass effect untuk modern look**
13. **✅ Tambahkan smooth transitions (duration-300)**
14. **✅ Gunakan proper border radius (rounded-lg, rounded-xl)**
15. **✅ Implementasi backdrop-blur untuk depth**

#### **🎨 Neutral Flat Clean Component Standards (WAJIB):**
16. **✅ Gunakan neutral color palette** untuk semua components
17. **✅ Implementasi flat design** dengan minimal shadows (shadow-sm)
18. **✅ Maintain clean borders** (border-border, border-t, border-b)
19. **✅ Gunakan subtle hover effects** (hover:bg-muted/50)
20. **✅ Konsisten spacing** (p-4 untuk cards, p-6 untuk containers)
21. **✅ Clean typography** (text-foreground, text-muted-foreground)
22. **✅ JANGAN gunakan warna mencolok** dalam components
23. **✅ JANGAN gunakan heavy shadows** (shadow-xl, shadow-2xl)
24. **✅ JANGAN gunakan dramatic effects** (scale, rotate, gradients)
25. **✅ JANGAN gunakan border radius berlebihan** (rounded-2xl, rounded-3xl)

#### **Ketika Debugging (CHECKLIST):**
1. **✅ Cek console errors terlebih dahulu**
2. **✅ Verifikasi API responses**
3. **✅ Test di berbagai browser**
4. **✅ Cek responsive design**
5. **✅ Validasi accessibility**
6. **✅ Cek TypeScript errors**
7. **✅ Verifikasi database connections**
8. **✅ Cek JWT token validity**
9. **✅ Verifikasi bcrypt password hashing**
10. **✅ Test authentication flow**

#### **Code Review Checklist:**
- ✅ **TypeScript:** Proper typing
- ✅ **ESLint:** No linting errors
- ✅ **Prettier:** Consistent formatting
- ✅ **Tests:** Adequate test coverage
- ✅ **Documentation:** Updated docs
- ✅ **Security:** Security best practices
- ✅ **Performance:** Performance considerations
- ✅ **Language:** Text langsung dalam bahasa Inggris
- ✅ **Comments:** Bahasa Indonesia untuk komentar

### **🚀 Quick Commands**

#### **Setup ShadCN/UI:**
```bash
# Setup shadcn/ui (sudah dilakukan)
npx shadcn@latest init

# Install core components
npx shadcn@latest add button input card dialog form table toast tooltip badge avatar skeleton

# Install layout components
npx shadcn@latest add dropdown-menu navigation-menu breadcrumb separator

# Install advanced components
npx shadcn@latest add tabs select checkbox radio-group switch slider progress calendar command popover sheet collapsible accordion

# Install additional dependencies
npm install lucide-react react-hook-form @hookform/resolvers zod recharts @dnd-kit/core @dnd-kit/sortable class-variance-authority clsx tailwind-merge
```

#### **Development:**
```bash
# Start both frontend and backend
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Setup database
npm run db:setup

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

#### **Database:**
```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

#### **Build & Deploy:**
```bash
# Build both frontend and backend
npm run build

# Start production
npm run start
```

### **🔗 Important URLs**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

### **👤 Default Admin User**
- **Email**: admin@jacms.com
- **Password**: admin123
- **Role**: SUPER_ADMIN

### **📁 Key Files**
- **Backend Entry**: `backend/app.ts`
- **Frontend Entry**: `frontend/app/layout.tsx`
- **Database Schema**: `backend/prisma/schema.prisma`
- **Authentication**: `backend/controllers/auth-controller.ts`
- **Login Page**: `frontend/app/login/page.tsx`

### **🎨 UI Components (ShadCN/UI)**

#### **Core Components:**
- **Button**: `frontend/components/ui/button.tsx` - Variants: default, destructive, outline, secondary, ghost, link
- **Input**: `frontend/components/ui/input.tsx` - Form input dengan validation states
- **Card**: `frontend/components/ui/card.tsx` - Container component dengan header, content, footer
- **Dialog**: `frontend/components/ui/dialog.tsx` - Modal dialogs dengan overlay
- **Form**: `frontend/components/ui/form.tsx` - Form handling dengan react-hook-form + zod
- **Table**: `frontend/components/ui/table.tsx` - Data tables dengan sorting, filtering
- **Toast**: `frontend/components/ui/toast.tsx` - Notification system
- **Tooltip**: `frontend/components/ui/tooltip.tsx` - Hover information
- **Badge**: `frontend/components/ui/badge.tsx` - Status indicators
- **Avatar**: `frontend/components/ui/avatar.tsx` - User profile pictures
- **Skeleton**: `frontend/components/ui/skeleton.tsx` - Loading placeholders

#### **Layout Components:**
- **MainLayout**: `frontend/components/layout/main-layout.tsx` - Dashboard layout dengan sidebar
- **Sidebar**: `frontend/components/layout/sidebar.tsx` - Navigation sidebar
- **Header**: `frontend/components/layout/header.tsx` - Top navigation bar
- **Breadcrumb**: `frontend/components/ui/breadcrumb.tsx` - Navigation breadcrumbs

#### **Theme System:**
- **CSS Variables**: `frontend/app/globals.css` - Neutral theme
- **Theme Provider**: `frontend/components/theme-provider.tsx` - Dark/Light mode
- **Color Palette**: Neutral dengan accent colors
- **Typography**: Inter font family dengan size scale
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl)
- **Border Radius**: Rounded corners (sm: 0.125rem, md: 0.375rem, lg: 0.5rem)

### **🔧 Configuration Files**
- **Backend Config**: `backend/config/`
- **Frontend Config**: `frontend/next.config.js`
- **Tailwind Config**: `frontend/tailwind.config.js`
- **TypeScript Config**: `tsconfig.base.json`

---

## **📋 SUMMARY IMPLEMENTASI SHADCN/UI**

### **✅ Yang Sudah Diimplementasi:**
- 🎨 **ShadCN/UI Foundation:** Setup lengkap dengan neutral theme
- 🏗️ **Component Library:** Button, Card, Input, Dialog, Form, Table, Toast, dll
- 🎯 **Layout System:** MainLayout, Sidebar, Header dengan responsive design
- 🌙 **Theme System:** Dark/Light mode dengan CSS variables
- 📱 **Responsive Design:** Mobile-first approach dengan breakpoints konsisten
- ✨ **Modern Effects:** Glass effect, backdrop-blur, smooth animations
- 🔧 **Utility Functions:** `cn()` untuk conditional classes
- 📊 **Dashboard:** Stats cards, charts, draggable widgets dengan real data
- 🔐 **Authentication:** Login/register dengan form validation
- 📝 **Posts Management:** CRUD operations dengan rich editor
- 👥 **Users Management:** User roles dan permissions
- 🖼️ **Media Library:** File upload dengan drag & drop

### **🔄 Dalam Progress:**
- 🎨 **Theme Customization:** Advanced theme editor
- 🔔 **Notifications:** Real-time notification system
- 🔍 **Global Search:** Advanced search dan filtering

### **📚 Best Practices:**
1. **Selalu gunakan ShadCN/UI components** sebagai foundation
2. **Implementasi neutral theme** untuk consistency
3. **Gunakan `cn()` function** untuk conditional styling
4. **Tambahkan proper loading states** dengan skeleton components
5. **Implementasi glass effect** untuk modern appearance
6. **Gunakan proper variants** untuk components (outline, ghost, destructive)
7. **Tambahkan smooth transitions** (duration-300) untuk UX
8. **Implementasi responsive design** dengan mobile-first approach

---

**Last Updated:** January 6, 2025  
**Version:** 2.1.0 (ShadCN/UI Implementation)  
**Maintainer:** JA-CMS Development Team  
**UI Framework:** ShadCN/UI + Tailwind CSS + Neutral Theme 