# 🔌 API Schema Definitions

> **Definisi Schema API Komprehensif JA-CMS**  
> Complete API documentation with request/response schemas and examples

---

## 📋 **Overview**

Dokumen ini menyediakan definisi schema yang lengkap untuk semua API endpoints dalam JA-CMS. Setiap endpoint dilengkapi dengan request/response examples, validation rules, dan error handling.

---

## 🎯 **API Standards**

### **Base Configuration:**
- **Base URL**: `https://api.jacms.com/v1`
- **Authentication**: Bearer Token (JWT)
- **Content Type**: `application/json`
- **Rate Limiting**: 1000 requests/hour per user
- **API Versioning**: URL-based (`/v1/`, `/v2/`)

### **Common Response Format:**
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  pagination?: Pagination;
  meta?: ResponseMeta;
}

interface APIError {
  code: string;
  message: string;
  details?: any;
  field?: string; // for validation errors
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
  processingTime: number; // milliseconds
}
```

---

## 📊 **1. Analytics API**

### **GET /api/analytics/dashboard**
Get dashboard analytics data

**Request:**
```typescript
interface AnalyticsDashboardRequest {
  dateRange: {
    start: string; // ISO 8601 date
    end: string;   // ISO 8601 date
  };
  metrics?: ('visitors' | 'pageviews' | 'sessions' | 'bounceRate')[];
  granularity?: 'hour' | 'day' | 'week' | 'month';
}
```

**Response:**
```typescript
interface AnalyticsDashboardResponse {
  overview: {
    visitors: {
      total: number;
      change: number; // percentage change
      trend: 'up' | 'down' | 'stable';
    };
    pageViews: {
      total: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    };
    sessions: {
      total: number;
      averageDuration: number; // seconds
      bounceRate: number; // percentage
    };
    conversionRate: number;
  };
  charts: {
    traffic: {
      labels: string[];
      datasets: {
        label: string;
        data: number[];
        color: string;
      }[];
    };
    sources: {
      name: string;
      value: number;
      percentage: number;
    }[];
    devices: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  topPages: {
    url: string;
    title: string;
    views: number;
    uniqueViews: number;
    bounceRate: number;
  }[];
  realTime: {
    activeUsers: number;
    currentPageViews: number;
    topActivePages: string[];
  };
}
```

**Example Request:**
```bash
curl -X GET "https://api.jacms.com/v1/analytics/dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dateRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "metrics": ["visitors", "pageviews"],
    "granularity": "day"
  }'
