// Shared configurations untuk JA-CMS
// Digunakan oleh frontend dan backend

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// HTTP Status Codes
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

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/upload-avatar',
  },
  
  // Posts
  POSTS: {
    BASE: '/posts',
    DRAFT: '/posts/draft',
    PUBLISHED: '/posts/published',
    FEATURED: '/posts/featured',
    SEARCH: '/posts/search',
  },
  
  // Categories
  CATEGORIES: {
    BASE: '/categories',
    HIERARCHY: '/categories/hierarchy',
  },
  
  // Tags
  TAGS: {
    BASE: '/tags',
    POPULAR: '/tags/popular',
  },
  
  // Media
  MEDIA: {
    BASE: '/media',
    UPLOAD: '/media/upload',
    DELETE: '/media/delete',
  },
  
  // Menus
  MENUS: {
    BASE: '/menus',
    BY_LOCATION: '/menus/by-location',
  },
  
  // Settings
  SETTINGS: {
    BASE: '/settings',
    BY_KEY: '/settings/by-key',
  },
  
  // Analytics
  ANALYTICS: {
    BASE: '/analytics',
    DASHBOARD: '/analytics/dashboard',
    POSTS: '/analytics/posts',
    USERS: '/analytics/users',
  },
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  UPLOAD_PATH: '/uploads',
  THUMBNAIL_SIZE: { width: 300, height: 300 },
  PREVIEW_SIZE: { width: 800, height: 600 },
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  JWT_SECRET: process.env['JWT_SECRET'] || 'your-secret-key',
  JWT_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  SECRET: process.env['JWT_SECRET'] || 'your-secret-key',
  EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// Database Configuration
export const DATABASE_CONFIG = {
  CONNECTION_LIMIT: 10,
  ACQUIRE_TIMEOUT: 60000,
  TIMEOUT: 60000,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: 300, // 5 minutes
  MAX_ITEMS: 1000,
  CHECK_PERIOD: 600, // 10 minutes
} as const;

// Email Configuration
export const EMAIL_CONFIG = {
  FROM: 'noreply@ja-cms.com',
  SUBJECT_PREFIX: '[JA-CMS] ',
  TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password-reset',
    EMAIL_VERIFICATION: 'email-verification',
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  USER: {
    EMAIL_MIN_LENGTH: 5,
    EMAIL_MAX_LENGTH: 255,
    FIRST_NAME_MIN_LENGTH: 2,
    FIRST_NAME_MAX_LENGTH: 50,
    LAST_NAME_MIN_LENGTH: 2,
    LAST_NAME_MAX_LENGTH: 50,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
  },
  POST: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 255,
    CONTENT_MIN_LENGTH: 10,
    EXCERPT_MAX_LENGTH: 500,
    SLUG_MAX_LENGTH: 255,
  },
  CATEGORY: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
  },
  TAG: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
  },
} as const;

// UI Configuration
export const UI_CONFIG = {
  THEME: {
    PRIMARY_COLOR: '#3b82f6',
    SECONDARY_COLOR: '#8b5cf6',
    SUCCESS_COLOR: '#10b981',
    WARNING_COLOR: '#f59e0b',
    ERROR_COLOR: '#ef4444',
    INFO_COLOR: '#3b82f6',
  },
  ANIMATION: {
    DURATION: 300,
    EASING: 'ease-in-out',
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_REGISTRATION: true,
  ENABLE_EMAIL_VERIFICATION: true,
  ENABLE_PASSWORD_RESET: true,
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_TWO_FACTOR_AUTH: false,
  ENABLE_AUDIT_LOG: true,
  ENABLE_ANALYTICS: true,
  ENABLE_COMMENTS: false,
  ENABLE_RATINGS: false,
  ENABLE_SEARCH: true,
  ENABLE_CACHE: true,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Email atau password salah',
  USER_NOT_FOUND: 'Pengguna tidak ditemukan',
  ACCOUNT_DISABLED: 'Akun telah dinonaktifkan',
  TOKEN_EXPIRED: 'Token telah kadaluarsa',
  TOKEN_INVALID: 'Token tidak valid',
  UNAUTHORIZED: 'Anda tidak memiliki akses',
  FORBIDDEN: 'Akses ditolak',
  
  // Validation
  REQUIRED_FIELD: 'Field ini wajib diisi',
  INVALID_EMAIL: 'Format email tidak valid',
  INVALID_PASSWORD: 'Password tidak memenuhi kriteria',
  PASSWORD_MISMATCH: 'Password tidak cocok',
  INVALID_URL: 'URL tidak valid',
  FILE_TOO_LARGE: 'File terlalu besar',
  INVALID_FILE_TYPE: 'Tipe file tidak didukung',
  
  // Database
  RECORD_NOT_FOUND: 'Data tidak ditemukan',
  DUPLICATE_ENTRY: 'Data sudah ada',
  FOREIGN_KEY_CONSTRAINT: 'Data terkait tidak dapat dihapus',
  
  // Server
  INTERNAL_ERROR: 'Terjadi kesalahan internal',
  SERVICE_UNAVAILABLE: 'Layanan tidak tersedia',
  NETWORK_ERROR: 'Kesalahan jaringan',
  
  // Generic
  SOMETHING_WENT_WRONG: 'Terjadi kesalahan yang tidak diketahui',
  TRY_AGAIN_LATER: 'Silakan coba lagi nanti',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login berhasil',
  LOGOUT_SUCCESS: 'Logout berhasil',
  PASSWORD_CHANGED: 'Password berhasil diubah',
  PASSWORD_RESET_SENT: 'Link reset password telah dikirim',
  
  // CRUD Operations
  CREATED: 'Data berhasil dibuat',
  UPDATED: 'Data berhasil diperbarui',
  DELETED: 'Data berhasil dihapus',
  
  // File Upload
  FILE_UPLOADED: 'File berhasil diunggah',
  
  // Generic
  OPERATION_SUCCESS: 'Operasi berhasil',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ja_cms_auth_token',
  REFRESH_TOKEN: 'ja_cms_refresh_token',
  USER_DATA: 'ja_cms_user_data',
  THEME: 'ja_cms_theme',
  LANGUAGE: 'ja_cms_language',
  SIDEBAR_COLLAPSED: 'ja_cms_sidebar_collapsed',
} as const;

// Route Names
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
  
  // Content Management
  POSTS: '/dashboard/posts',
  CREATE_POST: '/dashboard/posts/create',
  EDIT_POST: '/dashboard/posts/edit',
  CATEGORIES: '/dashboard/categories',
  TAGS: '/dashboard/tags',
  MEDIA: '/dashboard/media',
  
  // User Management
  USERS: '/dashboard/users',
  CREATE_USER: '/dashboard/users/create',
  EDIT_USER: '/dashboard/users/edit',
  
  // System
  MENUS: '/dashboard/menus',
  ANALYTICS: '/dashboard/analytics',
} as const; 