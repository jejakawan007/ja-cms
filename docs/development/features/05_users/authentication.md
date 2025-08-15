# 🔐 Authentication System

> **Sistem Autentikasi Komprehensif JA-CMS**  
> Secure authentication with multi-factor support and modern security practices

---

## 📋 **Deskripsi**

Authentication System menangani semua aspek autentikasi user dalam JA-CMS, mulai dari login tradisional hingga modern authentication methods seperti 2FA, SSO, dan passwordless login. Sistem ini dirancang dengan security-first approach dan user experience yang optimal.

---

## ⭐ **Core Features**

### **1. 🔑 Basic Authentication**

#### **Email/Password Login:**
- **Secure Password Handling**: bcrypt hashing dengan salt
- **Login Rate Limiting**: Brute force protection
- **Account Lockout**: Temporary lockout setelah failed attempts
- **Session Management**: Secure session handling dengan JWT
- **Remember Me**: Persistent login dengan secure tokens

**Login Data Structure:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
  captcha?: string; // untuk suspicious activities
}

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
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // seconds
  };
  twoFactorRequired?: boolean;
  error?: string;
  remainingAttempts?: number;
}
```

#### **Password Security:**
```typescript
interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventReuse: number; // jumlah password lama yang tidak boleh digunakan
  expiration: number; // days, 0 = never expires
  strengthMeter: boolean;
  commonPasswordCheck: boolean;
  breachCheck: boolean; // check against known breaches
}

// Default policy
const defaultPasswordPolicy: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  preventReuse: 5,
  expiration: 0,
  strengthMeter: true,
  commonPasswordCheck: true,
  breachCheck: true
};
```

### **2. 🛡️ Two-Factor Authentication (2FA)**

#### **Supported 2FA Methods:**
- **TOTP (Time-based OTP)**: Google Authenticator, Authy
- **SMS**: Text message verification codes
- **Email**: Email-based verification codes
- **Hardware Keys**: FIDO2/WebAuthn support
- **Backup Codes**: Recovery codes untuk emergency access

**2FA Setup Flow:**
```typescript
interface TwoFactorSetup {
  method: '2fa_totp' | '2fa_sms' | '2fa_email' | '2fa_hardware';
  secret?: string; // untuk TOTP
  qrCode?: string; // untuk TOTP setup
  backupCodes: string[]; // 8-10 backup codes
  verified: boolean;
  setupAt: Date;
  lastUsed?: Date;
}

// TOTP Setup Process
const setupTOTP = async (userId: string): Promise<TwoFactorSetup> => {
  // Generate secret key
  const secret = speakeasy.generateSecret({
    name: `JA-CMS (${userEmail})`,
    issuer: 'JA-CMS'
  });

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  // Generate backup codes
  const backupCodes = generateBackupCodes(10);
  
  return {
    method: '2fa_totp',
    secret: secret.base32,
    qrCode,
    backupCodes,
    verified: false,
    setupAt: new Date()
  };
};
```

#### **2FA Verification:**
```typescript
interface TwoFactorVerification {
  code: string;
  method: '2fa_totp' | '2fa_sms' | '2fa_email' | 'backup_code';
  rememberDevice?: boolean; // 30 days trusted device
}

const verifyTwoFactor = async (
  userId: string, 
  verification: TwoFactorVerification
): Promise<boolean> => {
  const user = await getUserById(userId);
  
  switch (verification.method) {
    case '2fa_totp':
      return speakeasy.totp.verify({
        secret: user.twoFactor.secret,
        encoding: 'base32',
        token: verification.code,
        window: 2 // Allow 2 steps before/after
      });
      
    case 'backup_code':
      return verifyBackupCode(userId, verification.code);
      
    // ... other methods
  }
};
```

### **3. 🚀 Modern Authentication Methods**

#### **Passwordless Login:**
- **Magic Links**: Email-based passwordless authentication
- **WebAuthn**: Biometric dan hardware key authentication
- **Social Login**: OAuth integration (Google, GitHub, etc.)

**Magic Link Implementation:**
```typescript
interface MagicLinkRequest {
  email: string;
  redirectUrl?: string;
}