```

### **POST /api/analytics/track**
Track analytics event

**Request:**
```typescript
interface AnalyticsTrackRequest {
  event: {
    type: 'pageview' | 'click' | 'download' | 'form_submit' | 'custom';
    page: {
      url: string;
      title: string;
      referrer?: string;
    };
    user?: {
      id?: string;
      sessionId: string;
      fingerprint?: string;
    };
    device: {
      userAgent: string;
      screenResolution?: string;
      language: string;
      timezone: string;
    };
    customData?: Record<string, any>;
  };
  timestamp?: string; // ISO 8601, defaults to now
}
```

**Response:**
```typescript
interface AnalyticsTrackResponse {
  eventId: string;
  processed: boolean;
  sessionId: string;
  userId?: string;
}
```

---

## 📝 **2. Content Management API**

### **GET /api/content/posts**
Get posts with filtering and pagination

**Request Query Parameters:**
```typescript
interface PostsListRequest {
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
  status?: 'draft' | 'published' | 'archived' | 'scheduled';
  category?: string; // category slug
  tag?: string; // tag slug
  author?: string; // user ID
  search?: string; // full-text search
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title' | 'viewCount';
  sortOrder?: 'asc' | 'desc'; // default: 'desc'
  include?: ('author' | 'categories' | 'tags' | 'featuredImage')[];
}
```

**Response:**
```typescript
interface PostsListResponse {
  posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    status: 'draft' | 'published' | 'archived' | 'scheduled';
    author?: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    categories?: {
      id: string;
      name: string;
      slug: string;
    }[];
    tags?: {
      id: string;
      name: string;
      slug: string;
    }[];
    featuredImage?: {
      id: string;
      url: string;
      alt: string;
      caption?: string;
    };
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    viewCount: number;
    commentCount: number;
    readingTime: number; // minutes
  }[];
}
```

### **POST /api/content/posts**
Create new post

**Request:**
```typescript
interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string; // auto-generated if not provided
  status?: 'draft' | 'published' | 'scheduled'; // default: 'draft'
  categories?: string[]; // category IDs
  tags?: string[]; // tag names (created if don't exist)
  featuredImageId?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
  };
  publishedAt?: string; // ISO 8601, required if status is 'scheduled'
  customFields?: Record<string, any>;
}
```

**Response:**
```typescript
interface CreatePostResponse {
  post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    status: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
    categories: Category[];
    tags: Tag[];
    featuredImage?: MediaFile;
    seo: SEOData;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

### **PUT /api/content/posts/{id}**
Update existing post

**Request:**
```typescript
interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  status?: 'draft' | 'published' | 'archived' | 'scheduled';
  categories?: string[];
  tags?: string[];
  featuredImageId?: string;
  seo?: Partial<SEOData>;
  publishedAt?: string;
  customFields?: Record<string, any>;
}
```

**Validation Rules:**
- `title`: 1-255 characters
- `slug`: unique, URL-safe, auto-generated if empty
- `content`: required for published posts
- `publishedAt`: required if status is 'scheduled'

---

## 🎨 **3. Media Management API**

### **POST /api/media/upload**
Upload media files

**Request (Multipart Form Data):**
```typescript
interface MediaUploadRequest {
  files: File[]; // max 10 files per request
  folder?: string; // folder path, default: root
  metadata?: {
    title?: string;
    alt?: string;
    caption?: string;
    description?: string;
  };
  processing?: {
    generateThumbnails?: boolean; // default: true
    optimize?: boolean; // default: true
    formats?: ('webp' | 'avif')[]; // additional formats to generate
  };
}
```

**Response:**
```typescript
interface MediaUploadResponse {
  files: {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    thumbnailUrl?: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    duration?: number; // for videos/audio
    folder: {
      id: string;
      name: string;
      path: string;
    };
    metadata: {
      title: string;
      alt: string;
      caption?: string;
      description?: string;
    };
    processing: {
      status: 'pending' | 'processing' | 'completed' | 'failed';
      thumbnails: {
        size: string;
        url: string;
      }[];
      optimized: boolean;
    };
    uploadedAt: string;
  }[];
  errors?: {
    filename: string;
    error: string;
  }[];
}
```

### **GET /api/media**
List media files with filtering

**Request Query Parameters:**
```typescript
interface MediaListRequest {
  page?: number;
  limit?: number;
  folder?: string; // folder ID or path
  type?: 'image' | 'video' | 'audio' | 'document' | 'archive';
  search?: string;
  sortBy?: 'name' | 'size' | 'uploadedAt' | 'type';
  sortOrder?: 'asc' | 'desc';
  sizeRange?: {
    min?: number; // bytes
    max?: number; // bytes
  };
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
}
```

**Response:**
```typescript
interface MediaListResponse {
  files: MediaFile[];
  folders: {
    id: string;
    name: string;
    path: string;
    fileCount: number;
    totalSize: number;
  }[];
  facets: {
    types: {
      type: string;
      count: number;
    }[];
    sizes: {
      range: string;
      count: number;
    }[];
    folders: {
      id: string;
      name: string;
      count: number;
    }[];
  };
}
```

### **POST /api/media/bulk-action**
Perform bulk operations on media files

**Request:**
```typescript
interface MediaBulkActionRequest {
  action: 'move' | 'delete' | 'tag' | 'untag' | 'download' | 'optimize';
  fileIds: string[];
  parameters?: {
    targetFolder?: string; // for move action
    tags?: string[]; // for tag/untag actions
    deleteFiles?: boolean; // for delete action
  };
}
```

**Response:**
```typescript
interface MediaBulkActionResponse {
  results: {
    success: {
      fileId: string;
      filename: string;
      message: string;
    }[];
    failed: {
      fileId: string;
      filename: string;
      error: string;
    }[];
  };
  downloadUrl?: string; // for download action
  jobId?: string; // for long-running operations
}
```

---

## 👥 **4. User Management API**

### **POST /api/auth/login**
User authentication

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean; // default: false
  twoFactorCode?: string; // required if 2FA is enabled
  captcha?: string; // required after failed attempts
}
```

**Response:**
```typescript
interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    roles: string[];
    permissions: string[];
    preferences: UserPreferences;
    lastLoginAt: string;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // seconds
    tokenType: 'Bearer';
  };
  twoFactorRequired?: boolean;
  requiresPasswordChange?: boolean;
}
```

### **GET /api/users**
List users with filtering

**Request Query Parameters:**
```typescript
interface UsersListRequest {
  page?: number;
  limit?: number;
  role?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  search?: string; // name or email
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
  include?: ('roles' | 'permissions' | 'profile')[];
}
```

**Response:**
```typescript
interface UsersListResponse {
  users: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    roles?: {
      id: string;
      name: string;
      displayName: string;
    }[];
    permissions?: string[];
    profile?: {
      bio?: string;
      website?: string;
      social?: Record<string, string>;
    };
    createdAt: string;
    lastLoginAt?: string;
    loginCount: number;
  }[];
}
```

### **POST /api/users**
Create new user

**Request:**
```typescript
interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // optional, invitation email sent if not provided
  roles?: string[]; // role IDs
  status?: 'active' | 'inactive' | 'pending'; // default: 'pending'
  profile?: {
    bio?: string;
    website?: string;
    social?: Record<string, string>;
  };
  sendInvitation?: boolean; // default: true
}
```

**Validation Rules:**
- `email`: valid email format, unique
- `firstName`, `lastName`: 1-50 characters
- `password`: min 8 characters, complexity rules apply
- `roles`: must exist and user must have permission to assign

---

## 🛡️ **5. Security API**

### **GET /api/security/events**
Get security events

**Request Query Parameters:**
```typescript
interface SecurityEventsRequest {
  page?: number;
  limit?: number;
  type?: SecurityEventType;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'investigating' | 'resolved' | 'false_positive';
  dateRange?: {
    start: string;
    end: string;
  };
  sourceIp?: string;
  userId?: string;
}
```

**Response:**
```typescript
interface SecurityEventsResponse {
  events: {
    id: string;
    type: SecurityEventType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'investigating' | 'resolved' | 'false_positive';
    source: {
      ipAddress: string;
      userAgent: string;
      userId?: string;
      location?: {
        country: string;
        city: string;
        coordinates: [number, number];
      };
      reputation: {
        score: number;
        categories: string[];
      };
    };
    target: {
      type: string;
      identifier: string;
      resource?: string;
    };
    details: Record<string, any>;
    timestamp: string;
    resolvedAt?: string;
    resolvedBy?: string;
    confidence: number; // 0-100
    automated: boolean;
  }[];
}
```

### **POST /api/security/block-ip**
Block IP address

**Request:**
```typescript
interface BlockIPRequest {
  ipAddress: string;
  reason: string;
  duration?: number; // seconds, permanent if not provided
  blockType?: 'full' | 'limited'; // default: 'full'
  notify?: boolean; // default: true
}
```

**Response:**
```typescript
interface BlockIPResponse {
  blocked: boolean;
  ipAddress: string;
  expiresAt?: string;
  ruleId: string;
  message: string;
}
```

---

## 🔧 **6. System API**

### **GET /api/system/health**
System health check

**Response:**
```typescript
interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number; // seconds
  version: string;
  services: {
    database: {
      status: 'up' | 'down' | 'degraded';
      responseTime: number; // milliseconds
      connections: {
        active: number;
        idle: number;
        max: number;
      };
    };
    cache: {
      status: 'up' | 'down' | 'degraded';
      responseTime: number;
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
    };
    storage: {
      status: 'up' | 'down' | 'degraded';
      disk: {
        used: number;
        total: number;
        percentage: number;
      };
    };
    external: {
      cdn: 'up' | 'down' | 'degraded';
      email: 'up' | 'down' | 'degraded';
      search: 'up' | 'down' | 'degraded';
    };
  };
  metrics: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
  };
}
```

### **GET /api/system/settings**
Get system settings

**Response:**
```typescript
interface SystemSettingsResponse {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    adminEmail: string;
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  features: {
    registration: boolean;
    comments: boolean;
    analytics: boolean;
    caching: boolean;
    compression: boolean;
    cdn: boolean;
  };
  security: {
    twoFactorRequired: boolean;
    passwordExpiration: number; // days
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
  };
  media: {
    maxFileSize: number; // bytes
    allowedTypes: string[];
    imageQuality: number; // 1-100
    generateWebP: boolean;
    cdnEnabled: boolean;
  };
  email: {
    provider: string;
    fromName: string;
    fromEmail: string;
    replyToEmail: string;
  };
}
```

---

## 📊 **7. Error Handling**

### **Standard Error Codes:**
```typescript
enum APIErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  GONE = 'GONE',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // File Operations
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  
  // Business Logic
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR'
}
```

### **Error Response Examples:**

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "details": {
      "title": ["Title is required"],
      "email": ["Email format is invalid"]
    }
  }
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Rate Limiting Error:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetAt": "2024-01-09T15:30:00Z"
    }
  }
}
```

