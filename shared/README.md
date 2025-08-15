# 📦 @ja-cms/shared

Shared packages untuk JA-CMS yang digunakan oleh frontend dan backend.

## 📁 Struktur

```
shared/
├── 📁 types/          # Shared TypeScript types
├── 📁 utils/          # Shared utilities
├── 📁 config/         # Shared configurations
├── package.json       # Package configuration
├── tsconfig.json      # TypeScript configuration
└── README.md         # Documentation
```

## 🚀 Penggunaan

### **Import Types:**
```typescript
import { User, Post, ApiResponse } from '@ja-cms/shared/types';
```

### **Import Utils:**
```typescript
import { formatDate, validateEmail, generateSlug } from '@ja-cms/shared/utils';
```

### **Import Config:**
```typescript
import { API_CONFIG, STATUS_CODES, ERROR_MESSAGES } from '@ja-cms/shared/config';
```

## 📋 Types

### **User Types:**
- `User` - User interface
- `UserRole` - User role types
- `JWTPayload` - JWT token payload

### **Content Types:**
- `Post` - Post interface
- `Category` - Category interface
- `Tag` - Tag interface
- `Media` - Media interface

### **API Types:**
- `ApiResponse<T>` - Standard API response format
- `LoginRequest` - Login request interface
- `LoginResponse` - Login response interface

## 🛠️ Utils

### **Date Utils:**
- `formatDate()` - Format date to Indonesian locale
- `formatDateTime()` - Format date and time
- `formatRelativeTime()` - Format relative time

### **String Utils:**
- `generateSlug()` - Generate URL slug
- `truncateText()` - Truncate text with ellipsis
- `capitalizeFirst()` - Capitalize first letter
- `capitalizeWords()` - Capitalize all words

### **Validation Utils:**
- `validateEmail()` - Email validation
- `validatePassword()` - Password validation
- `validateUrl()` - URL validation

### **File Utils:**
- `formatFileSize()` - Format file size
- `getFileExtension()` - Get file extension
- `isImageFile()` - Check if file is image

### **Role Utils:**
- `getRoleDisplayName()` - Get role display name
- `getRoleColor()` - Get role color class
- `canManageUsers()` - Check user management permission
- `canManagePosts()` - Check post management permission

## ⚙️ Config

### **API Config:**
- `API_CONFIG` - API configuration
- `API_ENDPOINTS` - API endpoints
- `STATUS_CODES` - HTTP status codes

### **Validation Config:**
- `VALIDATION_RULES` - Validation rules
- `UPLOAD_CONFIG` - File upload configuration

### **UI Config:**
- `UI_CONFIG` - UI configuration
- `FEATURE_FLAGS` - Feature flags

### **Messages:**
- `ERROR_MESSAGES` - Error messages
- `SUCCESS_MESSAGES` - Success messages

## 🔧 Development

### **Build:**
```bash
npm run build
```

### **Watch Mode:**
```bash
npm run dev
```

### **Clean:**
```bash
npm run clean
```

## 📦 Installation

### **Frontend:**
```bash
cd frontend
npm install ../../../shared
```

### **Backend:**
```bash
cd backend
npm install ../../../shared
```

## 📝 Contoh Penggunaan

### **Frontend Component:**
```typescript
import { User, formatDate, getRoleDisplayName } from '@ja-cms/shared';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div>
      <h3>{user.firstName} {user.lastName}</h3>
      <p>Role: {getRoleDisplayName(user.role)}</p>
      <p>Joined: {formatDate(user.createdAt)}</p>
    </div>
  );
}
```

### **Backend Controller:**
```typescript
import { ApiResponse, User, ERROR_MESSAGES } from '@ja-cms/shared';

export async function getUser(req: Request, res: Response) {
  try {
    const user = await userService.findById(req.params.id);
    
    const response: ApiResponse<User> = {
      success: true,
      data: user,
      message: 'User found successfully'
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: ERROR_MESSAGES.USER_NOT_FOUND
      }
    };
    
    res.status(404).json(response);
  }
}
```

## 🤝 Contributing

1. Ikuti standar penamaan file dan folder
2. Gunakan TypeScript strict mode
3. Tambahkan proper error handling
4. Buat unit tests untuk utilities
5. Update dokumentasi jika diperlukan

## 📄 License

MIT License - lihat file LICENSE untuk detail. 