const sendMagicLink = async (request: MagicLinkRequest): Promise<void> => {
  const user = await getUserByEmail(request.email);
  if (!user) {
    // Don't reveal if email exists atau tidak
    return;
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  // Store token
  await storeMagicLinkToken({
    token,
    userId: user.id,
    email: user.email,
    expiresAt,
    used: false
  });

  // Send email
  await emailService.sendMagicLink({
    to: user.email,
    token,
    redirectUrl: request.redirectUrl
  });
};
```

#### **WebAuthn Implementation:**
```typescript
// WebAuthn registration
const startWebAuthnRegistration = async (userId: string) => {
  const user = await getUserById(userId);
  
  const options = await f2l.attestationOptions();
  options.user = {
    id: Buffer.from(user.id),
    name: user.email,
    displayName: `${user.firstName} ${user.lastName}`
  };
  
  // Store challenge
  await storeWebAuthnChallenge(user.id, options.challenge);
  
  return options;
};

// WebAuthn authentication
const startWebAuthnAuthentication = async (email: string) => {
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  const credentials = await getWebAuthnCredentials(user.id);
  
  const options = await f2l.assertionOptions();
  options.allowCredentials = credentials.map(cred => ({
    id: cred.credentialId,
    type: 'public-key'
  }));
  
  await storeWebAuthnChallenge(user.id, options.challenge);
  
  return options;
};
```

---

## 🎨 **Authentication UI Components**

### **Login Form:**
```
┌─────────────────────────────────────────────────────────┐
│                    🔐 JA-CMS Login                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Email Address                                           │
│ [admin@jacms.com________________________]              │
│                                                         │
│ Password                                                │
│ [••••••••••••••••••••••••••••••••••••••]              │
│                                                         │
│ ☑ Remember me                    [Forgot Password?]     │
│                                                         │
│                    [Sign In]                            │
│                                                         │
│ ─────────────── OR ───────────────                     │
│                                                         │
│ [🔗 Magic Link Login] [🔑 WebAuthn Login]              │
│                                                         │
│ [📱 Google] [🐙 GitHub] [💼 Microsoft]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **2FA Setup:**
```
┌─────────────────────────────────────────────────────────┐
│              🛡️ Setup Two-Factor Authentication          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Choose your preferred 2FA method:                       │
│                                                         │
│ ○ 📱 Authenticator App (Recommended)                    │
│   Use Google Authenticator, Authy, atau similar apps   │
│                                                         │
│ ○ 📧 Email Verification                                 │
│   Receive codes via email                               │
│                                                         │
│ ○ 📱 SMS Verification                                   │
│   Receive codes via text message                        │
│                                                         │
│ ○ 🔑 Hardware Security Key                              │
│   Use FIDO2/WebAuthn compatible keys                    │
│                                                         │
│                    [Continue]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **TOTP Setup:**
```
┌─────────────────────────────────────────────────────────┐
│                📱 Setup Authenticator App                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Scan QR code with your authenticator app:           │
│                                                         │
│    ┌─────────────────┐                                 │
│    │ ███ ███ ███ ███ │                                 │
│    │ ███ ███ ███ ███ │                                 │
│    │ ███ ███ ███ ███ │                                 │
│    │ ███ ███ ███ ███ │                                 │
│    └─────────────────┘                                 │
│                                                         │
│ Can't scan? Enter this code manually:                   │
│ [JBSWY3DPEHPK3PXP_________________________]           │
│                                                         │
│ 2. Enter the 6-digit code from your app:               │
│ [______]                                                │
│                                                         │
│                    [Verify & Continue]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **API Endpoints:**
```typescript
// Basic authentication
POST   /api/auth/login              // Email/password login
POST   /api/auth/logout             // Logout user
POST   /api/auth/refresh            // Refresh access token
POST   /api/auth/forgot-password    // Request password reset
POST   /api/auth/reset-password     // Reset password with token

// Two-factor authentication
POST   /api/auth/2fa/setup          // Setup 2FA method
POST   /api/auth/2fa/verify         // Verify 2FA code
DELETE /api/auth/2fa/disable        // Disable 2FA
POST   /api/auth/2fa/backup-codes   // Generate new backup codes

// Modern authentication
POST   /api/auth/magic-link         // Send magic link
GET    /api/auth/magic-link/verify  // Verify magic link
POST   /api/auth/webauthn/register  // Start WebAuthn registration
POST   /api/auth/webauthn/verify    // Complete WebAuthn registration
POST   /api/auth/webauthn/login     // WebAuthn login

// Social authentication
GET    /api/auth/oauth/{provider}   // OAuth login (Google, GitHub, etc.)
GET    /api/auth/oauth/callback     // OAuth callback
```

### **Authentication Middleware:**
```typescript
// JWT authentication middleware
export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT token
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Get user from database
    const user = await getUserById(payload.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// 2FA verification middleware
export const requireTwoFactor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  
  if (!user.twoFactorEnabled) {
    return next(); // Skip 2FA if not enabled
  }

  const twoFactorVerified = req.session?.twoFactorVerified;
  if (!twoFactorVerified) {
    return res.status(403).json({ 
      error: 'Two-factor authentication required',
      requiresTwoFactor: true 
    });
  }

  next();
};
```

### **Password Hashing Service:**
```typescript
export class PasswordService {
  private static readonly SALT_ROUNDS = 12;
  
  static async hash(password: string): Promise<string> {
    // Validate password strength
    const validation = this.validatePassword(password);
    if (!validation.valid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }
    
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
  
  static async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  static validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];
    const policy = getPasswordPolicy();
    
    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters`);
    }
    
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    }
    
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letters');
    }
    
    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain numbers');
    }
    
    if (policy.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain symbols');
    }
    
    // Check against common passwords
    if (policy.commonPasswordCheck && this.isCommonPassword(password)) {
      errors.push('Password is too common');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      strength: this.calculateStrength(password)
    };
  }
  
  private static calculateStrength(password: string): PasswordStrength {
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 4, 25);
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
    
    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns
    
    if (score < 30) return 'weak';
    if (score < 60) return 'fair';
    if (score < 90) return 'good';
    return 'strong';
  }
}
```

---

## 🛡️ **Security Features**

### **Session Management:**
```typescript
interface UserSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
  };
  twoFactorVerified: boolean;
  trustedDevice: boolean;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}