---

## 🔐 **8. Authentication & Security**

### **JWT Token Structure:**
```typescript
interface JWTPayload {
  sub: string; // user ID
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  iat: number; // issued at
  exp: number; // expires at
  iss: string; // issuer
  aud: string; // audience
  jti: string; // JWT ID
}
```

### **API Key Authentication:**
```typescript
interface APIKey {
  id: string;
  name: string;
  key: string; // hashed
  permissions: string[];
  rateLimit: {
    requests: number;
    window: number; // seconds
  };
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}
```

### **Security Headers:**
```typescript
interface SecurityHeaders {
  'X-Content-Type-Options': 'nosniff';
  'X-Frame-Options': 'DENY';
  'X-XSS-Protection': '1; mode=block';
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains';
  'Content-Security-Policy': string;
  'Referrer-Policy': 'strict-origin-when-cross-origin';
  'Permissions-Policy': string;
}
```

---

## 📝 **9. OpenAPI Specification**

### **OpenAPI 3.0 Schema:**
```yaml
openapi: 3.0.3
info:
  title: JA-CMS API
  description: Comprehensive Content Management System API
  version: 2.0.0
  contact:
    name: JA-CMS Team
    email: api@jacms.com
    url: https://docs.jacms.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.jacms.com/v1
    description: Production server
  - url: https://staging-api.jacms.com/v1
    description: Staging server
  - url: http://localhost:3000/api/v1
    description: Development server

security:
  - bearerAuth: []
  - apiKey: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    apiKey:
      type: apiKey
      in: header
      name: X-API-Key

  responses:
    UnauthorizedError:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    ForbiddenError:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    
    ValidationError:
      description: Request validation failed
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ValidationError'

  schemas:
    Error:
      type: object
      required:
        - success
        - error
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
              example: "UNAUTHORIZED"
            message:
              type: string
              example: "Authentication required"
            details:
              type: object
    
    ValidationError:
      allOf:
        - $ref: '#/components/schemas/Error'
        - type: object
          properties:
            error:
              type: object
              properties:
                details:
                  type: object
                  additionalProperties:
                    type: array
                    items:
                      type: string
```

---

## 🧪 **10. Testing & Examples**

### **Postman Collection Structure:**
```json
{
  "info": {
    "name": "JA-CMS API",
    "description": "Complete API collection for JA-CMS",
    "version": "2.0.0"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://api.jacms.com/v1"
    },
    {
      "key": "jwt_token",
      "value": ""
    }
  ]
}
```

### **cURL Examples:**

**Get Analytics Dashboard:**
```bash
curl -X GET "${BASE_URL}/analytics/dashboard" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -G -d "dateRange[start]=2024-01-01T00:00:00Z" \
     -d "dateRange[end]=2024-01-31T23:59:59Z" \
     -d "granularity=day"
```

**Create Post:**
```bash
curl -X POST "${BASE_URL}/content/posts" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with JA-CMS",
    "content": "This is a comprehensive guide...",
    "status": "published",
    "categories": ["tutorial"],
    "tags": ["cms", "tutorial", "guide"]
  }'
```

**Upload Media:**
```bash
curl -X POST "${BASE_URL}/media/upload" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "folder=blog/images" \
  -F 'metadata={"title":"Blog Images","alt":"Sample images"}'
```

---

## 🔗 **Related Documentation**

- **[API Authentication Guide](../05_users/authentication.md)** - Authentication implementation
- **[Rate Limiting & Security](../06_security/monitoring.md)** - API security measures
- **[Database Schema](../07_system/database.md)** - Database structure
- **[Development Standards](../DEVELOPMENT_STANDARDS.md)** - Coding standards

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active