// Session cleanup job
const cleanupExpiredSessions = async () => {
  const expiredSessions = await db.sessions.findMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });

  // Blacklist tokens
  for (const session of expiredSessions) {
    await blacklistToken(session.accessToken);
    await blacklistToken(session.refreshToken);
  }

  // Delete expired sessions
  await db.sessions.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
};
```

### **Rate Limiting:**
```typescript
// Login rate limiting
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP + email combination
    return `${req.ip}:${req.body.email}`;
  },
  onLimitReached: async (req, res, options) => {
    // Log suspicious activity
    await logSecurityEvent({
      type: 'rate_limit_exceeded',
      ip: req.ip,
      email: req.body.email,
      userAgent: req.get('User-Agent')
    });
  }
});
```

---

## 📱 **Frontend Integration**

### **Authentication Hook:**
```typescript
// Custom hook untuk authentication
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  useEffect(() => {
    // Check for stored tokens
    const storedTokens = getStoredTokens();
    if (storedTokens) {
      validateAndSetTokens(storedTokens);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await authApi.login(credentials);
      
      if (response.success && response.tokens) {
        setTokens(response.tokens);
        setUser(response.user!);
        storeTokens(response.tokens);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (tokens) {
        await authApi.logout(tokens.refreshToken);
      }
    } finally {
      setUser(null);
      setTokens(null);
      clearStoredTokens();
      window.location.href = '/login';
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    if (!tokens?.refreshToken) return false;

    try {
      const response = await authApi.refresh(tokens.refreshToken);
      setTokens(response.tokens);
      storeTokens(response.tokens);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  return {
    user,
    tokens,
    loading,
    login,
    logout,
    refreshTokens,
    isAuthenticated: !!user
  };
};
```

---

## 🔗 **Related Documentation**

- **[User Management](./management.md)** - User CRUD operations
- **[Roles & Permissions](./roles.md)** - Authorization system
- **[Security Monitoring](../06_security/monitoring.md)** - Security events
- **[System Settings](../07_system/settings.md)** - Auth configuration

---

**Last Updated:** 2024-01-09  
**Version:** 2.0  
**Status:** Active
